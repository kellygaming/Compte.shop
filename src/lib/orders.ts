import "server-only";
import { createServiceClient } from "./supabase/service";
import { checkMoneyFusionPaymentStatus } from "./moneyfusion";
import type { Json } from "./supabase/types";

const CONFIRM_WINDOW_HOURS = 48;
const SELLER_DELIVERY_WINDOW_HOURS = 24;

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Sépare l'appel à Date.now() (impur) des composants serveur qui en ont
 * besoin pour repérer les commandes bloquées — eslint (règle de pureté
 * React) refuse un appel direct dans le corps d'un composant.
 */
export function minutesAgoTimestamp(minutes: number): number {
  return Date.now() - minutes * 60 * 1000;
}

export function minutesAgoISOString(minutes: number): string {
  return new Date(minutesAgoTimestamp(minutes)).toISOString();
}

/**
 * Fait passer une commande pending_payment -> held, marque l'annonce
 * vendue, et déclenche la livraison automatique (instantanée) ou le
 * délai de garantie (manuelle). Extrait du webhook MoneyFusion pour être
 * partagé avec la réconciliation de secours (voir reconcilePendingOrder
 * ci-dessous) : les deux chemins doivent appliquer exactement la même
 * logique, sinon on recrée le bug qu'on corrige.
 *
 * Idempotent par construction : la garde status='pending_payment' fait
 * qu'un second appel sur la même commande est un no-op.
 */
export async function confirmOrderPaid(
  db: ServiceClient,
  orderId: string,
  transactionReference: string | null,
  rawPayload: Json | null = null,
): Promise<boolean> {
  const { data: heldOrders } = await db
    .from("orders")
    .update({ status: "held" })
    .eq("id", orderId)
    .eq("status", "pending_payment")
    .select("id, listing_id");

  if (!heldOrders || heldOrders.length === 0) {
    return false;
  }

  await db
    .from("payment_transactions")
    .update({
      status: "success",
      provider_reference: transactionReference,
      raw_payload: rawPayload,
    })
    .eq("order_id", orderId)
    .eq("status", "pending");

  const listingId = heldOrders[0].listing_id;
  if (!listingId) {
    return true;
  }

  const { data: listingRow } = await db
    .from("listings")
    .select("delivery_type, delivery_instructions")
    .eq("id", listingId)
    .maybeSingle();

  // Garde status='live' : un rejeu ne repasse jamais une annonce déjà
  // marquée vendue.
  await db.from("listings").update({ status: "sold" }).eq("id", listingId).eq("status", "live");

  const now = new Date();
  if (listingRow?.delivery_type === "manual") {
    const deadline = new Date(now.getTime() + SELLER_DELIVERY_WINDOW_HOURS * 60 * 60 * 1000);
    await db
      .from("orders")
      .update({ confirm_deadline: deadline.toISOString() })
      .eq("id", orderId)
      .eq("status", "held");
  } else {
    const { data: creds } = await db
      .from("listing_credentials")
      .select("credentials")
      .eq("listing_id", listingId)
      .maybeSingle();
    const deadline = new Date(now.getTime() + CONFIRM_WINDOW_HOURS * 60 * 60 * 1000);
    const note = [creds?.credentials, listingRow?.delivery_instructions]
      .filter((part) => part && part.trim())
      .join("\n\n");
    await db
      .from("orders")
      .update({
        delivered_at: now.toISOString(),
        confirm_deadline: deadline.toISOString(),
        delivery_note: note || null,
      })
      .eq("id", orderId)
      .eq("status", "held");
  }

  return true;
}

/**
 * Filet de sécurité contre un webhook MoneyFusion jamais reçu (pas de
 * signature, pas de garantie de livraison — déjà à l'origine d'un
 * incident réel côté kelly-gaming). Interroge directement l'API de
 * statut de paiement pour une commande restée en pending_payment ;
 * confirme via confirmOrderPaid() si MoneyFusion la dit payée.
 */
export async function reconcilePendingOrder(orderId: string): Promise<void> {
  const db = createServiceClient();

  const { data: order } = await db
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.status !== "pending_payment") return;

  const { data: tx } = await db
    .from("payment_transactions")
    .select("provider_token")
    .eq("order_id", orderId)
    .eq("status", "pending")
    .maybeSingle();
  if (!tx?.provider_token) return;

  try {
    const { paid, transactionId } = await checkMoneyFusionPaymentStatus(tx.provider_token);
    if (paid) {
      await confirmOrderPaid(db, orderId, transactionId);
    }
  } catch (err) {
    console.error("Échec de la réconciliation MoneyFusion pour la commande", orderId, err);
  }
}

/**
 * Balaie les commandes pending_payment dont le paiement a été initié il
 * y a plus de deux minutes (laisse le temps à l'acheteur de payer) et
 * réconcilie chacune. Appelé par la tâche planifiée pour couvrir le cas
 * où l'acheteur ferme l'onglet avant que /api/orders/[id] ne soit
 * rappelé.
 */
export async function reconcileStalePendingOrders(): Promise<void> {
  const db = createServiceClient();
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data: stale } = await db
    .from("orders")
    .select("id")
    .eq("status", "pending_payment")
    .lt("created_at", cutoff)
    .limit(50);

  for (const order of stale ?? []) {
    await reconcilePendingOrder(order.id);
  }
}

/**
 * Deux expirations automatiques sur les commandes bloquées en séquestre
 * ("held"), appelées en paresseux à chaque lecture d'une commande, plus
 * une tâche planifiée en filet de sécurité — voir
 * src/app/api/cron/release-expired-orders.
 *
 * 1. Livrée mais l'acheteur ne répond pas (48h) : versement automatique
 *    au vendeur (règle PROJET.md : "le vendeur est payé... automatiquement
 *    à l'expiration du délai de vérification").
 * 2. Remise manuelle jamais livrée par le vendeur dans le délai de
 *    garantie (fixé au paiement, voir le webhook MoneyFusion) :
 *    remboursement automatique de l'acheteur — c'est la garantie promise
 *    au vendeur qui choisit "je dois être présent" à la publication.
 *
 * Note : "released"/"refunded" ici veulent dire "dû", pas "déjà viré" —
 * MoneyFusion est un encaisseur, pas un émetteur de virement. Le
 * mouvement d'argent réel reste une étape manuelle côté opérateur tant
 * qu'aucune API de paiement sortant n'est branchée.
 */
export async function releaseExpiredOrders(): Promise<void> {
  const db = createServiceClient();
  const now = new Date().toISOString();

  await db
    .from("orders")
    .update({ status: "released" })
    .eq("status", "held")
    .not("delivered_at", "is", null)
    .lt("confirm_deadline", now);

  await db
    .from("orders")
    .update({ status: "refunded" })
    .eq("status", "held")
    .is("delivered_at", null)
    .lt("confirm_deadline", now);
}

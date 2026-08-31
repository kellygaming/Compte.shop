import "server-only";
import { createServiceClient } from "./supabase/service";

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

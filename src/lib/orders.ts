import "server-only";
import { createServiceClient } from "./supabase/service";

/**
 * Versement automatique au vendeur si l'acheteur n'a ni confirmé ni
 * signalé de problème dans les 48 h suivant la livraison (règle
 * PROJET.md : "le vendeur est payé... automatiquement à l'expiration du
 * délai de vérification"). Appelé en paresseux à chaque lecture d'une
 * commande, plus une tâche planifiée en filet de sécurité — voir
 * src/app/api/cron/release-expired-orders.
 *
 * Note : "released" ici veut dire "dû au vendeur", pas "déjà viré" —
 * MoneyFusion est un encaisseur, pas un émetteur de virement vers un
 * vendeur. Le versement réel reste une étape manuelle côté opérateur
 * tant qu'aucune API de paiement sortant n'est branchée.
 */
export async function releaseExpiredOrders(): Promise<void> {
  const db = createServiceClient();
  await db
    .from("orders")
    .update({ status: "released" })
    .eq("status", "held")
    .not("delivered_at", "is", null)
    .lt("confirm_deadline", new Date().toISOString());
}

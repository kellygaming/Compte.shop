import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatAmount } from "@/lib/format";
import { minutesAgoTimestamp } from "@/lib/orders";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Paiement en attente",
  held: "En séquestre",
  released: "Versement dû",
  refunded: "Remboursée",
  disputed: "Litige",
  cancelled: "Annulée",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente",
  success: "Payé",
  failed: "Échoué",
};

/**
 * Vue d'ensemble admin des commandes et paiements — demandée après un
 * paiement resté bloqué sans aucun moyen de le vérifier depuis le site.
 * Lecture seule (service role, admin uniquement) : montant, statut de la
 * commande, statut du paiement MoneyFusion, et un lien vers le détail
 * (identifiants transmis compris) pour le support.
 */
export default async function AdminOrdersPage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/");
  }

  const db = createServiceClient();
  const { data: orders } = await db
    .from("orders")
    .select(
      "id, status, amount_xof, created_at, listings(title), profiles!orders_buyer_id_fkey(pseudo), sellers!orders_seller_id_fkey(profiles(pseudo)), payment_transactions(status, provider_reference)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const fiveMinutesAgo = minutesAgoTimestamp(5);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1000px] px-6 py-16">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Commandes &amp; paiements
        </h1>
        <p className="mb-8 text-[13px] text-text-tertiary">
          100 dernières commandes. « Paiement en attente » depuis plus de
          5 min est surligné — ça peut vouloir dire que le webhook
          MoneyFusion n&apos;est jamais arrivé.
        </p>

        <div className="flex flex-col gap-2.5">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const stuck =
                order.status === "pending_payment" &&
                new Date(order.created_at).getTime() < fiveMinutesAgo;
              const paymentStatus = order.payment_transactions?.[0]?.status;

              return (
                <Link
                  key={order.id}
                  href={`/admin/commandes/${order.id}`}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 hover:border-border-hover ${
                    stuck ? "border-accent bg-accent/5" : "border-border-soft bg-surface"
                  }`}
                >
                  <div>
                    <div className="mb-1 font-display text-base font-semibold">
                      {order.listings?.title ?? "Annonce supprimée"}
                    </div>
                    <div className="text-[12.5px] text-text-tertiary">
                      {order.profiles?.pseudo ?? "Acheteur"} → {order.sellers?.profiles?.pseudo ?? "Vendeur"} ·{" "}
                      {new Date(order.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-semibold">
                      {formatAmount(order.amount_xof)}{" "}
                      <span className="text-xs font-normal text-text-secondary">F CFA</span>
                    </div>
                    <div className="text-[12.5px] text-text-tertiary">
                      {STATUS_LABELS[order.status] ?? order.status} ·{" "}
                      {paymentStatus ? PAYMENT_LABELS[paymentStatus] ?? paymentStatus : "—"}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-2xl border border-border-soft bg-surface px-8 py-16 text-center text-text-secondary">
              Aucune commande pour le moment.
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

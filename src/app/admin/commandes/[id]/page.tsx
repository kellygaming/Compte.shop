import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatAmount, shortOrderRef } from "@/lib/format";
import { OrderThread } from "@/components/order-thread";
import { ImageGallery } from "@/app/annonces/[id]/image-gallery";
import { ReconcileButton } from "./reconcile-button";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Paiement en attente",
  held: "En séquestre",
  released: "Versement dû",
  refunded: "Remboursée",
  disputed: "Litige",
  cancelled: "Annulée",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/");
  }

  const { id } = await params;
  const db = createServiceClient();

  const { data: order } = await db
    .from("orders")
    .select(
      "id, status, amount_xof, created_at, delivered_at, confirm_deadline, delivery_note, seller_confirmed_at, payout_requested_at, payout_phone, paid_out_at, listing_id, listings(title, delivery_type, images), profiles!orders_buyer_id_fkey(pseudo, phone), sellers!orders_seller_id_fkey(profiles(pseudo, phone))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: transactions } = await db
    .from("payment_transactions")
    .select("status, provider, provider_reference, provider_token, created_at, updated_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          {order.listings?.title ?? "Annonce supprimée"}
        </h1>
        <p className="mb-4 text-[13px] text-text-tertiary">
          #{shortOrderRef(order.id)} · {formatAmount(order.amount_xof)} F CFA ·{" "}
          {STATUS_LABELS[order.status] ?? order.status}
        </p>

        {order.listings?.images && order.listings.images.length > 0 ? (
          <details className="mb-6 rounded-2xl border border-border-soft bg-surface p-4">
            <summary className="cursor-pointer text-[13px] font-medium text-text-secondary">
              Voir les photos de l&apos;annonce
            </summary>
            <div className="mt-4">
              <ImageGallery images={order.listings.images} alt={order.listings.title} />
            </div>
          </details>
        ) : null}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-soft bg-surface p-5">
            <div className="mb-1 font-mono-ui text-[10.5px] uppercase tracking-[0.04em] text-text-tertiary">
              Acheteur
            </div>
            <div className="text-[14px]">{order.profiles?.pseudo ?? "—"}</div>
            <div className="text-[13px] text-text-tertiary">
              {order.profiles?.phone ?? "téléphone non renseigné"}
            </div>
          </div>
          <div className="rounded-2xl border border-border-soft bg-surface p-5">
            <div className="mb-1 font-mono-ui text-[10.5px] uppercase tracking-[0.04em] text-text-tertiary">
              Vendeur
            </div>
            <div className="text-[14px]">{order.sellers?.profiles?.pseudo ?? "—"}</div>
            <div className="text-[13px] text-text-tertiary">
              {order.sellers?.profiles?.phone ?? "téléphone non renseigné"}
            </div>
            {order.payout_requested_at ? (
              <div className="mt-2 text-[13px] text-text">
                Versement demandé sur :{" "}
                <span className="font-semibold">{order.payout_phone ?? "—"}</span>
              </div>
            ) : null}
          </div>
        </div>

        {order.status === "pending_payment" ? (
          <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-5">
            <ReconcileButton orderId={order.id} />
          </div>
        ) : null}

        <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-5">
          <div className="mb-3 font-mono-ui text-[10.5px] uppercase tracking-[0.04em] text-text-tertiary">
            Paiement MoneyFusion
          </div>
          {transactions && transactions.length > 0 ? (
            <div className="flex flex-col gap-2 text-[13px]">
              {transactions.map((tx, i) => (
                <div key={i} className="border-t border-border-soft pt-2 first:border-0 first:pt-0">
                  <div>
                    Statut : <span className="text-text">{tx.status}</span>
                  </div>
                  {tx.provider_reference ? (
                    <div className="text-text-tertiary">
                      Référence MoneyFusion : {tx.provider_reference}
                    </div>
                  ) : null}
                  <div className="text-text-tertiary">
                    {new Date(tx.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-tertiary">Aucune transaction enregistrée.</p>
          )}
        </div>

        {order.delivery_note ? (
          <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-5">
            <div className="mb-2 font-mono-ui text-[10.5px] uppercase tracking-[0.04em] text-text-tertiary">
              Ce que l&apos;acheteur a reçu ({order.listings?.delivery_type === "manual" ? "remise manuelle" : "remise instantanée"})
            </div>
            <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-text-secondary">
              {order.delivery_note}
            </p>
            {order.delivered_at ? (
              <p className="mt-2 text-[12.5px] text-text-tertiary">
                Livré le {new Date(order.delivered_at).toLocaleString("fr-FR")}
                {order.confirm_deadline
                  ? `, vérification jusqu'au ${new Date(order.confirm_deadline).toLocaleString("fr-FR")}`
                  : ""}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-5 text-[13px] text-text-tertiary">
            Rien n&apos;a encore été transmis à l&apos;acheteur.
            {order.confirm_deadline
              ? ` Délai en cours jusqu'au ${new Date(order.confirm_deadline).toLocaleString("fr-FR")}.`
              : ""}
          </div>
        )}

        {order.status !== "pending_payment" && order.status !== "cancelled" ? (
          <OrderThread orderId={order.id} currentUserId={admin.id} closed={false} />
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

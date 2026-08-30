import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DisputeThread } from "@/components/dispute-thread";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatAmount } from "@/lib/format";
import { ResolvePanel } from "./resolve-panel";

export default async function AdminDisputeDetailPage({
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

  const { data: dispute } = await db
    .from("disputes")
    .select("id, reason, status, resolution, escalated_at, order_id, orders(amount_xof, status, delivery_note)")
    .eq("id", id)
    .maybeSingle();

  if (!dispute) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Litige
        </h1>
        {dispute.orders ? (
          <p className="mb-6 text-sm text-text-tertiary">
            {formatAmount(dispute.orders.amount_xof)} F CFA · statut commande :{" "}
            {dispute.orders.status}
          </p>
        ) : null}

        <div className="mb-4 rounded-2xl border border-border-soft bg-surface p-5">
          <div className="mb-1.5 font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
            Motif signalé
          </div>
          <p className="text-sm">{dispute.reason}</p>
          {dispute.orders?.delivery_note ? (
            <>
              <div className="mb-1.5 mt-4 font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
                Accès transmis par le vendeur
              </div>
              <p className="whitespace-pre-line text-sm">{dispute.orders.delivery_note}</p>
            </>
          ) : null}
        </div>

        <div className="mb-4">
          <DisputeThread disputeId={dispute.id} currentUserId={admin.id} closed={false} />
        </div>

        {dispute.status === "resolved" ? (
          <div className="rounded-2xl border border-border-soft bg-surface p-5 text-sm text-text-secondary">
            Résolu : {dispute.resolution}
          </div>
        ) : (
          <ResolvePanel disputeId={dispute.id} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatAmount } from "@/lib/format";
import { MarkPaidButton } from "./mark-paid-button";

export default async function AdminPayoutsPage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/");
  }

  const db = createServiceClient();
  const { data: orders } = await db
    .from("orders")
    .select(
      "id, amount_xof, payout_requested_at, payout_phone, seller_id, sellers(profiles(pseudo, phone))",
    )
    .not("payout_requested_at", "is", null)
    .is("paid_out_at", null)
    .order("payout_requested_at", { ascending: true });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Versements en attente
        </h1>
        <p className="mb-8 text-[13px] text-text-tertiary">
          Virement manuel (mobile money) hors plateforme, puis marquer comme payé.
        </p>
        <div className="flex flex-col gap-3">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface p-5"
              >
                <div>
                  <div className="font-display text-lg font-semibold">
                    {formatAmount(order.amount_xof)}{" "}
                    <span className="text-sm font-normal text-text-secondary">F CFA</span>
                  </div>
                  <div className="text-[13px] text-text-tertiary">
                    {order.sellers?.profiles?.pseudo ?? "Vendeur"} ·{" "}
                    <span className="font-semibold text-text">
                      {order.payout_phone ?? order.sellers?.profiles?.phone ?? "téléphone non renseigné"}
                    </span>
                  </div>
                </div>
                <MarkPaidButton orderId={order.id} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border-soft bg-surface p-8 text-center text-text-secondary">
              Aucun versement en attente.
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

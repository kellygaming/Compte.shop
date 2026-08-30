import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatAmount } from "@/lib/format";

export default async function AdminDisputesPage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/");
  }

  const db = createServiceClient();
  const { data: disputes } = await db
    .from("disputes")
    .select("id, reason, status, escalated_at, created_at, order_id, orders(amount_xof)")
    .order("escalated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <h1 className="mb-8 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Litiges
        </h1>
        <div className="flex flex-col gap-3">
          {disputes && disputes.length > 0 ? (
            disputes.map((dispute) => (
              <Link
                key={dispute.id}
                href={`/admin/litiges/${dispute.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border-soft bg-surface p-5 hover:border-border-hover"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    {dispute.escalated_at ? (
                      <span className="rounded-full border border-accent-border px-2 py-0.5 font-mono-ui text-[10px] uppercase text-accent">
                        Appel admin
                      </span>
                    ) : null}
                    <span className="text-[13px] text-text-tertiary">
                      {dispute.status === "resolved" ? "Résolu" : "Ouvert"}
                    </span>
                  </div>
                  <div className="truncate text-sm">{dispute.reason}</div>
                </div>
                <div className="whitespace-nowrap text-sm font-semibold">
                  {dispute.orders ? `${formatAmount(dispute.orders.amount_xof)} F CFA` : null}
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-border-soft bg-surface p-8 text-center text-text-secondary">
              Aucun litige.
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

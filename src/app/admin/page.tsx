import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminHomePage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/");
  }

  const db = createServiceClient();
  const [{ count: openDisputes }, { count: pendingPayouts }] = await Promise.all([
    db.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
    db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("payout_requested_at", "is", null)
      .is("paid_out_at", null),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-8 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Administration
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/litiges"
            className="rounded-2xl border border-border-soft bg-surface p-6 hover:border-border-hover"
          >
            <div className="mb-1 font-display text-lg font-semibold">Litiges</div>
            <div className="text-sm text-text-secondary">
              {openDisputes ?? 0} en cours
            </div>
          </Link>
          <Link
            href="/admin/versements"
            className="rounded-2xl border border-border-soft bg-surface p-6 hover:border-border-hover"
          >
            <div className="mb-1 font-display text-lg font-semibold">Versements</div>
            <div className="text-sm text-text-secondary">
              {pendingPayouts ?? 0} en attente
            </div>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

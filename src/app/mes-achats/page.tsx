import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { releaseExpiredOrders } from "@/lib/orders";
import { formatAmount } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Paiement en attente",
  held: "En cours",
  released: "Terminée",
  refunded: "Remboursée",
  disputed: "Litige en cours",
  cancelled: "Annulée",
};

export default async function MesAchatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/mes-achats");
  }

  await releaseExpiredOrders();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, amount_xof, created_at, listings(title, images)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <h1 className="mb-8 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Mes achats
        </h1>

        {orders && orders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/commandes/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface p-5 hover:border-border-hover"
              >
                <div>
                  <div className="mb-1 font-display text-base font-semibold">
                    {order.listings?.title ?? "Annonce supprimée"}
                  </div>
                  <div className="text-[12.5px] text-text-tertiary">
                    {new Date(order.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-base font-semibold">
                    {formatAmount(order.amount_xof)}{" "}
                    <span className="text-xs font-normal text-text-secondary">F CFA</span>
                  </div>
                  <div className="text-[12.5px] text-text-tertiary">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border-soft bg-surface px-8 py-16 text-center text-text-secondary">
            Aucun achat pour le moment.
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { releaseExpiredOrders } from "@/lib/orders";
import { formatAmount } from "@/lib/format";
import { OrderPanel } from "./order-panel";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/connexion?next=/commandes/${id}`);
  }

  await releaseExpiredOrders();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, amount_xof, created_at, buyer_id, seller_id, delivered_at, confirm_deadline, delivery_note",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const role: "buyer" | "seller" =
    order.seller_id === user.id ? "seller" : "buyer";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[560px] px-6 py-24">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Commande
        </h1>
        <p className="mb-8 text-sm text-text-tertiary">
          {formatAmount(order.amount_xof)} F CFA
        </p>
        <OrderPanel order={order} role={role} />
      </main>
      <SiteFooter />
    </>
  );
}

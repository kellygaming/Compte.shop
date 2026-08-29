import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { formatAmount } from "@/lib/format";
import { OrderStatus } from "./order-status";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, amount_xof, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

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
        <OrderStatus orderId={order.id} initialStatus={order.status} />
      </main>
      <SiteFooter />
    </>
  );
}

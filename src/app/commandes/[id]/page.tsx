import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { releaseExpiredOrders } from "@/lib/orders";
import { formatAmount } from "@/lib/format";
import { OrderPanel } from "./order-panel";
import { ImageGallery } from "@/app/annonces/[id]/image-gallery";

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
      "id, status, amount_xof, created_at, buyer_id, seller_id, delivered_at, confirm_deadline, delivery_note, seller_confirmed_at, payout_requested_at, payout_phone, paid_out_at, listings(title, images)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const role: "buyer" | "seller" =
    order.seller_id === user.id ? "seller" : "buyer";

  let dispute: { id: string; status: string; escalated_at: string | null } | null = null;
  if (order.status === "disputed") {
    const { data } = await supabase
      .from("disputes")
      .select("id, status, escalated_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    dispute = data;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[560px] px-6 py-24">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Commande
        </h1>
        <p className="mb-4 text-sm text-text-tertiary">
          {order.listings?.title ?? "Annonce"} · {formatAmount(order.amount_xof)} F CFA
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
        <OrderPanel order={order} role={role} userId={user.id} dispute={dispute} />
      </main>
      <SiteFooter />
    </>
  );
}

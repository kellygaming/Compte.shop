import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Commandes (achats ou ventes) ayant reçu un message depuis la dernière
 * lecture de l'utilisateur — alimente la cloche de l'en-tête. Utilise le
 * rôle service car ça croise plusieurs commandes + order_reads en une
 * fois ; l'identité est vérifiée avant tout accès aux données.
 */
export async function GET() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ count: 0, orders: [] });
  }

  const db = createServiceClient();

  const { data: orders } = await db
    .from("orders")
    .select("id, listings(title)")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .neq("status", "pending_payment")
    .neq("status", "cancelled");

  if (!orders || orders.length === 0) {
    return NextResponse.json({ count: 0, orders: [] });
  }

  const orderIds = orders.map((o) => o.id);

  const [{ data: reads }, { data: messages }] = await Promise.all([
    db.from("order_reads").select("order_id, last_read_at").eq("user_id", user.id).in("order_id", orderIds),
    db
      .from("order_messages")
      .select("order_id, created_at")
      .in("order_id", orderIds)
      .neq("sender_id", user.id),
  ]);

  const readMap = new Map((reads ?? []).map((r) => [r.order_id, r.last_read_at]));

  const unreadOrderIds = new Set<string>();
  for (const message of messages ?? []) {
    const lastRead = readMap.get(message.order_id);
    if (!lastRead || new Date(message.created_at) > new Date(lastRead)) {
      unreadOrderIds.add(message.order_id);
    }
  }

  const unreadOrders = orders
    .filter((o) => unreadOrderIds.has(o.id))
    .map((o) => ({ id: o.id, title: o.listings?.title ?? "Annonce" }));

  return NextResponse.json({ count: unreadOrders.length, orders: unreadOrders });
}

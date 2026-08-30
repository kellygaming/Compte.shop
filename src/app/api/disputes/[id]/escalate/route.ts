import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * L'une ou l'autre partie appelle un admin : les deux camps n'arrivent
 * pas à s'entendre dans la messagerie du litige.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const db = createServiceClient();

  const { data: dispute } = await db
    .from("disputes")
    .select("id, order_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!dispute) {
    return NextResponse.json({ error: "Litige introuvable." }, { status: 404 });
  }

  const { data: order } = await db
    .from("orders")
    .select("buyer_id, seller_id")
    .eq("id", dispute.order_id)
    .maybeSingle();

  if (!order || (order.buyer_id !== user.id && order.seller_id !== user.id)) {
    return NextResponse.json({ error: "Litige introuvable." }, { status: 404 });
  }
  if (dispute.status !== "open") {
    return NextResponse.json({ error: "Ce litige est déjà clos." }, { status: 409 });
  }

  await db.from("disputes").update({ escalated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ ok: true });
}

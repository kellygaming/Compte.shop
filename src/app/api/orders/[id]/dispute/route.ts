import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Signalement d'un problème (compte inaccessible, description
 * mensongère, non-livraison...). Bloque la commande en litige — pas de
 * remboursement automatique : PROJET.md prévoit un arbitrage humain
 * sous 24 h, pas encore de back-office pour ça.
 */
export async function POST(
  request: Request,
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

  let payload: { reason?: string };
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const reason = payload.reason?.trim();
  if (!reason) {
    return NextResponse.json({ error: "Merci de préciser le problème." }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: order } = await db
    .from("orders")
    .select("id, buyer_id, seller_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!order || (order.buyer_id !== user.id && order.seller_id !== user.id)) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }
  if (order.status !== "held") {
    return NextResponse.json(
      { error: "Cette commande n'est pas dans un état contestable." },
      { status: 409 },
    );
  }

  const { error: updateError } = await db
    .from("orders")
    .update({ status: "disputed" })
    .eq("id", id)
    .eq("status", "held");

  if (updateError) {
    return NextResponse.json({ error: "Impossible d'ouvrir le litige." }, { status: 500 });
  }

  const { data: newDispute } = await db
    .from("disputes")
    .insert({ order_id: id, opened_by: user.id, reason })
    .select("id")
    .single();

  return NextResponse.json({ ok: true, disputeId: newDispute?.id ?? null });
}

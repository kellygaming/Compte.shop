import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Décision admin sur un litige : verser au vendeur ou rembourser
 * l'acheteur. Un remboursement ici n'est qu'une écriture interne — voir
 * la note de src/lib/orders.ts, aucune API MoneyFusion de remboursement
 * n'est branchée.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  const { id } = await params;

  let payload: { decision?: "release" | "refund"; note?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (payload.decision !== "release" && payload.decision !== "refund") {
    return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: dispute } = await db
    .from("disputes")
    .select("id, order_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!dispute || dispute.status === "resolved") {
    return NextResponse.json({ error: "Litige introuvable ou déjà résolu." }, { status: 409 });
  }

  const newOrderStatus = payload.decision === "release" ? "released" : "refunded";

  const { error: orderError } = await db
    .from("orders")
    .update({ status: newOrderStatus })
    .eq("id", dispute.order_id)
    .eq("status", "disputed");

  if (orderError) {
    return NextResponse.json({ error: "Impossible de mettre à jour la commande." }, { status: 500 });
  }

  await db
    .from("disputes")
    .update({
      status: "resolved",
      resolution: payload.note ?? `Décision admin : ${payload.decision === "release" ? "versement au vendeur" : "remboursement de l'acheteur"}.`,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}

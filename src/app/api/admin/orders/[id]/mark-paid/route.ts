import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * L'admin confirme avoir viré l'argent au vendeur manuellement (mobile
 * money, hors plateforme). Purement déclaratif côté Compte.shop.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  const { id } = await params;
  const db = createServiceClient();

  const { data: updated } = await db
    .from("orders")
    .update({ paid_out_at: new Date().toISOString() })
    .eq("id", id)
    .not("payout_requested_at", "is", null)
    .is("paid_out_at", null)
    .select("id")
    .maybeSingle();

  if (!updated) {
    return NextResponse.json(
      { error: "Commande introuvable ou déjà marquée payée." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

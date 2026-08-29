import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Statut d'une commande, pour la page de retour de paiement (polling
 * léger le temps que le webhook MoneyFusion arrive). RLS restreint déjà
 * la lecture à l'acheteur ou au vendeur concernés.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, amount_xof, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  return NextResponse.json({ order });
}

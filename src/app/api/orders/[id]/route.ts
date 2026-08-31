import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { releaseExpiredOrders, reconcilePendingOrder } from "@/lib/orders";

/**
 * Statut d'une commande, pour la page de retour de paiement (polling
 * léger le temps que le webhook MoneyFusion arrive) et le rafraîchissement
 * après une action. RLS restreint déjà la lecture à l'acheteur ou au
 * vendeur concernés.
 *
 * reconcilePendingOrder() interroge directement MoneyFusion si la
 * commande est encore pending_payment : le webhook n'est pas fiable à
 * 100%, ce polling (déjà en place côté page) sert aussi de filet de
 * sécurité au lieu d'attendre passivement un webhook qui peut ne jamais
 * arriver.
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

  await reconcilePendingOrder(id);
  await releaseExpiredOrders();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, amount_xof, created_at, buyer_id, seller_id, delivered_at, confirm_deadline, delivery_note, seller_confirmed_at, payout_requested_at, payout_phone, paid_out_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  return NextResponse.json({ order });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Le vendeur demande le versement. Ne déclenche aucun virement — passe
 * juste la commande dans la file que l'admin traite manuellement (voir
 * /admin/versements). Compte.shop n'a pas d'API de paiement sortant.
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

  let payload: { phone?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const phone = payload.phone?.trim();
  if (!phone) {
    return NextResponse.json(
      { error: "Numéro Mobile Money requis (avec l'indicatif du pays)." },
      { status: 400 },
    );
  }

  const db = createServiceClient();
  const { data: updated } = await db
    .from("orders")
    .update({ payout_requested_at: new Date().toISOString(), payout_phone: phone })
    .eq("id", id)
    .eq("seller_id", user.id)
    .eq("status", "released")
    .not("seller_confirmed_at", "is", null)
    .is("payout_requested_at", null)
    .select("id")
    .maybeSingle();

  if (!updated) {
    return NextResponse.json(
      { error: "Demande impossible dans l'état actuel de la commande." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

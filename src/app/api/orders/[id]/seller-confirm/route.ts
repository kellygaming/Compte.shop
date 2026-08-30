import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Le vendeur confirme à son tour que la vente est actée (miroir de la
 * confirmation acheteur), avant de pouvoir demander le versement.
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
  const { data: updated } = await db
    .from("orders")
    .update({ seller_confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", user.id)
    .eq("status", "released")
    .select("id")
    .maybeSingle();

  if (!updated) {
    return NextResponse.json(
      { error: "Commande introuvable ou pas encore libérée." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

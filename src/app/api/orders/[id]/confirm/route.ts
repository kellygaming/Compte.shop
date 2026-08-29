import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * L'acheteur confirme avoir reçu et vérifié le compte. Marque la
 * commande comme due au vendeur (voir la note dans src/lib/orders.ts
 * sur ce que "released" signifie concrètement).
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
    .update({ status: "released" })
    .eq("id", id)
    .eq("buyer_id", user.id)
    .eq("status", "held")
    .not("delivered_at", "is", null)
    .select("id")
    .maybeSingle();

  if (!updated) {
    return NextResponse.json(
      { error: "Commande introuvable ou pas encore livrée." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

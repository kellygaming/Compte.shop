import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const CONFIRM_WINDOW_HOURS = 48;

/**
 * Le vendeur indique avoir transmis les accès. Lance le délai de
 * vérification de 48 h de l'acheteur.
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

  let payload: { note?: string };
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const db = createServiceClient();
  const deadline = new Date(Date.now() + CONFIRM_WINDOW_HOURS * 60 * 60 * 1000);

  const { data: updated } = await db
    .from("orders")
    .update({
      delivered_at: new Date().toISOString(),
      confirm_deadline: deadline.toISOString(),
      delivery_note: payload.note ?? null,
    })
    .eq("id", id)
    .eq("seller_id", user.id)
    .eq("status", "held")
    .select("id")
    .maybeSingle();

  if (!updated) {
    return NextResponse.json(
      { error: "Commande introuvable ou pas dans le bon état." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

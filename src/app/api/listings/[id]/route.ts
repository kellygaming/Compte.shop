import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Modification d'une annonce par son vendeur. Volontairement restreint au
 * prix et à la description : les photos et le titre ne sont pas
 * modifiables une fois l'annonce publiée, pour ne pas permettre à un
 * vendeur de changer la preuve du compte après-coup (ni de continuer à
 * modifier une annonce déjà vendue).
 */
export async function PATCH(
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

  let payload: {
    price_xof?: number;
    description?: string;
    delivery_type?: string;
    delivery_instructions?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const update: {
    price_xof?: number;
    description?: string;
    delivery_type?: string;
    delivery_instructions?: string;
  } = {};
  if (payload.price_xof !== undefined) {
    if (!Number.isFinite(payload.price_xof) || payload.price_xof <= 0) {
      return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    }
    update.price_xof = payload.price_xof;
  }
  if (payload.description !== undefined) {
    update.description = payload.description;
  }
  if (payload.delivery_type !== undefined) {
    update.delivery_type = payload.delivery_type === "manual" ? "manual" : "instant";
  }
  if (payload.delivery_instructions !== undefined) {
    update.delivery_instructions = payload.delivery_instructions;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien à modifier." }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: listing } = await db
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  }
  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: "Vous n'êtes pas le vendeur de cette annonce." }, { status: 403 });
  }
  if (listing.status !== "live") {
    return NextResponse.json(
      { error: "Cette annonce n'est plus modifiable (vendue ou retirée)." },
      { status: 409 },
    );
  }

  const { error } = await db.from("listings").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Échec de la mise à jour." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

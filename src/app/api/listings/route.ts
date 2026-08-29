import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Création d'annonce. Utilise le client de session (pas le service
 * role) : la policy RLS "Verified sellers can create listings" fait déjà
 * toute la vérification (vendeur = auteur, KYC vérifié) — pas besoin de
 * la dupliquer ici.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  let payload: {
    game_slug?: string;
    title?: string;
    description?: string;
    price_xof?: number;
    images?: string[];
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { game_slug, title, price_xof } = payload;
  if (!game_slug || !title || !price_xof || price_xof <= 0) {
    return NextResponse.json({ error: "Champs manquants ou invalides." }, { status: 400 });
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      game_slug,
      seller_id: user.id,
      title,
      description: payload.description ?? "",
      price_xof,
      images: payload.images ?? [],
      status: "live",
    })
    .select("id")
    .single();

  if (error || !listing) {
    return NextResponse.json(
      {
        error:
          "Publication refusée. Votre identité doit être vérifiée avant de publier une annonce.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json({ id: listing.id });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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
    delivery_type?: string;
    delivery_instructions?: string;
    credentials?: string;
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
  const deliveryType = payload.delivery_type === "manual" ? "manual" : "instant";
  if (deliveryType === "instant" && !payload.credentials?.trim()) {
    return NextResponse.json(
      { error: "Indiquez l'email et le mot de passe à transmettre à l'acheteur." },
      { status: 400 },
    );
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
      delivery_type: deliveryType,
      delivery_instructions: payload.delivery_instructions ?? "",
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

  if (deliveryType === "instant" && payload.credentials?.trim()) {
    // Table séparée, sans policy RLS cliente (voir migration) : seul le
    // rôle service peut écrire les identifiants, jamais exposés via la
    // policy publique de lecture des annonces.
    const db = createServiceClient();
    await db
      .from("listing_credentials")
      .insert({ listing_id: listing.id, credentials: payload.credentials.trim() });
  }

  return NextResponse.json({ id: listing.id });
}

import { createClient } from "./supabase/server";
import type { FilterGroup, Game, Listing } from "./types";

/**
 * Couche d'accès aux données réelles (Supabase). Les composants ne
 * lisent jamais Supabase directement — ils passent par ces fonctions,
 * qui gardent la même forme quel que soit ce qu'il y a derrière.
 */

type ListingRow = {
  id: string;
  game_slug: string;
  title: string;
  description: string;
  price_xof: number;
  images: string[];
  status: string;
  created_at: string;
  seller_id: string;
  sellers: {
    sales_count: number;
    rating: number | null;
    profiles: { pseudo: string } | null;
  } | null;
};

function mapListing(row: ListingRow): Listing {
  return {
    id: row.id,
    gameSlug: row.game_slug,
    title: row.title,
    description: row.description,
    priceXOF: row.price_xof,
    images: row.images,
    status: row.status as Listing["status"],
    sellerId: row.seller_id,
    sellerPseudo: row.sellers?.profiles?.pseudo ?? "Vendeur",
    sellerSalesCount: row.sellers?.sales_count ?? 0,
    sellerRating: row.sellers?.rating ?? null,
    verified: true,
    createdAt: row.created_at,
  };
}

const LISTING_SELECT =
  "id, game_slug, title, description, price_xof, images, status, created_at, seller_id, sellers(sales_count, rating, profiles(pseudo))";

export async function getGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("game_stats").select("*").order("sort_order");

  return (data ?? []).map((row) => ({
    slug: row.slug!,
    name: row.name!,
    image: row.image!,
    listingCount: row.listing_count ?? 0,
    minPriceXOF: row.min_price_xof,
  }));
}

export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_stats")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return undefined;
  return {
    slug: data.slug!,
    name: data.name!,
    image: data.image!,
    listingCount: data.listing_count ?? 0,
    minPriceXOF: data.min_price_xof,
  };
}

export async function getListingsByGame(slug: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("game_slug", slug)
    .eq("status", "live")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => mapListing(row as unknown as ListingRow));
}

export async function getHeroListings(): Promise<
  { game: Game; listing: Listing }[]
> {
  const games = await getGames();
  const supabase = await createClient();

  const items: { game: Game; listing: Listing }[] = [];
  for (const game of games) {
    const { data } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("game_slug", game.slug)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      items.push({ game, listing: mapListing(data as unknown as ListingRow) });
    }
  }
  return items;
}

export function getFilterGroups(): FilterGroup[] {
  return [
    { id: "price", label: "Prix F CFA", options: ["Moins de 25 000", "25 000 – 75 000", "75 000 – 150 000", "Plus de 150 000"] },
    { id: "platform", label: "Plateforme", options: ["Mobile", "PC", "Console", "Cross-platform"] },
    { id: "seller", label: "Vendeur", options: ["ID vérifié", "50+ ventes", "Note 4,5 et plus"] },
  ];
}

import type { FilterGroup, Game, Listing } from "./types";

/**
 * Données factices. Ce module tient lieu de couche d'accès aux données —
 * à remplacer par des appels API (routes /api ou fetch serveur vers le
 * backend) sans changer la forme consommée par les pages. Ne rien coder
 * en dur dans les composants : ils lisent toujours ces fonctions.
 */

const GAMES: Game[] = [
  {
    slug: "fortnite",
    name: "Fortnite",
    image: "/games/fortnite.jpg",
    listingCount: 42,
    minPriceXOF: 15000,
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    image: "/games/free-fire.webp",
    listingCount: 63,
    minPriceXOF: 8000,
  },
  {
    slug: "brawl-stars",
    name: "Brawl Stars",
    image: "/games/brawl-stars.webp",
    listingCount: 28,
    minPriceXOF: 12000,
  },
  {
    slug: "roblox",
    name: "Roblox",
    image: "/games/roblox.jpg",
    listingCount: 51,
    minPriceXOF: 6000,
  },
];

const LISTING_TEMPLATES: Record<
  string,
  { title: string; priceXOF: number; sellerPseudo: string; sellerSalesCount: number; sellerRating: number }[]
> = {
  fortnite: [
    { title: "Compte niveau 210, 340 skins dont Galaxia", priceXOF: 185000, sellerPseudo: "kepler_id", sellerSalesCount: 34, sellerRating: 4.9 },
    { title: "Battle Pass Ch5 complet, 90 danses", priceXOF: 62000, sellerPseudo: "abij_ff", sellerSalesCount: 12, sellerRating: 4.7 },
    { title: "Compte OG, skins saison 2-3 exclusifs", priceXOF: 240000, sellerPseudo: "dakar_trade", sellerSalesCount: 51, sellerRating: 4.8 },
    { title: "Niveau 95, 60 skins, email lié changeable", priceXOF: 45000, sellerPseudo: "vendeur_ndiaye", sellerSalesCount: 8, sellerRating: 4.6 },
    { title: "Compte complet, tous les passes 2023-2025", priceXOF: 310000, sellerPseudo: "kepler_id", sellerSalesCount: 34, sellerRating: 4.9 },
    { title: "Skins rares + 12 000 V-Bucks restants", priceXOF: 98000, sellerPseudo: "coco_market", sellerSalesCount: 19, sellerRating: 4.5 },
    { title: "Compte débutant boosté, 25 skins", priceXOF: 22000, sellerPseudo: "abij_ff", sellerSalesCount: 12, sellerRating: 4.7 },
    { title: "Collection crossover Marvel complète", priceXOF: 155000, sellerPseudo: "dakar_trade", sellerSalesCount: 51, sellerRating: 4.8 },
    { title: "Compte solo/duo, stats compétitives", priceXOF: 76000, sellerPseudo: "vendeur_ndiaye", sellerSalesCount: 8, sellerRating: 4.6 },
  ],
  "free-fire": [
    { title: "Grandmaster, 80 bundles, animal Falco", priceXOF: 52000, sellerPseudo: "abidjan_gg", sellerSalesCount: 27, sellerRating: 4.8 },
    { title: "Compte niveau 65, tous les personnages", priceXOF: 34000, sellerPseudo: "yaro_store", sellerSalesCount: 15, sellerRating: 4.6 },
    { title: "Skins d'armes évolutifs complets", priceXOF: 28000, sellerPseudo: "cotonou_ff", sellerSalesCount: 9, sellerRating: 4.4 },
    { title: "Compte Heroic, 120 emotes débloquées", priceXOF: 41000, sellerPseudo: "abidjan_gg", sellerSalesCount: 27, sellerRating: 4.8 },
    { title: "Compte régional VN, skins exclusifs", priceXOF: 67000, sellerPseudo: "lome_traders", sellerSalesCount: 22, sellerRating: 4.7 },
    { title: "Débutant boosté, pass elite x6", priceXOF: 12000, sellerPseudo: "yaro_store", sellerSalesCount: 15, sellerRating: 4.6 },
    { title: "Collection Booyah Day complète", priceXOF: 58000, sellerPseudo: "cotonou_ff", sellerSalesCount: 9, sellerRating: 4.4 },
    { title: "Compte clan-master, guilde niveau 6", priceXOF: 39000, sellerPseudo: "lome_traders", sellerSalesCount: 22, sellerRating: 4.7 },
    { title: "Skins véhicules + surf complets", priceXOF: 31000, sellerPseudo: "abidjan_gg", sellerSalesCount: 27, sellerRating: 4.8 },
  ],
  "brawl-stars": [
    { title: "Tous les brawlers débloqués, 40 skins", priceXOF: 71000, sellerPseudo: "brawl_ivoire", sellerSalesCount: 18, sellerRating: 4.7 },
    { title: "Compte Pro League, trophées 32 000", priceXOF: 95000, sellerPseudo: "niamey_arena", sellerSalesCount: 11, sellerRating: 4.5 },
    { title: "Collection Hypercharge complète", priceXOF: 54000, sellerPseudo: "brawl_ivoire", sellerSalesCount: 18, sellerRating: 4.7 },
    { title: "Compte débutant, 15 brawlers légendaires", priceXOF: 18000, sellerPseudo: "cocody_sales", sellerSalesCount: 6, sellerRating: 4.3 },
    { title: "Skins saisonniers 2023-2025 complets", priceXOF: 63000, sellerPseudo: "niamey_arena", sellerSalesCount: 11, sellerRating: 4.5 },
    { title: "Compte compétitif, rang masters", priceXOF: 82000, sellerPseudo: "cocody_sales", sellerSalesCount: 6, sellerRating: 4.3 },
  ],
  roblox: [
    { title: "Compte OG 2014, badges rares", priceXOF: 89000, sellerPseudo: "robux_dakar", sellerSalesCount: 41, sellerRating: 4.9 },
    { title: "12 000 Robux + avatar limité", priceXOF: 47000, sellerPseudo: "lagos_lux", sellerSalesCount: 23, sellerRating: 4.6 },
    { title: "Compte builder, accès Studio premium", priceXOF: 26000, sellerPseudo: "robux_dakar", sellerSalesCount: 41, sellerRating: 4.9 },
    { title: "Inventaire limiteds, valeur élevée", priceXOF: 132000, sellerPseudo: "accra_trade", sellerSalesCount: 17, sellerRating: 4.7 },
    { title: "Compte débutant, 3 jeux premium suivis", priceXOF: 9000, sellerPseudo: "lagos_lux", sellerSalesCount: 23, sellerRating: 4.6 },
    { title: "Compte ancien, 200+ amis, badges événement", priceXOF: 58000, sellerPseudo: "accra_trade", sellerSalesCount: 17, sellerRating: 4.7 },
    { title: "Avatar complet limiteds rares 2019", priceXOF: 176000, sellerPseudo: "robux_dakar", sellerSalesCount: 41, sellerRating: 4.9 },
  ],
};

function buildListings(): Listing[] {
  const listings: Listing[] = [];
  for (const game of GAMES) {
    const templates = LISTING_TEMPLATES[game.slug] ?? [];
    templates.forEach((template, index) => {
      listings.push({
        id: `${game.slug}-${index + 1}`,
        gameSlug: game.slug,
        title: template.title,
        description: "",
        priceXOF: template.priceXOF,
        images: [game.image],
        status: "live",
        sellerId: template.sellerPseudo,
        sellerPseudo: template.sellerPseudo,
        sellerSalesCount: template.sellerSalesCount,
        sellerRating: template.sellerRating,
        verified: true,
        createdAt: new Date().toISOString(),
      });
    });
  }
  return listings;
}

const LISTINGS: Listing[] = buildListings();

export async function getGames(): Promise<Game[]> {
  return GAMES;
}

export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  return GAMES.find((game) => game.slug === slug);
}

export async function getListingsByGame(slug: string): Promise<Listing[]> {
  return LISTINGS.filter((listing) => listing.gameSlug === slug);
}

export async function getHeroListings(): Promise<
  { game: Game; listing: Listing }[]
> {
  return GAMES.map((game) => {
    const listing = LISTINGS.find((item) => item.gameSlug === game.slug);
    if (!listing) {
      throw new Error(`Aucune annonce placeholder pour ${game.slug}`);
    }
    return { game, listing };
  });
}

export function getFilterGroups(): FilterGroup[] {
  return [
    { id: "price", label: "Prix F CFA", options: ["Moins de 25 000", "25 000 – 75 000", "75 000 – 150 000", "Plus de 150 000"] },
    { id: "platform", label: "Plateforme", options: ["Mobile", "PC", "Console", "Cross-platform"] },
    { id: "seller", label: "Vendeur", options: ["ID vérifié", "50+ ventes", "Note 4,5 et plus"] },
  ];
}

export const supportContact = "WhatsApp +225 0173507682";

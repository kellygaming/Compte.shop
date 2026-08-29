export type Game = {
  slug: string;
  name: string;
  image: string;
  listingCount: number;
  minPriceXOF: number | null;
};

export type ListingStatus = "draft" | "pending" | "live" | "sold";

export type Listing = {
  id: string;
  gameSlug: string;
  title: string;
  description: string;
  priceXOF: number;
  images: string[];
  status: ListingStatus;
  sellerId: string;
  sellerPseudo: string;
  sellerSalesCount: number;
  sellerRating: number | null;
  verified: boolean;
  createdAt: string;
};

export type FilterGroup = {
  id: string;
  label: string;
  options: string[];
};

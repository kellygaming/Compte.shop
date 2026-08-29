import Image from "next/image";
import Link from "next/link";
import { formatAmount, formatRating } from "@/lib/format";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="block overflow-hidden rounded-[14px] border border-border-soft bg-surface hover:border-border-hover"
    >
      <div className="relative h-[150px] bg-media-empty">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 260px, 45vw"
          className="object-cover"
        />
        {listing.verified ? (
          <span className="absolute left-[10px] top-[10px] rounded-full border border-accent-border bg-bg/75 px-2 py-1 font-mono-ui text-[10.5px] uppercase tracking-[0.04em] text-accent">
            Vérifié
          </span>
        ) : null}
      </div>
      <div className="px-[18px] pb-[18px] pt-4">
        <div className="mb-2 line-clamp-2 font-display text-base font-semibold leading-tight">
          {listing.title}
        </div>
        <div className="mb-3.5 truncate text-xs text-text-tertiary">
          {listing.sellerPseudo} · {listing.sellerSalesCount} ventes
          {listing.sellerRating !== null
            ? ` · ${formatRating(listing.sellerRating)} ★`
            : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="whitespace-nowrap font-display text-lg font-semibold">
            {formatAmount(listing.priceXOF)}{" "}
            <span className="text-xs font-normal text-text-secondary">
              F CFA
            </span>
          </span>
          <span className="whitespace-nowrap text-xs text-accent">
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border-soft bg-surface">
      <div className="h-[150px] animate-pulse bg-media-empty" />
      <div className="px-[18px] pb-[18px] pt-4">
        <div className="mb-2 h-4 w-4/5 animate-pulse rounded bg-media-empty" />
        <div className="mb-3.5 h-3 w-3/5 animate-pulse rounded bg-media-empty" />
        <div className="flex justify-between">
          <div className="h-4 w-1/3 animate-pulse rounded bg-media-empty" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-media-empty" />
        </div>
      </div>
    </div>
  );
}

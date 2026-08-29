import { SiteHeader } from "@/components/site-header";
import { ListingCardSkeleton } from "@/components/listing-card";

export default function ListingLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-12 pb-24 pt-12">
        <div className="mb-[26px] h-4 w-40 animate-pulse rounded bg-media-empty" />
        <div className="mb-8 h-9 w-64 animate-pulse rounded bg-media-empty" />
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_1fr]">
          <div className="h-64 animate-pulse rounded-[14px] border border-border-soft bg-surface" />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[18px]">
            {Array.from({ length: 9 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

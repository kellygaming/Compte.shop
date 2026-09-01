import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GameTabs } from "@/components/game-tabs";
import { FilterSidebar } from "@/components/filter-sidebar";
import { ListingCard } from "@/components/listing-card";
import {
  getFilterGroups,
  getGameBySlug,
  getGames,
  getListingsByGame,
} from "@/lib/data";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [games, game, listings] = await Promise.all([
    getGames(),
    getGameBySlug(slug),
    getListingsByGame(slug),
  ]);

  if (!game) {
    notFound();
  }

  const filterGroups = getFilterGroups();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-12 sm:px-8 lg:px-12">
        <div className="mb-[26px] flex items-center gap-2.5 text-[13px] text-text-tertiary">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <span className="text-text">{game.name}</span>
        </div>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2.5 font-display text-[30px] font-semibold tracking-[-0.02em] sm:text-[38px]">
              Comptes {game.name}
            </h1>
            <div className="text-[14.5px] text-text-secondary">
              {listings.length} annonces vérifiées · paiement en séquestre
              sur chaque achat
            </div>
          </div>
          <GameTabs games={games} activeSlug={game.slug} />
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_1fr]">
          <FilterSidebar groups={filterGroups} />

          {listings.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[18px]">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-border-soft bg-surface px-8 py-16 text-center text-text-secondary">
              Aucune annonce pour {game.name} pour le moment.
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

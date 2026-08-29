import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroCarousel } from "@/components/hero-carousel";
import { TrustStrip } from "@/components/trust-strip";
import { CategoryGrid } from "@/components/category-grid";
import { ProtectionSection } from "@/components/protection-section";
import { SupportSection } from "@/components/support-section";
import { SellSection } from "@/components/sell-section";
import { getGames, getHeroListings } from "@/lib/data";

export default async function HomePage() {
  const [games, heroItems] = await Promise.all([
    getGames(),
    getHeroListings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-14 px-12 pb-[84px] pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[72px] lg:pt-[110px]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border-strong px-[13px] py-1.5 font-mono-ui text-[11.5px] uppercase tracking-[0.06em] text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Marché ouvert &amp; vérifié
            </div>
            <h1 className="mb-[22px] font-display text-[42px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[52px] lg:text-[60px]">
              Reprenez votre compte là où vous l&apos;avez laissé.
            </h1>
            <p className="mb-9 max-w-[520px] text-[17.5px] leading-relaxed text-text-secondary">
              Achetez et vendez des comptes de jeu entre joueurs. Chaque
              vendeur est vérifié par pièce d&apos;identité, et votre
              paiement reste bloqué jusqu&apos;à ce que le compte soit bien
              entre vos mains.
            </p>
            <form
              action={`/jeux/${games[0]?.slug ?? ""}`}
              className="mb-[22px] flex max-w-[520px] items-center gap-2.5 rounded-[13px] border border-border-strong bg-surface p-2"
            >
              <span className="pl-3 font-mono-ui text-xs text-text-tertiary">
                ↳
              </span>
              <input
                type="text"
                name="q"
                placeholder="Fortnite, Free Fire, Brawl Stars, Roblox…"
                className="flex-1 border-none bg-transparent py-2 text-[15px] outline-none placeholder:text-text-tertiary"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-[9px] bg-accent px-[22px] py-3 text-sm font-semibold text-bg hover:bg-accent-hover"
              >
                Explorer
              </button>
            </form>
            <div className="flex flex-wrap gap-7 text-[13.5px] text-text-tertiary">
              <span>1 480 comptes vendus</span>
              <span>Note moyenne 4,8 / 5</span>
              <span>Support 24 h / 24</span>
            </div>
          </div>
          {heroItems.length > 0 ? (
            <HeroCarousel items={heroItems} />
          ) : (
            <div className="flex h-[340px] items-center justify-center rounded-[18px] border border-border-soft bg-surface p-8 text-center text-sm text-text-tertiary">
              Aucune annonce vérifiée pour le moment.
            </div>
          )}
        </section>

        <TrustStrip />
        <CategoryGrid games={games} />
        <ProtectionSection />
        <SupportSection />
        <SellSection />
      </main>
      <SiteFooter />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { formatAmount } from "@/lib/format";
import type { Game } from "@/lib/types";

export function CategoryGrid({ games }: { games: Game[] }) {
  return (
    <section className="mx-auto max-w-[1240px] px-12 pb-5 pt-24">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 font-mono-ui text-[11.5px] uppercase tracking-[0.08em] text-text-tertiary">
            01 — Catégories
          </div>
          <h2 className="font-display text-[36px] font-semibold tracking-[-0.02em]">
            Choisissez votre jeu
          </h2>
        </div>
        <Link href={`/jeux/${games[0]?.slug ?? ""}`} className="text-sm">
          Tout voir →
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/jeux/${game.slug}`}
            className="group overflow-hidden rounded-2xl border border-border-soft bg-surface hover:border-border-hover"
          >
            <div className="relative h-[170px] bg-media-empty">
              <Image
                src={game.image}
                alt={game.name}
                fill
                sizes="(min-width: 1024px) 280px, 45vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[7px] px-5 pb-5 pt-[18px]">
              <div className="truncate font-display text-[18.5px] font-semibold">
                {game.name}
              </div>
              <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[13px] text-text-secondary">
                {game.minPriceXOF !== null ? (
                  <>
                    <span className="whitespace-nowrap">
                      À partir de {formatAmount(game.minPriceXOF)} F CFA
                    </span>
                    <span className="whitespace-nowrap text-text-tertiary">
                      · {game.listingCount} annonces
                    </span>
                  </>
                ) : (
                  <span className="whitespace-nowrap text-text-tertiary">
                    Aucune annonce pour le moment
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

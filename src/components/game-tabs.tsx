import Link from "next/link";
import type { Game } from "@/lib/types";

export function GameTabs({
  games,
  activeSlug,
}: {
  games: Game[];
  activeSlug: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {games.map((game) => {
        const isActive = game.slug === activeSlug;
        return (
          <Link
            key={game.slug}
            href={`/jeux/${game.slug}`}
            className="whitespace-nowrap rounded-full border px-4 py-[9px] text-[13.5px]"
            style={{
              borderColor: isActive
                ? "var(--color-border-hover)"
                : "var(--color-border-strong)",
              color: isActive ? "var(--color-text)" : "var(--color-text-secondary)",
            }}
          >
            {game.name}
          </Link>
        );
      })}
    </div>
  );
}

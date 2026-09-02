import Link from "next/link";

const linkColumns = [
  {
    label: "Marché",
    links: [
      { label: "Fortnite", href: "/jeux/fortnite" },
      { label: "Free Fire", href: "/jeux/free-fire" },
      { label: "Brawl Stars", href: "/jeux/brawl-stars" },
      { label: "Roblox", href: "/jeux/roblox" },
    ],
  },
  {
    label: "Vendre",
    links: [
      { label: "Devenir vendeur", href: "/vendre" },
      { label: "Vérification d'identité", href: "/vendre" },
    ],
  },
  {
    label: "Aide",
    links: [
      { label: "Protection", href: "/#protection" },
      { label: "Support", href: "/#support" },
      { label: "Conditions d'utilisation", href: "/conditions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 pb-10 pt-16 sm:grid-cols-2 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-accent font-display text-[15px] font-bold text-bg">
              C
            </span>
            <span className="font-display text-[18px] font-semibold tracking-[-0.01em]">
              Compte.shop
            </span>
          </div>
          <p className="mt-4 max-w-[280px] text-[13.5px] leading-relaxed text-text-secondary">
            Le marché ouvert et vérifié pour acheter et vendre des comptes de
            jeu entre joueurs, en toute sécurité.
          </p>
        </div>
        {linkColumns.map((column) => (
          <div key={column.label}>
            <div className="mb-3 font-mono-ui text-[11px] uppercase tracking-[0.08em] text-text-tertiary">
              {column.label}
            </div>
            <div className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13.5px] text-text-secondary hover:text-text"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-5 text-[12.5px] text-text-tertiary sm:px-8 lg:px-12">
        <span>© 2026 Compte.shop</span>
        <span>Prix affichés en francs CFA (XOF)</span>
      </div>
    </footer>
  );
}

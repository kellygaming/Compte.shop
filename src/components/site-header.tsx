"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FIRST_GAME_SLUG = "fortnite";

const navLinks = [
  { label: "Catégories", href: `/jeux/${FIRST_GAME_SLUG}` },
  { label: "Vendre un compte", href: "/#vendre" },
  { label: "Protection", href: "/#protection" },
  { label: "Support", href: "/#support" },
];

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pseudo, setPseudo] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string | undefined) {
      if (!userId) {
        setPseudo(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", userId)
        .maybeSingle();
      setPseudo(data?.pseudo ?? null);
    }

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user?.id));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/82 backdrop-blur-[14px]">
      <div className="flex items-center justify-between gap-[clamp(14px,2.4vw,32px)] px-[clamp(16px,4vw,48px)] py-[18px]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-accent font-display text-[15px] font-bold text-bg">
            C
          </span>
          <span className="font-display text-[18px] font-semibold tracking-[-0.01em]">
            Compte.shop
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-[clamp(14px,2.2vw,30px)] overflow-hidden whitespace-nowrap text-sm text-text-secondary md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-text">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 whitespace-nowrap md:flex">
          {pseudo ? (
            <>
              <span className="text-[13.5px] text-text-secondary">{pseudo}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-[9px] border border-border-strong px-[18px] py-[9px] text-[13.5px] hover:border-border-hover"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              className="rounded-[9px] border border-border-strong px-[18px] py-[9px] text-[13.5px] hover:border-border-hover"
            >
              Se connecter
            </Link>
          )}
          <Link
            href="/#vendre"
            className="rounded-[9px] bg-accent px-[18px] py-2.5 text-[13.5px] font-semibold text-bg hover:bg-accent-hover"
          >
            Devenir vendeur
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-[9px] border border-border-strong md:hidden"
        >
          <span
            className="h-[1.5px] w-[18px] bg-text transition-transform"
            style={open ? { transform: "translateY(3.25px) rotate(45deg)" } : undefined}
          />
          <span
            className="h-[1.5px] w-[18px] bg-text transition-transform"
            style={open ? { transform: "translateY(-3.25px) rotate(-45deg)" } : undefined}
          />
        </button>
      </div>

      {open ? (
        <div className="flex flex-col gap-1 border-t border-border px-[clamp(16px,4vw,48px)] py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-[15px] text-text-secondary hover:text-text"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2.5">
            {pseudo ? (
              <>
                <span className="text-[13.5px] text-text-secondary">
                  Connecté en tant que {pseudo}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-11 rounded-[9px] border border-border-strong px-[18px] text-[13.5px]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-[9px] border border-border-strong px-[18px] text-[13.5px]"
              >
                Se connecter
              </Link>
            )}
            <Link
              href="/#vendre"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-center rounded-[9px] bg-accent px-[18px] text-[13.5px] font-semibold text-bg"
            >
              Devenir vendeur
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

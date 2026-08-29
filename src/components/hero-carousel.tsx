"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatAmount, formatRating } from "@/lib/format";
import type { Game, Listing } from "@/lib/types";

type HeroItem = { game: Game; listing: Listing };

const AUTO_ADVANCE_MS = 4200;
const FADE_OUT_MS = 260;

export function HeroCarousel({ items }: { items: HeroItem[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const goTo = useCallback((next: number) => {
    setVisible(false);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, FADE_OUT_MS);
  }, []);

  const step = useCallback(
    (delta: number) => {
      const next = (indexRef.current + delta + items.length) % items.length;
      goTo(next);
    },
    [items.length, goTo],
  );

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    timerRef.current = setInterval(() => step(1), AUTO_ADVANCE_MS);
  }, [step]);

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [restartTimer]);

  const current = items[index];

  return (
    <div className="rounded-[18px] border border-border-soft bg-surface p-[22px] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
          Annonce vérifiée
        </span>
        <span className="whitespace-nowrap rounded-full border border-accent-border px-[9px] py-[3px] text-[11.5px] text-accent">
          Séquestre actif
        </span>
      </div>

      <div className="relative h-[230px] overflow-hidden rounded-xl border border-border bg-media-empty">
        <div
          className="absolute inset-0 transition-opacity duration-[380ms] ease-in-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <Image
            src={current.game.image}
            alt={current.game.name}
            fill
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[88px] bg-gradient-to-t from-bg/92 to-transparent" />
        <div className="absolute bottom-[14px] left-[14px] flex gap-[7px]">
          {items.map((item, dotIndex) => (
            <button
              key={item.game.slug}
              type="button"
              title={item.game.name}
              aria-label={`Voir ${item.game.name}`}
              onClick={() => {
                goTo(dotIndex);
                restartTimer();
              }}
              className="h-1 w-[22px] rounded-full"
              style={{
                background:
                  dotIndex === index
                    ? "var(--color-accent)"
                    : "rgba(255,255,255,0.28)",
              }}
            />
          ))}
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            aria-label="Annonce précédente"
            onClick={() => {
              step(-1);
              restartTimer();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-strong bg-bg/72 text-[13px] hover:border-border-hover"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Annonce suivante"
            onClick={() => {
              step(1);
              restartTimer();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-strong bg-bg/72 text-[13px] hover:border-border-hover"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-[18px] flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div
            className="mb-[5px] truncate font-display text-[19px] font-semibold transition-opacity duration-[380ms] ease-in-out"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {current.listing.title}
          </div>
          <div className="text-[13px] text-text-tertiary">
            Vendeur ID vérifié · {current.listing.sellerSalesCount} ventes ·{" "}
            {formatRating(current.listing.sellerRating)} ★
          </div>
        </div>
        <div className="whitespace-nowrap font-display text-[22px] font-semibold">
          {formatAmount(current.listing.priceXOF)}{" "}
          <span className="text-[13px] font-normal text-text-secondary">
            F CFA
          </span>
        </div>
      </div>
    </div>
  );
}

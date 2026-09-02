"use client";

import { OPEN_SUPPORT_CHAT_EVENT } from "@/components/support-chat";

const supportContact = "WhatsApp +225 0173507682";
const WHATSAPP_URL = `https://wa.me/225${supportContact.replace(/\D/g, "").replace(/^225/, "")}`;

export function SupportSection() {
  return (
    <section id="support" className="scroll-mt-20 border-t border-border bg-surface-alt">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-18 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-[72px] lg:px-12">
        <div>
          <div className="mb-3 font-mono-ui text-[11.5px] uppercase tracking-[0.08em] text-text-tertiary">
            03 — Support
          </div>
          <h2 className="mb-3.5 font-display text-[34px] font-semibold tracking-[-0.02em]">
            Un humain au bout du fil, 24 h / 24
          </h2>
          <p className="mb-7 max-w-[520px] text-[16.5px] leading-relaxed text-text-secondary">
            Un doute sur une annonce, un transfert qui traîne, un
            remboursement à lancer : notre équipe répond en moins de 10
            minutes, tous les jours de l&apos;année.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_SUPPORT_CHAT_EVENT))}
              className="rounded-[10px] bg-accent px-[22px] py-[13px] text-sm font-semibold text-bg hover:bg-accent-hover"
            >
              Ouvrir le chat
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[10px] border border-border-strong px-[22px] py-[13px] text-sm hover:border-border-hover"
            >
              {supportContact}
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
          <div className="mb-[18px] flex items-center gap-2.5">
            <span className="h-[7px] w-[7px] rounded-full bg-accent" />
            <span className="text-[13px] text-text-secondary">
              Équipe en ligne — 3 conseillers disponibles
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="max-w-[80%] self-start rounded-[12px_12px_12px_4px] bg-bubble-in px-[15px] py-3 text-sm leading-relaxed">
              Le vendeur ne répond plus depuis 2 h, je fais quoi ?
            </div>
            <div className="max-w-[80%] self-end rounded-[12px_12px_4px_12px] bg-accent px-[15px] py-3 text-sm leading-relaxed text-bg">
              Votre paiement est toujours en séquestre. Je relance le vendeur
              maintenant, et sans réponse d&apos;ici 24 h vous êtes remboursé
              automatiquement.
            </div>
          </div>
          <div className="mt-[18px] border-t border-border pt-4 font-mono-ui text-[11px] text-text-tertiary">
            Temps de réponse moyen · 6 min
          </div>
        </div>
      </div>
    </section>
  );
}

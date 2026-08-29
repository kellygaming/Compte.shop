import { sellerSteps } from "@/lib/content";

export function SellSection() {
  return (
    <section id="vendre" className="mx-auto max-w-[1240px] scroll-mt-20 px-12 py-24">
      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-[72px]">
        <div>
          <div className="mb-3 font-mono-ui text-[11.5px] uppercase tracking-[0.08em] text-text-tertiary">
            04 — Vendre
          </div>
          <h2 className="mb-3.5 font-display text-[34px] font-semibold tracking-[-0.02em]">
            Un marché ouvert, mais pas anonyme
          </h2>
          <p className="mb-6 text-[16.5px] leading-relaxed text-text-secondary">
            N&apos;importe quel joueur peut vendre sur Compte.shop. La seule
            condition : nous dire qui vous êtes. Pièce d&apos;identité ou
            extrait de naissance, plus une photo. Après vérification, votre
            tableau de bord s&apos;ouvre et vous publiez vos comptes en
            quelques minutes.
          </p>
          <button
            type="button"
            className="rounded-[10px] bg-accent px-6 py-[13px] text-sm font-semibold text-bg hover:bg-accent-hover"
          >
            Créer mon compte vendeur
          </button>
        </div>
        <div className="flex flex-col gap-3.5">
          {sellerSteps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-5 rounded-[14px] border border-border-soft bg-surface px-6 py-[22px]"
            >
              <div className="pt-[3px] font-mono-ui text-xs text-accent">
                {step.num}
              </div>
              <div>
                <div className="mb-1.5 font-display text-[17.5px] font-semibold">
                  {step.title}
                </div>
                <div className="text-sm leading-relaxed text-text-secondary">
                  {step.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

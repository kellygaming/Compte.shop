import { escrowSteps, protections } from "@/lib/content";

export function ProtectionSection() {
  return (
    <section id="protection" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mb-3 font-mono-ui text-[11.5px] uppercase tracking-[0.08em] text-text-tertiary">
        02 — Sécurité
      </div>
      <h2 className="mb-3.5 font-display text-[36px] font-semibold tracking-[-0.02em]">
        Voici comment nous vous protégeons des arnaques
      </h2>
      <p className="mb-11 max-w-[640px] text-[16.5px] leading-relaxed text-text-secondary">
        Aucun échange en direct, aucun paiement à l&apos;aveugle. Nous restons
        entre l&apos;acheteur et le vendeur du premier message jusqu&apos;à la
        remise du compte.
      </p>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        {protections.map((item) => (
          <div
            key={item.num}
            className="rounded-[14px] border border-border-soft bg-surface px-[26px] pb-7 pt-[26px]"
          >
            <div className="mb-3.5 font-mono-ui text-[11.5px] text-accent">
              {item.num}
            </div>
            <div className="mb-2 font-display text-[19px] font-semibold">
              {item.title}
            </div>
            <div className="text-[14.5px] leading-relaxed text-text-secondary">
              {item.body}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[18px] rounded-[14px] border border-border-soft bg-surface-alt px-[26px] py-[30px]">
        <div className="mb-6 font-mono-ui text-[11.5px] uppercase tracking-[0.08em] text-text-tertiary">
          Le déroulé d&apos;un achat
        </div>
        <div className="grid grid-cols-2 gap-[26px] md:grid-cols-4">
          {escrowSteps.map((step) => (
            <div key={step.num} className="border-t border-border-strong pt-4">
              <div className="mb-2.5 font-mono-ui text-[11.5px] text-accent">
                {step.num}
              </div>
              <div className="mb-1.5 font-display text-[15px] font-semibold">
                {step.title}
              </div>
              <div className="text-[13.5px] leading-relaxed text-text-secondary">
                {step.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

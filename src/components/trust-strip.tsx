const items = [
  "Paiement bloqué en séquestre",
  "Vendeurs vérifiés par pièce d'identité",
  "Garantie de remboursement 48 h",
  "Historique et notes publiques",
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface-alt">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-9 px-12 py-[26px] text-[13.5px] text-text-secondary sm:grid-cols-4">
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </section>
  );
}

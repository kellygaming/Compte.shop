/**
 * Espace normal (U+0020) comme séparateur de milliers, jamais de virgule —
 * cf. PROJET.md. Intl.NumberFormat('fr-FR') insère un espace fine
 * insécable (U+202F) ; on le normalise ici pour rester prévisible.
 */
export function formatAmount(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatXOF(amount: number): string {
  return `${formatAmount(amount)} F CFA`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1).replace(".", ",");
}

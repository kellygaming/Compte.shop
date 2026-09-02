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

/**
 * Référence courte et lisible d'une commande (l'UUID complet reste la clé
 * réelle) — à donner à l'assistant IA ou à un admin plutôt que l'UUID
 * complet. Pas d'unicité garantie au-delà de quelques milliers de
 * commandes, ce n'est qu'un repère de conversation.
 */
export function shortOrderRef(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

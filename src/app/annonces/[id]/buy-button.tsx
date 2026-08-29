"use client";

import Link from "next/link";
import { useState } from "react";

export function BuyButton({
  listingId,
  isAuthenticated,
}: {
  listingId: string;
  isAuthenticated: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/connexion?next=/annonces/${listingId}`}
        className="flex w-full items-center justify-center rounded-[10px] bg-accent px-6 py-3.5 text-sm font-semibold text-bg hover:bg-accent-hover"
      >
        Se connecter pour acheter
      </Link>
    );
  }

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Une erreur est survenue.");
      }
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className="w-full rounded-[10px] bg-accent px-6 py-3.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Redirection vers le paiement…" : "Payer via Mobile Money"}
      </button>
      {error ? (
        <p className="mt-2.5 text-[13px] text-text-secondary">{error}</p>
      ) : null}
    </div>
  );
}

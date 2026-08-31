"use client";

import Link from "next/link";
import { useState } from "react";

export function BuyButton({
  listingId,
  isAuthenticated,
  defaultPhone,
}: {
  listingId: string;
  isAuthenticated: boolean;
  defaultPhone: string | null;
}) {
  const [phone, setPhone] = useState(defaultPhone ?? "");
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
    if (!phone.trim()) {
      setError("Entrez le numéro qui recevra la demande de paiement.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, numero_send: phone.trim() }),
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
      <label className="mb-3 flex flex-col gap-1.5 text-[13px] text-text-secondary">
        Numéro Mobile Money
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07 00 00 00 00"
          className="rounded-[10px] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none placeholder:text-text-tertiary focus:border-border-hover"
        />
      </label>
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

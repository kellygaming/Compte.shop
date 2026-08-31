"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-[10px] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none placeholder:text-text-tertiary focus:border-border-hover";

export function EditListingForm({
  listingId,
  initialPriceXOF,
  initialDescription,
  initialDeliveryType,
  initialDeliveryInstructions,
}: {
  listingId: string;
  initialPriceXOF: number;
  initialDescription: string;
  initialDeliveryType: string;
  initialDeliveryInstructions: string;
}) {
  const router = useRouter();
  const [priceXOF, setPriceXOF] = useState(String(initialPriceXOF));
  const [description, setDescription] = useState(initialDescription);
  const [deliveryType, setDeliveryType] = useState<"instant" | "manual">(
    initialDeliveryType === "manual" ? "manual" : "instant",
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(initialDeliveryInstructions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(priceXOF);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Prix invalide.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_xof: price,
          description,
          delivery_type: deliveryType,
          delivery_instructions: deliveryInstructions,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Une erreur est survenue.");
      }

      router.push("/tableau-de-bord");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
        Prix (F CFA)
        <input
          required
          inputMode="numeric"
          value={priceXOF}
          onChange={(e) => setPriceXOF(e.target.value.replace(/[^\d]/g, ""))}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={inputClass}
        />
      </label>
      <div className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
        Comment se passera la remise du compte ?
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDeliveryType("instant")}
            className={`flex-1 rounded-[10px] border px-3.5 py-2.5 text-left text-[13.5px] ${
              deliveryType === "instant"
                ? "border-accent text-text"
                : "border-border-strong text-text-secondary"
            }`}
          >
            <div className="font-semibold">Instantané</div>
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("manual")}
            className={`flex-1 rounded-[10px] border px-3.5 py-2.5 text-left text-[13.5px] ${
              deliveryType === "manual"
                ? "border-accent text-text"
                : "border-border-strong text-text-secondary"
            }`}
          >
            <div className="font-semibold">Manuel</div>
          </button>
        </div>
      </div>
      <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
        Précisions sur la remise (affiché avant l&apos;achat)
        <textarea
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-1.5 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

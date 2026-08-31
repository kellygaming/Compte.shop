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
  initialCredentials,
}: {
  listingId: string;
  initialPriceXOF: number;
  initialDescription: string;
  initialDeliveryType: string;
  initialDeliveryInstructions: string;
  initialCredentials: string;
}) {
  const router = useRouter();
  const [priceXOF, setPriceXOF] = useState(String(initialPriceXOF));
  const [description, setDescription] = useState(initialDescription);
  const [deliveryType, setDeliveryType] = useState<"instant" | "manual">(
    initialDeliveryType === "manual" ? "manual" : "instant",
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(initialDeliveryInstructions);
  const [credentials, setCredentials] = useState(initialCredentials);
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
    if (deliveryType === "instant" && !credentials.trim()) {
      setError("Indiquez l'email et le mot de passe à donner à l'acheteur.");
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
          credentials,
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
        <div className="font-semibold text-text">
          Comment vas-tu donner le compte à l&apos;acheteur ?
        </div>
        <p className="mb-1 text-[12.5px] leading-relaxed text-text-tertiary">
          C&apos;est écrit sur l&apos;annonce, la personne le voit avant
          d&apos;acheter. Aura-t-elle un email + mot de passe pour se
          connecter seule, même sans toi ? Ou dois-tu être présent pour lui
          donner le compte toi-même ?
        </p>
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
            <div className="font-semibold">Email + mot de passe</div>
            <div className="text-[12px] text-text-tertiary">
              Elle reçoit les accès juste après le paiement et se connecte
              seule, sans toi.
            </div>
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
            <div className="font-semibold">Je dois être présent</div>
            <div className="text-[12px] text-text-tertiary">
              Tu dois être disponible après l&apos;achat pour lui donner le
              compte toi-même. Si tu n&apos;es pas là à temps, l&apos;acheteur
              est remboursé.
            </div>
          </button>
        </div>
      </div>

      {deliveryType === "instant" ? (
        <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
          Email + mot de passe à donner à l&apos;acheteur
          <textarea
            required
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="email@exemple.com / motdepasse123"
          />
          <span className="text-[12px] text-text-tertiary">
            L&apos;acheteur verra ce message juste après avoir payé. Personne
            d&apos;autre ne peut le voir.
          </span>
        </label>
      ) : null}
      <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
        Un message pour l&apos;acheteur (affiché avant l&apos;achat, optionnel)
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

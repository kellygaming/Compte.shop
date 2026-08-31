"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReconcileButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reconcile`, {
        method: "POST",
      });
      const data = await response.json();
      setResult(
        data.status === "held"
          ? "Paiement confirmé, commande mise à jour."
          : "MoneyFusion ne confirme pas ce paiement pour l'instant.",
      );
      router.refresh();
    } catch {
      setResult("Échec de la vérification.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-[10px] border border-border-strong px-5 py-2.5 text-sm hover:border-border-hover disabled:opacity-60"
      >
        {loading ? "Vérification…" : "Revérifier auprès de MoneyFusion"}
      </button>
      {result ? <p className="mt-2 text-[13px] text-text-tertiary">{result}</p> : null}
    </div>
  );
}

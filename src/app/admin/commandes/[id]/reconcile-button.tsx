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

  async function handleManualConfirm() {
    if (!confirm("Confirmer que ce paiement a bien été reçu (vérifié sur le tableau de bord MoneyFusion) ?")) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/mark-held`, {
        method: "POST",
      });
      const data = await response.json();
      setResult(response.ok ? "Commande marquée payée." : (data.error ?? "Échec."));
      router.refresh();
    } catch {
      setResult("Échec de la confirmation manuelle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-[10px] border border-border-strong px-5 py-2.5 text-sm hover:border-border-hover disabled:opacity-60"
      >
        {loading ? "Vérification…" : "Revérifier auprès de MoneyFusion"}
      </button>
      <button
        type="button"
        onClick={handleManualConfirm}
        disabled={loading}
        className="self-start text-[12.5px] text-text-tertiary underline hover:text-text-secondary disabled:opacity-60"
      >
        Commande sans token (créée avant le correctif) ? Confirmer manuellement après vérification sur MoneyFusion
      </button>
      {result ? <p className="text-[13px] text-text-tertiary">{result}</p> : null}
    </div>
  );
}

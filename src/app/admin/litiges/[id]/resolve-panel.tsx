"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResolvePanel({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"release" | "refund" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resolve(decision: "release" | "refund") {
    setLoading(decision);
    setError(null);
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <div className="mb-3 font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
        Trancher le litige
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => resolve("release")}
          className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
        >
          {loading === "release" ? "…" : "Verser au vendeur"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => resolve("refund")}
          className="rounded-[10px] border border-border-strong px-4 py-2.5 text-sm hover:border-border-hover disabled:opacity-60"
        >
          {loading === "refund" ? "…" : "Rembourser l'acheteur"}
        </button>
      </div>
      {error ? <p className="mt-2.5 text-[13px] text-text-secondary">{error}</p> : null}
    </div>
  );
}

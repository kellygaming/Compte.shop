"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function KycReviewActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(action: "approve" | "reject") {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/sellers/${profileId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === "reject" ? reason.trim() : undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      router.refresh();
      setShowReject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => send("approve")}
          className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "…" : "Valider ce vendeur"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setShowReject((v) => !v)}
          className="rounded-[10px] border border-border-strong px-5 py-2.5 text-sm hover:border-border-hover disabled:opacity-60"
        >
          Rejeter
        </button>
      </div>

      {showReject ? (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-border-soft bg-surface p-4">
          <label className="text-[13px] text-text-secondary">
            Raison du rejet (visible par le vendeur)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-[10px] border border-border-strong bg-bg px-3.5 py-2.5 text-[14px] outline-none placeholder:text-text-tertiary focus:border-border-hover"
              placeholder="Ex : photo de la pièce d'identité illisible, le selfie ne correspond pas au document…"
            />
          </label>
          <button
            type="button"
            disabled={loading || !reason.trim()}
            onClick={() => send("reject")}
            className="self-start rounded-[10px] border border-border-strong px-5 py-2.5 text-sm hover:border-border-hover disabled:opacity-60"
          >
            {loading ? "…" : "Confirmer le rejet"}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}
    </div>
  );
}

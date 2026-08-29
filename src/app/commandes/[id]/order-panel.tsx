"use client";

import { useEffect, useState } from "react";

type OrderStatus =
  | "pending_payment"
  | "held"
  | "released"
  | "refunded"
  | "disputed"
  | "cancelled";

type Order = {
  id: string;
  status: string;
  amount_xof: number;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  delivered_at: string | null;
  confirm_deadline: string | null;
  delivery_note: string | null;
};

const KNOWN_STATUSES: OrderStatus[] = [
  "pending_payment",
  "held",
  "released",
  "refunded",
  "disputed",
  "cancelled",
];

function isKnownStatus(value: string): value is OrderStatus {
  return (KNOWN_STATUSES as string[]).includes(value);
}

const inputClass =
  "w-full rounded-[10px] border border-border-strong bg-surface px-3.5 py-2.5 text-[14px] text-text outline-none placeholder:text-text-tertiary focus:border-border-hover";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

export function OrderPanel({
  order: initialOrder,
  role,
}: {
  order: Order;
  role: "buyer" | "seller";
}) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const status = isKnownStatus(order.status) ? order.status : "pending_payment";

  useEffect(() => {
    if (status !== "pending_payment") return;

    let cancelled = false;
    let polls = 0;

    const interval = setInterval(async () => {
      polls += 1;
      if (polls > MAX_POLLS) {
        clearInterval(interval);
        return;
      }
      try {
        const response = await fetch(`/api/orders/${order.id}`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data.order && data.order.status !== "pending_payment") {
          setOrder(data.order);
          clearInterval(interval);
        }
      } catch {
        // Nouvel essai au prochain tick.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order.id, status]);

  async function callAction(path: string, body?: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Une erreur est survenue.");

      const refreshed = await fetch(`/api/orders/${order.id}`);
      const refreshedData = await refreshed.json();
      if (refreshedData.order) setOrder(refreshedData.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <StatusBanner status={status} />

      {status === "held" && !order.delivered_at && role === "seller" ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
          <p className="mb-3 text-[13.5px] text-text-secondary">
            Transmettez les identifiants du compte à l&apos;acheteur.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Identifiant, mot de passe, e-mail lié…"
          />
          <button
            type="button"
            disabled={loading || !note.trim()}
            onClick={() => callAction("deliver", { note })}
            className="mt-3 rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? "Envoi…" : "Marquer comme livré"}
          </button>
        </div>
      ) : null}

      {status === "held" && !order.delivered_at && role === "buyer" ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-text-secondary">
          En attente que le vendeur transmette les accès.
        </div>
      ) : null}

      {status === "held" && order.delivered_at ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
          {role === "buyer" && order.delivery_note ? (
            <div className="mb-4">
              <div className="mb-1.5 font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
                Accès transmis par le vendeur
              </div>
              <p className="whitespace-pre-line rounded-lg bg-bg px-3.5 py-3 text-[13.5px]">
                {order.delivery_note}
              </p>
            </div>
          ) : null}
          <p className="mb-4 text-[13px] text-text-tertiary">
            {order.confirm_deadline
              ? `Vous avez jusqu'au ${new Date(order.confirm_deadline).toLocaleString("fr-FR")} pour vérifier le compte.`
              : null}
          </p>

          {role === "buyer" ? (
            disputeOpen ? (
              <div>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Décrivez le problème (compte inaccessible, description mensongère…)"
                />
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    disabled={loading || !disputeReason.trim()}
                    onClick={() => callAction("dispute", { reason: disputeReason })}
                    className="rounded-[10px] border border-border-strong px-4 py-2 text-[13.5px] hover:border-border-hover disabled:opacity-60"
                  >
                    Envoyer le signalement
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisputeOpen(false)}
                    className="rounded-[10px] px-4 py-2 text-[13.5px] text-text-tertiary"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => callAction("confirm")}
                  className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
                >
                  {loading ? "…" : "Confirmer la réception"}
                </button>
                <button
                  type="button"
                  onClick={() => setDisputeOpen(true)}
                  className="rounded-[10px] border border-border-strong px-5 py-2.5 text-sm hover:border-border-hover"
                >
                  Signaler un problème
                </button>
              </div>
            )
          ) : (
            <p className="text-[13.5px] text-text-secondary">
              En attente de confirmation de l&apos;acheteur (versement automatique
              à l&apos;expiration du délai en l&apos;absence de réponse).
            </p>
          )}
        </div>
      ) : null}

      {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}
    </div>
  );
}

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "En attente de confirmation du paiement…",
  held: "Paiement reçu — bloqué en séquestre.",
  released: "Commande finalisée — versement dû au vendeur.",
  refunded: "Commande remboursée.",
  disputed: "Litige en cours — notre équipe intervient sous 24 h.",
  cancelled: "Commande annulée.",
};

function StatusBanner({ status }: { status: OrderStatus }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="flex items-center gap-2.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background:
              status === "pending_payment"
                ? "var(--color-text-tertiary)"
                : "var(--color-accent)",
          }}
        />
        <span className="text-sm font-medium">{LABELS[status]}</span>
      </div>
    </div>
  );
}

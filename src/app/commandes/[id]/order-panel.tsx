"use client";

import { useEffect, useState } from "react";
import { OrderThread } from "@/components/order-thread";

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
  seller_confirmed_at: string | null;
  payout_requested_at: string | null;
  payout_phone: string | null;
  paid_out_at: string | null;
};

type Dispute = { id: string; status: string; escalated_at: string | null } | null;

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
  userId,
  dispute,
}: {
  order: Order;
  role: "buyer" | "seller";
  userId: string;
  dispute: Dispute;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [escalated, setEscalated] = useState(Boolean(dispute?.escalated_at));
  const [payoutPhone, setPayoutPhone] = useState("");

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

  async function handleEscalate() {
    if (!dispute) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/disputes/${dispute.id}/escalate`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      setEscalated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <StatusBanner status={status} />

      {role === "buyer" && order.delivery_note ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
          <div className="mb-1.5 font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
            Accès transmis par le vendeur
          </div>
          <p className="whitespace-pre-line rounded-lg bg-bg px-3.5 py-3 text-[13.5px]">
            {order.delivery_note}
          </p>
          <p className="mt-2.5 text-[12.5px] text-text-tertiary">
            Toujours visible ici si vous en avez besoin plus tard.
          </p>
        </div>
      ) : null}

      {status === "held" && !order.delivered_at && role === "seller" ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
          <p className="mb-3 text-[13.5px] text-text-secondary">
            Transmettez les identifiants du compte à l&apos;acheteur. Vous
            pouvez aussi discuter avec lui juste en dessous.
          </p>
          {order.confirm_deadline ? (
            <p className="mb-3 text-[13px] text-text-tertiary">
              Vous devez livrer avant le{" "}
              {new Date(order.confirm_deadline).toLocaleString("fr-FR")}, sinon
              l&apos;acheteur est remboursé automatiquement.
            </p>
          ) : null}
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
          {order.confirm_deadline ? (
            <p className="mt-2 text-[13px] text-text-tertiary">
              S&apos;il ne livre pas avant le{" "}
              {new Date(order.confirm_deadline).toLocaleString("fr-FR")}, vous
              êtes remboursé automatiquement.
            </p>
          ) : null}
        </div>
      ) : null}

      {status === "held" && order.delivered_at ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
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
                  {loading ? "…" : "Reçu, tout est ok"}
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

      {status === "released" && role === "seller" ? (
        <div className="rounded-2xl border border-border-soft bg-surface p-6">
          {!order.seller_confirmed_at ? (
            <>
              <p className="mb-3 text-[13.5px] text-text-secondary">
                L&apos;acheteur a confirmé. Confirmez à votre tour que la vente
                est actée pour demander le versement.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => callAction("seller-confirm")}
                className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
              >
                {loading ? "…" : "Je confirme la vente"}
              </button>
            </>
          ) : order.paid_out_at ? (
            <p className="text-[13.5px] text-text-secondary">Versement effectué.</p>
          ) : order.payout_requested_at ? (
            <div>
              <p className="text-[13.5px] text-text-secondary">
                Versement demandé{order.payout_phone ? ` sur le ${order.payout_phone}` : ""}, en
                cours de traitement.
              </p>
              <p className="mt-1.5 text-[12.5px] text-text-tertiary">
                Le versement peut prendre jusqu&apos;à 24 h.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-[13.5px] text-text-secondary">
                Vente confirmée. Indiquez le numéro Mobile Money qui doit
                recevoir le versement, avec l&apos;indicatif du pays (ex.
                +225 07 00 00 00 00) — très important pour qu&apos;on vous
                paie sur le bon numéro.
              </p>
              <input
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                className={`${inputClass} mb-3`}
                placeholder="+225 07 00 00 00 00"
              />
              <button
                type="button"
                disabled={loading || !payoutPhone.trim()}
                onClick={() => callAction("request-payout", { phone: payoutPhone.trim() })}
                className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
              >
                {loading ? "…" : "Demander le versement"}
              </button>
              <p className="mt-2.5 text-[12.5px] text-text-tertiary">
                Le versement peut prendre jusqu&apos;à 24 h après la demande.
              </p>
            </>
          )}
        </div>
      ) : null}

      {status === "held" || status === "released" || status === "disputed" ? (
        <OrderThread orderId={order.id} currentUserId={userId} closed={false} />
      ) : null}

      {status === "disputed" && dispute ? (
        !escalated ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleEscalate}
            className="self-start rounded-[10px] border border-border-strong px-5 py-2.5 text-sm hover:border-border-hover disabled:opacity-60"
          >
            Appeler un admin
          </button>
        ) : (
          <p className="text-[13px] text-text-tertiary">
            Un administrateur a été prévenu et va trancher.
          </p>
        )
      ) : null}

      {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}
    </div>
  );
}

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "En attente de confirmation du paiement…",
  held: "Paiement reçu — bloqué en séquestre.",
  released: "Vente confirmée par l'acheteur.",
  refunded: "Commande remboursée.",
  disputed: "Litige en cours.",
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

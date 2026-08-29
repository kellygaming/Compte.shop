"use client";

import { useEffect, useState } from "react";

type OrderStatus =
  | "pending_payment"
  | "held"
  | "released"
  | "refunded"
  | "disputed"
  | "cancelled";

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "En attente de confirmation du paiement…",
  held: "Paiement reçu — bloqué en séquestre jusqu'à la remise du compte.",
  released: "Paiement versé au vendeur.",
  refunded: "Commande remboursée.",
  disputed: "Litige en cours.",
  cancelled: "Commande annulée.",
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

function isOrderStatus(value: string): value is OrderStatus {
  return value in LABELS;
}

export function OrderStatus({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState<OrderStatus>(
    isOrderStatus(initialStatus) ? initialStatus : "pending_payment",
  );

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
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) return;
        const data = await response.json();
        const nextStatus = data.order?.status;
        if (
          !cancelled &&
          typeof nextStatus === "string" &&
          isOrderStatus(nextStatus) &&
          nextStatus !== "pending_payment"
        ) {
          setStatus(nextStatus);
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
  }, [orderId, status]);

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="mb-2 flex items-center gap-2.5">
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
      {status === "pending_payment" ? (
        <p className="text-[13px] leading-relaxed text-text-tertiary">
          La confirmation MoneyFusion peut prendre quelques secondes. Cette
          page se met à jour automatiquement.
        </p>
      ) : null}
    </div>
  );
}

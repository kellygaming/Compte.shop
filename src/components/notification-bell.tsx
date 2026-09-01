"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type UnreadOrder = { id: string; title: string };

const POLL_INTERVAL_MS = 20000;

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [orders, setOrders] = useState<UnreadOrder[]>([]);
  const [open, setOpen] = useState(false);
  const previousCount = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch("/api/notifications/unread");
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;

        const newCount = data.count ?? 0;
        if (
          newCount > previousCount.current &&
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted" &&
          localStorage.getItem("compte_shop_notif_optin") === "true"
        ) {
          new Notification("Compte.shop", {
            body: "Vous avez un nouveau message.",
          });
        }
        previousCount.current = newCount;
        setCount(newCount);
        setOrders(data.orders ?? []);
      } catch {
        // Nouvel essai au prochain tick.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-[9px] text-text-secondary hover:text-text"
      >
        <span aria-hidden className="text-[18px]">
          🔔
        </span>
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-bg">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-30 w-[280px] rounded-[12px] border border-border-soft bg-surface p-2 shadow-lg">
          {orders.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-text-tertiary">
              Aucun nouveau message.
            </p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/commandes/${order.id}`}
                onClick={() => setOpen(false)}
                className="block rounded-[9px] px-3 py-2.5 text-[13.5px] text-text hover:bg-bg"
              >
                {order.title}
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

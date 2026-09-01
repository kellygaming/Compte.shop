"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles: { pseudo: string } | null;
};

const POLL_INTERVAL_MS = 4000;

/**
 * Fil de discussion unique par commande : acheteur, vendeur, et admin en
 * cas de litige. Disponible dès que la commande est payée, pas seulement
 * pendant un litige — c'est là que se coordonne une remise manuelle, et
 * là qu'on atterrit en cas de problème, sans changer de canal.
 */
export function OrderThread({
  orderId,
  currentUserId,
  closed,
}: {
  orderId: string;
  currentUserId: string;
  closed: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("order_messages")
        .select("id, sender_id, body, created_at, profiles(pseudo)")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setMessages(data as Message[]);

      // Marque la discussion comme lue jusqu'à maintenant — alimente le
      // badge de la cloche dans l'en-tête.
      await supabase
        .from("order_reads")
        .upsert({ order_id: orderId, user_id: currentUserId, last_read_at: new Date().toISOString() });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId, currentUserId]);

  async function handleSend() {
    if (!body.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("order_messages")
      .insert({ order_id: orderId, sender_id: currentUserId, body: body.trim() });
    if (!error) {
      setBody("");
      const { data } = await supabase
        .from("order_messages")
        .select("id, sender_id, body, created_at, profiles(pseudo)")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    }
    setSending(false);
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5">
      <div className="mb-3 font-mono-ui text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
        Discussion
      </div>
      <div className="mb-4 flex max-h-[360px] flex-col gap-2.5 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-[13px] text-text-tertiary">
            Aucun message pour l&apos;instant. Écrivez ici pour vous coordonner.
          </p>
        ) : (
          messages.map((message) => {
            const isSelf = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className="max-w-[85%] rounded-[12px] px-3.5 py-2.5 text-sm leading-relaxed"
                style={{
                  alignSelf: isSelf ? "flex-end" : "flex-start",
                  background: isSelf ? "var(--color-accent)" : "var(--color-bubble-in)",
                  color: isSelf ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                <div
                  className="mb-1 text-[11px] opacity-70"
                  style={{ color: isSelf ? "var(--color-bg)" : "var(--color-text-tertiary)" }}
                >
                  {message.profiles?.pseudo ?? "—"}
                </div>
                {message.body}
              </div>
            );
          })
        )}
      </div>
      {!closed ? (
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Écrire un message…"
            className="flex-1 rounded-[10px] border border-border-strong bg-bg px-3.5 py-2.5 text-[14px] outline-none placeholder:text-text-tertiary focus:border-border-hover"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
          >
            Envoyer
          </button>
        </div>
      ) : (
        <p className="text-[13px] text-text-tertiary">Cette commande est close.</p>
      )}
    </div>
  );
}

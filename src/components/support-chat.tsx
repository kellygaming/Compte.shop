"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function SupportChat() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user)));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSend() {
    const text = question.trim();
    if (!text || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setQuestion("");
    setSending(true);
    try {
      const response = await fetch("/api/support/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: messages }),
      });
      const data = await response.json();
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: response.ok
            ? data.answer
            : (data.error ?? "L'assistant n'a pas pu répondre, réessayez."),
        },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "L'assistant n'a pas pu répondre, réessayez." },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!loggedIn) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="mb-3 flex h-[420px] w-[320px] flex-col rounded-[16px] border border-border-soft bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
            <span className="text-[13.5px] font-semibold">Assistant Compte.shop</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="text-text-tertiary hover:text-text"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <p className="text-[13px] text-text-tertiary">
                Une question sur l&apos;achat, la vente, le paiement ? Posez-la
                ici.
              </p>
            ) : (
              messages.map((message, i) => (
                <div
                  key={i}
                  className="max-w-[85%] rounded-[12px] px-3.5 py-2.5 text-[13.5px] leading-relaxed"
                  style={{
                    alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                    background:
                      message.role === "user" ? "var(--color-accent)" : "var(--color-bubble-in)",
                    color: message.role === "user" ? "var(--color-bg)" : "var(--color-text)",
                  }}
                >
                  {message.content}
                </div>
              ))
            )}
            {sending ? <p className="text-[12.5px] text-text-tertiary">…</p> : null}
          </div>
          <div className="flex gap-2 border-t border-border-soft p-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Votre question…"
              className="flex-1 rounded-[10px] border border-border-strong bg-bg px-3 py-2 text-[13.5px] outline-none placeholder:text-text-tertiary focus:border-border-hover"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !question.trim()}
              className="rounded-[10px] bg-accent px-3.5 py-2 text-[13.5px] font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
            >
              Envoyer
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-bg shadow-lg hover:bg-accent-hover"
        aria-label="Ouvrir l'assistant"
      >
        {open ? "✕" : "🤖"}
      </button>
    </div>
  );
}

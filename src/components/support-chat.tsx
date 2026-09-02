"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Le bloc "Support" de la page d'accueil (marketing, statique) a son
 * propre bouton "Ouvrir le chat" — ce n'est pas ce composant, donc un
 * simple onClick ne suffit pas à les relier. On passe par un événement
 * DOM global : ce composant (toujours monté dans le layout) l'écoute et
 * s'ouvre lui-même.
 */
export const OPEN_SUPPORT_CHAT_EVENT = "compte-shop:open-support-chat";

export function SupportChat() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  // Sur mobile, le clavier virtuel réduit le viewport visible sans que le
  // navigateur ne redimensionne les éléments "fixed" — on suit
  // window.visualViewport pour que le champ de saisie reste au-dessus du
  // clavier au lieu de se retrouver caché ou décalé.
  const [mobileViewport, setMobileViewport] = useState<{ height: number; top: number } | null>(
    null,
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user)));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!open || !vv) return;

    function update() {
      if (!vv || window.innerWidth >= 640) {
        setMobileViewport(null);
        return;
      }
      setMobileViewport({ height: vv.height, top: vv.offsetTop });
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [open]);

  useEffect(() => {
    function handleOpenRequest() {
      if (loggedIn) {
        setOpen(true);
      } else {
        router.push("/connexion?next=/%23support");
      }
    }
    window.addEventListener(OPEN_SUPPORT_CHAT_EVENT, handleOpenRequest);
    return () => window.removeEventListener(OPEN_SUPPORT_CHAT_EVENT, handleOpenRequest);
  }, [loggedIn, router]);

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
    <>
      {open ? (
        <div
          className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col bg-surface sm:inset-x-auto sm:top-auto sm:bottom-24 sm:right-5 sm:h-[420px] sm:w-[320px] sm:rounded-[16px] sm:border sm:border-border-soft sm:shadow-lg"
          style={mobileViewport ? { height: mobileViewport.height, top: mobileViewport.top } : undefined}
        >
          <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
            <span className="text-[13.5px] font-semibold">Assistant Compte.shop</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="flex h-8 w-8 items-center justify-center text-text-tertiary hover:text-text"
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
          <div className="flex gap-2 border-t border-border-soft p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
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

      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-bg shadow-lg hover:bg-accent-hover"
          aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        >
          {open ? "✕" : "🤖"}
        </button>
      </div>
    </>
  );
}

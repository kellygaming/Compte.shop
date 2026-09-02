"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const inputClass =
  "rounded-[10px] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none placeholder:text-text-tertiary focus:border-border-hover";

export function AuthForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && !acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation pour créer un compte.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { pseudo },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        // Confirmation par e-mail activée côté projet : pas de session
        // immédiate.
        setPendingConfirmation(true);
        setLoading(false);
        return;
      }

      if (phone) {
        await supabase.from("profiles").update({ phone }).eq("id", data.user!.id);
      }

      router.push(next);
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (pendingConfirmation) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm leading-relaxed text-text-secondary">
        Un e-mail de confirmation vient d&apos;être envoyé à {email}. Ouvrez-le
        pour activer votre compte, puis revenez vous connecter.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className="rounded-full px-4 py-1.5 text-[13.5px]"
          style={{
            border: `1px solid ${mode === "login" ? "var(--color-border-hover)" : "var(--color-border-strong)"}`,
            color: mode === "login" ? "var(--color-text)" : "var(--color-text-secondary)",
          }}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className="rounded-full px-4 py-1.5 text-[13.5px]"
          style={{
            border: `1px solid ${mode === "signup" ? "var(--color-border-hover)" : "var(--color-border-strong)"}`,
            color: mode === "signup" ? "var(--color-text)" : "var(--color-text-secondary)",
          }}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {mode === "signup" ? (
          <>
            <Field label="Pseudo">
              <input
                required
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className={inputClass}
                placeholder="Votre pseudo public"
              />
            </Field>
            <Field label="Téléphone (mobile money)">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="07 00 00 00 00"
              />
            </Field>
          </>
        ) : null}
        <Field label="E-mail">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="vous@exemple.com"
          />
        </Field>
        <Field label="Mot de passe">
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        {mode === "signup" ? (
          <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-text-secondary">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              J&apos;ai lu et j&apos;accepte les{" "}
              <Link href="/conditions" target="_blank" className="text-accent hover:underline">
                conditions d&apos;utilisation
              </Link>
              , notamment le fait que revendre un compte peut être interdit par l&apos;éditeur du
              jeu et que ce risque m&apos;incombe.
            </span>
          </label>
        ) : null}

        {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || (mode === "signup" && !acceptedTerms)}
          className="mt-1.5 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
        >
          {loading
            ? "Un instant…"
            : mode === "signup"
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
      {label}
      {children}
    </label>
  );
}

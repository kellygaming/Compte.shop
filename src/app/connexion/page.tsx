import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "./auth-form";

/**
 * Extension non validée par le client (authentification non designée,
 * cf. PROJET.md) — construite à la demande explicite pour rendre le
 * parcours d'achat testable de bout en bout.
 */
export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(redirectTo);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[420px] px-6 py-24">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Votre compte
        </h1>
        <p className="mb-8 text-[13.5px] text-text-tertiary">
          Nécessaire pour acheter ou vendre un compte de jeu.
        </p>
        <AuthForm next={redirectTo} />
      </main>
      <SiteFooter />
    </>
  );
}

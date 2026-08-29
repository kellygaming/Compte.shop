import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { KycForm } from "./kyc-form";

/**
 * Extension non validée par le client (formulaire de vérification
 * d'identité non designé, cf. PROJET.md) — construite à la demande
 * explicite pour permettre aux vendeurs de publier une annonce.
 */
export default async function VendrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/vendre");
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("kyc_status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (seller) {
    redirect("/tableau-de-bord");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[480px] px-6 py-24">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Devenir vendeur
        </h1>
        <p className="mb-8 text-[13.5px] leading-relaxed text-text-tertiary">
          Pièce d&apos;identité ou extrait de naissance, plus une photo de
          vous. Vos documents sont stockés de façon privée, jamais affichés
          publiquement.
        </p>
        <KycForm />
      </main>
      <SiteFooter />
    </>
  );
}

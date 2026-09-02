import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "./listing-form";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/tableau-de-bord/nouvelle-annonce");
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("kyc_status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!seller) {
    redirect("/vendre");
  }
  if (seller.kyc_status !== "verified") {
    redirect("/tableau-de-bord");
  }

  const { data: games } = await supabase
    .from("games")
    .select("slug, name")
    .order("sort_order");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <h1 className="mb-3 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Nouvelle annonce
        </h1>
        <p className="mb-8 rounded-2xl border border-border-soft bg-surface p-4 text-[12.5px] leading-relaxed text-text-tertiary">
          Rappel : la revente de compte peut être interdite par les conditions
          d&apos;utilisation de l&apos;éditeur du jeu concerné. Compte.shop n&apos;est pas partie à
          ce contrat et ne garantit pas la conformité de la vente avec les règles de
          l&apos;éditeur — voir nos{" "}
          <Link href="/conditions" target="_blank" className="text-accent hover:underline">
            conditions d&apos;utilisation
          </Link>
          .
        </p>
        <ListingForm games={games ?? []} />
      </main>
      <SiteFooter />
    </>
  );
}

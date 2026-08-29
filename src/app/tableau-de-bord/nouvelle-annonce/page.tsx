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
        <h1 className="mb-8 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Nouvelle annonce
        </h1>
        <ListingForm games={games ?? []} />
      </main>
      <SiteFooter />
    </>
  );
}

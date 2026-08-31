import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { EditListingForm } from "./edit-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/connexion?next=/tableau-de-bord/annonces/${id}`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, description, price_xof, status, seller_id, delivery_type, delivery_instructions")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.seller_id !== user.id) {
    notFound();
  }

  // Table listing_credentials sans policy RLS cliente par conception : le
  // client de session ne peut pas la lire, seul le rôle service le peut,
  // ici après avoir déjà vérifié l'appartenance de l'annonce ci-dessus.
  let existingCredentials = "";
  if (listing.delivery_type === "instant") {
    const db = createServiceClient();
    const { data: creds } = await db
      .from("listing_credentials")
      .select("credentials")
      .eq("listing_id", listing.id)
      .maybeSingle();
    existingCredentials = creds?.credentials ?? "";
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[560px] px-6 py-24">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Modifier l&apos;annonce
        </h1>
        <p className="mb-8 text-[13.5px] text-text-secondary">
          {listing.title}
        </p>

        {listing.status !== "live" ? (
          <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-text-secondary">
            Cette annonce n&apos;est plus modifiable (vendue ou retirée).
          </div>
        ) : (
          <EditListingForm
            listingId={listing.id}
            initialPriceXOF={listing.price_xof}
            initialDescription={listing.description ?? ""}
            initialDeliveryType={listing.delivery_type}
            initialDeliveryInstructions={listing.delivery_instructions ?? ""}
            initialCredentials={existingCredentials}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

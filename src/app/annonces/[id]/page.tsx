import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { formatAmount, formatRating } from "@/lib/format";
import { BuyButton } from "./buy-button";
import { ImageGallery } from "./image-gallery";

/**
 * Extension non validée par le client : la fiche d'annonce n'a pas été
 * designée (cf. PROJET.md, "Pas encore designé"). Construite ici au
 * strict nécessaire pour rendre le paiement testable, avec les tokens du
 * design existant. À soumettre au client avant de l'enrichir.
 */
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: listing }, { data: auth }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "id, title, description, price_xof, images, game_slug, status, seller_id, sellers(sales_count, rating, profiles(pseudo))",
      )
      .eq("id", id)
      .eq("status", "live")
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!listing) {
    notFound();
  }

  const seller = listing.sellers;
  const sellerPseudo = seller?.profiles?.pseudo ?? "Vendeur vérifié";
  const isOwnListing = auth.user?.id === listing.seller_id;

  let buyerPhone: string | null = null;
  if (auth.user) {
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", auth.user.id)
      .maybeSingle();
    buyerPhone = buyerProfile?.phone ?? null;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-12 pb-24 pt-12">
        <div className="mb-6 flex items-center gap-2.5 text-[13px] text-text-tertiary">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href={`/jeux/${listing.game_slug}`}>{listing.game_slug}</Link>
          <span>/</span>
          <span className="text-text">Annonce</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <ImageGallery images={listing.images} alt={listing.title} />
            <h1 className="mb-3 font-display text-[28px] font-semibold tracking-[-0.02em]">
              {listing.title}
            </h1>
            <div className="mb-6 text-[13.5px] text-text-tertiary">
              {sellerPseudo} · {seller?.sales_count ?? 0} ventes ·{" "}
              {seller?.rating ? `${formatRating(seller.rating)} ★` : "Nouveau vendeur"}
            </div>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">
              {listing.description || "Aucune description fournie."}
            </p>
          </div>

          <aside className="h-fit rounded-2xl border border-border-soft bg-surface p-6">
            <div className="mb-5 font-display text-[26px] font-semibold">
              {formatAmount(listing.price_xof)}{" "}
              <span className="text-sm font-normal text-text-secondary">
                F CFA
              </span>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-text-tertiary">
              Paiement bloqué en séquestre jusqu&apos;à confirmation. Vous
              disposez de 48 h après réception des accès pour vérifier le
              compte.
            </p>
            {isOwnListing ? (
              <div className="rounded-lg border border-border-soft px-4 py-3 text-sm text-text-secondary">
                Ceci est votre annonce.
              </div>
            ) : (
              <BuyButton
                listingId={listing.id}
                isAuthenticated={Boolean(auth.user)}
                defaultPhone={buyerPhone}
              />
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

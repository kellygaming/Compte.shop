import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { formatAmount } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  live: "En ligne",
  sold: "Vendue",
};

/**
 * Extension non validée par le client (tableau de bord vendeur non
 * designé, cf. PROJET.md) — au strict nécessaire pour publier et suivre
 * ses annonces.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?next=/tableau-de-bord");
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("kyc_status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!seller) {
    redirect("/vendre");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price_xof, status, created_at, game_slug, orders(id, status)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-12 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2 font-display text-[28px] font-semibold tracking-[-0.02em]">
              Mes annonces
            </h1>
            {seller.kyc_status !== "verified" ? (
              <p className="text-[13.5px] text-text-secondary">
                Identité en cours de vérification — vous pourrez publier une
                fois validé.
              </p>
            ) : (
              <p className="text-[13.5px] text-text-secondary">
                Identité vérifiée.
              </p>
            )}
          </div>
          {seller.kyc_status === "verified" ? (
            <Link
              href="/tableau-de-bord/nouvelle-annonce"
              className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover"
            >
              Nouvelle annonce
            </Link>
          ) : null}
        </div>

        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[18px]">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-[14px] border border-border-soft bg-surface p-5"
              >
                <div className="mb-2.5 font-mono-ui text-[10.5px] uppercase tracking-[0.04em] text-accent">
                  {STATUS_LABELS[listing.status] ?? listing.status}
                </div>
                <div className="mb-2 line-clamp-2 font-display text-base font-semibold">
                  {listing.title}
                </div>
                <div className="mb-2 text-[15px] font-semibold">
                  {formatAmount(listing.price_xof)}{" "}
                  <span className="text-xs font-normal text-text-secondary">
                    F CFA
                  </span>
                </div>
                {listing.status === "live" ? (
                  <Link
                    href={`/tableau-de-bord/annonces/${listing.id}`}
                    className="text-[12.5px] font-medium text-accent hover:underline"
                  >
                    Modifier le prix
                  </Link>
                ) : null}
                {(() => {
                  const order = listing.orders?.find((o) => o.status !== "pending_payment");
                  return order ? (
                    <Link
                      href={`/commandes/${order.id}`}
                      className="text-[12.5px] font-medium text-accent hover:underline"
                    >
                      Voir la commande / demander le versement
                    </Link>
                  ) : null;
                })()}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-border-soft bg-surface px-8 py-16 text-center text-text-secondary">
            Aucune annonce pour le moment.
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

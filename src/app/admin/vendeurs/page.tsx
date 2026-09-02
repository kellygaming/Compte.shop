import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  verified: "Vérifié",
  rejected: "Rejeté",
};

/**
 * File de vérification d'identité vendeur — remplace l'ancienne
 * auto-approbation (voir /api/sellers/kyc). Rien ne publie sans passer
 * par cette page.
 */
export default async function AdminSellersPage() {
  await requireAdmin("/admin/vendeurs");

  const db = createServiceClient();
  const { data: sellers } = await db
    .from("sellers")
    .select("profile_id, kyc_status, kyc_submitted_at, profiles(pseudo, phone)")
    .order("kyc_submitted_at", { ascending: false })
    .limit(200);

  const pending = sellers?.filter((s) => s.kyc_status === "pending") ?? [];
  const reviewed = sellers?.filter((s) => s.kyc_status !== "pending") ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Vérification vendeurs
        </h1>
        <p className="mb-8 text-[13px] text-text-tertiary">
          Un vendeur ne peut publier d&apos;annonce qu&apos;après validation manuelle de sa pièce
          d&apos;identité et de son selfie.
        </p>

        <h2 className="mb-3 font-mono-ui text-[11.5px] uppercase tracking-[0.06em] text-text-tertiary">
          En attente ({pending.length})
        </h2>
        {pending.length > 0 ? (
          <div className="mb-10 flex flex-col gap-2.5">
            {pending.map((seller) => (
              <SellerRow key={seller.profile_id} seller={seller} highlight />
            ))}
          </div>
        ) : (
          <div className="mb-10 rounded-2xl border border-border-soft bg-surface px-6 py-8 text-center text-[13px] text-text-tertiary">
            Aucun dossier en attente.
          </div>
        )}

        {reviewed.length > 0 ? (
          <details>
            <summary className="cursor-pointer text-[13px] font-medium text-text-secondary">
              Dossiers déjà traités ({reviewed.length})
            </summary>
            <div className="mt-3 flex flex-col gap-2.5">
              {reviewed.map((seller) => (
                <SellerRow key={seller.profile_id} seller={seller} />
              ))}
            </div>
          </details>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function SellerRow({
  seller,
  highlight,
}: {
  seller: {
    profile_id: string;
    kyc_status: string;
    kyc_submitted_at: string | null;
    profiles: { pseudo: string; phone: string | null } | null;
  };
  highlight?: boolean;
}) {
  return (
    <Link
      href={`/admin/vendeurs/${seller.profile_id}`}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 hover:border-border-hover ${
        highlight ? "border-accent bg-accent/5" : "border-border-soft bg-surface"
      }`}
    >
      <div>
        <div className="mb-1 font-display text-base font-semibold">
          {seller.profiles?.pseudo ?? "Vendeur"}
        </div>
        <div className="text-[12.5px] text-text-tertiary">
          {seller.profiles?.phone ?? "—"}
          {seller.kyc_submitted_at
            ? ` · ${new Date(seller.kyc_submitted_at).toLocaleString("fr-FR")}`
            : ""}
        </div>
      </div>
      <div className="text-[12.5px] font-medium text-text-secondary">
        {STATUS_LABELS[seller.kyc_status] ?? seller.kyc_status}
      </div>
    </Link>
  );
}

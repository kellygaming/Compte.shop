import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { KycReviewActions } from "./kyc-review-actions";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de vérification",
  verified: "Vérifié",
  rejected: "Rejeté",
};

// Assez court pour ne pas laisser traîner un lien valide, assez long pour
// charger la page et regarder les documents tranquillement.
const SIGNED_URL_TTL_SECONDS = 300;

async function signedDocUrl(
  db: ReturnType<typeof createServiceClient>,
  path: string | null,
) {
  if (!path) return null;
  const { data } = await db.storage.from("kyc-documents").createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export default async function AdminSellerKycPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/vendeurs/${id}`);

  const db = createServiceClient();

  const { data: seller } = await db
    .from("sellers")
    .select(
      "profile_id, kyc_status, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, id_document_path, birth_certificate_path, selfie_path, profiles(pseudo, phone)",
    )
    .eq("profile_id", id)
    .maybeSingle();

  if (!seller) {
    notFound();
  }

  const [idDocUrl, birthCertUrl, selfieUrl] = await Promise.all([
    signedDocUrl(db, seller.id_document_path),
    signedDocUrl(db, seller.birth_certificate_path),
    signedDocUrl(db, seller.selfie_path),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 font-display text-[26px] font-semibold tracking-[-0.02em]">
          {seller.profiles?.pseudo ?? "Vendeur"}
        </h1>
        <p className="mb-8 text-[13px] text-text-tertiary">
          {STATUS_LABELS[seller.kyc_status] ?? seller.kyc_status}
          {seller.profiles?.phone ? ` · ${seller.profiles.phone}` : ""}
          {seller.kyc_submitted_at
            ? ` · envoyé le ${new Date(seller.kyc_submitted_at).toLocaleString("fr-FR")}`
            : ""}
        </p>

        {seller.kyc_status === "rejected" && seller.kyc_rejection_reason ? (
          <p className="mb-6 rounded-2xl border border-border-soft bg-surface p-4 text-[13.5px] text-text-secondary">
            Raison du rejet : {seller.kyc_rejection_reason}
          </p>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DocPreview label="Pièce d'identité" url={idDocUrl} path={seller.id_document_path} />
          <DocPreview
            label="Extrait de naissance"
            url={birthCertUrl}
            path={seller.birth_certificate_path}
          />
          <DocPreview label="Selfie" url={selfieUrl} path={seller.selfie_path} />
        </div>

        {seller.kyc_status !== "pending" ? (
          <p className="mb-4 text-[13px] text-text-tertiary">
            Dossier déjà traité
            {seller.kyc_reviewed_at
              ? ` le ${new Date(seller.kyc_reviewed_at).toLocaleString("fr-FR")}`
              : ""}
            . Les boutons ci-dessous permettent de revenir sur la décision.
          </p>
        ) : null}
        <KycReviewActions profileId={seller.profile_id} />
      </main>
      <SiteFooter />
    </>
  );
}

function DocPreview({
  label,
  url,
  path,
}: {
  label: string;
  url: string | null;
  path: string | null;
}) {
  if (!path) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong p-4 text-center text-[12.5px] text-text-tertiary">
        {label}
        <br />— non fourni —
      </div>
    );
  }

  const isPdf = path.toLowerCase().endsWith(".pdf");

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <div className="border-b border-border-soft px-3 py-2 text-[11.5px] uppercase tracking-[0.04em] text-text-tertiary">
        {label}
      </div>
      {!url ? (
        <p className="p-4 text-[12.5px] text-text-tertiary">Lien indisponible.</p>
      ) : isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 text-[13px] font-medium text-accent hover:underline"
        >
          Ouvrir le PDF
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL signée temporaire (5 min), inutile de passer par next/image */}
          <img src={url} alt={label} className="aspect-square w-full object-cover" />
        </a>
      )}
    </div>
  );
}

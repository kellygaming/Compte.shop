import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Soumission KYC vendeur. Les fichiers sont déjà uploadés côté client
 * (bucket privé kyc-documents, policy propriétaire uniquement) — cette
 * route ne reçoit que les chemins et le numéro de téléphone.
 *
 * Le dossier part en statut "pending" : un admin le valide ou le rejette
 * depuis /admin/vendeurs (POST /api/admin/sellers/[id]/kyc) avant que le
 * vendeur puisse publier une annonce. Le service role est nécessaire
 * précisément parce que la policy RLS de `sellers` interdit à un client
 * de s'auto-vérifier — ne pas assouplir cette policy.
 */
export async function POST(request: Request) {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  let payload: {
    id_document_path?: string;
    birth_certificate_path?: string;
    selfie_path?: string;
    phone?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (!payload.selfie_path || (!payload.id_document_path && !payload.birth_certificate_path)) {
    return NextResponse.json(
      { error: "Pièce d'identité (ou extrait de naissance) et photo requises." },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  const { data: existing } = await db
    .from("sellers")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Un dossier vendeur existe déjà pour ce compte." },
      { status: 409 },
    );
  }

  if (payload.phone) {
    await db.from("profiles").update({ phone: payload.phone }).eq("id", user.id);
  }

  const { error: insertError } = await db.from("sellers").insert({
    profile_id: user.id,
    id_document_path: payload.id_document_path,
    birth_certificate_path: payload.birth_certificate_path,
    selfie_path: payload.selfie_path,
    kyc_submitted_at: new Date().toISOString(),
    kyc_status: "pending",
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Impossible de créer le dossier vendeur." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

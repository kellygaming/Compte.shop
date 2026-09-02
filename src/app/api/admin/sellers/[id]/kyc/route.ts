import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Validation/rejet manuel d'un dossier KYC vendeur — remplace l'ancienne
 * auto-approbation. Un dossier ne devient "verified" (et le vendeur ne
 * peut publier d'annonce) qu'après ce passage humain.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;

  let payload: { action?: "approve" | "reject"; reason?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const db = createServiceClient();

  if (payload.action === "approve") {
    const { error } = await db
      .from("sellers")
      .update({
        kyc_status: "verified",
        kyc_reviewed_at: new Date().toISOString(),
        kyc_rejection_reason: null,
      })
      .eq("profile_id", id);
    if (error) {
      return NextResponse.json({ error: "Échec de la validation." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (payload.action === "reject") {
    const reason = payload.reason?.trim();
    if (!reason) {
      return NextResponse.json({ error: "Indiquez la raison du rejet." }, { status: 400 });
    }
    const { error } = await db
      .from("sellers")
      .update({
        kyc_status: "rejected",
        kyc_reviewed_at: new Date().toISOString(),
        kyc_rejection_reason: reason,
      })
      .eq("profile_id", id);
    if (error) {
      return NextResponse.json({ error: "Échec du rejet." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}

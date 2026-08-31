import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { reconcilePendingOrder } from "@/lib/orders";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Déclenchement manuel de la réconciliation MoneyFusion pour une
 * commande précise, depuis le tableau de bord admin — utile quand un
 * acheteur signale un paiement non pris en compte avant que le polling
 * automatique (/api/orders/[id]) ou la tâche planifiée ne repasse.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { id } = await params;
  await reconcilePendingOrder(id);

  const db = createServiceClient();
  const { data: order } = await db.from("orders").select("status").eq("id", id).maybeSingle();

  return NextResponse.json({ status: order?.status ?? null });
}

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { confirmOrderPaid } from "@/lib/orders";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Confirmation manuelle par un admin qu'une commande a bien été payée,
 * pour les commandes créées avant que le token MoneyFusion soit
 * enregistré (donc que reconcilePendingOrder ne peut pas vérifier), ou
 * si l'API de statut MoneyFusion est elle-même indisponible. À utiliser
 * seulement après vérification du paiement côté tableau de bord
 * MoneyFusion — ceci ne revérifie rien, ça fait confiance à l'admin.
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
  const db = createServiceClient();
  const applied = await confirmOrderPaid(db, id, null);

  if (!applied) {
    return NextResponse.json(
      { error: "Commande introuvable ou pas en attente de paiement." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

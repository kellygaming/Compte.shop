import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { confirmOrderPaid } from "@/lib/orders";
import type { MoneyFusionWebhookPayload } from "@/lib/moneyfusion";

/**
 * Webhook MoneyFusion — confirmation de paiement.
 *
 * MoneyFusion ne signe pas ce webhook (ni header, ni secret partagé dans
 * le payload : confirmé sur l'intégration réelle de kelly-gaming, qui a
 * déjà subi une livraison frauduleuse pour cette raison). En l'absence de
 * signature, on empile trois protections :
 *
 * 1. Chemin du webhook non devinable (segment secret dans l'URL).
 * 2. order_id relié à une vraie commande `pending_payment` déjà créée par
 *    un acheteur authentifié — le montant vient de notre base, jamais du
 *    payload MoneyFusion.
 * 3. Transition d'état atomique et idempotente (`status = pending_payment`
 *    en garde de l'UPDATE, dans confirmOrderPaid) : un rejeu du webhook
 *    ne peut pas repasser une commande déjà traitée.
 *
 * Ce webhook n'est de toute façon pas fiable à 100% en pratique (déjà
 * observé absent) : /api/orders/[id] et la tâche planifiée réconcilient
 * en parallèle via l'API de statut MoneyFusion — voir
 * src/lib/orders.ts. confirmOrderPaid() est le seul endroit qui fait la
 * transition, pour que les deux chemins restent cohérents.
 *
 * On répond systématiquement 200 (sauf secret invalide) pour éviter les
 * tempêtes de retry côté MoneyFusion, sans jamais exécuter la transition
 * si une vérification échoue.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ secret: string }> },
) {
  const { secret } = await params;
  const expected = process.env.MONEYFUSION_WEBHOOK_SECRET_PATH;

  if (!expected || !constantTimeEquals(secret, expected)) {
    // 404 plutôt que 401/403 : ne pas confirmer que l'endpoint existe.
    return new NextResponse(null, { status: 404 });
  }

  let payload: MoneyFusionWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (payload.event !== "payin.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const orderId = payload.personal_Info?.[0]?.order_id;
  const transactionId = payload.transaction_id;
  if (!orderId || !transactionId) {
    return NextResponse.json({ ok: true });
  }

  const db = createServiceClient();
  await confirmOrderPaid(db, orderId, transactionId, payload);

  return NextResponse.json({ ok: true });
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

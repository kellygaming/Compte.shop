import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
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
 *    en garde de l'UPDATE) : un rejeu du webhook ne peut pas repasser une
 *    commande déjà traitée.
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

  const { data: heldOrders } = await db
    .from("orders")
    .update({ status: "held" })
    .eq("id", orderId)
    .eq("status", "pending_payment")
    .select("id");

  if (heldOrders && heldOrders.length > 0) {
    await db
      .from("payment_transactions")
      .update({
        status: "success",
        provider_reference: transactionId,
        raw_payload: payload,
      })
      .eq("order_id", orderId)
      .eq("status", "pending");
  }
  // heldOrders vide = commande inconnue, déjà traitée, ou hors séquence :
  // no-op silencieux, c'est la protection contre le rejeu et la fraude.

  return NextResponse.json({ ok: true });
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

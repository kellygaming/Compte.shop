import { NextResponse } from "next/server";
import { releaseExpiredOrders, reconcileStalePendingOrders } from "@/lib/orders";

/**
 * Filet de sécurité quotidien pour deux cas où personne n'a rouvert la
 * page à temps :
 * - commandes dont le délai (versement ou remboursement) a expiré sans
 *   qu'aucune lecture ne l'ait déjà déclenché (releaseExpiredOrders
 *   tourne aussi paresseusement à chaque lecture d'une commande) ;
 * - commandes restées pending_payment parce que l'acheteur a payé puis
 *   fermé l'onglet avant que /api/orders/[id] ne réconcilie avec
 *   MoneyFusion (reconcileStalePendingOrders — le webhook n'est pas
 *   fiable à 100%, voir src/lib/orders.ts).
 * Vercel signe ses appels cron avec ce header ; en local, protégé par
 * CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  await reconcileStalePendingOrders();
  await releaseExpiredOrders();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { releaseExpiredOrders } from "@/lib/orders";

/**
 * Filet de sécurité pour les commandes dont personne n'a rouvert la
 * page après les 48 h (le versement se déclenche aussi paresseusement
 * à chaque lecture d'une commande, voir src/lib/orders.ts). Vercel
 * signe ses appels cron avec ce header ; en local, protégé par
 * CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  await releaseExpiredOrders();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { initiateMoneyFusionPayment } from "@/lib/moneyfusion";

/**
 * Crée une commande en séquestre pour une annonce et initie le paiement
 * MoneyFusion. Le prix vient toujours de l'annonce en base, jamais du
 * corps de la requête — un client ne peut pas se fixer son propre prix.
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
    listing_id?: string;
    numero_send?: string;
    nomclient?: string;
    email?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const listingId = payload.listing_id;
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "listing_id requis." }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: listing, error: listingError } = await db
    .from("listings")
    .select("id, title, price_xof, status, seller_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  }
  if (listing.status !== "live") {
    return NextResponse.json(
      { error: "Cette annonce n'est plus disponible à l'achat." },
      { status: 409 },
    );
  }
  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas acheter votre propre annonce." },
      { status: 400 },
    );
  }

  const { data: profile } = await db
    .from("profiles")
    .select("pseudo, phone")
    .eq("id", user.id)
    .maybeSingle();

  const numeroSend = payload.numero_send || profile?.phone;
  const nomClient = payload.nomclient || profile?.pseudo || "Client Compte.shop";
  if (!numeroSend) {
    return NextResponse.json(
      { error: "Un numéro de téléphone est requis pour payer." },
      { status: 400 },
    );
  }

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      amount_xof: listing.price_xof,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Impossible de créer la commande." },
      { status: 500 },
    );
  }

  const { error: paymentRowError } = await db.from("payment_transactions").insert({
    order_id: order.id,
    buyer_id: user.id,
    provider: "moneyfusion",
    status: "pending",
    amount_xof: listing.price_xof,
  });

  if (paymentRowError) {
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement." },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;
  const webhookSecret = process.env.MONEYFUSION_WEBHOOK_SECRET_PATH;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Configuration de paiement incomplète." },
      { status: 500 },
    );
  }

  try {
    const { paymentUrl, token } = await initiateMoneyFusionPayment({
      totalPriceXOF: listing.price_xof,
      article: [{ [listing.title]: listing.price_xof }],
      numeroSend,
      nomClient,
      email: payload.email || user.email,
      personalInfo: { order_id: order.id },
      returnUrl: `${origin}/commandes/${order.id}`,
      webhookUrl: `${origin}/api/webhooks/moneyfusion/${webhookSecret}`,
    });

    if (token) {
      // Filet de sécurité si le webhook n'arrive jamais — voir
      // reconcilePendingOrder dans src/lib/orders.ts.
      await db
        .from("payment_transactions")
        .update({ provider_token: token })
        .eq("order_id", order.id);
    }

    return NextResponse.json({ orderId: order.id, paymentUrl });
  } catch (err) {
    console.error(
      "Échec initiation MoneyFusion pour la commande",
      order.id,
      err instanceof Error ? err.message : err,
    );
    await db
      .from("payment_transactions")
      .update({ status: "failed" })
      .eq("order_id", order.id);

    return NextResponse.json(
      { error: "Le paiement n'a pas pu être initié. Réessayez." },
      { status: 502 },
    );
  }
}

import "server-only";

/**
 * Client MoneyFusion (doc FusionPay : https://docs.moneyfusion.net/fr/webapi).
 * - L'URL d'API elle-même identifie le marchand ; elle est fournie telle
 *   quelle par le tableau de bord, pas un token à insérer dans un gabarit.
 * - La réponse d'initiation ne contient qu'un lien de paiement ; l'API ne
 *   renvoie ni transaction_id ni signature à ce stade — ceux-ci arrivent
 *   plus tard, uniquement via le webhook.
 * - Le webhook n'est PAS signé. Voir src/app/api/webhooks/moneyfusion/
 *   pour les protections appliquées à défaut (catalogue + idempotence).
 */

type MoneyFusionArticle = Record<string, number>;

export type InitiatePaymentInput = {
  totalPriceXOF: number;
  article: MoneyFusionArticle[];
  numeroSend: string;
  nomClient: string;
  email?: string;
  personalInfo: Record<string, string>;
  returnUrl: string;
  webhookUrl: string;
};

type MoneyFusionPayResponse = {
  statut: boolean;
  url?: string;
  message?: string;
};

export type MoneyFusionWebhookPayload = {
  event: string;
  transaction_id: string;
  personal_Info?: Array<Record<string, string>>;
};

function getPayEndpoint(): string {
  // Malgré son nom, cette variable contient l'URL d'API complète fournie
  // par le tableau de bord MoneyFusion (ex.
  // https://pay.moneyfusion.net/E_commerce/<identifiant>/pay/), pas un
  // simple identifiant à insérer dans un gabarit — la doc FusionPay est
  // explicite là-dessus ("Obtenez ceci depuis votre tableau de bord").
  const endpoint = process.env.MONEYFUSION_MERCHANT_TOKEN;
  if (!endpoint) {
    throw new Error("MONEYFUSION_MERCHANT_TOKEN manquant côté serveur.");
  }
  return endpoint;
}

export async function initiateMoneyFusionPayment(
  input: InitiatePaymentInput,
): Promise<{ paymentUrl: string }> {
  const endpoint = getPayEndpoint();

  const body = {
    totalPrice: input.totalPriceXOF,
    article: input.article,
    numeroSend: input.numeroSend,
    nomclient: input.nomClient,
    email: input.email,
    personal_Info: [input.personalInfo],
    return_url: input.returnUrl,
    webhook_url: input.webhookUrl,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error(
      `MoneyFusion ${response.status} sur ${endpoint} — body envoyé: ${JSON.stringify(body)} — réponse: ${rawText}`,
    );
    throw new Error(
      `MoneyFusion a répondu ${response.status} à l'initiation du paiement.`,
    );
  }

  let data: MoneyFusionPayResponse;
  try {
    data = JSON.parse(rawText) as MoneyFusionPayResponse;
  } catch {
    console.error(`MoneyFusion a renvoyé une réponse non-JSON: ${rawText}`);
    throw new Error("MoneyFusion a renvoyé une réponse invalide.");
  }

  if (!data.statut || !data.url) {
    console.error(
      `MoneyFusion statut=${data.statut} sans url — body envoyé: ${JSON.stringify(body)} — réponse: ${rawText}`,
    );
    throw new Error(
      data.message ?? "MoneyFusion n'a pas renvoyé de lien de paiement.",
    );
  }

  return { paymentUrl: data.url };
}

import "server-only";

/**
 * Client MoneyFusion. Contrat observé sur l'intégration réelle de
 * kelly-gaming (aucune doc publique fiable) :
 * - Le marchand est identifié dans l'URL, pas dans un header.
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

function getMerchantToken(): string {
  const token = process.env.MONEYFUSION_MERCHANT_TOKEN;
  if (!token) {
    throw new Error("MONEYFUSION_MERCHANT_TOKEN manquant côté serveur.");
  }
  return token;
}

export async function initiateMoneyFusionPayment(
  input: InitiatePaymentInput,
): Promise<{ paymentUrl: string }> {
  const token = getMerchantToken();
  const endpoint = `https://pay.moneyfusion.net/E_commerce/${token}/pay/`;

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

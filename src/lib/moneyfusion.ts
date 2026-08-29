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

  if (!response.ok) {
    throw new Error(
      `MoneyFusion a répondu ${response.status} à l'initiation du paiement.`,
    );
  }

  const data = (await response.json()) as MoneyFusionPayResponse;

  if (!data.statut || !data.url) {
    throw new Error(
      data.message ?? "MoneyFusion n'a pas renvoyé de lien de paiement.",
    );
  }

  return { paymentUrl: data.url };
}

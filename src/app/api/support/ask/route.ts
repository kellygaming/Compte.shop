import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shortOrderRef } from "@/lib/format";

/**
 * Assistant de support propulsé par DeepSeek (API compatible OpenAI).
 * Répond en français, simplement, sur le fonctionnement réel du site —
 * pas un chatbot générique : le prompt système décrit les vrais parcours
 * (achat, séquestre, discussion acheteur-vendeur, versement, litiges) ET
 * reçoit les vraies commandes de l'utilisateur connecté (buildOrdersContext
 * ci-dessous), pour répondre sur SON achat précis sans que l'opérateur
 * (souvent indisponible) ait à intervenir.
 *
 * DEEPSEEK_API_KEY doit être défini côté Vercel — sans elle, on répond
 * une erreur claire plutôt que de planter.
 */
const SYSTEM_PROMPT = `Tu es l'assistant de support de Compte.shop, un marché pour acheter et vendre des comptes de jeu (Fortnite, Free Fire, Brawl Stars, Roblox) en F CFA, avec paiement Mobile Money.

Réponds toujours en français, de façon simple et courte (2-4 phrases), sans jargon technique. Le public n'est pas familier avec l'informatique.

Comment le site fonctionne réellement :
- Achat : l'acheteur paie via Mobile Money, l'argent est bloqué en séquestre. Selon l'annonce, le vendeur transmet le compte instantanément (email + mot de passe automatique) ou doit être présent (remise manuelle).
- Discussion : chaque commande a une discussion entre l'acheteur et le vendeur, visible sur la page de la commande (/commandes/...), dès que le paiement est confirmé. C'est là qu'on écrit au vendeur ou à l'acheteur, qu'on demande les accès en remise manuelle, etc.
- Confirmation : une fois le compte reçu et vérifié, l'acheteur clique "J'ai reçu mon compte, tout est ok" (ou "Reçu, tout est ok") sur la page de la commande.
- Litige : si problème, le bouton "Appeler un admin" est sur la page de la commande, sous la discussion. Ça prévient un administrateur qui vient trancher.
- Versement vendeur : une fois la vente confirmée par l'acheteur, le vendeur va sur la page de sa commande (accessible depuis "Mes annonces" dans le tableau de bord), indique son numéro Mobile Money avec l'indicatif du pays, et clique "Demander mon versement". Le versement peut prendre jusqu'à 24h.
- Mes achats / Mes annonces : dans l'en-tête du site, un acheteur retrouve ses achats sous "Mes achats", un vendeur ses annonces sous "Mes annonces".
- Chaque commande a une référence courte affichée sur sa page (ex: "N° commande #A1B2C3D4"), qui correspond à celles listées ci-dessous.
- Si on te demande si acheter/vendre un compte est légal ou risqué : ce n'est pas illégal, mais ça peut violer les conditions d'utilisation propres à l'éditeur du jeu, qui peut bannir ou récupérer le compte à tout moment après le transfert — Compte.shop n'y peut rien une fois la commande livrée et confirmée. Renvoie vers /conditions pour le détail complet plutôt que d'improviser une réponse juridique.

Tu reçois ci-dessous la liste réelle des achats et ventes de la personne à qui tu parles en ce moment — utilise-la en priorité pour répondre à toute question sur "mon achat", "ma commande", "mon paiement", "mon versement", etc. Ne devine et n'invente jamais un statut : reprends exactement celui donné. Si la personne cite une référence (#XXXXXXXX), retrouve-la dans la liste. Si sa question porte sur une commande absente de la liste ou que la situation nécessite une décision humaine (litige non résolu, erreur suspecte), dis-le clairement et oriente-la vers le bouton "Appeler un admin" sur la page de la commande concernée, plutôt que de deviner.

Si la question ne concerne pas Compte.shop, dis poliment que tu ne peux aider que sur l'utilisation du site.`;

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "paiement en attente",
  held: "payée, argent en séquestre",
  released: "terminée, vendeur payé",
  refunded: "remboursée",
  disputed: "en litige",
  cancelled: "annulée",
};

type OrderForContext = {
  id: string;
  status: string;
  amount_xof: number;
  created_at: string;
  payout_requested_at?: string | null;
  paid_out_at?: string | null;
  listings: { title: string } | { title: string }[] | null;
};

function formatOrderLine(order: OrderForContext, asSeller: boolean) {
  const listing = Array.isArray(order.listings) ? order.listings[0] : order.listings;
  const title = listing?.title ?? "annonce supprimée";
  const status = ORDER_STATUS_LABELS[order.status] ?? order.status;
  const date = new Date(order.created_at).toLocaleDateString("fr-FR");
  let extra = "";
  if (asSeller) {
    if (order.paid_out_at) extra = " (versement déjà effectué)";
    else if (order.payout_requested_at) extra = " (versement demandé, en attente sous 24h)";
  }
  return `#${shortOrderRef(order.id)} — "${title}" — ${order.amount_xof} F CFA — ${date} — statut : ${status}${extra} — /commandes/${order.id}`;
}

async function buildOrdersContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const [{ data: buyerOrders }, { data: sellerOrders }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, amount_xof, created_at, listings(title)")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("id, status, amount_xof, created_at, payout_requested_at, paid_out_at, listings(title)")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  let context = "";
  context +=
    buyerOrders && buyerOrders.length > 0
      ? `\n\nSes achats récents (le plus récent en premier) :\n${buyerOrders
          .map((o) => formatOrderLine(o as OrderForContext, false))
          .join("\n")}`
      : "\n\nElle n'a fait aucun achat pour l'instant.";

  if (sellerOrders && sellerOrders.length > 0) {
    context += `\n\nSes ventes récentes en tant que vendeur :\n${sellerOrders
      .map((o) => formatOrderLine(o as OrderForContext, true))
      .join("\n")}`;
  }

  return context;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "L'assistant n'est pas encore configuré." },
      { status: 503 },
    );
  }

  let payload: { question?: string; history?: Array<{ role: string; content: string }> };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const question = payload.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "Question vide." }, { status: 400 });
  }

  // Historique borné : coûte de l'argent réel sur la clé DeepSeek de
  // l'opérateur, pas de raison de laisser grossir indéfiniment.
  const history = (payload.history ?? []).slice(-8).filter(
    (m): m is { role: "user" | "assistant"; content: string } =>
      (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
  );

  try {
    const ordersContext = await buildOrdersContext(supabase, user.id);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + ordersContext },
          ...history,
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek ${response.status} — ${errorText}`);
      return NextResponse.json(
        { error: "L'assistant n'a pas pu répondre, réessayez." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "L'assistant n'a pas pu répondre, réessayez." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Échec de l'appel DeepSeek", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "L'assistant n'a pas pu répondre, réessayez." },
      { status: 502 },
    );
  }
}

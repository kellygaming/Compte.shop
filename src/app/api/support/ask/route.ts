import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Assistant de support propulsé par DeepSeek (API compatible OpenAI).
 * Répond en français, simplement, sur le fonctionnement réel du site —
 * pas un chatbot générique : le prompt système décrit les vrais parcours
 * (achat, séquestre, discussion acheteur-vendeur, versement, litiges).
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

Si la question ne concerne pas Compte.shop, dis poliment que tu ne peux aider que sur l'utilisation du site.`;

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
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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

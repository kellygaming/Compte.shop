# Compte.shop

Marché ouvert et vérifié pour l'achat et la vente de comptes de jeu entre
joueurs (Fortnite, Free Fire, Brawl Stars, Roblox au lancement), pensé pour
un public majoritairement mobile en Afrique de l'Ouest francophone, prix en
francs CFA (XOF).

Le contexte produit complet (règles métier, contraintes, périmètre) vit dans
`PROJET.md`. Ce document prime sur toute décision technique en cas de doute.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, polices Space Grotesk
(titres) et JetBrains Mono (labels/eyebrows) via `next/font`.

## Démarrer

```bash
npm install
npm run dev
```

## État actuel

Deux écrans implémentés fidèlement au design fourni dans
`design_handoff_compte_shop/` :

- **Accueil** (`/`) — hero + carrousel, bande de confiance, catégories,
  protection anti-arnaque + frise du séquestre, support, devenir vendeur.
- **Catégorie / listing** (`/jeux/[slug]`) — filtres, grille d'annonces.

Les données (jeux, annonces) sont factices et centralisées dans
`src/lib/data.ts`, en attendant une vraie API — les composants ne
contiennent aucune donnée en dur.

Écrans **non designés et non implémentés** (fiche d'annonce, tunnel d'achat,
KYC vendeur, tableau de bord vendeur, messagerie, back-office, auth) : voir
`PROJET.md` avant de les construire.

## Structure

```
src/
  app/
    page.tsx              accueil
    jeux/[slug]/page.tsx   listing par jeu
  components/              header, footer, carrousel, cartes, sections
  lib/
    types.ts               modèles (Game, Listing, FilterGroup)
    data.ts                 couche de données factice (à remplacer par l'API)
    content.ts              copie éditoriale fixe (protection, étapes)
    format.ts               formatage F CFA
```

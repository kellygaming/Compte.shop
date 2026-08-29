# Handoff : Compte.shop — marketplace de comptes de jeu

## Ce que contient ce dossier

- `design/Compte.shop.dc.html` — le prototype de design (HTML + JS, ouvrable directement dans un navigateur).
- `design/support.js` — runtime nécessaire pour ouvrir le prototype localement.
- `design/uploads/` — les 4 visuels de jeu fournis par le client.
- `PROJET.md` — **à lire en premier** : le contexte produit, les règles métier et les limites du projet.

## Nature des fichiers

Les fichiers HTML de ce dossier sont des **références de design**, pas du code de production.
Le prototype montre l'apparence et le comportement attendus. Le travail consiste à **recréer ces écrans
dans l'environnement cible** (Next.js / React, Vue, Laravel + Blade, etc.) avec ses conventions et sa
librairie de composants. S'il n'existe pas encore de codebase, choisir la stack la plus adaptée
(recommandation : Next.js + TypeScript + Tailwind, base Postgres, stockage S3-compatible pour les
images et les pièces d'identité) et implémenter les designs dedans.

Ne pas copier le HTML tel quel : styles inline, données factices en dur et pseudo-routing par état
local sont des artefacts du prototype.

## Fidélité

**Haute fidélité (hifi).** Couleurs, typographies, espacements, rayons, ombres et micro-interactions
sont définitifs. À reproduire fidèlement. Les données (annonces, prix, pseudos, compteurs) sont
factices et doivent venir de l'API.

---

## Écrans

### 1. Accueil (`view === 'home'`)

Largeur de contenu max **1240 px**, centrée, fond `#0E1013`.

**En-tête (sticky, z-index 20)**
- `display:flex; justify-content:space-between; align-items:center; gap:clamp(14px,2.4vw,32px); padding:18px clamp(16px,4vw,48px)`
- Fond `rgba(14,16,19,0.82)` + `backdrop-filter:blur(14px)`, bordure basse `1px solid rgba(255,255,255,0.07)`
- Logo : carré 26×26, `border-radius:7px`, fond accent, lettre « C » en Space Grotesk 700 / 15px, couleur `#0E1013` ; à droite « Compte.shop » Space Grotesk 600 / 18px, `letter-spacing:-0.01em`
- Nav (14px, `#9AA0A6`, hover `#EDEAE4`) : Catégories · Vendre un compte · Protection · Support — `white-space:nowrap; min-width:0; overflow:hidden` (l'en-tête doit se comprimer, jamais déborder)
- Boutons (bloc `flex-shrink:0; white-space:nowrap`) : « Se connecter » (fond transparent, bordure `rgba(255,255,255,0.14)`, radius 9, padding 9/18, 13.5px) et « Devenir vendeur » (fond accent, texte `#0E1013`, 600, radius 9, padding 10/18)

**Hero** — grille `1.05fr 0.95fr`, `gap:72px`, `padding:110px 48px 84px`
- Pastille : bordure `rgba(255,255,255,0.12)`, radius 100px, JetBrains Mono 11.5px uppercase `letter-spacing:0.06em`, point accent 6×6 — « Marché ouvert & vérifié »
- H1 Space Grotesk 600 / **60px** / `line-height:1.04` / `letter-spacing:-0.03em` : « Reprenez votre compte là où vous l'avez laissé. »
- Paragraphe 17.5px / 1.6 / `#9AA0A6`, max 520px
- Barre de recherche : conteneur `#15181C`, bordure `rgba(255,255,255,0.12)`, radius 13, padding 8 ; préfixe « ↳ » mono 12px `#6E747A` ; input transparent 15px ; bouton accent « Explorer » (radius 9, padding 12/22)
- Preuves sociales : 13.5px `#6E747A`, `gap:28px` — « 1 480 comptes vendus », « Note moyenne 4,8 / 5 », « Support 24 h / 24 »
- **Carte carrousel** (colonne droite) : `#15181C`, bordure `rgba(255,255,255,0.1)`, radius 18, padding 22, `box-shadow:0 30px 80px -40px rgba(0,0,0,0.9)`
  - Ligne haute : « ANNONCE VÉRIFIÉE » (mono 11px uppercase) + badge « Séquestre actif » (accent, bordure `oklch(0.82 0.11 158 / 0.35)`, radius 100px)
  - Zone média 230px, radius 12, `overflow:hidden` : image en `background-size:cover; background-position:center`, `transition:opacity 380ms ease`
  - Dégradé bas : `linear-gradient(to top, rgba(14,16,19,0.92), transparent)` sur 88px
  - Puces : 4 barres 22×4 radius 100px — active accent, inactive `rgba(255,255,255,0.28)` ; cliquables
  - Flèches ‹ › : 28×28, radius 8, fond `rgba(14,16,19,0.72)`, bordure `rgba(255,255,255,0.16)`
  - Pied de carte : titre Space Grotesk 600 / 19px (fade synchronisé), sous-ligne 13px `#6E747A` « Vendeur ID vérifié · N ventes · X ★ », prix Space Grotesk 600 / 22px + « F CFA » 13px `#9AA0A6`, `white-space:nowrap`

**Bande de confiance** (prop `showTrustStrip`) — fond `#111418`, bordures haute/basse, grille 4 colonnes, 13.5px `#9AA0A6` : séquestre · vendeurs vérifiés par pièce d'identité · remboursement 48 h · historique et notes publiques

**Catégories** — eyebrow mono « 01 — CATÉGORIES », H2 36px ; lien « Tout voir → » accent
- Grille `repeat(auto-fit, minmax(240px,1fr))`, `gap:18px` (ne jamais figer 3 ou 4 colonnes)
- Carte : `#15181C`, bordure `rgba(255,255,255,0.1)` → hover `rgba(255,255,255,0.26)`, radius 16, `overflow:hidden`
- Média 170px en `background-image` cover ; corps `padding:18px 20px 20px`, colonne `gap:7px` : nom Space Grotesk 600 / 18.5px `nowrap`, puis ligne 13px « À partir de X F CFA · N annonces » (chaque segment `nowrap`)
- Clic → vue listing du jeu

**Protection anti-arnaque** (`id="protection"`) — eyebrow « 02 — SÉCURITÉ », H2 36px « Voici comment nous vous protégeons des arnaques », chapeau 16.5px max 640px
- Grille 2 colonnes, `gap:18px`, 6 cartes (`#15181C`, radius 14, padding 26/26/28) : numéro mono accent, titre Space Grotesk 600 / 19px, corps 14.5px / 1.6 `#9AA0A6`
- Frise « LE DÉROULÉ D'UN ACHAT » (prop `showEscrowTimeline`) : bloc `#111418`, radius 14, grille 4 colonnes, chaque étape avec `border-top:1px solid rgba(255,255,255,0.14)`

**Support 24/7** (`id="support"`) — fond `#111418`, grille `1fr 0.9fr`, `gap:72px`, `padding:80px 48px`
- Colonne gauche : eyebrow « 03 — SUPPORT », H2 34px, paragraphe, 2 boutons (accent « Ouvrir le chat » + secondaire portant le contact, prop `supportContact`, valeur actuelle « WhatsApp +225 0173507682 »)
- Colonne droite : carte de chat — point accent + « Équipe en ligne — 3 conseillers disponibles », bulle entrante `#1C2026` radius `12 12 12 4`, bulle sortante accent texte `#0E1013` radius `12 12 4 12`, pied mono « Temps de réponse moyen · 6 min »

**Devenir vendeur** (`id="vendre"`) — grille `0.95fr 1.05fr`, eyebrow « 04 — VENDRE », H2 34px « Un marché ouvert, mais pas anonyme », CTA accent ; colonne droite : 4 étapes en cartes (numéro mono accent + titre 17.5px + corps 14px)

**Pied de page** — fond `#111418`, grille `1.4fr 1fr 1fr 1fr`, `gap:48px`, `padding:64px 48px 40px` ; bloc marque + pitch 13.5px ; 3 colonnes de liens (labels mono 11px uppercase) ; barre basse 12.5px `#6E747A` : « © 2026 Compte.shop » / « Prix affichés en francs CFA (XOF) »

### 2. Catégorie / listing (`view === 'listing'`)

- `padding:48px 48px 96px`, max 1240px
- Fil d'Ariane 13px : « Accueil / <Jeu> »
- Titre « Comptes <Jeu> » Space Grotesk 600 / 38px + sous-titre « N annonces vérifiées · paiement en séquestre sur chaque achat »
- Onglets jeux à droite : pilules radius 100px, bordure `rgba(255,255,255,0.14)`, 13.5px
- Corps : grille `240px 1fr`, `gap:32px`
  - Sidebar `#15181C`, radius 14, padding 22, `position:sticky; top:110px` — 3 groupes de filtres (Prix F CFA, Plateforme, Vendeur) avec cases 14×14 radius 4 ; note de bas de bloc « Seuls les vendeurs dont l'identité est validée peuvent publier. »
  - Grille d'annonces `repeat(auto-fit, minmax(230px,1fr))`, `gap:18px` — carte : média 150px cover + badge « VÉRIFIÉ » (mono 10.5px, accent, fond `rgba(14,16,19,0.75)`) ; titre 16px / 1.3 ; ligne vendeur 12.5px `#6E747A` ; ligne prix `flex-wrap:wrap; gap:8px` avec prix 18px `nowrap` et « Voir → » accent `nowrap`

---

## Interactions & comportement

- **Navigation** : le prototype simule le routing par état (`view`, `game`) et remonte en haut à chaque changement. En production : `/` pour l'accueil, `/jeux/<slug>` pour le listing, `/annonces/<id>` pour la fiche (à créer).
- **Carrousel hero** : avance automatique toutes les **4200 ms**, ordre Fortnite → Free Fire → Brawl Stars → Roblox. Transition : `opacity` 0 pendant 260 ms puis changement de slide et retour à 1 (`transition:opacity 380ms ease`). Flèches et puces réinitialisent le minuteur. Nettoyer `setInterval`/`setTimeout` au démontage. Respecter `prefers-reduced-motion` (pas d'auto-play).
- **Liens de nav** : « Vendre un compte », « Protection », « Support » font défiler vers les ancres `#vendre`, `#protection`, `#support` avec un décalage de 80 px (hauteur de l'en-tête sticky).
- **Hover** : cartes → bordure `rgba(255,255,255,0.26)` ; boutons accent → `oklch(0.88 0.1 158)` ; boutons secondaires → bordure `rgba(255,255,255,0.32-0.4)` ; nav → texte `#EDEAE4`.
- **Règle de layout à ne pas casser** : aucune grille de cartes en colonnes fixes (toujours `auto-fit`/`minmax`), prix et libellés monétaires en `white-space:nowrap`, en-tête compressible (`clamp()` sur padding et gaps). Ces trois points ont été des bugs corrigés.
- **États manquants à concevoir côté dev** : chargement (squelettes aux dimensions des cartes), vide (« aucune annonce pour ce jeu »), erreur, pagination ou scroll infini au-delà de 9 annonces.

## État & données

État du prototype : `view`, `game`, `hero` (index du carrousel), `heroFade`.
En production, remplacer par : route courante, filtres d'URL (`?prix=`, `?plateforme=`, `?note=`), et données serveur.

Modèles minimaux attendus :
- `Game { slug, name, image, listingCount, minPrice }`
- `Listing { id, gameSlug, title, description, priceXOF, images[], status: draft|pending|live|sold, sellerId, createdAt }`
- `Seller { id, pseudo, kycStatus: pending|verified|rejected, idDocument, birthCertificate, selfie, salesCount, rating, disputes }`
- `Order { id, listingId, buyerId, amountXOF, escrowStatus: held|released|refunded, deliveredAt, confirmDeadline (48 h) }`

## Design tokens

**Couleurs**
| Rôle | Valeur |
| --- | --- |
| Fond page | `#0E1013` |
| Surface / carte | `#15181C` |
| Surface alternée (bandes) | `#111418` |
| Média vide | `#101317` |
| Bulle entrante | `#1C2026` |
| Texte principal | `#EDEAE4` |
| Texte secondaire | `#9AA0A6` |
| Texte tertiaire | `#6E747A` |
| Texte liste (filtres) | `#C7C9CC` |
| Accent | `oklch(0.82 0.11 158)` (vert menthe) |
| Accent hover | `oklch(0.88 0.1 158)` |
| Accent bordure | `oklch(0.82 0.11 158 / 0.35)` |
| Bordures | `rgba(255,255,255,0.07)` / `0.1` / `0.14` / `0.26` (hover) |

Un seul accent sur tout le site. Pas de second accent, pas de dégradé décoratif.

**Typographie**
- Titres, prix, nav-logo : **Space Grotesk** 400/500/600/700
- Corps de texte : **Helvetica Neue, Helvetica, Arial, sans-serif**
- Eyebrows, badges, micro-labels : **JetBrains Mono** 400/500, uppercase, `letter-spacing:0.06–0.08em`
- Échelle : 60 / 38 / 36 / 34 / 22 / 19 / 18.5 / 17.5 / 16.5 / 15 / 14.5 / 14 / 13.5 / 12.5 / 11.5 / 11 px
- `text-wrap:pretty` sur les paragraphes

**Espacement** — 4 / 7 / 8 / 10 / 12 / 14 / 18 / 22 / 26 / 32 / 36 / 48 / 72 / 96 / 110 px ; sections en `padding:96px 48px` ; contenu max 1240 px

**Rayons** — 4 (case) / 7 (logo) / 8–9 (boutons, flèches) / 10 / 12 / 13 / 14 / 16 / 18 (cartes) / 100px (pilules)

**Ombre** — carte hero : `0 30px 80px -40px rgba(0,0,0,0.9)`

**Transition** — `opacity 380ms ease` (carrousel) ; hovers instantanés ou ≤ 150 ms

## Assets

Fournis par le client, dans `design/uploads/` :
`fortinite.jpg` (1920×1080), `free fire.webp` (1920×1080), `brawl-stars-banner.webp` (1920×1080), `roblox.jpg` (1280×720).
⚠️ Renommer `free fire.webp` → `free-fire.webp` (l'espace oblige à un encodage `%20`).
Ces visuels servent de bannières de catégorie. Les images d'annonces réelles seront des captures uploadées par les vendeurs — prévoir un recadrage 16:10 et une compression côté serveur.

## Fichiers de design

- `design/Compte.shop.dc.html` — accueil + listing (ouvrir dans un navigateur avec `support.js` à côté)

# Compte.shop — brief produit (à lire avant d'écrire une ligne de code)

Ce document existe pour qu'un assistant de code ne dérive pas du sujet. Si une décision technique
contredit ce document, ce document gagne — ou pose la question au client.

## Le problème qu'on résout

Des joueurs perdent leur compte (piratage, ban, perte d'accès e-mail) et ne veulent pas recommencer
à zéro. Ils cherchent à racheter un compte déjà avancé. Aujourd'hui ça se passe sur Discord,
WhatsApp et Facebook : paiement à l'aveugle, aucun recours, arnaques massives.

**Compte.shop est un marché ouvert et vérifié pour les comptes de jeu.**
La promesse tient en deux idées : n'importe qui peut vendre, mais personne n'est anonyme ; et
l'argent ne quitte jamais la plateforme avant que l'acheteur ait le compte en main.

## Public

- **Acheteurs** : joueurs, majoritairement Afrique de l'Ouest francophone, souvent sur mobile,
  paiement mobile money. Prix en **francs CFA (XOF)**, affichés `45 000 F CFA` (espace comme
  séparateur de milliers, jamais de virgule anglo-saxonne).
- **Vendeurs** : joueurs individuels qui liquident un compte, plus quelques revendeurs réguliers.

Langue de l'interface : **français**. Ton : premium et discret — sobre, factuel, rassurant.
Pas de langage « hype gaming », pas d'emoji, pas de compte à rebours ni de fausse urgence.

## Règles métier non négociables

1. **Séquestre (escrow) systématique.** L'acheteur paie la plateforme. Le vendeur est payé
   seulement après confirmation de l'acheteur, ou automatiquement à l'expiration du délai de
   vérification.
2. **Délai de vérification de 48 h.** L'acheteur a 48 h après réception des accès pour tester et
   signaler un problème. Compte inaccessible, description mensongère ou reprise par l'ancien
   propriétaire = remboursement intégral.
3. **KYC vendeur obligatoire avant toute publication.** Carte d'identité **ou** extrait de
   naissance, plus une photo du vendeur. Vérification manuelle sous 24 h. Aucune annonce visible
   avant validation. Les documents sont chiffrés, jamais affichés publiquement, accessibles aux
   seuls administrateurs.
4. **Tableau de bord vendeur après validation.** Le vendeur publie une annonce : photos, prix en
   F CFA, description, jeu, détails du contenu du compte. Il suit vues, offres, ventes et
   versements.
5. **Aucun échange hors plateforme.** La remise des accès passe par la messagerie interne. Toute
   tentative de paiement en direct = bannissement immédiat. Le produit doit rendre le contournement
   inconfortable (pas de contacts en clair dans les annonces ni les messages).
6. **Réputation publique et non effaçable.** Nombre de ventes, note moyenne, litiges. Aucun
   nettoyage d'historique.
7. **Support humain 24 h / 24** avec arbitrage des litiges sous 24 h.

## Catégories

Au lancement, quatre jeux, dans cet ordre : **Fortnite, Free Fire, Brawl Stars, Roblox**.
L'architecture doit accepter l'ajout de catégories sans redéploiement (FIFA / EA FC, NBA 2K, CoD,
Valorant sont dans la feuille de route). Ne pas coder les jeux en dur dans les composants.

## Périmètre livré par le design

Fait :
1. **Accueil** — hero avec carrousel des jeux, catégories, bloc « comment nous vous protégeons des
   arnaques » + déroulé du séquestre, support 24/7, parcours vendeur, pied de page.
2. **Catégorie / listing** — filtres (prix, plateforme, vendeur) et grille d'annonces.

Pas encore designé, à ne pas improviser sans validation du client :
- fiche d'une annonce, tunnel d'achat et de paiement,
- formulaire de vérification d'identité (upload des pièces),
- tableau de bord vendeur et création d'annonce,
- messagerie interne, back-office de modération, système de litiges,
- authentification et compte utilisateur.

Si l'un de ces écrans est nécessaire pour avancer, le construire en réutilisant strictement les
tokens du `README.md` et signaler qu'il s'agit d'une extension non validée.

## Contraintes techniques recommandées

- Mobile d'abord dans l'implémentation réelle : le prototype est dessiné en desktop 1240 px, mais
  l'audience est majoritairement mobile. Cibles de toucher ≥ 44 px.
- Prévoir mobile money (Wave, Orange Money, MTN, Moov) en plus de la carte.
- Uploads : recadrage et compression serveur, limite de poids, purge des métadonnées EXIF.
- Documents KYC : bucket privé séparé des images d'annonces, chiffrement au repos, accès journalisé,
  durée de conservation définie.
- Anti-fraude minimal dès la v1 : limitation du nombre d'annonces par vendeur non confirmé,
  détection des doublons d'images, blocage des numéros et liens dans les textes libres.

## Ce qu'il ne faut pas faire

- Ne pas transformer le site en boutique de jeux, de skins, de recharges ou de boosting : le produit
  vend **des comptes**, entre particuliers.
- Ne pas ajouter de second accent, de dégradé décoratif, d'emoji ou d'illustration 3D.
- Ne pas ajouter de sections marketing non demandées (témoignages inventés, blog, FAQ générée).
- Ne pas afficher de chiffres inventés comme s'ils étaient réels : les compteurs du prototype
  (1 480 comptes vendus, 128 annonces, notes) sont des placeholders à brancher sur l'API.
- Ne pas promettre juridiquement plus que le service ne fait : le remboursement 48 h et l'arbitrage
  sont des règles internes, pas une garantie bancaire. Prévoir des CGU réelles.
- Ne pas utiliser les logos officiels des éditeurs. Les visuels fournis sont des bannières de
  catégorie temporaires ; à remplacer par des visuels dont le client détient les droits.

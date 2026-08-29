/**
 * Contenu éditorial fixe (copie produit), distinct des données métier
 * qui viendront de l'API — cf. src/lib/data.ts.
 */

export const protections = [
  {
    num: "01",
    title: "Paiement en séquestre",
    body: "Votre argent est bloqué par la plateforme dès l'achat. Le vendeur n'est payé qu'après votre confirmation, jamais avant.",
  },
  {
    num: "02",
    title: "Identité vérifiée",
    body: "Chaque vendeur a transmis une pièce d'identité ou un extrait de naissance, plus une photo, validés manuellement avant toute publication.",
  },
  {
    num: "03",
    title: "48 h pour tester",
    body: "Compte inaccessible, description mensongère ou reprise par l'ancien propriétaire : remboursement intégral sous 48 h.",
  },
  {
    num: "04",
    title: "Aucun échange hors plateforme",
    body: "La remise des accès passe uniquement par la messagerie interne. Tout contact direct proposé est un signal d'arnaque.",
  },
  {
    num: "05",
    title: "Réputation publique",
    body: "Ventes, note moyenne et litiges d'un vendeur restent visibles et ne peuvent pas être effacés.",
  },
  {
    num: "06",
    title: "Support disponible 24 h / 24",
    body: "Un doute, un blocage : notre équipe intervient et arbitre les litiges sous 24 h.",
  },
];

export const escrowSteps = [
  { num: "01", title: "L'acheteur paie", body: "Le montant est prélevé et conservé par Compte.shop, pas par le vendeur." },
  { num: "02", title: "Le vendeur transmet les accès", body: "Identifiants envoyés via la messagerie interne, jamais en direct." },
  { num: "03", title: "Vérification 48 h", body: "L'acheteur teste le compte et confirme, ou signale un problème." },
  { num: "04", title: "Versement au vendeur", body: "Paiement libéré à la confirmation, ou automatiquement à l'expiration du délai." },
];

export const sellerSteps = [
  { num: "01", title: "Créez votre compte", body: "Inscription en quelques minutes avec un e-mail ou un numéro de téléphone." },
  { num: "02", title: "Vérifiez votre identité", body: "Pièce d'identité ou extrait de naissance, plus une photo. Validation manuelle sous 24 h." },
  { num: "03", title: "Publiez votre annonce", body: "Photos, prix en F CFA, description et détails du contenu du compte." },
  { num: "04", title: "Suivez et vendez", body: "Vues, offres, ventes et versements depuis votre tableau de bord." },
];

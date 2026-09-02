import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const LAST_UPDATED = "2 septembre 2026";

/**
 * Conditions Générales d'Utilisation et de Vente. Rédigées à partir des
 * recherches fournies par l'opérateur sur le statut d'intermédiaire des
 * marketplaces C2C de comptes de jeu (Eldorado, G2G, PlayerAuctions) —
 * Compte.shop est positionné de la même façon : simple intermédiaire
 * technique entre acheteurs et vendeurs, jamais partie à la transaction
 * ni propriétaire des comptes vendus.
 *
 * Entité éditrice : KELLY GAMING SARL (RCCM CI-ABJ-03-2026-B13-07299,
 * Abidjan) — entité existante de l'opérateur, déjà active dans le
 * commerce de produits numériques ; à ce stade utilisée aussi pour
 * Compte.shop faute d'une structure dédiée. Son objet social déclaré
 * (« commerce de produit numérique et service digitaux ») couvre
 * plausiblement la revente d'actifs numériques de jeu, mais ne
 * mentionne pas explicitement l'intermédiation / le séquestre de fonds
 * de tiers — voir la note à l'opérateur au sujet d'une éventuelle
 * extension de l'objet social ou d'une structure dédiée si le volume
 * grandit.
 *
 * ⚠️ Ceci n'est PAS un avis juridique. Une relecture par un avocat
 * (idéalement basé en Côte d'Ivoire, vu MoneyFusion et le public visé)
 * reste recommandée avant de traiter ce texte comme définitif —
 * notamment sur le statut de séquestre des fonds, qui touche parfois à
 * la réglementation sur la monnaie électronique selon les montants et
 * volumes traités.
 */
export default function ConditionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-5 py-16 sm:px-8">
        <h1 className="mb-2 font-display text-[28px] font-semibold tracking-[-0.02em]">
          Conditions générales d&apos;utilisation et de vente
        </h1>
        <p className="mb-10 text-[13px] text-text-tertiary">
          Dernière mise à jour : {LAST_UPDATED}
        </p>

        <div className="flex flex-col gap-9 text-[14.5px] leading-relaxed text-text-secondary">
          <Section title="1. Objet et statut de Compte.shop">
            <p>
              Compte.shop (« la Plateforme ») est un service édité par KELLY GAMING SARL, société
              à responsabilité limitée unipersonnelle immatriculée au Registre du Commerce et du
              Crédit Mobilier sous le numéro CI-ABJ-03-2026-B13-07299, dont le siège social est
              situé à Abidjan, Yopougon Azito, en face du carrefour supermarché BM, 09 lot 387
              îlot 42, Côte d&apos;Ivoire.
            </p>
            <p>
              Compte.shop est une place de marché entre particuliers (« C2C ») : la Plateforme
              met en relation un vendeur et un acheteur de compte de jeu vidéo, sécurise le
              paiement via un mécanisme de séquestre, et facilite la communication entre les deux
              parties. <strong className="text-text">Compte.shop n&apos;est ni vendeur ni
              acheteur des comptes proposés sur la Plateforme, n&apos;en devient jamais
              propriétaire, et n&apos;est pas partie à la transaction conclue entre l&apos;acheteur
              et le vendeur.</strong> Son rôle se limite à celui d&apos;intermédiaire technique et
              de tiers de confiance pour le paiement.
            </p>
          </Section>

          <Section title="2. Acceptation, âge et compte utilisateur">
            <p>
              L&apos;utilisation de la Plateforme suppose l&apos;acceptation pleine et entière des
              présentes conditions. Un compte ne peut être créé que par une personne majeure
              (ou par un mineur avec l&apos;autorisation de son représentant légal, sous la
              responsabilité de celui-ci), disposant de la pleine capacité à contracter.
            </p>
            <p>
              Chaque utilisateur est responsable de la confidentialité de ses identifiants et de
              toute activité effectuée depuis son compte. Un seul compte par personne physique
              est autorisé ; Compte.shop peut suspendre tout compte créé pour contourner une
              sanction ou multiplier les avantages liés au parrainage ou aux évaluations.
            </p>
          </Section>

          <Section title="3. Risque lié aux conditions d'utilisation des éditeurs de jeu">
            <p>
              <strong className="text-text">
                La quasi-totalité des éditeurs de jeux vidéo (Riot Games, Epic Games, Supercell,
                Electronic Arts, etc.) interdisent contractuellement la revente de compte dans
                leurs propres conditions d&apos;utilisation.
              </strong>{" "}
              Cette interdiction relève d&apos;un contrat privé entre le joueur et l&apos;éditeur
              du jeu — ce n&apos;est pas une loi, et Compte.shop n&apos;est partie à aucun de ces
              contrats. La Plateforme ne facilite pas d&apos;infraction pénale et n&apos;incite à
              aucune violation de la loi.
            </p>
            <p>
              En revanche, chaque utilisateur reconnaît et accepte expressément que :
            </p>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>
                l&apos;achat, la vente ou le transfert d&apos;un compte de jeu peut violer les
                conditions d&apos;utilisation propres à l&apos;éditeur du jeu concerné ;
              </li>
              <li>
                l&apos;éditeur du jeu peut, à sa seule discrétion et à tout moment, suspendre,
                bannir ou récupérer un compte transféré, y compris après une transaction déjà
                confirmée sur Compte.shop, sans que Compte.shop n&apos;en soit informé ni
                responsable ;
              </li>
              <li>
                Compte.shop ne garantit ni la pérennité d&apos;un compte après son transfert, ni
                sa conformité avec les conditions de l&apos;éditeur du jeu concerné ;
              </li>
              <li>
                ce risque est assumé personnellement et exclusivement par l&apos;acheteur et le
                vendeur, chacun en ce qui le concerne ; Compte.shop ne pourra être tenu
                responsable d&apos;une perte d&apos;accès survenue après la livraison confirmée
                du compte.
              </li>
            </ul>
            <p>
              La garantie de séquestre (article 6) couvre exclusivement la bonne exécution de la
              transaction entre acheteur et vendeur (paiement, livraison des identifiants,
              conformité de l&apos;annonce) — elle ne couvre pas les décisions prises
              ultérieurement par l&apos;éditeur du jeu sur le compte transféré.
            </p>
          </Section>

          <Section title="4. Annonces et comptes strictement interdits">
            <p>Sont strictement interdits sur Compte.shop, sans exception :</p>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>
                tout compte volé, obtenu par piratage, hameçonnage (phishing), ingénierie
                sociale, ou tout autre moyen frauduleux ;
              </li>
              <li>tout compte dont le vendeur n&apos;est pas le titulaire légitime ;</li>
              <li>
                toute annonce mensongère sur le contenu, le niveau, les objets ou l&apos;état
                réel du compte ;
              </li>
              <li>
                toute utilisation de la Plateforme à des fins de blanchiment, de fraude au
                paiement, ou de contournement des contrôles Mobile Money ;
              </li>
              <li>
                toute tentative de contourner le séquestre (paiement ou échange d&apos;identifiants
                en dehors de la Plateforme avant confirmation).
              </li>
            </ul>
            <p>
              Un compte signalé ou suspecté d&apos;origine frauduleuse peut être suspendu
              immédiatement, sans préavis, et Compte.shop se réserve le droit de transmettre les
              informations disponibles aux autorités compétentes en cas de fraude avérée. Cette
              interdiction est indépendante du risque décrit à l&apos;article 3 : revendre son
              propre compte légitimement acquis est toléré sur la Plateforme (à charge du
              vendeur d&apos;assumer le risque vis-à-vis de l&apos;éditeur) ; revendre un compte
              qui ne lui appartient pas ne l&apos;est jamais.
            </p>
          </Section>

          <Section title="5. Vérification d'identité des vendeurs (KYC)">
            <p>
              Toute personne souhaitant vendre un compte doit préalablement soumettre une pièce
              d&apos;identité (ou un extrait de naissance) ainsi qu&apos;une photo d&apos;elle-même.
              Ces documents sont stockés de façon strictement privée et ne sont accessibles
              qu&apos;à l&apos;équipe d&apos;administration de Compte.shop, pour la seule finalité
              de vérifier l&apos;identité du vendeur avant validation de son compte vendeur. Ils
              ne sont ni publiés, ni transmis à des tiers, ni utilisés à d&apos;autres fins.
            </p>
            <p>
              Un dossier peut être rejeté (document illisible, doute sur l&apos;identité, selfie
              ne correspondant pas au document) ; la personne concernée en est informée avec le
              motif du rejet et peut soumettre un nouveau dossier.
            </p>
          </Section>

          <Section title="6. Paiement, séquestre et livraison">
            <p>
              Le paiement de l&apos;acheteur est collecté via un prestataire Mobile Money tiers et
              conservé en séquestre par Compte.shop jusqu&apos;à confirmation de la bonne
              réception du compte par l&apos;acheteur (ou, à défaut de confirmation, jusqu&apos;à
              l&apos;expiration du délai de vérification affiché sur la commande, après quoi les
              fonds sont automatiquement libérés au vendeur).
            </p>
            <p>
              Selon le mode de livraison choisi par le vendeur lors de la publication de
              l&apos;annonce, les identifiants du compte sont soit transmis automatiquement dès
              confirmation du paiement (remise instantanée), soit remis manuellement par le
              vendeur via la messagerie de la commande (remise manuelle, sous garantie de
              présence du vendeur pendant la fenêtre indiquée sur l&apos;annonce — à défaut,
              l&apos;acheteur est remboursé automatiquement).
            </p>
            <p>
              Compte.shop ne facture aujourd&apos;hui aucune commission sur les transactions ;
              elle se réserve le droit d&apos;instaurer des frais de service à l&apos;avenir, qui
              seraient alors clairement indiqués avant toute transaction concernée.
            </p>
          </Section>

          <Section title="7. Litiges entre utilisateurs">
            <p>
              Toute commande dispose d&apos;une messagerie dédiée entre l&apos;acheteur et le
              vendeur. En cas de désaccord non résolu entre les deux parties, chacune peut
              solliciter l&apos;intervention d&apos;un administrateur Compte.shop, qui examine les
              échanges et les éléments fournis pour trancher : libération des fonds au vendeur,
              ou remboursement de l&apos;acheteur. Cette décision est prise de bonne foi sur la
              base des informations disponibles et constitue le mécanisme de résolution de
              litige propre à la Plateforme.
            </p>
          </Section>

          <Section title="8. Responsabilité">
            <p>
              Compte.shop met en œuvre des moyens raisonnables pour sécuriser les transactions
              (séquestre, vérification d&apos;identité des vendeurs, messagerie tracée) mais
              n&apos;est tenue que d&apos;une obligation de moyens. Dans les limites permises par
              la loi applicable, la responsabilité de Compte.shop ne saurait être engagée pour :
            </p>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>
                toute décision prise par un éditeur de jeu sur un compte après son transfert
                (bannissement, récupération, suspension — voir article 3) ;
              </li>
              <li>
                les dommages indirects (perte de progression en jeu, préjudice moral, manque à
                gagner) ;
              </li>
              <li>
                les indisponibilités du service liées à un prestataire tiers (paiement Mobile
                Money, hébergement).
              </li>
            </ul>
            <p>
              En tout état de cause, la responsabilité de Compte.shop, si elle devait être
              retenue, est plafonnée au montant de la transaction concernée.
            </p>
          </Section>

          <Section title="9. Propriété intellectuelle">
            <p>
              Les marques, logos et noms des jeux vidéo mentionnés sur la Plateforme (Fortnite,
              Free Fire, Brawl Stars, Roblox, etc.) appartiennent à leurs éditeurs respectifs.
              Compte.shop n&apos;est affiliée à aucun de ces éditeurs et ne prétend à aucun lien
              officiel avec eux.
            </p>
          </Section>

          <Section title="10. Modification des présentes conditions">
            <p>
              Compte.shop peut modifier les présentes conditions à tout moment ; la version en
              vigueur est celle publiée sur cette page, avec sa date de mise à jour. L&apos;usage
              continu de la Plateforme après une modification vaut acceptation de la nouvelle
              version.
            </p>
          </Section>

          <Section title="11. Droit applicable et juridiction compétente">
            <p>
              Les présentes conditions sont soumises au droit ivoirien. Tout litige relatif à
              leur interprétation ou leur exécution qui n&apos;aurait pu être résolu à l&apos;amiable
              relève de la compétence exclusive des tribunaux d&apos;Abidjan, sous réserve des
              règles impératives de protection du consommateur éventuellement applicables.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Pour toute question relative aux présentes conditions : assistant en ligne
              accessible depuis le site, ou WhatsApp +225 0173507682.
            </p>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-[17px] font-semibold text-text">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

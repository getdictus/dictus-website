# Reprise — refonte du site, issue #29

État au 18 septembre 2026. Dernier commit d'implémentation validé : `0db59ae`.

## Décision de travail

- Continuer les développements dans le même dépôt sur **`t3code/develop-issue-29`**.
- Garder la [PR #32](https://github.com/getdictus/dictus-website/pull/32) en brouillon.
- Ne pas fusionner dans `main`, ne pas pousser sur `main` et ne pas lancer de déploiement en production. `main` déclenche la production.
- La base visuelle est acceptée pour poursuivre le travail, mais la version reste inachevée. La version mobile payante n'est pas encore sortie. Une mise en production nécessitera une instruction distincte lorsque l'ensemble sera prêt.
- L'utilisateur teste directement sur ordinateur. Ne pas produire de captures ou de vidéos de livraison sauf demande explicite.

## Ce qui est en place

- Direction claire approuvée : typographie fine, waveform de marque, navigation fixe en pilule et interfaces réelles. Le site et les contrôles sont disponibles en français et anglais.
- Waveform : proportions verticales constantes quand la fenêtre devient étroite, suspension hors écran et respect de la réduction des animations.
- iPhone mis en avant avant Desktop, y compris dans les liens du Hero et le comparatif. Son bouton principal est bleu ; sa destination existante TestFlight/GitHub est conservée.
- Démonstration iPhone issue de l'enregistrement fourni le 18 septembre : une vidéo continue et bouclée, frappe à 1,5× puis dictée à vitesse réelle, avec chapitres Clavier / Dictée / App synchronisés. L'interface enregistrée reste en anglais dans les deux langues du site.
- Sur les fenêtres d'au moins 1024 × 800 px, scène iPhone de 180svh : arrivée centrée, déplacement à droite et apparition du texte. La vidéo commence lorsque la composition est stabilisée ; le scroll ne déplace jamais sa tête de lecture. Les liens `#iphone` et le focus clavier contournent l'introduction.
- Sur mobile et les fenêtres peu hautes, présentation en flux normal et courte arrivée du téléphone. Sans JavaScript ou avec réduction des animations, le contenu reste lisible. Le MP4 n'est pas chargé depuis le Hero initial ; lecture suspendue hors écran et onglet masqué, images de repli et bouton Lire si nécessaire.
- Desktop : vraies captures adaptées à la langue, reproduction de la pilule de transcription, détection du système, téléchargements et sélecteurs accessibles. Capture et pilule apparaissent en 600 ms avec un décalage de 70 ms.
- Même lentille de verre mobile sur les sélecteurs de navigation, de système et de chapitre. Le survol ne sélectionne pas de plateforme et ne fait pas sauter la vidéo.
- Paragraphes : grande lentille avec centre transparent et texte original lisible, réfraction sur un bord de 16 px. Étapes numérotées : bille qui se détache et fusionne avec chaque repère. Déplacements accélérés/freinés de 800 ms et repos de 1,6 s.
- Reflets au pointeur sur les surfaces en verre. Les boutons Pause et la note visible sur la vitesse vidéo ont été retirés ; la gestion automatique des animations reste active.
- Sections d'usages, traitement local par défaut, comparaison, code source et communauté ; harmonisation des pages de soutien, support, confidentialité, conditions et 404.
- Blog et Pricing restent protégés par `DICTUS_SITE_PREVIEW`. La page Pricing de #28 distingue Desktop gratuit, iPhone gratuit et Pro en préparation ; elle reste exclue de la production, de son sitemap et de l’indexation.

## Points encore ouverts

- Poursuivre les retours visuels et éditoriaux de l'utilisateur ; cette base n'est pas une version déclarée prête à publier.
- Pricing est désormais renseigné en FR/EN selon le catalogue de travail de #28 ; lire `docs/issue-28-handoff.md` et `docs/issue-28-product-evidence.md`. Les achats Pro restent indisponibles. Confirmer les montants, les territoires et la sortie payante avant publication. Poursuivre le contenu Blog dans son suivi dédié.
- Préparer la publication du site en coordination avec la sortie mobile payante, uniquement après instruction explicite.
- Faire une validation de lecture sur un iPhone physique avec Safari. Les tests WebKit automatisés ne remplacent pas ce contrôle.
- Firefox n'a pas pu être testé dans l'environnement actuel : son processus d'automatisation échoue au démarrage.
- Mesurer Lighthouse avant publication : l'objectif 90+ figure dans les exigences, mais aucune mesure finale n'est consignée dans la validation actuelle.

Desktop reste gratuit ; Android est en développement. « Local par défaut » tient compte du post-traitement Desktop facultatif et des accès réseau nécessaires aux téléchargements, mises à jour et paiements. Lire `CLAUDE.md` et le dernier brief de l'issue avant de modifier ces affirmations.

## Validation effectuée

- Build de preview et TypeScript réussis.
- ESLint : aucune erreur, 8 avertissements préexistants hors de ces changements.
- **54 contrôles validés sur Chromium et WebKit**, par passage complet puis reprises ciblées après corrections : responsive, sélection au survol/clavier/toucher, scroll et retour arrière, liens directs, changements de taille/préférence pendant la scène, lecture et boucle vidéo, refus autoplay, erreurs média, suspension, lisibilité et réfraction du verre.
- Débordement après redimensionnement, nettoyage de l'animation Desktop et espace du bouton Lire à 1024 × 800 px corrigés et revérifiés.
- Script versionné : `scripts/verify-redesign.mjs`. Les rapports locaux dans `/tmp` sont temporaires ; les assertions sont conservées dans le dépôt.

## Reprendre localement

1. Vérifier la branche et l'état Git ; rester sur `t3code/develop-issue-29` et préserver les changements en cours.
2. Lire ce document, `CLAUDE.md`, la PR #32 et le dernier brief de l'issue #29.
3. Gérer tous les serveurs avec **Portly uniquement**, en commençant par `portly status --json`. Projet : `dictus-website-issue-29`. Serveur de preview : `preview`, port **4329** ; serveur de développement enregistré : `refinement`, port **4332**.
4. La dernière preview construite utilise `DICTUS_SITE_PREVIEW=1`. Cette variable ne doit pas être activée en production. Arrêter via Portly les serveurs du même checkout avant de reconstruire `.next`, puis redémarrer la preview via Portly.
5. Pour voir l'introduction au scroll, ouvrir `http://localhost:4329/fr` depuis le haut, sans ancre `#iphone`.

Commandes de vérification :

```sh
npm run lint
# Serveurs de ce checkout arrêtés via Portly avant ce build :
DICTUS_SITE_PREVIEW=1 npm run build
# Après redémarrage de la preview via Portly :
VERIFY_SCREENSHOTS=0 VERIFY_ENGINES=chromium,webkit npm run test:e2e -- http://localhost:4329
```

## Repères dans le code et l'historique

- Scène iPhone : `src/components/ProductScenes/`, notamment `useIphoneStage.ts`, `IphoneStage.module.css` et `useIphoneDemo.ts`.
- Sélecteurs : `src/components/shared/useGlassSelector.ts` et `GlassSelectorLens.*`.
- Arrivée Desktop : `src/components/shared/ProductReveal.tsx` ; écran et pilule dans `src/components/Platforms/`.
- Provenance des captures et encodage reproductible : `docs/product-assets.md`.
- `9f796f1` : sélecteurs en verre partagés.
- `da4f753` : iPhone en premier dans la page.
- `0db59ae` : scène iPhone au scroll et arrivée Desktop.
- `103d6ab` : réfraction limitée au bord et interactions affinées.
- `a9e98fe` : intégration de la vraie vidéo iPhone.

Les changements de présentation restent isolés en commits pour pouvoir ajuster la scène sans perdre le reste de la refonte.

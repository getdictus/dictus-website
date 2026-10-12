# Livraison en brouillon — issue #34

## À quoi sert ce travail

Répondre à trois recherches concrètes : écrire à la voix sur iPhone, démarrer
avec une dictée gratuite sur ordinateur et comprendre ce qui arrive à la voix
et au texte. Les trois guides sont intégralement rédigés en français et traduits
en anglais avec le flux Codex du dépôt. Ils remplacent les notes techniques de
#33 et restent **en brouillon**, sans validation humaine enregistrée, publication
ni ouverture du blog.

Checkout : `/Users/pierreviviere/dev/dictus-website-wt/34`.
Branche : `feat/34-bilingual-seo-guides`, cible PR : `main`.
Contenu et code vérifiés au commit `72c8a5d` ; les commits suivants de ce chantier
documentent la vérification. La PR #32 est déjà fusionnée : sa consigne de
continuation est historique. Le checkout principal n’a pas été déplacé.

Preview locale conservée : `http://localhost:4334`, serveur Portly
`dictus-website-issue-34/preview`, commande `npm run start` sur le build de preview.
Pour vérifier le checkout :

```sh
git -C /Users/pierreviviere/dev/dictus-website-wt/34 log -1 --oneline
portly status --json
```

Si une nouvelle compilation est nécessaire, arrêter ce serveur via Portly,
exécuter `DICTUS_SITE_PREVIEW=1 npm run build` dans ce checkout puis le redémarrer
via Portly. Aucun autre serveur local n’a été modifié.

## URL et contenu

Les identifiants de liaison restent les mêmes. Les anciens slugs des notes
techniques, jamais publiées, sont remplacés par les premières URL éditoriales
ci-dessous. Les six anciennes URL renvoient 404 ; les nouvelles sont destinées
à rester stables. Chaque guide renvoie aux deux autres dans la langue courante.

| Sujet / identifiant stable | URL FR | URL EN | Mots / minutes FR | Mots / minutes EN |
| --- | --- | --- | --- | --- |
| iPhone / `capture-clavier-iphone` | `/fr/blog/dictee-vocale-iphone` | `/en/blog/iphone-voice-dictation` | 1031 / 6 | 1003 / 6 |
| Ordinateur / `capture-dictus-desktop` | `/fr/blog/dictee-vocale-gratuite-ordinateur` | `/en/blog/free-desktop-dictation` | 1221 / 7 | 1150 / 6 |
| Confidentialité / `local-par-defaut` | `/fr/blog/dictee-vocale-locale-confidentialite` | `/en/blog/local-dictation-privacy` | 1213 / 7 | 1150 / 6 |

Les dates de contenu et génération sont le **18 septembre 2026**. Aucun
`publishedAt` n’est ajouté. Les textes de preview FR/EN indiquent maintenant de
vrais guides en cours de validation, au lieu d’exemples de mise en page.

## Génération et vérification éditoriale

`codex login status` a confirmé la session ChatGPT authentifiée. Les commandes
ci-dessous ont été réellement exécutées, une paire traitée et examinée à la fois :

```sh
npm run blog:translate -- capture-clavier-iphone
npm run blog:translate -- capture-dictus-desktop
npm run blog:translate -- local-par-defaut
```

Les corrections factuelles, légendes, exercices et choix des URL ont été suivis
des régénérations nécessaires. Aucune provenance n’a été fabriquée. Sur les
trois entrées, `translation.method` vaut `codex-cli`, l’empreinte de source est
actuelle, les deux locales sont complètes et `review` reste `{}`.

| Guide | Empreinte finale de la source FR |
| --- | --- |
| iPhone | `0ead1f3c330529a1fdf61e5235eb5068e79e436a8b333e8b09389fc74d691365` |
| Ordinateur | `94c4aea11d9b9b4d48442e027f3da8886e5f6ea3244c3198050ef6cb5f97b6b4` |
| Confidentialité | `4362d27068ccc99ec158b20ea790c38bc3a3135c567390cdd363b21f3a9e2138` |

Les agents ont relu les textes complets et comparé les deux langues, y compris
les prérequis, limites, sources, chiffres, légendes et CTA. Une seconde lecture
indépendante a vérifié chaque paire et les corrections finales. Cela **ne
remplace pas la relecture humaine** : aucune commande `blog:review` ou
`blog:publish` n’a été exécutée sur le registre.

Les sources et décisions d’intention sont détaillées dans
`docs/issue-34-editorial-evidence.md`. Points résolus : iOS 17 minimum pour la
version App Store 1.8.2 ; amélioration facultative distincte exigeant iOS 26 et
Apple Intelligence disponible ; Desktop public 0.3.0 ; modèle recommandé
Parakeet V3 ; avertissement DMG suivi dans #61 ; conservation locale des données
et exceptions réseau. La vidéo iPhone est maintenant attribuée à Dictus 1.8.2
sur iPhone 15 Pro Max après confirmation du mainteneur ; système et numéro de
build restent inconnus. Aucune nouvelle capture native ou transcription de test
n’a été inventée ou produite.

## Preuves techniques exécutées

- `npm run blog:validate` : `Validated 3 blog articles.`
- `npm run test:blog` : **13 tests réussis**, dont contrôle du vrai `prebuild`
  sur paires manquantes/périmées, génération simulée pour les tests, relectures
  invalidées, slugs et futur sitemap. Ces fixtures sont distinctes des véritables
  générations éditoriales ci-dessus.
- `npm run lint` : **0 erreur**, les **8 avertissements préexistants** restent
  dans `generate-icons.mjs`, `ScrollReveal.tsx` et les sources vidéo.
- `npx tsc --noEmit` et `git diff --check` : succès.
- `VERCEL_ENV=production DICTUS_SITE_PREVIEW=1 npm run build` : succès,
  **21 pages**, aucun article généré. Le mode production garde la priorité.
- `VERIFY_MODE=production VERIFY_ENGINES=chromium,webkit node scripts/verify-blog.mjs http://localhost:4334` :
  **3 groupes réussis, 0 échec**. Blog/article/slugs incorrects en 404,
  navigation sans Blog, robots et sitemap protégés.
- `DICTUS_SITE_PREVIEW=1 npm run build` : succès, **27 pages** dont les six URL
  finales ; serveur du checkout arrêté via Portly avant chaque build.
- `VERIFY_ENGINES=chromium,webkit node scripts/verify-blog.mjs http://localhost:4334` :
  **7 groupes réussis, 0 échec**. HTML sans JavaScript, paragraphes et puces,
  sources/CTA/articles liés, titres et descriptions, OG/Twitter, canonical,
  hreflang réciproques, JSON-LD, langues, dates et `noindex,nofollow` vérifiés
  sur les six versions. Rechargements et bascules dans les deux sens, clavier,
  toucher, focus, ancres, réduction des animations et repli du verre contrôlés.
  Le script existant couvre maintenant **tous les articles** à 320/390/768/1440 px,
  au lieu de ne contrôler que le plus long.
- Contrôle complémentaire headless : **12 destinations internes localisées**
  de CTA/sources en 200, ancres `#iphone`, `#desktop`, `#local`, `#open-source`
  présentes, **6 anciennes URL techniques en 404**.
- Contrôle HTTP des sources : **18 URL externes uniques en 200**. Les 17 sources
  déjà publiques ont été vérifiées avant push ; le lien de provenance des visuels
  vers le commit `204a8e06` de cette branche a aussi répondu 200 après son push.
- Contrôle du registre en mémoire : les **6 locales complètes**, les **3
  traductions fraîches**, aucune relecture ni publication. Les trois tentatives
  de publication via la fonction pure échouent en raison de la relecture absente.
  Le sitemap des vrais brouillons est vide ; des copies éphémères munies de
  validations de test produisent **8 entrées futures : 2 index et 6 articles**,
  avec leurs URL FR/EN exactes. Aucune validation de fixture n’a été sauvegardée.
- Inspection visuelle indépendante des six pages du build : début d’article et
  début du corps, FR à 1440 × 900 et EN à 390 × 900. Titres, colonne de lecture,
  sommaire, légendes et mentions de brouillon lisibles, sans anomalie matérielle.

Lighthouse et Firefox n’ont pas été remesurés dans cette passe de contenu ; les
mesures historiques du gabarit restent dans `docs/issue-33-verification.md`.
Les tests WebKit ne constituent pas un essai sur Safari d’un iPhone physique.

## Critères d’acceptation et limites

| Critère #34 | État et preuve |
| --- | --- |
| Trio validé | Sujets conservés : iPhone, ordinateur gratuit, confidentialité. |
| Article 1 FR/EN, faits et preview | Livré en brouillon : génération réelle, Apple + tag distribué, revue des deux langues, navigateur et image réelle ; nouvelle installation physique et relecture humaine restantes. |
| Article 2 FR/EN, faits et preview | Livré en brouillon : génération réelle, release et code versionné, revue et preview ; parcours natifs non exécutés, périmètre réduit explicitement à préparation/protocole d’essai. |
| Article 3 FR/EN, faits et preview | Livré en brouillon : génération réelle, trajet audio/texte documenté, vérification FR/EN et preview ; aucune prétention d’audit réseau/externe, relecture humaine restante. |
| Intentions distinctes, réponse et CTA | Matrice d’intention, démarches pratiques et liste de questions ; destinations iPhone/Desktop/confidentialité validées. |
| Six versions et maillage | Registre complet, textes rendus sans JS, articles liés par ID dans chaque langue, sources et CTA vérifiés. |
| FR → EN → FR et accès direct | Deux moteurs, clavier et toucher, rechargements sur les six URL finales. |
| SEO et futur sitemap bilingue | Assertions sur les six head/JSON-LD ; vrai sitemap excluant les brouillons et simulation future de 8 entrées. |
| Sortie et mise à jour toujours bilingues | Garde existante testée ; empreintes fraîches ; publication des vraies entrées refusée faute de relecture. |
| Publication distinctement autorisée | Gate inchangé `isBlogPublic = false`, brouillons `noindex`, production 404, PR en brouillon sans merge. |

## À tester à la main avant publication

1. Vérifier le SHA de la PR avec la commande Git ci-dessus, puis ouvrir
   `http://localhost:4334/fr/blog`. Les trois guides doivent porter leur mention
   de brouillon, avec leurs vrais titres et visuels.
2. Relire **un guide à la fois**, d’abord FR puis EN via le switch, en utilisant
   les six URL du tableau. Valider naturel de la langue, attribution à Pierre,
   exemples, portée des promesses et liens. Vérifier notamment iOS 17 pour la
   dictée et iOS 26 + conditions Apple Intelligence pour l’amélioration facultative.
   Enregistrer une relecture seulement après l’avoir réellement effectuée.
3. Sur un iPhone physique avec la version distribuée, rejouer une installation
   complète : microphone, clavier/accès complet, téléchargement/préparation du
   modèle, globe dans Apple Notes, micro, retour éventuel à l’app de saisie,
   coche verte du clavier et relecture du texte inséré. Relever version, build,
   système et appareil ; vérifier que les libellés du guide correspondent.
4. Sur Mac, choisir le DMG correspondant, relever tout avertissement, terminer
   les permissions/modèle puis dicter une phrase dans une note avec le raccourci
   affiché en mode Appuyer pour parler. Attendre l’insertion et corriger le texte.
   Rejouer Windows/Linux avant de qualifier ces parcours de « testés » ; sinon
   conserver la limite explicite du guide. Un écran de réglages n’est pas une
   preuve d’installation ou de dictée complète.
5. Lire les trois guides sur Safari d’un iPhone physique et dans Firefox :
   vérifier le confort de lecture, le sommaire sous la navigation fixe et le
   switch sur le même article. Aucun essai physique/Firefox n’est revendiqué ici.
6. Avant la mise en ligne, revalider versions, liens, disponibilité commerciale
   et éventuelles corrections. Régénérer toute traduction dont la source change,
   faire les deux relectures humaines puis obtenir l’instruction distincte de
   publication. Ce chantier ne l’accorde pas et n’ouvre aucun gate.

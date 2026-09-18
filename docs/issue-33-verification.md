# Vérification — socle du blog, issue #33

## Périmètre livré

Index et gabarit bilingues, contenu structuré versionné, génération de traduction
automatique avant build, contrôle de fraîcheur/relecture, routage des traductions
et SEO prêt pour une ouverture ultérieure. Les trois notes de démonstration sont
des **brouillons techniques**, pas les trois guides de lancement de #34. Aucun
article n’a été déclaré publié et `isBlogPublic` reste `false`.

Checkout : `/Users/pierreviviere/.t3/worktrees/dictus-website/t3code-18cd9f6f`.
Branche : `t3code/develop-issue-29`. PR #32 reste en brouillon vers `main`.
Le travail Pricing de #28 est concurrent sur cette branche et reste préservé.

## Preuves exécutées

- `npx tsc --noEmit` : succès.
- `npm run lint` : aucune erreur ; les 8 avertissements déjà présents concernent
  `generate-icons.mjs`, `ScrollReveal.tsx` et les sources vidéo hors de ce chantier.
- `npm run test:blog` : **13 tests réussis** du modèle et du flux éditorial, dont une invocation
  réelle de `npm run prebuild` sur des fichiers temporaires incomplets et obsolètes.
  Le validateur refuse ces paires publiées sans modifier le contenu du dépôt.
- `VERCEL_ENV=production DICTUS_SITE_PREVIEW=1 npm run build` : succès ; la
  production garde la priorité sur le flag de preview.
- `VERIFY_MODE=production VERIFY_ENGINES=chromium,webkit node scripts/verify-blog.mjs http://localhost:4331` :
  **3 groupes de contrôles réussis**. Index/articles/slugs étrangers ou inconnus
  renvoient 404, aucun lien Blog dans la navigation et aucun article dans le
  sitemap ; robots bloque les deux préfixes Blog.
- `DICTUS_SITE_PREVIEW=1 npm run build` : succès, **27 pages générées**, dont les
  deux index et les six URL d’articles. Les serveurs du checkout ont été arrêtés
  via Portly avant chaque build.
- `VERIFY_ENGINES=chromium,webkit node scripts/verify-blog.mjs http://localhost:4329` :
  **7 groupes de contrôles réussis**. Les six articles sont lisibles sans
  JavaScript ; textes, liens, canonical, hreflang, Open Graph, Twitter et JSON-LD
  correspondent aux données de chaque langue. Accès direct, rechargement,
  bascule FR → EN → FR, retour aux pages ordinaires et slugs inconnus sont vérifiés.
  Les contrôles couvrent 320/390/768/1440 px, le toucher, le clavier, le focus,
  les ancres sous la navigation, la réduction des animations, les images chargées
  et dimensionnées, ainsi que le repli du verre sans filtres. Sur WebKit/macOS,
  Option-Tab parcourt les liens selon le comportement natif de Safari.
- `VERIFY_SCREENSHOTS=0 VERIFY_ENGINES=chromium,webkit npm run test:e2e -- http://localhost:4329` :
  **54 contrôles de régression réussis**, dont navigation, langues, téléchargements,
  animations, verre, scènes iPhone/Desktop, responsive et protections de preview.
  Le dernier ajustement ultérieur ne change que les en-têtes Blog et la priorité
  de chargement de son illustration ; le build et les 7 groupes Blog ont été
  repassés sur cette version finale.
- Traduction réelle : les trois commandes `npm run blog:translate -- <id>` ont
  enregistré une version anglaise via la CLI Codex authentifiée ; `method` vaut
  `codex-cli`, l’empreinte de source est à jour et les validations humaines restent
  vides. Une tentative ayant ajouté un nom de plateforme a été refusée avant
  sauvegarde ; la source ambiguë a été clarifiée puis traduite à nouveau.

| Identifiant | Slug FR | Slug EN | Mots / lecture FR | Mots / lecture EN |
| --- | --- | --- | --- | --- |
| `local-par-defaut` | `local-par-defaut` | `local-by-default` | 810 / 5 min | 766 / 4 min |
| `capture-dictus-desktop` | `capture-dictus-desktop` | `dictus-desktop-screenshot` | 401 / 3 min | 391 / 2 min |
| `capture-clavier-iphone` | `capture-clavier-iphone` | `iphone-keyboard-capture` | 385 / 2 min | 382 / 2 min |

Le middleware next-intl conservait initialement le même slug dans ses en-têtes
HTTP `Link`, créant une fausse URL anglaise malgré un head correct. Ces alternates
automatiques sont maintenant désactivés **pour le Blog seulement** : les pages
émettent leurs propres hreflang validés. Les assertions vérifient aussi ces
en-têtes, pour éviter de réintroduire des URL de traduction en 404.

## Correspondance avec les critères d’acceptation

| Critère #33 | Preuve |
| --- | --- |
| Index et lecture responsive | Gabarits statiques et contrôles 320–1440 px dans les deux moteurs ; appréciation visuelle finale au mainteneur. |
| Quatrième article sans changement de composants | Test ajoutant une quatrième paire par les données et vérifiant index, slugs et futur sitemap. |
| FR et EN publiés ensemble après relecture | Validation partagée du CLI, du prebuild et du modèle Next ; les exemples restent en brouillon sans approbation fictive. |
| Paire absente, vide, obsolète refusée | Tests de champs manquants/blancs, source modifiée et invocation réelle du prebuild en échec attendu. |
| Switch sur le même article | Trois paires aux slugs distincts testées dans les deux sens après accès direct et rechargement, au clavier et au toucher. |
| SEO et liens dans les deux langues | Assertions sans JavaScript sur le HTML, les métadonnées, le JSON-LD, les liens et les en-têtes HTTP ; sitemap futur vérifié par les tests du modèle. |
| Correction source suivie d’une actualisation | Empreinte de source périmée détectée ; génération remet la paire en brouillon et efface ses relectures. |
| Accessibilité et replis | Focus, ancres, réduction des animations et repli sans filtres vérifiés ; Lighthouse et limites physiques ci-dessous. |
| Images et performance | Captures natives documentées, tailles explicites, Next Image responsive et priorité haute de l’image principale ; mesures Lighthouse ci-dessous. |
| Aucun lancement public | Build `VERCEL_ENV=production` même avec le flag de preview, routes 404, navigation/robots/sitemap contrôlés. |

## Lighthouse

Lighthouse 13.5.0, navigateur Chromium headless, build de production en mode
preview, origine locale. Aucun autre test navigateur de ce chantier ne tournait
pendant les mesures finales. La machine restait utilisée par d’autres travaux ;
les premières mesures des index étaient plus basses pendant des activités
concurrentes sur la machine. Les deux index ont
été remesurés après la correction des en-têtes et de la priorité d’image.

| Page | Profil | Performance | Accessibilité | Bonnes pratiques | CLS |
| --- | --- | --- | --- | --- | --- |
| `/fr/blog` | Mobile, mesure finale | 92 | 100 | 100 | 0 |
| `/en/blog` | Mobile, mesure finale | 94 | 100 | 100 | 0 |
| `/fr/blog/local-par-defaut` | Mobile | 93 | 100 | 100 | 0 |
| `/en/blog/local-by-default` | Mobile | 95 | 100 | 100 | 0 |
| `/fr/blog` | Ordinateur | 99 | 100 | 100 | 0 |
| `/en/blog/local-by-default` | Ordinateur | 100 | 100 | 100 | 0 |

Les quatre dernières lignes ont été mesurées avant l’ajustement final des
en-têtes HTTP et de la priorité d’image, sans changement de mise en page. Les
contrôles fonctionnels des deux langues ont ensuite été repassés sur la version
finale. Les index finaux donnent FCP 1,1 s, LCP 3,1/3,0 s et TBT 160/60 ms (FR/EN).
L’audit de canonical et celui de priorité de l’image LCP réussissent maintenant.
Le score SEO final des index est **69**, car `noindex` et le blocage robots sont
intentionnellement conservés. Ces protections ne sont pas retirées pour améliorer
une note ; l’audit SEO public reste à refaire lors de l’ouverture autorisée.

Rapports locaux : `/tmp/dictus-blog-lighthouse/summary.json` et
`/tmp/dictus-blog-lighthouse/final-summary.json`. Aucune capture de livraison.

## À vérifier par le mainteneur

1. Vérifier le commit avec `git -C /Users/pierreviviere/.t3/worktrees/dictus-website/t3code-18cd9f6f log -1 --oneline`.
2. Ouvrir `http://localhost:4329/fr/blog` : un article principal, deux secondaires,
   des notes clairement identifiées comme brouillons et un accès à chaque note.
3. Ouvrir la note « Local par défaut », lire la colonne de texte et suivre son
   sommaire. Les titres doivent rester visibles sous la navigation fixe. Juger
   l’espacement, les légendes et la lecture longue sur ordinateur et iPhone réel.
4. Changer FR → EN → FR depuis cette note, puis recharger son URL anglaise :
   le switch doit conserver le même article avec son slug traduit. Vérifier aussi
   les notes iPhone/Desktop et le retour à l’index.
5. Relire les deux langues, l’attribution et les sources avant tout usage éditorial.
   Les captures sont authentiques et documentées dans `docs/product-assets.md` ;
   les trois guides définitifs, leurs tests produit et la validation humaine de
   publication restent suivis dans #34.

Firefox automatisé reste indisponible sur cette machine : son processus quitte
avant ouverture d’une page avec « Could not find profile folder ». Un contrôle
Firefox et Safari sur iPhone physique reste manuel. Aucun fichier de capture ou
vidéo de livraison n’a été produit.

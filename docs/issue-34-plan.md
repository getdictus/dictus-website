# Plan — issue #34

## Contrat et contexte

Préparer trois guides utiles pour l’acquisition SEO : première dictée iPhone,
dictée gratuite sur ordinateur, confidentialité du trajet audio/texte. Chaque
source française est suivie de sa traduction anglaise complète générée par
`npm run blog:translate`, puis d’une vérification factuelle et de sa preview.
Ce travail ne constitue ni une relecture humaine ni une publication.

Sources de cadrage lues : `CLAUDE.md`, `AGENTS.md`, les consignes SuperClaude,
`docs/agents/`, `docs/issue-29-handoff.md`, `docs/blog-editorial-workflow.md`,
`docs/product-assets.md`, plans/vérifications #33, issues #34/#33/#29/#17 et
tous leurs commentaires. Le brief #34 ne comporte aucun commentaire ultérieur.
La PR #32 est fusionnée depuis le 18 septembre 2026 ; sa consigne de branche
est donc historique. Base vérifiée `origin/main` au commit `5fc9dca`, worktree
`/Users/pierreviviere/dev/dictus-website-wt/34`, branche
`feat/34-bilingual-seo-guides`, nouvelle PR en brouillon vers `main`.
Commits et PR en anglais, avec `(refs #34)`. Aucune fusion ni production.

## Consommateurs et décisions

`src/content/blog/articles.json` alimente le modèle `src/lib/blog-core.mjs`
et `src/lib/blog.ts`, les index et routes `[locale]/blog/[slug]`, les cartes
d’articles liés, le switch de langue, le temps de lecture, les métadonnées
(`components/Blog/metadata.ts`), ainsi que le futur sitemap. Le CLI éditorial
contrôle les contenus, leurs empreintes, la traduction et les relectures.
`scripts/verify-blog.mjs` lit le registre, donc suit les titres/contenus finaux.

Les trois identifiants existants restent stables, tout comme leurs slugs de
preview déjà partagés : `capture-clavier-iphone` / `iphone-keyboard-capture`,
`capture-dictus-desktop` / `dictus-desktop-screenshot`, `local-par-defaut` /
`local-by-default`. Le titre, le résumé et le corps portent l’intention réelle ;
changer un slug n’est pas nécessaire pour la satisfaire et demanderait des
redirections. `relatedIds` conserve les liens indépendants de la langue.
Les contenus remplacent les exemples techniques, sans ajouter de composant,
route manuelle, dépendance ni nouvelle suite de tests.

## Ordre de travail

1. Examiner les recherches FR/EN et questions connexes, sans volume ni classement
   inventé. Consigner questions, angle, sources et CTA par article.
2. Vérifier les versions réellement distribuées avec les sources primaires.
   Séparer version du code, disponibilité publique, capture historique et test
   physique. Réduire les parcours non testés au lieu d’en inventer les étapes.
3. Rédiger le guide iPhone français, réutiliser la vraie image Apple Notes,
   générer l’anglais via Codex authentifié, contrôler toute la paire.
4. Répéter pour Desktop : gratuité, téléchargement/architecture, préparation,
   essai prudent, limites OS et support ; vraie capture macOS.
5. Répéter pour la confidentialité : capture → transcription → reformulation →
   destination, conservation locale, accès réseau documentés, liste de questions.
6. Actualiser la documentation éditoriale et écrire la matrice de preuves,
   provenance de génération, limites de vérification et relectures dues.
7. Vérifier, committer atomiquement, pousser et ouvrir la PR en brouillon, puis
   s’arrêter. Conserver les trois statuts `draft`, les relectures vides et
   `isBlogPublic = false`.

## Vérification prévue

| Critère #34 | Preuve prévue |
| --- | --- |
| Trois paires FR/EN complètes | Génération réelle par paire, validation des champs/empreintes et comparaison sémantique par l’agent ; relecture humaine explicitement restante. |
| Intentions distinctes et CTA utiles | Note de recherche et sources par guide ; iPhone/Desktop/confidentialité avec leurs liens localisés. |
| Intégration et maillage | `npm run blog:validate`, HTML rendu sans JavaScript, liens de sources/CTA/articles liés et accès directs aux six URL. |
| FR → EN → FR | `scripts/verify-blog.mjs`, clavier/toucher, chargement direct et rechargement. |
| SEO des six URL et futur sitemap | Assertions titres, descriptions, OG/Twitter, canonical, hreflang, JSON-LD ; tests existants du sitemap et des protections de publication. |
| Publication toujours bilingue | `npm run test:blog`, refus de paires manquantes/périmées/non relues ; aucune commande `blog:review` ou `blog:publish`. |
| Preview exclue de l’indexation | Build de production avec flag preview pour vérifier sa priorité, 404/navigation/robots/sitemap ; puis rebuild de preview et `noindex,nofollow`. |

Commandes du dépôt : `npm run blog:validate`, `npm run test:blog`,
`npm run lint`, `npx tsc --noEmit`, `DICTUS_SITE_PREVIEW=1 npm run build`.
Contrôles navigateur exclusivement headless Chromium/WebKit, avec revue des six
pages aux largeurs mobiles et ordinateur. Portly uniquement pour les serveurs :
preview isolée prévue au port 4334 ; ne pas modifier les serveurs d’autres travaux.

Risques : prérequis iOS contradictoires dans l’historique, versions récentes
non distribuées, avertissements d’installation Desktop, fonctionnalités
facultatives différentes selon plateforme, captures dont le build est inconnu,
traduction naturelle mais promesse renforcée. Les sources versionnées, les limites
explicites et la revue FR/EN répondent à ces risques. Les tests physiques et la
relecture de Pierre restent à consigner avant toute publication.

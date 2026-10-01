# Reprise — Pricing, issue #28

La page explique dès son introduction que Desktop restera gratuit et que la dictée iPhone garde un socle gratuit permanent. Dictus Pro concerne uniquement iOS et ses achats ne sont pas encore disponibles. Les trois modalités affichées décrivent le catalogue de travail pour la future sortie, sans simuler un achat.

## Travail et preview

- Source : branche `t3code/develop-issue-29`, worktree `/Users/pierreviviere/.t3/worktrees/dictus-website/t3code-18cd9f6f`, PR #32 en brouillon vers `main`.
- Le travail Blog #33 a commencé en parallèle dans ce même worktree. Ses fichiers et espaces de traduction sont préservés. Les commits #28 ne les incorporent pas.
- Pour éviter de reconstruire le `.next` utilisé par l’autre tâche, la validation #28 utilise une archive isolée du commit sous `/tmp`, avec `node_modules` lié au checkout. La preview Portly `dictus-website-issue-28-preview/preview` écoute sur **http://localhost:4328/fr/pricing**. `PREVIEW_COMMIT` dans le dossier de l’archive identifie le contenu réellement construit. Ne pas supposer que 4329 sert le même commit.
- Aucun push/merge de `main`, aucun déploiement en production. Ne pas activer `DICTUS_SITE_PREVIEW` en production. Une instruction distincte reste nécessaire avant publication.

## À tester à la main

1. Ouvrir `/fr/pricing` sur la preview : lire la distinction Desktop gratuit / iPhone gratuit / Pro en préparation ; vérifier le rythme visuel, la taille du texte et le maintien de Soutenir en bleu.
2. Dans Dictus Pro, passer d’Annuel à Mensuel puis Achat unique. Vérifier que la sélection, le prix total, la fréquence, l’essai annuel conditionnel et l’absence de renouvellement de l’achat unique restent faciles à comprendre. Aucun contrôle ne doit laisser penser que l’achat est ouvert.
3. Passer en anglais avec EN : rester sur `/en/pricing`, retrouver les mêmes prix EUR et lire la portée de l’achat à vie. Ouvrir les questions sur l’essai, la compatibilité, la restauration et les dons.
4. Réduire la fenêtre à une largeur de téléphone, puis l’agrandir ; essayer Tab et les flèches dans le sélecteur, puis Entrée sur les questions. Contrôler que chaque libellé reste lisible et que le focus reste visible.
5. Avant publication, faire une lecture sur iPhone physique avec Safari ; faire le contrôle Firefox sur un environnement où son navigateur d’automatisation démarre. Confirmer le catalogue App Store Connect, les territoires et la sortie payante avec le produit.

## Réalisation

- Source chiffrée unique : `src/config/pricing.ts` (montants EUR, identifiants Apple, durée d’essai, limite d’historique). Les traductions `Pricing` contiennent les libellés et une seule version de la portée à vie par langue, également interpolée dans les Conditions.
- Sélecteur natif de boutons radio avec les primitives de verre existantes. Annuel par défaut ; flèches natives, toucher, état annoncé, réduction des animations et liste complète sans JavaScript. Le survol ne change pas le paiement sélectionné.
- Une liste de fonctions Pro commune aux trois paiements, avec disponibilité future claire ; comparaison HTML native et FAQ en `details`/`summary`.
- Historique limité aux 200 dernières dictées, consultation/copie/suppression ; vocabulaire par remplacement de variantes ; Liste/Structuré/traduction préparés sur develop, sans promesse de roadmap. Apple Intelligence et iOS 26+ sur les appareils compatibles pour les modes IA ; historique/vocabulaire indépendants d’Apple Intelligence.
- iOS 17+ corrigé dans l’accueil, Support et les instructions, d’après la fiche distribuée. Les Conditions ne prétendent plus que les achats Pro sont ouverts et précisent l’essai annuel éligible. Confidentialité et séparation des dons conservées.
- Lien neutre vers l’app gratuite distribuée et vers les téléchargements Desktop existants ; aucun paiement web Pro. Le comparatif d’accueil pointe vers Pricing uniquement en preview.
- Métadonnées Pricing spécifiques FR/EN, canonical et hreflang ; aucun objet Offer ou Product structuré. Route, navigation et indexation conservent leur protection de preview.

## Validation

Script dédié : `scripts/verify-pricing.mjs`, avec assertions de contenu, prix, clavier/toucher/survol, texte réellement peint dans le sélecteur, FAQ, liens, langues, métadonnées, responsive, réduction des animations et lecture sans JavaScript. Les captures du script restent en mémoire et ne constituent pas une livraison d’images.

- Build preview et TypeScript réussis ; ESLint sans erreur, avec les 8 avertissements préexistants.
- Script Pricing : **29 contrôles réussis, 0 échec** dans Chromium et WebKit, FR/EN.
- Régression #29 : 54 contrôles couverts dans Chromium et WebKit. Premier passage : 53 réussites et un échec de synchronisation du survol iPhone dans Chromium ; la reprise ciblée de ce contrôle réussit. Aucun changement de la scène iPhone n’a été nécessaire.
- Vérification indépendante : 16 scénarios axe WCAG 2 A/AA et 2.1 A/AA réussis (Chromium/WebKit × FR/EN × 320/1440 px × clair/sombre), toutes les FAQ ouvertes ; aucune erreur JavaScript ni débordement. Le calcul automatique du contraste reste incomplet sur certaines surfaces translucides ; il ne constitue pas une certification de contraste. Lecture visuelle effectuée sur les panneaux desktop/mobile et leur sélecteur après stabilisation du rendu.
- Protection production : build isolé de `8ce8125`, avec `VERCEL_ENV=production DICTUS_SITE_PREVIEW=1`, puis 7 contrôles HTTP/navigateur réussis dans Chromium et WebKit : Pricing/Blog retournent 404 en FR/EN, navigation publique sans ces liens, sitemap sans ces routes mais avec Donate, robots publics cohérents. La correction suivante porte uniquement sur le positionnement des labels et les tests.
- Firefox essayé en mode headless : échec de démarrage du navigateur « Could not find profile folder » avant toute navigation, y compris avec `TMPDIR=/tmp`. Son rendu reste non vérifié.

```sh
npm run lint
DICTUS_SITE_PREVIEW=1 npm run build
VERIFY_ENGINES=chromium,webkit npm run test:pricing -- http://localhost:4328
VERIFY_SCREENSHOTS=0 VERIFY_ENGINES=chromium,webkit npm run test:e2e -- http://localhost:4328
```

Avant chaque build, arrêter via Portly les serveurs **du dossier construit** ; ne pas arrêter les serveurs de l’autre tâche. Reprise de la preview isolée : `portly start dictus-website-issue-28-preview/preview --json`.

Commande de reproduction du contrôle production dans une archive isolée, avec un serveur Portly dédié (arrêté après contrôle) :

```sh
VERCEL_ENV=production DICTUS_SITE_PREVIEW=1 npm run build
VERIFY_SCREENSHOTS=0 VERIFY_MODE=production VERIFY_ENGINES=chromium,webkit VERIFY_CHECKS='server-rendered content|navigation, keyboard|sitemap and robots' npm run test:e2e -- http://localhost:4338
```

## Critères d’acceptation

| Critère de #28 | État et preuve |
| --- | --- |
| Desktop gratuit et socle iOS visibles | Réalisé : introduction, bloc Desktop et panneau Gratuit ; assertions FR/EN et lecture visuelle. |
| Design #29, responsive, clavier et repli de verre | Réalisé : primitives partagées, radios natives, 320–1440 px, toucher, clavier, réduction des animations ; Chromium/WebKit vérifiés. Firefox et Safari physique restent à reprendre. |
| Trois modalités, même Pro, fréquence et essai | Réalisé : source chiffrée unique, total annuel explicite, essai annuel éligible seulement ; assertions prix et renouvellement après chaque sélection. |
| Pas de prix fondateur ; portée à vie FR/EN | Réalisé : absence contrôlée, phrase anglaise exacte et traduction française testées dans la page et les Conditions. |
| Matrice confrontée au produit distribué | Réalisé pour la preview : App Store 1.8.2 et develop comparés, iOS 17 confirmé, fonctions Pro futures signalées. Confirmer à nouveau la version payante avant publication. |
| Catalogue et territoires confirmés | Validation produit encore requise avant publication dans iOS #215 ; aucun nouveau prix choisi, aucun achat annoncé disponible. |
| CTA et cohérence entre pages | Réalisé : App Store gratuit neutre, téléchargements Desktop, liens Terms/Privacy/Support/Donate, accueil et Conditions cohérents. Aucun paiement web Pro. |
| Métadonnées et langues | Réalisé : canonical, hreflang, Open Graph et changement de langue conservant `/pricing` ; aucun objet structuré d’offre. |
| Protections preview | Réalisé : noindex et robots preview, build production avec le flag activé restant protégé, routes 404 et navigation/sitemap cohérents. |
| FR/EN, mobile, clavier, contraste, animations, navigateurs | Réalisé dans Chromium/WebKit et par inspection visuelle ; surfaces translucides partiellement évaluables par axe. Limites Firefox/Safari physique déclarées. |

## Limites produit et publication

Le catalogue de référence est documenté, pas approuvé pour publication. La version App Store 1.8.2 exige iOS 17 ; son code ne contient pas encore toutes les fonctions présentées comme prévues pour Pro. La présence de ces fonctions sur develop ne prouve pas leur distribution. Les observations et sources exactes figurent dans `docs/issue-28-product-evidence.md`.

À confirmer avant ouverture publique : montants définitifs et territoires (#215), fonctions effectivement distribuées dans la version payante, éligibilité de l’essai Apple, destination d’achat iOS (#25), validation visuelle mobile physique et instruction distincte de publication. Firefox reste un contrôle navigateur à reprendre si son processus local échoue au lancement.

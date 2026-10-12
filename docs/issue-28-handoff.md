# Reprise — Pricing, issue #28

La page distingue Desktop gratuit, iPhone gratuit et Dictus Pro sur iOS. Les achats Pro ne sont pas encore disponibles. Les trois modalités affichées décrivent le catalogue de travail pour la future sortie, sans simuler un achat.

## Retour mainteneur et révision compacte

Après la première livraison, le mainteneur a jugé la page beaucoup trop textuelle. Il préfère la lisibilité des tarifs [Superwhisper](https://superwhisper.com/#pricing) et a fourni une référence à trois cartes. Cette demande de simplification remplace l’agencement initial, sans modifier le catalogue ni les limites produit.

- Introduction centrée réduite à un titre et une ligne.
- Un sélecteur de paiement commun au-dessus de trois cartes : Desktop, iPhone gratuit et iPhone Pro. Seul le prix Pro change ; Desktop et le socle iPhone restent gratuits.
- Cartes compactes avec prix, quelques bénéfices courts et un accès aux téléchargements ou à l’App Store. Pro porte un contrôle désactivé « Bientôt disponible ».
- Les informations d’essai, de renouvellement et de territoire restent visibles sous les cartes en quelques lignes. Les prérequis complets, la portée à vie et les limites des fonctions sont accessibles dans le comparatif et les dix FAQ, repliés initialement.
- La direction claire, DM Sans, le sélecteur Liquid Glass partagé et Soutenir en bleu sont conservés. La carte Pro reçoit un fond bleu sombre pour distinguer l’offre à venir.

La révision compacte est vérifiée en français et en anglais. Les résultats de la première livraison sont conservés séparément comme historique.

## Travail et preview

- Source : branche `t3code/develop-issue-29`, worktree `/Users/pierreviviere/.t3/worktrees/dictus-website/t3code-18cd9f6f`, PR #32 vers `main` (son état a été changé par ailleurs ; cette révision ne le modifie pas).
- Le travail Blog #33 partage ce worktree. Ses fichiers et espaces de traduction sont préservés. La révision compacte part de `290cb30`, qui inclut déjà les développements Blog ; ne pas les retirer.
- Pour éviter de reconstruire le `.next` utilisé par l’autre tâche, la validation #28 utilise une copie isolée sous `/tmp/dictus-pricing-simplified-r2fdsk90`, avec `node_modules` lié au checkout. La preview Portly `dictus-website-issue-28-preview/preview` utilise **http://localhost:4328/fr/pricing**. `PREVIEW_COMMIT` dans le dossier de l’archive et `/pricing-preview-commit.txt` identifient le contenu construit. Le contenu applicatif construit correspond au commit indiqué par ces marqueurs. Ne pas supposer que 4329 sert le même commit.
- Aucun push/merge de `main`, aucun déploiement en production. Ne pas activer `DICTUS_SITE_PREVIEW` en production. Une instruction distincte reste nécessaire avant publication.

## À tester à la main

1. Ouvrir `/fr/pricing` sur la preview révisée : repérer les trois cartes Desktop, iPhone et iPhone Pro, les deux offres gratuites et « Bientôt disponible ». Vérifier que le premier écran est plus court et que Soutenir reste bleu.
2. Utiliser le sélecteur commun Annuel → Mensuel → Achat unique : seul le prix Pro change. Lire le total, la fréquence et la courte note d’essai ou de renouvellement sous les cartes ; aucun achat ne doit être possible.
3. Ouvrir « Comparer les fonctionnalités », puis les FAQ sur l’essai, la compatibilité et l’achat à vie. Passer en anglais avec EN : rester sur `/en/pricing`, retrouver les mêmes prix EUR et la portée à vie complète.
4. Réduire la fenêtre à une largeur de téléphone, puis l’agrandir ; essayer Tab et les flèches dans le sélecteur, puis Entrée sur le comparatif et les FAQ. Vérifier les cartes empilées, le sélecteur qui reste accessible pendant leur défilement, les libellés et le focus visible.
5. Avant publication, faire une lecture sur iPhone physique avec Safari ; faire le contrôle Firefox sur un environnement où son navigateur d’automatisation démarre. Confirmer le catalogue App Store Connect, les territoires et la sortie payante avec le produit.

## Réalisation

- Source chiffrée unique : `src/config/pricing.ts` (montants EUR, identifiants Apple, durée d’essai, limite d’historique). Les traductions `Pricing` contiennent les libellés et une seule version de la portée à vie par langue, également interpolée dans les Conditions.
- Sélecteur commun de boutons radio avec les primitives de verre existantes. Annuel par défaut ; un contexte partagé relie le sélecteur, le prix Pro et la note de facturation. Flèches natives, toucher, état annoncé et réduction des animations sont conservés. Sans JavaScript, le prix annuel reste lisible et une liste donne les trois modalités. Le survol ne change pas le paiement sélectionné.
- Trois cartes présentent les plateformes en parallèle. Les fonctions Pro restent communes aux trois paiements, avec disponibilité future claire. Le comparatif HTML natif et les dix FAQ utilisent `details`/`summary`, fermés au premier affichage ; les informations détaillées restent disponibles sans charger l’entrée de page.
- Historique limité aux 200 dernières dictées, consultation/copie/suppression ; vocabulaire par remplacement de variantes ; Liste/Structuré/traduction préparés sur develop, sans promesse de roadmap. Apple Intelligence et iOS 26+ sur les appareils compatibles pour les modes IA ; historique/vocabulaire indépendants d’Apple Intelligence.
- iOS 17+ corrigé dans l’accueil, Support et les instructions, d’après la fiche distribuée. Les Conditions ne prétendent plus que les achats Pro sont ouverts et précisent l’essai annuel éligible. Confidentialité et séparation des dons conservées.
- Lien neutre vers l’app gratuite distribuée et vers les téléchargements Desktop existants ; aucun paiement web Pro. Le comparatif d’accueil pointe vers Pricing uniquement en preview.
- Métadonnées Pricing spécifiques FR/EN, canonical et hreflang ; aucun objet Offer ou Product structuré. Route, navigation et indexation conservent leur protection de preview.

## Validation de la révision compacte

- Build preview isolé et TypeScript réussis, validation prébuild des trois articles Blog incluse. ESLint : zéro erreur, les huit avertissements préexistants hors Pricing.
- **29/29 contrôles Pricing** dans Chromium et WebKit, FR/EN : cartes alignées, offre Pro indisponible, comparatif et FAQ fermés initialement, prix et notes synchronisés, clavier/toucher/survol, sélecteur accessible après défilement mobile, portée à vie exacte et Conditions cohérentes, langues/métadonnées, 320–1440 px, réduction des animations et lecture sans JavaScript.
- Le contrôle pixel des libellés tient compte de leur gris et de l’anticrénelage ; il vérifie toujours la présence d’encre réellement rendue sur le verre, sans livrer de capture.
- **16/16 scénarios axe** : Chromium/WebKit × FR/EN × 320/1440 px × clair/sombre, comparatif et FAQ ouverts. Aucune violation signalée, aucune erreur JavaScript, aucun débordement. L’évaluation automatique du contraste reste incomplète sur certaines surfaces translucides.
- Inspection visuelle de la vue desktop et des cartes mobiles, y compris achat unique et sélecteur fixe en WebKit. Captures temporaires internes supprimées après contrôle.
- Les contrôles complets de l’accueil et le build production ci-dessous sont historiques : la révision ne touche ni ces composants ni les protections de publication. Firefox et Safari sur iPhone physique restent non vérifiés pour cette révision.

La relecture statique confirme la conservation des montants, fréquences, essai annuel conditionnel, statut futur, limites matérielles et portée à vie. Les traductions Blog et tous les autres namespaces restent inchangés.

## Validation initiale — historique (`ea47144`)

Les résultats suivants concernent la première livraison, avant la simplification en trois cartes. Ils ne prouvent pas que le nouvel agencement passe les mêmes contrôles.

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

## Critères d’acceptation — bilan de la première livraison

Ce bilan doit être rapproché des nouveaux résultats après validation de la révision compacte.

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

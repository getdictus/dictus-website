# Plan d’implémentation — issue #33

## Contexte et périmètre

Continuer `t3code/develop-issue-29` dans son worktree existant, PR #32 en
brouillon vers `main`. `CLAUDE.md`, le handoff #29 et le brief #33 imposent une
preview protégée, sans fusion ni production. Les trois guides définitifs et leur
vérification produit relèvent de #34 ; le socle utilisera des exemples
explicitement en brouillon avec des captures authentiques déjà documentées.

## Consommateurs identifiés

- Contenu : nouveaux fichiers versionnés dans `src/content/blog/` (le répertoire
  racine `content/` est réservé aux notes locales ignorées).
- Rendu : index `src/app/[locale]/blog/page.tsx`, nouvelle route `[slug]`, composants
  éditoriaux et messages FR/EN.
- Langue : `LanguageToggle`, navigation globale et layout ; la résolution des
  slugs doit survivre aux accès directs et à la navigation entre pages.
- SEO : métadonnées de chaque route, JSON-LD, sitemap et robots. Le gate serveur
  existant `isSitePreview` reste fermé en production.
- Édition : commande de traduction, validation de build, état de relecture et
  documentation ; aucun appel de traduction depuis les pages.

## Ordre des changements

1. Modèle de contenu structuré simple, identifiants stables et slugs localisés.
   Validation de schéma, présence FR/EN, contenu non vide, empreinte de la source
   et relecture des deux versions avant publication. Les brouillons incomplets
   restent consultables uniquement dans la preview.
2. Commande automatique de traduction via CLI locale authentifiée, sauvegarde du
   résultat en brouillon, contrôle des invariants et invalidation des anciennes
   relectures à chaque modification. Documenter création et mise à jour.
3. Index composé d’un article principal et d’une liste secondaire extensible ;
   gabarit de lecture avec auteur, dates, temps calculé, sommaire, légendes,
   sources, articles complémentaires et destination produit adaptée.
4. Relier le switch global aux slugs correspondant au même identifiant ; produire
   canonical propre, hreflang réciproques, partage localisé et BlogPosting. Préparer
   le générateur de sitemap public sans ouvrir le site.
5. Tests du modèle et du flux éditorial, contrôles SSR et navigateur headless,
   régression existante, lint/build preview et build sans preview, Lighthouse.
   Commit atomique avec `refs #33`, puis rapport au mainteneur via l’orchestrateur.

## Direction visuelle

Palette existante : fond `#F2F2F7`, surface `#FFFFFF`, texte `#000000`, corps
`#4D4D52`, bleu `#2563EB`, contours `#D9DCE3`. DM Sans fine pour les grands titres,
300–400 pour la lecture. Index aligné à gauche : introduction, grande composition
image/texte, puis articles secondaires ; pas de filtres artificiels pour trois
articles. Article : titre ample, image authentique dans ses proportions, colonne
de lecture d’environ 68 caractères et sommaire discret. Le verre reste dans les
contrôles existants ; le contenu long est statique sur une surface calme. Cette
composition découle des captures natives et de la sobriété validée dans #29.

## Risques et preuves prévues

- Fraîcheur : tests modifiant la source, les traductions et les états de relecture ;
  paire absente/vide/obsolète refusée par le même validateur utilisé au build.
- Évolutivité : quatrième article ajouté seulement par les données dans les tests.
- Routage : FR → EN → FR, URL directe/rechargement, slug inconnu/croisé, passage
  vers une page normale, clavier et mobile dans Chromium et WebKit.
- SEO : assertions sur le HTML initial, les métadonnées, le JSON-LD et les dates
  réelles du futur sitemap dans les deux langues.
- Isolation : routes blog 404, liens absents et sitemap sans blog dans un build
  sans preview ; preview noindex et robots bloqués.
- Qualité : responsive 320/390/768/1440, focus et ancres sous la navigation,
  réduction des animations, images dimensionnées ; mesure Lighthouse réelle.
- Validation : `npm run lint`, `DICTUS_SITE_PREVIEW=1 npm run build`,
  `VERIFY_SCREENSHOTS=0 VERIFY_ENGINES=chromium,webkit npm run test:e2e -- http://localhost:4329`.
  Tous les serveurs du checkout sont arrêtés via Portly avant chaque build.

Les preuves finales et limites seront consignées après exécution. Aucun fichier
de capture ou vidéo de livraison n’est prévu.

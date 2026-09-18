# Dictus — Landing Page Website

## Projet

Site marketing de **Dictus**, une suite de dictée vocale locale par défaut pour iPhone et ordinateur.
Développé par PIVI Solutions. Domaine : getdictus.com.

### Travail en cours — issue #29

Continuer la refonte sur `t3code/develop-issue-29`, avec la PR #32 en brouillon.
La base est validée pour poursuivre le développement, pas pour une publication.
Ne pas fusionner dans `main` ni déclencher la production avant une instruction
distincte de l'utilisateur, une fois le site et la sortie mobile payante prêts.
Lire `docs/issue-29-handoff.md` pour reprendre après changement de conversation.

## Stack

- **Framework** : Next.js (App Router)
- **Styling** : Tailwind CSS
- **Déploiement** : Vercel

## Produit

Dictus est disponible sous deux formes :

- **Dictus Desktop**, gratuit aujourd'hui et demain, sur macOS, Windows et Linux. La transcription audio s'effectue localement. Un post-traitement facultatif, désactivé par défaut, peut transmettre le texte au fournisseur choisi par l'utilisateur.
- **Dictus iOS**, pour iOS 17 ou ultérieur, avec un clavier de dictée utilisable dans les apps compatibles avec les claviers tiers.

Le code des applications iOS et Desktop est public et vérifiable. Android reste en développement et ne doit pas être présenté comme disponible. La page Pricing de preview documente le catalogue de travail iOS de l’issue #28 : 4,99 €/mois, 39,99 €/an (essai de 7 jours selon éligibilité Apple), achat unique de 149,99 €. Ces valeurs sont centralisées dans `src/config/pricing.ts`. Les achats Pro ne sont pas encore disponibles ; la validation finale du catalogue et des territoires reste requise avant publication. Lire `docs/issue-28-plan.md` et le dernier brief de #28.

Toute fonctionnalité à venir doit être vérifiée dans les dépôts produit et les issues en cours avant d'être annoncée sur le site.

## Design — Brand Kit

Le brand kit complet est dans `/dictus-brand-kit.html` (ouvrir dans un navigateur pour le visualiser).

### Direction artistique du site

- **Clair en premier**, avec la palette existante et le sombre comme variante secondaire.
- DM Sans fine, beaucoup d'espace, une hiérarchie calme et peu d'éléments simultanés.
- Waveform de marque en filigrane dans le hero.
- Vrais écrans des produits dans leurs proportions natives ; ne pas inventer de captures ou de texte dicté.
- Liquid Glass discret sur des contrôles utiles. La lecture et le repli Safari/Firefox priment sur l'effet.
- Navigation fixe en pilule : Home, Blog, Pricing, Soutenir. Blog et Pricing restent réservés à la preview jusqu'à livraison de leur contenu.

### Couleurs principales

| Token | Hex | Usage |
|-------|-----|-------|
| Light Primary | `#F2F2F7` | Background principal du site |
| Light Secondary | `#EFF1F5` | Sections alternées |
| Light Surface | `#FFFFFF` | Surfaces et états actifs |
| Ink Deep | `#0A1628` | Background principal sombre |
| Ink | `#0B0F1A` | Background body sombre |
| Ink 2 | `#111827` | Background secondaire sombre |
| Surface | `#161C2C` | Surfaces sombres |
| Navy | `#0F3460` | Gradient icône |
| Accent Blue | `#3D7EFF` | CTA, boutons, éléments actifs |
| Accent Hi | `#6BA3FF` | Highlights, hover |
| Sky | `#93C5FD` | Highlights, icônes |
| Text Light | `#000000` | Texte principal sur clair |
| Body Light | `rgba(0,0,0,0.60)` | Texte courant sur clair |
| Mist | `#DBEAFE` | Accent très clair |
| White | `#FFFFFF` | Texte principal sur sombre et CTA bleus |
| White 70% | `rgba(255,255,255,0.70)` | Texte body |
| White 40% | `rgba(255,255,255,0.40)` | Labels, texte secondaire |
| Border | `rgba(255,255,255,0.07)` | Bordures subtiles |
| Border Hi | `rgba(255,255,255,0.14)` | Bordures hover |
| Glow | `rgba(61,126,255,0.35)` | Glow effects accent |
| Glow Soft | `rgba(61,126,255,0.12)` | Glow subtil |

### Couleurs sémantiques

| Token | Hex | Usage |
|-------|-----|-------|
| Recording | `#EF4444` | État enregistrement |
| Smart Mode | `#8B5CF6` | Mode LLM intelligent |
| Success | `#22C55E` | Insertion réussie |
| Warning | `#F59E0B` | Erreur, modèle lent |

### Gradients

- **Icon BG** : `linear-gradient(135deg, #0D2040, #071020)`
- **Button** : `linear-gradient(135deg, #2563EB, #1D4ED8)`
- **Bar accent** : `linear-gradient(180deg, #6BA3FF, #2563EB)`

### Typographie

| Rôle | Font | Weight | Détails |
|------|------|--------|---------|
| Display / Wordmark | DM Sans | 200 | `letter-spacing: -0.03em`, « Dictus » |
| Heading | DM Sans | 200–400 | Titres de sections |
| Body | DM Sans | 300 | Texte courant |
| Mono / Code | DM Mono | 400 | Labels techniques |

Google Fonts import : `DM Sans` (200, 300, 400, 500, 600) + `DM Mono` (300, 400)

### Logo

L'icône représente une **onde sonore stylisée** — trois barres verticales de hauteurs asymétriques évoquant l'amplitude d'une voix humaine. La barre centrale, plus haute, forme implicitement la lettre **i** de Dictus. Forme squircle iOS (rx=18 sur 80×80).

- Wordmark : "Dictus" avec majuscule initiale, DM Sans 200, `letter-spacing: -0.04em`
- Ne jamais écrire DICTUS en full majuscules
- L'asymétrie des barres est intentionnelle — ne pas les rendre égales

### États micro (pour animations landing)

| État | Couleur | Description |
|------|---------|-------------|
| Idle | `rgba(255,255,255,0.3)` | Attente |
| Recording | `#EF4444` + pulse | Enregistrement actif |
| Transcribing | `#3D7EFF` + pulse | Transcription en cours |
| Smart Mode | `#8B5CF6` + pulse | Reformulation LLM |
| Inserted | `#22C55E` | Texte inséré avec succès |

## Règles

- Le squircle sombre de l'icône peut être posé sur le fond clair du site ; préserver son contraste et ses proportions.
- Ne pas poser le wordmark directement sur un fond coloré vif ou photographique sans surface lisible.
- Respecter les proportions de l'icône — ne pas déformer
- Le site doit être responsive et performant (Lighthouse 90+)
- Langue principale : français, avec possibilité d'anglais
- Employer « local par défaut » avec précision. Ne pas affirmer qu'aucune donnée ne peut jamais être envoyée : les téléchargements, mises à jour, paiements et le post-traitement Desktop choisi explicitement utilisent le réseau.
- `main` déclenche la production. Blog/Pricing et les captures iPhone de preview ne doivent pas être publiés sans validation distincte.

## Agent skills

### Issue tracker

Les issues vivent dans GitHub Issues (`getdictus/dictus-website`), via la CLI `gh`. Voir `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulaire par défaut : `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Voir `docs/agents/triage-labels.md`.

### Domain docs

Layout single-context : `CONTEXT.md` + `docs/adr/` à la racine. Voir `docs/agents/domain.md`.

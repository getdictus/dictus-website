# Dictus — Landing Page Website

## Projet

Landing page marketing pour **Dictus**, un clavier de dictation vocale 100% offline pour iOS et Android.
Développé par PIVI Solutions. Domaine cible : getdictus.com.

## Stack

- **Framework** : Next.js (App Router)
- **Styling** : Tailwind CSS
- **Déploiement** : Vercel

## Produit

Dictus est un clavier de dictation vocale qui fonctionne entièrement sur l'appareil (offline), disponible sur iOS et Android.

Fonctionnalités disponibles (v1) :
- Transcription vocale en temps réel, 100% on-device
- Aucune donnée envoyée sur internet — privacy first
- Fonctionne comme clavier tiers (dans n'importe quelle app)
- Open source — code transparent et auditable
- Compatible iOS 18+ (Android en cours de développement)

Fonctionnalités à venir :
- Smart Mode Pro (reformulation intelligente via IA on-device)
- Vocabulaire personnalisé (dictionnaire de termes techniques)
- Historique des transcriptions (journal local avec recherche)
- Transcription de fichiers audio (import et transcription locale)

## Design — Brand Kit

Le brand kit complet est dans `/dictus-brand-kit.html` (ouvrir dans un navigateur pour le visualiser).

### Direction artistique

- **Ton** : Premium, sombre, glassmorphism
- **Cohérence** : Aligné avec iOS 26 Liquid Glass
- **Ambiance** : Dark UI professionnelle, accents bleus lumineux

### Couleurs principales

| Token | Hex | Usage |
|-------|-----|-------|
| Ink Deep | `#0A1628` | Background principal |
| Ink | `#0B0F1A` | Background body |
| Ink 2 | `#111827` | Background secondaire |
| Surface | `#161C2C` | Cards, panels |
| Navy | `#0F3460` | Gradient icône |
| Accent Blue | `#3D7EFF` | CTA, boutons, éléments actifs |
| Accent Hi | `#6BA3FF` | Highlights, hover |
| Sky | `#93C5FD` | Highlights, icônes |
| Mist | `#DBEAFE` | Texte sur fond clair |
| White | `#FFFFFF` | Texte principal sur sombre |
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
- **Button** : `linear-gradient(135deg, #1A4E8A, #0F3460)`
- **Bar accent** : `linear-gradient(180deg, #6BA3FF, #2563EB)`

### Typographie

| Rôle | Font | Weight | Détails |
|------|------|--------|---------|
| Display / Wordmark | DM Sans | 200 | `letter-spacing: -0.03em`, lowercase "dictus" |
| Heading | DM Sans | 400 | Titres de sections |
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

- Toujours utiliser le logo sur fond sombre (#0A1628 ou équivalent)
- Ne pas utiliser le logo sur fond coloré vif ou photographique sans couche sombre
- Respecter les proportions de l'icône — ne pas déformer
- Le site doit être responsive et performant (Lighthouse 90+)
- Langue principale : français, avec possibilité d'anglais

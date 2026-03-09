# dictus — Landing Page

## What This Is

Site web marketing pour dictus, un clavier iOS de dictation vocale 100% offline et open source. Le site sert de vitrine pour présenter l'app, ses valeurs (privacy, open source, gratuit) et fédérer une communauté autour du projet. Développé par PIVI Solutions, déployé sur getdictus.com.

## Core Value

Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first à la dictation vocale, et lui donner envie de tester l'app.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Hero section impactante avec animation sinusoïde de transcription + texte qui apparaît mot par mot
- [ ] Section features détaillée (privacy/offline, smart mode LLM, clavier tiers iOS, open source)
- [ ] Section open source avec lien vers le repo GitHub (github.com/Pivii/dictus)
- [ ] CTA principal vers TestFlight (ou badge "Coming Soon" tant que pas dispo)
- [ ] Lien vers groupe Telegram pour la communauté
- [ ] Design dark premium, glassmorphism, aligné iOS 26 Liquid Glass
- [ ] Animations fluides et soignées (MCP Gemini pour le design)
- [ ] Site bilingue FR/EN avec switch i18n
- [ ] Responsive et performant (Lighthouse 90+)
- [ ] Respect intégral du brand kit (couleurs, typo DM Sans/Mono, logo waveform)

### Out of Scope

- Email capture / newsletter — pas de collecte de données, cohérent avec la philosophie privacy
- Backend / API — site statique, pas de serveur
- Blog / contenu dynamique — landing page uniquement
- App Store listing — l'app n'est pas encore en release

## Context

- dictus est en développement actif, utilisé uniquement en local par le créateur
- TestFlight sera la prochaine étape, le site pourra sortir avant ou au moment du TestFlight
- L'app utilise des modèles de transcription open source on-device (Whisper et variantes)
- Le design de l'app tourne autour du Liquid Glass (iOS 26)
- L'animation de transcription dans l'app utilise une sinusoïde (pas une waveform classique)
- Le brand kit complet est dans `/dictus-brand-kit.html`
- Le repo GitHub de l'app : github.com/Pivii/dictus
- Le repo du site sera : github.com/Pivii/dictus-website
- Communauté : groupe Telegram (à créer)

## Constraints

- **Stack** : Next.js (App Router) + Tailwind CSS — choix du développeur, même si overkill pour une landing
- **Déploiement** : Vercel
- **Design** : Doit suivre le brand kit à la lettre (couleurs, typo, logo)
- **Performance** : Lighthouse 90+ sur toutes les métriques
- **Langue** : FR + EN avec i18n
- **Philosophie** : Zéro tracking, zéro collecte de données sur le site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js plutôt que site statique simple | Préférence du dev, écosystème riche, i18n facile | — Pending |
| Telegram plutôt qu'email capture | Cohérent avec privacy-first, plus communautaire | — Pending |
| Pas de collecte de données | Aligné avec la philosophie de l'app | — Pending |
| Bilingue FR/EN dès le v1 | Audience internationale pour un projet open source | — Pending |
| MCP Gemini pour le design/animations | Levier IA pour du frontend premium | — Pending |

---
*Last updated: 2026-03-09 after initialization*

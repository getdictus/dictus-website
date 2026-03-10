# dictus — Landing Page

## What This Is

Premium dark marketing landing page for dictus, an offline iOS voice dictation keyboard. Bilingual FR/EN site featuring animated hero with canvas waveform and word-by-word text reveal, glassmorphism UI, 7 content sections, and Lighthouse 90+ scores. Built with Next.js 16 (App Router) + Tailwind v4, deployed on Vercel. Developed by PIVI Solutions at getdictus.com.

## Core Value

Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.

## Requirements

### Validated

- ✓ Hero section with animated canvas waveform, word-by-word text reveal, Coming Soon badge — v1.0
- ✓ 7 content sections (Hero, Features, HowItWorks, DataFlow, OpenSource, Community, Footer) with glassmorphism — v1.0
- ✓ Open source section with GitHub link (github.com/Pivii/dictus) — v1.0
- ✓ Community CTA (Telegram) — v1.0
- ✓ Dark premium design aligned with brand kit (colors, DM Sans/Mono, waveform logo) — v1.0
- ✓ Scroll-triggered animations with prefers-reduced-motion support (Motion v12 LazyMotion) — v1.0
- ✓ Bilingual FR/EN with URL-based routing and browser locale detection (next-intl v4) — v1.0
- ✓ Responsive and performant (Lighthouse 97-98/93/100/92, touch targets 44px+) — v1.0
- ✓ SEO complete (OG tags, JSON-LD, hreflang, sitemap) — v1.0
- ✓ Zero third-party scripts, zero tracking, zero cookies — v1.0

### Active

- [ ] Comparison table: Dictus vs Apple Dictation, WhisperFlow, SuperWhisper, MacWhisper (COMP-*)
- [ ] Hero waveform animation: flat → voice simulation → transcription synced (HERO-*)
- [ ] Demo video sections: app recordings integrated in HowItWorks/DataFlow (DEMO-*)
- [ ] Liquid Glass effects: iOS 26 style glassmorphism across site elements (GLASS-*)
- [ ] Light mode: new theme inspired by Dictus iOS app colors (THEME-*)
- [ ] Adaptive TestFlight CTA: device detection iPhone/desktop, TestFlight link (CTA-*)

### Out of Scope

- Email capture / newsletter — contradicts privacy-first positioning
- Analytics / tracking — zero tracking is the stance
- Cookie consent banner — no cookies = no banner needed
- Blog / CMS — scope creep, landing page only
- Parallax scrolling — janky on mobile Safari, dated in 2026
- Chat widget / support — GitHub Issues + Telegram suffice
- Social media embeds — third-party scripts, contradicts privacy
- Multi-page navigation — single landing page, one flow, one CTA
- App Store badge + screenshots section — deferred, not yet on TestFlight

## Current Milestone: v1.1 Polish & Differentiation

**Goal:** Enrichir le site avec du contenu comparatif, des demos visuelles, des effets Liquid Glass, un mode clair, et un CTA TestFlight adaptatif.

**Target features:**
- Tableau comparatif multi-concurrents (prix, offline, privacy, plateformes, IA, open source)
- Animation hero waveform enrichie (flat → voix → transcription)
- Sections demo avec videos de l'app (filmees par l'utilisateur)
- Effets Liquid Glass iOS 26 sur les elements du site
- Mode clair inspire des couleurs de l'app Dictus
- CTA adaptatif TestFlight avec detection device

## Context

Shipped v1.0 with 1,600 LOC TypeScript/CSS across 27 source files.
Tech stack: Next.js 16 (App Router), Tailwind v4, next-intl v4, Motion v12, Vercel.
dictus app is in active development -- TestFlight is the next milestone for the app itself.
Telegram group link is placeholder (#) until community is created.
v1.1 brings light mode back in scope (previously excluded) -- user decision to align website with iOS app theming.

## Constraints

- **Stack**: Next.js (App Router) + Tailwind CSS
- **Deployment**: Vercel
- **Design**: Must follow brand kit (colors, typo, logo)
- **Performance**: Lighthouse 90+ on all metrics
- **Language**: FR + EN with i18n
- **Philosophy**: Zero tracking, zero data collection

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js plutot que site statique simple | Ecosysteme riche, i18n facile | ✓ Good -- App Router + next-intl worked well |
| Telegram plutot qu'email capture | Coherent avec privacy-first | ✓ Good -- aligned with brand |
| Pas de collecte de donnees | Aligne avec la philosophie de l'app | ✓ Good -- Lighthouse Best Practices 100 |
| Bilingue FR/EN des le v1 | Audience internationale pour projet open source | ✓ Good -- next-intl v4 seamless |
| Tailwind v4 @theme in globals.css | Single source of truth for design tokens | ✓ Good -- clean token system |
| Canvas vertical bars (iOS port) over sine curve | Match iOS app BrandWaveform.swift | ✓ Good -- visual consistency |
| Motion v12 LazyMotion (~4.6kb) | Tree-shakeable, small bundle | ✓ Good -- minimal perf impact |
| Webpack over Turbopack for production | Turbopack PNG processing bug in Next.js 16.1.6 | ⚠️ Revisit -- check newer Next.js versions |
| white-40 opacity bumped to 0.60 for WCAG AA | Contrast compliance, token name kept | ✓ Good -- passes WCAG AA |

| Light mode added to v1.1 scope | Align website with iOS app theming, user request | -- Pending |

---
*Last updated: 2026-03-10 after v1.1 milestone start*

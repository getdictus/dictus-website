# dictus — Landing Page

## What This Is

Premium marketing landing page for dictus, an offline iOS voice dictation keyboard. Bilingual FR/EN site featuring light/dark theme with Liquid Glass glassmorphism, animated hero with choreographed canvas waveform, competitor comparison table, adaptive TestFlight CTA, and Lighthouse 90+ scores. Built with Next.js 16 (App Router) + Tailwind v4 + next-themes, deployed on Vercel. Developed by PIVI Solutions at getdictus.com.

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
- ✓ Light/dark theme system with CSS variable swap, next-themes, FOWT prevention — v1.1
- ✓ Sun/moon theme toggle with animated SVG morph, theme-aware canvas waveform — v1.1
- ✓ Two-tier Liquid Glass glassmorphism (Nav/Hero Tier 1, section cards Tier 2) — v1.1
- ✓ 3-phase waveform choreography (flat/active/calm) synced to demo state — v1.1
- ✓ Competitor comparison table (5 products x 6 dimensions) with mobile card stack — v1.1
- ✓ Adaptive TestFlight CTA with device detection, QR code, fallback badge — v1.1
- ✓ Bilingual privacy policy (10 Apple-required sections) and support page — v1.2
- ✓ Footer links to Privacy Policy and Support on every page — v1.2
- ✓ Isolated Remotion workspace with deterministic waveform math — v1.2
- ✓ DictusPromo 5-beat storyboard with smoothed waveform, spring animations — v1.2
- ✓ 4 rendered MP4 promos (FR/EN × dark/light), H.264, theme-aware — v1.2

### Active

- [ ] Page /donate bilingue FR/EN avec Stripe (fiat) + BTCPay Server (Bitcoin) — v1.3
- [ ] Webhooks Stripe/BTCPay vers bot Telegram pour notifications de dons — v1.3
- [ ] Badges Desktop Coming Soon (Mac/Windows/Linux) avec auto-detection OS — v1.3
- [ ] Mise a jour des textes : Dictus n'est plus mobile-only — v1.3
- [ ] Icone X/Twitter dans le footer — v1.3

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
- Embedding promo video on landing page — tested, deemed unnecessary (video used externally)

## Context

Shipped v1.2 with 2,623 LOC TypeScript/CSS across ~50 source files.
Tech stack: Next.js 16 (App Router), Tailwind v4, next-intl v4, next-themes, Motion v12, qrcode.react, Vercel.
Remotion workspace in `video/` for promo video generation (dev-only, not shipped to production).
Contact email updated to contact@pivi.solutions.
dictus app is in active development -- iOS + Android beta, Desktop (Mac/Windows/Linux) in development (fork of Handy).
Telegram group link is placeholder (#) until community is created.
Adaptive CTA ready for TestFlight URL (env var NEXT_PUBLIC_TESTFLIGHT_URL).
Twitter/X account: https://x.com/getdictus
GitHub issues #3, #4, #5 track donate page, webhooks, and footer social link.
GitHub issue #2 tracks CDN (blob.getdictus.com) — deferred, not in v1.3.

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
| Light mode via CSS variable swap (dark-origin names) | Zero-churn migration, no component files needed updating | ✓ Good -- 9 swappable tokens, 10 static |
| next-themes with class strategy | SSR-safe, system preference support, FOWT prevention | ✓ Good -- seamless light/dark |
| Two-tier glass system (Tier 1/Tier 2) | Depth hierarchy matches iOS Liquid Glass philosophy | ✓ Good -- clear visual hierarchy |
| No nested backdrop-filter | Avoids Safari rendering artifacts | ✓ Good -- TextReveal uses bg-only |
| Client-side device detection in useEffect | Prevents React hydration mismatch | ✓ Good -- SSR renders fallback, detects on mount |
| qrcode.react for desktop TestFlight QR | Lightweight, no external service dependency | ✓ Good -- privacy-aligned |
| Remotion as dev-only tool, pre-rendered MP4 | No Player in production (+150-250kb), zero Lighthouse regression | ✓ Good -- static MP4s served |
| Promo video instead of demo video | Demo screen recordings done separately by user | ✓ Good -- cleaner separation |
| Video NOT embedded on landing page | Tested integration, deemed unnecessary for conversion | ✓ Good -- simpler Hero |
| Contact email contact@pivi.solutions | Professional contact vs personal email | ✓ Good |

---
*Last updated: 2026-04-09 after v1.3 milestone created*

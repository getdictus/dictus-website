# Research Summary: dictus Landing Page

**Domain:** Premium animated iOS app landing page
**Researched:** 2026-03-09
**Overall confidence:** HIGH

## Executive Summary

The dictus landing page is a well-scoped project with a clear, decided stack: Next.js 16 App Router + Tailwind CSS 4 + Vercel. Research focused on filling the gaps around that core: animation libraries, internationalization, glassmorphism techniques, and performance optimization.

**Motion (formerly Framer Motion) v12** is the clear animation library choice. It offers declarative React-native animations, gesture support, and scroll-triggered reveals -- all needed for the sinusoidal waveform, word-by-word text reveal, and state-based micro-animations. The critical finding is that Motion's default import adds ~34kb to the bundle, but using LazyMotion + the `m` component reduces this to ~4.6kb. This optimization must be applied from day one, not retrofitted.

**next-intl v4** is the standard i18n solution for Next.js App Router in 2026, with 1.8M weekly npm downloads and native Server Component support. It provides locale-based routing via middleware, ~2kb bundle size, and TypeScript type safety. The main caveat: it requires server runtime (incompatible with `output: 'export'`), which is fine on Vercel.

**Glassmorphism should be pure CSS** -- no library needed. `backdrop-filter: blur()` has 95%+ browser support. The critical constraint is performance: limit blurred elements to 5-6 per viewport. Advanced SVG liquid glass filters are not cross-browser safe and should be avoided.

## Key Findings

**Stack:** Next.js 16 + Tailwind 4 + Motion 12 + next-intl 4 + pure CSS glassmorphism
**Architecture:** Server Components by default, thin "use client" animation wrappers, locale-routed `[locale]/` directory
**Critical pitfall:** "use client" cascade -- one wrong directive can send entire sections as client JS, killing Lighthouse scores

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation** - Project setup, Tailwind brand tokens, fonts, i18n skeleton
   - Addresses: Tailwind v4 CSS-first config, next-intl routing, DM Sans/Mono via next/font
   - Avoids: v3 config confusion, middleware/static export conflict

2. **Content & Layout** - All sections with static content, responsive design, glassmorphism
   - Addresses: Hero, features, open source, CTA, footer sections in both FR/EN
   - Avoids: Building animations before content is finalized (animation rework risk)

3. **Animations** - Motion integration, waveform, text reveal, scroll animations
   - Addresses: Sinusoidal waveform, word-by-word reveal, state indicators, scroll reveals
   - Avoids: Bundle bloat (LazyMotion from start), LCP blocking (defer waveform)

4. **Polish & Performance** - Lighthouse audit, OG images, accessibility check, final QA
   - Addresses: 90+ Lighthouse target, WCAG contrast, social sharing previews
   - Avoids: Shipping with accessibility issues or missing SEO metadata

**Phase ordering rationale:**
- Foundation first because every other phase depends on tokens, fonts, and i18n
- Content before animations because animation targets (elements, timing) depend on final content layout
- Animations as a dedicated phase because Motion integration needs focused attention on bundle size and performance
- Polish last because Lighthouse auditing requires all content and animations in place

**Research flags for phases:**
- Phase 3 (Animations): Will likely need deeper research for the sinusoidal waveform implementation specifically (Canvas vs SVG, math for the sine curve, performance on mobile)
- Phase 1-2: Standard patterns, unlikely to need additional research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm/official sources. Well-established ecosystem. |
| Features | HIGH | Requirements clearly defined in PROJECT.md. Feature landscape is standard for app landing pages. |
| Architecture | HIGH | Standard Next.js App Router patterns. Server/Client component split is well-documented. |
| Pitfalls | HIGH | Performance pitfalls (Motion bundle, backdrop-filter) are well-documented in official docs. |
| Waveform implementation | MEDIUM | Sinusoidal animation is custom work. Canvas vs SVG tradeoff needs phase-specific research. |

## Gaps to Address

- **Sinusoidal waveform implementation:** The exact technique (Canvas 2D, SVG path animation, or WebGL) needs prototyping during Phase 3. Canvas is likely best for smooth sine curves, but SVG might be simpler.
- **WCAG contrast verification:** The brand kit's `rgba(255,255,255,0.40)` secondary text color needs testing against dark backgrounds for WCAG AA compliance.
- **OG image design:** Needs to be created per locale. Consider using Vercel's `@vercel/og` for dynamic OG generation or static images.
- **TestFlight link handling:** Need a strategy for the CTA when TestFlight is not yet available (Coming Soon state vs. Telegram redirect).

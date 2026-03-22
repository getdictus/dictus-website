# Milestones

## v1.2 Video & Compliance (Shipped: 2026-03-22)

**Phases completed:** 2 phases, 6 plans
**Timeline:** 3 days (2026-03-19 → 2026-03-21)
**Stats:** 58 files changed, +8,609/-321 lines, 2,623 LOC in src/

**Key accomplishments:**
- Bilingual privacy policy (10 Apple-required sections) and support pages for App Store compliance
- Footer links and sitemap integration for compliance pages
- Isolated Remotion workspace with deterministic waveform math (seeded sin-hash, frame-based)
- DictusPromo composition: 5-beat storyboard with smoothed waveform bars, spring animations
- 4 rendered MP4 promos (FR/EN × dark/light) with theme-aware colors
- Hero simplified (demo state machine removed), Logo refined with stroke glow

**Scope changes:**
- Phase 10 (Video Integration) removed — embedding video on landing page deemed unnecessary
- VID-06 requirement dropped by design
- Pivoted from demo video to promo video (screen recordings done separately by user)
- Contact email updated from pierre@pivi.solutions to contact@pivi.solutions

---

## v1.1 Polish & Differentiation (Shipped: 2026-03-17)

**Phases completed:** 3 phases, 6 plans
**Timeline:** 7 days (2026-03-11 → 2026-03-17)
**Stats:** 50 files changed, +4,838/-389 lines, 2,770 LOC in src/

**Key accomplishments:**
- Light/dark theme system with CSS variable swap pattern (9 swappable tokens), next-themes, and FOWT prevention
- Sun/moon animated toggle with framer-motion SVG morph, theme-aware canvas waveform with color lerp
- Two-tier Liquid Glass glassmorphism: Tier 1 frosted glass on Nav/Hero, Tier 2 soft glass on all section cards
- 3-phase waveform choreography (flat/active/calm) synced to demo state machine with reduced-motion static frame
- Competitor comparison table (5 products x 6 dimensions) with desktop sticky header and mobile card stack
- Adaptive TestFlight CTA with client-side device detection, QR code for desktop, direct button for iPhone

**Known gaps (stale tracking only):**
- THEME-01 and THEME-03 were completed (per 05-02-SUMMARY.md) but checkboxes not updated in REQUIREMENTS.md before archive

---

## v1.0 dictus Landing Page (Shipped: 2026-03-10)

**Phases completed:** 4 phases, 10 plans
**Timeline:** 2 days (2026-03-09 → 2026-03-10)
**Stats:** 27 source files, 1,600 LOC TypeScript/CSS, 60 commits

**Key accomplishments:**
- Next.js 16 scaffold with Tailwind v4 design tokens, self-hosted DM Sans/Mono fonts, dark-only brand styling
- Full bilingual FR/EN landing page with 7 content sections, glassmorphism cards, and responsive layout (320px-desktop)
- Canvas waveform animation (iOS BrandWaveform port), word-by-word text reveal, 5-state micro-animation cycle
- Scroll-triggered section reveals with prefers-reduced-motion support via Motion v12 LazyMotion
- SEO metadata (OG tags, JSON-LD, hreflang, sitemap) and Lighthouse 90+ on all 4 metrics
- Zero third-party scripts -- complete privacy-first architecture (no analytics, no cookies, self-hosted fonts)

**Tech debt carried forward:**
- Telegram CTA href="#" placeholders (pre-launch, intentional)
- Dead exports: staggerChildVariants, staggerChildReducedVariants in ScrollReveal.tsx
- LanguageToggle aria-labels hardcoded instead of using i18n translations

---


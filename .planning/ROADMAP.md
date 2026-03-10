# Roadmap: dictus Landing Page

## Overview

Ship a premium dark landing page for dictus -- an offline iOS voice dictation keyboard. The journey moves from project scaffold with design tokens and i18n routing, through all content sections with glassmorphism styling, into polished animations (sinusoidal waveform, word-by-word reveal, scroll triggers), and finishes with a Lighthouse/SEO audit pass to hit 90+ across all metrics.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js scaffold, design system tokens, self-hosted fonts, i18n routing, nav shell
- [x] **Phase 2: Content & Layout** - All page sections with static content, responsive layout, glassmorphism cards (completed 2026-03-09)
- [x] **Phase 3: Animations** - Motion library integration, sinusoidal waveform, text reveal, scroll triggers, state micro-animations (completed 2026-03-09)
- [ ] **Phase 4: Polish & Performance** - Lighthouse 90+ audit, SEO metadata, OG images, hreflang, final QA

## Phase Details

### Phase 1: Foundation
**Goal**: A running Next.js app with the complete design system, i18n routing, and a visible nav -- the skeleton everything else builds on
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-04, NAV-01, NAV-04, I18N-01, I18N-02, PRIV-01
**Success Criteria** (what must be TRUE):
  1. Visiting /fr and /en renders the correct locale with the dictus nav header and waveform logo
  2. Browser locale detection redirects a first-time visitor to the matching language
  3. All brand kit color tokens and DM Sans/Mono fonts are available in Tailwind and render correctly
  4. Zero third-party scripts load -- fonts are self-hosted via next/font, no external requests
  5. The dictus squircle icon appears as favicon and Apple touch icon
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- Next.js 16 scaffold, Tailwind v4 design tokens, self-hosted fonts, favicon
- [x] 01-02-PLAN.md -- i18n routing (next-intl v4), locale detection, nav shell with logo + language toggle

### Phase 2: Content & Layout
**Goal**: Every content section is built, styled, and bilingual -- a visitor can read the full page and understand what dictus is
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-04, NAV-02, NAV-03, FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FOOT-01, DSGN-03, PERF-02, PRIV-02
**Success Criteria** (what must be TRUE):
  1. User lands on the hero and reads a compelling headline about offline voice dictation within 3 seconds
  2. User can tap the primary CTA to reach TestFlight (or sees a "Coming Soon" badge)
  3. User can scroll through feature cards, "How it works" steps, data flow diagram, open source section, and community CTA
  4. User can toggle FR/EN from the nav and all content switches language; nav shows glassmorphism blur on scroll
  5. Page is fully responsive -- layout works on 320px mobile through desktop, touch targets are 44px+
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md -- Hero section with Coming Soon badge, all bilingual translations, page composition
- [x] 02-02-PLAN.md -- Features, How It Works, Data Flow, Open Source, Community, Footer sections
- [x] 02-03-PLAN.md -- Responsive QA, touch target audit, and human visual verification
- [x] 02-04-PLAN.md -- Gap closure: nav glassmorphism blur on scroll (NAV-03)

### Phase 3: Animations
**Goal**: The page feels alive -- waveform pulses, text appears word-by-word, sections reveal on scroll, and state indicators cycle through dictus modes
**Depends on**: Phase 2
**Requirements**: HERO-02, HERO-03, ANIM-01, ANIM-02, ANIM-03
**Success Criteria** (what must be TRUE):
  1. User sees an animated sinusoidal waveform in the hero simulating real-time voice input
  2. User sees text appearing word-by-word alongside the waveform, demonstrating the dictation experience
  3. Sections fade/slide into view as the user scrolls down the page
  4. User sees a micro-animation cycling through idle, recording, transcribing, smart mode, and inserted states
  5. Users with `prefers-reduced-motion` see no motion animations -- all animations are disabled or simplified
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md -- LazyMotion provider, ScrollReveal component, scroll-triggered section reveals
- [x] 03-02-PLAN.md -- Canvas sinusoidal waveform, word-by-word text reveal, state micro-animation, hero rework

### Phase 4: Polish & Performance
**Goal**: The site ships production-ready -- Lighthouse 90+ on all metrics, complete SEO metadata, and verified accessibility
**Depends on**: Phase 3
**Requirements**: PERF-01, SEO-01, SEO-02
**Success Criteria** (what must be TRUE):
  1. Lighthouse scores 90+ on Performance, Accessibility, Best Practices, and SEO for both /fr and /en
  2. Sharing the site URL on social media shows correct Open Graph title, description, and image per locale
  3. Search engines see hreflang tags linking FR/EN alternates and a valid sitemap.xml
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md -- SEO metadata (generateMetadata, OG tags, hreflang), sitemap, robots, JSON-LD, OG image, accessibility fixes (contrast, skip-to-content, ARIA)
- [ ] 04-02-PLAN.md -- Lighthouse audit on /fr and /en, fix issues until 90+ on all metrics, human verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 --> 2 --> 3 --> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-03-09 |
| 2. Content & Layout | 4/4 | Complete   | 2026-03-09 |
| 3. Animations | 2/2 | Complete   | 2026-03-09 |
| 4. Polish & Performance | 0/2 | Not started | - |

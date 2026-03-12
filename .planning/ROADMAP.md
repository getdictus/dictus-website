# Roadmap: dictus Landing Page

## Overview

Marketing landing page for dictus -- an offline iOS voice dictation keyboard by PIVI Solutions. Premium dark design with glassmorphism, bilingual FR/EN, animated hero with waveform and text reveal, Lighthouse 90+ across all metrics.

## Milestones

- ✅ **v1.0 dictus Landing Page** — Phases 1-4 (shipped 2026-03-10)
- 🚧 **v1.1 Polish & Differentiation** — Phases 5-7 (in progress)

## Phases

<details>
<summary>v1.0 dictus Landing Page (Phases 1-4) — SHIPPED 2026-03-10</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-09
- [x] Phase 2: Content & Layout (4/4 plans) — completed 2026-03-09
- [x] Phase 3: Animations (2/2 plans) — completed 2026-03-09
- [x] Phase 4: Polish & Performance (2/2 plans) — completed 2026-03-10

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### v1.1 Polish & Differentiation

- [ ] **Phase 5: Theme System** - Light/dark mode with semantic token migration, toggle, and FOWT prevention
- [x] **Phase 6: Visual Effects** - Liquid Glass glassmorphism and enhanced hero waveform animation sequence (completed 2026-03-12)
- [ ] **Phase 7: Content & CTA** - Competitor comparison table and adaptive TestFlight call-to-action

## Phase Details

### Phase 5: Theme System
**Goal**: Users can switch between light and dark themes with a smooth, persistent, flash-free experience
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, THEME-06
**Success Criteria** (what must be TRUE):
  1. User can toggle between light, dark, and system theme from the navigation bar
  2. Entire site renders correctly in both themes -- no invisible text, broken contrast, or stale colors anywhere across all 7 sections
  3. Canvas waveform colors adapt to the active theme without page reload
  4. Theme preference survives browser restart and there is no flash of wrong theme on initial load
  5. Theme transition feels smooth (no harsh snap between color schemes)
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Theme infrastructure: CSS variable swap, next-themes provider, FOWT prevention
- [ ] 05-02-PLAN.md — Theme toggle UI, waveform theme adaptation, visual verification

### Phase 6: Visual Effects
**Goal**: Site elements gain iOS 26 Liquid Glass depth and the hero waveform tells a choreographed product story
**Depends on**: Phase 5 (needs both themes stable for glass tuning and theme-reactive waveform colors)
**Requirements**: GLASS-01, GLASS-02, GLASS-03, GLASS-04, GLASS-05, HERO-01, HERO-02, HERO-03, HERO-04, HERO-05
**Success Criteria** (what must be TRUE):
  1. Nav bar, hero overlay, and 2-3 feature cards display a frosted glass effect with visible depth (blur + saturation)
  2. Liquid Glass looks correct in both light and dark themes and does not cause jank or battery drain on mobile Safari
  3. Hero waveform plays a visible multi-phase sequence: starts flat, animates with voice energy, then calms as transcription text appears
  4. Users with prefers-reduced-motion see static or minimal alternatives for all animations
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Liquid Glass: CSS tokens, Tier 1 glass on Nav/Hero, Tier 2 glass on all section cards
- [ ] 06-02-PLAN.md — Waveform 3-phase choreography (flat/active/calm), Hero prop wiring, reduced motion static frame

### Phase 7: Content & CTA
**Goal**: Visitors can compare Dictus against competitors at a glance and iPhone users get a direct path to TestFlight
**Depends on**: Phase 5 (needs theme tokens for styled components); independent of Phase 6
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, CTA-01, CTA-02, CTA-03, CTA-04, CTA-05
**Success Criteria** (what must be TRUE):
  1. User can view a comparison table showing Dictus vs 4 competitors across 6 feature dimensions, with Dictus column visually highlighted
  2. Comparison table is usable on mobile (card layout or equivalent) and on desktop (table with sticky header)
  3. Comparison data displays in the correct language (FR or EN) matching the site locale
  4. iPhone visitors see a "Join TestFlight" button while desktop visitors see an "Available on iPhone" message with TestFlight URL or QR code
  5. CTA gracefully falls back to current "Coming Soon" behavior if TestFlight URL is not yet configured
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7
Note: Phase 7 depends only on Phase 5, not Phase 6. If Phase 6 is blocked, Phase 7 can proceed after Phase 5.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Content & Layout | v1.0 | 4/4 | Complete | 2026-03-09 |
| 3. Animations | v1.0 | 2/2 | Complete | 2026-03-09 |
| 4. Polish & Performance | v1.0 | 2/2 | Complete | 2026-03-10 |
| 5. Theme System | v1.1 | 0/2 | Not started | - |
| 6. Visual Effects | 2/2 | Complete   | 2026-03-12 | - |
| 7. Content & CTA | v1.1 | 0/? | Not started | - |

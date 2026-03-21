# Roadmap: dictus Landing Page

## Overview

Marketing landing page for dictus -- an offline iOS voice dictation keyboard by PIVI Solutions. Premium design with light/dark theme, Liquid Glass glassmorphism, bilingual FR/EN, animated hero with choreographed waveform, competitor comparison, adaptive TestFlight CTA, Lighthouse 90+ across all metrics.

## Milestones

- ✅ **v1.0 dictus Landing Page** — Phases 1-4 (shipped 2026-03-10)
- ✅ **v1.1 Polish & Differentiation** — Phases 5-7 (shipped 2026-03-17)
- ✅ **v1.2 Video & Compliance** — Phases 8-9 (shipped 2026-03-21)

## Phases

<details>
<summary>✅ v1.0 dictus Landing Page (Phases 1-4) — SHIPPED 2026-03-10</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-09
- [x] Phase 2: Content & Layout (4/4 plans) — completed 2026-03-09
- [x] Phase 3: Animations (2/2 plans) — completed 2026-03-09
- [x] Phase 4: Polish & Performance (2/2 plans) — completed 2026-03-10

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Polish & Differentiation (Phases 5-7) — SHIPPED 2026-03-17</summary>

- [x] Phase 5: Theme System (2/2 plans) — completed 2026-03-11
- [x] Phase 6: Visual Effects (2/2 plans) — completed 2026-03-12
- [x] Phase 7: Content & CTA (2/2 plans) — completed 2026-03-12

Full details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

### ✅ v1.2 Video & Compliance — SHIPPED 2026-03-21

**Milestone Goal:** Create a Remotion promo video and add App Store compliance pages (privacy policy, support URL).

- [x] **Phase 8: App Store Compliance** - Bilingual privacy policy, support page, and footer links to unblock App Store submission
- [x] **Phase 9: Remotion Promo Video** - Isolated Remotion workspace with promo composition (5-beat storyboard), 4 rendered variants (FR/EN × dark/light)
- ~~Phase 10: Video Integration~~ — Removed: video integration on landing page deemed unnecessary

## Phase Details

### Phase 8: App Store Compliance
**Goal**: Visitors can access privacy policy and support information, unblocking App Store submission
**Depends on**: Nothing (independent of video work)
**Requirements**: COMP-01, COMP-02, COMP-03
**Success Criteria** (what must be TRUE):
  1. Visiting `/fr/privacy` and `/en/privacy` displays a complete bilingual privacy policy covering all 8+ Apple-required sections
  2. Visiting `/fr/support` and `/en/support` displays a support page with contact email (pierre@pivi.solutions)
  3. Footer on every page contains working links to both Privacy Policy and Support pages
  4. New pages appear in the sitemap and follow existing i18n routing patterns
**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md — Privacy policy and support pages with bilingual i18n content
- [x] 08-02-PLAN.md — Footer links and sitemap integration

### Phase 9: Remotion Promo Video
**Goal**: A polished promotional MP4 video showcasing Dictus brand, waveform animation, and key messaging (offline, open source, on-device AI)
**Depends on**: Nothing (independent of compliance work)
**Requirements**: VID-01, VID-02, VID-03, VID-04, VID-05
**Success Criteria** (what must be TRUE):
  1. A `video/` workspace exists with its own package.json, fully isolated from the Next.js build
  2. The promo video features the Dictus waveform as central visual element with 4-state animation
  3. The video communicates key value props: 100% offline, open source, on-device AI
  4. Animations use spring physics with premium Apple-style aesthetic and punchy pacing
  5. FR and EN rendered MP4s (H.264, under 5MB) and poster images exist in `public/videos/`
**Plans:** 3/4 plans executed

Plans:
- [x] 09-01-PLAN.md — Remotion workspace setup and shared lib modules (waveform math, colors, i18n, springs)
- [x] 09-02-PLAN.md — Core visual components (Waveform, DictusKeyboard, StateIndicator, IPhoneMockup)
- [x] 09-03-PLAN.md — Scene components (Messages, Notes, TextReveal) and DictusDemo composition
- [x] 09-04-PLAN.md — DictusPromo: 5-beat storyboard with smoothed waveform, theme variants, bilingual renders

NOTE: Demo video (screen recordings) handled separately by user. Video integration on landing page removed (not needed).

## Progress

**Execution Order:**
Phases 8 and 9 can run in parallel (no dependencies). Phase 10 depends on Phase 9.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Content & Layout | v1.0 | 4/4 | Complete | 2026-03-09 |
| 3. Animations | v1.0 | 2/2 | Complete | 2026-03-09 |
| 4. Polish & Performance | v1.0 | 2/2 | Complete | 2026-03-10 |
| 5. Theme System | v1.1 | 2/2 | Complete | 2026-03-11 |
| 6. Visual Effects | v1.1 | 2/2 | Complete | 2026-03-12 |
| 7. Content & CTA | v1.1 | 2/2 | Complete | 2026-03-12 |
| 8. App Store Compliance | v1.2 | 2/2 | Complete | 2026-03-19 |
| 9. Remotion Promo Video | v1.2 | 4/4 | Complete | 2026-03-21 |

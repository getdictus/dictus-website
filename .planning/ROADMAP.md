# Roadmap: dictus Landing Page

## Overview

Marketing landing page for dictus -- an offline iOS voice dictation keyboard by PIVI Solutions. Premium design with light/dark theme, Liquid Glass glassmorphism, bilingual FR/EN, animated hero with choreographed waveform, competitor comparison, adaptive TestFlight CTA, Lighthouse 90+ across all metrics.

## Milestones

- ✅ **v1.0 dictus Landing Page** — Phases 1-4 (shipped 2026-03-10)
- ✅ **v1.1 Polish & Differentiation** — Phases 5-7 (shipped 2026-03-17)
- 🚧 **v1.2 Video & Compliance** — Phases 8-10 (in progress)

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

### 🚧 v1.2 Video & Compliance (In Progress)

**Milestone Goal:** Create a Remotion demo video for the landing page and add App Store compliance pages (privacy policy, support URL).

- [ ] **Phase 8: App Store Compliance** - Bilingual privacy policy, support page, and footer links to unblock App Store submission
- [ ] **Phase 9: Remotion Demo Video** - Isolated Remotion workspace with waveform port, iPhone mockup scenes, iOS animations, and final MP4 render
- [ ] **Phase 10: Video Integration** - Embed pre-rendered video on the landing page with lazy loading, zero Lighthouse regression

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
- [ ] 08-01-PLAN.md — Privacy policy and support pages with bilingual i18n content
- [ ] 08-02-PLAN.md — Footer links and sitemap integration

### Phase 9: Remotion Demo Video
**Goal**: A polished MP4 demo video exists showing the full dictus voice dictation flow with iOS-native feel
**Depends on**: Nothing (independent of compliance work)
**Requirements**: VID-01, VID-02, VID-03, VID-04, VID-05
**Success Criteria** (what must be TRUE):
  1. A `remotion/` workspace exists with its own package.json, fully isolated from the Next.js build (no Webpack conflicts)
  2. The video waveform matches the hero canvas waveform (30 bars, gradient center-weighted, 5 states: idle/recording/transcribing/smart/inserted)
  3. The video shows an iPhone mockup progressing through the complete demo flow: idle -> recording -> transcription -> smart mode -> insertion
  4. Animations use spring physics and transitions that feel iOS-native (not web-generic)
  5. A rendered MP4 (H.264, under 5MB) and poster image exist in `public/videos/`, ready for embedding
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Video Integration
**Goal**: Visitors see and can play the demo video on the landing page without any performance regression
**Depends on**: Phase 9
**Requirements**: VID-06
**Success Criteria** (what must be TRUE):
  1. A DemoVideo section on the landing page displays the video with a poster image and native `<video>` controls
  2. Video lazy-loads via IntersectionObserver with `preload="none"` -- zero bytes downloaded until the section is near viewport
  3. Lighthouse scores remain at 90+ on all four metrics after video integration (no regression from v1.1 baseline)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

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
| 8. App Store Compliance | v1.2 | 0/2 | Not started | - |
| 9. Remotion Demo Video | v1.2 | 0/? | Not started | - |
| 10. Video Integration | v1.2 | 0/? | Not started | - |

---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Video & Compliance
status: executing
stopped_at: Completed 09-02-PLAN.md
last_updated: "2026-03-19T22:28:20Z"
last_activity: 2026-03-19 — Completed 09-02 Core Visual Components
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 6
  completed_plans: 4
  percent: 67
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17)

**Core value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.
**Current focus:** Phase 9 - Remotion Demo Video

## Current Position

Phase: 9 of 10 (Remotion Demo Video)
Plan: 2 of 4 in current phase -- COMPLETE
Status: Executing phase 9
Last activity: 2026-03-19 — Completed 09-02 Core Visual Components

Progress: [███████░░░] 67% (v1.2 milestone)

## Accumulated Context

### Decisions

Full decision log in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.2]: Remotion as dev-only tool, pre-rendered MP4 served as static asset (no Player in production)
- [v1.2]: Privacy policy must cover all 8+ Apple-required sections even for zero-data app
- [v1.2]: Support URL must be a web page (not bare mailto:) for App Store Connect
- [08-01]: Contact email rendered as clickable mailto: link with accent-blue styling
- [08-01]: Telegram link uses placeholder href (#) pending actual group URL
- [08-01]: Privacy sections rendered via mapped array for maintainability
- [Phase 08]: Footer links placed between copyright/icons row and inline privacy statement
- [Phase 08]: Compliance sitemap pages get yearly changeFrequency and 0.3 priority
- [09-01]: Seeded sin-hash replaces Math.random for deterministic waveform targets
- [09-01]: Remotion v4 Composition typed with 'as any' cast due to dual-generic signature
- [09-01]: State durations compressed from 8.5s to 7s per cycle for video pacing
- [09-02]: Canvas ref callback redraws on every frame render — no stateful animation
- [09-02]: IPhoneMockup borderImage used for titanium gradient effect on realistic variant

### Pending Todos

None.

### Blockers/Concerns

- Video file size budget: target < 5MB MP4, may need compression iteration

## Session Continuity

Last session: 2026-03-19T22:28:20Z
Stopped at: Completed 09-02-PLAN.md
Resume file: .planning/phases/09-remotion-demo-video/09-03-PLAN.md

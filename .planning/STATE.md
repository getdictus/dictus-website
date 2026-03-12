---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Polish & Differentiation
status: executing
stopped_at: Completed 07-02-PLAN.md
last_updated: "2026-03-12T22:55:00Z"
last_activity: 2026-03-12 — 07-02 Adaptive CTA with device detection
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 6
  completed_plans: 6
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10)

**Core value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.
**Current focus:** Phase 7 — Content & CTA (complete)

## Current Position

Phase: 7 of 7 (Content & CTA) — third phase of v1.1
Plan: 2 of 2 in current phase (complete)
Status: Complete — all v1.1 phases finished
Last activity: 2026-03-12 — 07-02 Adaptive CTA with device detection

## Accumulated Context

### Decisions

Full decision log in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1 scope]: Light mode back in scope -- align website with iOS app theming
- [v1.1 scope]: Demo videos deferred to future milestone (need recorded app footage)
- [v1.1 research]: next-themes 0.4.6 for theme management (~1.5kb, FOWT prevention)
- [v1.1 research]: Liquid Glass uses CSS-only approach (SVG filters broken in Mobile Safari)
- [v1.1 roadmap]: Coarse granularity -- 3 phases (5-7), 28 requirements
- [05-01]: Kept dark-origin token names for zero-churn migration
- [05-01]: text-[var(--theme-text-primary)] instead of --color-white to avoid Tailwind v4 conflict
- [05-01]: 9 swappable tokens via var() indirection, 10 static tokens
- [05-02]: Added --color-text-primary to @theme for theme-safe headings
- [05-02]: Light mode icon containers use logo-matching dark navy (#0D2040)
- [05-02]: Made --color-sky theme-aware (#6BA3FF light, #93C5FD dark)
- [06-01]: Two-tier glass system via CSS custom properties (--glass-t1-bg, --glass-t2-bg)
- [06-01]: Inset box-shadow for Tier 1 gradient border (simpler than pseudo-element)
- [06-01]: No nested backdrop-filter -- TextReveal uses bg-only inside Hero glass
- [06-02]: phaseStartTimeRef initialized to 0 (not performance.now()) for React purity
- [06-02]: computeBarLayout helper extracted for shared bar positioning (animated + static frames)
- [07-01]: Exported CheckIcon/CrossIcon and data constants from ComparisonTable for reuse in ComparisonCards
- [07-01]: Semantic HTML table for desktop, card stack for mobile (responsive comparison pattern)
- [07-02]: Device detection in useEffect to prevent hydration mismatch (SSR renders fallback badge)
- [07-02]: QR code uses ink-deep foreground on white for brand consistency
- [07-02]: Other-mobile path shows text link only (cannot scan own screen)

### Pending Todos

None.

### Blockers/Concerns

- TestFlight URL not yet available -- CTA-04 fallback handles this gracefully
- Light mode color palette proposed but not designer-validated against iOS app
- Tailwind v4 @theme + next-themes interaction validated in 05-01 (works correctly)

## Session Continuity

Last session: 2026-03-12T22:55:00Z
Stopped at: Completed 07-02-PLAN.md
Resume file: .planning/phases/07-content-cta/07-02-SUMMARY.md

---
phase: 03-animations
plan: 01
subsystem: ui
tags: [motion, lazymotion, scroll-reveal, reduced-motion, animation]

requires:
  - phase: 02-content-layout
    provides: "Section components (Features, HowItWorks, DataFlow, OpenSource, Community) to animate"
provides:
  - "MotionProvider (LazyMotion with domAnimation) wrapping app content"
  - "ScrollReveal component for scroll-triggered fade+slide animations"
  - "staggerChildVariants export for child stagger patterns"
  - "Reduced-motion foundation for all Phase 3 animations"
affects: [03-animations]

tech-stack:
  added: [motion/react (LazyMotion, domAnimation, m, useReducedMotion)]
  patterns: [LazyMotion provider at layout level, m.div for lightweight animation proxies, useReducedMotion hook for a11y]

key-files:
  created:
    - src/components/shared/MotionProvider.tsx
    - src/components/shared/ScrollReveal.tsx
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx

key-decisions:
  - "MotionProvider wraps main but not Nav -- Nav has its own scroll behavior"
  - "Footer excluded from ScrollReveal -- scroll reveal at page bottom feels odd"
  - "staggerChildVariants exported for future section-internal stagger use"

patterns-established:
  - "LazyMotion with domAnimation at layout level for minimal bundle (~4.6kb)"
  - "m.div (not motion.div) for all animations within LazyMotion scope"
  - "useReducedMotion sets y=0 and duration=0 for instant visibility"
  - "ScrollReveal as client wrapper around server components (valid App Router pattern)"

requirements-completed: [ANIM-01, ANIM-03]

duration: 1min
completed: 2026-03-09
---

# Phase 3 Plan 01: Scroll Reveal Infrastructure Summary

**LazyMotion provider with ScrollReveal fade+slide wrapper animating 5 content sections on scroll, with reduced-motion support**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-09T16:56:39Z
- **Completed:** 2026-03-09T16:57:46Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- MotionProvider using LazyMotion with domAnimation for minimal bundle impact (~4.6kb)
- ScrollReveal component with fade+slide (40px, 0.6s easeOut), play-once, 20% viewport threshold
- Stagger variant support with exported staggerChildVariants for child elements
- prefers-reduced-motion respected: instant visibility with no motion
- 5 sections (Features, HowItWorks, DataFlow, OpenSource, Community) animate on scroll

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MotionProvider and ScrollReveal components** - `ba1655f` (feat)
2. **Task 2: Wire MotionProvider into layout and ScrollReveal around sections** - `af1fdf3` (feat)

## Files Created/Modified
- `src/components/shared/MotionProvider.tsx` - LazyMotion provider with domAnimation features
- `src/components/shared/ScrollReveal.tsx` - Scroll-triggered fade+slide wrapper with stagger and reduced-motion support
- `src/app/[locale]/layout.tsx` - Added MotionProvider wrapping main content
- `src/app/[locale]/page.tsx` - Wrapped 5 sections in ScrollReveal (Hero and Footer excluded)

## Decisions Made
- MotionProvider wraps main but not Nav -- Nav has its own scroll behavior and does not need animation context
- Footer excluded from ScrollReveal -- scroll reveal at the very bottom of page feels unnatural
- staggerChildVariants exported as named export for future use by section components needing child stagger

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- LazyMotion infrastructure ready for Hero animations (Plan 02) and any future motion work
- ScrollReveal pattern established for consistent scroll-triggered animations
- Reduced-motion foundation in place for all Phase 3 plans

---
*Phase: 03-animations*
*Completed: 2026-03-09*

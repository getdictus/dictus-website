---
phase: 03-animations
plan: 02
subsystem: ui
tags: [canvas, animation, waveform, text-reveal, state-machine, requestAnimationFrame]

# Dependency graph
requires:
  - phase: 03-animations/01
    provides: "MotionProvider, ScrollReveal, LazyMotion infrastructure"
  - phase: 02-content-layout/01
    provides: "Hero section structure, translation files"
provides:
  - "Canvas waveform component (iOS BrandWaveform-style vertical bars)"
  - "Word-by-word text reveal with glassmorphism input"
  - "State micro-animation cycling 5 dictation modes"
  - "useHeroDemoState orchestrator hook"
  - "useAnimationFrame rAF hook"
  - "Bilingual demo sentences (FR/EN)"
affects: [04-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Canvas rendering with retina support and ResizeObserver"
    - "State machine hook for timed animation orchestration"
    - "useAnimationFrame custom hook for rAF lifecycle"
    - "iOS-style waveform port (BrandWaveform.swift to Canvas)"

key-files:
  created:
    - src/hooks/useAnimationFrame.ts
    - src/hooks/useHeroDemoState.ts
    - src/components/Hero/Waveform.tsx
    - src/components/Hero/TextReveal.tsx
    - src/components/Hero/StateIndicator.tsx
  modified:
    - src/components/Hero/Hero.tsx
    - src/messages/fr.json
    - src/messages/en.json
    - src/app/globals.css

key-decisions:
  - "Canvas vertical bars (iOS BrandWaveform.swift port) instead of sinusoidal sine curves for waveform"
  - "30 rounded bars with center brand-blue and edge white-fade matching iOS design language"
  - "Waveform positioned at top of hero section (not centered behind text)"
  - "10s demo cycle: idle(1.5s) > recording(2s) > transcribing(2.5s) > smart(2s) > inserted(2s)"

patterns-established:
  - "Canvas waveform: retina-aware with ResizeObserver, aria-hidden for decorative elements"
  - "Animation hooks: useAnimationFrame for rAF lifecycle, useHeroDemoState for state orchestration"
  - "Reduced motion: static frame for canvas, full text without animation for text reveal"

requirements-completed: [HERO-02, HERO-03, ANIM-02, ANIM-03]

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 3 Plan 02: Hero Demo Animations Summary

**Canvas waveform (iOS BrandWaveform-style 30-bar), word-by-word text reveal in glassmorphism input, and 5-state dictation indicator cycling with bilingual demo sentences**

## Performance

- **Duration:** ~5 min (across continuation sessions)
- **Started:** 2026-03-09T22:00:00Z
- **Completed:** 2026-03-09T22:17:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Canvas waveform ported from iOS BrandWaveform.swift: 30 vertical rounded bars with brand-blue center and white-fade edges, sinusoidal traveling wave envelope
- Word-by-word text reveal in glassmorphism input with blinking cursor and organic typing timing (~250ms +/- 50ms)
- State indicator cycling through 5 dictation modes (idle, recording, transcribing, smart, inserted) with correct brand colors and pulse animations
- Shared orchestration hook (useHeroDemoState) syncing state indicator and text reveal in a 10s loop
- Bilingual demo sentences in both FR and EN with translated state labels

## Task Commits

Each task was committed atomically:

1. **Task 1: Create hooks and hero subcomponents** - `ad72f9a` (feat)
2. **Task 2: Rework Hero.tsx and add demo sentence translations** - `07db216` (feat)
3. **Task 3: Visual verification + waveform rework** - `14d977e` (feat)

## Files Created/Modified
- `src/hooks/useAnimationFrame.ts` - Custom rAF hook with cleanup
- `src/hooks/useHeroDemoState.ts` - State machine orchestrating 5 dictation modes + text reveal
- `src/components/Hero/Waveform.tsx` - Canvas waveform with 30 vertical bars (iOS port)
- `src/components/Hero/TextReveal.tsx` - Glassmorphism input with word-by-word reveal and blinking cursor
- `src/components/Hero/StateIndicator.tsx` - Colored dot + label cycling dictation states
- `src/components/Hero/Hero.tsx` - Reworked to compose Waveform + StateIndicator + TextReveal
- `src/messages/fr.json` - Added HeroDemo namespace with FR sentences and state labels
- `src/messages/en.json` - Added HeroDemo namespace with EN sentences and state labels
- `src/app/globals.css` - Added blink cursor keyframe animation

## Decisions Made
- Rewrote waveform from sinusoidal sine curves to iOS BrandWaveform.swift-style vertical bars after visual review (30 rounded bars, brand-blue center, white-fade edges)
- Positioned waveform at top of hero section rather than centered behind text for better visual hierarchy
- Used 10-second demo cycle timing for natural pacing of the dictation story

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Waveform visual style reworked post-checkpoint**
- **Found during:** Task 3 (visual verification)
- **Issue:** Sinusoidal sine curves did not match the iOS app's visual language
- **Fix:** Rewrote Waveform.tsx to port iOS BrandWaveform.swift: 30 vertical rounded bars with brand-blue center gradient and white-fade edges, sinusoidal traveling wave envelope
- **Files modified:** src/components/Hero/Waveform.tsx, src/components/Hero/Hero.tsx
- **Verification:** User visually approved; build passes
- **Committed in:** `14d977e`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Visual improvement aligning with iOS design language. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 3 animations complete: scroll reveals (plan 01) + hero demo animations (plan 02)
- Ready for Phase 4: Lighthouse audit, SEO metadata, OG images, hreflang
- Blocker resolved: sinusoidal waveform technique decided as Canvas vertical bars

---
*Phase: 03-animations*
*Completed: 2026-03-09*

---
phase: 09-remotion-demo-video
plan: 03
subsystem: video
tags: [remotion, react, animation, spring, i18n, ios]

requires:
  - phase: 09-remotion-demo-video (plan 01)
    provides: i18n content, spring configs, waveform math, colors
  - phase: 09-remotion-demo-video (plan 02)
    provides: IPhoneMockup, DictusKeyboard, StateIndicator, Waveform components
provides:
  - TextReveal word-by-word animation component
  - MessagesScene iMessage-style conversation UI
  - NotesScene Apple Notes-style editor UI
  - DictusDemo main composition with scene orchestration
  - 4 Remotion compositions (2 locales x 2 mockup variants)
affects: [09-04-render]

tech-stack:
  added: []
  patterns: [frame-based state machine, horizontal slide transition, seamless loop cross-fade]

key-files:
  created:
    - video/src/components/TextReveal.tsx
    - video/src/components/MessagesScene.tsx
    - video/src/components/NotesScene.tsx
    - video/src/compositions/DictusDemo.tsx
  modified:
    - video/src/Root.tsx

key-decisions:
  - "460 total frames (15.3s): 2x210 scene cycles + 2x20 transitions"
  - "Cross-fade loop: last 20 frames blend back to idle Messages for seamless looping"
  - "Horizontal translateX slide with iosSpring.standard for scene transition"

patterns-established:
  - "getStateAtFrame(): pure function mapping frame offset to DemoState and stateStartFrame"
  - "Scene components accept locale + demoState + stateStartFrame as composition interface"

requirements-completed: [VID-03, VID-04]

duration: 8min
completed: 2026-03-19
---

# Phase 9 Plan 3: Scenes & Composition Summary

**DictusDemo composition orchestrating Messages and Notes scenes with iOS-native slide transitions, 4-state demo cycles, and seamless cross-fade loop**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-19T22:27:31Z
- **Completed:** 2026-03-19T22:35:30Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- TextReveal component with word-by-word spring animation (opacity + translateY per word)
- MessagesScene with iMessage-style dark mode UI, chat bubbles, and dictated phrase insertion
- NotesScene with Apple Notes-style dark mode UI, title, date, and dictated text insertion
- DictusDemo composition with frame-based state machine, horizontal slide transition, seamless loop
- Root.tsx registers 4 compositions (fr, en, fr-screenonly, en-screenonly) all at 460 frames

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TextReveal, MessagesScene, and NotesScene** - `462a7e7` (feat)
2. **Task 2: Create DictusDemo composition and wire Root.tsx** - `8da3459` (feat)

## Files Created/Modified
- `video/src/components/TextReveal.tsx` - Word-by-word spring animation with interpolate
- `video/src/components/MessagesScene.tsx` - iMessage UI with contact name, chat bubbles, dictated phrase
- `video/src/components/NotesScene.tsx` - Apple Notes UI with title, date, dictated text
- `video/src/compositions/DictusDemo.tsx` - Main composition: state machine, transitions, loop, branding
- `video/src/Root.tsx` - 4 Composition entries (2 locales x 2 mockup variants)

## Decisions Made
- 460 total frames: 2 scene cycles of 210 frames + 2 transitions of 20 frames = 15.3s at 30fps
- Cross-fade last 20 frames back to idle Messages state for seamless autoplay looping
- Scene components receive absolute stateStartFrame for spring calculations
- Branding (Dictus wordmark + tagline) placed at bottom with subtle white40 opacity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 compositions viewable in Remotion Studio (`npx remotion studio src/index.ts`)
- Plan 04 (render & integration) can proceed to render MP4 files
- Video file size budget (< 5MB) to be validated during rendering

---
*Phase: 09-remotion-demo-video*
*Completed: 2026-03-19*

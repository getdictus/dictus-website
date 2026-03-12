---
phase: 07-content-cta
plan: 02
subsystem: ui
tags: [react, qrcode, testflight, device-detection, cta, i18n]

requires:
  - phase: 05-theming
    provides: theme tokens (accent, accent-hi, white-70, ink-deep)
  - phase: 06-visual
    provides: glass card Hero layout
provides:
  - AdaptiveCTA component with device-aware TestFlight CTA
  - QR code rendering for desktop visitors
  - Env-var controlled feature flag (NEXT_PUBLIC_TESTFLIGHT_URL)
affects: [hero, deployment]

tech-stack:
  added: [qrcode.react]
  patterns: [client-side device detection via useEffect, env-var feature flag]

key-files:
  created:
    - src/components/Hero/AdaptiveCTA.tsx
    - .env.example
  modified:
    - src/components/Hero/Hero.tsx
    - src/messages/en.json
    - src/messages/fr.json
    - .gitignore

key-decisions:
  - "Device detection in useEffect to prevent hydration mismatch (SSR renders fallback badge)"
  - "QR code uses ink-deep (#0A1628) foreground on white for brand consistency"
  - "Other-mobile path shows text link only (cannot scan own screen for QR)"
  - "Whitelisted .env.example in .gitignore for documentation commit"

patterns-established:
  - "Env-var feature flag: NEXT_PUBLIC_ prefix for build-time inlining, empty = disabled"
  - "Client-side device branching: unknown state during SSR, detect on mount"

requirements-completed: [CTA-01, CTA-02, CTA-03, CTA-04, CTA-05]

duration: 3min
completed: 2026-03-12
---

# Phase 7 Plan 2: Adaptive CTA Summary

**Device-aware TestFlight CTA with QR code for desktop, direct button for iPhone, and Coming Soon fallback when URL is not configured**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T22:51:19Z
- **Completed:** 2026-03-12T22:54:13Z
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 6

## Accomplishments
- AdaptiveCTA component handles 4 device states: unknown (fallback badge), iPhone (TestFlight button), desktop (QR code + link), other-mobile (link only)
- Zero visual regression when TESTFLIGHT_URL is not configured -- Hero displays identical Coming Soon badge
- Device detection runs client-side only via useEffect, preventing React hydration mismatches
- CTA text fully bilingual (FR + EN) via existing Hero i18n namespace

## Task Commits

Each task was committed atomically:

1. **Task 1: Install qrcode.react and create AdaptiveCTA component** - `f47cf9c` (feat)
2. **Task 2: Wire AdaptiveCTA into Hero** - `1152905` (feat)
3. **Task 3: Verify adaptive CTA fallback and device branching** - checkpoint approved, no commit needed

## Files Created/Modified
- `src/components/Hero/AdaptiveCTA.tsx` - Client component with device detection and 4-state CTA rendering
- `src/components/Hero/Hero.tsx` - Replaced inline Coming Soon badge with AdaptiveCTA import
- `src/messages/en.json` - Added cta_testflight, cta_available_iphone, cta_testflight_link keys
- `src/messages/fr.json` - Added French translations for CTA keys
- `.env.example` - Documents NEXT_PUBLIC_TESTFLIGHT_URL env var
- `.gitignore` - Whitelisted .env.example

## Decisions Made
- Device detection in useEffect to prevent hydration mismatch (SSR always renders fallback badge)
- QR code uses ink-deep (#0A1628) foreground on white background for brand consistency
- Other-mobile path renders text link only (users cannot scan their own screen)
- Whitelisted .env.example in .gitignore so documentation is committed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Whitelisted .env.example in .gitignore**
- **Found during:** Task 1 (commit stage)
- **Issue:** `.env*` glob in .gitignore prevented committing .env.example
- **Fix:** Added `!.env.example` exception to .gitignore
- **Files modified:** .gitignore
- **Verification:** git add succeeds, file committed
- **Committed in:** f47cf9c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor .gitignore fix required to commit the documented env example file. No scope creep.

## Issues Encountered
None.

## User Setup Required

TestFlight URL configuration is needed to activate the adaptive CTA (without it, the Coming Soon badge displays as before):

- **Env var:** `NEXT_PUBLIC_TESTFLIGHT_URL` -- set to your TestFlight public link (e.g., `https://testflight.apple.com/join/XXXXXX`)
- **Source:** App Store Connect -> Your App -> TestFlight -> Public Link
- **Note:** Requires rebuild after setting (NEXT_PUBLIC_ vars are inlined at build time)

## Next Phase Readiness
- Adaptive CTA is fully functional and waiting for TestFlight URL
- No blockers for subsequent phases
- Comparison table (07-01) and adaptive CTA (07-02) complete phase 7

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 07-content-cta*
*Completed: 2026-03-12*

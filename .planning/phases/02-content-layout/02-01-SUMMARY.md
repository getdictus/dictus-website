---
phase: 02-content-layout
plan: 01
subsystem: ui
tags: [next-intl, i18n, hero, translations, tailwind]

requires:
  - phase: 01-foundation
    provides: "Nav, layout with pt-16, i18n skeleton, Tailwind theme tokens"
provides:
  - "Complete FR/EN translation content for all Phase 2 sections (9 namespaces)"
  - "Hero section component with full-viewport layout, ambient waveform, Coming Soon badge"
  - "Page composition importing Hero"
affects: [02-content-layout, 03-animations]

tech-stack:
  added: []
  patterns: ["Server component with useTranslations for section-level i18n", "min-h-dvh for mobile-safe viewport height"]

key-files:
  created:
    - src/components/Hero/Hero.tsx
  modified:
    - src/messages/fr.json
    - src/messages/en.json
    - src/app/[locale]/page.tsx

key-decisions:
  - "Waveform as ambient SVG at 7% opacity behind headline, not stacked below"
  - "min-h-dvh instead of min-h-screen to avoid mobile Safari viewport bug"
  - "Coming Soon badge as span with dot indicator, not button or link"

patterns-established:
  - "Section components: server component using useTranslations with section namespace"
  - "Translation structure: one namespace per section, identical key structure across locales"

requirements-completed: [HERO-01, HERO-04, NAV-02, NAV-03]

duration: 2min
completed: 2026-03-09
---

# Phase 2 Plan 01: Hero & Translations Summary

**Full-viewport Hero section with ambient waveform and complete bilingual translations for all Phase 2 sections**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T13:53:52Z
- **Completed:** 2026-03-09T13:55:27Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Complete FR/EN translation content for all 9 namespaces covering every Phase 2 section
- Hero section with bold headline, subtitle, ambient waveform background, and Coming Soon badge
- Page composition updated to render Hero as server component

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all bilingual translation content** - `21494ff` (feat)
2. **Task 2: Build Hero section and update page composition** - `2bcd1e3` (feat)

## Files Created/Modified
- `src/messages/fr.json` - Complete French translations for all 9 Phase 2 sections
- `src/messages/en.json` - Complete English translations for all 9 Phase 2 sections
- `src/components/Hero/Hero.tsx` - Full-viewport hero with headline, subtitle, waveform, badge
- `src/app/[locale]/page.tsx` - Page composition importing and rendering Hero

## Decisions Made
- Waveform rendered as ambient SVG at 7% opacity centered behind headline (not stacked below)
- Used `min-h-dvh` instead of `min-h-screen` to avoid mobile Safari viewport height bug
- Coming Soon badge styled as span with small dot status indicator, not a button or link
- Removed `Home` namespace from translations, replaced by section-specific namespaces

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All translation content ready for Plan 02 to build remaining sections without touching locale files
- Hero renders correctly at /fr and /en with language toggle working
- Build passes clean

---
*Phase: 02-content-layout*
*Completed: 2026-03-09*

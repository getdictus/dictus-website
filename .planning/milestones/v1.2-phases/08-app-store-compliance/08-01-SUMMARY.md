---
phase: 08-app-store-compliance
plan: 01
subsystem: ui
tags: [next-intl, i18n, privacy-policy, app-store, server-components]

requires:
  - phase: none
    provides: standalone content pages using existing i18n infrastructure
provides:
  - Bilingual privacy policy page at /[locale]/privacy with 10 Apple-required sections
  - Bilingual support page at /[locale]/support with contact info and compatibility
  - Privacy and Support i18n namespaces in fr.json and en.json
affects: [08-app-store-compliance]

tech-stack:
  added: []
  patterns: [server-component content pages with i18n, narrow prose layout]

key-files:
  created:
    - src/app/[locale]/privacy/page.tsx
    - src/app/[locale]/support/page.tsx
  modified:
    - src/messages/fr.json
    - src/messages/en.json

key-decisions:
  - "Contact section renders email as clickable mailto: link with accent-blue styling"
  - "Telegram link uses placeholder href (#) since no Telegram URL was specified"
  - "Privacy sections rendered via mapped array for maintainability"

patterns-established:
  - "Content page pattern: server component with narrow prose width (max-w-3xl), no animations"
  - "Section rendering via const array + map for consistent h2/p structure"

requirements-completed: [COMP-01, COMP-02]

duration: 2min
completed: 2026-03-19
---

# Phase 8 Plan 1: Privacy & Support Pages Summary

**Bilingual privacy policy (10 Apple-required sections) and support page with contact/GitHub/Telegram/compatibility at /[locale]/privacy and /[locale]/support**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T14:42:30Z
- **Completed:** 2026-03-19T14:44:41Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Complete bilingual privacy policy with all 10 Apple App Store required sections
- Support page with email, GitHub Issues link, Telegram community link, and iOS compatibility note
- Both pages follow existing server component patterns with generateStaticParams, generateMetadata, and Footer

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Privacy and Support i18n content** - `00ddb41` (feat)
2. **Task 2: Create Privacy Policy and Support page components** - `860c791` (feat)

## Files Created/Modified
- `src/messages/fr.json` - Added Privacy (26 keys) and Support (14 keys) namespaces in French
- `src/messages/en.json` - Added Privacy (26 keys) and Support (14 keys) namespaces in English
- `src/app/[locale]/privacy/page.tsx` - Bilingual privacy policy server component with 10 sections
- `src/app/[locale]/support/page.tsx` - Bilingual support page server component with 4 contact sections

## Decisions Made
- Contact section email rendered as clickable `mailto:` link with accent-blue styling for consistency
- Telegram link uses placeholder href (`#`) since no specific Telegram group URL was provided in context
- Privacy policy sections rendered via mapped const array for maintainability and consistency
- Pre-existing lint errors in HeroDemo and useHeroDemoState left untouched (out of scope)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Privacy and support pages ready for App Store Connect URLs
- Footer links (COMP-03) still needed to connect these pages from the site navigation
- Telegram placeholder href should be updated when actual group URL is available

---
*Phase: 08-app-store-compliance*
*Completed: 2026-03-19*

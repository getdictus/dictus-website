---
phase: 08-app-store-compliance
plan: 02
subsystem: ui
tags: [footer, sitemap, next-intl, i18n, seo, compliance]

requires:
  - phase: 08-app-store-compliance
    provides: Privacy and Support pages (08-01)
provides:
  - Footer with locale-aware Privacy Policy and Support links on every page
  - Sitemap entries for /fr/privacy, /en/privacy, /fr/support, /en/support with hreflang alternates
affects: []

tech-stack:
  added: []
  patterns:
    - "next-intl Link for locale-aware internal navigation in Footer"
    - "Sitemap entries with yearly changeFrequency and low priority for compliance pages"

key-files:
  created: []
  modified:
    - src/components/Footer/Footer.tsx
    - src/app/sitemap.ts
    - src/messages/fr.json
    - src/messages/en.json

key-decisions:
  - "Footer links placed between copyright/icons row and inline privacy statement per user decision"
  - "Compliance pages get yearly changeFrequency and 0.3 priority in sitemap"

patterns-established:
  - "Locale-aware Link from @/i18n/navigation used for internal footer links"

requirements-completed: [COMP-03]

duration: 2min
completed: 2026-03-19
---

# Phase 8 Plan 02: Footer Links & Sitemap Summary

**Locale-aware Privacy Policy and Support links in Footer using next-intl Link, plus 4 sitemap entries with hreflang alternates**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T14:46:53Z
- **Completed:** 2026-03-19T14:48:26Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Footer on every page now shows clickable Privacy Policy and Support links between the copyright row and the inline privacy statement
- Links are locale-aware via next-intl Link component (automatically prefixes current locale)
- Sitemap extended from 2 to 6 entries with proper hreflang alternates for all compliance pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Add locale-aware Privacy and Support links to Footer** - `8668f8d` (feat)
2. **Task 2: Extend sitemap with privacy and support page entries** - `f5eeaf8` (feat)

## Files Created/Modified
- `src/components/Footer/Footer.tsx` - Added Link import and privacy/support navigation links
- `src/messages/fr.json` - Added privacy_link and support_link i18n keys to Footer namespace
- `src/messages/en.json` - Added privacy_link and support_link i18n keys to Footer namespace
- `src/app/sitemap.ts` - Added 4 new entries for privacy and support pages with hreflang alternates

## Decisions Made
- Footer links use text-white-40 with hover:text-white-70 to match existing footer styling
- Middle dot separator between links for visual clarity
- Sitemap compliance pages set to yearly change frequency and 0.3 priority (lower than homepage)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 (App Store Compliance) is fully complete: privacy page, support page, footer links, and sitemap all in place
- App Store Connect URLs ready: getdictus.com/{locale}/privacy and getdictus.com/{locale}/support

---
*Phase: 08-app-store-compliance*
*Completed: 2026-03-19*

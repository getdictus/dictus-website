---
phase: 01-foundation
plan: 02
subsystem: ui, i18n
tags: [next-intl, i18n, navigation, react, tailwind]

requires:
  - phase: 01-foundation-01
    provides: "Next.js project with Tailwind theme tokens, font setup, and i18n skeleton"
provides:
  - "Fully functional FR/EN i18n routing with proxy.ts middleware"
  - "Sticky nav shell with dictus waveform logo and language toggle"
  - "Translation infrastructure with namespaced JSON files"
  - "Navigation utilities (Link, useRouter, usePathname) via next-intl"
affects: [02-content, 03-animations, 04-polish]

tech-stack:
  added: [next-intl/middleware, next-intl/navigation]
  patterns: [proxy.ts for Next.js 16 middleware, namespaced translations, client component for interactive nav elements]

key-files:
  created:
    - src/proxy.ts
    - src/i18n/navigation.ts
    - src/components/Nav/Nav.tsx
    - src/components/Nav/Logo.tsx
    - src/components/Nav/LanguageToggle.tsx
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/messages/fr.json
    - src/messages/en.json

key-decisions:
  - "Nav component uses inline SVG for waveform icon (no external asset dependency)"
  - "LanguageToggle is a client component using useRouter.replace for locale switching"
  - "Layout wraps children in <main className='pt-16'> to offset fixed nav height"

patterns-established:
  - "i18n navigation: import { Link, useRouter, usePathname } from '@/i18n/navigation'"
  - "Translation namespaces: Nav, Metadata, Home (section-based)"
  - "Client components for interactive elements, server components for static layout"

requirements-completed: [NAV-01, I18N-01, I18N-02]

duration: 2min
completed: 2026-03-09
---

# Phase 1 Plan 2: i18n Routing and Nav Shell Summary

**next-intl v4 bilingual routing (FR/EN) with proxy.ts middleware, sticky nav with SVG waveform logo and language toggle**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T11:59:21Z
- **Completed:** 2026-03-09T12:01:06Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Wired up next-intl v4 i18n with proxy.ts, navigation utilities, and request config
- Built sticky nav with inline SVG squircle waveform logo + "dictus" wordmark
- Created FR/EN language toggle that switches locale via router.replace
- Updated layout with NextIntlClientProvider and locale validation
- Added namespaced translations (Nav, Metadata, Home) for both locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up next-intl v4 i18n routing with proxy.ts and translation files** - `f6ea99e` (feat)
2. **Task 2: Build Nav shell with Logo and LanguageToggle components** - `621f5bd` (feat)

## Files Created/Modified

- `src/proxy.ts` - Next.js 16 proxy middleware for locale routing
- `src/i18n/navigation.ts` - Exported navigation utilities (Link, useRouter, usePathname, redirect)
- `src/components/Nav/Nav.tsx` - Sticky nav shell with logo left, language toggle right
- `src/components/Nav/Logo.tsx` - Inline SVG squircle waveform icon + wordmark
- `src/components/Nav/LanguageToggle.tsx` - Client component FR/EN switcher
- `src/app/[locale]/layout.tsx` - Added NextIntlClientProvider, Nav, locale validation
- `src/app/[locale]/page.tsx` - Translated placeholder with useTranslations
- `src/messages/fr.json` - French translations with Nav, Metadata, Home namespaces
- `src/messages/en.json` - English translations with Nav, Metadata, Home namespaces

## Decisions Made

- Used inline SVG for the waveform logo to avoid external asset dependencies
- LanguageToggle implemented as client component with useRouter.replace pattern
- Layout uses pt-16 on main wrapper to account for fixed nav height

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Nav shell ready to receive section links (none per user decision for now)
- i18n infrastructure ready for all future content sections
- Translation files structured with namespaces for easy extension
- Glassmorphism blur effect on nav planned for Phase 3 (animations)

## Self-Check: PASSED

- All 5 created files verified present on disk
- Both task commits verified: f6ea99e, 621f5bd
- Build succeeds with /fr and /en routes and proxy middleware

---
*Phase: 01-foundation*
*Completed: 2026-03-09*

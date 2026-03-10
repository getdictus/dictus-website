---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [nextjs, tailwind-v4, design-tokens, fonts, favicon, dm-sans, dm-mono]

requires: []
provides:
  - "Next.js 16 App Router project scaffold with Tailwind v4"
  - "All brand kit color tokens as Tailwind utilities (bg-ink-deep, text-accent, etc.)"
  - "Self-hosted DM Sans (variable) and DM Mono (static) via next/font/google"
  - "Dark-only base styling with bg-ink body"
  - "Squircle waveform favicon (SVG + PNG) and Apple touch icon"
  - "next-intl v4 plugin configured with [locale] routing skeleton"
  - "motion v12 installed for future animation use"
affects: [01-02, 02-content, 03-animations]

tech-stack:
  added: [next@16.1.6, react@19.2.3, tailwindcss@4, next-intl@4.8.3, motion@12.35.2]
  patterns: [tailwind-v4-css-theme, next-font-css-variables, locale-layout-async-params]

key-files:
  created:
    - src/app/globals.css
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/not-found.tsx
    - src/app/icon.svg
    - src/app/icon.png
    - src/app/apple-icon.png
    - src/i18n/routing.ts
    - src/i18n/request.ts
    - src/messages/fr.json
    - src/messages/en.json
  modified:
    - package.json
    - next.config.ts

key-decisions:
  - "Tailwind v4 @theme in globals.css as single source of truth for design tokens (no tailwind.config.ts)"
  - "Webpack for production build due to Turbopack PNG processing bug in Next.js 16.1.6"
  - "i18n skeleton (routing, request, messages) created in Task 1 as blocking dependency for next-intl plugin"

patterns-established:
  - "CSS-first tokens: all brand colors defined via @theme { --color-*: ... } in globals.css"
  - "Font connection: next/font CSS variables linked via @theme inline { --font-sans: var(--font-dm-sans) }"
  - "Async params: all [locale] layouts use params: Promise<{locale: string}> with await"

requirements-completed: [DSGN-01, DSGN-02, DSGN-04, PRIV-01, NAV-04]

duration: 4min
completed: 2026-03-09
---

# Phase 1 Plan 1: Foundation Scaffold Summary

**Next.js 16 scaffold with Tailwind v4 brand kit tokens, self-hosted DM Sans/Mono fonts, dark-only styling, and squircle waveform favicon**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-09T11:52:29Z
- **Completed:** 2026-03-09T11:56:52Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- All 19 brand kit color tokens available as Tailwind utilities (bg-ink-deep, text-accent, border-border-hi, etc.)
- DM Sans (variable font) and DM Mono (weights 300/400) self-hosted via next/font/google with zero external requests
- Squircle waveform favicon with asymmetric bars rendered as SVG, 32x32 PNG, and 180x180 Apple touch icon
- next-intl v4 routing skeleton with fr/en locales ready for Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project with Tailwind v4 design tokens and self-hosted fonts** - `7551e66` (feat)
2. **Task 2: Generate favicon SVG and PNG touch icon assets** - `ecc6241` (feat)

## Files Created/Modified
- `src/app/globals.css` - Tailwind v4 @theme with all brand kit color tokens and font connection
- `src/app/[locale]/layout.tsx` - Root layout with DM Sans + DM Mono self-hosted fonts, dark body
- `src/app/[locale]/page.tsx` - Placeholder page with dictus wordmark demonstrating tokens
- `src/app/[locale]/not-found.tsx` - 404 page with brand styling
- `src/app/icon.svg` - Squircle waveform SVG favicon (80x80, 3 asymmetric bars)
- `src/app/icon.png` - 32x32 PNG favicon
- `src/app/apple-icon.png` - 180x180 Apple touch icon
- `src/i18n/routing.ts` - next-intl routing config (fr/en, always prefixed)
- `src/i18n/request.ts` - next-intl request config with locale resolution
- `src/messages/fr.json` - French translation stub
- `src/messages/en.json` - English translation stub
- `next.config.ts` - Next.js config with next-intl plugin
- `package.json` - Dependencies and webpack build script

## Decisions Made
- Used Tailwind v4 CSS-first @theme instead of tailwind.config.ts -- this preserves the user's "single source of truth" intent while following Tailwind v4 conventions
- Switched production build to webpack (--webpack flag) due to Turbopack panic when processing PNG files in app directory -- this is a known Next.js 16.1.6 Turbopack bug, dev server with Turbopack works fine
- Created i18n skeleton (routing.ts, request.ts, message files) in Task 1 because the next-intl plugin in next.config.ts requires the request config to exist at build time

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created i18n skeleton files for next-intl plugin**
- **Found during:** Task 1 (build verification)
- **Issue:** next-intl/plugin in next.config.ts requires src/i18n/request.ts to exist at build time
- **Fix:** Created routing.ts, request.ts, and message JSON stubs (minimal, Plan 02 will flesh out)
- **Files modified:** src/i18n/routing.ts, src/i18n/request.ts, src/messages/fr.json, src/messages/en.json
- **Verification:** npm run build succeeds
- **Committed in:** 7551e66 (Task 1 commit)

**2. [Rule 3 - Blocking] Switched build to webpack due to Turbopack PNG bug**
- **Found during:** Task 2 (build verification after adding PNG icons)
- **Issue:** Turbopack panics with "Dependency tracking is disabled so invalidation is not allowed" when processing PNG files in app directory
- **Fix:** Added --webpack flag to build script in package.json
- **Files modified:** package.json
- **Verification:** npm run build succeeds with webpack bundler
- **Committed in:** ecc6241 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes necessary for build to succeed. i18n skeleton is minimal and will be properly built out in Plan 02. Webpack fallback has no functional impact.

## Issues Encountered
- Turbopack in Next.js 16.1.6 crashes when processing static PNG files in the app directory. This is a Turbopack internal bug, not a code issue. Workaround: use --webpack flag for production builds. Dev server continues to use Turbopack without issues.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Design system foundation complete: all tokens, fonts, and icons in place
- i18n routing skeleton ready for Plan 02 to add proxy.ts, navigation utilities, and NextIntlClientProvider
- motion v12 installed, ready for Phase 3 animation work
- Default public/ SVGs from create-next-app scaffold remain (file.svg, globe.svg, etc.) -- can be cleaned up in a future plan

---
*Phase: 01-foundation*
*Completed: 2026-03-09*

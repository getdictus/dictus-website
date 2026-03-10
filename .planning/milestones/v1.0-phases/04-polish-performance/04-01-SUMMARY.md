---
phase: 04-polish-performance
plan: 01
subsystem: seo
tags: [seo, og-tags, sitemap, robots, json-ld, accessibility, wcag, hreflang, next-intl]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "next-intl i18n setup with fr/en locales"
  - phase: 02-content-layout
    provides: "Page sections and layout structure"
provides:
  - "Per-locale generateMetadata with OG tags and hreflang alternates"
  - "sitemap.xml with hreflang for both locales"
  - "robots.txt with sitemap reference"
  - "JSON-LD MobileApplication structured data"
  - "Static 1200x630 OG image"
  - "Skip-to-content link for keyboard navigation"
  - "WCAG AA contrast compliance for secondary text"
  - "Canvas waveform ARIA decorative markers"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "generateMetadata async function for per-locale SEO"
    - "JSON-LD via dangerouslySetInnerHTML script tag in page.tsx"
    - "MetadataRoute.Sitemap with hreflang alternates"

key-files:
  created:
    - "src/app/sitemap.ts"
    - "src/app/robots.ts"
    - "public/og-image.png"
  modified:
    - "src/app/[locale]/layout.tsx"
    - "src/app/[locale]/page.tsx"
    - "src/app/globals.css"
    - "src/messages/fr.json"
    - "src/messages/en.json"
    - "src/components/Hero/Waveform.tsx"

key-decisions:
  - "Used Next.js generateMetadata (async) replacing static metadata export for per-locale OG"
  - "JSON-LD placed in page.tsx (not layout.tsx) to avoid duplicate rendering"
  - "Bumped white-40 opacity from 0.40 to 0.60 for WCAG AA while keeping token name unchanged"

patterns-established:
  - "generateMetadata pattern: await params, getTranslations for locale, return full OG/Twitter/alternates"
  - "Structured data pattern: JSON-LD script tag at end of page component JSX"

requirements-completed: [SEO-01, SEO-02, PERF-01]

# Metrics
duration: 3min
completed: 2026-03-10
---

# Phase 4 Plan 1: SEO & Accessibility Summary

**Per-locale OG metadata with hreflang, sitemap, robots, JSON-LD MobileApplication schema, skip-to-content link, and WCAG AA contrast fix**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T08:26:00Z
- **Completed:** 2026-03-10T08:29:13Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Full per-locale SEO metadata (OG tags, Twitter cards, hreflang alternates, canonical URLs)
- Sitemap with hreflang and robots.txt for search engine discoverability
- JSON-LD MobileApplication structured data for rich search results
- Static OG image with brand waveform icon for social media shares
- Skip-to-content keyboard navigation link
- WCAG AA contrast compliance for secondary text

## Task Commits

Each task was committed atomically:

1. **Task 1: SEO metadata, sitemap, robots, OG image, and i18n message updates** - `1eb31f2` (feat)
2. **Task 2: Accessibility fixes -- contrast, skip-to-content, ARIA audit, canvas a11y** - `287ea96` (feat)

## Files Created/Modified
- `src/app/[locale]/layout.tsx` - generateMetadata with per-locale OG, hreflang, skip-to-content link
- `src/app/[locale]/page.tsx` - JSON-LD MobileApplication structured data
- `src/app/sitemap.ts` - Dynamic sitemap with hreflang alternates for /fr and /en
- `src/app/robots.ts` - Robots.txt with sitemap URL reference
- `src/app/globals.css` - Secondary text opacity bumped to 0.60 for WCAG AA
- `src/messages/fr.json` - Added jsonld_description and skip_to_content translations
- `src/messages/en.json` - Added jsonld_description and skip_to_content translations
- `src/components/Hero/Waveform.tsx` - Added role="presentation" to canvas
- `public/og-image.png` - Static 1200x630 OG image with brand waveform and wordmark

## Decisions Made
- Used Next.js generateMetadata (async) replacing static metadata export for per-locale OG tags
- JSON-LD placed in page.tsx rather than layout.tsx to avoid duplicate rendering
- Bumped white-40 opacity from 0.40 to 0.60 for WCAG AA while keeping the token name unchanged to avoid touching component files

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SEO and accessibility complete, ready for Plan 04-02 (performance optimization)
- All pages have proper metadata for search engines and social media sharing

---
*Phase: 04-polish-performance*
*Completed: 2026-03-10*

## Self-Check: PASSED

All 9 files verified present. Both task commits (1eb31f2, 287ea96) verified in git log.

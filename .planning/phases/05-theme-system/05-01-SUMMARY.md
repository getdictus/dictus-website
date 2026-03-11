---
phase: 05-theme-system
plan: 01
subsystem: ui
tags: [next-themes, css-variables, tailwind-v4, theme-system, dark-mode, light-mode]

# Dependency graph
requires: []
provides:
  - CSS variable swap pattern with :root (light) and .dark (dark) selectors
  - ThemeProvider client component wrapping next-themes
  - Layout integration with suppressHydrationWarning and FOWT prevention
  - @custom-variant dark for Tailwind v4 dark mode targeting
  - Theme transition CSS for smooth 200ms cross-fade
affects: [05-02-PLAN, component-theming, waveform-theming]

# Tech tracking
tech-stack:
  added: [next-themes]
  patterns: [css-variable-swap, theme-indirection, client-boundary-wrapper]

key-files:
  created:
    - src/components/shared/ThemeProvider.tsx
  modified:
    - src/app/globals.css
    - src/app/[locale]/layout.tsx
    - package.json

key-decisions:
  - "Kept dark-origin token names (ink-deep, white-70, etc.) for zero-churn migration"
  - "Used text-[var(--theme-text-primary)] instead of adding --color-white to @theme to avoid conflict with Tailwind v4 built-in text-white"
  - "9 swappable tokens via var() indirection, 10 static tokens unchanged between modes"
  - "Waveform-specific CSS variables added to :root/.dark for future component use"

patterns-established:
  - "CSS variable swap: @theme tokens reference var(--theme-*) which resolve differently under :root vs .dark"
  - "Client boundary wrapper: ThemeProvider.tsx wraps next-themes for App Router compatibility"
  - "Theme transition: html.theme-transition class enables smooth color cross-fade, toggled programmatically"

requirements-completed: [THEME-02, THEME-04, THEME-05, THEME-06]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 5 Plan 1: CSS Variable Foundation Summary

**CSS variable swap pattern with next-themes integration: 9 swappable tokens via var() indirection, light/dark :root/.dark selectors, and ThemeProvider with FOWT prevention**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T10:04:10Z
- **Completed:** 2026-03-11T10:05:51Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Migrated all background, text, and border tokens from hardcoded dark values to CSS variable indirection via var(--theme-*)
- Defined light mode values (iOS DictusColors.swift palette) in :root and dark mode values in .dark selector
- Installed next-themes and created ThemeProvider client wrapper with class-based attribute and system default
- Added suppressHydrationWarning to html element for FOWT prevention
- Added @custom-variant dark for Tailwind v4 .dark class targeting
- Added theme-transition CSS for smooth 200ms cross-fade on toggle

## Task Commits

Each task was committed atomically:

1. **Task 1: Install next-themes and create ThemeProvider wrapper** - `91cd2b0` (feat)
2. **Task 2: Migrate globals.css to CSS variable swap pattern** - `c24c169` (feat)
3. **Task 3: Wire ThemeProvider into layout and add suppressHydrationWarning** - `49de615` (feat)

## Files Created/Modified
- `src/components/shared/ThemeProvider.tsx` - Client boundary wrapper for next-themes NextThemesProvider
- `src/app/globals.css` - CSS variable swap pattern with :root/:dark selectors, @custom-variant dark, theme transition CSS
- `src/app/[locale]/layout.tsx` - ThemeProvider integration, suppressHydrationWarning, theme-aware text color
- `package.json` - next-themes dependency added

## Decisions Made
- Kept dark-origin token names (ink-deep, white-70, etc.) for zero-churn migration -- no component files need updating
- Used `text-[var(--theme-text-primary)]` on body instead of adding `--color-white` to @theme, avoiding conflict with Tailwind v4's built-in `text-white` utility
- 9 tokens swappable via var() indirection (backgrounds, text, borders), 10 static (accent, semantic, glow)
- Added waveform-specific CSS variables (--theme-waveform-edge-rgb, gradient-start, gradient-end) for Plan 02 consumption

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Body text-white would not swap in light mode**
- **Found during:** Task 3 (Layout integration)
- **Issue:** `text-white` in body class uses Tailwind's built-in #fff, would remain white text on light background
- **Fix:** Replaced with `text-[var(--theme-text-primary)]` which resolves to #000000 in light mode, #FFFFFF in dark mode
- **Files modified:** src/app/[locale]/layout.tsx
- **Verification:** npm run build succeeds, arbitrary value resolves correctly
- **Committed in:** 49de615 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correct light mode text rendering. Plan anticipated this possibility and provided guidance.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CSS variable foundation ready for ThemeToggle component (Plan 02)
- theme-transition class available for programmatic toggle animation
- All existing components continue working unchanged (zero-churn migration)
- Waveform theme variables ready for component integration

---
*Phase: 05-theme-system*
*Completed: 2026-03-11*

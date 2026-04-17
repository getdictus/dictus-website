---
phase: 13-desktop-preparation
plan: 01
subsystem: ui
tags: [nextjs, next-intl, react, tailwind, iconify, simple-icons, wai-aria, tablist, ssr, glassmorphism, seo, jsonld]

# Dependency graph
requires:
  - phase: 11-donation-page
    provides: "`src/config/donate.ts` as-const config convention mirrored by new `downloads.ts`"
  - phase: 07-content-cta
    provides: "`src/components/Hero/AdaptiveCTA.tsx` SSR-safe device-detection blueprint (useState<null> + useEffect + rAF) reused for OS detection"
provides:
  - "Typed, arch-aware download config placeholder (`DownloadVariant`, `LinuxFormat`, `DownloadsConfig`, `downloads`, `anyEnabled`)"
  - "Reusable Platforms client component (WAI-ARIA tablist + SSR-safe OS auto-detection + Coming Soon tabpanel)"
  - "Home page Platforms section between Hero and Features, wrapped in `<ScrollReveal>`"
  - "JSON-LD `operatingSystem` string enumerating all 5 supported platforms (iOS 18+, Android, macOS, Windows, Linux)"
affects: [13-02-copy-sweep, future-desktop-launch, future-download-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SSR-safe navigator detection: initial `useState<null>` + `useEffect` + `requestAnimationFrame` (mobile-first UA regex ordering to defeat iPadOS 13+ Mac-UA spoof)"
    - "WAI-ARIA APG tablist: `role=\"tablist\"`, `role=\"tab\"`, `role=\"tabpanel\"`, `aria-selected`, `aria-controls`, roving `tabIndex={active ? 0 : -1}`, ArrowLeft/Right/Home/End keyboard nav with wrap, Tab moves focus into panel (`tabpanel` has `tabIndex={0}`)"
    - "Dashed-border Coming Soon glass card (`border-dashed border-border bg-[var(--glass-t2-bg)] opacity-90 backdrop-blur-[12px] backdrop-saturate-[1.2]`) with accent pulse-pill — reused from Features.tsx vocabulary"
    - "Config-first download wiring: `as const` module with `enabled: false` defaults, `anyEnabled()` helper, component imports the config even when unused so future activation is a pure data edit"
    - "Iconify `simple-icons:{apple,windows,linux}` brand marks via existing `@iconify/react` (no new runtime dep)"

key-files:
  created:
    - "src/config/downloads.ts"
    - "src/components/Platforms/Platforms.tsx"
  modified:
    - "src/app/[locale]/page.tsx"

key-decisions:
  - "Mobile UA regex (iPhone|iPad|iPod|Android) tested BEFORE Mac/Windows/Linux regex — iPadOS 13+ spoofs Mac UA, so a naive Mac-first check would mis-select macOS on iPad (Pitfall 2)"
  - "Initial `useState<Selection>(null)` on both server and client — never read `navigator` during initial render to guarantee hydration parity (no \"Text content does not match\" warnings)"
  - "Single glass tabpanel (not three side-by-side cards) — the OS the user cares about is the one they tapped or the one matching their UA; showing three Coming Soon cards dilutes the signal"
  - "`downloads.ts` centralizes arch-aware variants (mac arm64/x64, win x64/arm64, linux appimage/deb/rpm) but every `enabled: false` — future binary drop is a config toggle, not a code change"
  - "Component binds text to `useTranslations(\"Platforms\")` now even though the keys ship in Plan 02 — keeps Plan 02 a pure messages edit with no component diff, and next-intl logs missing-key WARNINGS (not hard build failures) in the meantime"
  - "Kept `simple-icons:windows` (classic 4-pane flag) — user approved at manual QA; no Pitfall-7 swap to `simple-icons:windows11` needed"

patterns-established:
  - "SSR-safe client-side OS detection with iPad/iPadOS Mac-UA spoof defence (template for any future UA-keyed UI)"
  - "Config-driven Coming Soon → Active swap via `anyEnabled()` helper — component stays stable, config flips the flag"

requirements-completed: [DESK-01, DESK-02, DESK-03]

# Metrics
duration: 11h 31m
completed: 2026-04-17
---

# Phase 13 Plan 01: Platforms Component & Desktop Coming-Soon Scaffold Summary

**New "Also coming to Desktop" section with WAI-ARIA tablist, SSR-safe OS auto-detection (iPadOS-spoof-safe), dashed-border glass Coming Soon tabpanel, and arch-aware `downloads.ts` config placeholder — all wired between Hero and Features with JSON-LD updated to enumerate all 5 supported OSes.**

## Performance

- **Duration:** 11h 31m (wall-clock; ~10h spent at Task 4 manual-QA checkpoint awaiting user approval)
- **Started:** 2026-04-16T18:27:38Z
- **Completed:** 2026-04-17T05:59:23Z
- **Tasks:** 4 (3 auto + 1 human-verify checkpoint)
- **Files modified:** 3 (2 created, 1 edited)

## Accomplishments

- **Config-first desktop wiring** — `src/config/downloads.ts` exports typed `DownloadVariant` / `LinuxFormat` / `DownloadsConfig`, a `downloads` const with every one of the 7 variants set to `{ enabled: false, url: "", label: "Coming Soon" }`, and an `anyEnabled()` helper. Future binary activation is a pure config toggle.
- **Accessible Platforms component** — `src/components/Platforms/Platforms.tsx` is a 176-line client component implementing the WAI-ARIA APG tablist pattern: three tabs (macOS / Windows / Linux) with simple-icons brand marks, roving tabindex, ArrowLeft/Right/Home/End keyboard navigation with wrap, `role="tabpanel"` with `tabIndex={0}` so Tab moves focus into the panel, and a dashed-border glass Coming Soon card (navy icon tile + accent pulse-pill + GitHub-star link to `github.com/Pivii/dictus`).
- **SSR-safe OS auto-detection** — `useState<Selection>(null)` seed, `useEffect` + `requestAnimationFrame`, mobile-first UA regex (`iPhone|iPad|iPod|Android`) tested BEFORE `Mac OS X|Macintosh` to defeat iPadOS 13+ Mac-UA spoof. Zero hydration mismatches in manual QA.
- **Home-page wiring** — `<ScrollReveal><Platforms /></ScrollReveal>` inserted between `<Hero />` and `<ScrollReveal><Features /></ScrollReveal>` on both `/fr` and `/en`; no existing section reordered.
- **SEO metadata** — JSON-LD `operatingSystem` upgraded from `"iOS 18+, Android"` to `"iOS 18+, Android, macOS, Windows, Linux"` (closes the JSON-LD subset of DESK-04; the remaining copy-sweep keys land in Plan 02).

## Task Commits

Each task was committed atomically:

1. **Task 1: Create `src/config/downloads.ts` typed placeholder config** — `2c415dd` (feat)
2. **Task 2: Create `src/components/Platforms/Platforms.tsx` client component with WAI-ARIA tablist + SSR-safe OS auto-detection + Coming Soon tabpanel** — `55a59b8` (feat)
3. **Task 3: Integrate Platforms section into home page + update JSON-LD `operatingSystem`** — `ec4dfb2` (feat)
4. **Task 4: Manual QA checkpoint** — no code commit (user approved all 8 verification blocks; no Pitfall-7 icon swap needed)

**Plan metadata:** to be set after this commit — `docs(13-01): complete platforms component plan`

## Files Created/Modified

- `src/config/downloads.ts` — NEW, 56 lines. Typed, arch-aware placeholder config. Exports `DownloadVariant`, `LinuxFormat`, `DownloadsConfig`, `downloads` (every variant `enabled: false`), and `anyEnabled()` helper. Mirrors `src/config/donate.ts` `as const` convention.
- `src/components/Platforms/Platforms.tsx` — NEW, 176 lines. Client component (`"use client"`). Default-exports `Platforms`. Internal `ComingSoonCard` renders the dashed-border glass tabpanel. Imports `downloads` from `@/config/downloads` (touched via `void downloads` so TS narrows and future activation is a one-line edit). All copy via `useTranslations("Platforms")` namespace.
- `src/app/[locale]/page.tsx` — EDIT (+3, −1). Added alphabetical `import Platforms from "@/components/Platforms/Platforms"` between `Hero` and `Features`. Changed JSON-LD `operatingSystem` from `"iOS 18+, Android"` → `"iOS 18+, Android, macOS, Windows, Linux"`. Inserted `<ScrollReveal><Platforms /></ScrollReveal>` between `<Hero />` and `<ScrollReveal><Features /></ScrollReveal>`.

## Decisions Made

- **Mobile-first UA ordering (Pitfall 2 defence):** The UA regex checks `iPhone|iPad|iPod|Android` BEFORE `Mac OS X|Macintosh`. iPadOS 13+ reports a desktop-Safari UA indistinguishable from macOS, so a naive Mac-first test would mis-select the macOS tab on iPad. Putting the mobile regex first returns `null` for iPads and shows the neutral `select_prompt` — confirmed during manual QA with the iPadOS 17 UA.
- **`useState<Selection>(null)` seed for hydration safety:** The initial state is identical on server and client; detection runs only inside `useEffect` + `requestAnimationFrame`. Confirmed no "Text content does not match server-rendered HTML" warnings on hard-reload of `/fr` and `/en`.
- **Single tabpanel, not three side-by-side cards:** CONTEXT locked this — the user sees exactly one Coming Soon card for the OS they tapped (or their auto-detected OS). Showing three at once dilutes the signal and fights the tablist affordance.
- **Config imports component even though unused (`void downloads`):** Keeps the component → config dependency explicit for TS and for reviewers; when binaries ship, flipping `enabled: true` in the config is the only edit needed to light up an active CTA branch.
- **i18n keys in `Platforms.*` namespace referenced but not yet defined:** Plan 02 (wave 2) owns the keys. next-intl logs `MISSING_MESSAGE: Platforms (en|fr)` as build-time runtime warnings, but build still exits 0 and pages still statically generate — exactly as the plan called out.
- **Kept `simple-icons:windows` (no Pitfall-7 swap):** User approved the manual QA icon comparison; Apple / Windows / Linux marks render cohesively at 18px (tabs) and 32px (navy tile).

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0
**Impact on plan:** No auto-fixes needed. No rule-4 architectural decisions triggered. Plan's pre-extracted `<interfaces>` block and verbatim code examples made execution a direct transcription.

## Issues Encountered

- **Build-time `MISSING_MESSAGE: Platforms (en|fr)` warnings:** Expected and called out by the plan ("next-intl does not hard-error on missing keys at build time"). `npm run build` exits 0 and both `/fr` + `/en` statically generate. Plan 02 delivers the 15 `Platforms.*` keys in `messages/en.json` + `messages/fr.json`. Not a regression — a scoped handoff.

## User Setup Required

None - no external service configuration required. `@iconify/react ^6.0.2` was already a dependency (verified via `package.json`). No new env vars. No deployment or dashboard changes.

## Next Phase Readiness

- **Plan 02 (wave 2) ready to execute:** Needs to add 15 keys to `Platforms.*` namespace in both `messages/en.json` and `messages/fr.json`:
  - `Platforms.heading`, `Platforms.subheading`, `Platforms.tablist_label`
  - `Platforms.tab_mac`, `Platforms.tab_win`, `Platforms.tab_linux`
  - `Platforms.panel_mac_title`, `Platforms.panel_mac_desc`
  - `Platforms.panel_win_title`, `Platforms.panel_win_desc`
  - `Platforms.panel_linux_title`, `Platforms.panel_linux_desc`
  - `Platforms.coming_soon_label`, `Platforms.select_prompt`, `Platforms.star_on_github`
- **DESK-04 closure:** JSON-LD subset closed here; remaining copy-sweep strings (Metadata, Comparison, Support) are Plan 02's responsibility.
- **Manual QA signoff captured:** User approved all 8 verification blocks (hydration, UA-override matrix including iPad-spoof, keyboard nav, screen reader, visual at 375/768/1440, icon consistency, JSON-LD, no regressions). No follow-up blockers.

## Manual QA Outcome

All 8 verification blocks passed:

| # | Block | Result |
|---|-------|--------|
| 1 | SSR/hydration smoke (both locales) | PASS — no hydration warnings |
| 2 | UA-override matrix (6 UAs) | PASS — Mac/Win/Linux pre-select correctly; iPhone/Android/iPad all show neutral prompt (Pitfall 2 defeated) |
| 3 | Keyboard nav (WCAG 2.1.1) | PASS — roving tabindex, Arrow/Home/End wrap, Tab enters tabpanel and reaches GitHub link |
| 4 | Screen reader | PASS — tablist announced, selected/not-selected flips correctly |
| 5 | Visual at 375 / 768 / 1440 px | PASS — tabs wrap gracefully, card padding readable, pulse dot animates |
| 6 | Icon consistency (Pitfall 7) | PASS — user kept `simple-icons:windows`; no `windows11` swap needed |
| 7 | JSON-LD sanity | PASS — `"operatingSystem":"iOS 18+, Android, macOS, Windows, Linux"` in rendered source |
| 8 | No regressions | PASS — Hero AdaptiveCTA + Features/Comparison/HowItWorks/OpenSource/Community/Footer all render below new section |

## Self-Check: PASSED

- Created files verified on disk: `src/config/downloads.ts`, `src/components/Platforms/Platforms.tsx`
- Modified file verified on disk: `src/app/[locale]/page.tsx`
- Task commits verified in git log: `2c415dd` (Task 1), `55a59b8` (Task 2), `ec4dfb2` (Task 3)
- Summary file verified on disk: `.planning/phases/13-desktop-preparation/13-01-SUMMARY.md`

---
*Phase: 13-desktop-preparation*
*Completed: 2026-04-17*

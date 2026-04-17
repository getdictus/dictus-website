---
phase: 13-desktop-preparation
verified: 2026-04-16T00:00:00Z
status: passed
score: 8/8 must-haves verified
re_verification: null
gaps: []
human_verification:
  - test: "UA-override auto-detection matrix (all 6 UA variants)"
    expected: "macOS/Windows/Linux UAs pre-select matching tab; iPhone/Android/iPad show no selection with select_prompt"
    why_human: "Requires browser DevTools UA override and visual inspection — cannot verify navigator.userAgent dispatch in static analysis"
  - test: "Keyboard navigation (WCAG 2.1.1)"
    expected: "ArrowRight/Left cycle tabs with wrap; Home/End jump; Tab moves into tabpanel; Tab again reaches GitHub link"
    why_human: "Requires real browser interaction to confirm focus management and roving tabindex behavior"
  - test: "Screen reader announcement"
    expected: "VoiceOver/NVDA announces 'tab list', tab selected/not selected state changes on arrow key navigation"
    why_human: "Requires AT software to verify ARIA semantics at runtime"
  - test: "Visual consistency of platform icons (Pitfall 7)"
    expected: "Apple, Windows, Linux marks feel cohesive at 18px (tab) and 32px (navy tile)"
    why_human: "Visual judgment cannot be made from code; simple-icons:windows may look dated vs flat Apple/Tux marks"
---

# Phase 13: Desktop Preparation Verification Report

**Phase Goal:** The site communicates that Dictus is available on Desktop (Mac, Windows, Linux) with Coming Soon badges
**Verified:** 2026-04-16
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visitors see a new 'Also coming to Desktop' section directly after Hero on home page in both /fr and /en | VERIFIED | `page.tsx` line 44: `<ScrollReveal><Platforms /></ScrollReveal>` at line 44, after `<Hero />` line 43, before `<Features />` line 45 |
| 2 | Section renders three tabs (macOS / Windows / Linux) with simple-icons brand marks | VERIFIED | `Platforms.tsx`: `role="tablist"` present; ICONS map has `simple-icons:apple`, `simple-icons:windows`, `simple-icons:linux`; all 3 confirmed by grep |
| 3 | On desktop browser, tab matching user's OS is pre-selected after hydration without hydration mismatch | VERIFIED | `useState<null>` initial + `useEffect` + `requestAnimationFrame(() => setSelected(detected))` pattern present; mobile UA tested first (iPadOS spoof handled) |
| 4 | On mobile/unknown browser, no tab is pre-selected — neutral prompt shown | VERIFIED | `detectOs()` returns `null` for iPhone/iPad/iPod/Android; `{selected ? <ComingSoonCard /> : <p>{t("select_prompt")}</p>}` conditional present |
| 5 | Selecting a tab reveals dashed-border glass card with OS icon, description, Coming Soon pill, and GitHub Star link | VERIFIED | `ComingSoonCard`: dashed-border class exact match; navy tile with Icon; accent pulse-pill; `<a href="https://github.com/Pivii/dictus" target="_blank" rel="noopener noreferrer">` present |
| 6 | Tablist is keyboard-navigable: ArrowLeft/Right cycle with wrap, Home/End jump, Tab into panel | VERIFIED | `onTabKey` handles ArrowRight, ArrowLeft (with wrap modulo), Home (0), End (length-1); `tabIndex={active ? 0 : -1}` roving; `tabpanel` has `tabIndex={0}` |
| 7 | JSON-LD operatingSystem equals 'iOS 18+, Android, macOS, Windows, Linux' | VERIFIED | `page.tsx` line 28: `operatingSystem: "iOS 18+, Android, macOS, Windows, Linux"` — confirmed by grep |
| 8 | downloads.ts exports typed DownloadsConfig with every variant set to { enabled: false, url: '', label: 'Coming Soon' } | VERIFIED | All 7 data variants have `enabled: false` + `label: "Coming Soon"`; types `DownloadVariant`, `LinuxFormat`, `DownloadsConfig`, `downloads`, `anyEnabled` all exported |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/config/downloads.ts` | Typed arch-aware placeholder config (mac arm64/x64, win x64/arm64, linux appimage+deb+rpm); exports DownloadVariant, LinuxFormat, DownloadsConfig, downloads, anyEnabled | VERIFIED | File exists; 57 lines; all 5 exports confirmed; 7 data variants all `enabled: false` |
| `src/components/Platforms/Platforms.tsx` | Client component with WAI-ARIA tablist, OS auto-detection, Coming Soon tabpanel; min 120 lines | VERIFIED | File exists; 176 lines (exceeds min_lines: 120); starts with `"use client";`; all ARIA roles present |
| `src/app/[locale]/page.tsx` | Home page with Platforms section inserted + updated JSON-LD operatingSystem | VERIFIED | Contains `import Platforms from "@/components/Platforms/Platforms"` + `<ScrollReveal><Platforms /></ScrollReveal>` at correct position; operatingSystem updated |
| `src/messages/en.json` | New Platforms namespace (15 keys) + updated Metadata.title, Comparison.dictus_platforms, Support.compatibility_text | VERIFIED | 15 Platforms keys present; all 3 target strings updated; title 59 chars (under 70) |
| `src/messages/fr.json` | Mirror of en.json edits with French localization; key parity | VERIFIED | 15 Platforms keys present; key parity with EN confirmed (`true`); FR title 56 chars (under 70) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/[locale]/page.tsx` | `src/components/Platforms/Platforms.tsx` | `import Platforms from "@/components/Platforms/Platforms"` + `<ScrollReveal><Platforms /></ScrollReveal>` | WIRED | Import on line 3 + usage on line 44 confirmed |
| `src/components/Platforms/Platforms.tsx` | `src/config/downloads.ts` | `import { downloads } from "@/config/downloads"` | WIRED | Import confirmed; `void downloads` reference in `ComingSoonCard` keeps TS wiring live |
| `src/components/Platforms/Platforms.tsx` | `@iconify/react` | `Icon icon="simple-icons:apple|windows|linux"` | WIRED | All 3 icon slugs confirmed present |
| `src/components/Platforms/Platforms.tsx` | `src/messages/en.json` (+ fr.json) | `useTranslations("Platforms")` key lookups | WIRED | `useTranslations("Platforms")` called twice (main component + ComingSoonCard); Platforms namespace with 15 keys exists in both locale files |
| `Comparison.tsx` | `src/messages/*.json Comparison.dictus_platforms` | next-intl key lookup | WIRED | `dictus_platforms` key updated to `"Mobile & Desktop"` in both en.json and fr.json |
| `support/page.tsx` | `src/messages/*.json Support.compatibility_text` | next-intl key lookup | WIRED | `compatibility_text` updated in both locale files to multi-platform string |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DESK-01 | 13-01-PLAN.md | Download section with OS tabs + auto-detection via navigator.userAgent | SATISFIED | `Platforms.tsx` implements WAI-ARIA tablist with SSR-safe `detectOs()` via navigator.userAgent; inserted into home page after Hero |
| DESK-02 | 13-01-PLAN.md | Coming Soon badges for each platform with OS icons (Apple, Windows, Linux) | SATISFIED | `ComingSoonCard` renders accent pulse-pill (`coming_soon_label` i18n key) + Iconify icons at 32px in navy tile for each OS |
| DESK-03 | 13-01-PLAN.md | Centralized downloads.ts config file ready to activate | SATISFIED | `src/config/downloads.ts` exists with typed `DownloadsConfig`, `downloads` const (all disabled), and `anyEnabled` helper |
| DESK-04 | 13-02-PLAN.md | Site copy updated: Dictus no longer described as mobile-only | SATISFIED | Metadata.title, Comparison.dictus_platforms, Support.compatibility_text all updated in EN + FR; new Platforms namespace with 15 keys in both locales; JSON-LD operatingSystem updated |

No orphaned requirements: all 4 DESK requirements are claimed by plans and verified in the codebase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/Platforms/Platforms.tsx` | 117 | `void downloads;` in ComingSoonCard | Info | Intentional pattern to keep `downloads` import live in TS while actual branching is deferred; comment explains the intent; does not block goal |

No blockers. No unimplemented stubs. No hardcoded placeholder strings (all copy goes through `useTranslations("Platforms")`).

### Human Verification Required

#### 1. UA-Override Auto-Detection Matrix

**Test:** Open DevTools → Network conditions → User agent → Custom. Test these 6 UAs in sequence and reload each time:
- Mac Safari UA → expected: macOS tab pre-selected after hydration
- Chrome Windows UA → expected: Windows tab pre-selected
- Chrome Linux UA → expected: Linux tab pre-selected
- iPhone UA → expected: no tab selected, neutral `select_prompt` message visible
- Android Pixel UA → expected: no tab selected
- iPad UA → expected: no tab selected (iPad must NOT pre-select macOS — iPadOS spoof handled)

**Expected:** Zero hydration warnings in console for all 6 variants.
**Why human:** `navigator.userAgent` dispatch and `requestAnimationFrame` timing require real browser runtime.

#### 2. Keyboard Navigation (WCAG 2.1.1)

**Test:** Tab into tablist, then use ArrowRight/Left (with wrap), Home, End, Tab to enter panel, Tab again to GitHub link.
**Expected:** Focus and selection cycle correctly; focus enters panel on Tab; GitHub link reachable.
**Why human:** Focus management and roving tabIndex require interactive browser testing.

#### 3. Screen Reader Smoke

**Test:** VoiceOver (Cmd+F5 on Mac) or NVDA → navigate into the tablist.
**Expected:** Announces "tab list"; each tab's selected state changes on arrow key navigation.
**Why human:** AT runtime behavior cannot be verified from static code analysis.

#### 4. Icon Visual Consistency (Pitfall 7)

**Test:** View Platforms section at 18px (tab buttons) and 32px (navy tile). Compare Apple, Windows, Linux marks.
**Expected:** All three marks feel visually cohesive. If `simple-icons:windows` looks dated, swap to `simple-icons:windows11` (one-line fix in Platforms.tsx ICONS map).
**Why human:** Visual judgment cannot be made programmatically.

### Gaps Summary

No gaps found. All 4 requirements (DESK-01, DESK-02, DESK-03, DESK-04) are satisfied by substantive, wired implementations:

- `downloads.ts` is a fully typed, arch-aware config with all 7 variants disabled and ready to activate
- `Platforms.tsx` is a complete WAI-ARIA tablist implementation (176 lines) with proper SSR safety, keyboard navigation, Coming Soon UI, and GitHub star link
- Home page wires the component correctly between Hero and Features with ScrollReveal
- JSON-LD, Metadata titles, Comparison, and Support copy are all updated in both FR and EN locales
- Both message files have 15-key Platforms namespace with confirmed key parity

The 4 human verification items are quality checks (UA behavior, keyboard, screen reader, icon aesthetics) — they do not represent missing implementation. Automated code verification is complete and passes all checks.

---

_Verified: 2026-04-16_
_Verifier: Claude (gsd-verifier)_

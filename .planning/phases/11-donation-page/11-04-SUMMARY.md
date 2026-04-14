---
phase: 11-donation-page
plan: 04
subsystem: ui
tags: [i18n, next-intl, iconify, terminology, donate]

requires:
  - phase: 11-donation-page
    provides: Donate page structure, Nav CTA, Footer entry points, i18n message files
provides:
  - Terminology alignment from "Contribuer/Contribute" to "Soutenir/Support" across all user-facing copy, i18n keys, Nav pill, Footer link, and donate button
  - @iconify/react 6.0.2 installed as runtime dependency for on-demand icon loading
  - Resolves Footer naming collision by renaming pre-existing Footer.support_link (help page) to Footer.help_link
affects: [11-05-donate-card-visual-rework]

tech-stack:
  added: ["@iconify/react@^6.0.2"]
  patterns: ["i18n key as UX slot: custom_submit key name unchanged even when value changes"]

key-files:
  created: []
  modified:
    - package.json
    - package-lock.json
    - src/messages/fr.json
    - src/messages/en.json
    - src/components/Nav/Nav.tsx
    - src/components/Footer/Footer.tsx

key-decisions:
  - "Rename pre-existing Footer.support_link (for /support help page) to Footer.help_link to free up support_link for the /donate link, avoiding JSON key collision"
  - "Keep Donate.custom_submit key name unchanged; only the value changes from Contribuer/Contribute to Soutenir/Support (key describes the UX slot, not the terminology)"
  - "Keep noun 'contribution' in Donate.motivation paragraph — only the verb Contribuer was problematic per UAT design decisions"

patterns-established:
  - "i18n key naming under UX-slot semantics: the key reflects the button's purpose (custom_submit), the value carries the terminology (Soutenir)"

requirements-completed: [DON-01, DON-05]

duration: ~35 min
completed: 2026-04-14
---

# Phase 11 Plan 04: Soutenir/Support Terminology Rename Summary

**Atomic rename of "Contribuer/Contribute" -> "Soutenir/Support" across FR/EN i18n keys and call sites, plus @iconify/react ^6.0.2 installed to enable the upcoming donate card visual rework (11-05).**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-14T21:10:00Z
- **Completed:** 2026-04-14T21:45:28Z
- **Tasks:** 2
- **Files modified:** 6 (package.json, package-lock.json, src/messages/fr.json, src/messages/en.json, src/components/Nav/Nav.tsx, src/components/Footer/Footer.tsx)

## Accomplishments

- Installed `@iconify/react@^6.0.2` as a direct runtime dependency (no extra icon packs)
- Renamed `Nav.contribute_label` -> `Nav.support_label` with values Soutenir (FR) / Support (EN)
- Renamed `Footer.contribute_link` -> `Footer.support_link` with values Soutenir (FR) / Support (EN)
- Renamed pre-existing `Footer.support_link` (help page) -> `Footer.help_link` to resolve the naming collision introduced by the plan
- Updated `Donate.custom_submit` value to Soutenir (FR) / Support (EN); key name preserved
- Updated call sites in `Nav.tsx` and `Footer.tsx`
- Verified `npm run build` exits 0 and SSG generates `/fr/donate` + `/en/donate`

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @iconify/react dependency** - `403d696` (chore)
2. **Task 2: Rename Contribuer/Contribute -> Soutenir/Support across i18n and call sites** - `f60c22b` (refactor)

## Files Created/Modified

- `package.json` - Added `@iconify/react@^6.0.2` to dependencies
- `package-lock.json` - Lockfile updated for iconify + dependency tree
- `src/messages/fr.json` - Nav.contribute_label -> support_label (Soutenir); Footer.support_link (Support) -> help_link, Footer.contribute_link -> support_link (Soutenir); Donate.custom_submit value Contribuer -> Soutenir
- `src/messages/en.json` - Same rename set applied in English (Contribute -> Support)
- `src/components/Nav/Nav.tsx` - `t("contribute_label")` -> `t("support_label")`
- `src/components/Footer/Footer.tsx` - `t("support_link")` (help page) -> `t("help_link")`, `t("contribute_link")` (donate) -> `t("support_link")`

## Decisions Made

- **Footer key collision resolution:** The plan directed `Footer.contribute_link` -> `Footer.support_link`, but `Footer.support_link` already existed, referring to the `/support` help page. Renamed the existing help-page key to `Footer.help_link` to free the `support_link` name for the donate link, preserving the plan's intent without losing the help-page link.
- **Key vs value semantics:** `Donate.custom_submit` describes a UX slot (the CTA inside each card), so the key name stays stable while the value swaps in the new terminology. This keeps future plan 11-05 refactors simpler.
- **Noun vs verb distinction:** `Donate.motivation` keeps the noun "contribution" in both languages per explicit UAT design decision — only the verb "Contribuer/Contribute" was replaced.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resolved Footer JSON key collision for support_link**
- **Found during:** Task 2 (read_first gate — reading fr.json/en.json revealed pre-existing `Footer.support_link` key used for the `/support` help page link)
- **Issue:** The plan's `<interfaces>` block missed that `Footer.support_link` already existed with value "Support"/"Support" pointing to the `/support` help page. Renaming `Footer.contribute_link` -> `Footer.support_link` as instructed would have produced duplicate JSON keys (second occurrence silently overwrites the first) and broken either the help link or the donate link.
- **Fix:** Renamed the pre-existing `Footer.support_link` (help page) to `Footer.help_link` in both `fr.json` and `en.json`, and updated `src/components/Footer/Footer.tsx` to call `t("help_link")` for the `/support` link. This frees `support_link` for the donate link exactly as the plan specified.
- **Files modified:** src/messages/fr.json, src/messages/en.json, src/components/Footer/Footer.tsx
- **Verification:** `grep "support_link" src/messages/*.json` confirms `support_link` now maps to "Soutenir"/"Support" (donate); `grep "help_link" src/messages/*.json` confirms `help_link` maps to "Support"/"Support" (help page). `npm run build` succeeds, both `/fr/support` and `/en/support` still generate.
- **Committed in:** `f60c22b` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was strictly necessary for correctness — without it, one footer link would have been silently lost. No scope creep; the plan's intent (Soutenir/Support everywhere) is fully honored.

## Issues Encountered

None. All acceptance criteria passed on first verification. Node version warning during `npm install` (`eslint-visitor-keys` wants Node 20.19+; current is 20.18.3) is pre-existing and unrelated to this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Terminology is fully aligned across Nav, Footer, donate page, i18n keys, metadata, and HTML titles. Ready for the visual rework in plan 11-05.
- `@iconify/react` is installed and importable (`import { Icon } from "@iconify/react"`) so plan 11-05 can swap the donate card icons (`solar:card-bold-duotone`, `bitcoin-icons:bitcoin-circle-filled`) without adding new dependencies.
- Build pipeline green; both `/fr/donate` and `/en/donate` render under the new terminology.

## Self-Check

- `package.json` contains `@iconify/react`: FOUND
- `node_modules/@iconify/react/package.json` exists: FOUND
- Commit `403d696` in history: FOUND
- Commit `f60c22b` in history: FOUND
- `grep -rn "contribute_label\|contribute_link\|Contribuer" src/` -> no matches: PASS
- `grep "\"Contribute\"" src/messages/en.json` -> no matches: PASS
- `support_label` present in fr.json (Soutenir) and en.json (Support): PASS
- `support_link` present in fr.json (Soutenir) and en.json (Support): PASS
- `custom_submit` value = Soutenir (fr) / Support (en): PASS
- `npm run build` exits 0 with /fr/donate + /en/donate generated: PASS

## Self-Check: PASSED

---
*Phase: 11-donation-page*
*Completed: 2026-04-14*

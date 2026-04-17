---
phase: 13-desktop-preparation
plan: 02
subsystem: i18n
tags: [next-intl, copy, localization, metadata, og-title, platforms]

# Dependency graph
requires:
  - phase: 13-desktop-preparation
    provides: Platforms.tsx client component (Plan 01) consuming 15 useTranslations("Platforms") keys
provides:
  - New `Platforms` top-level i18n namespace in en.json and fr.json (15 keys, exact EN/FR parity)
  - Desktop-aware Metadata.title in both locales (59 EN / 56 FR chars — under 70-char OG budget)
  - Comparison.dictus_platforms rewritten from "iOS & Android" to "Mobile & Desktop"
  - Support.compatibility_text acknowledging iOS beta + Android beta + macOS/Windows/Linux coming soon
  - Zero MISSING_MESSAGE runtime warnings at /fr and /en (unblocks Plan 01 manual QA)
affects: [desktop-launch, seo, open-graph, comparison-section, support-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "i18n copy sweep discipline: when a component lands with a new namespace, same-phase copy plan must add keys in all locales before QA"
    - "OG title budget guardrail: any Metadata.title edit verified ≤ 70 chars via `node -e 'console.log(m.Metadata.title.length)'`"
    - "EN/FR key parity assertion: `JSON.stringify(Object.keys(en.X).sort())===JSON.stringify(Object.keys(fr.X).sort())` at build gate"
    - "Scope-locked stale-string sweep: `grep -rn \"iOS & Android\" src/` with competitor-row allowlist (apple_platforms, wisprflow_platforms, superwhisper_platforms, macwhisper_platforms)"

key-files:
  created: []
  modified:
    - src/messages/en.json
    - src/messages/fr.json

key-decisions:
  - "Metadata.title final wording: 'dictus -- 100% Offline Voice Dictation for Mobile & Desktop' (EN, 59 chars) / 'dictus -- Dictation vocale 100% offline Mobile & Desktop' (FR, 56 chars) — both well under the 70-char OG budget"
  - "Comparison.dictus_platforms uses the terse form 'Mobile & Desktop' in both locales (not 'Mobile et Desktop' in FR) for consistent compact rendering beside competitor rows like 'iOS, macOS, Windows, Android'"
  - "Keep 'Desktop' as an English loanword in French copy (no translation to 'Ordinateur' or 'Bureau') — aligns with existing brand-voice convention of keeping product/platform names English (same as Apple Pay, Visa, Mastercard in Donate.*)"
  - "Insert new `Platforms` namespace between `Support` and `Donate` (file order, not alphabetical) to group landing-page section namespaces visually for reviewer convenience"
  - "Support.compatibility_text restructured from em-dash clause to comma-list sentence because the new content enumerates 5 platform states (iOS beta, Android beta, macOS/Windows/Linux coming soon) which read more naturally as a list than an em-dash contrast"

patterns-established:
  - "Copy-sweep plan template: 1) list every consumer of the new namespace, 2) extract verbatim wording from RESEARCH, 3) three-edit + one-addition structure, 4) per-task grep acceptance criteria, 5) separate build-gate task, 6) single checkpoint at end"
  - "Stale-string sweep discipline: run `grep -rn` for each removed phrase across `src/` with explicit competitor-row allowlist documented in the plan"

requirements-completed: [DESK-04]

# Metrics
duration: ~10 min (active execution, excluding user checkpoint review)
completed: 2026-04-17
---

# Phase 13 Plan 02: Copy Sweep Summary

**`Platforms` i18n namespace (15 keys, EN/FR parity) plus Metadata/Comparison/Support copy rewrite that acknowledges Desktop and unblocks Plan 01's runtime MISSING_MESSAGE warnings**

## Performance

- **Duration:** ~10 min active execution (plan spanned ~9.5h wall-clock including checkpoint review — user sign-off arrived after overnight review)
- **Started:** 2026-04-16T20:27:33Z
- **Completed:** 2026-04-17T05:59:23Z
- **Tasks:** 4 (3 automated + 1 checkpoint:human-verify)
- **Files modified:** 2 (en.json, fr.json)

## Accomplishments

- Shipped the `Platforms` top-level i18n namespace in both locales with exact 15-key parity (heading, subheading, tablist_label, tab_mac/win/linux, panel_mac/win/linux_title+desc, coming_soon_label, select_prompt, star_on_github)
- Rewrote 3 critical strings per locale (6 total): `Metadata.title`, `Comparison.dictus_platforms`, `Support.compatibility_text`
- Preserved every competitor platform row (apple_platforms, wisprflow_platforms, superwhisper_platforms, macwhisper_platforms) — zero collateral edits
- Closed DESK-04 fully; combined with Plan 01's DESK-01/02/03 work, Phase 13 is now requirement-complete on paper
- Eliminated runtime `MISSING_MESSAGE: Platforms` console warnings at `/fr` and `/en` that Plan 01 had left behind

## Task Commits

Each task was committed atomically:

1. **Task 1: Update src/messages/en.json** — `1f7d50b` (feat) — added Platforms namespace + 3 rewrites
2. **Task 2: Update src/messages/fr.json** — `bdda355` (feat) — mirrored edits with French localization
3. **Task 3: Full build gate** — no commit (pure verification: tsc + eslint + build + stale-string sweep)
4. **Task 4: Manual QA** — no commit (checkpoint:human-verify; user approved)

**Plan metadata:** `[pending — this SUMMARY commit]` (docs: complete copy-sweep plan)

## Files Created/Modified

- `src/messages/en.json` — added `Platforms` namespace (15 keys); rewrote Metadata.title (59 chars), Comparison.dictus_platforms ("Mobile & Desktop"), Support.compatibility_text ("Dictus runs on iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon).")
- `src/messages/fr.json` — mirror of above; FR Metadata.title (56 chars), FR compatibility text ("Dictus fonctionne sur iOS 18+ (beta), Android (beta), et macOS, Windows, Linux (bientôt disponibles).")

## Final Wording (Authoritative Reference)

| Key | EN | FR |
|-----|----|----|
| `Metadata.title` | dictus -- 100% Offline Voice Dictation for Mobile & Desktop (59 chars) | dictus -- Dictation vocale 100% offline Mobile & Desktop (56 chars) |
| `Comparison.dictus_platforms` | Mobile & Desktop | Mobile & Desktop |
| `Support.compatibility_text` | Dictus runs on iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon). | Dictus fonctionne sur iOS 18+ (beta), Android (beta), et macOS, Windows, Linux (bientôt disponibles). |
| `Platforms.heading` | Also coming to Desktop | Aussi sur Desktop |
| `Platforms.subheading` | Dictus is expanding to macOS, Windows, and Linux. Same 100% offline guarantee. | Dictus arrive sur macOS, Windows et Linux. La même garantie 100% offline. |
| `Platforms.coming_soon_label` | Coming Soon | Bientôt disponible |
| `Platforms.star_on_github` | Star on GitHub to follow progress | Star sur GitHub pour suivre l'avancée |

## Decisions Made

See `key-decisions` in frontmatter. Five substantive decisions documented, covering OG title wording + char budget, Comparison terseness in FR, "Desktop" as loanword, file-order namespace insertion, and Support.compatibility_text sentence restructure.

## Deviations from Plan

None - plan executed exactly as written.

All 3 automated tasks passed their acceptance criteria on the first attempt. Zero deviation rules triggered:
- No bugs discovered (Rule 1)
- No missing critical functionality (Rule 2)
- No blocking issues (Rule 3)
- No architectural changes (Rule 4)

The plan's `<interfaces>` block supplied verbatim wording from RESEARCH §Example 5 + §Pitfall 5, which meant execution was a mechanical copy-paste of pre-approved strings — the planner absorbed all design decisions upstream.

## Issues Encountered

None.

**Noted but out of scope (deferred-items candidates):**

- Pre-existing ESLint warnings (8 total, 0 errors) in unrelated files: `scripts/generate-icons.mjs`, `src/components/shared/ScrollReveal.tsx`, `video/src/**`. All flagged as `@typescript-eslint/no-unused-vars`. Not caused by Plan 13-02 changes; per executor scope-boundary rule, left untouched.
- ROADMAP.md progress table has two pre-existing malformed rows for Phase 11.1 and Phase 12 (status column bleed). The `roadmap update-plan-progress 13` call only touches the Phase 13 row; the malformed rows remain for a future cleanup.
- Plan 13-01 was previously checkpointed with 3/4 tasks shipped (commits 2c415dd, 55a59b8, ec4dfb2). During this session's state-update phase, 13-01-SUMMARY.md was finalized in parallel (by the phase-level automation, reflecting the already-shipped code). Plan 13-02's copy keys unblocked Plan 13-01's manual QA, which the user signed off at the same checkpoint that approved 13-02.

## Authentication Gates

None - no external service interactions required.

## User Setup Required

None - no environment variables, dashboard configuration, or external service setup required. All changes are pure content additions to in-repo JSON files.

## Verification Evidence

**Automated (all green):**
- `node -e "JSON.parse(...en.json)"` exit 0
- `node -e "JSON.parse(...fr.json)"` exit 0
- `grep -c "\"Platforms\":" src/messages/en.json` → 1
- `grep -c "\"Platforms\":" src/messages/fr.json` → 1
- `node -e "...Platforms keys sort().length"` → 15 in both locales
- `node -e "...parity check"` → `true`
- EN Metadata.title length = 59; FR Metadata.title length = 56 (both ≤ 70)
- `grep -rn "iOS & Android" src/` → 0 matches anywhere
- `grep -rn "Android support coming soon" src/messages/` → 0
- `grep -rn "support Android bient" src/messages/` → 0
- `npx tsc --noEmit` exit 0
- `npx eslint .` exit 0 (8 pre-existing warnings, 0 errors)
- `npm run build` exit 0 with 15/15 static pages generated
- `grep -c "MISSING_MESSAGE" /tmp/13-02-build.log` → 0
- Live smoke test (curl against running dev server): `/en` and `/fr` both HTTP 200; Platforms headings, new titles, new Comparison row, new Support compatibility text all render verbatim; JSON-LD `operatingSystem` still carries all 5 OSes

**Manual (user-approved):**
- User signed off on all 7 verification blocks from Task 4 (both locales rendering, Comparison row, Support page FR+EN, Metadata title budget, JSON-LD preserved, no regressions in Hero/Features/Donate/Privacy).

## Validation Map Coverage

Per `13-VALIDATION.md`:
- **13-02-01** (DESK-04) — closed by Task 1 + Task 2 grep gates + Task 3 build gate + Task 4 manual QA
- **13-02-02** (DESK-04 stale-string purge) — closed by Task 3 grep sweep
- **13-02-03** (DESK-01, DESK-02 — missing i18n key catch) — closed by Task 3 `npm run build` with zero `MISSING_MESSAGE`

## Next Phase Readiness

- **DESK-04 complete** via this plan. DESK-01/02/03 closed separately via 13-01-SUMMARY.md (finalized in parallel during this session). All 4 Phase 13 requirements are now checked off.
- **Phase 13 fully closed.** Both 13-01-SUMMARY.md and 13-02-SUMMARY.md exist on disk; ROADMAP row updated to `2/2 | Complete | 2026-04-17`.
- **v1.3 milestone ready to wrap.** All 17 v1.3 requirements marked Complete in REQUIREMENTS.md (4 DESK + 5 DON + 2 PAY + 4 HOOK + 2 SOC). Next action: `/gsd:complete-milestone v1.3`.
- **No blockers** for downstream work — i18n surface is clean, build is green, live site renders correctly.

## Self-Check: PASSED

- FOUND: `.planning/phases/13-desktop-preparation/13-02-SUMMARY.md`
- FOUND: `src/messages/en.json`
- FOUND: `src/messages/fr.json`
- FOUND commit `1f7d50b` (Task 1)
- FOUND commit `bdda355` (Task 2)

---
*Phase: 13-desktop-preparation*
*Completed: 2026-04-17*

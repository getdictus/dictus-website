---
phase: 13
slug: desktop-preparation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no jest/vitest/playwright installed; manual QA floor) |
| **Config file** | none — `tsconfig.json` + `eslint.config.mjs` cover static checks |
| **Quick run command** | `npx tsc --noEmit && npx eslint .` |
| **Full suite command** | `npx tsc --noEmit && npx eslint . && npm run build` |
| **Estimated runtime** | ~60 seconds full, ~10s quick |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit && npx eslint .`
- **After every plan wave:** Run `npx tsc --noEmit && npx eslint . && npm run build`
- **Before `/gsd:verify-work`:** Full suite green + manual multi-viewport smoke (375 / 768 / 1440) + UA-override pass (Mac/Win/Linux/iPhone/Android) + keyboard tab nav + VoiceOver/NVDA spot-check
- **Max feedback latency:** 60 seconds for automated; manual smoke added at phase gate only

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | DESK-03 | type-check | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 13-01-02 | 01 | 1 | DESK-01, DESK-02 | type-check + build | `npx tsc --noEmit && npm run build` | ✅ | ⬜ pending |
| 13-01-03 | 01 | 1 | DESK-01 | build + manual | `npm run build` + manual UA override | ✅ | ⬜ pending |
| 13-01-04 | 01 | 1 | DESK-04 (JSON-LD) | grep + type-check | `grep -n "iOS 18+, Android, macOS, Windows, Linux" src/app/[locale]/page.tsx` + `npx tsc --noEmit` | ✅ | ⬜ pending |
| 13-02-01 | 02 | 2 | DESK-04 | grep + build | `grep -n "Mobile & Desktop" src/messages/en.json src/messages/fr.json` + `npm run build` | ✅ | ⬜ pending |
| 13-02-02 | 02 | 2 | DESK-04 | grep | `grep -rn "iOS & Android" src/messages` returns zero matches on Dictus rows | ✅ | ⬜ pending |
| 13-02-03 | 02 | 2 | DESK-01, DESK-02 | build | `npm run build` (catches missing Platforms.* i18n keys) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*No Wave 0 install — installing a test runner (vitest/jest/playwright) is out of scope per §Scope Discipline. Manual smoke is the accepted floor for a preparation phase.*

- [ ] Document manual UA-override smoke checklist inside PLAN 01 (testing 5 platforms: Mac / Win / Linux / iPhone / Android)
- [ ] Document keyboard-nav smoke checklist inside PLAN 01 (Arrow / Home / End / Tab cycle)
- [ ] Add convenience script `"typecheck": "tsc --noEmit"` to `package.json` (optional — not a blocker)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OS auto-detection pre-selects correct tab across 5 UAs | DESK-01 | No test runner; needs real navigator | DevTools → Network conditions → override UA to Mac / Win / Linux / iPhone / Android → reload `/en` and `/fr` → verify tab preselection matches spec (Mac→mac, Win→win, Linux→linux, iPhone/Android→no selection) |
| Tablist keyboard nav (Arrow / Home / End / Tab) | DESK-01 | WCAG 2.1.1 can only be verified with real keyboard | Focus first tab → ArrowRight cycles → Home → first, End → last, Tab → panel content |
| Screen-reader announces `aria-selected` transitions | DESK-01 | VoiceOver/NVDA behavior not mockable | macOS VoiceOver (Cmd+F5) or Windows NVDA → navigate tablist → verify "selected" announcement on each state change |
| Coming Soon pulse-pill visible and animated | DESK-02 | Visual | Load `/en`, select each tab, confirm pulse dot animates |
| No hydration mismatch in dev console | DESK-01 | React runtime warning, not a test assertion | `npm run dev` → hard reload `/en` and `/fr` → DevTools console has zero "Text content does not match" warnings |
| OG title length ≤ 70 chars for both locales | DESK-04 | External service check | Open opengraph.xyz for `/en` and `/fr` → verify no mid-title ellipsis |
| Visual consistency of simple-icons:windows vs apple/linux | DESK-02 | Subjective brand call (Pitfall 7) | Visual at 18px + 32px; escalate to `simple-icons:windows11` if flat-mark mismatch |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify OR are documented as manual-required in Manual-Only table above
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (every task has at least tsc/grep/build)
- [ ] Wave 0 covers all MISSING references (N/A — manual floor accepted)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s for automated pass
- [ ] `nyquist_compliant: true` set in frontmatter after execution verifies the map

**Approval:** pending

---
phase: 5
slug: theme-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (e2e) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx playwright test --grep "theme"` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 0 | THEME-01 | e2e | `npx playwright test tests/theme-toggle.spec.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 0 | THEME-02 | e2e (visual) | `npx playwright test tests/theme-colors.spec.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 0 | THEME-03 | e2e (visual) | `npx playwright test tests/waveform-theme.spec.ts` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 0 | THEME-04 | e2e | `npx playwright test tests/theme-persistence.spec.ts` | ❌ W0 | ⬜ pending |
| 05-01-05 | 01 | 0 | THEME-05 | manual-only | Visual inspection | N/A | ⬜ pending |
| 05-01-06 | 01 | 0 | THEME-06 | e2e | `npx playwright test tests/theme-fowt.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — Playwright configuration for e2e tests
- [ ] `tests/theme-toggle.spec.ts` — THEME-01 toggle behavior
- [ ] `tests/theme-colors.spec.ts` — THEME-02 color migration verification
- [ ] `tests/waveform-theme.spec.ts` — THEME-03 canvas adaptation
- [ ] `tests/theme-persistence.spec.ts` — THEME-04 localStorage persistence
- [ ] `tests/theme-fowt.spec.ts` — THEME-06 FOWT prevention
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Smooth 200ms transition on theme switch | THEME-05 | Timing assertion unreliable in e2e; animation quality is subjective | 1. Open site in browser 2. Toggle theme 3. Verify smooth color transition (~200ms) with no harsh snap 4. Check waveform color lerp (~300ms) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

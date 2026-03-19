---
phase: 8
slug: app-store-compliance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (build validation only) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | COMP-01 | smoke | `npm run build` | N/A — build test | ⬜ pending |
| 08-01-02 | 01 | 1 | COMP-02 | smoke | `npm run build` | N/A — build test | ⬜ pending |
| 08-02-01 | 02 | 1 | COMP-03 | smoke | `npm run build` | N/A — build test | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework is needed — build success and lint pass validate the pages compile and route correctly.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Privacy page renders all 8+ Apple sections | COMP-01 | Content completeness requires visual review | Visit `/fr/privacy` and `/en/privacy`, verify all sections present |
| Support page shows contact email | COMP-02 | Content correctness requires visual review | Visit `/fr/support` and `/en/support`, verify email visible |
| Footer links navigate correctly | COMP-03 | Navigation flow requires browser test | Click privacy/support links in footer from homepage |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

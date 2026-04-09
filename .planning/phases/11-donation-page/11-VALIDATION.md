---
phase: 11
slug: donation-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-09
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (or existing config) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | DON-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | DON-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 1 | DON-03 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 11-01-04 | 01 | 1 | DON-04 | visual | manual | N/A | ⬜ pending |
| 11-01-05 | 01 | 1 | DON-05 | docs | file check | N/A | ⬜ pending |
| 11-02-01 | 02 | 1 | PAY-01 | docs | file check | N/A | ⬜ pending |
| 11-02-02 | 02 | 1 | PAY-02 | docs | file check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test file stubs for donation page component rendering
- [ ] Test file stubs for amount chip selection behavior
- [ ] Test file stubs for navigation link presence

*If no test framework detected: install vitest + @testing-library/react*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glassmorphism cards with hover glow | DON-04 | Visual/CSS verification | Inspect cards on /donate, verify glassmorphism backdrop-blur and hover glow effect |
| Stripe redirect opens correct Payment Link | DON-02 | Requires live Stripe account | Click each chip, verify redirect to correct Stripe Payment Link URL |
| BTCPay invoice opens in new tab | DON-03 | Requires live BTCPay instance | Click Bitcoin CTA, verify new tab opens BTCPay checkout |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

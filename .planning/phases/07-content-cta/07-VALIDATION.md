---
phase: 7
slug: content-cta
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — build-check + manual for this UI-heavy phase |
| **Config file** | none — no test framework needed |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual visual check in browser
- **Before `/gsd:verify-work`:** Build green + visual verification of all 12 requirements
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | COMP-01 | smoke | `npm run build` | N/A | ⬜ pending |
| TBD | 01 | 1 | COMP-02 | manual | Visual inspection | N/A | ⬜ pending |
| TBD | 01 | 1 | COMP-03 | manual | Visual inspection | N/A | ⬜ pending |
| TBD | 01 | 1 | COMP-04 | manual | Browser scroll test | N/A | ⬜ pending |
| TBD | 01 | 1 | COMP-05 | manual | Browser resize / devtools | N/A | ⬜ pending |
| TBD | 01 | 1 | COMP-06 | manual | Visual inspection | N/A | ⬜ pending |
| TBD | 01 | 1 | COMP-07 | smoke | Check en.json + fr.json keys | N/A | ⬜ pending |
| TBD | 02 | 1 | CTA-01 | manual | Safari devtools UA override | N/A | ⬜ pending |
| TBD | 02 | 1 | CTA-02 | manual | Desktop browser with env var | N/A | ⬜ pending |
| TBD | 02 | 1 | CTA-03 | smoke | Check en.json + fr.json keys | N/A | ⬜ pending |
| TBD | 02 | 1 | CTA-04 | smoke | Remove env var, verify badge | N/A | ⬜ pending |
| TBD | 02 | 1 | CTA-05 | smoke | `npm run build && npm start` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No test framework installation needed — this phase is purely presentational with validation through build checks and manual visual verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dictus column visually highlighted | COMP-03 | Visual styling verification | Inspect table: Dictus column has accent-blue left border and glow background |
| Sticky header on scroll | COMP-04 | Requires scroll interaction | Scroll past table header, verify it sticks below Nav (64px offset) |
| Card stack on mobile | COMP-05 | Requires viewport resize | Open devtools, resize to <768px, verify cards render with expand/collapse |
| Stagger animation on scroll | COMP-06 | Animation timing verification | Scroll to table section, verify rows animate in with ~80ms stagger delay |
| iPhone TestFlight button | CTA-01 | Requires UA override | In Safari devtools, set UA to iPhone, verify "Join TestFlight" button appears |
| Desktop QR code display | CTA-02 | Visual + device-specific | On desktop browser with env var set, verify QR code and "Available on iPhone" text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

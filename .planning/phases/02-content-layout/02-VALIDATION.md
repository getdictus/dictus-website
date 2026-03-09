---
phase: 2
slug: content-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — content/layout phase, no test framework needed |
| **Config file** | none |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run lint`
- **After every plan wave:** Run `npm run build && npm run lint` + manual visual check
- **Before `/gsd:verify-work`:** Full suite must be green + manual responsive check at 320px, 768px, 1280px + FR/EN toggle verification
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | HERO-01 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | HERO-04 | manual | Visual inspection | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | NAV-02 | manual | Toggle FR/EN, verify text changes | N/A | ⬜ pending |
| 02-01-04 | 01 | 1 | NAV-03 | manual | Scroll page, check glassmorphism | N/A | ⬜ pending |
| 02-02-01 | 02 | 2 | FEAT-01 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-02-02 | 02 | 2 | FEAT-02 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-02-03 | 02 | 2 | FEAT-03 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-02-04 | 02 | 2 | FEAT-04 | manual | Click GitHub link | N/A | ⬜ pending |
| 02-02-05 | 02 | 2 | FEAT-05 | manual | Visual inspection | N/A | ⬜ pending |
| 02-02-06 | 02 | 2 | FOOT-01 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-02-07 | 02 | 2 | PRIV-02 | manual | Visual inspection | N/A | ⬜ pending |
| 02-03-01 | 03 | 3 | DSGN-03 | manual | DevTools audit backdrop-filter | N/A | ⬜ pending |
| 02-03-02 | 03 | 3 | PERF-02 | manual | DevTools responsive + Lighthouse | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — this phase is content/layout focused. Validation is build success + manual visual/responsive checks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Headline visible within 3s | HERO-01 | Visual perception timing | Load page, verify headline renders immediately |
| Coming Soon badge visible | HERO-04 | Visual design check | Verify badge appears on CTA |
| Language toggle switches all content | NAV-02 | Content correctness | Toggle FR/EN, check every section text changes |
| Glassmorphism nav on scroll | NAV-03 | Visual effect validation | Scroll page, verify blur + transparency on nav |
| 4 glassmorphism feature cards | FEAT-01 | Visual design check | Verify 4 cards with blur effect |
| 3-step how-it-works | FEAT-02 | Layout/content check | Verify 3 steps with icons/arrows |
| Data flow diagram | FEAT-03 | Visual design check | Verify diagram renders correctly |
| GitHub link present | FEAT-04 | Link functionality | Click link, verify opens GitHub |
| Community CTA with Telegram | FEAT-05 | Visual + link check | Verify CTA and Telegram link |
| Footer with credits/links | FOOT-01 | Content check | Verify footer content present |
| Max 6 blur elements per viewport | DSGN-03 | Performance audit | DevTools: count backdrop-filter elements visible |
| Responsive 320px-desktop, 44px touch | PERF-02 | Multi-viewport check | DevTools responsive mode at 320px, 768px, 1280px |
| Zero data collection statement | PRIV-02 | Content check | Verify privacy statement present |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

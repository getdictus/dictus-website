---
phase: 6
slug: visual-effects
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — visual/CSS phase, no test framework needed |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual visual inspection in Chrome + Safari
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | GLASS-01 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-01-02 | 01 | 1 | GLASS-02 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-01-03 | 01 | 1 | GLASS-04 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-01-04 | 01 | 1 | GLASS-05 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-02-01 | 02 | 1 | HERO-01 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | HERO-02 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-02-03 | 02 | 1 | HERO-03 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-02-04 | 02 | 1 | HERO-04 | manual + build | `npm run build` | N/A | ⬜ pending |
| 06-02-05 | 02 | 1 | HERO-05 | manual + build | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated visual test framework needed — `npm run build` verifies TypeScript compilation and `npm run lint` catches static issues.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glass effect visible on nav, hero overlay, cards | GLASS-01 | Visual appearance — no automated pixel comparison | Inspect elements in Chrome DevTools, verify backdrop-filter applied |
| backdrop-filter cross-browser | GLASS-02 | Browser rendering differences | Test in Safari + Chrome, verify blur visible |
| Glass correct in light + dark | GLASS-04 | Theme-dependent visual quality | Toggle theme, inspect glass in both modes |
| No jank on mobile Safari | GLASS-05 | Performance requires real device | Safari Web Inspector FPS overlay on iOS device |
| Waveform starts flat | HERO-01 | Canvas animation state | Load page, observe initial waveform state |
| Waveform animates with energy | HERO-02 | Canvas visual behavior | Observe active phase amplitude variation |
| Waveform calms transition | HERO-03 | Canvas animation timing | Observe calm phase settle animation |
| Text appears as waveform calms | HERO-04 | Sync between text and canvas | Observe text reveal coordinated with waveform calm |
| Reduced motion static frame | HERO-05 | OS-level preference behavior | Enable prefers-reduced-motion, verify static bars |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

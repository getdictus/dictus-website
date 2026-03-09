---
phase: 3
slug: animations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing + Lighthouse |
| **Config file** | none — no automated test framework in project |
| **Quick run command** | `npm run build` |
| **Full suite command** | Manual visual verification per success criteria |
| **Estimated runtime** | ~30 seconds (build) + manual review |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Full visual review in browser (desktop + mobile viewport)
- **Before `/gsd:verify-work`:** All 5 success criteria verified manually
- **Max feedback latency:** 30 seconds (build check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ANIM-01 | manual | `npm run build` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | ANIM-01 | manual | `npm run build` | N/A | ⬜ pending |
| 03-01-03 | 01 | 1 | ANIM-03 | manual | `npm run build` | N/A | ⬜ pending |
| 03-02-01 | 02 | 2 | HERO-02 | manual-only | Visual browser inspection | N/A | ⬜ pending |
| 03-02-02 | 02 | 2 | HERO-03 | manual-only | Visual browser inspection | N/A | ⬜ pending |
| 03-02-03 | 02 | 2 | ANIM-02 | manual-only | Visual timing check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — all phase behaviors are visual/animation and require manual verification. Build verification (`npm run build`) catches type errors and import issues.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Animated sinusoidal waveform in hero | HERO-02 | Visual canvas animation — no DOM output to assert | Open browser, verify 2-3 overlapping sine waves animate smoothly at ~60fps |
| Word-by-word text with cursor | HERO-03 | Timing and visual sequence — requires human observation | Watch text appear word-by-word at ~200-300ms pace with blinking cursor |
| Scroll-triggered section reveals | ANIM-01 | Visual fade+slide triggered by scroll position | Scroll page, verify each section fades/slides into view at ~20% viewport |
| State micro-animation cycling 5 states | ANIM-02 | Color and timing cycle — requires visual verification | Watch indicator cycle through idle→recording→transcribing→smart→inserted (~8-10s) |
| Reduced motion respected | ANIM-03 | OS-level setting interaction | Toggle prefers-reduced-motion in OS/browser DevTools, verify all animations stop |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

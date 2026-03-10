---
phase: 4
slug: polish-performance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Lighthouse CLI (via npx) + curl smoke tests |
| **Config file** | none — CLI flags suffice |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npx lighthouse http://localhost:3000/fr --output=json --quiet --chrome-flags="--headless"` on both /fr and /en |
| **Estimated runtime** | ~30 seconds (build) + ~60 seconds (Lighthouse per locale) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run full Lighthouse audit on /fr and /en
- **Before `/gsd:verify-work`:** Full suite must be green (all scores >= 90)
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PERF-01 | audit | `npx lighthouse http://localhost:3000/fr --output=json --chrome-flags="--headless"` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | SEO-01 | smoke | `curl -s http://localhost:3000/fr \| grep -c "og:title"` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | SEO-02 | smoke | `curl -s http://localhost:3000/sitemap.xml \| grep -c "hreflang"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework install needed — Lighthouse CLI runs via npx
- [ ] OG image file must be created (static PNG in /public)
- [ ] Smoke test commands work against `npm run build && npx serve out` or `next start`

*Existing build infrastructure covers compilation validation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OG image renders correctly in social preview | SEO-01 | Platform-specific rendering | Share URL on Twitter/Facebook debugger tools |
| Skip-to-content link visible on Tab key | PERF-01 (a11y) | Keyboard interaction | Tab into page, verify skip link appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

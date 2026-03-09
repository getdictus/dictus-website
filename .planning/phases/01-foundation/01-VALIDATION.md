---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (not yet installed -- greenfield project) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (confirms no build errors)
- **After every plan wave:** Run `npm run build` + manual smoke test of /fr and /en
- **Before `/gsd:verify-work`:** Full build must be green, /fr and /en render correctly
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DSGN-01 | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | DSGN-02 | smoke | `npm run build` + check no external font requests | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | DSGN-04 | smoke | Visual check: dark background renders | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | I18N-01 | integration | `curl localhost:3000/fr` + `curl localhost:3000/en` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | I18N-02 | integration | `curl -H "Accept-Language: en" localhost:3000/` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 1 | NAV-01 | smoke | Visual check: sticky nav with logo | ❌ W0 | ⬜ pending |
| 1-02-04 | 02 | 1 | NAV-04 | unit | Check metadata output for icon links | ❌ W0 | ⬜ pending |
| 1-02-05 | 02 | 1 | PRIV-01 | smoke | `npm run build` + inspect HTML for external script/link tags | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` — install test framework
- [ ] `vitest.config.ts` — configure Vitest for Next.js
- [ ] Build verification script — `npm run build` as baseline gate

*Note: This is a landing page project. Build verification + manual smoke tests are the primary validation strategy for Phase 1. Vitest setup is optional for this phase but recommended for future phases.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Brand colors render correctly | DSGN-01 | Visual check of rendered colors | Visit /fr, inspect elements for correct Tailwind classes and rendered colors |
| Dark-only background | DSGN-04 | Visual confirmation | Visit /fr, verify #0A1628 / #0B0F1A backgrounds |
| Sticky nav with logo | NAV-01 | Visual + scroll behavior | Visit /fr, scroll down, verify nav stays sticky |
| Favicon visible in browser tab | NAV-04 | Browser behavior | Visit /fr, check browser tab icon |
| Fonts render as DM Sans/Mono | DSGN-02 | Visual font inspection | Visit /fr, inspect computed font-family |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

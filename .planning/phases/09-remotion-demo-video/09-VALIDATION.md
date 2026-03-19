---
phase: 9
slug: remotion-demo-video
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual validation + CLI render verification |
| **Config file** | None — Remotion videos are validated visually + render smoke tests |
| **Quick run command** | `cd video && npx remotion studio src/index.ts` |
| **Full suite command** | `cd video && npx remotion render src/index.ts dictus-demo-fr out/test.mp4 --codec h264` |
| **Estimated runtime** | ~30 seconds (render) |

---

## Sampling Rate

- **After every task commit:** Run `cd video && npx remotion studio src/index.ts` (visual preview)
- **After every plan wave:** Run `cd video && npx remotion render src/index.ts dictus-demo-fr out/test.mp4 --codec h264`
- **Before `/gsd:verify-work`:** Full suite must be green — both FR + EN MP4s rendered, each < 5MB
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | VID-01 | smoke | `cd video && node -e "require('remotion')"` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | VID-02 | manual-only | Visual check in Remotion Studio | N/A | ⬜ pending |
| 09-02-01 | 02 | 1 | VID-03 | manual-only | Visual check in Remotion Studio | N/A | ⬜ pending |
| 09-02-02 | 02 | 1 | VID-04 | manual-only | Visual check in Remotion Studio | N/A | ⬜ pending |
| 09-02-03 | 02 | 2 | VID-05 | smoke | `cd video && npx remotion render src/index.ts dictus-demo-fr out/test.mp4 --codec h264 && ls -la out/test.mp4` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `video/package.json` — Remotion workspace initialization (remotion, @remotion/cli, react 19)
- [ ] `video/tsconfig.json` — Isolated TypeScript config
- [ ] `video/src/index.ts` — Entry point with registerRoot()
- [ ] Root `tsconfig.json` update: add `"video"` to exclude array
- [ ] `public/videos/` directory creation

*Wave 0 creates the workspace infrastructure needed for all subsequent tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Waveform matches hero canvas (30 bars, center gradient, 4 states) | VID-02 | Visual fidelity requires human comparison | Open Remotion Studio, compare waveform side-by-side with live site hero section |
| iPhone mockup looks realistic with Messages + Notes scenes | VID-03 | Visual quality judgment | Preview in Remotion Studio, verify scenes transition with horizontal slide |
| Animations feel iOS-native (spring physics) | VID-04 | Subjective motion quality | Play video at 1x speed, verify spring transitions don't feel web-generic |
| Seamless loop | VID-03 | Loop continuity is visual | Embed rendered MP4 in `<video loop>` tag, watch 3+ loops for visible jump |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

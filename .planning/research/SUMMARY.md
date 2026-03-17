# Project Research Summary

**Project:** Dictus Website v1.2 (Video & Compliance)
**Domain:** Programmatic demo video production + App Store compliance pages for existing Next.js landing page
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH

## Executive Summary

Dictus v1.2 adds two distinct deliverables to the existing landing page: (1) App Store compliance pages (Privacy Policy, Support URL) that unblock iOS app submission, and (2) a programmatic demo video built with Remotion that showcases the voice dictation experience. The compliance pages are low-effort, high-urgency work that follows established patterns already in the codebase (next-intl Server Components under `[locale]/`). The demo video is the creative centerpiece and the primary technical challenge.

The recommended approach is to treat Remotion as a dev-only rendering tool, completely isolated from the Next.js build. Remotion renders MP4/WebM files offline; the site embeds them with a native `<video>` element. This avoids the single biggest risk: bundling Remotion's Player component in production, which would add 150-250KB of client JS and destroy the site's Lighthouse 97-98 scores. The pre-rendered MP4 approach adds zero JavaScript overhead. All four research files converge on this conclusion independently -- stack, features, architecture, and pitfalls all reject the embedded Player pattern.

Key risks are: Webpack config conflicts between Remotion and Next.js (mitigated by complete separation), App Store rejection from an incomplete privacy policy (mitigated by covering all 8+ required Apple sections even for a zero-data app), and Lighthouse regression from video embedding (mitigated by `preload="none"`, IntersectionObserver lazy-loading, and aggressive compression). The iOS visual fidelity of the Remotion composition is a creative risk that should be time-boxed -- aim for a stylized product demo rather than a pixel-perfect iOS simulation.

## Key Findings

### Recommended Stack

No new production dependencies are needed. The existing Next.js 16 + Tailwind v4 + next-intl stack handles all compliance pages. Remotion is dev-only tooling.

**Core technologies:**
- **Remotion ^4.0** (dev-only): React-based programmatic video creation -- the only serious framework for building videos as React components. Provides `useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence>` for frame-based animation.
- **@remotion/cli** (dev-only): Renders compositions to MP4/WebM via headless Chromium + FFmpeg. Used locally, never in CI or Vercel.
- **Native `<video>` element** (production): Zero-dependency video embedding. No player library, no streaming service, no third-party scripts. Consistent with the zero-tracking policy.

**What NOT to add:** @remotion/player in production, @remotion/lambda, react-player, video.js, MDX, cookie consent libraries, legal template generators.

### Expected Features

**Must have (table stakes -- App Store blockers):**
- Privacy Policy page at `/[locale]/privacy/` covering all Apple 5.1.1(i) required sections
- Support URL as a web page (not just mailto:) with contact information
- Footer links to Privacy and Support pages
- Sitemap entries for new routes

**Should have (v1.2 differentiators):**
- Programmatic Remotion demo video showing idle -> recording -> transcribing -> smart mode -> inserted flow
- Waveform animation in the video matching the hero waveform (visual continuity)
- Word-by-word text typing animation synced to transcription state
- iOS-style spring physics via Remotion `spring()`
- Intersection-triggered lazy playback for the video section
- Bilingual video content via Remotion `inputProps.locale`

**Defer (post-v1.2):**
- MP4 pre-render for App Store preview video (different resolution requirements per device class)
- Custom branded Player controls
- Terms of Service / EULA pages
- Support ticket system or contact form

### Architecture Approach

The architecture adds a separate `remotion/` workspace at the project root with its own `package.json`, completely decoupled from the Next.js build. Video output (MP4/WebM) is committed to `public/videos/` and served as static assets from Vercel CDN. Compliance pages are pure Server Components under `[locale]/` with zero client JS, following the identical pattern of every existing page. The DemoVideo section is a thin client component that uses IntersectionObserver to lazy-load a `<video>` element.

**Major components:**
1. **`remotion/` workspace** -- Isolated Remotion compositions, render scripts, own dependencies. Dev-only, never deployed.
2. **`[locale]/privacy/page.tsx`** -- Static RSC with bilingual content via `getTranslations`. Covers all Apple-required sections.
3. **`[locale]/support/page.tsx`** -- Static RSC with contact info. HTTPS URL for App Store Connect.
4. **`components/DemoVideo/DemoVideo.tsx`** -- Client component with `<video>` embed, IntersectionObserver lazy-loading, poster image, and `preload="none"`.
5. **`public/videos/`** -- Pre-rendered MP4 (H.264) + WebM (VP9) + poster WebP. Static assets, CDN-cached.

### Critical Pitfalls

1. **Remotion Webpack conflicts with Next.js** -- Keep Remotion rendering completely separate. Never import `@remotion/bundler` or `@remotion/renderer` in Next.js code. Use CLI rendering only.
2. **Privacy policy missing required Apple sections** -- Even zero-data apps must cover all 8+ structural sections (data collected, how collected, uses, third-party sharing, retention, user rights, contact, effective date). Incomplete = rejection.
3. **Lighthouse regression from video** -- Use `preload="none"`, explicit width/height to prevent CLS, IntersectionObserver for lazy loading, and WebP poster < 50KB. Place video below the fold.
4. **Support URL must be a web page** -- App Store Connect expects an HTTPS URL, not a bare mailto:. Create a `/support` page.
5. **tsconfig path alias collision** -- A `remotion/` folder at root can conflict with `import from "remotion"`. Consider naming the folder `video/` or ensuring no wildcard path aliases exist.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: App Store Compliance Pages

**Rationale:** Zero dependencies on video work. Unblocks App Store submission immediately. Low effort (~1 day).
**Delivers:** Privacy Policy page (FR + EN), Support page, Footer link updates, sitemap expansion.
**Addresses:** All table-stakes compliance features. Apple guidelines 5.1.1(i) and 1.5.
**Avoids:** Pitfalls #3 (incomplete privacy sections), #4 (support URL format), #7 (i18n routing), #11 (not crawlable), #13 (legal language).

### Phase 2: Remotion Workspace Setup

**Rationale:** Must validate the Remotion toolchain (FFmpeg, Chromium, Webpack isolation) before investing time in composition design. This is where the main technical risks live.
**Delivers:** Working `remotion/` workspace with skeleton composition, verified render pipeline, established folder structure.
**Uses:** Remotion ^4.0, @remotion/cli.
**Avoids:** Pitfalls #1 (Webpack conflicts), #10 (tsconfig alias), #12 (FFmpeg/Chromium deps).

### Phase 3: Remotion Composition Development

**Rationale:** The creative bottleneck. Depends on Phase 2 workspace being functional. This is where the most iteration time will be spent -- iOS frame mockup, waveform port, state choreography, text animation.
**Delivers:** Complete Remotion composition showing the full Dictus demo flow. Rendered MP4/WebM assets.
**Avoids:** Pitfalls #6 (iOS fidelity -- time-box at 2 days for stylized approach), #14 (waveform mismatch -- share math utilities).

### Phase 4: Video Integration on Landing Page

**Rationale:** Last because it depends on final rendered video assets from Phase 3. This is the only phase that modifies existing production code, so it carries the Lighthouse regression risk.
**Delivers:** DemoVideo section on landing page with lazy-loaded `<video>`, poster image, responsive layout.
**Avoids:** Pitfalls #2 (no Player component -- use `<video>`), #5 (Lighthouse regression), #8 (Git bloat -- compress to < 5MB), #9 (iOS Safari quirks -- playsinline + muted).

### Phase Ordering Rationale

- Compliance (Phase 1) and Remotion setup (Phase 2) can run in parallel -- zero dependencies between them.
- Phase 1 should ship and deploy independently, even before video work begins. It unblocks App Store submission.
- Phase 3 (composition) is the critical path for the entire milestone. It is creative work that requires iteration and cannot be parallelized.
- Phase 4 is deliberately last because it is the only phase that touches the existing production codebase and risks regression. Running Lighthouse before and after is mandatory.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Composition Development):** The waveform port from canvas to Remotion frames needs hands-on prototyping. iOS frame mockup visual fidelity should be scoped with design references before coding. This phase benefits from `/gsd:research-phase`.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Compliance Pages):** Follows the exact pattern of existing `[locale]/page.tsx`. Well-documented Apple requirements. No research needed.
- **Phase 2 (Remotion Setup):** Remotion brownfield installation is well-documented. Just follow the official docs.
- **Phase 4 (Video Integration):** Standard `<video>` embed with IntersectionObserver. No novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Remotion version confirmed via npm registry. Web search was unavailable during stack research. Core APIs verified via official docs. |
| Features | MEDIUM-HIGH | Feature scope well-defined by v1.2 milestone. Apple compliance requirements verified via official guidelines. Remotion capabilities verified via docs. |
| Architecture | MEDIUM-HIGH | Pre-rendered MP4 approach is the clear winner -- all research files agree. Folder structure follows Remotion brownfield docs. Next.js patterns proven from v1.0/v1.1. |
| Pitfalls | HIGH | Remotion pitfalls from official docs. Apple compliance pitfalls from official guidelines. iOS video behavior well-documented. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Remotion version pinning:** Version 4.0.436 was confirmed via npm, but web search was unavailable. Verify latest stable before installation.
- **iOS visual fidelity scope:** No design mockups exist yet for the Remotion composition. The "stylized vs realistic" decision needs to be made before Phase 3 begins, ideally with visual references.
- **Video file size budget:** Target is < 5MB for MP4. Actual size depends on composition complexity and duration (8-15 seconds). May need to iterate on compression settings.
- **Support email address:** A specific `support@getdictus.com` or equivalent needs to be decided and configured before the support page is built.
- **Git LFS vs direct commit:** If rendered video exceeds 5MB, need to decide between Git LFS, external hosting, or more aggressive compression. Decide before rendering.

## Sources

### Primary (HIGH confidence)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) -- Privacy policy (5.1.1i) and support URL (1.5) requirements
- [Remotion brownfield installation](https://www.remotion.dev/docs/brownfield) -- tsconfig alias warnings, folder structure
- [Remotion Next.js integration notes](https://www.remotion.dev/docs/miscellaneous/nextjs) -- Webpack bundling limitations
- Existing codebase: Footer.tsx, Waveform.tsx, useHeroDemoState.ts, i18n/routing.ts, layout.tsx -- verified patterns

### Secondary (MEDIUM confidence)
- [Remotion Player docs](https://www.remotion.dev/docs/player/) -- Player component API and best practices
- [Remotion core APIs](https://www.remotion.dev/docs/the-fundamentals) -- useCurrentFrame, interpolate, spring, Sequence
- [Remotion npm registry](https://registry.npmjs.org/remotion/latest) -- version 4.0.436 confirmed
- [iOS Submission Guide](https://iossubmissionguide.com/app-store-privacy-policy-requirements) -- Privacy policy section checklist
- [App Store Review Guidelines 2026](https://theapplaunchpad.com/blog/app-store-review-guidelines) -- Rejection rates and privacy rule tightening

---
*Research completed: 2026-03-17*
*Ready for roadmap: yes*

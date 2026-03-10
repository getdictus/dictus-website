# Project Research Summary

**Project:** Dictus Website v1.1
**Domain:** Premium iOS app landing page -- feature expansion (light mode, Liquid Glass, comparison table, demo videos, hero animation, adaptive CTA)
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

Dictus v1.1 adds six features to an already-shipped dark-only Next.js landing page: light/dark theme switching, iOS 26 Liquid Glass visual effects, a competitor comparison table, self-hosted demo videos, enhanced hero waveform animation, and a device-adaptive TestFlight CTA. The existing stack (Next.js 16, Tailwind v4, Motion v12, next-intl v4) handles everything. The only new dependency is `next-themes` (~1.5kb) for flash-free theme management. All other features are achievable with native browser APIs and CSS -- no new libraries needed. Total new client JS is approximately 5kb, keeping the bundle well under the Lighthouse 90+ performance budget.

The recommended approach is to build light mode first because it is a hard dependency for nearly every other feature. The current site has 72 hardcoded dark-only color references across 15 files, and the canvas Waveform component uses hardcoded hex values that cannot respond to theme changes. This refactoring is the largest single task and must be completed before Liquid Glass (which requires different blur/opacity tuning per theme), video sections (which need themed containers), and the comparison table (which needs themed row styling). Attempting to build features in parallel without the theme foundation would cause expensive rework.

The primary risks are: (1) Flash of Wrong Theme if `next-themes` blocking script is not properly configured, (2) Liquid Glass SVG filters failing on Mobile Safari (the primary target audience), requiring a CSS-only fallback strategy, and (3) Lighthouse performance regression from video assets if lazy loading is not strict. All three risks have well-documented mitigation patterns. The project's zero-third-party-scripts constraint rules out YouTube/Vimeo embeds and complex video libraries, which is actually a simplification -- self-hosted MP4 with `preload="none"` is straightforward.

## Key Findings

### Recommended Stack

The v1.0 stack remains unchanged. The single addition is `next-themes` v0.4.6 for theme management. It prevents FOUC via a blocking `<script>` injected before React hydration, handles localStorage persistence and system preference detection, and is React 19 compatible. No other dependencies are needed -- Liquid Glass is pure CSS, video uses native `<video>`, device detection uses `navigator.userAgent`, and the comparison table is a server-rendered HTML table.

**Core technologies:**
- **next-themes 0.4.6**: Theme toggle with FOUC prevention -- the standard Next.js solution, 3M+ weekly npm downloads, ~1.5kb
- **Tailwind v4 `@custom-variant`**: Replaces old `darkMode: "class"` config -- `@custom-variant dark (&:where(.dark, .dark *))` in CSS
- **CSS custom properties**: Semantic token layer (`bg-primary`, `text-primary`) that swaps values between `.dark` and default (light) scopes
- **Native `<video>` + IntersectionObserver**: Self-hosted MP4/WebM with lazy loading -- no video library needed

### Expected Features

**Must have (table stakes):**
- Light/dark mode with theme toggle -- iOS users expect OS-consistent theming
- Comparison table with competitor matrix -- visitors comparing dictation apps need quick feature comparison
- Device-adaptive TestFlight CTA -- iPhone visitors should tap directly to TestFlight, not see a generic "Coming Soon"
- Demo videos in context sections -- replaces abstract descriptions with concrete app recordings
- Responsive table pattern for mobile -- 60%+ traffic is mobile iOS users

**Should have (differentiators):**
- Liquid Glass effects on nav, hero card, and 2-3 feature cards -- aligns with iOS 26 design language, no competitor does this
- Hero waveform state sequence animation -- transforms static wave into a choreographed product story
- Theme toggle with smooth cross-fade transition -- premium feel
- Video poster frames with play affordance -- preserves Lighthouse scores

**Defer to v1.2+:**
- Animated comparison table row reveals (nice-to-have polish)
- QR code in tooltip for desktop TestFlight CTA (simple URL fallback is sufficient)
- Animated SVG waveform logo in nav (competes with hero for attention, constant GPU load)
- Any form of scroll-jacking or parallax on video sections

### Architecture Approach

The architecture preserves the existing server-component-first pattern. New client components are minimal: ThemeProvider, ThemeToggle, VideoSection, TestFlightCTA. The comparison table is a server component (zero JS). A new shared GlassCard component centralizes the Liquid Glass effect (currently duplicated across 7 elements). Theme switching uses CSS custom properties that swap in `.dark` scope, avoiding the anti-pattern of doubling every Tailwind class with `dark:` prefixes. Total new client JS: ~5kb on top of the existing ~8kb bundle.

**Major components:**
1. **ThemeProvider + ThemeToggle** -- wraps layout, manages `.dark` class on `<html>`, toggle in Nav
2. **GlassCard** -- shared CSS-only component replacing duplicated glassmorphism across Features, DataFlow, Nav
3. **ComparisonTable** -- server component, static data from TypeScript + i18n labels, responsive card layout on mobile
4. **VideoSection** -- client component with IntersectionObserver lazy loading, `preload="none"`, `playsInline`+`muted` for iOS
5. **TestFlightCTA** -- client component with `useDeviceDetect` hook, universal server render + client-side enhancement
6. **Waveform.tsx (modified)** -- receives `demoPhase` prop, phase-aware energy functions, theme-reactive colors via CSS custom properties

### Critical Pitfalls

1. **Flash of Wrong Theme (FOWT)** -- Use `next-themes` blocking script with `defaultTheme="dark"`. Never rely on `useEffect` alone for theme application. Test with 4x CPU throttling.
2. **72 hardcoded dark-only color references** -- Refactor to semantic CSS custom properties that swap per theme. Audit all 15 component files systematically. Missing even one creates invisible text in the wrong theme.
3. **Canvas Waveform ignores theme** -- `Waveform.tsx` hardcodes `#3D7EFF` and `rgba(255,255,255,...)`. Must read colors from `getComputedStyle()` and cache in a ref. White edge bars become invisible on light backgrounds.
4. **Liquid Glass SVG filters broken on Mobile Safari** -- SVG `feDisplacementMap` does not work as `backdrop-filter` input in WebKit. Use pure CSS `backdrop-filter: blur() saturate()` with gradient pseudo-elements. This is the primary audience's browser.
5. **Lighthouse regression from videos** -- Set `preload="none"`, use IntersectionObserver, compress to <1MB per clip, set explicit dimensions to prevent CLS. Video poster images count as LCP elements.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Theme System (Light/Dark Mode)
**Rationale:** Foundation for everything else. 72 hardcoded color references must be migrated before any new feature can work in both themes. Liquid Glass blur parameters differ per theme. Canvas waveform needs theme-reactive colors. Retrofitting light mode onto completed features costs 3-5x more than building theme-first.
**Delivers:** Dual-theme support with toggle, semantic token system, FOUC-free switching
**Addresses:** Light mode (table stakes), theme toggle (differentiator)
**Avoids:** FOWT (Pitfall #1), hardcoded colors (Pitfall #2), canvas theme blindness (Pitfall #3), Tailwind v4 @theme conflict (Pitfall #12)
**New dependency:** `next-themes` 0.4.6

### Phase 2: Liquid Glass + GlassCard Component
**Rationale:** GlassCard is consumed by Features (4x), DataFlow (1x), ComparisonTable, and Nav. Build the shared component before its consumers. Depends on stable theme system for per-theme glass tuning.
**Delivers:** Reusable GlassCard, upgraded glassmorphism across existing sections, enhanced Nav scroll state
**Addresses:** Liquid Glass effects (differentiator)
**Avoids:** Safari SVG filter failure (Pitfall #4), backdrop-filter performance death (Pitfall #8), light mode glass wash-out (Pitfall #7)

### Phase 3: Comparison Table
**Rationale:** Highest content value for visitors comparing dictation apps. Server-rendered, zero JS, independent of video/CTA work. Uses GlassCard from Phase 2.
**Delivers:** Responsive comparison table (desktop table + mobile card layout), i18n in FR/EN, ScrollReveal animation
**Addresses:** Comparison table (table stakes), responsive table (table stakes)
**Avoids:** Mobile usability issues (Pitfall #10), data staleness (Pitfall #14)

### Phase 4: Enhanced Hero Waveform
**Rationale:** Modifies existing Waveform.tsx which was already refactored for theme-awareness in Phase 1. Building on that refactored code avoids touching the file twice. No new dependencies.
**Delivers:** Multi-phase waveform animation synced with demo state machine (idle > recording > transcribing > smart > inserted)
**Addresses:** Hero waveform state sequence (differentiator)
**Avoids:** State machine timing bugs (Pitfall #11), reduced-motion regression (Pitfall #13)

### Phase 5: Demo Video Sections
**Rationale:** Depends on external video assets (recorded app footage). Build component infrastructure early, integrate when assets are available. Independent of other phases after Phase 1.
**Delivers:** LazyVideo component with IntersectionObserver, integration in HowItWorks and DataFlow sections
**Addresses:** Demo videos (table stakes), video poster frames (differentiator)
**Avoids:** Lighthouse regression (Pitfall #5), iOS format incompatibility (Pitfall #9), Git bloat (Pitfall #15)
**External blocker:** Video assets must be recorded from the iOS app

### Phase 6: Adaptive TestFlight CTA
**Rationale:** Last because it replaces the "Coming Soon" badge and requires a live TestFlight link. Can be implemented independently after Phase 1.
**Delivers:** Device-adaptive CTA (iPhone: TestFlight link, Desktop: informational + URL), i18n support
**Addresses:** Device-adaptive CTA (table stakes)
**Avoids:** Hydration mismatch (Pitfall #6)
**External blocker:** TestFlight URL must be available

### Phase Ordering Rationale

- **Theme first, everything else after:** All four research files independently conclude that light mode is the foundational dependency. ARCHITECTURE.md labels it "BUILD FIRST, blocks everything." PITFALLS.md identifies four critical pitfalls that compound if theme work is deferred.
- **Liquid Glass before Comparison Table:** GlassCard is a shared component consumed by the table. Building it first avoids retrofitting glass styling onto a completed table.
- **Phases 4-6 are independent:** Hero waveform, demo videos, and TestFlight CTA have no cross-dependencies after the theme system is stable. They can be parallelized or reordered based on asset availability (video footage, TestFlight URL).
- **External blockers on Phases 5-6:** Demo videos need recorded app footage. CTA needs a TestFlight link. Both can be built as component infrastructure first and integrated when assets arrive.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Theme System):** The Tailwind v4 `@theme` directive vs runtime CSS custom property override interaction needs validation during implementation. Community patterns exist (GitHub Discussion #15083) but the exact `next-themes` + `@custom-variant` integration is not covered in official Tailwind docs.
- **Phase 2 (Liquid Glass):** Cross-browser testing on real iOS devices is mandatory. CSS-Tricks and LogRocket document the Safari limitations, but the exact visual fidelity of CSS-only Liquid Glass versus native iOS 26 requires hands-on tuning.

Phases with standard patterns (skip research-phase):
- **Phase 3 (Comparison Table):** Standard HTML table, server-rendered, well-documented responsive patterns.
- **Phase 4 (Hero Waveform):** Extending existing canvas code with new energy functions. The state machine already exists.
- **Phase 5 (Demo Videos):** Native `<video>` + IntersectionObserver is a mature, well-documented pattern.
- **Phase 6 (TestFlight CTA):** Client-side UA detection + conditional rendering is straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only one new dependency (next-themes). All other features use native APIs. Verified against official docs and npm. |
| Features | MEDIUM-HIGH | Feature list is clear and dependency-mapped. External blockers (video assets, TestFlight URL) add uncertainty to delivery timeline, not to implementation approach. |
| Architecture | HIGH | Existing codebase fully audited. Component boundaries, server/client split, and data flow are well-defined. Extends established patterns. |
| Pitfalls | HIGH | 15 pitfalls identified with specific prevention strategies. Critical pitfalls verified against official docs and multiple independent sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **Light mode color palette:** The exact light mode background/surface/text colors are proposed but not designer-validated. The values in ARCHITECTURE.md (`#F8FAFC`, `#F1F5F9`, etc.) are reasonable defaults but should be reviewed against the Dictus iOS app's light appearance for brand consistency.
- **Video asset availability:** No recorded app footage exists yet. The component architecture is defined, but integration depends on asset creation. Encoding specs and FFmpeg commands are ready.
- **TestFlight URL:** The adaptive CTA component is designed, but the actual TestFlight join link is an external dependency from the app team.
- **Liquid Glass visual fidelity:** CSS-only Liquid Glass is a convincing approximation, not pixel-perfect iOS 26 native rendering. The gap between "looks good" and "looks like iOS 26" needs acceptance from stakeholders.
- **Tailwind v4 @theme + next-themes interaction:** The `@theme` directive registers tokens at build time; theme switching happens at runtime. The override pattern via `@layer base` with `.dark` selector is community-recommended but not officially documented by Tailwind. Needs validation in Phase 1.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Dark Mode docs](https://tailwindcss.com/docs/dark-mode) -- `@custom-variant` syntax, class-based toggle
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- React 19 compatibility, ThemeProvider API, FOWT prevention
- [Next.js Video Guide](https://nextjs.org/docs/app/guides/videos) -- self-hosted `<video>`, `playsInline` for iOS
- [CSS-Tricks: Getting Clarity on Apple's Liquid Glass](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/) -- CSS techniques, SVG filter Safari limitations
- [web.dev: Lazy Loading Video](https://web.dev/articles/lazy-loading-video) -- IntersectionObserver pattern, performance guidance
- [web.dev: Largest Contentful Paint](https://web.dev/articles/lcp) -- video poster as LCP element
- [Next.js Hydration Error docs](https://nextjs.org/docs/messages/react-hydration-error) -- hydration mismatch patterns
- Existing codebase audit (Waveform.tsx, globals.css, all 15 component files) -- 72 hardcoded color references counted

### Secondary (MEDIUM confidence)
- [Dark mode with Tailwind v4 + Next.js](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) -- next-themes + @custom-variant integration
- [Tailwind v4 dark mode discussion #15083](https://github.com/tailwindlabs/tailwindcss/discussions/15083) -- CSS variable theming patterns
- [Liquid Glass with Pure CSS (DEV)](https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl) -- backdrop-filter approach
- [Liquid Glass CSS + SVG (LogRocket)](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/) -- SVG filter approach details
- [Apple iOS 26 UA String Changes (51Degrees)](https://51degrees.com/blog/apple-ios26-safari26-user-agent-string-device-detection) -- UA freeze documentation
- [FFmpeg web optimization (Transloadit)](https://transloadit.com/devtips/reducing-video-file-size-with-ffmpeg-for-web-optimization/) -- CRF values, movflags faststart

### Tertiary (LOW confidence)
- [Liquid Glass CSS Generator](https://liquidglassgen.com/) -- tool reference only
- [SaaS Comparison Pages (Powered by Search)](https://www.poweredbysearch.com/learn/best-saas-comparison-pages/) -- general comparison page patterns

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*

# Feature Landscape: v1.1 Polish & Differentiation

**Domain:** Premium iOS app landing page -- new features (comparison table, hero animation, demo videos, Liquid Glass, light mode, TestFlight CTA)
**Researched:** 2026-03-10
**Overall confidence:** MEDIUM-HIGH
**Scope:** NEW features only. Existing v1.0 features (hero waveform, 7 sections, bilingual, scroll animations, dark design, zero tracking) are already shipped.

---

## Table Stakes

Features that v1.1 visitors will expect given the site already exists. Missing any of these makes the update feel half-done.

| Feature | Why Expected | Complexity | Depends On | Notes |
|---------|--------------|------------|------------|-------|
| Comparison table with competitor highlight | Visitors comparing dictation apps need a quick feature matrix. 66% of SaaS comparison pages highlight key differentiators. Without it, users leave to compare elsewhere | Med | Existing Features section (placement reference) | 5-6 columns: Dictus, Apple Dictation, WhisperFlow, SuperWhisper, MacWhisper. Rows: offline, privacy, price, platforms, AI rewrite, open source. Dictus column visually highlighted (accent border + subtle glow) |
| Sticky header row on comparison table | Tables with 6+ rows are unreadable on mobile without sticky context. 80% of mobile table scenarios benefit from sticky headers | Low | Comparison table component | CSS `position: sticky; top: nav-height` on thead. Critical for mobile where table scrolls vertically |
| Responsive table pattern (mobile) | 60%+ traffic is mobile iOS users. A table that requires horizontal scroll is a conversion killer | Med | Comparison table component | Two viable patterns: (1) card-based vertical stack on mobile, (2) fixed first column + horizontal scroll. Card stack is better for 5-column comparison -- each competitor becomes a card with checkmarks |
| Device-adaptive CTA for TestFlight | The entire page exists to drive installs. A generic "Coming Soon" badge wastes iPhone visitors who could tap straight to TestFlight | Med | Hero section, Nav CTA, Community CTA | iPhone: "Join TestFlight" deep link (itms-beta://). Desktop: "Available on iPhone" with QR code or TestFlight URL. Must gracefully fall back -- never show broken link |
| Demo videos in context sections | Users who have scrolled past the hero need proof the app works. App recordings in HowItWorks/DataFlow replace abstract descriptions with concrete evidence | Med | HowItWorks section, DataFlow section | Self-hosted MP4, not YouTube (zero third-party scripts policy). `<video autoplay muted loop playsinline>` with `preload="none"` for below-fold. 720p max, 5-12s loops, target 2-4MB per clip |
| Light mode option | iOS users expect theme consistency with their OS. Apple's own sites respect system preferences. With iOS 26 Liquid Glass being light-friendly, a dark-only site feels rigid | High | ALL components, globals.css @theme tokens, Nav (toggle UI) | This is the highest-effort table-stakes feature. Every component needs dual tokens. Use next-themes + Tailwind v4 `@variant dark` pattern. Three states: light, dark, system |

## Differentiators

Features that elevate the site beyond competitors' landing pages. Not expected, but create premium perception.

| Feature | Value Proposition | Complexity | Depends On | Notes |
|---------|-------------------|------------|------------|-------|
| Liquid Glass effects on key elements | Aligns the website visually with iOS 26 design language. Creates a "this site feels like the app" moment. No competitor landing page does this | High | Light mode (Liquid Glass looks best on varied backgrounds), Nav component, card elements | Use `backdrop-filter: blur(16px) saturate(180%)` as baseline. Layer subtle SVG displacement filter for edge refraction on Chromium. Progressive enhancement: Safari/Firefox get clean glassmorphism, Chromium gets the full refraction. Restrict to nav bar, hero card, and 2-3 floating elements -- not the entire layout |
| Hero waveform state sequence animation | Transform the existing static processing wave into a choreographed demo: flat idle > voice simulation > transcription sync > smart mode > inserted. Tells the product story without words | High | Existing Waveform.tsx, StateIndicator.tsx, TextReveal.tsx, useHeroDemoState hook | The existing `useHeroDemoState` hook already cycles states. Enhancement: make waveform amplitude respond to state (flat during idle, active during recording, rhythmic during transcribing). Sync bar heights to state via a new `energyProfile` parameter. This is the hero's "wow" upgrade |
| Animated comparison table reveal | Rows/columns stagger-animate on scroll entry. The "checkmark" and "cross" icons animate in sequence, drawing attention to Dictus winning each row | Med | Comparison table, ScrollReveal shared component | Use existing Motion v12 LazyMotion + ScrollReveal pattern. Stagger delay 50-80ms per row. Checkmarks scale-in, crosses fade-in at lower opacity. Subtle but effective |
| Video poster frame with play affordance | Instead of auto-playing all videos, show a high-quality poster frame with a subtle play icon. Video loads and plays only on tap/click. Preserves Lighthouse 90+ score | Low | Demo video sections | `poster` attribute on `<video>` with a carefully chosen frame from the recording. Facade pattern: render poster as `<img>` initially, swap to `<video>` on interaction. Eliminates video decode cost from initial paint |
| Theme toggle with smooth transition | Toggle between light/dark with a 200ms cross-fade on the background and color tokens. The toggle itself uses the waveform icon morphing between sun/moon states | Med | Light mode implementation, Nav component | `next-themes` handles persistence and system detection. CSS transition on `background-color` and `color` properties via custom properties. Toggle placement: Nav bar, next to language toggle. Two toggles side by side (lang + theme) feels premium |
| QR code fallback for desktop TestFlight CTA | Desktop visitors see a QR code pointing to TestFlight link. Bridges the "I'm on my laptop but want to test on my phone" gap. Common pattern on premium app sites | Low | Device-adaptive CTA | Generate QR at build time (static SVG via `qrcode` npm package). Style with brand accent color. Only shown on non-iOS devices. Small, in a tooltip or expandable element -- not dominant |

## Anti-Features

Features to explicitly NOT build in v1.1. These would harm positioning, performance, or scope.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| YouTube/Vimeo video embeds | Third-party iframes violate zero-tracking policy. YouTube alone loads 500KB+ of JS, tanks Lighthouse scores (LCP 8.8s vs 3.8s with facade). Contradicts privacy stance | Self-host MP4 files. Use `<video>` element with `preload="none"` for below-fold content. Compress with ffmpeg to H.264 720p |
| Full-page Liquid Glass distortion | SVG displacement filters do not work in Safari (Apple's own browser). Mobile Safari GPU budget is limited. Full-page effects cause jank and drain battery | Restrict Liquid Glass to 3-5 floating elements (nav, hero overlay, 1-2 cards). Use `backdrop-filter` as baseline, SVG filter as progressive enhancement on Chromium only |
| User-agent string parsing for device detection | Apple froze UA strings in iOS 26 (reports as 18.6 regardless). UA parsing is unreliable, fragile, and a maintenance burden | Use feature detection + CSS media queries: `@media (pointer: coarse)` for touch devices, `navigator.maxTouchPoints > 0` for JS detection. Check for `navigator.platform` containing "iPhone" as a secondary signal -- still works despite UA freeze |
| Complex multi-step theme customization | Accent color pickers, custom theme builders, per-section theming. Scope creep that adds weeks of work for negligible user value | Two themes: light and dark. Both use the same accent blue (#3D7EFF). Light mode gets new background/surface/text tokens; accent and semantic colors stay identical |
| Animated SVG waveform logo in nav | Tempting to animate the nav logo on scroll or hover, but adds constant GPU load for a decorative element in a fixed-position nav. Competes with the hero waveform for attention | Keep nav logo static. The hero waveform is the animation star. Nav stays clean and fast |
| Comparison table with editable/filterable columns | Interactive table with column hide/show, sorting, or filtering. Over-engineered for a 5-column marketing comparison | Static table, responsive card layout on mobile. The data is curated, not dynamic. Hard-code the comparison data in i18n JSON |
| Video with sound / unmute controls | Sound on a landing page is almost always unwanted. Autoplay with sound is blocked by browsers anyway. Adding unmute UI creates expectation of audio content | All videos are muted screen recordings. No audio track in the source files. The waveform animation in the hero provides the "audio" metaphor visually |
| Parallax or scroll-jacking on video sections | Scroll-linked video playback (play as you scroll) is trendy but janky on Safari, unpredictable on variable scroll speeds, and hurts accessibility | Standard scroll-triggered play: video plays when intersecting viewport, pauses when leaving. Simple IntersectionObserver pattern |

## Feature Dependencies

```
Light Mode (THEME-*)
  |
  +-- @theme tokens in globals.css (light variants)
  |     |
  |     +-- ALL existing components need dark: prefix audit
  |     +-- Liquid Glass effects (GLASS-*) -- opacity/blur values differ per theme
  |     +-- Comparison table (COMP-*) -- row striping, highlight colors
  |     +-- Demo videos (DEMO-*) -- poster frames, container backgrounds
  |
  +-- next-themes ThemeProvider in layout.tsx
  |     |
  |     +-- Theme toggle in Nav component
  |     +-- System preference detection
  |     +-- localStorage persistence
  |
  +-- Canvas Waveform.tsx -- bar colors must read from CSS custom properties
        (currently hardcoded BRAND_BLUE and EDGE_COLOR_RGB)

Comparison Table (COMP-*)
  |
  +-- i18n JSON entries for competitor data (FR + EN)
  +-- Responsive card layout variant for mobile
  +-- ScrollReveal integration (existing shared component)
  +-- Light/dark tokens for table styling

Hero Waveform Enhancement (HERO-*)
  |
  +-- Existing useHeroDemoState hook (state machine)
  +-- Waveform.tsx -- new energyProfile prop driven by state
  +-- StateIndicator.tsx -- already has state colors
  +-- TextReveal.tsx -- sync timing with waveform energy

Demo Videos (DEMO-*)
  |
  +-- Video assets (recorded from iOS device)
  +-- HowItWorks section -- embed points
  +-- DataFlow section -- embed points
  +-- IntersectionObserver for lazy play/pause
  +-- Light/dark poster frames (if using theme-aware posters)

Liquid Glass (GLASS-*)
  |
  +-- Light mode (Liquid Glass on dark-only backgrounds looks like existing glassmorphism)
  +-- Nav.tsx -- already uses backdrop-blur-md, enhance to full Liquid Glass
  +-- Feature cards -- selective application
  +-- CSS @supports for progressive enhancement

Adaptive CTA (CTA-*)
  |
  +-- TestFlight URL (from app team)
  +-- Device detection hook (useDeviceType)
  +-- Hero section -- replace "Coming Soon" badge
  +-- Nav -- optional CTA button
  +-- Community section -- update CTA target
```

**Critical dependency chain:**
1. Light mode tokens MUST come first -- Liquid Glass, comparison table, and video sections all need theme-aware styling
2. Hero waveform enhancement is self-contained (modifies existing components)
3. Comparison table is self-contained (new component)
4. Demo videos require external assets (recorded app footage)
5. Adaptive CTA requires TestFlight URL availability
6. Liquid Glass is the final layer -- applied on top of themed components

## Cross-Feature Interactions

| Feature A | Feature B | Interaction | Risk |
|-----------|-----------|-------------|------|
| Light mode | Liquid Glass | Liquid Glass blur/refraction values need different tuning for light vs dark backgrounds. Light mode makes Liquid Glass shine (literally) -- it reveals background distortion better than dark mode | Medium -- requires testing both themes with every Glass element |
| Light mode | Waveform canvas | Waveform currently hardcodes `BRAND_BLUE` and white edge colors. Light mode needs dark edge colors on light background. Canvas must read theme from CSS custom properties or a React context | Medium -- requires refactoring color resolution in Waveform.tsx |
| Light mode | Comparison table | Table row striping, borders, and highlight colors all need light variants. The "Dictus column highlight" glow effect needs different opacity for light backgrounds | Low -- standard Tailwind dark: variant handling |
| Demo videos | Lighthouse score | Each video below-fold must use `preload="none"`. Self-hosted 720p MP4 at 3-4MB adds to total page weight. Three videos = 9-12MB total transfer (but lazy-loaded) | Medium -- monitor LCP and total transfer size |
| Adaptive CTA | i18n | CTA text changes per device AND per language. "Rejoindre TestFlight" / "Join TestFlight" on iOS, "Disponible sur iPhone" / "Available on iPhone" on desktop | Low -- standard next-intl pattern, just more translation keys |
| Liquid Glass | Nav scroll state | Nav already toggles `backdrop-blur-md` on scroll. Liquid Glass enhancement adds SVG filter on top. Must not cause layout shift or paint jank during scroll | Medium -- test on iPhone Safari specifically |

## Complexity Assessment

| Feature | Estimated Effort | Complexity Driver | Risk |
|---------|-----------------|-------------------|------|
| Light mode + theme toggle | 3-4 days | Every component needs audit. Canvas waveform refactor. Token system redesign. Testing both themes across all sections | HIGH -- touches everything |
| Comparison table | 1-2 days | New component but straightforward. Responsive card variant is the main work. Data is static | LOW |
| Hero waveform enhancement | 1-2 days | Modifying existing Waveform.tsx. State-driven energy profiles. Animation timing tuning | MEDIUM -- subtle animation work |
| Demo video sections | 1 day (code) + depends on assets | Code is simple (`<video>` + IntersectionObserver). Blocked by availability of recorded app footage | LOW (code) / HIGH (asset dependency) |
| Liquid Glass effects | 2-3 days | Progressive enhancement strategy. Cross-browser testing. Performance profiling on mobile Safari. Interaction with light/dark themes | HIGH -- browser inconsistency |
| Adaptive TestFlight CTA | 1 day | Device detection hook + conditional rendering. Three states: iPhone, desktop, fallback. Blocked by TestFlight URL availability | LOW (code) / MEDIUM (external dependency) |

## MVP Recommendation

**Phase order for v1.1:**

1. **Light mode foundation** (THEME-*) -- unblocks Liquid Glass and improves all subsequent features
   - Tailwind v4 `@variant dark` + CSS custom properties for all color tokens
   - `next-themes` with `attribute="data-theme"` in layout
   - Theme toggle in Nav next to language toggle
   - Audit all 7 existing components + Nav for dark: variants
   - Refactor Waveform.tsx to read colors from CSS custom properties

2. **Comparison table** (COMP-*) -- highest content value, independent of other features
   - Static data in i18n JSON (FR + EN)
   - Desktop: full table with sticky header, highlighted Dictus column
   - Mobile: card stack layout with competitor cards
   - ScrollReveal stagger animation

3. **Hero waveform enhancement** (HERO-*) -- upgrades existing strongest asset
   - State-driven energy profiles in Waveform.tsx
   - Flat idle > active recording > rhythmic transcribing > pulsing smart > calm inserted
   - Sync with existing useHeroDemoState timing

4. **Adaptive TestFlight CTA** (CTA-*) -- converts visitors once TestFlight is live
   - `useDeviceType` hook using touch detection + platform check
   - Replace "Coming Soon" badge with contextual CTA
   - QR code fallback for desktop (build-time SVG generation)

5. **Demo video sections** (DEMO-*) -- depends on recorded footage availability
   - Self-hosted MP4 with poster frames
   - IntersectionObserver lazy play/pause
   - Integrate into HowItWorks and DataFlow sections

6. **Liquid Glass effects** (GLASS-*) -- final polish layer, benefits from light mode existing
   - Progressive enhancement: `backdrop-filter` baseline, SVG filter on Chromium
   - Apply to Nav, hero overlay, 2-3 feature cards
   - Performance test on iPhone Safari before shipping

**Defer to v1.2:**
- Animated comparison table row reveals (nice-to-have, not essential)
- QR code in tooltip (simple URL fallback is sufficient for v1.1)

**Rationale:** Light mode is the foundation -- it unblocks Liquid Glass and makes the comparison table and video sections look their best in both themes. The comparison table delivers the most immediate content value for visitors comparing dictation apps. Hero waveform enhancement has the highest visual impact but modifies existing code. CTA and videos depend on external inputs (TestFlight URL, recorded footage). Liquid Glass is last because it layers on top of everything and requires the most cross-browser testing.

## Sources

- [Sticky Headers vs Fixed Columns -- NinjaTables](https://ninjatables.com/sticky-headers-vs-fixed-columns/) -- MEDIUM confidence, comparison table UX patterns
- [SaaS Comparison Pages Best Practices -- Powered by Search](https://www.poweredbysearch.com/learn/best-saas-comparison-pages/) -- MEDIUM confidence, competitor comparison page patterns
- [Competitor Comparison Landing Pages -- Rock the Rankings](https://www.rocktherankings.com/competitor-comparison-landing-pages/) -- MEDIUM confidence, 66% stat on highlighting differentiators
- [CSS Liquid Glass -- CSS-Tricks](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/) -- HIGH confidence, authoritative CSS reference on Liquid Glass browser limitations
- [Liquid Glass Effect with Pure CSS -- DEV](https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl) -- MEDIUM confidence, implementation patterns
- [Liquid Glass CSS + SVG -- LogRocket](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/) -- MEDIUM confidence, SVG filter approach details
- [Dark Mode with Tailwind v4 + Next.js -- Things About Web](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) -- HIGH confidence, verified implementation pattern with @variant dark
- [Light/Dark Mode Tailwind v4 + Next.js -- Storieasy](https://www.storieasy.com/blog/light-and-dark-mode-in-tailwind-css-v4-with-next-js) -- MEDIUM confidence
- [Tailwind CSS Dark Mode docs](https://tailwindcss.com/docs/dark-mode) -- HIGH confidence, official documentation
- [Video Autoplay Best Practices -- Cloudinary](https://cloudinary.com/guides/video-effects/video-autoplay-in-html/) -- MEDIUM confidence, autoplay and muted requirements
- [Best Practices for Video Playback 2025 -- Mux](https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025) -- MEDIUM confidence, 720p recommendation
- [Lazy Loading Video -- web.dev](https://web.dev/articles/lazy-loading-video) -- HIGH confidence, Google's official performance guidance
- [Lazy Load Autoplay Videos + Core Web Vitals -- Cloudinary](https://cloudinary.com/blog/lazy-load-autoplay-videos-core-web-vitals) -- MEDIUM confidence, facade pattern for video
- [Apple iOS 26 UA String Changes -- 51Degrees](https://51degrees.com/blog/apple-ios26-safari26-user-agent-string-device-detection) -- HIGH confidence, UA freeze documentation
- [ElevenLabs Live Waveform UI](https://ui.elevenlabs.io/docs/components/live-waveform) -- MEDIUM confidence, waveform state transition patterns
- [next-video for Next.js](https://next-video.dev/) -- MEDIUM confidence, video optimization library (not recommended due to third-party dependency)
- Existing codebase analysis: Waveform.tsx, Hero.tsx, Nav.tsx, globals.css, useHeroDemoState -- HIGH confidence, direct code inspection

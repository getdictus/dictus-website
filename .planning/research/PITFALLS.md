# Domain Pitfalls

**Domain:** Adding light mode, Liquid Glass effects, embedded videos, enhanced canvas animations, device detection, and comparison tables to an existing dark-only Next.js landing page
**Researched:** 2026-03-10
**Project:** Dictus Website v1.1

## Critical Pitfalls

Mistakes that cause rewrites, major regressions, or user-facing breakage.

### Pitfall 1: Flash of Wrong Theme (FOWT) on Page Load

**What goes wrong:** Server renders the default theme (dark or light), but the user's saved preference differs. On hydration, the page flashes the wrong theme for 100-500ms before correcting. This is especially jarring on a site that was previously 100% dark -- returning users see a blinding white flash before dark mode kicks in.

**Why it happens:** Next.js SSR has no access to `localStorage` or `prefers-color-scheme` at render time. The server picks a default, the client hydrates, reads the stored preference, and swaps -- causing visible flicker.

**Consequences:** Perceived quality drop. Users who chose dark mode see a blinding white flash. Undermines the premium feel of the brand.

**Prevention:**
- Use `next-themes` (< 1kb, zero deps) which injects a synchronous blocking `<script>` in `<head>` that reads `localStorage` and sets the `class` or `data-theme` attribute on `<html>` before any paint occurs.
- Configure with `attribute="class"` and `defaultTheme="dark"` to preserve current behavior for first-time visitors.
- Never rely on `useEffect` alone for theme application -- it fires after paint.
- Test with throttled CPU (4x slowdown in DevTools) to catch flash that hides on fast machines.

**Detection:** Load page with theme set to non-default in localStorage. Any visible flash = bug.

**Phase:** THEME-* (Light Mode). Must be the foundation before any component theming work.

**Confidence:** HIGH -- well-documented Next.js pattern, `next-themes` is the standard solution (6k+ GitHub stars).

---

### Pitfall 2: 72 Hardcoded Dark-Only Color References Across 15 Files

**What goes wrong:** The current site has 72 occurrences of dark-only color utilities (`bg-ink`, `bg-surface`, `text-white`, `border-border`) spread across all 15 component files. Adding light mode means every single one needs a conditional counterpart, and missing even one creates a broken component in light mode.

**Why it happens:** The original design was dark-only, so there was no reason to use semantic/contextual color tokens. `bg-ink` meant "background" because there was only one background. Now `bg-ink` means "dark background" and light mode needs something different.

**Consequences:** Partial theme support -- some components look correct in light mode, others show dark backgrounds with dark text (invisible), or white text on white backgrounds. Subtle bugs that only appear in one theme.

**Prevention:**
- Refactor `globals.css` to use CSS custom properties that swap per theme. Define the existing `@theme` token names (`ink`, `surface`, etc.) so they resolve to different values under `:root` (light) vs `.dark` (dark). This minimizes code changes in components -- `bg-ink` keeps working but resolves to a light color in light mode.
- Audit all 15 files systematically with a checklist.
- Alternative: use Tailwind's `dark:` variant on every utility, but this doubles the class count and is harder to maintain.
- The `@theme` directive registers tokens at build time. Override them conditionally in `@layer base` using `:root` / `.dark` selectors for runtime theme switching.

**Detection:** Toggle to light mode and visually inspect every section. Automated: screenshot comparison tests with Playwright in both themes.

**Phase:** THEME-* (Light Mode). Must be completed before Liquid Glass work, since glass effects need correct background colors to blur against.

**Confidence:** HIGH -- verified by grep: 72 occurrences across 15 source files in the current codebase.

---

### Pitfall 3: Canvas Waveform Ignores Theme (Hardcoded Colors)

**What goes wrong:** `Waveform.tsx` has `BRAND_BLUE = "#3D7EFF"` and `EDGE_COLOR_RGB = "255,255,255"` hardcoded as JavaScript constants. These are not CSS variables and not reactive to theme changes. The waveform renders white edge bars that become invisible on a light background.

**Why it happens:** Canvas 2D context uses `fillStyle` with string color values, not CSS custom properties. Unlike DOM elements, canvas drawings do not inherit CSS styles or respond to class changes.

**Consequences:** Hero section waveform becomes invisible or clashes in light mode. The most prominent visual element on the page breaks.

**Prevention:**
- Read computed CSS custom properties via `getComputedStyle(document.documentElement).getPropertyValue('--color-accent')` and use those in `resolveBarColor()`.
- Listen for theme changes (via `MutationObserver` on `<html>` class changes, or `next-themes`'s `useTheme()` hook) to trigger color recalculation.
- Cache resolved colors in a ref and only recompute on theme change, not every frame (performance).
- The edge color must swap: white edges on dark mode, dark edges on light mode.

**Detection:** Switch theme while on the hero section. Waveform should update colors immediately.

**Phase:** THEME-* (Light Mode), specifically after the token system is refactored.

**Confidence:** HIGH -- verified by reading `Waveform.tsx` source code lines 14-15.

---

### Pitfall 4: Liquid Glass SVG Filters Broken on Mobile Safari

**What goes wrong:** True Liquid Glass effect (refraction/distortion) requires SVG `<feDisplacementMap>` filters applied via `backdrop-filter`. Only Chromium browsers expose SVG filters through `backdrop-filter`. Mobile Safari and Chrome on iOS (which uses WebKit) do not support SVG displacement maps in backdrop-filter despite `caniuse.com` indicating support -- this is a known WebKit bug.

**Why it happens:** Apple's Liquid Glass is a native compositing effect, not a web standard. Web implementations are approximations. The refraction part relies on SVG filter primitives that WebKit does not properly support in the backdrop-filter context.

**Consequences:** The signature visual effect of v1.1 is invisible or broken on the primary target audience's device (iOS users visiting a page for an iOS app).

**Prevention:**
- Implement a tiered fallback approach:
  - **Tier 1 (Chromium desktop):** Full Liquid Glass with SVG displacement + backdrop-filter blur + specular highlights.
  - **Tier 2 (Safari/WebKit):** Enhanced glassmorphism using `backdrop-filter: blur()` + subtle gradient overlays + border highlights for depth. No displacement maps.
  - **Tier 3 (No support):** Solid semi-transparent background with border.
- Use `@supports (backdrop-filter: blur(10px))` for Tier 2 detection.
- For Tier 1 vs Tier 2 distinction, test SVG filter support at runtime (render a test element, check if displacement applied).
- Limit Liquid Glass to 2-3 elements per viewport maximum.
- Do NOT attempt full displacement-based Liquid Glass on mobile -- `backdrop-filter: blur()` alone is already GPU-intensive on mobile Safari.

**Detection:** Test on real iPhone (not Chrome DevTools device mode). Safari on macOS is closer but still not identical to iOS behavior.

**Phase:** GLASS-* (Liquid Glass). Implement after theme system is stable, since glass effects depend on correct background colors.

**Confidence:** HIGH -- multiple sources confirm WebKit SVG filter limitations (CSS-Tricks, LogRocket, kube.io all document this).

---

### Pitfall 5: Lighthouse Score Regression from Video Elements

**What goes wrong:** Adding self-hosted demo videos tanks the Lighthouse Performance score from the current 97-98 down to 60-70. Videos are heavy assets (5-50MB each), their poster images become LCP candidates, and poorly configured preloading blocks network bandwidth.

**Why it happens:** Video `<poster>` images count as LCP elements per the web vitals specification. Video files consume bandwidth. Without `preload="none"`, browsers fetch video metadata (and sometimes the full file) on page load. CLS occurs if video dimensions are not reserved.

**Consequences:** Loss of hard-won Lighthouse 90+ scores. CLS spikes from unreserved video dimensions. Slow mobile experience on cellular connections -- critical for an iOS app landing page where mobile traffic dominates.

**Prevention:**
- Set `preload="none"` on all video elements. Load only when user scrolls to the section or triggers playback.
- Always provide explicit `width` and `height` attributes (or CSS `aspect-ratio`) to prevent CLS.
- Use optimized WebP `poster` images (< 50kb). Do NOT place video in the hero/above-the-fold area.
- Compress videos aggressively: target 1-3MB per clip. Provide dual `<source>` elements: H.264/MP4 (broad compatibility) + WebM/VP9 (smaller size).
- Use `IntersectionObserver` to load video only when section enters viewport.
- Include `playsinline` attribute for iOS (required for inline playback, otherwise Safari forces fullscreen).
- Include `muted` attribute if autoplaying -- iOS requires muted for autoplay to work.

**Detection:** Run Lighthouse before and after adding each video. Track LCP, TBT, and Speed Index. Any regression > 5 points needs investigation.

**Phase:** DEMO-* (Demo Videos). Implement after core layout changes (theme, Liquid Glass) are stable.

**Confidence:** HIGH -- LCP specification explicitly includes video poster images. Current scores documented at 97-98 in PROJECT.md.

---

### Pitfall 6: Hydration Mismatch from Device Detection (TestFlight CTA)

**What goes wrong:** The adaptive TestFlight CTA must show different content for iPhone users vs desktop users. If device detection runs differently on server vs client, React throws a hydration mismatch error. Server renders one version (based on request headers UA or no UA at all), client detects the real device and renders another.

**Why it happens:** Next.js SSR does not have access to `window.navigator.userAgent`. Server-side, the UA comes from request headers (which may be a bot, CDN, or missing entirely on static generation). The mismatch between SSR output and client output triggers React's hydration error.

**Consequences:** Console errors, potential layout flash, broken click handlers on the CTA button. React may re-render the entire subtree, causing visible jank on the most important conversion element.

**Prevention:**
- Render a single universal CTA on the server (e.g., "Get Early Access" with a neutral design that works for both contexts).
- Use `useEffect` on the client to detect device and swap to the platform-specific version. This avoids hydration mismatch because server and client initially render the same thing.
- Use CSS `min-height` on the CTA container to prevent CLS during the swap.
- Do NOT use raw `navigator.userAgent` parsing for iOS detection -- combine feature detection with UA: `'ontouchstart' in window && /iPhone/.test(navigator.userAgent)`.
- Do NOT use `suppressHydrationWarning` as a fix -- it masks the problem.
- Consider `next/dynamic` with `ssr: false` ONLY for the device-specific inner content, not the entire CTA component.

**Detection:** View page source -- HTML should show the universal CTA. Client-rendered swap should happen after hydration with no console errors. Test with JavaScript disabled: universal CTA should still be functional and link to TestFlight.

**Phase:** CTA-* (TestFlight CTA). Can be implemented independently of theme/glass work.

**Confidence:** HIGH -- Next.js official docs explicitly document this hydration mismatch pattern.

## Moderate Pitfalls

### Pitfall 7: Liquid Glass + Light Mode Interaction Breaks Visual Effect

**What goes wrong:** Liquid Glass effects rely on `backdrop-filter: blur()` which blurs content behind the element. On dark backgrounds, blurred dark content through a semi-transparent panel produces the premium glass look. On light backgrounds, the same blur creates a washed-out, low-contrast surface that loses the "glass" feel entirely and makes text unreadable.

**Why it happens:** The perceptual impact of blur and transparency is asymmetric between dark and light themes. Dark-on-dark blur preserves depth cues. Light-on-light blur flattens everything.

**Prevention:**
- Design Liquid Glass tokens separately for each theme:
  - Dark mode: higher blur (12-16px), lower background opacity (0.1-0.2), white border highlights.
  - Light mode: lower blur (8-10px), slightly higher background opacity (0.15-0.25), subtle dark border for definition, tinted background (not pure white).
- The specular highlight (rim light) needs to be inverted: white highlights for dark mode, dark/subtle highlights for light mode.
- Test each glass element in both themes during development, not at the end.

**Phase:** GLASS-* must be implemented AFTER THEME-* is complete, because glass parameters depend on theme context.

**Confidence:** MEDIUM -- logical deduction from how backdrop-filter composites with different backgrounds. No specific source for this exact combination, but consistent with glassmorphism best practices.

---

### Pitfall 8: backdrop-filter Performance Death by Multiple Glass Elements

**What goes wrong:** Each element with `backdrop-filter` triggers a separate GPU blur pass. With 3+ glass elements visible simultaneously during scroll, mobile devices (especially older iPhones like SE, 12, 13 mini) drop to 30fps or lower. Smooth scroll becomes stuttery.

**Why it happens:** Each blur operation samples pixels in a radius around the element. Multiple overlapping glass elements compound the cost. Combined with the existing canvas animation in the hero and Motion-powered scroll animations, the GPU compositing budget overflows.

**Prevention:**
- Limit to 2-3 glass elements per viewport maximum. Nav bar + one card + one CTA is the practical limit.
- Reduce blur radius on mobile: 6-8px instead of 12-16px. Higher values are exponentially more expensive.
- Never animate elements that have `backdrop-filter` applied (no translateY transitions on glass cards during scroll reveals).
- Add `transform: translateZ(0)` to force GPU layer promotion, but be aware this increases memory usage.
- Profile on a real iPhone 12 or older -- simulator and DevTools performance is not representative.
- Consider disabling glass effects entirely on low-end devices via a performance detection heuristic.

**Phase:** GLASS-* (Liquid Glass). Performance testing per-element during implementation, not as a final pass.

**Confidence:** HIGH -- multiple sources confirm backdrop-filter is GPU-intensive and cost is per-element.

---

### Pitfall 9: Video Format Incompatibility on iOS Safari

**What goes wrong:** WebM/VP9 is not supported on iOS Safari. If only WebM sources are provided, iPhone users (the primary target audience for an iOS app landing page) see a broken video element or nothing at all.

**Prevention:**
- Always provide H.264/MP4 as the fallback `<source>` and WebM as progressive enhancement:
  ```html
  <video playsinline muted>
    <source src="demo.webm" type="video/webm">
    <source src="demo.mp4" type="video/mp4">
  </video>
  ```
- Include `playsinline` -- without it, iOS Safari forces fullscreen video playback.
- Include `muted` if using autoplay -- iOS requires muted for autoplay.
- Test on real iOS device -- Chrome DevTools does not accurately simulate iOS video behavior.

**Phase:** DEMO-* (Demo Videos).

**Confidence:** HIGH -- well-documented iOS Safari limitation.

---

### Pitfall 10: Comparison Table Unusable on Mobile

**What goes wrong:** A 6-column comparison table (Dictus + 4 competitors + feature column) does not fit on a 375px mobile screen. Horizontal scrolling is confusing without affordances, and stacking rows into cards loses the comparison context that makes the table valuable in the first place.

**Why it happens:** Tables are inherently two-dimensional. Comparison tables specifically need columns visible side-by-side to be useful. Mobile screens can show 2-3 columns at most.

**Prevention:**
- Pin the first column (feature names) and the Dictus column as sticky. Make remaining competitor columns horizontally scrollable.
- Add a visible scroll indicator ("Swipe to compare") that fades after first interaction.
- Ensure the scroll container has `tabindex="0"` and `role="region"` with `aria-label` for keyboard accessibility (WCAG requirement for scrollable regions).
- Consider a mobile-specific card layout as an alternative: one card per competitor showing their values vs Dictus, swipeable.
- Use icon/checkmark patterns instead of text where possible to reduce column width requirements.

**Phase:** COMP-* (Comparison Table).

**Confidence:** HIGH -- responsive table challenges are well-documented and this table has 6+ columns by design.

---

### Pitfall 11: Enhanced Waveform State Machine Timing Bugs

**What goes wrong:** The v1.1 hero waveform needs three states: flat (idle) -> voice simulation -> transcription synced. Managing transitions between these states with smooth interpolation creates a complex state machine. Off-by-one timing errors, stuck states, and jarring transitions between energy functions are common.

**Why it happens:** The current `Waveform.tsx` uses a single `processingEnergy` function driven by a continuous sinusoidal wave. Adding discrete states with transitions requires interpolating between different energy functions, which introduces edge cases around transition boundaries.

**Prevention:**
- Define a clear state enum: `IDLE | LISTENING | TRANSCRIBING` with explicit transition rules (IDLE->LISTENING, LISTENING->TRANSCRIBING, TRANSCRIBING->IDLE, no skipping).
- Each state defines its own energy function (replacing the current single `processingEnergy`). Transitions lerp between outgoing and incoming energy functions over a fixed duration (300-500ms).
- Keep the existing `useAnimationFrame` hook (which already has proper `cancelAnimationFrame` cleanup). Extend `useHeroDemoState` for state management.
- Do NOT use `setTimeout` for state transitions in animation code -- use the animation timestamp to track elapsed time for deterministic behavior.
- Do NOT add additional `requestAnimationFrame` loops -- keep the single loop pattern.

**Phase:** HERO-* (Hero Animation).

**Confidence:** MEDIUM -- based on analysis of existing code structure in `Waveform.tsx` and `useHeroDemoState.ts`.

## Minor Pitfalls

### Pitfall 12: next-themes + Tailwind v4 @theme Directive Token Conflict

**What goes wrong:** Tailwind v4 uses `@theme` to register CSS custom properties at build time for utility class generation. If the token values in `@theme` are static hex values (as they currently are in `globals.css`), Tailwind generates utilities referencing those fixed values. The theme toggle changes the class on `<html>`, but the utilities still resolve to the dark-mode hex values.

**Why it happens:** `@theme` runs at build time. Theme switching happens at runtime. The two systems operate at different lifecycle stages.

**Prevention:**
- Keep `@theme` values as they are for Tailwind utility generation (so `bg-ink`, `text-accent`, etc. continue to work as class names).
- Override the CSS custom properties at runtime using `@layer base` with `:root` / `.dark` selectors. The `@theme` values become defaults, and the runtime layer overrides them based on active theme.
- This is the pattern recommended in the Tailwind v4 community (GitHub Discussion #15083).

**Phase:** THEME-* (Light Mode) -- must be resolved during initial theme architecture, before any component work.

**Confidence:** MEDIUM -- based on Tailwind v4 docs and community discussion. Specific interaction with `next-themes` needs validation during implementation.

---

### Pitfall 13: prefers-reduced-motion Ignored for New Feature Animations

**What goes wrong:** The existing site properly respects `prefers-reduced-motion` via Motion's `useReducedMotion()` hook and the Waveform's static fallback. New features (Liquid Glass hover transitions, video autoplay, enhanced waveform states, comparison table scroll animations) might skip this check, breaking the established accessibility pattern.

**Prevention:**
- Every new animation must check `useReducedMotion()` or use CSS `@media (prefers-reduced-motion: reduce)`.
- Videos: disable autoplay when reduced motion is preferred. Show static poster image instead.
- Liquid Glass: disable animated transitions (e.g., blur intensity changes on hover/scroll). Static glass effect is acceptable.
- Comparison table: disable any scroll-triggered entry animations. Show table immediately.
- Maintain the existing pattern from `useAnimationFrame`: the `isActive` boolean should incorporate reduced motion check.

**Phase:** All phases. Each feature implementation must include reduced-motion handling.

**Confidence:** HIGH -- existing pattern is established in the codebase (`Waveform.tsx` line 29, `useAnimationFrame.ts`) and must be maintained.

---

### Pitfall 14: Comparison Table Data Staleness and Accuracy Risk

**What goes wrong:** Competitor features, pricing, and capabilities change. Hardcoded comparison data becomes inaccurate, making the table a liability. Competitors may object to misrepresentation. Claims about competitors' privacy practices especially carry reputational risk if wrong.

**Prevention:**
- Add a visible "Last updated: [date]" footer to the comparison table.
- Use only factual, verifiable claims (pricing tiers, platform availability, open source status, stated privacy policy). Avoid subjective quality claims.
- Store comparison data in a structured JSON/TS file separate from the component, making updates easy without touching component code.
- Include source URLs for each factual claim in code comments.
- Avoid "X competitor does NOT have Y" claims unless verifiable -- use "Not available" or leave blank.

**Phase:** COMP-* (Comparison Table).

**Confidence:** HIGH -- common content maintenance pitfall.

---

### Pitfall 15: Video Files Bloating Git Repository

**What goes wrong:** Committing 5-50MB video files to the Git repository makes clone times slow, increases repo size permanently (even after deletion from HEAD), and slows CI/CD.

**Prevention:**
- Store videos in `/public/videos/` but gitignore them if large.
- Preferred: host on Vercel Blob or equivalent CDN, reference by URL.
- Alternative: keep in repo ONLY if total video assets < 10MB and there are 2-3 files maximum. Current repo is lean (1,600 LOC, 27 files) -- adding 30MB of video would dominate the repo size.
- Decide hosting strategy before recording/encoding videos.

**Phase:** DEMO-* (Demo Videos) -- decide hosting strategy before implementation begins.

**Confidence:** HIGH -- standard Git best practice.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| THEME-* (Light Mode) | FOWT flash (#1), 72 hardcoded color refs (#2), canvas colors (#3), Tailwind v4 @theme conflict (#12) | Implement first. Use next-themes with defaultTheme="dark". Refactor tokens to be theme-conditional via @layer base overrides. Audit all 15 component files. Fix Waveform canvas colors. |
| GLASS-* (Liquid Glass) | Safari SVG filter failure (#4), performance on mobile (#8), light mode interaction (#7) | Tiered fallback: Chromium gets full effect, Safari gets enhanced blur, others get solid. Limit 2-3 elements per viewport. Implement AFTER theme work is complete. |
| DEMO-* (Demo Videos) | LCP regression (#5), iOS format incompatibility (#9), Git bloat (#15) | preload="none" + IntersectionObserver. Dual format MP4+WebM. playsinline+muted for iOS. Decide hosting strategy upfront. |
| HERO-* (Hero Animation) | State machine complexity (#11), theme-aware canvas (#3) | Timestamp-based transitions, not setTimeout. Read CSS vars for colors. Keep single rAF loop. |
| CTA-* (TestFlight CTA) | Hydration mismatch (#6) | Universal server render + client-side useEffect enhancement. min-height to prevent CLS. |
| COMP-* (Comparison Table) | Mobile usability (#10), data staleness (#14) | Sticky first + Dictus columns, horizontal scroll for rest. Separate data from presentation component. |
| All phases | Reduced motion regression (#13) | Every new animation checks useReducedMotion(). Maintain existing accessibility pattern. |

## Implementation Order Rationale (Based on Pitfall Dependencies)

The pitfall analysis reveals clear dependency chains that dictate implementation order:

1. **THEME-* first** -- Light mode token system is a hard dependency for Liquid Glass (glass parameters differ per theme, Pitfall #7) and canvas colors (waveform needs theme-reactive colors, Pitfall #3). Doing this first prevents rework across all other features.
2. **HERO-* second** -- Canvas already needs theme-awareness from step 1. Adding animation states while refactoring the canvas code avoids touching `Waveform.tsx` twice.
3. **GLASS-* third** -- Depends on stable theme system (Pitfall #7). Performance testing is only meaningful after theme is finalized and background colors are correct.
4. **COMP-*, DEMO-*, CTA-*** -- These three features have no cross-dependencies. They can be implemented in parallel or in any order after the first three are stable.

## Sources

- [next-themes -- GitHub](https://github.com/pacocoursey/next-themes) -- FOWT prevention via blocking script injection
- [Fixing Dark Mode Flickering in React/Next.js -- Not A Number](https://notanumber.in/blog/fixing-react-dark-mode-flickering) -- FOWT root cause analysis
- [Next.js Dark Mode Guide -- BetterLink](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-dark-mode-guide/) -- next-themes + Tailwind integration
- [Tailwind v4 CSS Variables Discussion #15083](https://github.com/tailwindlabs/tailwindcss/discussions/15083) -- Theme-conditional token overrides
- [Tailwind CSS Dark Mode Docs](https://tailwindcss.com/docs/dark-mode) -- Class strategy configuration
- [Liquid Glass in CSS and SVG -- kube.io](https://kube.io/blog/liquid-glass-css-svg/) -- SVG filter browser limitations
- [Getting Clarity on Apple's Liquid Glass -- CSS-Tricks](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/) -- Implementation reality check
- [How to Create Liquid Glass Effects -- LogRocket](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/) -- Performance and fallback strategies
- [nikdelvin/liquid-glass -- GitHub](https://github.com/nikdelvin/liquid-glass) -- Reference CSS/SVG implementation
- [Glassmorphism Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) -- Mobile performance limits
- [Largest Contentful Paint -- web.dev](https://web.dev/articles/lcp) -- Video poster as LCP element specification
- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error) -- Official hydration mismatch documentation
- [Device Detection in Next.js SSR -- codestudy.net](https://www.codestudy.net/blog/how-to-detect-the-device-on-react-ssr-app-with-next-js/) -- UA detection patterns and pitfalls
- [Fix Hydration Mismatch Errors -- OneUptime](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view) -- 2026 hydration fix patterns
- [backdrop-filter -- Can I Use](https://caniuse.com/css-backdrop-filter) -- Browser support data (95% global)
- [CSS Responsive Tables Guide 2025](https://dev.to/satyam_gupta_0d1ff2152dcc/css-responsive-tables-complete-guide-with-code-examples-for-2025-225p) -- Mobile table patterns
- [Accessible Responsive Tables -- tempertemper](https://www.tempertemper.net/blog/accessible-responsive-tables) -- WCAG scrollable region requirements
- [Canvas Memory Leak Study -- stackinsight.dev](https://stackinsight.dev/blog/memory-leak-empirical-study/) -- requestAnimationFrame cleanup impact (819KB vs 2.5KB)

# Phase 5: Theme System - Research

**Researched:** 2026-03-11
**Domain:** CSS theming, dark/light mode toggle, Tailwind v4, next-themes, canvas color adaptation
**Confidence:** HIGH

## Summary

Phase 5 adds light/dark theme switching to the Dictus landing page. The existing codebase uses Tailwind v4 with a `@theme` block in `globals.css` defining 17 color tokens -- all hardcoded for dark mode. 14 component files reference these tokens via utility classes (`bg-ink-deep`, `text-white-70`, etc.) and the Waveform canvas uses hardcoded JS color constants.

The recommended approach is a **CSS variable swap pattern**: redefine `@theme` tokens to reference CSS custom properties (`var(--x)`), then set those properties in `:root` (light) and `.dark` (dark) selectors. This means component files need **zero changes** to their Tailwind classes -- `bg-surface` automatically resolves to the correct color per theme. next-themes v0.4.6 handles class toggling, localStorage persistence, system preference detection, and FOWT prevention via an injected blocking script.

**Primary recommendation:** Use CSS variable indirection in `@theme` + next-themes `attribute="class"` + `@custom-variant dark` for a zero-component-edit token migration. Reserve `dark:` prefix usage only for the few cases where light/dark need structurally different styling (e.g., border opacity differences).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Light mode palette matches iOS DictusColors.swift exactly: bg `#F2F2F7`, surface `#FFFFFF`, text primary `#000000`, text body `~#808080`, borders `~#E0E0E0`
- Accent blue `#3D7EFF` stays identical in both modes
- Semantic colors (recording, smart, success, warning) stay identical across modes
- Cards in light mode keep frosted glass aesthetic (semi-transparent white with backdrop-blur), not solid white
- Toggle placement: next to language toggle (FR/EN) in nav right side
- Toggle style: animated sun/moon icon morph (smooth transition)
- 2-state toggle only: light / dark (no explicit "system" option)
- Default first visit: respect `prefers-color-scheme`; after first toggle, localStorage persists
- Waveform edge bars: gray (~#808080 varying opacity) light / white with opacity dark
- Waveform center bars: gradient `#6BA3FF -> #2563EB` in BOTH modes
- Waveform color lerp ~300ms on theme switch
- Canvas reads theme from CSS custom properties or React context, no hardcoded constants

### Claude's Discretion
- Exact semantic token naming strategy (bg-primary vs bg-app etc.)
- Implementation of sun/moon morph animation (SVG path morph, CSS, or canvas)
- How to propagate theme to canvas (CSS custom properties vs React context vs ThemeProvider prop)
- FOWT prevention script placement and approach
- Tailwind v4 @custom-variant dark configuration
- Migration order across affected files

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| THEME-01 | User can toggle between light, dark, and system theme via Nav toggle | next-themes ThemeProvider with `useTheme()` hook; 2-state toggle (light/dark) with system as default per CONTEXT.md |
| THEME-02 | All dark-only color references migrated to semantic tokens that swap per theme | CSS variable swap pattern in `@theme` + `:root`/`.dark` selectors; 14 files identified, zero class changes needed |
| THEME-03 | Canvas waveform reads colors from CSS custom properties (theme-aware) | `getComputedStyle` reads `--color-*` variables; canvas re-resolves on theme change via context or MutationObserver |
| THEME-04 | Theme preference persists across sessions (localStorage) | next-themes built-in localStorage with configurable `storageKey` |
| THEME-05 | Theme switch animates with smooth 200ms cross-fade transition | CSS `transition` on `background-color`, `color`, `border-color` on `*` selector; canvas lerp for waveform |
| THEME-06 | No flash of wrong theme on page load (FOWT prevention) | next-themes injects blocking `<script>` in `<head>` before paint; `suppressHydrationWarning` on `<html>` |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-themes | 0.4.6 | Theme class toggling, localStorage, FOWT prevention | De facto standard for Next.js theming; ~1.5kb; handles all edge cases |
| Tailwind CSS | v4 (already installed) | Utility-first CSS with `@theme` + `@custom-variant` | Already in project; CSS-first config, no tailwind.config.js needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion (framer-motion) | 12.35.2 (already installed) | Sun/moon SVG morph animation | Toggle icon animation; `AnimatePresence` + `motion.path` for SVG morph |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Custom useTheme hook | Would need to re-implement FOWT script, localStorage, system detection, hydration safety |
| CSS variable swap | `dark:` prefix on every utility | Requires editing all 14 files, doubling every color class; error-prone, harder to maintain |
| framer-motion SVG morph | Pure CSS keyframe animation | Less smooth morph; motion already in bundle so no size cost |

**Installation:**
```bash
npm install next-themes
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    globals.css              # @theme tokens + :root/:dark variable definitions + @custom-variant
    [locale]/
      layout.tsx             # ThemeProvider wrapper, suppressHydrationWarning on <html>
  components/
    Nav/
      Nav.tsx                # Adds ThemeToggle next to LanguageToggle
      ThemeToggle.tsx        # NEW: sun/moon icon with useTheme()
      LanguageToggle.tsx     # Unchanged
    Hero/
      Waveform.tsx           # Refactored: reads colors from CSS custom properties
    shared/
      ThemeProvider.tsx       # NEW: "use client" wrapper around NextThemesProvider
  hooks/
    useThemeColors.ts        # NEW (optional): reads CSS custom properties for canvas use
```

### Pattern 1: CSS Variable Swap via @theme Indirection

**What:** Define `@theme` tokens as `var()` references to CSS custom properties. Set actual values in `:root` (light) and `.dark` (dark) selectors. All existing utility classes auto-swap.

**When to use:** When 14+ files use semantic token utility classes and you want zero component edits.

**Example:**
```css
/* globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* Light mode values (default) */
:root {
  --theme-bg-primary: #F2F2F7;
  --theme-bg-body: #F2F2F7;
  --theme-bg-secondary: #EFF1F5;
  --theme-surface: #FFFFFF;
  --theme-text-primary: #000000;
  --theme-text-body: rgba(0, 0, 0, 0.60);
  --theme-text-secondary: rgba(0, 0, 0, 0.40);
  --theme-border: rgba(0, 0, 0, 0.08);
  --theme-border-hi: rgba(0, 0, 0, 0.14);
  /* Waveform-specific */
  --theme-waveform-edge-rgb: 128, 128, 128;
  --theme-waveform-gradient-start: #6BA3FF;
  --theme-waveform-gradient-end: #2563EB;
}

/* Dark mode overrides */
.dark {
  --theme-bg-primary: #0A1628;
  --theme-bg-body: #0B0F1A;
  --theme-bg-secondary: #111827;
  --theme-surface: #161C2C;
  --theme-text-primary: #FFFFFF;
  --theme-text-body: rgba(255, 255, 255, 0.70);
  --theme-text-secondary: rgba(255, 255, 255, 0.60);
  --theme-border: rgba(255, 255, 255, 0.07);
  --theme-border-hi: rgba(255, 255, 255, 0.14);
  --theme-waveform-edge-rgb: 255, 255, 255;
  --theme-waveform-gradient-start: #6BA3FF;
  --theme-waveform-gradient-end: #2563EB;
}

@theme {
  /* Backgrounds -- now referencing swap variables */
  --color-ink-deep: var(--theme-bg-primary);
  --color-ink: var(--theme-bg-body);
  --color-ink-2: var(--theme-bg-secondary);
  --color-surface: var(--theme-surface);

  /* Text (used as text-white, text-white-70, text-white-40) */
  --color-white: var(--theme-text-primary);
  --color-white-70: var(--theme-text-body);
  --color-white-40: var(--theme-text-secondary);

  /* Borders */
  --color-border: var(--theme-border);
  --color-border-hi: var(--theme-border-hi);

  /* Accent -- identical both modes */
  --color-accent: #3D7EFF;
  --color-accent-hi: #6BA3FF;
  --color-sky: #93C5FD;
  --color-mist: #DBEAFE;
  --color-navy: #0F3460;

  /* Semantic -- identical both modes */
  --color-recording: #EF4444;
  --color-smart: #8B5CF6;
  --color-success: #22C55E;
  --color-warning: #F59E0B;

  /* Glow -- identical both modes */
  --color-glow: rgba(61, 126, 255, 0.35);
  --color-glow-soft: rgba(61, 126, 255, 0.12);
}

@theme inline {
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-dm-mono);
}
```

**Key insight:** Existing component classes like `bg-ink-deep`, `text-white-70`, `border-border` resolve to the CSS variable which swaps value based on `.dark` class presence. Zero component file edits needed for color migration.

### Pattern 2: ThemeProvider Setup for Next.js App Router

**What:** Wrap app in next-themes ThemeProvider as a client component.

**Example:**
```tsx
// src/components/shared/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

```tsx
// In layout.tsx -- key changes:
// 1. Add suppressHydrationWarning to <html>
// 2. Wrap content with ThemeProvider
<html lang={locale} suppressHydrationWarning className={`${dmSans.variable} ${dmMono.variable}`}>
  <body className="overflow-x-hidden bg-ink font-sans text-white antialiased">
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* ...existing content... */}
      </ThemeProvider>
    </NextIntlClientProvider>
  </body>
</html>
```

### Pattern 3: Theme-Aware Canvas via CSS Custom Properties

**What:** Waveform reads colors from computed CSS variables instead of hardcoded constants.

**Example:**
```tsx
// In Waveform.tsx
const resolveThemeColors = useCallback(() => {
  const style = getComputedStyle(document.documentElement);
  return {
    edgeRgb: style.getPropertyValue('--theme-waveform-edge-rgb').trim(),
    gradientStart: style.getPropertyValue('--theme-waveform-gradient-start').trim(),
    gradientEnd: style.getPropertyValue('--theme-waveform-gradient-end').trim(),
  };
}, []);

// Re-resolve on theme change (detect via MutationObserver on <html> class)
useEffect(() => {
  const observer = new MutationObserver(() => {
    colorsRef.current = resolveThemeColors();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  colorsRef.current = resolveThemeColors();
  return () => observer.disconnect();
}, [resolveThemeColors]);
```

### Pattern 4: Sun/Moon Morph Toggle with Framer Motion

**What:** Animated SVG toggle that morphs between sun and moon shapes.

**Example:**
```tsx
// src/components/Nav/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-11 w-11" />; // placeholder to avoid layout shift

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-11 w-11 items-center justify-center text-white-40 transition-colors hover:text-white-70"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.g key="moon" /* moon SVG paths with enter/exit animations */ />
          ) : (
            <motion.g key="sun" /* sun SVG paths with enter/exit animations */ />
          )}
        </AnimatePresence>
      </motion.svg>
    </button>
  );
}
```

### Anti-Patterns to Avoid
- **Adding `dark:` prefix to every utility class in all 14 files:** Defeats the purpose of the variable swap pattern. Only use `dark:` for structural differences, not color swaps.
- **Using `disableTransitionOnChange` in ThemeProvider:** The requirement explicitly asks for smooth 200ms transition -- do NOT disable transitions.
- **Reading theme from React context in canvas render loop:** `useTheme()` causes re-renders. Instead, read CSS custom properties via `getComputedStyle` and detect changes via MutationObserver.
- **Hardcoding color values in components:** All colors must flow through CSS custom properties, never inline hex values.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FOWT prevention | Custom inline `<script>` to read localStorage | next-themes built-in script injection | Handles edge cases: SSR, SSG, system preference, hydration mismatch |
| localStorage persistence | Custom useEffect + localStorage | next-themes `storageKey` | Handles tab sync, fallback, edge cases |
| System preference detection | `window.matchMedia('(prefers-color-scheme: dark)')` | next-themes `enableSystem` + `defaultTheme="system"` | Handles listener cleanup, SSR safety, hydration |
| Class toggling on `<html>` | Manual `document.documentElement.classList.toggle` | next-themes `attribute="class"` | Handles SSR, concurrent updates, race conditions |
| SVG icon animation | CSS keyframes or manual requestAnimationFrame | framer-motion `AnimatePresence` + `motion` | Already in bundle, handles enter/exit, accessibility |

**Key insight:** next-themes solves the entire FOWT + persistence + system detection problem in ~1.5kb. Every custom solution will miss edge cases (incognito mode, forced themes, multiple tabs, SSR/SSG differences).

## Common Pitfalls

### Pitfall 1: @theme Variables Don't Cascade from .dark
**What goes wrong:** Defining color values directly in `@theme` (like `--color-ink: #0B0F1A`) creates static values. Adding a `.dark` selector to override `--color-ink` does NOT work because `@theme` inlines values at build time.
**Why it happens:** `@theme` generates CSS at build time. The generated utility `.bg-ink` gets a static value, not a `var()` reference.
**How to avoid:** Use the indirection pattern: `@theme { --color-ink: var(--theme-bg-body); }` -- this generates `.bg-ink { background-color: var(--theme-bg-body); }` which IS responsive to cascade.
**Warning signs:** Colors don't change when toggling theme; inspecting element shows hardcoded hex instead of `var()`.

### Pitfall 2: Hydration Mismatch Without suppressHydrationWarning
**What goes wrong:** React throws hydration error because server-rendered HTML has no `class="dark"` but client adds it.
**Why it happens:** next-themes adds the class client-side after hydration.
**How to avoid:** Add `suppressHydrationWarning` to the `<html>` element. This is safe and expected.
**Warning signs:** Console error about hydration mismatch on `<html>` element.

### Pitfall 3: Canvas Ignores Theme Changes
**What goes wrong:** Waveform renders with stale colors after theme toggle.
**Why it happens:** Canvas draws imperatively; CSS variable changes don't trigger re-renders.
**How to avoid:** Use MutationObserver on `document.documentElement` class attribute to detect `.dark` toggle, then re-resolve `getComputedStyle` values.
**Warning signs:** Waveform stays white-on-dark after switching to light mode.

### Pitfall 4: Flash When ThemeProvider Is Inside Body
**What goes wrong:** Brief flash of light/dark before JS runs.
**Why it happens:** next-themes script must run before any rendering.
**How to avoid:** Ensure ThemeProvider wraps as high as possible, and `suppressHydrationWarning` is on `<html>`.
**Warning signs:** Brief color flash on page load, especially on slow connections.

### Pitfall 5: Transition Applied to ALL Properties
**What goes wrong:** Layout thrashing or janky scrolling because `transition: all 200ms` affects transforms, dimensions, etc.
**Why it happens:** Blanket `*` transition selector.
**How to avoid:** Scope transition to only color-related properties: `transition-property: color, background-color, border-color, fill, stroke;`
**Warning signs:** Sluggish scroll performance, layout shifts during theme toggle.

### Pitfall 6: Token Naming Collision (text-white in light mode)
**What goes wrong:** `text-white` utility class now resolves to `#000000` in light mode, which is semantically confusing.
**Why it happens:** The CSS variable swap changes `--color-white` to a dark color in light mode.
**How to avoid:** This is intentional -- the token names are semantic to the dark theme origin, but the values swap. Alternatively, rename to theme-neutral names (`text-primary`). The CONTEXT.md leaves naming to Claude's discretion.
**Warning signs:** Confusion during code review; new developers not understanding why "white" is black.

## Code Examples

### Complete globals.css Theme Configuration
See Pattern 1 above for the full CSS variable swap implementation.

### Waveform Gradient (Center Bars)
```tsx
// Replace current resolveBarColor with gradient-aware version
const resolveBarColor = useCallback((index: number, ctx: CanvasRenderingContext2D, y: number, barHeight: number): string | CanvasGradient => {
  const center = (BAR_COUNT - 1) / 2;
  const distanceFromCenter = Math.abs(index - center) / center;

  if (distanceFromCenter < 0.4) {
    // Inner 40%: gradient from accent-hi to accent (matching iOS BrandWaveform)
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, colorsRef.current.gradientStart);
    gradient.addColorStop(1, colorsRef.current.gradientEnd);
    return gradient;
  } else {
    // Outer: edge color with opacity
    const opacity = (1.0 - distanceFromCenter) * 0.9 + 0.15;
    return `rgba(${colorsRef.current.edgeRgb},${opacity.toFixed(3)})`;
  }
}, []);
```

### Smooth Color Lerp for Waveform Theme Transition
```tsx
// Use requestAnimationFrame to lerp between old and new color values over ~300ms
const lerpColors = useCallback((oldColors: ThemeColors, newColors: ThemeColors, duration: number = 300) => {
  const startTime = performance.now();
  const animate = (now: number) => {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = t * t * (3 - 2 * t); // smoothstep
    // Interpolate RGB values
    colorsRef.current = interpolateThemeColors(oldColors, newColors, eased);
    if (t < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}, []);
```

### Theme Transition CSS
```css
/* Add to globals.css -- scoped to color properties only */
html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition: color 200ms ease, background-color 200ms ease, border-color 200ms ease, fill 200ms ease, stroke 200ms ease !important;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js darkMode: "class"` | `@custom-variant dark` in CSS | Tailwind v4 (Jan 2025) | No config file needed; pure CSS |
| `@theme` with hardcoded values | `@theme` with `var()` indirection | Tailwind v4 pattern | Enables runtime theme swap without recompilation |
| Custom FOWT scripts | next-themes 0.4.6 built-in | Stable since 2023 | Zero-config FOWT prevention |
| `prefers-color-scheme` media query | Class-based with system fallback | Industry standard | Gives users manual override control |

**Deprecated/outdated:**
- `tailwind.config.js` `darkMode` key: replaced by `@custom-variant dark` in Tailwind v4
- `@variant dark` syntax: replaced by `@custom-variant dark` in recent Tailwind v4 releases

## Open Questions

1. **Token naming: keep dark-origin names or rename to semantic?**
   - What we know: Current names (`ink-deep`, `white-70`) are dark-themed. After swap, `white` resolves to `#000000` in light mode.
   - What's unclear: Whether to rename (e.g., `bg-primary`, `text-primary`) or keep existing names for zero-churn migration.
   - Recommendation: Keep existing names for Phase 5 (zero-churn). Consider renaming in a future cleanup phase. The variable swap is transparent to components.

2. **Frosted glass cards in light mode**
   - What we know: CONTEXT.md requires "semi-transparent white with backdrop-blur" in light mode.
   - What's unclear: Exact opacity value for `bg-surface/50` in light mode (currently `rgba(22,28,44,0.5)` in dark).
   - Recommendation: `--theme-surface` in light mode should be `rgba(255,255,255,0.50)` for the `/50` opacity variant to work. Test visually.

3. **@custom-variant dark with system preference fallback**
   - What we know: A multi-block `@custom-variant` can handle both explicit class AND `prefers-color-scheme` fallback.
   - What's unclear: Whether next-themes already handles system preference before JS loads (it does via its injected script).
   - Recommendation: Use simple `@custom-variant dark (&:where(.dark, .dark *));` since next-themes handles system preference detection and applies the `.dark` class before paint.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | `npx playwright test --grep "theme"` (after setup) |
| Full suite command | `npx playwright test` (after setup) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THEME-01 | Toggle switches between light/dark | e2e | `npx playwright test tests/theme-toggle.spec.ts` | No -- Wave 0 |
| THEME-02 | All colors swap correctly per theme | e2e (visual) | `npx playwright test tests/theme-colors.spec.ts` | No -- Wave 0 |
| THEME-03 | Canvas waveform adapts to theme | e2e (visual) | `npx playwright test tests/waveform-theme.spec.ts` | No -- Wave 0 |
| THEME-04 | Theme persists across sessions | e2e | `npx playwright test tests/theme-persistence.spec.ts` | No -- Wave 0 |
| THEME-05 | Smooth 200ms transition on switch | manual-only | Visual inspection -- timing hard to assert programmatically | N/A |
| THEME-06 | No FOWT on page load | e2e | `npx playwright test tests/theme-fowt.spec.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors, build failures)
- **Per wave merge:** `npx playwright test` (full e2e suite)
- **Phase gate:** Full suite green + manual visual inspection of both themes

### Wave 0 Gaps
- [ ] `playwright.config.ts` -- Playwright configuration for e2e tests
- [ ] `tests/theme-toggle.spec.ts` -- THEME-01 toggle behavior
- [ ] `tests/theme-colors.spec.ts` -- THEME-02 color migration verification
- [ ] `tests/waveform-theme.spec.ts` -- THEME-03 canvas adaptation
- [ ] `tests/theme-persistence.spec.ts` -- THEME-04 localStorage persistence
- [ ] `tests/theme-fowt.spec.ts` -- THEME-06 FOWT prevention
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install`

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Dark Mode docs](https://tailwindcss.com/docs/dark-mode) -- `@custom-variant dark` syntax, class-based and data-attribute approaches
- [Tailwind CSS v4 Theme docs](https://tailwindcss.com/docs/theme) -- `@theme` directive with `var()` indirection pattern, distinction from `:root`
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- ThemeProvider API, FOWT prevention mechanism, App Router support
- Existing codebase analysis -- 14 files with dark-only colors, `globals.css` @theme block, Waveform.tsx hardcoded constants

### Secondary (MEDIUM confidence)
- [Next.js 15 + Tailwind v4 dark mode guide](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) -- Complete integration pattern verified against official docs
- [Flexible dark mode custom variant](https://schoen.world/n/tailwind-dark-mode-custom-variant) -- Multi-block `@custom-variant` with system preference fallback
- [Implementing dark mode with Tailwind v4 + Next.js](https://jianliao.github.io/blog/tailwindcss-v4) -- data-theme attribute approach, ThemeSwitcher pattern

### Tertiary (LOW confidence)
- [Theme Toggles](https://toggles.dev/) -- Sun/moon morph animation reference (not verified for production use)
- [react-toggle-dark-mode](https://github.com/JoseRFelix/react-toggle-dark-mode) -- Alternative toggle library (not recommended; custom SVG with framer-motion preferred)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- next-themes 0.4.6 verified as latest; Tailwind v4 @custom-variant syntax verified via official docs
- Architecture: HIGH -- CSS variable swap pattern verified via Tailwind docs and multiple implementations; next-themes App Router pattern well-documented
- Pitfalls: HIGH -- common issues documented across multiple sources and consistent with Tailwind v4 architecture
- Waveform integration: MEDIUM -- getComputedStyle + MutationObserver pattern is standard but lerp animation is custom

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable libraries, low churn)

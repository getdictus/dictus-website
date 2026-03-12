# Phase 6: Visual Effects - Research

**Researched:** 2026-03-12
**Domain:** CSS glassmorphism (backdrop-filter), Canvas animation choreography, accessibility (prefers-reduced-motion)
**Confidence:** HIGH

## Summary

Phase 6 adds two major visual systems: a tiered Liquid Glass glassmorphism treatment across site elements, and a choreographed 3-phase waveform animation in the hero. Both are CSS/Canvas-only with zero new dependencies. The existing codebase already uses `backdrop-blur-md` and `bg-surface/50` on cards, and the Waveform component already has a full canvas render pipeline with theme-aware color lerping -- this phase upgrades both rather than building from scratch.

The primary technical risk is `backdrop-filter` performance on mobile Safari. Mitigation is well-understood: limit simultaneous blurred elements, avoid animating the filter values themselves, use `will-change` hints sparingly, and keep blur radius reasonable (12-20px). The CONTEXT.md decision to skip SVG displacement filters eliminates the biggest Safari compatibility headache.

**Primary recommendation:** Implement glass as reusable CSS utility classes (Tailwind arbitrary values or `@theme` tokens), upgrade existing card classes in-place, and refactor the Waveform energy source from continuous sinusoidal to a 3-phase state machine that loosely syncs with `useHeroDemoState`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Medium blur: backdrop-filter blur 20px + saturate 1.5 for Tier 1 elements
- Background opacity lowered to 0.4 (dark) / 0.6 (light) for visible depth through panels
- Gradient border: subtle white-to-transparent gradient on top-left edges (135deg), simulating light catching glass edge
- No SVG displacement refraction -- CSS-only approach (blur + saturate + gradient border). SVG filters broken in Mobile Safari, not worth the complexity
- Light mode: white frosted glass (rgba(255,255,255,0.6)) with dark-to-transparent gradient border, saturate 1.3
- Two-tier glass system: Tier 1 (Full Glass) for Nav bar on scroll + Hero overlay; Tier 2 (Soft Glass) for feature cards, DataFlow, TextReveal, HowItWorks, OpenSource, Community
- Tier 1: blur 20px, saturate 1.5, gradient border, bg opacity 0.4
- Tier 2: blur 12px, saturate 1.2, standard border (no gradient), bg opacity 0.5
- Nav behavior: solid bg-ink-deep at top, transitions to full glass (Tier 1) after scrollY > 10
- Hero overlay: new frosted glass panel behind headline + subtitle + demo area, waveform canvas stays behind it visible through glass
- Waveform 3-phase: flat -> active -> calm (loosely timed, NOT tightly coupled to useHeroDemoState)
- Flat phase: bars at minimum height, gentle idle presence
- Active phase: random amplitude per bar (0.3-0.9) every ~150ms, smoothed with existing lerp-up/decay-down, center bars weighted slightly taller, organic speech-like feel
- Calm phase: bars gradually settle back to near-flat as transcription text appears
- Transitions: quick rise ~300ms ease-out (flat -> active), slow settle ~800ms ease-in-out (active -> calm)
- Colors: bars keep theme-based gradient throughout (no state-color tinting)
- Reduced motion waveform: static mid-energy frame -- bars drawn once at ~40% height, center bars slightly taller, gradient colors applied, no animation loop
- Liquid Glass effects (blur, saturate, gradient border) are safe for all users -- only disable hover transition-colors for reduced motion
- Hero demo: current behavior preserved -- phase 6 just ensures static waveform frame looks intentional
- Scroll animations: existing ScrollReveal + Motion v12 LazyMotion already respect prefers-reduced-motion -- no changes needed

### Claude's Discretion
- Exact Tailwind utility classes or CSS custom properties for glass tiers (could be reusable utility classes or per-component)
- Hero glass overlay sizing and padding (how much of the hero content it wraps)
- Waveform 3-phase timing relative to useHeroDemoState durations (loose sync, not locked)
- Whether glass styles are extracted into a shared component/utility or applied inline per component
- Performance optimization approach (will-change hints, compositor layers, etc.)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GLASS-01 | Liquid Glass effect applied to nav bar, hero overlay, and 2-3 feature cards | Two-tier glass system with specific blur/saturate values per tier; Nav scroll transition; Hero overlay as new glass panel |
| GLASS-02 | CSS baseline: backdrop-filter blur + saturate works in all browsers | backdrop-filter has universal support (Safari 17+, Chrome, Firefox); no -webkit- prefix needed for modern browsers; Tailwind v4 provides `backdrop-blur-[20px]` and `backdrop-saturate-[1.5]` arbitrary values |
| GLASS-03 | SVG displacement filter adds refraction effect on Chromium (progressive enhancement) | **OVERRIDDEN by CONTEXT.md**: No SVG displacement -- CSS-only approach. This requirement is satisfied by the decision to skip SVG filters (broken in Mobile Safari). The gradient border simulates the depth/refraction effect instead |
| GLASS-04 | Liquid Glass tuned for both light and dark themes | Light mode uses white frosted glass (rgba(255,255,255,0.6)) with saturate 1.3; dark mode uses surface/40 with saturate 1.5; gradient border inverts (white-to-transparent dark, dark-to-transparent light) |
| GLASS-05 | Performance acceptable on mobile Safari (no jank, no battery drain) | CSS-only approach avoids SVG filter pitfalls; limit blur radius to 12-20px; avoid animating backdrop-filter values; use will-change sparingly; static glass effects don't trigger repaints |
| HERO-01 | Waveform starts flat/idle when section enters viewport | Flat phase: bars at minimum height with gentle idle presence; replaces current continuous sinusoidal energy |
| HERO-02 | Waveform animates with simulated voice energy (random amplitude movement) | Active phase: random amplitude 0.3-0.9 per bar every ~150ms, smoothed with existing lerp/decay, center-weighted |
| HERO-03 | Waveform transitions to transcription state with rhythmic pattern | Calm phase: bars settle back to near-flat over ~800ms ease-in-out; existing gradient colors maintained |
| HERO-04 | Text reveal timing syncs with waveform energy (text appears as waveform calms) | Loose sync via observing useHeroDemoState phase; waveform calms as transcribing/smart states produce text |
| HERO-05 | Full sequence respects prefers-reduced-motion | Static mid-energy frame at ~40% height; useReducedMotion already in Waveform; glass effects are purely static (safe) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4 | Utility-first styling for glass classes | Already in project; provides `backdrop-blur-[Xpx]`, `backdrop-saturate-[X]` arbitrary values |
| Next.js | 16.1.6 | App Router, SSR | Already in project |
| React | 19.2.3 | Component rendering | Already in project |
| motion | ^12.35.2 | `useReducedMotion` hook, LazyMotion | Already in project; provides reduced-motion detection |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | ^0.4.6 | Theme detection for glass color swaps | Already in project; `.dark` class drives CSS variable swaps |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS-only glass | SVG displacement filters | SVG feDisplacementMap broken in Mobile Safari; adds complexity for minimal visual gain |
| Tailwind arbitrary values | CSS custom properties in globals.css | Both work; Tailwind arbitrary values keep glass definition co-located with components |
| Canvas 3-phase state machine | Framer Motion timeline | Canvas animation is already implemented; adding Framer Motion for canvas would be unnecessary overhead |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Approach: Glass Utility Classes

Define reusable glass tier styles as either Tailwind `@apply` utilities or CSS custom property sets in `globals.css`. This keeps glass definitions DRY across 8+ components.

**Option A: CSS custom properties in globals.css (RECOMMENDED)**

```css
/* globals.css -- add glass tier tokens */
:root {
  --glass-t1-blur: 20px;
  --glass-t1-saturate: 1.5;
  --glass-t1-bg: rgba(255, 255, 255, 0.6);
  --glass-t1-border: linear-gradient(135deg, rgba(255,255,255,0.3), transparent 60%);

  --glass-t2-blur: 12px;
  --glass-t2-saturate: 1.2;
  --glass-t2-bg: rgba(255, 255, 255, 0.5);
}

.dark {
  --glass-t1-bg: rgba(22, 28, 44, 0.4);  /* surface at 0.4 */
  --glass-t1-border: linear-gradient(135deg, rgba(255,255,255,0.15), transparent 60%);

  --glass-t2-bg: rgba(22, 28, 44, 0.5);  /* surface at 0.5 */
}
```

This approach keeps theme-aware values centralized in the existing CSS variable system and lets components use Tailwind arbitrary values pointing to them.

### Gradient Border Pattern

Gradient borders cannot be achieved with `border-image` when `border-radius` is used. Use a `::before` pseudo-element or a wrapper element approach.

**Pseudo-element approach (Tier 1 only):**
```css
.glass-tier1 {
  position: relative;
  overflow: hidden;
}
.glass-tier1::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px; /* border width */
  background: var(--glass-t1-border);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

**Simpler alternative -- inner shadow or top/left border only:**
```css
/* Top-left highlight using box-shadow inset */
box-shadow: inset 1px 1px 0 0 rgba(255,255,255,0.15);
```

The simpler inset box-shadow approach may be sufficient for the "light catching glass edge" effect and avoids pseudo-element complexity. This falls under Claude's discretion.

### Waveform 3-Phase State Machine

Replace the continuous `processingEnergy` sinusoidal function with a phase-driven energy source.

```typescript
type WaveformPhase = 'flat' | 'active' | 'calm';

// Phase determines how bar target energies are computed
// flat: all bars near MIN_BAR_HEIGHT (energy ~0.05)
// active: random amplitude per bar, center-weighted
// calm: exponential decay from active levels back to flat
```

**Key architectural change in Waveform.tsx:**
- Current: `processingEnergy(index, phase)` computes sinusoidal wave continuously
- New: A `waveformPhase` ref tracks current phase (flat/active/calm)
- The `drawBars` callback reads `waveformPhase` and computes target energy accordingly
- Phase transitions are triggered by observing `useHeroDemoState` output (passed as prop or via shared state)
- Existing `displayLevels` smoothing (lerp up, decay down) handles visual transitions naturally

### Component Changes Summary

| Component | Current | Change |
|-----------|---------|--------|
| `Nav.tsx` | `bg-ink-deep/80 backdrop-blur-md` when scrolled | Upgrade to Tier 1 glass (blur-[20px], saturate-[1.5], gradient border) when scrolled; solid `bg-ink-deep` at top |
| `Hero.tsx` | Content div at z-10, no glass | Wrap content in new glass overlay panel (Tier 1); waveform canvas at lower z-index visible through glass |
| `Waveform.tsx` | Continuous sinusoidal processing energy | 3-phase state machine (flat/active/calm); accept demoState as prop for loose sync |
| `Features.tsx` (x4 cards) | `bg-surface/50 backdrop-blur-md` | Upgrade to Tier 2 glass values |
| `DataFlow.tsx` | `bg-surface/50 backdrop-blur-md` | Upgrade to Tier 2 glass values |
| `TextReveal.tsx` | `bg-surface/50 backdrop-blur-md` | Upgrade to Tier 2 glass values |
| `HowItWorks.tsx` | No glass currently (step circles with `bg-navy`) | Add Tier 2 glass to step containers or section wrapper |
| `OpenSource.tsx` | No glass currently | Add Tier 2 glass card wrapper |
| `Community.tsx` | No glass currently | Add Tier 2 glass card wrapper |
| `globals.css` | Theme variables for colors | Add glass tier CSS custom properties |

### Anti-Patterns to Avoid
- **Animating backdrop-filter values:** Never transition blur or saturate values -- this forces the browser to re-render the backdrop every frame. Set values statically and only transition opacity/background-color.
- **Nesting backdrop-filter elements:** A child with backdrop-filter inside a parent with backdrop-filter creates compounding blur and visual artifacts. The hero overlay (Tier 1) and TextReveal (Tier 2) are separate DOM branches, not nested.
- **Using will-change everywhere:** `will-change: backdrop-filter` promotes to a compositor layer. Use only on the Nav (which transitions between solid/glass) and remove after the transition. Do not apply to static glass elements.
- **Tight coupling waveform to demo state:** The waveform should observe demo state for phase cues but NOT depend on exact timing. If the demo state machine changes durations, the waveform should still look good.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced motion detection | Custom matchMedia listener | `useReducedMotion()` from motion/react | Already used in project; handles SSR hydration correctly |
| Theme detection | Custom .dark class watcher | Existing MutationObserver in Waveform + next-themes | Pattern already established and working |
| Backdrop blur/saturate | Custom CSS filter strings | Tailwind `backdrop-blur-[20px] backdrop-saturate-[1.5]` | Tailwind v4 supports arbitrary values natively |
| Animation frame loop | Custom rAF management | Existing `useAnimationFrame` hook | Already handles cleanup, callback ref updates, active toggle |
| Smooth value interpolation | Custom easing library | Existing `smoothstep`, `lerpRgb` utilities in Waveform.tsx | Already battle-tested in the color lerp system |

**Key insight:** This phase builds on top of substantial existing infrastructure. The Waveform already has a complete canvas pipeline, theme-aware color system, and reduced-motion handling. Glass effects are a CSS upgrade to existing card styling. No new libraries or complex systems are needed.

## Common Pitfalls

### Pitfall 1: backdrop-filter not working on some elements
**What goes wrong:** backdrop-filter has no visible effect on certain elements.
**Why it happens:** The element needs a partially transparent background for the backdrop to show through. If `bg-surface` is opaque, the blur is invisible.
**How to avoid:** Always use semi-transparent backgrounds: `bg-surface/40` not `bg-surface`. Verify with devtools that the computed background-color has alpha < 1.
**Warning signs:** Glass looks like a solid panel with no frosted effect.

### Pitfall 2: Mobile Safari backdrop-filter jank
**What goes wrong:** Scrolling becomes choppy when multiple backdrop-filter elements are visible.
**Why it happens:** Each backdrop-filter element creates a compositor layer. Too many simultaneous layers exhaust GPU memory on mobile.
**How to avoid:** Limit visible glass elements. Use Tier 2 (blur 12px) for cards which are lower impact. Avoid placing glass on elements that scroll independently (like sticky headers that are always visible + cards below).
**Warning signs:** FPS drops below 30 on iPhone during scroll; battery usage spikes in Safari Web Inspector.

### Pitfall 3: Waveform canvas behind glass looks washed out
**What goes wrong:** The blur + saturate on the hero glass overlay makes the waveform bars look indistinct or overly bright.
**Why it happens:** Saturate amplifies colors behind the glass; blur spreads bar edges.
**How to avoid:** Test the hero overlay with the waveform actively animating. May need to increase waveform bar opacity or decrease glass blur slightly. The 20px blur is aggressive -- verify visually.
**Warning signs:** Waveform is barely visible through the glass overlay.

### Pitfall 4: Gradient border mask-composite not supported in all browsers
**What goes wrong:** The pseudo-element gradient border technique using `mask-composite: exclude` fails.
**Why it happens:** `-webkit-mask-composite: xor` syntax differs from standard `mask-composite: exclude`. Need both.
**How to avoid:** Include both `-webkit-mask-composite: xor` AND `mask-composite: exclude`. Alternatively, use the simpler `box-shadow: inset` approach which has universal support.
**Warning signs:** Gradient border appears as a solid overlay covering the card content.

### Pitfall 5: Waveform phase transitions look jarring
**What goes wrong:** Bars snap from flat to active or active to calm instead of smoothly transitioning.
**Why it happens:** The existing `displayLevels` smoothing (lerp up 0.3, decay 0.85) already handles this, but only if target energies change gradually.
**How to avoid:** In the active phase, update random target amplitudes every ~150ms (not every frame). The existing smoothing will interpolate between updates. For flat->active, the ~300ms ease-out emerges naturally from the lerp-up factor. For active->calm, reduce target amplitudes gradually over ~800ms rather than setting them to 0 instantly.
**Warning signs:** Bars pop or snap at phase boundaries.

### Pitfall 6: Theme transition causes glass flash
**What goes wrong:** When toggling light/dark, glass backgrounds flash before settling.
**Why it happens:** The existing `html.theme-transition` rule applies 200ms transitions to background-color, but glass backgrounds use CSS variables that change instantly via class swap.
**How to avoid:** Glass background CSS custom properties are already covered by the theme-transition rule since they use `background-color`. The existing 200ms transition should handle this. Test to verify.
**Warning signs:** Visible flash of wrong glass color during theme toggle.

## Code Examples

### Tier 1 Glass (Nav on scroll)
```typescript
// Nav.tsx -- upgrade scrolled state
// Current: bg-ink-deep/80 backdrop-blur-md
// New: Tier 1 full glass with gradient border
<nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled
      ? "bg-[var(--glass-t1-bg)] backdrop-blur-[20px] backdrop-saturate-[1.5] border-b border-border shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.15)]"
      : "bg-ink-deep border-b border-transparent"
  }`}
>
```

### Tier 2 Glass (Cards)
```typescript
// Features.tsx card -- upgrade existing glass
// Current: bg-surface/50 backdrop-blur-md border-border
// New: Tier 2 soft glass
<div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-colors hover:border-border-hi">
```

### Hero Glass Overlay
```typescript
// Hero.tsx -- new glass panel wrapping content
<section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-deep px-6">
  {/* Waveform at lower z-index */}
  <Waveform demoState={demoState.currentState} />

  {/* Glass overlay panel */}
  <div className="relative z-10 mx-auto max-w-3xl rounded-2xl bg-[var(--glass-t1-bg)] px-8 py-12 text-center backdrop-blur-[20px] backdrop-saturate-[1.5] shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.15)]">
    <h1 ...>{t("headline")}</h1>
    <p ...>{t("subtitle")}</p>
    {/* Demo area */}
    <div className="mt-10 flex flex-col items-center gap-4">
      <StateIndicator ... />
      <TextReveal ... />
    </div>
    <span ...>{t("badge")}</span>
  </div>
</section>
```

### Waveform 3-Phase Energy Source
```typescript
// Waveform.tsx -- replace processingEnergy with phase-driven energy

type WaveformPhase = 'flat' | 'active' | 'calm';

// Store random target amplitudes for active phase
const targetAmplitudesRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));
const waveformPhaseRef = useRef<WaveformPhase>('flat');
const phaseStartTimeRef = useRef<number>(0);

// Generate new random targets for active phase
function generateActiveTargets() {
  const targets = targetAmplitudesRef.current;
  const center = (BAR_COUNT - 1) / 2;
  for (let i = 0; i < BAR_COUNT; i++) {
    const distFromCenter = Math.abs(i - center) / center;
    // Center bars weighted taller: base 0.3-0.9, center bonus up to +0.15
    const centerBonus = (1 - distFromCenter) * 0.15;
    targets[i] = 0.3 + Math.random() * 0.6 + centerBonus;
  }
}

// Compute target energy per bar based on current phase
function computePhaseEnergy(index: number, elapsed: number): number {
  const phase = waveformPhaseRef.current;

  if (phase === 'flat') {
    return 0.05; // minimal idle presence
  }

  if (phase === 'active') {
    return targetAmplitudesRef.current[index];
  }

  if (phase === 'calm') {
    // Exponential decay from current display level toward flat
    const t = Math.min(elapsed / 800, 1); // 800ms settle
    const eased = t * t * (3 - 2 * t); // smoothstep
    const activeLevel = targetAmplitudesRef.current[index];
    return activeLevel * (1 - eased) + 0.05 * eased;
  }

  return 0.05;
}
```

### Reduced Motion Static Frame
```typescript
// Waveform.tsx -- intentional static frame for reduced motion
// Draw once at ~40% height with center weighting
if (shouldReduce && !hasDrawnStaticRef.current) {
  requestAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensionsRef.current;
    ctx.clearRect(0, 0, width, height);

    const center = (BAR_COUNT - 1) / 2;
    // ... bar layout calc same as drawBars ...

    for (let i = 0; i < BAR_COUNT; i++) {
      const distFromCenter = Math.abs(i - center) / center;
      const energy = 0.4 + (1 - distFromCenter) * 0.15; // 40% + center bonus
      const barHeight = MIN_BAR_HEIGHT + energy * (MAX_HEIGHT - MIN_BAR_HEIGHT);
      // ... draw rounded rect with resolveBarColor ...
    }
    hasDrawnStaticRef.current = true;
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `-webkit-backdrop-filter` prefix required | Standard `backdrop-filter` sufficient | Safari 17 (2023) | No vendor prefix needed for modern browsers |
| SVG feDisplacementMap for refraction | CSS-only blur + saturate + gradient border | 2024-2025 | SVG filters unreliable in Safari; CSS approach is stable |
| Tailwind v3 `backdrop-blur-md` fixed values | Tailwind v4 arbitrary values `backdrop-blur-[20px]` | Tailwind v4 (2024) | Exact pixel control without config extension |
| Glass on everything trend | Selective two-tier glass hierarchy | 2025 iOS 26 | Visual hierarchy through differentiated glass intensity |

**Deprecated/outdated:**
- `-webkit-backdrop-filter`: No longer needed for Safari 17+ (project likely targets modern browsers only given iOS 18+ requirement)
- SVG displacement filters for glass: Unreliable cross-browser, explicitly excluded by CONTEXT.md decision

## Open Questions

1. **How much of the hero content should the glass overlay wrap?**
   - What we know: headline + subtitle + demo area (StateIndicator + TextReveal) + badge are all in the content div
   - What's unclear: Whether the glass panel wraps everything including the badge, or just the main content
   - Recommendation: Wrap everything in the content div; adjust padding visually during implementation (Claude's discretion)

2. **Exact timing of waveform phase transitions relative to useHeroDemoState**
   - What we know: CONTEXT says "loosely timed, NOT tightly coupled". Demo states: idle(1500ms) -> recording(2000ms) -> transcribing(2500ms) -> smart(2000ms) -> inserted(2000ms)
   - What's unclear: Exact mapping (e.g., does "flat" = idle, "active" = recording, "calm" = transcribing+smart?)
   - Recommendation: flat during idle, active during recording+transcribing, calm during smart+inserted. Waveform observes `demoState.currentState` prop and updates its phase ref accordingly. Timing emerges from demo state durations.

3. **HowItWorks, OpenSource, Community glass treatment specifics**
   - What we know: CONTEXT lists them as Tier 2. Currently HowItWorks has no glass (step circles only), OpenSource/Community are text sections with no card wrapper
   - What's unclear: Whether to add glass card wrappers to these sections or just add glass to existing containers
   - Recommendation: Add a glass card wrapper div inside each section's max-w-6xl container, similar to how DataFlow wraps its content in a glass card. This is consistent with the existing pattern.

4. **Gradient border implementation technique**
   - What we know: CONTEXT specifies "subtle white-to-transparent gradient on top-left edges (135deg)" for Tier 1 only
   - What's unclear: Whether to use pseudo-element mask technique or simpler inset box-shadow
   - Recommendation: Start with `box-shadow: inset 1px 1px 0 0 rgba(255,255,255,0.15)` (simpler, universally supported). If the visual effect is insufficient, upgrade to pseudo-element approach. This is Claude's discretion.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- no automated test framework in project |
| Config file | None |
| Quick run command | `npm run build` (type-check + build) |
| Full suite command | `npm run lint && npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GLASS-01 | Glass applied to nav, hero overlay, cards | manual-only | Visual inspection in browser | N/A |
| GLASS-02 | backdrop-filter works cross-browser | manual-only | Test in Safari + Chrome | N/A |
| GLASS-03 | SVG displacement (SKIPPED per CONTEXT) | N/A | N/A | N/A |
| GLASS-04 | Glass looks correct in light + dark | manual-only | Toggle theme, inspect both modes | N/A |
| GLASS-05 | No jank on mobile Safari | manual-only | Safari Web Inspector FPS overlay on real device | N/A |
| HERO-01 | Waveform starts flat | manual-only | Load page, observe waveform initial state | N/A |
| HERO-02 | Waveform animates with voice energy | manual-only | Observe active phase amplitude variation | N/A |
| HERO-03 | Waveform transitions to calm | manual-only | Observe calm phase settle animation | N/A |
| HERO-04 | Text appears as waveform calms | manual-only | Observe sync between text reveal and waveform calm | N/A |
| HERO-05 | Reduced motion: static frame | manual-only | Enable prefers-reduced-motion in OS/devtools, verify static bars | N/A |

**Note:** All requirements are visual/behavioral and require manual browser inspection. Automated tests can only verify that the build compiles without errors (`npm run build`). The `npm run lint` command catches TypeScript and ESLint issues.

### Sampling Rate
- **Per task commit:** `npm run build` -- verifies no TypeScript errors introduced
- **Per wave merge:** `npm run lint && npm run build` -- full static analysis
- **Phase gate:** Manual visual inspection in Chrome + Safari (desktop + mobile) before `/gsd:verify-work`

### Wave 0 Gaps
None -- no automated visual test infrastructure exists or is needed for this CSS/Canvas-focused phase. Build verification (`npm run build`) is sufficient for catching code errors.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 backdrop-filter-blur docs](https://tailwindcss.com/docs/backdrop-filter-blur) -- arbitrary value syntax confirmed
- [Tailwind CSS v4 backdrop-filter-saturate docs](https://tailwindcss.com/docs/backdrop-filter-saturate) -- arbitrary value syntax confirmed
- [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) -- browser support reference
- [Can I Use: CSS Backdrop Filter](https://caniuse.com/css-backdrop-filter) -- universal browser support confirmed

### Secondary (MEDIUM confidence)
- [Glassmorphism CSS gradient borders](https://smarative.com/blog/realistic-frosted-glassmorphism-css-gradient-borders) -- pseudo-element mask technique
- [CSS Liquid Glass Effect](https://paulyu.me/articles/9) -- iOS 26 Liquid Glass CSS recreation patterns
- [shadcn/ui backdrop-filter performance issue](https://github.com/shadcn-ui/ui/issues/327) -- real-world mobile performance concerns
- [Graffino: fix blur performance in Safari](https://graffino.com/til/how-to-fix-filter-blur-performance-issue-in-safari) -- Safari-specific optimization

### Tertiary (LOW confidence)
- [Chrome hardware-accelerated animations blog](https://developer.chrome.com/blog/hardware-accelerated-animations) -- compositor layer details (may not apply identically to Safari)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing libraries verified in codebase
- Architecture: HIGH -- builds directly on existing patterns (Waveform canvas, card styling, CSS variables)
- Pitfalls: HIGH -- backdrop-filter performance issues are well-documented; Safari SVG filter issues confirmed by CONTEXT decision
- Glass implementation: MEDIUM -- gradient border technique has multiple valid approaches; will need visual tuning
- Waveform choreography: MEDIUM -- 3-phase state machine is straightforward but timing/feel requires visual iteration

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable CSS features, no fast-moving dependencies)

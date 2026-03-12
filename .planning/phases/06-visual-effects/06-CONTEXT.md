# Phase 6: Visual Effects - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

iOS 26 Liquid Glass glassmorphism across site elements and a choreographed hero waveform animation sequence (flat → voice energy → calm). Both effects must work in light and dark themes, respect prefers-reduced-motion, and not cause jank or battery drain on mobile Safari.

</domain>

<decisions>
## Implementation Decisions

### Liquid Glass intensity
- Medium blur: backdrop-filter blur 20px + saturate 1.5 for Tier 1 elements
- Background opacity lowered to 0.4 (dark) / 0.6 (light) for visible depth through panels
- Gradient border: subtle white-to-transparent gradient on top-left edges (135deg), simulating light catching glass edge
- No SVG displacement refraction — CSS-only approach (blur + saturate + gradient border). SVG filters broken in Mobile Safari, not worth the complexity
- Light mode: white frosted glass (rgba(255,255,255,0.6)) with dark-to-transparent gradient border, saturate 1.3

### Glass element targeting — Two tiers
- **Tier 1 (Full Glass):** Nav bar (on scroll only), Hero content overlay (new)
  - blur: 20px, saturate: 1.5, gradient border, bg opacity 0.4
- **Tier 2 (Soft Glass):** Feature cards (x4), DataFlow card, TextReveal, HowItWorks steps, OpenSource card, Community card
  - blur: 12px, saturate: 1.2, standard border (no gradient), bg opacity 0.5
- Nav behavior: solid bg-ink-deep when at top, transitions to full glass (Tier 1) after scrollY > 10
- Hero overlay: new frosted glass panel behind headline + subtitle + demo area. Waveform canvas stays behind it, visible through glass

### Waveform choreography — Simplified 3-phase
- Waveform has its own 3-phase cycle: flat → active → calm (loosely timed, NOT tightly coupled to useHeroDemoState)
- **Flat phase:** bars at minimum height, gentle idle presence
- **Active phase:** random amplitude per bar (0.3–0.9) every ~150ms, smoothed with existing lerp-up/decay-down. Center bars weighted slightly taller. Organic, speech-like feel
- **Calm phase:** bars gradually settle back to near-flat as transcription text appears
- **Transitions:** quick rise ~300ms ease-out (flat → active), slow settle ~800ms ease-in-out (active → calm)
- **Colors:** bars keep theme-based gradient throughout (no state-color tinting). Center = blue gradient, edges = white/gray with opacity. StateIndicator handles state color differentiation

### Reduced motion strategy
- **Waveform:** static mid-energy frame — bars drawn once at ~40% height, center bars slightly taller, gradient colors applied, no animation loop. Intentional visual, not accidental first frame
- **Liquid Glass:** all glass effects (blur, saturate, gradient border) are purely visual/static — safe for all users. Only disable hover transition-colors (instant state change instead of 300ms animated)
- **Hero demo:** current behavior preserved — state machine still cycles, full text appears instantly, no cursor/pulse. Phase 6 just ensures the static waveform frame looks intentional
- **Scroll animations:** existing ScrollReveal + Motion v12 LazyMotion already respect prefers-reduced-motion — no changes needed

### Claude's Discretion
- Exact Tailwind utility classes or CSS custom properties for glass tiers (could be reusable utility classes or per-component)
- Hero glass overlay sizing and padding (how much of the hero content it wraps)
- Waveform 3-phase timing relative to useHeroDemoState durations (loose sync, not locked)
- Whether glass styles are extracted into a shared component/utility or applied inline per component
- Performance optimization approach (will-change hints, compositor layers, etc.)

</decisions>

<specifics>
## Specific Ideas

- Two-tier glass system creates visual hierarchy: nav + hero feel like primary glass panels, cards feel like secondary frosted elements
- Hero glass overlay creates depth: waveform → glass → content. The glass makes text pop while waveform shows through as soft background motion
- Waveform quick-rise (~300ms) mimics real dictation: instant recording start. Slow calm (~800ms) mimics transcription completing
- Light mode glass uses white frosted panels (not tinted), keeping it neutral and aligned with iOS aesthetic

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAnimationFrame` hook (src/hooks/useAnimationFrame.ts): Already used by Waveform, can drive the choreography phases
- `useReducedMotion` (motion/react): Already used in Hero/Waveform for reduced-motion detection
- `useHeroDemoState` (src/hooks/useHeroDemoState.ts): State machine with idle/recording/transcribing/smart/inserted — waveform loosely syncs but doesn't depend on it
- Color lerp utilities in Waveform.tsx (hexToRgb, lerpRgb, smoothstep): Reusable for any smooth color transitions
- MutationObserver pattern in Waveform.tsx: Already watches .dark class for theme changes with 300ms color lerp

### Established Patterns
- Tailwind v4 @theme tokens in globals.css: Single source of truth for design tokens — glass tokens should follow same pattern
- `bg-surface/50 backdrop-blur-md`: Current card glass pattern across Features, DataFlow, TextReveal — upgrade to tiered glass values
- Theme-aware CSS custom properties (--theme-waveform-*): Waveform already reads colors from CSS variables — extend pattern for glass values if needed
- ScrollReveal + Motion v12 LazyMotion: Scroll-triggered animations already in place, reduced-motion already handled

### Integration Points
- `Nav.tsx` (line 22-24): Scrolled state already toggles backdrop-blur — upgrade blur value and add saturate + gradient border
- `Hero.tsx`: Wrap content div (line 32) in glass overlay panel. Waveform canvas stays at z-index below glass
- `Waveform.tsx`: Replace continuous sinusoidal processingEnergy with 3-phase choreography (flat/active/calm). Core render loop (drawBars) stays, energy source changes
- `Features.tsx`, `DataFlow.tsx`, `HowItWorks.tsx`, `OpenSource.tsx`, `Community.tsx`, `TextReveal.tsx`: Upgrade existing card styling to Tier 2 glass
- `globals.css`: May need new glass-related CSS custom properties for theme-aware glass backgrounds/borders

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-visual-effects*
*Context gathered: 2026-03-12*

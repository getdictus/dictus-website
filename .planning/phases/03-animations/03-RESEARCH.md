# Phase 3: Animations - Research

**Researched:** 2026-03-09
**Domain:** Motion animations, Canvas API, scroll-triggered reveals, accessibility
**Confidence:** HIGH

## Summary

Phase 3 transforms the static Dictus landing page into a living product demo. The hero section gets a canvas-based sinusoidal waveform, word-by-word text reveal with glassmorphism input field, and a state micro-animation cycling through dictation modes. All other sections gain scroll-triggered fade/slide reveals. Every animation must respect `prefers-reduced-motion`.

The project already has `motion` v12 installed (`^12.35.2`). The recommended approach is LazyMotion with `domAnimation` features (~4.6kb) for scroll reveals, combined with raw Canvas API + `requestAnimationFrame` for the waveform (which needs per-frame rendering that Motion cannot provide). Motion's built-in `useReducedMotion` hook handles accessibility detection without additional dependencies.

**Primary recommendation:** Use Motion v12 LazyMotion/m components for scroll reveals and text animation orchestration. Use a standalone Canvas component with `useRef` + `requestAnimationFrame` for the waveform. Wire both systems to `useReducedMotion` for accessibility.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Canvas-based rendering (not SVG) for sinusoidal waveform via requestAnimationFrame
- 2-3 overlapping sine waves at different frequencies/amplitudes with varying opacity
- Subtle ambient intensity: ~10-20% opacity with soft glow, behind hero text
- Continuous loop waveform, not tied to dictation sequence
- Replaces the current static 3-bar SVG in hero
- Uses accent blue (#3D7EFF) / accent hi (#6BA3FF) / sky (#93C5FD) palette
- Word-by-word text in glassmorphism input field container (6th blur element, DSGN-03 limit)
- Loops through 3-4 bilingual sentences, cycling continuously
- Natural speech pace: ~200-300ms per word with slight variation
- Blinking cursor at insertion point
- Fade + slide up (~30-50px) for scroll reveals
- Stagger children within sections (~100-150ms apart)
- Trigger at ~20% viewport threshold, play once only
- Uses Motion v12 with LazyMotion
- State micro-animation: colored dot + text label, 5 states, ~8-10s cycle
- Loosely synced with text reveal
- All animations disabled/simplified for prefers-reduced-motion

### Claude's Discretion
- Exact sine wave frequencies, amplitudes, and phase offsets for the 2-3 layers
- Canvas sizing and responsive scaling approach
- Demo sentence content (the actual example phrases in FR and EN)
- Exact stagger timing and easing curves for scroll animations
- Motion v12 LazyMotion feature bundle strategy (domAnimation vs domMax)
- How to coordinate the loose sync between state cycle and text reveal timing
- Exact slide distance (within 30-50px range) and animation duration for scroll reveals

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-02 | Animated sinusoidal waveform simulating real-time transcription in hero | Canvas API + requestAnimationFrame pattern, sine wave math, responsive canvas sizing |
| HERO-03 | Word-by-word text appearing alongside waveform, demonstrating dictation | setInterval/setTimeout timing, glassmorphism CSS, i18n sentence cycling, cursor animation |
| ANIM-01 | Sections fade/slide into view on scroll | Motion v12 LazyMotion + m.div + whileInView with once + viewport amount |
| ANIM-02 | Micro-animation cycling through 5 dictus states | State machine with timed transitions, CSS pulse animation, brand kit state colors |
| ANIM-03 | Animations respect prefers-reduced-motion | Motion useReducedMotion hook, conditional canvas behavior, CSS media query fallback |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.35.2 | Scroll reveals, animation orchestration | Already installed; LazyMotion reduces bundle to ~4.6kb; built-in whileInView, useReducedMotion |
| Canvas API (native) | N/A | Sinusoidal waveform rendering | requestAnimationFrame for 60fps sine waves; no library needed for this use case |
| next-intl | ^4.8.3 | Demo sentence translations | Already installed; useTranslations works in both client and server components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | No additional dependencies needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas API | SVG + SMIL/CSS animations | SVG struggles with smooth multi-wave sinusoidal at 60fps; Canvas chosen per user decision |
| Raw Canvas | react-waves, wavesurfer.js | Overkill for 2-3 decorative sine waves; adds bundle weight |
| Motion whileInView | Intersection Observer + CSS | More boilerplate; Motion already installed and provides stagger support |

**Installation:**
```bash
# No new packages needed -- motion and next-intl already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    Hero/
      Hero.tsx              # Reworked: orchestrates waveform + text reveal + state indicator
      Waveform.tsx          # NEW: Canvas waveform component ("use client")
      TextReveal.tsx        # NEW: Word-by-word text with glassmorphism input ("use client")
      StateIndicator.tsx    # NEW: Micro-animation dot + label cycling ("use client")
    shared/
      ScrollReveal.tsx      # NEW: Reusable scroll-triggered wrapper ("use client")
      MotionProvider.tsx    # NEW: LazyMotion provider ("use client")
  hooks/
    useAnimationFrame.ts    # NEW: Custom hook for requestAnimationFrame loop
    useReducedMotion.ts     # Re-export from motion/react (or custom if needed)
```

### Pattern 1: LazyMotion Provider
**What:** Wrap app with LazyMotion to enable tree-shaken m.* components
**When to use:** Once, at the layout or page level
**Example:**
```typescript
// Source: https://motion.dev/docs/react-lazy-motion
"use client";
import { LazyMotion, domAnimation } from "motion/react";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
```

**Recommendation: Use `domAnimation` (not `domMax`).** domMax adds layout animations and drag -- neither needed for this phase. domAnimation covers: animate, whileInView, whileHover, whileTap, exit, variants, stagger -- everything needed.

### Pattern 2: Scroll Reveal Wrapper
**What:** Reusable client component that wraps server-rendered content with fade+slide animation
**When to use:** Around every section component (Features, HowItWorks, DataFlow, etc.)
**Example:**
```typescript
"use client";
import { m } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function ScrollReveal({ children, className }: Props) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </m.div>
  );
}
```

### Pattern 3: Canvas Animation Hook
**What:** Custom hook encapsulating requestAnimationFrame loop with cleanup
**When to use:** For the waveform canvas component
**Example:**
```typescript
import { useRef, useEffect, useCallback } from "react";

export function useAnimationFrame(callback: (time: number) => void, isActive: boolean) {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        callback(time);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, animate]);
}
```

### Pattern 4: Reduced Motion Integration
**What:** Motion's built-in hook to detect prefers-reduced-motion
**When to use:** In every animation component to conditionally disable/simplify
**Example:**
```typescript
// Source: https://motion.dev/docs/react-use-reduced-motion
import { useReducedMotion } from "motion/react";

function Waveform() {
  const shouldReduce = useReducedMotion();
  // If shouldReduce: render static or very slow opacity pulse only
  // If not: render full requestAnimationFrame animation
}
```

### Pattern 5: Server Components with Client Wrappers
**What:** Existing server components (Features, HowItWorks, etc.) stay as server components; ScrollReveal wraps them from the page level
**When to use:** For scroll reveals on all section components
**Key insight:** `useTranslations` from next-intl works in both client and server components. However, sections do NOT need `"use client"` -- the ScrollReveal wrapper is the client boundary, and sections render as children (server components can be children of client components in Next.js App Router).
**Example:**
```typescript
// page.tsx -- sections stay server, wrapped by client ScrollReveal
<MotionProvider>
  <Hero />  {/* Hero itself becomes "use client" due to Canvas/animations */}
  <ScrollReveal><Features /></ScrollReveal>
  <ScrollReveal><HowItWorks /></ScrollReveal>
  <ScrollReveal><DataFlow /></ScrollReveal>
  <ScrollReveal><OpenSource /></ScrollReveal>
  <ScrollReveal><Community /></ScrollReveal>
  <Footer />  {/* Footer may not need scroll reveal */}
</MotionProvider>
```

### Anti-Patterns to Avoid
- **Converting all sections to client components:** Unnecessary -- use client wrapper pattern instead. Only Hero subcomponents need "use client".
- **Using motion.div instead of m.div:** motion.div loads the full Motion bundle. m.div only works within LazyMotion and enables tree-shaking.
- **Putting LazyMotion inside each component:** Wasteful -- one provider at page/layout level.
- **Using setInterval for canvas animation:** Always use requestAnimationFrame -- it syncs with display refresh, pauses when tab inactive, and is more performant.
- **Forgetting cancelAnimationFrame on cleanup:** Memory leak. Always cancel in useEffect cleanup.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll detection | Custom IntersectionObserver wrapper | Motion `whileInView` / `viewport` prop | Built-in, handles threshold, once, cleanup |
| Reduced motion detection | Custom matchMedia hook | `useReducedMotion` from `motion/react` | Already bundled with Motion, reactive to changes |
| Animation stagger | Manual delay calculation per child | Motion `staggerChildren` in transition | Declarative, handles dynamic child counts |
| Easing functions | Custom bezier math | Motion built-in easings (`easeOut`, `easeInOut`) | Proven curves, readable code |

**Key insight:** Motion v12 handles scroll reveals, stagger, reduced motion, and easing out of the box. The only custom code needed is the Canvas waveform and the timing orchestration for the hero demo sequence.

## Common Pitfalls

### Pitfall 1: Canvas not responsive
**What goes wrong:** Canvas has fixed pixel dimensions; looks blurry on retina or wrong size on resize.
**Why it happens:** Canvas width/height attributes set pixel buffer size, not CSS display size.
**How to avoid:** Set canvas CSS size with Tailwind (w-full, h-full), then set `canvas.width = canvas.clientWidth * devicePixelRatio` and `canvas.height = canvas.clientHeight * devicePixelRatio`, and scale the context with `ctx.scale(devicePixelRatio, devicePixelRatio)`. Listen for resize events with a ResizeObserver.
**Warning signs:** Blurry waveform, waveform not filling container.

### Pitfall 2: LazyMotion strict mode
**What goes wrong:** Using `<motion.div>` inside LazyMotion throws a warning or loads full bundle.
**Why it happens:** LazyMotion requires `m.div` (the lightweight proxy), not `motion.div`.
**How to avoid:** Always import `m` from `motion/react` when inside LazyMotion. Use `motion.div` only outside LazyMotion (which we should not have).
**Warning signs:** Bundle size larger than expected, console warnings about feature loading.

### Pitfall 3: Scroll reveal flicker on initial load
**What goes wrong:** Content briefly visible then disappears as initial={opacity:0} applies.
**Why it happens:** Hydration delay means content renders from SSR before client JS hides it.
**How to avoid:** Apply `initial={{ opacity: 0 }}` in CSS as well (e.g., via className), or use a layout approach where the initial state matches the SSR output. Alternatively, set elements above-the-fold (Hero) to not use scroll reveal at all (Hero has its own animations).
**Warning signs:** Flash of content then fade-in on page load.

### Pitfall 4: Multiple requestAnimationFrame loops
**What goes wrong:** Performance degradation from multiple independent rAF loops.
**Why it happens:** Each animated component starts its own loop.
**How to avoid:** For this phase, only the waveform needs rAF. Text reveal and state indicator use setInterval/setTimeout (much lower frequency, ~200-300ms). Keep rAF to one loop only.
**Warning signs:** Dropped frames, high CPU usage in Performance tab.

### Pitfall 5: Glassmorphism blur count exceeding DSGN-03
**What goes wrong:** Adding the text input glassmorphism field pushes to 6 blur elements (the limit).
**Why it happens:** 5 existing blur elements (4 feature cards + 1 DataFlow) + 1 new text field = 6.
**How to avoid:** The text input field is the 6th and final allowed blur element. Do not add any more. If scroll reveals or state indicators need glass effects, use border + background only (no backdrop-blur).
**Warning signs:** Mobile performance degradation (jank, low FPS) if exceeded.

### Pitfall 6: Text reveal sentence cycling memory leak
**What goes wrong:** setInterval/setTimeout not cleaned up on unmount.
**Why it happens:** Forgetting cleanup in useEffect return.
**How to avoid:** Store interval/timeout IDs in refs; clear them in useEffect cleanup. Also clear on reduced-motion changes.
**Warning signs:** Console errors about state updates on unmounted components.

## Code Examples

### Sinusoidal Waveform Drawing (Canvas)
```typescript
// Core drawing function for 2-3 overlapping sine waves
function drawWaves(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.clearRect(0, 0, width, height);

  const waves = [
    { freq: 0.02, amp: 0.3, speed: 0.001, color: "#3D7EFF", opacity: 0.15 },  // accent blue
    { freq: 0.015, amp: 0.25, speed: 0.0008, color: "#6BA3FF", opacity: 0.12 }, // accent hi
    { freq: 0.025, amp: 0.2, speed: 0.0012, color: "#93C5FD", opacity: 0.10 },  // sky
  ];

  const centerY = height / 2;

  for (const wave of waves) {
    ctx.beginPath();
    ctx.strokeStyle = wave.color;
    ctx.globalAlpha = wave.opacity;
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x++) {
      const y = centerY + Math.sin(x * wave.freq + time * wave.speed) * (height * wave.amp);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
```

### Word-by-Word Reveal with Cursor
```typescript
// Simplified timing logic for word-by-word reveal
function useWordReveal(sentences: string[], wordsPerSecond: number = 4) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const shouldReduce = useReducedMotion();

  const words = sentences[sentenceIndex].split(" ");
  const visibleText = shouldReduce
    ? sentences[sentenceIndex]  // Show full sentence immediately
    : words.slice(0, wordCount).join(" ");

  useEffect(() => {
    if (shouldReduce) return;

    const baseDelay = 1000 / wordsPerSecond; // ~250ms at 4 words/sec
    const variation = (Math.random() - 0.5) * 100; // +/- 50ms for organic feel

    const timeout = setTimeout(() => {
      if (wordCount < words.length) {
        setWordCount((c) => c + 1);
      } else {
        // Pause, then advance to next sentence
        setTimeout(() => {
          setSentenceIndex((i) => (i + 1) % sentences.length);
          setWordCount(0);
        }, 1500); // Hold completed sentence for 1.5s
      }
    }, baseDelay + variation);

    return () => clearTimeout(timeout);
  }, [wordCount, sentenceIndex, shouldReduce, words.length, wordsPerSecond]);

  return { visibleText, sentenceIndex, isComplete: wordCount >= words.length };
}
```

### State Indicator Cycle
```typescript
// State machine for 5-state micro-animation
const STATES = [
  { key: "idle", color: "rgba(255,255,255,0.3)", pulse: false, duration: 1500 },
  { key: "recording", color: "#EF4444", pulse: true, duration: 2000 },
  { key: "transcribing", color: "#3D7EFF", pulse: true, duration: 2500 },
  { key: "smart", color: "#8B5CF6", pulse: true, duration: 2000 },
  { key: "inserted", color: "#22C55E", pulse: false, duration: 2000 },
] as const;
// Total cycle: ~10s, loops continuously
// "recording" aligns with text reveal starting, "inserted" with sentence complete
```

### Scroll Reveal with Stagger (Children)
```typescript
// Parent variant with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // 120ms between children
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Usage with m components inside LazyMotion
<m.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
>
  <m.div variants={childVariants}>Card 1</m.div>
  <m.div variants={childVariants}>Card 2</m.div>
  <m.div variants={childVariants}>Card 3</m.div>
</m.div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package | v11 (2024) | Import from `motion/react` not `framer-motion` |
| `motion.div` everywhere | `m.div` + LazyMotion | v4+ (stable) | ~50% bundle reduction with tree-shaking |
| Custom IntersectionObserver | `whileInView` + `viewport` prop | v6+ | Declarative, no boilerplate |
| Manual reduced-motion check | `useReducedMotion` from motion/react | v6+ | Reactive, auto-updates on OS change |

**Deprecated/outdated:**
- `import { motion } from "framer-motion"` -- use `import { m, LazyMotion, domAnimation } from "motion/react"` instead
- `useAnimation` + manual IntersectionObserver for scroll -- use `whileInView` directly

## Open Questions

1. **Hero component architecture: single file vs multiple files?**
   - What we know: Hero needs Canvas waveform, text reveal, state indicator -- three distinct interactive elements plus the existing headline/subtitle/badge
   - What's unclear: Whether to make Hero.tsx a client component orchestrating three sub-components, or keep sub-components independent
   - Recommendation: Split into sub-components (Waveform, TextReveal, StateIndicator) as client components. Hero.tsx becomes a client component that composes them. This keeps each concern isolated and testable.

2. **Loose sync mechanism between state indicator and text reveal**
   - What we know: State should roughly align (recording = text starts, inserted = text complete). Cycle is ~8-10s.
   - What's unclear: Whether to use a shared state/context, event bus, or just aligned timings
   - Recommendation: Use a shared custom hook (`useHeroDemoState`) that exposes the current demo phase and drives both components. Simpler than context, avoids drift from independent timers.

3. **MotionProvider placement: layout.tsx vs page.tsx**
   - What we know: LazyMotion needs to wrap all m.* components. Only one page exists.
   - What's unclear: Whether to put it in layout (wraps all routes) or page (wraps current page only)
   - Recommendation: Put in layout.tsx since Nav might benefit from motion in the future. Minimal cost -- LazyMotion is ~4.6kb regardless.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing + Lighthouse |
| Config file | none -- no automated test framework in project |
| Quick run command | `npm run build && npm run start` then browser check |
| Full suite command | Manual verification per success criteria |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-02 | Animated sinusoidal waveform in hero | manual-only | Visual browser inspection | N/A |
| HERO-03 | Word-by-word text with cursor | manual-only | Visual browser inspection | N/A |
| ANIM-01 | Scroll-triggered section reveals | manual-only | Scroll test in browser | N/A |
| ANIM-02 | State micro-animation cycling 5 states | manual-only | Visual timing check | N/A |
| ANIM-03 | Reduced motion respected | manual-only | Toggle OS setting + verify | N/A |

**Justification for manual-only:** All requirements are visual/animation behaviors that require human verification. No logic-heavy code paths that benefit from unit tests. The waveform draw function could be unit-tested for output, but the value is low compared to visual inspection.

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors, import issues)
- **Per wave merge:** Full visual review in browser (desktop + mobile viewport)
- **Phase gate:** All 5 success criteria verified manually before `/gsd:verify-work`

### Wave 0 Gaps
None -- no test infrastructure needed for manual visual verification. Build verification (`npm run build`) already works.

## Sources

### Primary (HIGH confidence)
- [Motion LazyMotion docs](https://motion.dev/docs/react-lazy-motion) - LazyMotion, domAnimation vs domMax, m component, bundle size
- [Motion useInView docs](https://motion.dev/docs/react-use-in-view) - whileInView, viewport options (once, amount)
- [Motion useReducedMotion docs](https://motion.dev/docs/react-use-reduced-motion) - Accessibility hook API
- [Motion installation docs](https://motion.dev/docs/react-installation) - Import paths, Next.js setup
- [next-intl server/client components](https://next-intl.dev/docs/environments/server-client-components) - useTranslations works in both environments

### Secondary (MEDIUM confidence)
- [Canvas animation in React](https://dev.to/ptifur/animation-with-canvas-and-requestanimationframe-in-react-5ccj) - useRef + useEffect + rAF pattern
- [requestAnimationFrame with React hooks](https://css-tricks.com/using-requestanimationframe-with-react-hooks/) - Hook pattern, cleanup
- [Josh Comeau prefers-reduced-motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - Accessibility best practices

### Tertiary (LOW confidence)
- Sine wave parameter values (frequencies, amplitudes) - will need tuning through visual iteration; starting values in code examples are reasonable estimates

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - motion v12 already installed, Canvas API is browser-native, no new deps
- Architecture: HIGH - patterns well-established (LazyMotion wrapper, client component composition, rAF hooks)
- Pitfalls: HIGH - canvas responsiveness, blur count, cleanup patterns are well-documented concerns
- Waveform parameters: MEDIUM - sine wave frequencies/amplitudes will need visual tuning; math is standard

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable domain, Motion v12 is mature)

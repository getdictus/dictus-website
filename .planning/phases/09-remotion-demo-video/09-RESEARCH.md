# Phase 9: Remotion Demo Video - Research

**Researched:** 2026-03-19
**Domain:** Programmatic video generation with Remotion + React
**Confidence:** HIGH

## Summary

Remotion 4.x is the standard tool for creating videos programmatically with React. The project needs an isolated Remotion workspace that renders two bilingual MP4 demo videos showing the dictus voice dictation flow with an iPhone mockup. The core challenge is porting the existing canvas-based waveform (460 LOC in `Waveform.tsx`) to Remotion's deterministic frame-based rendering model, where `useCurrentFrame()` replaces `requestAnimationFrame`.

The project uses React 19.2.3 and Next.js 16.1.6. Remotion 4.0.236+ fully supports React 19 with aligned types. The workspace must be isolated with its own `package.json` and `tsconfig.json` to avoid Webpack/bundler conflicts with Next.js. A critical finding: the `tsconfig.json` `paths` alias `@/*` maps to `./src/*`, meaning a root `remotion/` folder will NOT conflict with `import from "remotion"` (the concern in STATE.md is resolved -- no path alias intercepts bare `remotion` imports). However, the root `tsconfig.json` includes `**/*.ts` and `**/*.tsx` which would pull in Remotion files -- the Remotion workspace needs its own `tsconfig.json` and should be excluded from the root config.

**Primary recommendation:** Create a `video/` workspace directory (avoiding any ambiguity with the `remotion` npm package), install `remotion@^4.0.436` + `@remotion/cli` + `@remotion/renderer` with their own React 19 peer deps, port the waveform drawing logic to frame-driven rendering, and use `npx remotion render` for MP4 output + `npx remotion still` for poster images.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Render **two mockup variants** for comparison: realistic device frame AND screen-only (rounded rectangle) -- user picks after reviewing
- Messages scene: iMessage-style UI with dictus keyboard, short everyday phrase
- Notes scene: Apple Notes-style UI, longer dictated text, horizontal slide transition between scenes
- Demo flow uses **4 states** (NOT 5): idle -> recording -> transcribing -> inserted (no smart mode)
- State colors: idle=rgba(255,255,255,0.3), recording=#EF4444, transcribing=#3D7EFF, inserted=#22C55E
- Waveform: 30 bars, center-weighted gradient, edge opacity (matching hero canvas)
- Dark background (#0A1628) with subtle radial blue gradient (glow-soft)
- **Two separate MP4 renders**: FR and EN, all visible text localized
- Must loop seamlessly for autoplay on landing page

### Claude's Discretion
- Video resolution and aspect ratio (optimize for landing page section)
- Total duration (optimize for content pacing and loop feel)
- Branding level (logo, tagline presence, placement)
- Caption/label design during demo states
- Exact text content for dictated phrases
- Contact name in Messages conversation
- Notes content topic

### Deferred Ideas (OUT OF SCOPE)
- Smart mode (5th state, purple #8B5CF6) -- feature not yet implemented in app
- Localized voiceover versions (VID-F02)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VID-01 | Workspace Remotion separe (subfolder) avec toolchain isolee du projet Next.js | Remotion brownfield docs confirm: own package.json, own tsconfig.json, entry point with registerRoot(). Use `video/` directory name. |
| VID-02 | Port fidele de la waveform canvas vers Remotion (30 barres, gradient center-weighted, 5 etats) | NOTE: CONTEXT.md overrides to 4 states (no smart mode). Port `computeBarLayout()`, `resolveBarColor()`, `computePhaseEnergy()` from Waveform.tsx, replace `requestAnimationFrame` with `useCurrentFrame()` + deterministic math. |
| VID-03 | Mockup iPhone avec les scenes de demo | Use Remotion `<Sequence>` for scene orchestration. Two scenes (Messages + Notes) with horizontal slide transition. Two mockup variants (realistic frame + screen-only). |
| VID-04 | Animations iOS-native (spring animations, transitions fluides) | Remotion `spring()` with iOS-like config: `{ mass: 1, damping: 15-20, stiffness: 120-180, overshootClamping: false }`. Use `interpolate()` for position/opacity mapping. |
| VID-05 | Rendu MP4 final optimise pour le web (h264, taille raisonnable) | `npx remotion render` with `--codec h264 --crf 18`. Poster via `npx remotion still`. Target < 5MB per video. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| remotion | ^4.0.436 | Core video framework | Only mature React-based video renderer |
| @remotion/cli | ^4.0.436 | Studio preview + render CLI | Required for `npx remotion studio` and `npx remotion render` |
| @remotion/renderer | ^4.0.436 | Programmatic render API | Needed for script-based rendering (optional, CLI suffices) |
| react | 19.2.3 | UI framework | Match project version, Remotion 4.0.236+ supports React 19 |
| react-dom | 19.2.3 | DOM rendering | Peer dep of remotion |
| typescript | ^5 | Type checking | Match project version |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @remotion/tailwind | ^4.0.436 | Tailwind in Remotion | If reusing Tailwind classes from main project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas API in Remotion | SVG rects | SVG simpler for static bars but canvas matches existing code exactly |
| Custom spring math | Remotion spring() | Remotion spring() is deterministic per-frame -- use it |
| motion/react (framer) | Remotion spring() | motion/react is imperative/time-based, incompatible with Remotion's frame model |

**Installation (in video/ directory):**
```bash
npm init -y
npm install remotion @remotion/cli react@19.2.3 react-dom@19.2.3 typescript @types/react @types/react-dom
```

## Architecture Patterns

### Recommended Project Structure
```
video/
  package.json            # Isolated deps (remotion, react 19)
  tsconfig.json           # Separate TS config, no Next.js plugin
  remotion.config.ts      # Remotion bundler config (optional)
  src/
    index.ts              # registerRoot() entry point
    Root.tsx              # <Composition> definitions (FR + EN)
    compositions/
      DictusDemo.tsx      # Main composition component
    components/
      Waveform.tsx        # Ported waveform (frame-driven)
      IPhoneMockup.tsx    # Device frame component (two variants)
      MessagesScene.tsx   # iMessage UI scene
      NotesScene.tsx      # Apple Notes UI scene
      DictusKeyboard.tsx  # iOS keyboard with waveform bar
      StateIndicator.tsx  # Recording/transcribing pill
      TextReveal.tsx      # Text appearance animation
    lib/
      colors.ts           # Brand color constants (from CLAUDE.md)
      i18n.ts             # FR/EN text content
      waveform-math.ts    # Pure functions: computeBarLayout, resolveBarColor, computePhaseEnergy
```

### Pattern 1: Frame-Driven Animation (replacing requestAnimationFrame)
**What:** All animations derive from `useCurrentFrame()` -- no timers, no RAF, no state
**When to use:** Every animated element in Remotion
**Example:**
```typescript
// Source: https://www.remotion.dev/docs/the-fundamentals
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const AnimatedElement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation starting at frame 0
  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 150 } });

  // Map spring 0->1 to opacity 0->1
  const opacity = interpolate(scale, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return <div style={{ transform: `scale(${scale})`, opacity }} />;
};
```

### Pattern 2: Scene Sequencing with `<Sequence>`
**What:** Time-shift scenes so each starts at the right frame
**When to use:** Orchestrating the Messages -> Notes flow
**Example:**
```typescript
import { Sequence, AbsoluteFill } from "remotion";

export const DictusDemo: React.FC = () => {
  // Scene 1: Messages (frames 0-299 at 30fps = 10s)
  // Scene 2: Notes (frames 300-599 = 10s)
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      <Sequence from={0} durationInFrames={300} name="Messages Scene">
        <MessagesScene />
      </Sequence>
      <Sequence from={300} durationInFrames={300} name="Notes Scene">
        <NotesScene />
      </Sequence>
    </AbsoluteFill>
  );
};
```

### Pattern 3: Deterministic Waveform Rendering
**What:** Port the canvas waveform to frame-based computation (no lerp/decay over real time)
**When to use:** The waveform bars that must match the hero canvas visually
**Example:**
```typescript
// Convert time-based smoothing to frame-based
// Original: displayLevels[i] = current + (target - current) * 0.3
// Remotion: compute target energy purely from frame number

function computeWaveformState(frame: number, fps: number, stateStart: number) {
  const elapsed = (frame - stateStart) / fps; // seconds since state start
  // Use elapsed to drive phase energy deterministically
  // No refs, no mutation -- pure function of frame
}
```

### Pattern 4: Bilingual Composition via Props
**What:** Single composition component parametrized by locale
**When to use:** Rendering FR and EN variants from the same code
**Example:**
```typescript
// Root.tsx
import { Composition } from "remotion";

export const Root: React.FC = () => (
  <>
    <Composition
      id="dictus-demo-fr"
      component={DictusDemo}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ locale: "fr" }}
    />
    <Composition
      id="dictus-demo-en"
      component={DictusDemo}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ locale: "en" }}
    />
  </>
);
```

### Anti-Patterns to Avoid
- **Using useState/useEffect for animation:** Remotion renders each frame independently. State and effects will not persist between frames during render. Use `useCurrentFrame()` only.
- **Using requestAnimationFrame:** The existing waveform uses RAF -- this must be replaced with frame-derived math.
- **Using timers (setTimeout/setInterval):** Same issue. Convert durations to frame counts: `frames = seconds * fps`.
- **Importing from main project `src/`:** Keep the Remotion workspace fully isolated. Copy/port the waveform math functions, don't import them.
- **Using `motion/react` (framer-motion):** Incompatible with Remotion's rendering model. Use Remotion's `spring()` and `interpolate()` instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spring physics | Custom spring solver | `spring()` from remotion | Deterministic, configurable, battle-tested |
| Value mapping | Manual math | `interpolate()` from remotion | Handles clamping, extrapolation, multi-range |
| Scene timing | Frame counting | `<Sequence from={} durationInFrames={}>` | Automatic frame shifting, clean nesting |
| Color interpolation | Manual RGB lerp | `interpolateColors()` from remotion | Handles color spaces properly |
| Video encoding | ffmpeg CLI | `npx remotion render --codec h264` | Handles frame stitching, audio, codec config |
| Still/poster | Screenshot | `npx remotion still` | Renders specific frame as PNG at full quality |

**Key insight:** Remotion provides a complete animation and rendering toolkit. The existing waveform code has valuable *math* (bar layout, color gradients, phase energy) but the *animation driver* (RAF, lerp, decay) must be completely replaced with Remotion's frame-based primitives.

## Common Pitfalls

### Pitfall 1: Bundler Conflict with Next.js
**What goes wrong:** Remotion uses its own webpack bundler. If installed in the main project, it conflicts with Next.js's bundler.
**Why it happens:** Shared node_modules, conflicting webpack configs
**How to avoid:** Fully isolated `video/` directory with own `package.json` and `node_modules`. Add `video/` to root `.gitignore` for `node_modules` and to root `tsconfig.json` exclude.
**Warning signs:** "Cannot resolve module" errors, webpack version conflicts

### Pitfall 2: Non-Deterministic Animations
**What goes wrong:** Animations look different in preview vs. render, or vary between runs
**Why it happens:** Using `Math.random()`, `Date.now()`, or `performance.now()` instead of frame-based computation
**How to avoid:** All randomness must be seeded from frame number. Use `random()` utility from remotion (provides deterministic random based on seed).
**Warning signs:** Flickering bars, inconsistent waveform between studio preview and final render

### Pitfall 3: Import Path Collision
**What goes wrong:** `import { ... } from "remotion"` resolves to the `remotion/` folder instead of the npm package
**Why it happens:** TypeScript path resolution or folder name matching bare specifier
**How to avoid:** Name the workspace directory `video/` (not `remotion/`). The root tsconfig `paths` only has `@/*` -> `./src/*` so bare `remotion` imports are safe, but using `video/` removes all ambiguity.
**Warning signs:** "Module not found" or "remotion is not a module" errors

### Pitfall 4: File Size Exceeding Budget
**What goes wrong:** Rendered MP4 exceeds the 5MB target
**Why it happens:** High resolution, long duration, low CRF (high quality)
**How to avoid:** Start with CRF 18-22, use `--x264-preset medium`. If too large: reduce duration, increase CRF, or scale down resolution. A 20-second 1080x1920 video at CRF 20 typically lands around 2-4MB for simple UI animations.
**Warning signs:** File size > 3MB at halfway point of content complexity

### Pitfall 5: Seamless Loop Failure
**What goes wrong:** Visible jump/cut when video loops
**Why it happens:** Last frame doesn't match first frame state, or animation hasn't fully settled
**How to avoid:** Design the state machine so the last state (inserted) transitions back to idle with a fade/dissolve. Ensure frame 0 and the last frame have identical visual state. Test with `--loop` flag in a browser `<video>` element.
**Warning signs:** Pop or flash at loop point during preview

### Pitfall 6: React 19 Type Mismatches
**What goes wrong:** TypeScript errors about ref types or JSX element types
**Why it happens:** Older Remotion versions have React 18-aligned types
**How to avoid:** Use Remotion 4.0.236+ which aligned types with React 19. Pin `@types/react@^19` in the video workspace.
**Warning signs:** "Type 'RefObject<X>' is not assignable to..." errors

## Code Examples

### Porting the Waveform: Pure Math Functions
```typescript
// Source: Derived from src/components/Hero/Waveform.tsx
// video/src/lib/waveform-math.ts

const BAR_COUNT = 30;
const BAR_SPACING = 3;

export function computeBarLayout(width: number) {
  const totalSpacing = BAR_SPACING * (BAR_COUNT - 1);
  const totalBarWidth = width * 0.6;
  const barWidth = Math.max((totalBarWidth - totalSpacing) / BAR_COUNT, 2);
  const actualTotalWidth = barWidth * BAR_COUNT + BAR_SPACING * (BAR_COUNT - 1);
  const offsetX = (width - actualTotalWidth) / 2;
  return { barWidth, offsetX, BAR_COUNT, BAR_SPACING };
}

export function resolveBarColor(index: number, barCount: number = BAR_COUNT): {
  type: "gradient" | "edge";
  opacity?: number;
} {
  const center = (barCount - 1) / 2;
  const distanceFromCenter = Math.abs(index - center) / center;
  if (distanceFromCenter < 0.4) {
    return { type: "gradient" };
  } else {
    const opacity = (1.0 - distanceFromCenter) * 0.9 + 0.15;
    return { type: "edge", opacity };
  }
}

// Deterministic "random" amplitudes from frame number
export function generateActiveTargets(frame: number, seed: number = 0): number[] {
  const targets: number[] = [];
  const center = (BAR_COUNT - 1) / 2;
  for (let i = 0; i < BAR_COUNT; i++) {
    // Seeded pseudo-random based on frame + bar index
    const hash = Math.sin((frame * 0.1 + i * 7.3 + seed) * 43758.5453) % 1;
    const rand = Math.abs(hash);
    const distFromCenter = Math.abs(i - center) / center;
    const centerBonus = (1 - distFromCenter) * 0.15;
    targets.push(0.3 + rand * 0.6 + centerBonus);
  }
  return targets;
}
```

### Frame-Driven Waveform Component
```typescript
// video/src/components/Waveform.tsx
import { useCurrentFrame, useVideoConfig } from "remotion";

type DemoState = "idle" | "recording" | "transcribing" | "inserted";

interface WaveformProps {
  state: DemoState;
  stateStartFrame: number;
  width: number;
  height: number;
}

export const Waveform: React.FC<WaveformProps> = ({
  state, stateStartFrame, width, height
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = (frame - stateStartFrame) / fps; // seconds

  // Compute bar energies deterministically from frame
  const energies = computeEnergies(state, frame, stateStartFrame, fps);

  return (
    <canvas
      ref={(canvas) => {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Draw bars using energies (same logic as hero waveform)
        drawWaveformBars(ctx, energies, width, height);
      }}
      width={width}
      height={height}
    />
  );
};
```

### iOS-Native Spring Config
```typescript
// Remotion spring configs that feel iOS-native
export const iosSpringConfig = {
  // Standard iOS transition (UIView.animate equivalent)
  standard: { mass: 1, damping: 18, stiffness: 150, overshootClamping: false },
  // Bouncy (keyboard appearance)
  bouncy: { mass: 0.8, damping: 12, stiffness: 180, overshootClamping: false },
  // Gentle (fade/slide)
  gentle: { mass: 1, damping: 20, stiffness: 100, overshootClamping: true },
};
```

### Render Commands
```bash
# Preview in Remotion Studio
cd video && npx remotion studio src/index.ts

# Render FR video
npx remotion render src/index.ts dictus-demo-fr ../public/videos/demo-fr.mp4 \
  --codec h264 --crf 20 --x264-preset medium

# Render EN video
npx remotion render src/index.ts dictus-demo-en ../public/videos/demo-en.mp4 \
  --codec h264 --crf 20 --x264-preset medium

# Render poster images (first frame or a specific frame)
npx remotion still src/index.ts dictus-demo-fr ../public/videos/poster-fr.png --frame 45
npx remotion still src/index.ts dictus-demo-en ../public/videos/poster-en.png --frame 45
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Remotion 3.x | Remotion 4.x (v4.0.436) | 2024 | New props editor, mandatory defaultProps, React 19 support |
| React 18 types | React 19 types aligned | v4.0.236 | No more ref type errors with React 19 |
| Manual frame math | `spring()` with `durationInFrames` | v4.0 | Easier to control animation duration precisely |

**Deprecated/outdated:**
- Remotion Player in production: Out of scope per REQUIREMENTS.md (bundle +150-250KB). Use static `<video>` tag instead.
- `@remotion/eslint-plugin`: Optional, recommended for catching non-deterministic patterns.

## Open Questions

1. **Optimal video dimensions for landing page embed**
   - What we know: Phone mockup suggests vertical/portrait orientation (1080x1920 or similar). Landing page section width unknown until Phase 10.
   - What's unclear: Whether a 9:16 vertical video or a wider composition (e.g., 16:9 with phone centered on dark bg) works better for the landing page layout.
   - Recommendation: Use 1080x1920 (9:16) portrait for phone-centric framing. Phase 10 can letterbox/scale as needed. This is Claude's discretion per CONTEXT.md.

2. **Video duration for seamless loop**
   - What we know: Two scenes (Messages + Notes), 4 states each (idle/recording/transcribing/inserted). Original hero timing: 1500+2500+2000+2500 = 8.5s per cycle.
   - What's unclear: Whether two full cycles (17s) is too long for a landing page video.
   - Recommendation: ~12-16 seconds total (slightly compressed timing). Short enough to not bore, long enough to show both scenes.

3. **Workspace folder naming**
   - What we know: STATE.md raised concern about `remotion/` conflicting with `import from "remotion"`. Root tsconfig `paths` only maps `@/*`, so bare `remotion` imports resolve to node_modules correctly.
   - Recommendation: Use `video/` directory name to remove all ambiguity. Add to root tsconfig `exclude` array.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual visual validation + CLI render verification |
| Config file | None -- Remotion videos are validated visually |
| Quick run command | `cd video && npx remotion studio src/index.ts` |
| Full suite command | `cd video && npx remotion render src/index.ts dictus-demo-fr out/test.mp4 --codec h264` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VID-01 | Isolated workspace with own package.json | smoke | `cd video && node -e "require('remotion')"` | No -- Wave 0 |
| VID-02 | Waveform 30 bars, center gradient, 4 states | manual-only | Visual check in Remotion Studio | N/A |
| VID-03 | iPhone mockup with Messages + Notes scenes | manual-only | Visual check in Remotion Studio | N/A |
| VID-04 | iOS-native spring animations | manual-only | Visual check in Remotion Studio | N/A |
| VID-05 | MP4 render < 5MB, H.264 | smoke | `cd video && npx remotion render src/index.ts dictus-demo-fr out/test.mp4 --codec h264 && ls -la out/test.mp4` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd video && npx remotion studio src/index.ts` (visual preview)
- **Per wave merge:** Full render of both FR + EN compositions
- **Phase gate:** Both MP4s + poster PNGs exist in `public/videos/`, each < 5MB

### Wave 0 Gaps
- [ ] `video/package.json` -- Remotion workspace initialization
- [ ] `video/tsconfig.json` -- Isolated TypeScript config
- [ ] `video/src/index.ts` -- Entry point with registerRoot()
- [ ] Root `tsconfig.json` update: add `"video"` to exclude array
- [ ] `public/videos/` directory creation

## Sources

### Primary (HIGH confidence)
- [Remotion official docs - brownfield install](https://www.remotion.dev/docs/brownfield) -- workspace isolation pattern
- [Remotion official docs - spring()](https://www.remotion.dev/docs/spring) -- spring animation API
- [Remotion official docs - interpolate()](https://www.remotion.dev/docs/interpolate) -- value interpolation
- [Remotion official docs - Sequence](https://www.remotion.dev/docs/sequence) -- scene timing
- [Remotion official docs - CLI render](https://www.remotion.dev/docs/cli/render) -- MP4 rendering
- [Remotion official docs - Still images](https://www.remotion.dev/docs/stills/) -- poster rendering
- [Remotion official docs - React 19](https://www.remotion.dev/docs/react-19) -- compatibility
- [Remotion official docs - encoding](https://www.remotion.dev/docs/encoding) -- H.264 codec options

### Secondary (MEDIUM confidence)
- [npm: remotion v4.0.436](https://www.npmjs.com/package/remotion) -- latest version verification
- [Remotion GitHub releases](https://github.com/remotion-dev/remotion/releases) -- version history

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Remotion 4.x is the only mature option for React-based video, official docs verified
- Architecture: HIGH -- Workspace isolation pattern documented in official brownfield guide, waveform port logic derived from reading actual source code
- Pitfalls: HIGH -- Bundler conflict documented officially, folder naming verified against actual tsconfig.json

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (Remotion is stable, minor versions only)

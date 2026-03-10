# Architecture Patterns

**Domain:** Feature integration for existing Next.js landing page (v1.1)
**Researched:** 2026-03-10
**Confidence:** HIGH (existing codebase fully audited, external research verified with official docs)

## Current Architecture Snapshot

```
src/
  app/
    globals.css          -- @theme tokens (dark-only today)
    [locale]/
      layout.tsx         -- html + body, Nav, MotionProvider, NextIntlClientProvider
      page.tsx           -- 7 sections composed linearly with ScrollReveal wrappers
  components/
    Hero/                -- Hero.tsx (client), Waveform.tsx (canvas), StateIndicator, TextReveal
    Features/            -- Features.tsx (server) - 4 glassmorphism cards
    HowItWorks/          -- HowItWorks.tsx (server) - 3-step flow
    DataFlow/            -- DataFlow.tsx (server) - flow diagram in glass card
    OpenSource/          -- OpenSource.tsx (server) - GitHub CTA
    Community/           -- Community.tsx (server) - Telegram CTA
    Footer/              -- Footer.tsx
    Nav/                 -- Nav.tsx (client), Logo.tsx, LanguageToggle.tsx
    shared/              -- MotionProvider.tsx (LazyMotion), ScrollReveal.tsx (motion/react)
  hooks/
    useAnimationFrame.ts -- rAF loop for Waveform
    useHeroDemoState.ts  -- state machine: idle->recording->transcribing->smart->inserted
  i18n/
    routing.ts           -- next-intl routing config
  messages/
    fr.json, en.json     -- i18n dictionaries
```

**Key constraints:**
- All sections are server components except Hero, Nav, ScrollReveal, and MotionProvider
- Motion v12 LazyMotion wraps only `<main>` -- Nav is outside it
- Canvas Waveform runs at 60fps via `useAnimationFrame` with `prefers-reduced-motion` support
- Glassmorphism pattern already established: `bg-surface/50 backdrop-blur-md border border-border`
- Design tokens live in `globals.css` `@theme` block -- single source of truth
- Body class: `bg-ink font-sans text-white antialiased` (dark-only)

---

## Recommended Architecture for v1.1 Features

### Component Boundaries: New vs Modified

| Feature | Component | Status | Location |
|---------|-----------|--------|----------|
| Light/dark mode | ThemeProvider | **NEW** | `src/components/shared/ThemeProvider.tsx` |
| Light/dark mode | ThemeToggle | **NEW** | `src/components/Nav/ThemeToggle.tsx` |
| Light/dark mode | globals.css | **MODIFIED** | Token overrides via CSS custom properties |
| Light/dark mode | layout.tsx | **MODIFIED** | Add ThemeProvider, `suppressHydrationWarning` |
| Light/dark mode | ALL sections | **MODIFIED** | Migrate from hardcoded dark tokens to semantic tokens |
| Liquid Glass | GlassCard | **NEW** | `src/components/shared/GlassCard.tsx` |
| Liquid Glass | Features.tsx | **MODIFIED** | Replace inline glass styles with GlassCard |
| Liquid Glass | DataFlow.tsx | **MODIFIED** | Replace inline glass styles with GlassCard |
| Liquid Glass | Nav.tsx | **MODIFIED** | Enhanced glass effect on scroll |
| Comparison table | ComparisonTable | **NEW** | `src/components/Comparison/ComparisonTable.tsx` |
| Comparison table | page.tsx | **MODIFIED** | Add section between Features and HowItWorks |
| Demo videos | VideoSection | **NEW** | `src/components/shared/VideoSection.tsx` |
| Demo videos | HowItWorks.tsx | **MODIFIED** | Integrate video alongside steps |
| Demo videos | DataFlow.tsx | **MODIFIED** | Integrate video alongside flow diagram |
| Hero animation | Waveform.tsx | **MODIFIED** | Multi-phase animation (flat -> voice -> transcription) |
| Hero animation | Hero.tsx | **MODIFIED** | Pass demoPhase prop to Waveform |
| TestFlight CTA | TestFlightCTA | **NEW** | `src/components/shared/TestFlightCTA.tsx` |
| TestFlight CTA | useDeviceDetect.ts | **NEW** | `src/hooks/useDeviceDetect.ts` |
| TestFlight CTA | Community.tsx | **MODIFIED** | Add TestFlight CTA alongside Telegram |
| TestFlight CTA | Hero.tsx | **MODIFIED** | Replace "Coming Soon" badge with adaptive CTA |

---

## Pattern 1: Light/Dark Theme System

**What:** Dual-theme support using CSS custom properties + `next-themes` + Tailwind v4 `@custom-variant`

**Why this approach:** Tailwind v4 removed `tailwind.config.js` for dark mode config. The correct v4 pattern is `@custom-variant` in CSS combined with `next-themes` for persistence and flash prevention.

**Architecture:**

```
globals.css (@custom-variant + semantic token overrides)
    |
ThemeProvider (next-themes, wraps body content)
    |
ThemeToggle (in Nav, uses useTheme hook)
    |
All components (use semantic token classes that resolve per theme)
```

**Implementation in globals.css:**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Semantic tokens -- light mode values (new default) */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8FAFC;
  --color-bg-deep: #F1F5F9;
  --color-bg-surface: rgba(0, 0, 0, 0.03);
  --color-text-primary: #0A1628;
  --color-text-secondary: rgba(10, 22, 40, 0.70);
  --color-text-muted: rgba(10, 22, 40, 0.50);
  --color-border-subtle: rgba(0, 0, 0, 0.07);
  --color-border-emphasis: rgba(0, 0, 0, 0.14);
  --color-glass-bg: rgba(255, 255, 255, 0.60);
  --color-glass-border: rgba(0, 0, 0, 0.08);

  /* Brand tokens -- same in both modes */
  --color-accent: #3D7EFF;
  --color-accent-hi: #6BA3FF;
  --color-sky: #93C5FD;
  --color-mist: #DBEAFE;
  --color-navy: #0F3460;
  --color-recording: #EF4444;
  --color-smart: #8B5CF6;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-glow: rgba(61, 126, 255, 0.35);
  --color-glow-soft: rgba(61, 126, 255, 0.12);

  /* Keep legacy tokens for backward compat during migration */
  --color-ink-deep: #0A1628;
  --color-ink: #0B0F1A;
  --color-ink-2: #111827;
  --color-surface: #161C2C;
}

/* Dark mode overrides -- current v1.0 values preserved */
.dark {
  --color-bg-primary: #0B0F1A;
  --color-bg-secondary: #111827;
  --color-bg-deep: #0A1628;
  --color-bg-surface: rgba(22, 28, 44, 0.50);
  --color-text-primary: #FFFFFF;
  --color-text-secondary: rgba(255, 255, 255, 0.70);
  --color-text-muted: rgba(255, 255, 255, 0.60);
  --color-border-subtle: rgba(255, 255, 255, 0.07);
  --color-border-emphasis: rgba(255, 255, 255, 0.14);
  --color-glass-bg: rgba(255, 255, 255, 0.08);
  --color-glass-border: rgba(255, 255, 255, 0.12);
}
```

**Critical architectural decision:** The existing tokens (`ink`, `ink-2`, `surface`, `white-70`, `white-40`) are dark-mode-specific names. For theme switching, introduce semantic aliases (`bg-primary`, `bg-secondary`, `text-primary`, etc.) that swap values via CSS custom properties in the `.dark` scope. Keep legacy tokens temporarily for backward compatibility, then migrate component by component.

**ThemeProvider setup (layout.tsx):**

```tsx
<html lang={locale} className={`${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning>
  <body className="overflow-x-hidden bg-bg-primary font-sans text-text-primary antialiased">
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <NextIntlClientProvider messages={messages}>
        ...
      </NextIntlClientProvider>
    </ThemeProvider>
  </body>
</html>
```

**Why `defaultTheme="dark"`:** The site shipped dark-only. Dark is the brand identity. Light mode is additive. `enableSystem={false}` because brand identity should not be overridden by OS preference unless the user explicitly picks light.

**Impact on existing components:** Every component using `bg-ink`, `bg-ink-2`, `bg-ink-deep`, `text-white`, `text-white-70`, `text-white-40`, `bg-surface`, `border-border` needs migration to semantic tokens. The semantic token approach is cleaner than adding `dark:` prefix to every class because it avoids doubling the class count.

**Canvas Waveform special case:** The Waveform component uses hardcoded hex values (`#3D7EFF`, `rgba(255,255,255,...)`) in Canvas drawing calls. These cannot use Tailwind classes. Solution: read CSS custom properties via `getComputedStyle()` at draw time, or pass color props from parent.

**Confidence:** HIGH -- Tailwind v4 `@custom-variant` is official docs, `next-themes` is de facto standard for Next.js.

---

## Pattern 2: Liquid Glass Shared Component

**What:** Reusable `GlassCard` component that upgrades existing glassmorphism to iOS 26 Liquid Glass style.

**Why a shared component:** The glass pattern (`bg-surface/50 backdrop-blur-md border border-border`) is duplicated across Features (4x), DataFlow (1x), TextReveal (1x). A shared component centralizes the effect and makes the Liquid Glass upgrade a single-point change.

**CSS approach (pure CSS, no SVG filters):**

```css
.glass-card {
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid var(--color-glass-border);
  border-radius: 1rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

/* Specular highlight -- the "liquid" shine */
.glass-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    transparent 40%,
    transparent 60%,
    rgba(255, 255, 255, 0.04) 100%
  );
  pointer-events: none;
}
```

**Why pure CSS (no SVG displacement maps):** The SVG filter approach for true distortion is not supported as `backdrop-filter` input in Safari or Firefox. Since the primary audience visits from iOS Safari (it is an iOS app landing page), SVG filters are a non-starter. CSS-only Liquid Glass provides ~90% of the visual effect with full browser support and zero performance risk.

**Theme adaptation:** Glass variables (`--color-glass-bg`, `--color-glass-border`) swap between light and dark via the `.dark` scope defined in Pattern 1. In light mode: white glass with dark shadows. In dark mode: dark glass with light edge highlights.

**GlassCard component:**

```tsx
type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export default function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div className={`glass-card ${hover ? "transition-colors hover:border-border-emphasis" : ""} ${className ?? ""}`}>
      {children}
    </div>
  );
}
```

**Where to apply:** Features cards (4x), DataFlow container, TextReveal box, Nav (scrolled state). NOT on section backgrounds -- Liquid Glass works on discrete floating elements, not full-width sections.

**Performance:** `backdrop-filter` is already used on 7 elements. Upgrading from `blur(12px)` to `blur(12px) saturate(180%)` adds negligible GPU cost. The `::after` pseudo-element is static (no animation). Keep total glass elements under ~15 for safe mobile GPU performance.

**Confidence:** HIGH -- pure CSS approach, existing backdrop-filter usage proves browser compat.

---

## Pattern 3: Video Sections with Lazy Loading

**What:** Self-hosted `.mp4` demo videos in HowItWorks and DataFlow sections, loaded only when scrolled into view.

**Architecture:**

```
VideoSection (client component)
  +-- uses IntersectionObserver to detect viewport entry
  +-- renders <video> with preload="none" until in view
  +-- switches to play on intersection
  +-- poster image shown before load (static frame from video)
```

**Why self-hosted (not YouTube/Vimeo):** Zero third-party scripts is a hard constraint (PROJECT.md: "Zero third-party scripts, zero tracking, zero cookies"). Embedding YouTube would add ~500KB of JS and tracking. Self-hosted `.mp4` with H.264 baseline profile is universally supported and keeps the zero-tracking promise.

**VideoSection component pattern:**

```tsx
"use client";

import { useRef, useState, useEffect } from "react";

type VideoSectionProps = {
  src: string;
  poster: string;
  alt: string;
  className?: string;
};

export default function VideoSection({ src, poster, alt, className }: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          video.play().catch(() => {}); // autoplay may be blocked
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      poster={poster}
      preload={isVisible ? "auto" : "none"}
      muted
      loop
      playsInline
      aria-label={alt}
      className={className}
    >
      {isVisible && <source src={src} type="video/mp4" />}
    </video>
  );
}
```

**Key decisions for Lighthouse performance:**
1. `preload="none"` until visible -- zero network cost on initial load
2. `<source>` element only rendered after intersection -- browser does not even resolve the URL
3. `poster` image provides visual content before video loads (compress as WebP, ~20KB)
4. `muted playsInline` required for iOS autoplay policy
5. Videos stored in `public/videos/` -- served directly by Vercel CDN
6. Set explicit `width` and `height` on video element to prevent CLS

**Video encoding specs for performance:**
- Resolution: 390x844 (iPhone 15 Pro native width at 1x) -- no need for retina video
- Codec: H.264 Baseline Profile (universal support)
- Duration: 5-10 seconds per clip, looping
- File size target: < 1MB per video (bitrate ~800kbps)
- Format: `.mp4` container
- Encoding command: `ffmpeg -i raw.mov -vcodec h264 -b:v 800k -vf scale=390:-2 -an output.mp4`

**Where videos integrate:**
- HowItWorks: Replace static 3-step icons with video showing tap -> speak -> text flow
- DataFlow: Add video showing on-device processing indicator

**Impact on existing components:** HowItWorks and DataFlow are currently server components. Adding VideoSection (client) as a child works fine -- server components can compose client components. No need to convert the parent to client.

**Confidence:** HIGH -- IntersectionObserver is universally supported, self-hosted video avoids all third-party concerns.

---

## Pattern 4: Comparison Table

**What:** Responsive comparison table: Dictus vs Apple Dictation, WhisperFlow, SuperWhisper, MacWhisper.

**Architecture:** Server component (no interactivity needed), data-driven from i18n JSON + static competitor data.

**Component structure:**

```
src/components/Comparison/
  ComparisonTable.tsx     -- Main component, renders table
  comparisonData.ts       -- Type definitions, static competitor data (not translatable)
```

**Why a server component:** The table is static content. No hover states beyond CSS, no dynamic filtering, no JS interactions. Keeping it as a server component means zero JS shipped for this section.

**Data architecture:**

- Criteria labels and title: i18n in `messages/fr.json` and `messages/en.json`
- Competitor data (boolean features, platform strings, price): static TypeScript file -- not translatable content

```typescript
// comparisonData.ts
export type Competitor = {
  name: string;
  offline: boolean;
  privacy: boolean;
  price: string; // "Free", "$9.99/mo", etc. -- not translated
  platforms: string[];
  aiRewrite: boolean;
  openSource: boolean;
};

export const competitors: Competitor[] = [
  { name: "Dictus", offline: true, privacy: true, price: "Free", platforms: ["iOS"], aiRewrite: true, openSource: true },
  { name: "Apple Dictation", offline: false, privacy: false, price: "Free", platforms: ["iOS", "macOS"], aiRewrite: false, openSource: false },
  // ...
];
```

**Responsive strategy:**
- Desktop (md+): Standard HTML `<table>` with sticky first column
- Mobile: Horizontal scroll with snap points via `overflow-x-auto` with `-webkit-overflow-scrolling: touch`

Use semantic HTML: `<table>`, `<thead>`, `<th scope="col">`, `<th scope="row">` for accessibility.

**Placement in page:** After Features, before HowItWorks. Features establishes what Dictus does, Comparison proves it is better, HowItWorks shows how to use it.

**Confidence:** HIGH -- standard HTML table, server-rendered, no external dependencies.

---

## Pattern 5: Enhanced Hero Waveform Animation

**What:** Multi-phase waveform synchronized with the existing demo state machine.

**Architecture change:** The `useHeroDemoState` hook already drives states `idle | recording | transcribing | smart | inserted`. The Waveform currently ignores this state and runs a continuous sinusoidal wave. The enhancement connects the two by passing `demoPhase` as a prop.

**Phase behavior:**

| Phase | Amplitude | Color | Animation Style |
|-------|-----------|-------|-----------------|
| idle | MIN_BAR_HEIGHT (flat line) | text-muted (theme-aware) | None (static) |
| recording | 30-50% MAX_HEIGHT, random variation | recording (#EF4444) | Organic jitter |
| transcribing | 60-80% MAX_HEIGHT, traveling wave | accent (#3D7EFF) | Sinusoidal (current behavior) |
| smart | 40-60% MAX_HEIGHT, pulsing | smart (#8B5CF6) | Slow pulse |
| inserted | Decay to MIN_BAR_HEIGHT | success (#22C55E) | Fade to flat |

**Integration:**

1. Hero.tsx already has `demoState.currentState` -- pass it to Waveform as a prop
2. Waveform receives `demoPhase: DemoState` and adjusts `targetEnergy()` per phase
3. Transitions between phases use the existing `smoothingFactor` / `decayFactor` lerp -- no abrupt jumps
4. Color transitions use the existing `resolveBarColor()` function, extended to accept phase

**Key modification to Waveform.tsx:**

```tsx
export default function Waveform({ demoPhase }: { demoPhase: DemoState }) {
  // Replace static processingEnergy with phase-aware function
  const targetEnergy = useCallback((index: number, phase: number, demoPhase: DemoState) => {
    switch (demoPhase) {
      case "idle": return 0;
      case "recording": return randomJitter(index, phase, 0.3, 0.5);
      case "transcribing": return processingEnergy(index, phase); // existing sine
      case "smart": return pulsingEnergy(phase, 0.4, 0.6);
      case "inserted": return 0; // decay handled by smoothing
    }
  }, []);
}
```

**Theme impact on Waveform:** In light mode, the edge bar color needs to change from white to dark. The `EDGE_COLOR_RGB` constant becomes theme-aware -- read from CSS custom property or receive via prop.

**Confidence:** HIGH -- the state machine exists, this is wiring + canvas math, no new dependencies.

---

## Pattern 6: Adaptive TestFlight CTA with Device Detection

**What:** Show "TestFlight" button on iPhone, different messaging on desktop/Android.

**Architecture:**

```
useDeviceDetect.ts (client hook)
  +-- Checks navigator.userAgent for iPhone/iPad
  +-- Returns { isIOS: boolean, isMobile: boolean }
  +-- Defaults to desktop (SSR-safe)

TestFlightCTA.tsx (client component)
  +-- Uses useDeviceDetect
  +-- iPhone: "Rejoindre le TestFlight" -> testflight.apple.com/join/{CODE}
  +-- Desktop: "Disponible sur iPhone" or QR code
```

**Why client-side detection (not server):** The site is statically generated (`generateStaticParams`). Server-side UA detection would require dynamic rendering, breaking static export and Vercel edge caching. Client-side detection with a safe default (desktop messaging) means the page loads instantly from CDN, then adapts after hydration. The brief flash is acceptable because:
- Default CTA (desktop) is meaningful on all devices
- TestFlight CTA upgrade happens within ~50ms of hydration
- CTA locations are below the fold (Hero badge area scrolled past initial viewport on mobile)

**Hook:**

```tsx
"use client";
import { useState, useEffect } from "react";

export function useDeviceDetect() {
  const [device, setDevice] = useState({ isIOS: false, isMobile: false });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isMobile = /iPhone|iPad|iPod|Android/.test(ua) || window.innerWidth < 768;
    setDevice({ isIOS, isMobile });
  }, []);

  return device;
}
```

**CTA placement:**
1. **Hero:** Replace "Coming Soon" badge with adaptive CTA
2. **Community section:** Add TestFlight CTA alongside Telegram CTA

**TestFlight link:** `https://testflight.apple.com/join/{CODE}` -- universal link, works everywhere.

**Confidence:** HIGH -- client-side UA detection is simple, TestFlight universal links are standard.

---

## Data Flow: Before and After

### Before (v1.0)

```
layout.tsx (server)
  +-- Nav (client) -- scroll state, language toggle
  +-- MotionProvider (client) -- LazyMotion wrapper
      +-- page.tsx (server)
           +-- Hero (client) -- self-contained state machine + canvas
           +-- ScrollReveal > Features (server)
           +-- ScrollReveal > HowItWorks (server)
           +-- ScrollReveal > DataFlow (server)
           +-- ScrollReveal > OpenSource (server)
           +-- ScrollReveal > Community (server)
           +-- Footer (server)
```

### After (v1.1)

```
layout.tsx (server, MODIFIED -- suppressHydrationWarning)
  +-- ThemeProvider (NEW, client -- manages .dark class on <html>)
      +-- Nav (client, MODIFIED)
      |    +-- Logo
      |    +-- ThemeToggle (NEW, client)
      |    +-- LanguageToggle
      +-- MotionProvider (client)
          +-- page.tsx (server, MODIFIED -- new section)
               +-- Hero (client, MODIFIED)
               |    +-- Waveform (MODIFIED -- receives demoPhase prop)
               |    +-- TestFlightCTA (NEW, client)
               +-- ScrollReveal > Features (server, MODIFIED -- uses GlassCard)
               +-- ScrollReveal > ComparisonTable (NEW, server)
               +-- ScrollReveal > HowItWorks (MODIFIED)
               |    +-- VideoSection (NEW, client)
               +-- ScrollReveal > DataFlow (MODIFIED -- uses GlassCard)
               |    +-- VideoSection (NEW, client)
               +-- ScrollReveal > OpenSource (server)
               +-- ScrollReveal > Community (MODIFIED)
               |    +-- TestFlightCTA (NEW, client)
               +-- Footer (server)
```

### New Client JS Budget

| Component | JS Bundle Impact | Justification |
|-----------|-----------------|---------------|
| ThemeProvider (next-themes) | ~2KB | Flash-free theme switching |
| ThemeToggle | <1KB | Icon button + useTheme hook |
| VideoSection (x2) | ~1KB (shared) | IntersectionObserver + video element |
| TestFlightCTA (x2) | <1KB (shared) | Device detection + conditional render |
| GlassCard | 0KB | Server component or CSS-only |

**Total new client JS: ~5KB.** Current bundle is ~8KB (Motion LazyMotion + hooks). New total ~13KB. Well within Lighthouse 90+ budget.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Duplicating every Tailwind class with `dark:` prefix
**What:** Adding `dark:bg-ink dark:text-white` to every element.
**Why bad:** Doubles CSS output, makes every component unreadable, maintenance nightmare.
**Instead:** Use CSS custom properties that swap in `.dark` scope. Components use semantic token classes (`bg-bg-primary`, `text-text-primary`) that resolve differently per theme.

### Anti-Pattern 2: SVG displacement filters for Liquid Glass
**What:** Using `<feTurbulence>` and `<feDisplacementMap>` for true glass distortion.
**Why bad:** Not supported as `backdrop-filter` input in Safari or Firefox. Primary audience is iOS Safari.
**Instead:** Pure CSS `backdrop-filter` + `::after` specular gradient.

### Anti-Pattern 3: YouTube/Vimeo embeds for demo videos
**What:** `<iframe src="youtube.com/embed/...">` for app demos.
**Why bad:** Violates zero-third-party-scripts constraint. Adds ~500KB JS, tracking, cookies.
**Instead:** Self-hosted `.mp4` with `preload="none"` and IntersectionObserver.

### Anti-Pattern 4: Server-side UA detection for TestFlight CTA
**What:** Using `headers()` in server components to detect iPhone.
**Why bad:** Breaks static generation. Every page becomes dynamically rendered, losing edge cache.
**Instead:** Client-side `navigator.userAgent` in `useEffect` with desktop default.

### Anti-Pattern 5: Uncompressed videos in `public/`
**What:** Dropping raw iPhone screen recordings into `public/videos/`.
**Why bad:** Raw recordings are 30-60MB. Even 10 seconds at native resolution is 5MB+.
**Instead:** Compress with FFmpeg: `ffmpeg -i raw.mov -vcodec h264 -b:v 800k -vf scale=390:-2 -an output.mp4`. Target < 1MB per clip.

### Anti-Pattern 6: Converting server components to client for video
**What:** Making HowItWorks.tsx a client component because it contains a VideoSection.
**Why bad:** Loses server rendering benefits, ships unnecessary JS.
**Instead:** Keep parent as server component. Client VideoSection is composed as a child -- React supports this pattern.

---

## Suggested Build Order (Dependency-Driven)

Each phase produces a working, deployable state.

### Phase 1: Theme System (Light/Dark Mode) -- BUILD FIRST
**Rationale:** Every subsequent feature must work in both modes. Building theme infrastructure first means Liquid Glass, ComparisonTable, VideoSection, and TestFlightCTA are built theme-aware from day one. Retrofitting light mode onto completed features is 3-5x more work.

**Steps:**
1. `npm install next-themes`
2. Add `@custom-variant dark (&:where(.dark, .dark *))` to globals.css
3. Create semantic token layer (`bg-primary`, `text-primary`, etc.) alongside legacy tokens
4. Create ThemeProvider wrapping body in layout.tsx with `suppressHydrationWarning`
5. Add ThemeToggle to Nav
6. Migrate ALL existing components from hardcoded dark tokens to semantic tokens
7. Define light mode color palette (inspired by Dictus iOS app)
8. Test every section in both modes, verify WCAG contrast in light mode

**Depends on:** Nothing
**Blocks:** Everything else

### Phase 2: Liquid Glass Shared Component
**Rationale:** GlassCard is consumed by Features, DataFlow, and ComparisonTable. Build before consumers.

**Steps:**
1. Create `.glass-card` CSS in globals.css with theme-aware variables
2. Create GlassCard component
3. Refactor Features.tsx cards to use GlassCard
4. Refactor DataFlow.tsx container to use GlassCard
5. Upgrade Nav scrolled state to use glass effect
6. Verify in both light and dark mode

**Depends on:** Phase 1
**Blocks:** Phase 3

### Phase 3: Comparison Table
**Rationale:** Pure content, server-rendered, no complex interactions. Uses GlassCard.

**Steps:**
1. Define competitor data types and static data
2. Add i18n strings to fr.json and en.json
3. Build ComparisonTable component (responsive, accessible table)
4. Insert in page.tsx between Features and HowItWorks
5. Wrap with ScrollReveal

**Depends on:** Phase 2 (GlassCard)
**Blocks:** Nothing

### Phase 4: Enhanced Hero Waveform
**Rationale:** Modifying existing components, no new dependencies. Independent of video work.

**Steps:**
1. Add `demoPhase` prop to Waveform
2. Implement phase-aware energy functions
3. Implement phase-aware color resolution (theme-aware)
4. Pass `demoState.currentState` from Hero to Waveform
5. Test with reduced motion

**Depends on:** Phase 1 (theme-aware colors)
**Blocks:** Nothing

### Phase 5: Demo Video Sections
**Rationale:** Requires video assets. Build component infrastructure, integrate when videos ready.

**Steps:**
1. Build VideoSection shared component with IntersectionObserver
2. Prepare poster images (WebP, compressed)
3. Compress video files with FFmpeg
4. Integrate into HowItWorks
5. Integrate into DataFlow
6. Lighthouse audit (verify no LCP/CLS regression)

**Depends on:** Phase 1 (theme-aware styling), video assets from user
**Blocks:** Nothing

### Phase 6: Adaptive TestFlight CTA
**Rationale:** Last because it replaces the "Coming Soon" badge. Build when TestFlight link is available.

**Steps:**
1. Create useDeviceDetect hook
2. Build TestFlightCTA component with iPhone/desktop variants
3. Replace Hero "Coming Soon" badge
4. Add to Community section
5. Add i18n strings for both variants

**Depends on:** Phase 1 (theme-aware), TestFlight link from app team
**Blocks:** Nothing

**Phase ordering rationale:** Theme system is foundational (touches every component). Liquid Glass builds the shared component needed by ComparisonTable. Phases 4-6 are independent and can be parallelized if multiple developers are available.

---

## Scalability Considerations

| Concern | Current (v1.0) | After v1.1 | Risk |
|---------|----------------|------------|------|
| Client JS bundle | ~8KB | ~13KB (+next-themes, video, device detect) | Low -- well within budget |
| Glassmorphism/glass elements | 7 | ~12 (+ComparisonTable, glass cards) | Low -- under 15 safe for mobile GPU |
| CSS custom properties | 15 tokens | ~30 tokens (+semantic layer) | None -- no perf impact |
| Video files | 0 | 2-3 (< 1MB each) | Medium -- lazy loaded but adds total page weight |
| i18n keys | ~40 | ~70 (+Comparison, CTA variants) | None -- negligible bundle impact |
| `prefers-reduced-motion` | Handled in Waveform + ScrollReveal | Must extend to video autoplay + new animations | Medium -- test carefully |

---

## Sources

- [Tailwind CSS v4 Dark Mode -- official docs](https://tailwindcss.com/docs/dark-mode) (HIGH confidence)
- [next-themes -- GitHub](https://github.com/pacocoursey/next-themes) (HIGH confidence)
- [Theming in Tailwind CSS v4 with @custom-variant](https://medium.com/@sir.raminyavari/theming-in-tailwind-css-v4-support-multiple-color-schemes-and-dark-mode-ba97aead5c14) (MEDIUM confidence)
- [Dark mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) (MEDIUM confidence)
- [Dark Mode in Next.js 15 with Tailwind v4](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) (MEDIUM confidence)
- [Recreating Apple's Liquid Glass Effect with Pure CSS](https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl) (MEDIUM confidence)
- [Getting Clarity on Apple's Liquid Glass -- CSS-Tricks](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/) (HIGH confidence)
- [How to create Liquid Glass effects with CSS and SVG -- LogRocket](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/) (MEDIUM confidence)
- [Liquid Glass CSS Generator](https://liquidglassgen.com/) (LOW confidence -- tool reference)
- [Lazy-Load Videos in Next.js -- Cloudinary](https://cloudinary.com/blog/lazy-load-videos-in-next-js-pages) (MEDIUM confidence)
- [Next.js userAgent function -- official docs](https://nextjs.org/docs/app/api-reference/functions/userAgent) (HIGH confidence)
- [Tailwind CSS v4 dark mode discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16925) (MEDIUM confidence)

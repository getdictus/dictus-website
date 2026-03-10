# Technology Stack — v1.1 Additions

**Project:** dictus Landing Page v1.1
**Researched:** 2026-03-10
**Scope:** NEW stack additions only. See v1.0 research for base stack (Next.js 16, Tailwind v4, Motion v12, next-intl v4).

## New Dependencies

### Theme Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next-themes | 0.4.6 | Light/dark mode toggle with SSR | Prevents flash of unstyled content (FOUC) on page load. Handles localStorage persistence, system preference detection, `<html>` class toggling. 2 lines of setup. React 19 compatible (peer dep: `^19`). 3M+ weekly npm downloads. The standard solution for Next.js theming. | HIGH |

**Why next-themes over rolling our own:**
- FOUC prevention requires an inline `<script>` in `<head>` that runs before React hydration. next-themes handles this correctly with its `ThemeProvider` + blocking script injection. Getting this right manually is error-prone and a known pain point.
- Handles the three-way toggle (light / dark / system) with localStorage persistence out of the box.
- Zero bundle cost at runtime beyond the tiny provider (~1.5kb).

**Why not cookies-based approach:** next-themes uses localStorage + blocking script. Some guides suggest cookies for SSR theme detection, but this adds server complexity for zero benefit on a static-ish landing page. The blocking script approach eliminates FOUC without server involvement.

### No Other New Dependencies

Everything else needed for v1.1 features is achievable with the existing stack plus native browser APIs. Specifically:

| Feature | Approach | New Dependency? |
|---------|----------|-----------------|
| Liquid Glass effects | Pure CSS (backdrop-filter + SVG filter fallback) | NO |
| Light mode theming | Tailwind v4 `@custom-variant` + CSS custom properties | NO (next-themes only) |
| Video embedding | Native `<video>` element + Intersection Observer | NO |
| Canvas animation enhancements | Extend existing Waveform.tsx | NO |
| Device detection (iOS) | `navigator.userAgent` regex, client-side | NO |
| Comparison table | Static React component + next-intl translations | NO |

## Installation

```bash
# Only new dependency for v1.1
npm install next-themes
```

---

## Feature-Specific Stack Guidance

### 1. Light/Dark Mode with Tailwind v4

**Architecture:** CSS custom properties scoped to `.dark` / default (light), toggled via next-themes.

**Tailwind v4 approach — @custom-variant:**

```css
/* globals.css — add after @import "tailwindcss" */
@custom-variant dark (&:where(.dark, .dark *));
```

This replaces the old `darkMode: "class"` from tailwind.config.js. The `dark:` prefix will activate when `.dark` class is present on any ancestor element.

**Token strategy — override CSS custom properties per theme:**

```css
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* Light mode tokens (default) */
@theme {
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #F1F5F9;
  --color-bg-surface: #FFFFFF;
  --color-text-primary: #0B0F1A;
  --color-text-secondary: rgba(11, 15, 26, 0.60);
  --color-border: rgba(11, 15, 26, 0.10);
  --color-border-hi: rgba(11, 15, 26, 0.18);
  /* Accent colors stay the same across themes */
  --color-accent: #3D7EFF;
  --color-accent-hi: #6BA3FF;
  /* ... other shared tokens ... */
}

/* Dark mode overrides via CSS layer */
.dark {
  --color-bg-primary: #0A1628;
  --color-bg-secondary: #0B0F1A;
  --color-bg-surface: #161C2C;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: rgba(255, 255, 255, 0.70);
  --color-border: rgba(255, 255, 255, 0.07);
  --color-border-hi: rgba(255, 255, 255, 0.14);
}
```

**Key decision — semantic token renaming:** The current v1.0 tokens (`ink-deep`, `ink`, `surface`, `white-70`, `white-40`) are dark-mode-specific names. For dual-theme support, introduce semantic aliases (`bg-primary`, `text-primary`, etc.) that resolve to different values per theme. Keep the raw brand tokens available for cases where you explicitly want the dark value regardless of theme.

**next-themes setup:**

```tsx
// components/shared/ThemeProvider.tsx
"use client";
import { ThemeProvider } from "next-themes";

export function DictusThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

**Default to dark:** The current site is dark-only. Set `defaultTheme="dark"` so existing visitors see no change. Light mode is opt-in via a toggle.

**Confidence:** HIGH — Tailwind v4 official docs confirm `@custom-variant` syntax, next-themes 0.4.6 confirmed React 19 compatible via npm.

---

### 2. Liquid Glass Effects

**Approach:** Pure CSS with layered composition. No library.

The v1.0 glassmorphism is basic (`backdrop-filter: blur` + semi-transparent background). Liquid Glass adds three visual enhancements:

1. **Light refraction highlight** on curved edges (top/bottom)
2. **Specular reflection** that responds to element position
3. **Subtle distortion** of background content

**Recommended CSS implementation (three-layer composition):**

```css
/* Liquid Glass container */
.liquid-glass {
  position: relative;
  background: rgba(22, 28, 44, 0.45);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

/* Layer 1: Top edge highlight (light refraction) */
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.03) 30%,
    transparent 50%
  );
  pointer-events: none;
}

/* Layer 2: Inner glow (specular highlight) */
.liquid-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  pointer-events: none;
}
```

**What NOT to do:**
- Do NOT use SVG `feDisplacementMap` / `feTurbulence` filters for backdrop distortion. Safari does not support SVG filters as `backdrop-filter` inputs (auto-falls back to plain blur). The `nikdelvin/liquid-glass` library documents this: "Safari automatically falls back to a blurred glassmorphism effect." Since Safari/iOS is the primary audience for a Dictus landing page, SVG filter distortion would be invisible to target users.
- Do NOT use the `liquid-glass` npm package (Astro-based, not React, adds Anime.js dependency).
- Do NOT apply `backdrop-filter` to more than 5-6 elements per viewport. Each is GPU-composited.

**Light mode adaptation:** In light mode, swap the rgba values:
```css
/* Light mode liquid glass */
.light .liquid-glass {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.light .liquid-glass::before {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.60) 0%,
    rgba(255, 255, 255, 0.20) 30%,
    transparent 50%
  );
}
```

**Tailwind integration:** Define as a utility class in globals.css or as a reusable component. Use Tailwind's `backdrop-blur-xl` (`blur(24px)`) and `backdrop-saturate-[180%]` utilities where possible, with custom CSS for the pseudo-element layers.

**Confidence:** HIGH for the CSS approach. MEDIUM for visual fidelity (true Liquid Glass distortion requires SVG filters that Safari blocks — the CSS-only version is a convincing approximation, not pixel-perfect iOS 26).

---

### 3. Video Embedding (Self-Hosted Short Clips)

**Approach:** Native `<video>` element with Intersection Observer lazy loading. No video library.

**Format recommendation:**

| Format | Codec | Use Case | Browser Support |
|--------|-------|----------|-----------------|
| MP4 (H.264) | AVC | Primary source, universal fallback | 99%+ |
| WebM (VP9) | VP9 | Smaller file size for Chrome/Firefox/Edge | ~95% (not Safari) |

Serve both with `<source>` elements. Browser picks the first supported format.

**Encoding with FFmpeg (run before build, commit optimized files):**

```bash
# MP4 (H.264) — universal compatibility
ffmpeg -i raw-demo.mov \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=960:-2" \
  -an -movflags faststart \
  -f mp4 demo.mp4

# WebM (VP9) — 20-50% smaller for supported browsers
ffmpeg -i raw-demo.mov \
  -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -vf "scale=960:-2" \
  -an \
  -f webm demo.webm
```

Key flags:
- `-an`: Strip audio track (demo clips are silent, removes empty audio metadata)
- `-movflags faststart`: Move MOOV atom to file start for progressive playback
- `-crf 28` (H.264) / `-crf 35` (VP9): Quality sweet spot for screen recordings
- `scale=960:-2`: Cap at 960px width (sufficient for inline demos), keep aspect ratio

**Target file sizes:** Each clip should be under 2MB (ideally under 1MB). Screen recordings of an iOS app compress well.

**Video component pattern:**

```tsx
// components/shared/LazyVideo.tsx
"use client";
import { useRef, useEffect, useState } from "react";

interface LazyVideoProps {
  mp4Src: string;
  webmSrc?: string;
  poster?: string;
  className?: string;
  alt: string;
}

export function LazyVideo({ mp4Src, webmSrc, poster, className, alt }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before viewport
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay={isVisible}
      loop
      muted
      playsInline  // Required for iOS inline playback
      preload="none"
      poster={poster}
      className={className}
      aria-label={alt}
    >
      {isVisible && (
        <>
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
        </>
      )}
    </video>
  );
}
```

**Key attributes for iOS:**
- `playsInline`: Mandatory for autoplay on iOS Safari (without it, video opens fullscreen)
- `muted`: Required for autoplay to work on all browsers
- `autoPlay` + `muted` + `playsInline`: The trio that enables silent inline autoplay

**File placement:** `/public/videos/demo-*.mp4` and `/public/videos/demo-*.webm`. Vercel CDN serves these with proper caching headers automatically.

**Do NOT use:**
- `next-video` package (adds Mux dependency, overkill for 2-3 self-hosted clips)
- Vercel Blob (unnecessary for a handful of small pre-encoded files committed to repo)
- Any video player library (no controls needed for autoplay demo clips)

**Confidence:** HIGH — Next.js 16 official docs confirm native `<video>` as recommended approach for self-hosted videos. Intersection Observer is a mature browser API.

---

### 4. Canvas Animation Enhancements (Hero Waveform)

**Approach:** Extend existing `Waveform.tsx` with new animation states. No new dependencies.

The current Waveform.tsx already has the architecture needed:
- `useAnimationFrame` custom hook for 60fps rendering
- `displayLevelsRef` (Float32Array) for smooth interpolation
- `processingEnergy()` for sinusoidal envelope
- `resolveBarColor()` for state-based coloring

**Enhancements for v1.1 (flat -> voice -> transcription):**

1. **Accept an `animationState` prop** from `useHeroDemoState` to drive waveform behavior:
   - `idle`: Bars at minimum height, subtle breathing animation
   - `recording`: Bars simulate voice input (randomized amplitudes with envelope)
   - `transcribing`: Current sinusoidal traveling wave (already implemented)
   - `smart`: Purple-tinted bars with different wave pattern
   - `inserted`: Bars settle to flat baseline

2. **Color adaptation for light mode:** The `resolveBarColor()` function currently hardcodes `BRAND_BLUE` and white edge colors. Pass theme context or accept color props to adapt:
   - Dark mode: White edges on dark background (current)
   - Light mode: Dark gray edges (`#1E293B`) on light background, keep brand blue center

3. **Voice simulation during `recording` state:** Replace the current static sinusoidal with pseudo-random amplitudes modulated by an envelope:

```typescript
// Pseudo-voice: Perlin-like noise modulated by speech envelope
const voiceEnergy = (index: number, time: number): number => {
  const freq1 = Math.sin(time / 300 + index * 0.7) * 0.3;
  const freq2 = Math.sin(time / 150 + index * 1.3) * 0.2;
  const freq3 = Math.sin(time / 80 + index * 2.1) * 0.15;
  const envelope = 0.4 + 0.3 * Math.sin(time / 800); // Speech rhythm
  return Math.max(0.05, (freq1 + freq2 + freq3 + 0.35) * envelope);
};
```

**No Web Audio API needed.** The waveform is purely visual (decorative). Do not add microphone access or audio processing — it would contradict the privacy-first positioning and add unnecessary complexity.

**Performance note:** The existing `useAnimationFrame` + `Float32Array` approach is already optimal. Canvas 2D with 30 rounded rects at 60fps is lightweight. No WebGL upgrade needed.

**Confidence:** HIGH — extending existing patterns, no new APIs or dependencies.

---

### 5. Device Detection (iOS vs Desktop)

**Approach:** Client-side User-Agent string check. No library.

**Implementation:**

```typescript
// utils/device.ts
export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}
```

The second condition catches iPadOS, which reports as "Macintosh" in the UA string since iPadOS 13 but has touch support.

**Important 2025+ caveat:** Starting with Safari 26 (iOS 26), Apple freezes the OS version in the UA string (reports as `OS 18_6` regardless of actual version). This does NOT affect our use case — we only need to detect "is this an iOS device" (not which iOS version), and the `iPhone` / `iPad` / `iPod` tokens remain in the UA string.

**CTA behavior:**

| Device | CTA Text | Action |
|--------|----------|--------|
| iPhone | "Get TestFlight Beta" | Link to TestFlight URL |
| iPad | "Get TestFlight Beta" | Link to TestFlight URL |
| Desktop/Android | "Available on iPhone" + QR or email reminder | Informational, no direct download |

**Why not `navigator.userAgentData` (Client Hints):** Safari does not implement the User-Agent Client Hints API. Since iOS Safari is our primary target, Client Hints would require a fallback to UA parsing anyway. Just use UA parsing directly.

**Why no library (ua-parser-js, bowser, etc.):** We need a single boolean check (`isIOS`). A library adds 10-30kb for comprehensive device/browser/OS parsing we will never use.

**Server-side detection consideration:** For the initial render, the CTA could show a neutral state ("Coming to iPhone") and upgrade to the TestFlight link on the client after detection. This avoids hydration mismatches and works correctly for all users.

**Confidence:** HIGH — UA string detection for iOS is well-established and our use case (device family, not version) is unaffected by Safari 26 UA freezing.

---

## Summary: v1.1 Dependency Changes

| Action | Package | Version | Bundle Impact |
|--------|---------|---------|---------------|
| ADD | next-themes | 0.4.6 | ~1.5kb gzipped |

**Total new JS added:** ~1.5kb gzipped. Well within the existing < 100kb budget.

Everything else (Liquid Glass, video, canvas, device detection) uses native browser APIs and CSS. This is intentional — the zero-dependency philosophy aligns with the project's privacy-first, performance-first constraints.

## Performance Budget Update

| Metric | v1.0 Actual | v1.1 Target | Risk |
|--------|-------------|-------------|------|
| Lighthouse Performance | 97-98 | 90+ | Video files are the main risk. Lazy loading + `preload="none"` mitigates. |
| Lighthouse Accessibility | 93 | 93+ | Light mode needs WCAG AA contrast validation for all new color pairs. |
| Lighthouse Best Practices | 100 | 100 | No new third-party scripts. |
| Lighthouse SEO | 92 | 92+ | No regression expected. |
| JS Bundle | ~7kb (Motion + next-intl) | ~8.5kb | +1.5kb from next-themes only. |
| Total page weight | ~150kb | ~500kb-1MB | Video files dominate. Keep each clip under 1MB. |

## Sources

- [Tailwind CSS v4 dark mode docs](https://tailwindcss.com/docs/dark-mode) — `@custom-variant` syntax, class-based toggle, system preference (verified 2026-03-10)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) — React 19 peer dependency, ThemeProvider API
- [CSS-Tricks: Getting Clarity on Apple's Liquid Glass](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/) — CSS techniques, SVG filter limitations, Safari compatibility
- [Liquid Glass with Pure CSS (DEV Community)](https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl) — backdrop-filter approach, SVG filter limitations confirmed
- [nikdelvin/liquid-glass GitHub](https://github.com/nikdelvin/liquid-glass) — Safari fallback behavior documented, browser compatibility matrix
- [Next.js Video Guide](https://nextjs.org/docs/app/guides/videos) — self-hosted `<video>` recommendation, `playsInline` for iOS, preload="none"
- [FFmpeg web optimization (Transloadit)](https://transloadit.com/devtips/reducing-video-file-size-with-ffmpeg-for-web-optimization/) — CRF values, movflags faststart, format comparison
- [Web optimized video with VP9/H265 (Pixel Point)](https://pixelpoint.io/blog/web-optimized-video-ffmpeg/) — WebM vs MP4 size comparison (20-50% savings)
- [Detect iOS versions (Evil Martians, 2025)](https://evilmartians.com/chronicles/how-to-detect-safari-and-ios-versions-with-ease) — Safari 26 UA freezing, detection strategies
- [Client Hints browser support (Corbado)](https://www.corbado.com/blog/client-hints-user-agent-chrome-safari-firefox) — Safari does not implement UA-CH
- [Tailwind v4 dark mode discussion #15083](https://github.com/tailwindlabs/tailwindcss/discussions/15083) — CSS variable theming patterns
- [Dark mode with Tailwind v4 + Next.js guide](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) — next-themes + @custom-variant integration (updated Jan 2026)

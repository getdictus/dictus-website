# Technology Stack

**Project:** dictus Landing Page
**Researched:** 2026-03-09

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 16.1.x | Framework, SSG, routing | Project requirement. v16 brings Turbopack as default bundler (5x faster builds), stable App Router, React 19. Use static export for a landing page. | HIGH |
| React | 19.x | UI library | Ships with Next.js 16. Server Components reduce client JS. | HIGH |
| Tailwind CSS | 4.2.x | Styling | Project requirement. v4 uses CSS-first config (no tailwind.config.js), Rust-based compiler (100x faster incremental), OKLCH colors, cascade layers. | HIGH |

### Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Motion (framer-motion) | 12.x | UI animations, scroll-triggered reveals, micro-interactions | Best React animation library for declarative animations. Native gesture support, layout animations, AnimatePresence for mount/unmount. Import from `motion/react` (new package name). Use `LazyMotion` + `m` components to reduce initial bundle from ~34kb to ~4.6kb. | HIGH |

**Why Motion over GSAP:** Motion is React-native (declarative props, not imperative refs), has smaller bundle with LazyMotion, better DX for component-level animations. GSAP is superior for complex SVG timelines and ScrollTrigger, but this project needs scroll-reveal, micro-interactions, and state-based animations (recording/transcribing states) -- all Motion strengths. GSAP also has licensing concerns for commercial use.

**Why not lighter alternatives (AutoAnimate, Motion One):** The sinusoidal waveform animation, state-based color transitions, and word-by-word text reveal require a full-featured animation library. AutoAnimate is too simple. Motion One lacks React integration depth.

### Internationalization

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next-intl | 4.x | FR/EN bilingual support | Built specifically for Next.js App Router. ~2KB bundle, native Server Component support, built-in locale routing via middleware, TypeScript type safety. 1.8M weekly npm downloads. The clear winner over next-i18next for App Router projects. | HIGH |

**Why not next-i18next:** Designed for Pages Router era. Requires more configuration for App Router, needs react-i18next as dependency, more complex server-side setup. next-intl was built for the App Router from day one.

### Fonts & Assets

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next/font | (built-in) | Font loading (DM Sans, DM Mono) | Eliminates render-blocking font requests, improves FCP by 200-500ms, prevents CLS. Self-hosts Google Fonts at build time. | HIGH |
| next/image | (built-in) | Image optimization | Auto WebP conversion, lazy loading, responsive sizing. Critical for Lighthouse scores. | HIGH |

### Performance & Analytics

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @next/bundle-analyzer | latest | Bundle analysis | Essential for monitoring animation library impact on bundle size. Zero-tracking philosophy means no analytics SDK needed. | HIGH |

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TypeScript | 5.x | Type safety | Ships with Next.js 16 setup. Type-safe routes, typed translations with next-intl. | HIGH |
| ESLint | 9.x | Linting | Next.js built-in ESLint config. Flat config format in v9. | HIGH |

## Glassmorphism / Liquid Glass: CSS-Only (No Library)

This is a critical design decision. **Do not use a glassmorphism library.** Implement with pure CSS:

```css
/* Core glass effect */
.glass {
  background: rgba(22, 28, 44, 0.6);        /* Surface color with alpha */
  backdrop-filter: blur(12px);                /* 8-15px sweet spot */
  -webkit-backdrop-filter: blur(12px);        /* Safari prefix still needed */
  border: 1px solid rgba(255, 255, 255, 0.07); /* Brand border token */
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Liquid glass highlight (top edge light refraction) */
.glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
}
```

**Why CSS-only:**
- Browser support for `backdrop-filter` is 95%+ (2025 data)
- No JS overhead -- critical for Lighthouse performance score
- Full control over the brand kit tokens
- Advanced SVG liquid glass filters (feTurbulence, feSpecularLighting) are NOT cross-browser safe (Safari/Firefox don't support SVG filters as backdrop-filter inputs). Keep it simple.

**Performance rule:** Keep `backdrop-filter` to max 5-6 elements per viewport. Each blurred element is GPU-expensive. Use `will-change: transform` sparingly.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Animation | Motion 12.x | GSAP | Imperative API, licensing concerns, heavier for React patterns |
| Animation | Motion 12.x | React Spring | Less maintained, steeper learning curve, weaker ecosystem |
| Animation | Motion 12.x | CSS animations only | Insufficient for sinusoidal waveform, state transitions, word-by-word reveal |
| i18n | next-intl 4.x | next-i18next | Pages Router legacy, complex App Router setup, larger dependency tree |
| i18n | next-intl 4.x | Intlayer | Newer, smaller community, less battle-tested |
| Glass effects | CSS backdrop-filter | Glass UI libraries | Unnecessary dependency, less control, performance overhead |
| Fonts | next/font | Google Fonts CDN | Render-blocking, CLS issues, privacy concern (Google tracking) |

## Installation

```bash
# Create Next.js project (Turbopack default in v16)
npx create-next-app@latest dictus-website --typescript --tailwind --app --src-dir

# Animation
npm install motion

# Internationalization
npm install next-intl

# Dev tools
npm install -D @next/bundle-analyzer
```

## Key Configuration Notes

### Motion: Use LazyMotion for Performance

```tsx
// app/providers.tsx
"use client";
import { LazyMotion, domAnimation } from "motion/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
```

Use `m` component instead of `motion` for tree-shakeable animations:
```tsx
import { m } from "motion/react";
// NOT: import { motion } from "motion/react";
```

### next-intl: App Router Setup

Directory structure:
```
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
  i18n/
    routing.ts
    request.ts
  messages/
    fr.json
    en.json
  middleware.ts
```

### Tailwind v4: CSS-First Config

```css
/* app/globals.css */
@import "tailwindcss";

/* Custom brand tokens via CSS custom properties */
@theme {
  --color-ink-deep: #0A1628;
  --color-ink: #0B0F1A;
  --color-ink-2: #111827;
  --color-surface: #161C2C;
  --color-accent: #3D7EFF;
  --color-accent-hi: #6BA3FF;
  --color-sky: #93C5FD;
}
```

No `tailwind.config.js` needed in v4. All configuration lives in CSS.

### Static Export for Landing Page

```ts
// next.config.ts
const nextConfig = {
  output: 'export',  // Static HTML export -- no server needed
  // OR keep default for Vercel (recommended for i18n middleware)
};
```

**Note:** next-intl middleware requires server runtime for locale detection. If deploying on Vercel, keep the default output mode (not static export). Vercel handles middleware at the edge for free.

## Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | next/font preload, above-fold static content, no heavy animation on hero initial paint |
| FID | < 100ms | LazyMotion deferred loading, minimal client JS |
| CLS | < 0.1 | next/font with display:swap, reserved image dimensions |
| Bundle (JS) | < 100kb gzipped | LazyMotion (~4.6kb), next-intl (~2kb), minimal client components |
| Lighthouse | 90+ all categories | Static content where possible, proper image/font optimization |

## Sources

- [Motion documentation](https://motion.dev/docs) -- animation API, LazyMotion, bundle optimization
- [Motion reduce bundle size guide](https://motion.dev/docs/react-reduce-bundle-size) -- LazyMotion strategy
- [Motion vs GSAP comparison](https://motion.dev/docs/feature-comparison)
- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router) -- setup, routing, Server Components
- [next-intl 4.0 release](https://next-intl.dev/blog/next-intl-4-0)
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, new engine
- [Next.js 16 release](https://nextjs.org/blog/next-16) -- Turbopack, App Router stability
- [Glassmorphism implementation guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [Liquid Glass CSS techniques](https://dev.to/gruszdev/apples-liquid-glass-revolution-how-glassmorphism-is-shaping-ui-design-in-2025-with-css-code-1221)
- [Next.js Lighthouse optimization](https://www.qed42.com/insights/next-js-performance-tuning-practical-fixes-for-better-lighthouse-scores)

# Architecture Research

**Domain:** Remotion demo video + App Store compliance pages for existing Next.js landing page
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH (Remotion integration well-documented; App Store pages are standard patterns)

## Current Architecture Snapshot

```
src/
├── app/
│   ├── [locale]/          # next-intl URL routing (fr/en)
│   │   ├── layout.tsx     # Root layout: fonts, providers, Nav
│   │   ├── page.tsx       # Landing page (7 sections)
│   │   └── not-found.tsx
│   ├── globals.css        # Tailwind v4 @theme tokens
│   ├── robots.ts
│   └── sitemap.ts
├── components/            # Feature-grouped components
│   ├── Hero/              # Hero, Waveform (canvas), TextReveal, AdaptiveCTA, StateIndicator
│   ├── Nav/               # Nav, Logo, LanguageToggle, ThemeToggle
│   ├── Features/
│   ├── Comparison/
│   ├── HowItWorks/
│   ├── DataFlow/
│   ├── OpenSource/
│   ├── Community/
│   ├── Footer/
│   └── shared/            # MotionProvider, ScrollReveal, ThemeProvider
├── hooks/                 # useAnimationFrame, useHeroDemoState
├── i18n/                  # routing, navigation, request
├── messages/              # fr.json, en.json
└── proxy.ts               # next-intl middleware
```

**Key constraints:**
- All pages live under `[locale]/` for next-intl routing
- Layout wraps with `NextIntlClientProvider`, `ThemeProvider`, `MotionProvider`
- `@/*` alias maps to `./src/*` -- a root-level `remotion/` folder will NOT conflict with the `remotion` npm package
- Build uses Webpack (not Turbopack) due to a known Next.js 16 PNG bug
- Vercel deployment -- no persistent server, no heavy compute at build time
- Zero third-party scripts, zero tracking, zero cookies

## Decision: Pre-rendered MP4 vs Remotion Player Component

**Recommendation: Use Remotion as a dev-only rendering tool, embed pre-rendered MP4 as static `<video>` on the site.**

**Why NOT the Remotion `<Player>` component in production:**
- Adds ~150-250kb to client bundle (`remotion` + `@remotion/player` + composition code)
- The landing page currently ships minimal JS (Motion v12 is ~4.6kb via LazyMotion)
- Remotion Player requires `"use client"` and pulls in a React reconciler for video rendering
- Demo video content is static -- no runtime customization needed
- Lighthouse performance score (currently 97-98) would degrade significantly
- Remotion requires Webpack config overrides in `next.config.ts` that may conflict with existing setup

**Why pre-rendered MP4:**
- Zero additional JS bundle impact
- Native `<video>` with `playsinline muted autoplay loop` -- optimized for iOS
- Lazy-loadable via IntersectionObserver
- Cacheable on Vercel CDN
- Complete creative control during Remotion rendering (exact timing, resolution, waveform fidelity)

## System Overview After v1.2

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                            │
│                                                                 │
│  src/app/[locale]/                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐                │
│  │ page.tsx  │  │ privacy/     │  │ support/   │                │
│  │ (landing) │  │ page.tsx     │  │ page.tsx   │                │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘                │
│       │               │                │                        │
│  ┌────┴───────────────┴────────────────┴──────────────────┐     │
│  │              [locale]/layout.tsx                         │     │
│  │    (fonts, NextIntlClientProvider, ThemeProvider, Nav)   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                 │
│  public/videos/                                                 │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  demo.mp4    -- Pre-rendered H.264 from Remotion      │       │
│  │  demo.webm   -- WebM/VP9 for smaller size on Chrome   │       │
│  │  demo-poster.webp -- First frame as poster image      │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  remotion/  (project root, separate workspace, dev-only)        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Own package.json, own tsconfig.json                      │   │
│  │  Compositions + render scripts                            │   │
│  │  NOT part of Next.js build, NOT deployed                  │   │
│  │  Renders output to public/videos/                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | New/Modified | Notes |
|-----------|----------------|--------------|-------|
| `[locale]/page.tsx` | Landing page with video section | **Modified** | Add DemoVideo section |
| `[locale]/privacy/page.tsx` | Privacy Policy content | **New** | Static RSC, i18n translated |
| `[locale]/support/page.tsx` | Support page with contact info | **New** | Static RSC, mailto link |
| `components/DemoVideo/DemoVideo.tsx` | Video embed with poster, lazy-load | **New** | Client component for IntersectionObserver |
| `components/Footer/Footer.tsx` | Footer links | **Modified** | Add Privacy Policy link |
| `app/sitemap.ts` | Sitemap entries | **Modified** | Add /privacy and /support routes |
| `messages/fr.json` + `en.json` | Translation strings | **Modified** | Add Privacy, Support, DemoVideo namespaces |
| `remotion/` (entire directory) | Video composition source | **New** (dev-only) | NOT deployed, NOT in Next.js build |

## Recommended Project Structure (After v1.2)

```
dictus-website/
├── remotion/                    # Remotion workspace (dev-only, own package.json)
│   ├── src/
│   │   ├── Root.tsx             # Composition registration via registerRoot
│   │   ├── DemoVideo/
│   │   │   ├── DemoVideo.tsx    # Main composition (1920x1080 or 1080x1920)
│   │   │   ├── PhoneFrame.tsx   # iOS device frame overlay
│   │   │   ├── WaveformScene.tsx # Waveform animation (port canvas logic to React)
│   │   │   ├── TextScene.tsx    # Text reveal animation
│   │   │   └── constants.ts    # Timing, colors (shared brand values)
│   │   └── index.ts            # registerRoot entry
│   ├── remotion.config.ts
│   ├── package.json             # remotion, @remotion/cli, @remotion/renderer
│   └── tsconfig.json            # Separate config, no @/* alias conflict
├── public/
│   └── videos/
│       ├── demo.mp4             # Rendered output (committed to git)
│       ├── demo.webm            # WebM alternative
│       └── demo-poster.webp     # First frame poster
├── src/
│   ├── app/[locale]/
│   │   ├── page.tsx             # Modified: add DemoVideo section
│   │   ├── privacy/
│   │   │   └── page.tsx         # New: Privacy Policy
│   │   └── support/
│   │       └── page.tsx         # New: Support URL
│   ├── components/
│   │   ├── DemoVideo/
│   │   │   └── DemoVideo.tsx    # New: <video> embed with lazy-load
│   │   └── Footer/
│   │       └── Footer.tsx       # Modified: add privacy link
│   └── messages/
│       ├── fr.json              # Modified: add namespaces
│       └── en.json              # Modified: add namespaces
└── scripts/
    └── render-video.sh          # Convenience wrapper for Remotion render
```

### Structure Rationale

- **`remotion/` at project root with own `package.json`:** Complete isolation from the Next.js build. Remotion has its own Webpack bundler; mixing it into `src/` causes import resolution conflicts. Sharing brand values is done by copying constants, not by import aliasing. The `remotion` folder name at root does NOT conflict with the `remotion` npm package because `@/*` resolves to `./src/*` only.
- **`public/videos/`:** Standard Next.js static asset directory. Vercel serves from CDN with automatic caching. Committed to git so deploys are self-contained (no build-time rendering on Vercel).
- **`privacy/` and `support/` as nested routes under `[locale]/`:** Inherits the existing layout (Nav, fonts, theme, i18n provider). `generateStaticParams` from layout handles locale generation. These render as pure RSCs -- zero client JS.

## Architectural Patterns

### Pattern 1: Separate Remotion Workspace (Dev-Only Tool)

**What:** Remotion lives in its own directory with its own dependencies, completely decoupled from Next.js. It renders MP4/WebM files that are committed as static assets.
**When to use:** When video content is fixed (not user-customizable at runtime).
**Trade-offs:** (+) Zero production bundle impact, no config conflicts, clean separation. (-) Must re-render manually when video content changes; no runtime customization.

```json
// remotion/package.json
{
  "private": true,
  "scripts": {
    "studio": "remotion studio",
    "render": "remotion render DemoVideo --output ../public/videos/demo.mp4 --codec h264",
    "render:webm": "remotion render DemoVideo --output ../public/videos/demo.webm --codec vp8"
  },
  "dependencies": {
    "remotion": "^4.x",
    "@remotion/cli": "^4.x",
    "react": "^19.x",
    "react-dom": "^19.x"
  }
}
```

**Waveform in Remotion:** The existing `Waveform.tsx` uses Canvas 2D API. In Remotion compositions, the same bar-drawing logic can be implemented with React SVG `<rect>` elements animated via `useCurrentFrame()` and `interpolate()`. This is actually simpler than canvas because Remotion handles the animation timeline. Brand colors and bar dimensions from the existing component (`BAR_COUNT=30`, `BAR_SPACING=3`, center-weighted gradient) should be ported directly to maintain visual consistency between site and video.

### Pattern 2: Static Compliance Pages with next-intl

**What:** Privacy Policy and Support as Server Components under `[locale]/`, using `getTranslations` for bilingual content.
**When to use:** Content pages that need i18n and share the site layout.
**Trade-offs:** (+) Zero client JS, perfect SEO, reuses existing layout/providers. (-) Content in JSON messages files (appropriate for short legal text).

```typescript
// src/app/[locale]/privacy/page.tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { fr: "/fr/privacy", en: "/en/privacy" },
    },
  };
}

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-normal text-white">{t("title")}</h1>
      {/* Structured sections from translation keys */}
    </article>
  );
}
```

**Critical requirements for each new page:**
1. Call `setRequestLocale(locale)` -- required by next-intl for static generation
2. Export `generateStaticParams` -- generates `/fr/privacy` and `/en/privacy`
3. Export `generateMetadata` -- SEO metadata with alternates for hreflang
4. No `"use client"` -- these are pure server components

### Pattern 3: Lazy Video Embed with IntersectionObserver

**What:** Client component that loads and plays `<video>` only when scrolled into view.
**When to use:** Below-the-fold video content.
**Trade-offs:** (+) Zero initial page load impact, LCP unaffected. (-) Brief delay when video enters viewport (mitigated by poster image and 200px rootMargin preload).

```typescript
// src/components/DemoVideo/DemoVideo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function DemoVideo() {
  const t = useTranslations("DemoVideo");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // preload 200px before viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-center text-2xl font-normal text-white">
        {t("title")}
      </h2>
      <div ref={containerRef} className="mx-auto max-w-sm">
        {isVisible ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/demo-poster.webp"
            className="w-full rounded-2xl"
            // Explicit dimensions prevent CLS
            width={390}
            height={844}
          >
            <source src="/videos/demo.webm" type="video/webm" />
            <source src="/videos/demo.mp4" type="video/mp4" />
          </video>
        ) : (
          // Placeholder matching video aspect ratio to prevent CLS
          <div
            className="w-full rounded-2xl bg-surface"
            style={{ aspectRatio: "390/844" }}
          />
        )}
      </div>
    </section>
  );
}
```

**iOS-specific requirements:**
- `playsInline` is mandatory -- without it, iOS Safari forces fullscreen
- `muted` is mandatory for autoplay to work on all browsers
- WebM `<source>` listed first for Chrome/Firefox (smaller files), MP4 fallback for Safari

## Data Flow

### Video Asset Pipeline (One-Time, Dev Process)

```
Remotion Studio (local dev)
    ↓ compose: phone frame + waveform animation + text reveal
remotion render → MP4 + WebM
    ↓ copy to public/videos/
git commit assets
    ↓
Vercel deploy → CDN-served static files
    ↓
<video> element → lazy-loaded on scroll via IntersectionObserver
```

### Compliance Pages Data Flow

```
messages/fr.json ("Privacy" namespace)
messages/en.json ("Privacy" namespace)
    ↓ getTranslations at build time (static generation)
[locale]/privacy/page.tsx (RSC)
    ↓ HTML output
Vercel → CDN-cached static HTML
    ↓
App Store Connect → links to https://getdictus.com/fr/privacy
```

### Integration with Landing Page

```
[locale]/page.tsx (existing)
    ├── <Hero />
    ├── <ScrollReveal><Features /></ScrollReveal>
    ├── <ScrollReveal><DemoVideo /></ScrollReveal>   ← NEW section
    ├── <ScrollReveal><Comparison /></ScrollReveal>
    ├── <ScrollReveal><HowItWorks /></ScrollReveal>
    ├── <ScrollReveal><OpenSource /></ScrollReveal>
    ├── <ScrollReveal><Community /></ScrollReveal>
    └── <Footer />                                   ← MODIFIED: privacy link
```

### Key Data Flows

1. **Video embedding:** Static MP4/WebM from `public/videos/` via `<video>`. No API calls, no streaming, no JS library. Zero runtime cost beyond the `<video>` element itself.
2. **Privacy page i18n:** Translation keys in `messages/*.json` -> `getTranslations("Privacy")` -> static HTML. Identical pattern to all existing sections.
3. **Footer -> Privacy link:** Use `Link` from `@/i18n/navigation` for locale-aware linking (`/fr/privacy` or `/en/privacy` based on active locale).
4. **Sitemap expansion:** Add privacy and support URLs with `alternates.languages` matching existing pattern in `sitemap.ts`.

## Files Changed: Complete Manifest

### New Files

| File | Type | Purpose |
|------|------|---------|
| `src/app/[locale]/privacy/page.tsx` | RSC | Privacy Policy page |
| `src/app/[locale]/support/page.tsx` | RSC | Support URL page (mailto + info) |
| `src/components/DemoVideo/DemoVideo.tsx` | Client | Video embed with lazy-loading |
| `public/videos/demo.mp4` | Asset | Pre-rendered demo video (H.264) |
| `public/videos/demo.webm` | Asset | WebM version for modern browsers |
| `public/videos/demo-poster.webp` | Asset | Poster frame image |
| `remotion/` (entire directory) | Dev tooling | Remotion compositions + render config |

### Modified Files

| File | Change | Scope |
|------|--------|-------|
| `src/app/[locale]/page.tsx` | Add `<DemoVideo />` section | ~5 lines: import + JSX |
| `src/components/Footer/Footer.tsx` | Add Privacy Policy link | ~10 lines: Link import + anchor |
| `src/app/sitemap.ts` | Add /privacy and /support entries | ~30 lines: 2 route objects with alternates |
| `src/messages/fr.json` | Add Privacy, Support, DemoVideo namespaces | New translation keys |
| `src/messages/en.json` | Add Privacy, Support, DemoVideo namespaces | New translation keys |

### Unchanged (But Relevant)

| File | Why Relevant |
|------|-------------|
| `src/app/[locale]/layout.tsx` | Already handles all locale pages -- no changes needed |
| `next.config.ts` | No Remotion config needed (pre-render approach) |
| `src/proxy.ts` | Middleware matcher `/((?!api\|trpc\|_next\|_vercel\|.*\\..*).*)`already covers new routes |
| `src/i18n/routing.ts` | Locale config unchanged |

## Build Order (Dependency-Aware)

```
Phase 1: Foundation (independent tasks, can parallelize)
├── 1a. Privacy Policy page (RSC + translations + metadata)
├── 1b. Support page (RSC + translations + metadata)
└── 1c. Remotion workspace setup (own package.json, composition skeleton)

Phase 2: Integration (depends on Phase 1)
├── 2a. Footer modification -- add Privacy link (depends on 1a existing)
├── 2b. Sitemap expansion -- add /privacy + /support (depends on 1a, 1b)
└── 2c. Remotion video composition -- scenes, waveform port, timing (depends on 1c)

Phase 3: Video Embedding (depends on 2c render output)
├── 3a. Render final MP4/WebM from Remotion
├── 3b. DemoVideo component with lazy-loading
└── 3c. Insert DemoVideo section into landing page

Phase 4: Validation
├── 4a. Video optimization (compression, poster frame extraction)
├── 4b. Lighthouse audit (verify 90+ scores maintained)
├── 4c. Cross-browser video testing (Safari playsInline, Chrome WebM, Firefox)
└── 4d. App Store Connect validation (privacy URL accessible, support URL works)
```

**Ordering rationale:** Privacy/Support pages are independent of video work and should ship first -- they unblock the App Store submission. Remotion composition is the creative bottleneck and runs in parallel. Video embedding is last because it depends on the final rendered asset.

**Critical path:** 1a -> 2a (Footer link) unblocks App Store submission. 1c -> 2c -> 3a -> 3b -> 3c is the video pipeline.

## Anti-Patterns

### Anti-Pattern 1: Embedding Remotion Player in Production

**What people do:** Install `@remotion/player` and render compositions live in the browser.
**Why it's wrong:** 150-250kb bundle increase for a video that never changes at runtime. Requires Webpack overrides in `next.config.ts`. Pulls in a second React reconciler. Destroys Lighthouse scores.
**Do this instead:** Pre-render to MP4/WebM. Embed with native `<video>`. Zero JS cost.

### Anti-Pattern 2: Putting Remotion Inside src/

**What people do:** Create `src/remotion/` and share components between Remotion and Next.js.
**Why it's wrong:** Remotion has its own Webpack bundler. The `@/*` path alias can cause import resolution conflicts. The folder name `remotion` can shadow the npm package in certain configs.
**Do this instead:** Keep `remotion/` at the project root with its own `package.json` and `tsconfig.json`. Share brand values by copying constants, not by cross-importing.

### Anti-Pattern 3: Privacy Policy via MDX or External CMS

**What people do:** Use MDX plugin, Contentful, or raw HTML for legal pages.
**Why it's wrong:** Adds build complexity (MDX plugin) or external dependencies (CMS API calls). For a bilingual privacy policy that changes rarely, this is overengineering.
**Do this instead:** Keep content in `messages/*.json` translation files. Same pattern as all existing site content. Easy to update, easy to translate.

### Anti-Pattern 4: Autoplay Video Without playsInline on iOS

**What people do:** Use `<video autoplay>` without `playsInline` attribute.
**Why it's wrong:** iOS Safari forces fullscreen playback without `playsInline`. The video hijacks the screen.
**Do this instead:** Always use `<video autoPlay muted loop playsInline>`. The `muted` attribute is also required for autoplay to work in all browsers.

### Anti-Pattern 5: Dynamic Rendering for Compliance Pages

**What people do:** Use `headers()` or `cookies()` in privacy/support pages, accidentally triggering dynamic rendering.
**Why it's wrong:** Breaks static generation. Pages become server-rendered on every request instead of served from CDN cache.
**Do this instead:** Use only `getTranslations` with `setRequestLocale`. Export `generateStaticParams`. No dynamic APIs.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Remotion workspace -> Next.js | File copy (MP4 to `public/videos/`) | One-way, manual render then git commit |
| DemoVideo component -> page.tsx | React import + JSX composition | Standard component, wrapped in ScrollReveal |
| Privacy/Support pages -> layout.tsx | Automatic via App Router nesting | Zero config, inherits all providers |
| Footer -> Privacy page | `Link` from `@/i18n/navigation` | Locale-aware internal linking |
| sitemap.ts -> new routes | Manual URL entries | Add alternates per locale |
| messages/*.json -> new pages | `getTranslations` namespace | Add Privacy, Support, DemoVideo keys |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| App Store Connect | Privacy Policy URL: `https://getdictus.com/fr/privacy` | Must be publicly accessible HTTPS |
| App Store Connect | Support URL: `https://getdictus.com/fr/support` or `mailto:` | Can be a page or direct mailto |
| Vercel CDN | Video files from `public/videos/` | Automatic caching, no config needed |

## Video Specifications

| Property | Value | Rationale |
|----------|-------|-----------|
| Resolution | 1080x1920 (portrait) or 390x844 (phone-size) | Phone-frame mockup, displayed small |
| Codec | H.264 Baseline (MP4) + VP9 (WebM) | Maximum compatibility |
| Duration | 8-15 seconds, looping | Show full idle->record->transcribe->insert cycle |
| File size target | < 5MB (MP4), < 3MB (WebM) | Lazy-loaded but still a page weight concern |
| FPS | 30 | Sufficient for UI animation, halves file size vs 60fps |
| Audio | None (muted) | Autoplay requires muted; no audio needed for demo |
| Poster | WebP, first frame, < 50KB | Shown before video loads |

## Sources

- [Remotion Player docs](https://www.remotion.dev/docs/player/) -- Player component API (MEDIUM confidence)
- [Remotion brownfield installation](https://www.remotion.dev/docs/brownfield) -- Installing in existing projects (HIGH confidence)
- [Remotion Next.js App Dir template](https://github.com/remotion-dev/template-next-app-dir) -- Reference architecture (HIGH confidence)
- [Remotion code sharing](https://www.remotion.dev/docs/player/integration) -- Composition integration patterns (MEDIUM confidence)
- [Apple App Store Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) -- Privacy policy URL requirements (HIGH confidence)
- [App Store Review Guidelines checklist](https://nextnative.dev/blog/app-store-review-guidelines) -- Submission requirements (MEDIUM confidence)
- [App Store Privacy Policy Requirements](https://iossubmissionguide.com/app-store-privacy-policy-requirements) -- 2025 compliance guide (MEDIUM confidence)

---
*Architecture research for: Remotion demo video + App Store compliance integration with Next.js App Router + next-intl*
*Researched: 2026-03-17*

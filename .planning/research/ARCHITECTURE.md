# Architecture Patterns

**Domain:** Premium animated Next.js landing page (single-page, bilingual, static)
**Researched:** 2026-03-09

## Recommended Architecture

A statically generated, single-page Next.js App Router site with locale-segmented routing (`/fr`, `/en`), server-rendered content, and client-side animation islands. Zero backend, zero API routes, zero dynamic rendering.

### High-Level Structure

```
Request -> Middleware (locale detection + redirect)
        -> /[locale]/page.tsx (Server Component, loads dictionary)
           -> <Layout> (server: fonts, metadata, html lang)
              -> <Header /> (client: locale switch, scroll state)
              -> <Hero /> (client: sine wave animation, word-by-word text)
              -> <Features /> (client: scroll-triggered reveals)
              -> <OpenSource /> (server-first, minimal interactivity)
              -> <CTA /> (client: glow/pulse animation)
              -> <Footer /> (server)
```

**Key principle:** Server Components by default. Only add `"use client"` for components that need animation, scroll listeners, or user interaction. This keeps the JS bundle minimal for Lighthouse 90+.

### File/Folder Structure

```
src/
  app/
    [locale]/
      layout.tsx          # Root layout: html lang, fonts, global styles
      page.tsx            # Single landing page (composes sections)
      dictionaries.ts     # Dictionary loader (server-only)
      not-found.tsx       # 404 page
    dictionaries/
      fr.json             # French translations
      en.json             # English translations
    globals.css           # Tailwind directives + custom CSS vars
    sitemap.ts            # Dynamic sitemap generation
    robots.ts             # Robots.txt generation
  components/
    layout/
      Header.tsx          # Navigation + locale switcher
      Footer.tsx          # Links, legal, branding
    sections/
      Hero.tsx            # Hero with sine animation + typed text
      Features.tsx        # Feature cards grid
      SmartMode.tsx       # Smart Mode showcase
      Privacy.tsx         # Privacy/offline section
      OpenSource.tsx      # GitHub CTA section
      Download.tsx        # TestFlight / App Store CTA
    ui/
      Button.tsx          # Reusable CTA button with glow
      Card.tsx            # Glassmorphism card
      Badge.tsx           # Status badges (coming soon, etc.)
      SineWave.tsx        # Animated sine wave canvas/SVG
      WordReveal.tsx      # Word-by-word text animation
      GlassPanel.tsx      # Glassmorphism container
      LocaleSwitcher.tsx  # FR/EN toggle
    icons/
      DictusLogo.tsx      # SVG logo component (waveform icon)
      DictusWordmark.tsx  # SVG wordmark
  lib/
    i18n.ts               # Locale config, supported locales array
    fonts.ts              # DM Sans + DM Mono font config (next/font/google)
    metadata.ts           # Shared metadata generation helpers
  middleware.ts           # Locale detection + redirect
  types/
    dictionary.ts         # TypeScript type for translation keys
public/
  og-image-fr.png         # OpenGraph image (French)
  og-image-en.png         # OpenGraph image (English)
  favicon.ico
  apple-touch-icon.png
```

### Component Boundaries

| Component | Responsibility | Rendering | Communicates With |
|-----------|---------------|-----------|-------------------|
| `middleware.ts` | Locale detection, redirect to /fr or /en | Edge | Browser request |
| `[locale]/layout.tsx` | HTML shell, fonts, global metadata, `<html lang>` | Server | All children, dictionaries.ts |
| `[locale]/page.tsx` | Section composition, dictionary loading | Server | All section components |
| `Header` | Navigation, logo, locale switcher, scroll-aware bg | Client | LocaleSwitcher, scroll events |
| `Hero` | Primary CTA, sine wave animation, typed text effect | Client | SineWave, WordReveal, Button |
| `Features` | Feature cards with scroll-triggered entry | Client | Card, scroll observer |
| `SmartMode` | LLM mode visual showcase | Client | Animation state |
| `Privacy` | Offline/privacy messaging | Server (or light client) | Card |
| `OpenSource` | GitHub repo link, community CTA | Server | Button |
| `Download` | TestFlight/App Store CTA | Server (or light client) | Button, Badge |
| `Footer` | Links, legal, branding | Server | DictusWordmark |
| `LocaleSwitcher` | FR/EN toggle, updates URL locale segment | Client | next/navigation router |
| `SineWave` | Canvas or SVG sine animation with state colors | Client | requestAnimationFrame loop |
| `WordReveal` | Word-by-word text appearance animation | Client | Motion (framer) |

### Data Flow

```
1. ROUTING FLOW
   Browser Request
     -> middleware.ts (reads Accept-Language header)
     -> Redirects to /fr/ or /en/ (or stays if locale present)
     -> [locale]/layout.tsx receives locale param
     -> [locale]/page.tsx receives locale param

2. TRANSLATION FLOW
   page.tsx (Server Component)
     -> getDictionary(locale) loads fr.json or en.json
     -> Dictionary object passed as props to section components
     -> Each section reads its keys from the dictionary
     -> Client components receive translations as props (NOT via context)

3. ANIMATION FLOW
   Page loads (SSR HTML visible immediately)
     -> Client hydration activates "use client" components
     -> SineWave starts requestAnimationFrame loop
     -> WordReveal triggers Motion enter animation
     -> Scroll observer activates section reveal animations
     -> All animations are progressive enhancement (content visible without JS)

4. LOCALE SWITCH FLOW
   User clicks FR/EN toggle
     -> LocaleSwitcher uses next/navigation to push new locale path
     -> Full re-render with new locale (static pages, instant from cache)
```

## i18n Architecture: Lightweight Dictionary Pattern

**Decision: Use Next.js built-in pattern (no next-intl).** Rationale: this is a single-page landing with ~50-80 translation keys. next-intl adds 2KB+ and middleware complexity for features (pluralization, ICU messages, number formatting) this project does not need. The official Next.js dictionary pattern is sufficient and keeps dependencies minimal.

### How It Works

```typescript
// src/app/[locale]/dictionaries.ts
import 'server-only'

const dictionaries = {
  fr: () => import('../dictionaries/fr.json').then(m => m.default),
  en: () => import('../dictionaries/en.json').then(m => m.default),
}

export type Locale = keyof typeof dictionaries
export const locales: Locale[] = ['fr', 'en']
export const defaultLocale: Locale = 'fr'

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
```

```typescript
// src/app/[locale]/page.tsx
import { getDictionary, hasLocale } from './dictionaries'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const dict = await getDictionary(locale)

  return (
    <>
      <Hero dict={dict.hero} locale={locale} />
      <Features dict={dict.features} />
      {/* ... */}
    </>
  )
}
```

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'

const locales = ['fr', 'en']
const defaultLocale = 'fr'

function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' }
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = locales.some(
    l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  )
  if (hasLocale) return
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next|.*\\.).*)'],
}
```

**Upgrade path:** If the site ever needs pluralization, date formatting, or grows beyond a single page, migrate to next-intl. The `[locale]` folder structure is compatible.

## Animation Architecture: Motion (formerly Framer Motion)

**Decision: Use Motion (`motion/react`).** The library formerly known as Framer Motion, now rebranded as Motion, is the standard for React animation. It provides declarative animation props, scroll-triggered animations, and layout animations out of the box.

### Animation Strategy

| Animation | Technique | Component | Bundle Impact |
|-----------|-----------|-----------|---------------|
| Sine wave (hero) | Canvas API + requestAnimationFrame | `SineWave.tsx` | Zero library dependency (vanilla Canvas) |
| Word-by-word text | Motion `animate` + staggered children | `WordReveal.tsx` | Motion |
| Section scroll reveals | Motion `whileInView` | Each section wrapper | Motion |
| Button glow/pulse | CSS animations + Tailwind | `Button.tsx` | Zero JS |
| Glassmorphism hover | CSS transitions + Tailwind | `Card.tsx`, `GlassPanel.tsx` | Zero JS |
| State color transitions | CSS transitions | `SineWave.tsx` | Zero JS |
| Locale switch | No animation (instant page swap) | Router | Zero |

**Key principle: CSS-first animation.** Use Motion only where CSS cannot achieve the effect (orchestrated sequences, scroll-triggered staggered reveals, spring physics). Keep glows, pulses, hovers, and color transitions in CSS/Tailwind for zero JS overhead.

### Motion Component Pattern

```typescript
// "use client" only on components that animate
'use client'

import { motion } from 'motion/react'

export function SectionReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

### Sine Wave: Vanilla Canvas (No Library)

The hero sine wave animation should use raw Canvas API, not Motion or any library. Reasons: (1) sine wave is a continuous rAF loop, not a declarative animation; (2) avoids Motion's overhead for something it was not designed for; (3) matches the app's native Swift sine animation more closely.

```typescript
'use client'
import { useRef, useEffect } from 'react'

export function SineWave({ state }: { state: 'idle' | 'recording' | 'transcribing' | 'smart' | 'inserted' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId: number

    const draw = (time: number) => {
      // Clear, draw sine wave based on state
      // Color and amplitude vary by state
      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [state])

  return <canvas ref={canvasRef} className="w-full h-32" />
}
```

## SEO / Metadata Architecture

### Static Metadata + generateMetadata Per Locale

```typescript
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'

  return {
    title: isEn ? 'dictus — Private voice dictation for iOS' : 'dictus — Dictation vocale privee pour iOS',
    description: isEn
      ? '100% offline voice transcription keyboard. No data leaves your device.'
      : 'Clavier de transcription vocale 100% offline. Aucune donnee ne quitte votre appareil.',
    openGraph: {
      title: isEn ? 'dictus' : 'dictus',
      images: [`/og-image-${locale}.png`],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    alternates: {
      canonical: `https://getdictus.com/${locale}`,
      languages: { fr: '/fr', en: '/en' },
    },
  }
}
```

### Additional SEO Files

- `src/app/sitemap.ts` -- generates sitemap with both `/fr` and `/en` entries
- `src/app/robots.ts` -- allows all crawlers, points to sitemap
- `src/app/[locale]/opengraph-image.tsx` (optional) -- dynamic OG image generation via `ImageResponse`

## Patterns to Follow

### Pattern 1: Server-First with Client Islands

**What:** Default to Server Components. Only mark components as `"use client"` when they need browser APIs (animation, scroll, interaction).

**When:** Every component decision.

**Why:** Keeps JS bundle under control. For a landing page targeting Lighthouse 90+, most content is static HTML/CSS. Only the hero animation, scroll observers, and locale switcher need client JS.

### Pattern 2: Props-Down Translation (No Context)

**What:** Load dictionary in the server page component, pass relevant sub-objects as props to each section.

**When:** All translated content.

**Why:** Avoids wrapping the app in a translation context provider (which forces client rendering). Each section receives only its own translation keys, making components self-contained and testable.

```typescript
// page.tsx
<Hero dict={dict.hero} />       // dict.hero has title, subtitle, cta
<Features dict={dict.features} /> // dict.features has items[]
```

### Pattern 3: Design Tokens as Tailwind Config

**What:** Map all brand kit tokens (colors, gradients, typography) into `tailwind.config.ts` as custom theme values.

**When:** Project setup.

**Why:** Single source of truth for design tokens. Avoids CSS variables scattered across files. Enables `bg-ink-deep`, `text-accent-blue`, `font-display` etc. throughout the codebase.

```typescript
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      ink: { DEFAULT: '#0B0F1A', deep: '#0A1628', 2: '#111827' },
      surface: '#161C2C',
      accent: { blue: '#3D7EFF', hi: '#6BA3FF' },
      sky: '#93C5FD',
      // ...semantic colors
      recording: '#EF4444',
      smart: '#8B5CF6',
      success: '#22C55E',
    },
    fontFamily: {
      display: ['DM Sans', 'sans-serif'],
      mono: ['DM Mono', 'monospace'],
    },
  }
}
```

### Pattern 4: Static Generation with generateStaticParams

**What:** Pre-render both `/fr` and `/en` at build time.

**When:** Build configuration.

**Why:** This is a static marketing site. No SSR needed. Both locale pages are generated as static HTML, served from Vercel's edge CDN. Instant TTFB, perfect for Lighthouse.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Translation Loading

**What:** Loading translations via `useEffect` or context providers on the client.

**Why bad:** Causes translation flash (FOUC), increases bundle size, defeats static generation. Translation strings end up in the JS bundle instead of the HTML.

**Instead:** Load dictionaries in Server Components, pass as props.

### Anti-Pattern 2: Wrapping Everything in "use client"

**What:** Making the root layout or page a client component to use Motion or state.

**Why bad:** Forces the entire page into client-side rendering. Destroys SEO benefits, bloats bundle, kills Lighthouse scores.

**Instead:** Keep layout and page as Server Components. Create small client component wrappers only for interactive parts.

### Anti-Pattern 3: Heavy Animation Library for Simple Effects

**What:** Using Motion for hover effects, color transitions, or opacity fades that CSS handles natively.

**Why bad:** Unnecessary JS bundle for effects Tailwind/CSS can achieve with `transition-all duration-300`.

**Instead:** CSS for simple transitions. Motion only for orchestrated sequences, scroll-triggered staggered reveals, and spring physics.

### Anti-Pattern 4: Single Giant Page Component

**What:** Putting all sections in one massive `page.tsx` file.

**Why bad:** Unmaintainable, hard to split server/client boundaries, poor code organization.

**Instead:** One component per section, composed in page.tsx.

## Scalability Considerations

| Concern | Current (Landing) | If Grows to Multi-Page | If Grows to Full Site |
|---------|-------------------|----------------------|---------------------|
| i18n | Dictionary pattern, ~80 keys | Still fine up to ~500 keys | Migrate to next-intl |
| Routing | Single page + locale | Add pages under [locale]/ | Same pattern scales |
| Animation | Motion + Canvas | Same | Consider code-splitting Motion |
| SEO | generateMetadata per locale | Add generateMetadata per page | Same pattern |
| Styling | Tailwind tokens | Same | Same |

## Suggested Build Order

Based on component dependencies, build in this order:

1. **Project scaffold + Tailwind config + fonts** -- everything depends on this
2. **i18n infrastructure** (middleware, dictionaries, [locale] layout) -- pages depend on this
3. **Design system primitives** (Button, Card, GlassPanel, Badge) -- sections depend on these
4. **Logo/Icon components** (DictusLogo, DictusWordmark) -- Header/Footer depend on these
5. **Layout components** (Header, Footer) -- page structure depends on these
6. **Static sections** (Privacy, OpenSource, Download) -- simplest sections, no complex animation
7. **Animated sections** (Features with scroll reveal) -- builds on Motion integration
8. **Hero section** (SineWave canvas + WordReveal) -- most complex, builds on everything above
9. **SEO files** (sitemap.ts, robots.ts, OG images, metadata) -- polish layer
10. **Performance optimization** (Lighthouse audit, bundle analysis) -- final validation

**Rationale:** Foundation first (config, i18n, tokens), then reusable primitives, then simple sections to validate the pattern, then complex animated sections last when the system is proven.

## Sources

- [Next.js Official i18n Guide (App Router)](https://nextjs.org/docs/app/guides/internationalization) -- HIGH confidence
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) -- HIGH confidence
- [Motion for React (formerly Framer Motion)](https://motion.dev/docs/react) -- HIGH confidence
- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router) -- HIGH confidence (evaluated, not recommended for this scope)
- [Next.js generateMetadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- HIGH confidence
- [GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion) -- MEDIUM confidence
- [Next.js folder structure best practices 2025](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji) -- MEDIUM confidence

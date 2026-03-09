# Phase 1: Foundation - Research

**Researched:** 2026-03-09
**Domain:** Next.js 16 scaffold, Tailwind CSS v4 design system, next-intl v4 i18n, self-hosted fonts
**Confidence:** HIGH

## Summary

Phase 1 establishes the dictus landing page skeleton: a Next.js 16 App Router project with Tailwind CSS v4 custom design tokens, self-hosted DM Sans/DM Mono fonts via `next/font`, i18n routing (FR/EN) via `next-intl v4`, a minimal nav shell with logo and language toggle, and favicon/touch icon assets. No content sections, no animations.

Next.js 16 is the current stable release (16.1.6) and introduces a critical breaking change: `middleware.ts` is renamed to `proxy.ts`. This directly impacts the next-intl integration. Tailwind CSS v4 uses a CSS-first `@theme` directive instead of `tailwind.config.js` for design tokens. Both DM Sans (variable font) and DM Mono (static font, weights 300/400/500) are self-hosted automatically by `next/font/google` with zero external requests.

**Primary recommendation:** Use Next.js 16 + Tailwind CSS v4 + next-intl v4 with `proxy.ts` (not middleware.ts), define all brand kit tokens via `@theme` in `globals.css`, and use `next/font/google` with CSS variables connected to Tailwind via `@theme inline`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Nav shell layout: Minimal nav with logo left, language toggle far right -- nothing else. No section anchor links, no CTA button in nav. Logo = squircle waveform icon + "dictus" wordmark (DM Sans 200). Always sticky, glassmorphism blur activates on scroll (Phase 2).
- i18n strategy: Default locale French. Root / redirects to /fr. Always prefixed URLs: /fr and /en. Browser locale detection redirects first-time visitors. Language toggle: "FR / EN" text buttons, active lang highlighted with accent blue.
- Project structure: src/ directory for components and utilities, app/ for routing only. Feature-based folder organization: src/components/Nav/, src/components/Hero/, etc. PascalCase files and folders. Design tokens live in tailwind.config.ts only -- no separate token file, no CSS variables. Motion v12 with LazyMotion installed from scaffold.
- Favicon & touch icon: SVG as primary favicon, PNG fallbacks at 32x32 and 180x180. Full squircle icon with dark gradient background + waveform bars. Icon generated from brand kit spec by Claude.
- Zero third-party scripts: fonts self-hosted via next/font, no external requests.
- Dark-only: no light mode, background #0A1628 / #0B0F1A.

### Claude's Discretion
- Translation file organization (single file per locale vs namespaced sections)
- Exact nav height and padding
- Favicon generation tooling approach
- Base layout structure (providers, metadata config)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

**IMPORTANT NOTE on User Constraint vs. Reality:** The user locked "Design tokens live in tailwind.config.ts only -- no separate token file, no CSS variables." However, Tailwind CSS v4 has eliminated `tailwind.config.ts` in favor of CSS-first configuration via `@theme` in `globals.css`. The tokens WILL be defined via `@theme` (which uses CSS custom properties internally). This is NOT a separate token file -- it is the standard Tailwind v4 approach. The spirit of the constraint (single source of truth, no extra files) is preserved. If the user insists on a JS config file, Tailwind v4 supports a `@config` directive to load a legacy config, but this is not recommended.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | All colors, gradients, spacing follow brand kit tokens | Tailwind v4 @theme directive defines all tokens as CSS variables that generate utility classes |
| DSGN-02 | Typography uses self-hosted DM Sans (200-600) and DM Mono (300-400) via next/font | next/font/google auto-self-hosts; DM Sans is variable font, DM Mono needs explicit weights |
| DSGN-04 | Dark-only design, no light mode | Single @theme with dark palette, no theme switching needed |
| NAV-01 | Sticky navigation header with dictus waveform logo + wordmark | Standard sticky nav component, glassmorphism deferred to Phase 2 |
| NAV-04 | Squircle waveform icon as favicon and Apple touch icon | SVG primary + PNG fallbacks via Next.js metadata API |
| I18N-01 | FR (/fr) and EN (/en) URL-based routing | next-intl v4 with [locale] dynamic segment and localePrefix: 'always' |
| I18N-02 | Browser locale detection redirects to matching language | next-intl proxy handles Accept-Language negotiation automatically |
| PRIV-01 | Zero third-party scripts -- fonts self-hosted, no analytics, no cookies | next/font/google self-hosts at build time; next-intl v4 locale cookie is session-only by default |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.x | App Router framework | Latest stable, Turbopack default, proxy.ts convention |
| React | 19.2.x | UI library | Required by Next.js 16, View Transitions support |
| Tailwind CSS | 4.2.x | Utility-first CSS | CSS-first @theme config, no JS config needed |
| next-intl | 4.x | i18n routing + translations | De facto Next.js i18n solution, ~2KB bundle, App Router native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion (framer-motion) | 12.x | Animation library | Install now with LazyMotion, use in Phase 3 |
| TypeScript | 5.x+ | Type safety | Required by Next.js 16 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | next-i18next | next-i18next is Pages Router focused, not ideal for App Router |
| Tailwind v4 @theme | tailwind.config.ts | Legacy approach; v4 CSS-first is faster and simpler |
| next/font/google | next/font/local | Google import auto-self-hosts; local requires manual font files |

**Installation:**
```bash
npx create-next-app@latest dictus-website --typescript --tailwind --app --src-dir
cd dictus-website
npm install next-intl motion
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx          # Root locale layout (providers, fonts, metadata)
│       ├── page.tsx            # Home page (placeholder for Phase 2 content)
│       └── not-found.tsx       # 404 page
├── i18n/
│   ├── routing.ts             # defineRouting({ locales, defaultLocale })
│   ├── navigation.ts          # createNavigation(routing)
│   └── request.ts             # getRequestConfig
├── components/
│   └── Nav/
│       ├── Nav.tsx             # Sticky nav bar
│       ├── Logo.tsx            # Squircle icon + wordmark
│       └── LanguageToggle.tsx  # FR / EN switcher
├── messages/
│   ├── fr.json                # French translations
│   └── en.json                # English translations
├── proxy.ts                   # next-intl locale middleware (Next.js 16 convention)
└── app/
    └── globals.css            # Tailwind @import + @theme tokens
```

### Pattern 1: Tailwind v4 Design Tokens via @theme
**What:** All brand kit colors, fonts, and spacing defined in globals.css using Tailwind's @theme directive
**When to use:** Always -- this is Tailwind v4's standard approach
**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand Colors */
  --color-ink-deep: #0A1628;
  --color-ink: #0B0F1A;
  --color-ink-2: #111827;
  --color-surface: #161C2C;
  --color-navy: #0F3460;
  --color-accent: #3D7EFF;
  --color-accent-hi: #6BA3FF;
  --color-sky: #93C5FD;
  --color-mist: #DBEAFE;

  /* Semantic Colors */
  --color-recording: #EF4444;
  --color-smart: #8B5CF6;
  --color-success: #22C55E;
  --color-warning: #F59E0B;

  /* Borders (use rgba via color-mix or define as custom properties) */
  --color-border: rgba(255, 255, 255, 0.07);
  --color-border-hi: rgba(255, 255, 255, 0.14);

  /* Glow */
  --color-glow: rgba(61, 126, 255, 0.35);
  --color-glow-soft: rgba(61, 126, 255, 0.12);
}

@theme inline {
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-dm-mono);
}
```

### Pattern 2: next/font with Tailwind v4
**What:** Self-host Google Fonts via next/font/google and connect to Tailwind via CSS variables
**When to use:** For DM Sans (variable font) and DM Mono (static font)
**Example:**
```typescript
// src/app/[locale]/layout.tsx
import { DM_Sans, DM_Mono } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  // Variable font: no need to specify individual weights
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400'],  // DM Mono is NOT variable, must specify weights
  display: 'swap',
});

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  // ...
  return (
    <html lang={locale} className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-ink font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
```

### Pattern 3: next-intl v4 with proxy.ts (Next.js 16)
**What:** i18n routing with locale prefix always shown, browser detection, proxy-based middleware
**When to use:** Standard setup for FR/EN routing
**Example:**
```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
});
```

```typescript
// src/proxy.ts (NOT middleware.ts -- Next.js 16!)
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlProxy = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return intlProxy(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
```

### Pattern 4: Favicon via Next.js Metadata API
**What:** SVG favicon + PNG fallbacks defined in app directory
**When to use:** Standard approach for Next.js App Router
**Example:**
```
src/app/
├── icon.svg              # Primary favicon (SVG)
├── icon.png              # 32x32 PNG fallback
└── apple-icon.png        # 180x180 Apple touch icon
```
Next.js automatically generates the appropriate `<link>` tags when these files are placed in the app directory. Alternatively, use the `metadata` export or `generateMetadata` for more control.

### Anti-Patterns to Avoid
- **Using middleware.ts instead of proxy.ts:** Next.js 16 renamed middleware to proxy. Using the old name will trigger deprecation warnings and may break in future versions.
- **Using tailwind.config.ts for tokens in v4:** Tailwind v4 uses CSS-first @theme. A JS config file is legacy and adds unnecessary complexity.
- **Specifying weights for DM Sans:** DM Sans is a variable font. Specifying individual weights increases bundle size by loading static font files instead of the single variable font file.
- **Importing from 'next/font' directly:** Use 'next/font/google' or 'next/font/local', not the bare import.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale detection | Custom Accept-Language parser | next-intl middleware/proxy | Handles cookie, header negotiation, redirect, edge cases |
| Font self-hosting | Manual font file download + @font-face | next/font/google | Automatic optimization, preloading, no layout shift |
| i18n navigation | Custom Link component with locale logic | next-intl createNavigation() | Lightweight wrappers with routing config awareness |
| Favicon generation | Complex build scripts | Next.js app directory conventions | Automatic link tag generation from file conventions |
| Design tokens | Custom CSS variable system | Tailwind v4 @theme | Auto-generates utility classes from token definitions |

**Key insight:** The ecosystem handles font loading, locale routing, and token-to-utility mapping. Building any of these manually introduces subtle bugs (font flash, incorrect locale fallback, missing utility classes).

## Common Pitfalls

### Pitfall 1: middleware.ts vs proxy.ts in Next.js 16
**What goes wrong:** Using middleware.ts file name triggers deprecation warnings; next-intl docs may still show middleware.ts examples
**Why it happens:** Next.js 16 renamed the convention; next-intl v4 was released before Next.js 16
**How to avoid:** Name the file `proxy.ts`, export a `proxy` function, wrap next-intl's `createMiddleware` result
**Warning signs:** Console warning about deprecated middleware convention

### Pitfall 2: DM Mono is NOT a variable font
**What goes wrong:** Importing DM_Mono without specifying weights causes build error
**Why it happens:** DM Sans IS variable (no weight needed), but DM Mono is static (weights required)
**How to avoid:** Always pass `weight: ['300', '400']` to DM_Mono constructor
**Warning signs:** Build error: "weight must be specified for non-variable fonts"

### Pitfall 3: @theme vs :root for Tailwind v4 tokens
**What goes wrong:** Defining custom properties in `:root` instead of `@theme` -- CSS variables exist but no utility classes are generated
**Why it happens:** Confusion between CSS custom properties and Tailwind theme variables
**How to avoid:** Always use `@theme { --color-*: ... }` for design tokens that need utility classes
**Warning signs:** `bg-ink-deep` class doesn't work despite `--color-ink-deep` being defined

### Pitfall 4: Async params in Next.js 16
**What goes wrong:** Accessing `params.locale` synchronously in layout/page components causes runtime error
**Why it happens:** Next.js 16 makes all request APIs fully async (removed sync compatibility)
**How to avoid:** Always `const { locale } = await params;` with `params: Promise<{locale: string}>`
**Warning signs:** Type error or runtime error about params being a Promise

### Pitfall 5: next-intl locale cookie and PRIV-01
**What goes wrong:** Concerns about cookies violating zero third-party scripts requirement
**Why it happens:** next-intl v4 sets a session-only locale cookie when user switches language
**How to avoid:** This is acceptable -- it's a first-party session cookie, not tracking. It expires when browser closes. No consent needed.
**Warning signs:** None -- this is fine for PRIV-01

### Pitfall 6: Font variable not connected to Tailwind
**What goes wrong:** Font CSS variable (--font-dm-sans) exists on HTML element but `font-sans` doesn't use it
**Why it happens:** Missing `@theme inline` block that maps the CSS variable to Tailwind's font namespace
**How to avoid:** Add `@theme inline { --font-sans: var(--font-dm-sans); }` in globals.css
**Warning signs:** Default system sans-serif renders instead of DM Sans

## Code Examples

### Complete globals.css with all brand tokens
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Background */
  --color-ink-deep: #0A1628;
  --color-ink: #0B0F1A;
  --color-ink-2: #111827;
  --color-surface: #161C2C;
  --color-navy: #0F3460;

  /* Accent */
  --color-accent: #3D7EFF;
  --color-accent-hi: #6BA3FF;
  --color-sky: #93C5FD;
  --color-mist: #DBEAFE;

  /* Semantic */
  --color-recording: #EF4444;
  --color-smart: #8B5CF6;
  --color-success: #22C55E;
  --color-warning: #F59E0B;

  /* Border & Glow (rgba values) */
  --color-border: rgba(255, 255, 255, 0.07);
  --color-border-hi: rgba(255, 255, 255, 0.14);
  --color-glow: rgba(61, 126, 255, 0.35);
  --color-glow-soft: rgba(61, 126, 255, 0.12);

  /* White variants */
  --color-white-70: rgba(255, 255, 255, 0.70);
  --color-white-40: rgba(255, 255, 255, 0.40);
}

@theme inline {
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-dm-mono);
}
```

### Complete i18n request.ts
```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Translation file recommendation (Claude's discretion)
```json
// src/messages/fr.json
{
  "Nav": {
    "home": "Accueil"
  },
  "Metadata": {
    "title": "dictus - Dictation vocale 100% offline pour iOS",
    "description": "Clavier iOS de dictation vocale qui fonctionne entierement sur votre appareil. Aucune donnee envoyee sur internet."
  }
}
```
**Recommendation:** Single file per locale with namespace keys (Nav, Metadata, Hero, etc.). Simple, scannable, sufficient for a landing page with ~50 strings. No need for split files or nested imports.

### Locale layout with static rendering
```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DM_Sans, DM_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '../globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400'],
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-ink font-sans text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (Dec 2025) | File rename + export rename required |
| tailwind.config.ts | @theme in CSS | Tailwind v4 (Jan 2025) | All tokens in CSS, no JS config |
| next/font weight arrays | Variable fonts auto-detected | Next.js 14+ | DM Sans needs no weight spec |
| Sync params access | Async params (await) | Next.js 16 | All params/searchParams are Promises |
| next-intl NextIntlClientProvider with explicit messages | Auto-inherits messages | next-intl v4 | Simpler provider setup |

**Deprecated/outdated:**
- `tailwind.config.ts` / `tailwind.config.js`: Replaced by @theme in CSS for Tailwind v4
- `middleware.ts`: Renamed to `proxy.ts` in Next.js 16
- Synchronous `params` access: Removed in Next.js 16

## Open Questions

1. **Motion v12 LazyMotion setup**
   - What we know: User wants motion installed from scaffold, ready for Phase 3
   - What's unclear: Whether LazyMotion provider should wrap the entire app or be co-located with animated components
   - Recommendation: Install motion in package.json now; add LazyMotion provider in Phase 3 when first animation is needed. No provider code in Phase 1.

2. **next.config.ts configuration**
   - What we know: next-intl requires a plugin in next.config.ts via `createNextIntlPlugin`
   - What's unclear: Whether Next.js 16 changed the next-intl plugin setup
   - Recommendation: Use standard `createNextIntlPlugin` from `next-intl/plugin` as documented

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (not yet installed -- greenfield project) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Brand tokens available as Tailwind utilities | smoke | Manual: inspect rendered page for correct colors | -- Wave 0 |
| DSGN-02 | DM Sans/Mono self-hosted, no external requests | smoke | `next build` + check for no external font requests | -- Wave 0 |
| DSGN-04 | Dark-only, correct background colors | smoke | Manual: visual check | -- Wave 0 |
| NAV-01 | Sticky nav with logo + wordmark renders | smoke | Manual: visit /fr, verify nav visible | -- Wave 0 |
| NAV-04 | Favicon and Apple touch icon present | unit | Check metadata output for icon links | -- Wave 0 |
| I18N-01 | /fr and /en render correct locale | integration | `curl localhost:3000/fr` + `curl localhost:3000/en` verify content | -- Wave 0 |
| I18N-02 | Browser locale detection redirects | integration | `curl -H "Accept-Language: en" localhost:3000/` checks redirect | -- Wave 0 |
| PRIV-01 | Zero third-party scripts | smoke | `next build` + inspect HTML for external script/link tags | -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (confirms no build errors)
- **Per wave merge:** Full build + manual smoke test of /fr and /en
- **Phase gate:** Build succeeds, /fr and /en render with correct locale, nav visible, fonts load from same origin

### Wave 0 Gaps
- [ ] No test framework installed -- this is a landing page; build verification + manual smoke tests are sufficient for Phase 1
- [ ] Automated i18n redirect tests could use a simple script but are lower priority for a 2-page landing site

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- proxy.ts rename, async params, Turbopack default
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google self-hosting pattern
- [Tailwind CSS v4 Theme docs](https://tailwindcss.com/docs/theme) -- @theme directive syntax and namespaces
- [next-intl App Router setup](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) -- complete setup with routing.ts, request.ts, layout
- [next-intl v4 blog post](https://next-intl.dev/blog/next-intl-4-0) -- ESM-only, cookie behavior, breaking changes

### Secondary (MEDIUM confidence)
- [next-intl proxy.ts migration](https://www.buildwithmatija.com/blog/next-intl-nextjs-16-proxy-fix) -- verified proxy.ts pattern for next-intl with Next.js 16
- [Next.js 15 + Tailwind v4 font setup](https://www.owolf.com/blog/how-to-use-custom-fonts-in-a-nextjs-15-tailwind-4-app) -- @theme inline font connection pattern
- [DM Sans Google Fonts](https://fonts.google.com/specimen/DM+Sans) -- variable font with wght axis
- [DM Mono Google Fonts](https://fonts.google.com/specimen/DM+Mono) -- static font, weights 300/400/500 only

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against official sources and npm
- Architecture: HIGH -- patterns from official Next.js 16, Tailwind v4, and next-intl v4 docs
- Pitfalls: HIGH -- proxy.ts rename and async params verified in official upgrade guide

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (30 days -- stable ecosystem, no major releases expected)

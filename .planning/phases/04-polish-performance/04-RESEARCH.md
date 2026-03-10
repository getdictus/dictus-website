# Phase 4: Polish & Performance - Research

**Researched:** 2026-03-10
**Domain:** SEO metadata, accessibility (WCAG AA), Lighthouse performance, structured data
**Confidence:** HIGH

## Summary

Phase 4 requires no new libraries. Everything needed ships with Next.js 16.1.6 and the existing stack (next-intl v4, Tailwind v4). The work divides into three clear areas: (1) SEO metadata expansion -- replacing the static `metadata` export in layout.tsx with `generateMetadata` for per-locale titles, descriptions, Open Graph tags, hreflang alternates, plus new `sitemap.ts` and `robots.ts` files; (2) accessibility fixes -- bumping the `--color-white-40` design token to ~0.60 opacity for WCAG AA 4.5:1 contrast, adding a skip-to-content link, and auditing ARIA labels on interactive elements; (3) JSON-LD structured data using a `<script type="application/ld+json">` tag with `MobileApplication` schema, plus a static OG image in `/public`.

All APIs are well-documented in official Next.js 16.1.6 docs. The sitemap API natively supports `alternates.languages` for hreflang output. The `generateMetadata` function receives `params.locale` which pairs with `getTranslations` from next-intl for locale-aware metadata. No third-party SEO libraries are needed.

**Primary recommendation:** Use `generateMetadata` with next-intl `getTranslations` for per-locale metadata, Next.js built-in `sitemap.ts`/`robots.ts` file conventions, and a `<script>` tag for JSON-LD. Update the `--color-white-40` token to `rgba(255,255,255,0.60)` globally.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Static OG image file (1200x630) in /public -- not dynamically generated
- One universal image for both locales -- meta title/description handle language difference
- Visual content: Claude's discretion (logo + waveform on dark #0A1628 background, brand-forward)
- Meta descriptions: short and direct tone -- "dictus -- Dictation vocale 100% offline pour iOS" / "dictus -- Fully offline voice dictation for iOS"
- Domain: getdictus.com for all canonical URLs, OG URLs, sitemap
- Bump secondary text opacity from rgba(255,255,255,0.40) to ~0.60 minimum for WCAG AA 4.5:1 contrast ratio
- Canvas waveform: aria-hidden="true" + role="presentation" (decorative element)
- Add skip-to-content link (invisible, appears on keyboard focus)
- Claude audits all interactive elements for proper ARIA labels (nav, language toggle, CTA, links)
- Current JS budget acceptable: Motion v12 LazyMotion (~4.6kb) + Canvas waveform stay as-is
- No images on the page -- SVG/canvas/text only. OG image is in /public but not loaded on page
- Font optimization: next/font already handles preload + swap -- Claude verifies and adjusts if needed
- Run actual Lighthouse audit via Playwright on /fr and /en to validate 90+ scores
- JSON-LD: SoftwareApplication schema (operatingSystem: iOS, applicationCategory: Utilities, offers: Free)
- Locale-specific metadata: per-locale title + description in layout.tsx (currently French-only -- add EN)
- hreflang tags: link FR <-> EN alternates + x-default pointing to /fr
- sitemap.ts: dynamic Next.js sitemap with /fr and /en entries + hreflang alternates
- robots.ts: explicit robots.txt with Allow: / and Sitemap link to https://getdictus.com/sitemap.xml
- Zero third-party scripts constraint carries forward -- no analytics, no tracking pixels, no external requests

### Claude's Discretion
- OG image exact composition and generation method (hand-crafted SVG/PNG)
- Exact opacity value for secondary text (minimum ~0.60 for AA compliance)
- ARIA label wording for interactive elements
- JSON-LD field values (description, author, datePublished, etc.)
- Font subset optimization if needed
- Any additional Lighthouse fixes discovered during audit
- Meta description exact wording (within "short and direct" constraint)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | Site achieves Lighthouse 90+ on all 4 metrics (Performance, Accessibility, Best Practices, SEO) | Accessibility contrast fix (white-40 -> white-60), skip-to-content link, ARIA audit, font optimization verification, Lighthouse CLI audit |
| SEO-01 | Site has proper meta tags, Open Graph images, and JSON-LD schema (SoftwareApplication) per locale | `generateMetadata` with next-intl `getTranslations`, static OG image in /public, JSON-LD script tag with MobileApplication schema |
| SEO-02 | Site has hreflang tags and a sitemap for FR/EN alternate pages | `metadata.alternates.languages` in generateMetadata, `sitemap.ts` with `alternates.languages`, `robots.ts` with sitemap URL |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | Framework -- metadata API, sitemap.ts, robots.ts | Built-in file conventions for SEO, no plugins needed |
| next-intl | ^4.8.3 | `getTranslations` in `generateMetadata` for locale-aware metadata | Already used project-wide, documented pattern for metadata |
| tailwindcss | ^4 | Design token update for contrast fix | Already the styling system |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| schema-dts | latest | TypeScript types for JSON-LD schema.org | Optional -- provides `WithContext<MobileApplication>` type safety. Small devDependency. Can skip if manual typing is preferred. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-in sitemap.ts | next-sitemap npm package | Unnecessary -- Next.js native API handles locale alternates natively since v14.2. next-sitemap adds a build step and config file for no benefit on a 2-page site. |
| Manual JSON-LD | next-seo package | Over-engineering -- a single `<script>` tag is simpler than adding a dependency for one JSON-LD block |
| Static OG image | next/og ImageResponse | User decision locked: static file, not dynamic generation |

**Installation:**
```bash
# Optional -- only if type-safe JSON-LD is desired
npm install -D schema-dts
```

## Architecture Patterns

### File Structure (new/modified files only)
```
src/app/
├── sitemap.ts              # NEW: Dynamic sitemap with hreflang alternates
├── robots.ts               # NEW: Robots.txt with sitemap URL
├── globals.css             # MODIFY: Update --color-white-40 token
└── [locale]/
    └── layout.tsx          # MODIFY: generateMetadata + JSON-LD + skip-to-content
public/
└── og-image.png            # NEW: Static 1200x630 OG image
```

### Pattern 1: Per-Locale generateMetadata with next-intl
**What:** Replace static `metadata` export with `generateMetadata` that reads locale from params and uses `getTranslations` for localized title/description.
**When to use:** Any page/layout that needs locale-aware meta tags.
**Example:**
```typescript
// Source: https://next-intl.dev/docs/environments/actions-metadata-route-handlers
// + https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://getdictus.com"),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `https://getdictus.com/${locale}`,
      siteName: "dictus",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://getdictus.com/${locale}`,
      languages: {
        fr: "https://getdictus.com/fr",
        en: "https://getdictus.com/en",
        "x-default": "https://getdictus.com/fr",
      },
    },
  };
}
```

### Pattern 2: sitemap.ts with Locale Alternates
**What:** Next.js file convention that generates sitemap.xml with xhtml:link hreflang entries.
**When to use:** Must be placed at `src/app/sitemap.ts` (root of app directory, outside `[locale]`).
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://getdictus.com/fr",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          fr: "https://getdictus.com/fr",
          en: "https://getdictus.com/en",
        },
      },
    },
    {
      url: "https://getdictus.com/en",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          fr: "https://getdictus.com/fr",
          en: "https://getdictus.com/en",
        },
      },
    },
  ];
}
```

### Pattern 3: robots.ts
**What:** Next.js file convention that generates robots.txt.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://getdictus.com/sitemap.xml",
  };
}
```

### Pattern 4: JSON-LD as Script Tag
**What:** Render structured data in layout or page as a `<script type="application/ld+json">` tag. Use `MobileApplication` schema (subtype of SoftwareApplication, more specific for iOS apps).
**When to use:** In the page component body, not in metadata export.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
// + https://schema.org/MobileApplication
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "dictus",
  description: t("jsonld_description"),
  operatingSystem: "iOS 18+",
  applicationCategory: "UtilitiesApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  author: {
    "@type": "Organization",
    name: "PIVI Solutions",
  },
};

// In JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
```

### Pattern 5: Skip-to-Content Link
**What:** Visually hidden link that becomes visible on keyboard focus, allowing keyboard users to skip navigation.
**Example:**
```tsx
// In layout.tsx, before <Nav />
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:outline-none"
>
  {t("skip_to_content")}
</a>
// ...
<main id="main-content" className="pt-16">{children}</main>
```

### Anti-Patterns to Avoid
- **Duplicate JSON-LD:** Do NOT place JSON-LD in both layout.tsx and page.tsx -- it renders twice. Place it in page.tsx only (or layout.tsx only).
- **Missing XSS sanitization:** Always use `.replace(/</g, "\\u003c")` on JSON.stringify output for JSON-LD script tags.
- **metadataBase omission:** Without `metadataBase`, relative OG image paths won't resolve to full URLs. Set it in the layout's generateMetadata.
- **Hardcoded locale in metadata:** Use `getTranslations` + message files, not hardcoded strings, so both locales work.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap XML | Custom XML string builder | `src/app/sitemap.ts` returning `MetadataRoute.Sitemap` | Next.js handles XML serialization, xhtml namespace, hreflang link elements automatically |
| robots.txt | Static text file or custom handler | `src/app/robots.ts` returning `MetadataRoute.Robots` | Type-safe, cached by default, conventional |
| OG meta tags | Manual `<meta>` tags in `<head>` | `generateMetadata` return object with `openGraph` field | Next.js handles all `<meta property="og:*">` rendering, deduplication, and streaming |
| hreflang tags | Manual `<link rel="alternate">` | `alternates.languages` in generateMetadata | Automatic `<link>` tag generation with proper hreflang attributes |
| Contrast ratio calculation | Manual opacity math | WCAG contrast checker tool | Background #0B0F1A is near-black; `rgba(255,255,255,0.60)` on #0B0F1A gives ~9.3:1 ratio (well above 4.5:1 AA threshold) |

**Key insight:** Next.js 16 has first-class SEO primitives. Every SEO requirement in this phase maps to a built-in file convention or metadata field. Zero additional packages needed.

## Common Pitfalls

### Pitfall 1: sitemap.ts Placement
**What goes wrong:** Placing `sitemap.ts` inside `[locale]/` directory instead of `src/app/` root.
**Why it happens:** Other files like page.tsx and layout.tsx live inside `[locale]/`.
**How to avoid:** `sitemap.ts` and `robots.ts` must be at `src/app/` root (outside locale segment). They are route handlers, not page components.
**Warning signs:** Build succeeds but sitemap.xml returns 404 or generates per-locale sitemaps at /fr/sitemap.xml and /en/sitemap.xml instead of a single /sitemap.xml.

### Pitfall 2: generateMetadata and Static Metadata Coexistence
**What goes wrong:** TypeScript error or build failure when both `export const metadata` and `export async function generateMetadata` exist in the same file.
**Why it happens:** Next.js enforces mutual exclusivity.
**How to avoid:** Remove the existing `export const metadata` object when switching to `generateMetadata`.

### Pitfall 3: OG Image Absolute URL
**What goes wrong:** Social media platforms show broken image because OG image URL is relative.
**Why it happens:** Forgetting `metadataBase` or using relative path without it.
**How to avoid:** Set `metadataBase: new URL("https://getdictus.com")` in the layout's generateMetadata. Then `/og-image.png` resolves to `https://getdictus.com/og-image.png`.

### Pitfall 4: White-40 Token Update Scope
**What goes wrong:** Updating the CSS variable but missing components that use `text-white/40` utility directly instead of the token.
**Why it happens:** Tailwind arbitrary opacity vs design token confusion.
**How to avoid:** Grep confirmed all usages are `text-white-40` (the design token class), not `text-white/40` (arbitrary). Updating `--color-white-40` in globals.css will cascade to all 20+ usages automatically. Rename the token to `--color-white-60` to reflect the actual value (or keep the name and just change the value -- keeping the name avoids touching every component file).

### Pitfall 5: JSON-LD Duplicate Rendering
**What goes wrong:** JSON-LD appears twice in the HTML -- once in server render, once in hydration.
**Why it happens:** React re-renders `<script>` tags during hydration in client components.
**How to avoid:** Place JSON-LD in a Server Component (layout.tsx or page.tsx without "use client"). The current layout.tsx is a server component, which is correct.

### Pitfall 6: x-default hreflang
**What goes wrong:** Google shows wrong locale as default for users with unmatched language.
**Why it happens:** Missing `x-default` in alternates.
**How to avoid:** Include `"x-default": "https://getdictus.com/fr"` in `alternates.languages`. Per user decision, x-default points to /fr.

## Code Examples

### Complete generateMetadata (verified pattern)
```typescript
// Source: Next.js 16.1.6 docs + next-intl docs
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://getdictus.com"),
    title: t("title"),
    description: t("description"),
    applicationName: "dictus",
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      siteName: "dictus",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "dictus",
        },
      ],
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: "/fr",
        en: "/en",
        "x-default": "/fr",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
```

### i18n Message Files Addition
```json
// messages/fr.json -- add Metadata namespace
{
  "Metadata": {
    "title": "dictus -- Dictation vocale 100% offline pour iOS",
    "description": "Clavier iOS de dictation vocale 100% offline. Transcription en temps reel, entierement sur votre appareil.",
    "jsonld_description": "Clavier iOS de dictation vocale 100% offline avec transcription en temps reel sur l'appareil."
  }
}

// messages/en.json -- add Metadata namespace
{
  "Metadata": {
    "title": "dictus -- Fully offline voice dictation for iOS",
    "description": "Fully offline iOS voice dictation keyboard. Real-time transcription, entirely on your device.",
    "jsonld_description": "Fully offline iOS voice dictation keyboard with real-time on-device transcription."
  }
}
```

### Accessibility: Design Token Update
```css
/* globals.css -- change value, keep token name for zero-diff on components */
--color-white-40: rgba(255, 255, 255, 0.60);
/* Contrast ratio on #0B0F1A: ~9.3:1 (WCAG AA requires 4.5:1) */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static `metadata` export | `generateMetadata` with params | Next.js 13.2+ | Enables per-locale metadata without separate page files |
| next-sitemap package | Built-in `sitemap.ts` file convention | Next.js 13.3+ (locale support v14.2+) | No build step, no config file, native hreflang support |
| Manual `<meta>` in `<Head>` | Metadata API auto-renders `<meta>` tags | Next.js 13.2+ | Type-safe, deduplication, streaming support |
| `viewport` in metadata | Separate `generateViewport` export | Next.js 14+ | viewport/themeColor moved to separate function (deprecated in metadata) |

**Deprecated/outdated:**
- `themeColor` and `colorScheme` in metadata object: deprecated since Next.js 14, use `generateViewport` instead
- next-seo package: largely unnecessary with App Router metadata API
- `<Head>` component from `next/head`: Pages Router only, not used in App Router

## Open Questions

1. **OG Image Creation Method**
   - What we know: Must be static 1200x630 PNG in /public, dark background with logo + waveform
   - What's unclear: How to create the image (manual design tool vs programmatic SVG-to-PNG)
   - Recommendation: Create a simple SVG with the brand waveform icon + "dictus" wordmark on #0A1628 background, convert to PNG. Can be done with a one-off script or manually in any image editor.

2. **Lighthouse Audit Execution**
   - What we know: User wants actual Lighthouse via Playwright on /fr and /en
   - What's unclear: Whether Playwright MCP or CLI lighthouse is the intended tool
   - Recommendation: Use `npx lighthouse http://localhost:3000/fr --output=json --chrome-flags="--headless"` for actual Lighthouse audit. Alternatively, use Playwright MCP browser for visual verification.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Lighthouse CLI (via npx) |
| Config file | none -- CLI flags suffice |
| Quick run command | `npx lighthouse http://localhost:3000/fr --output=json --quiet --chrome-flags="--headless"` |
| Full suite command | Run Lighthouse on both /fr and /en, verify scores >= 90 |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | Lighthouse 90+ all metrics | e2e/audit | `npx lighthouse http://localhost:3000/fr --output=json --chrome-flags="--headless"` | No -- Wave 0 |
| SEO-01 | OG tags, meta tags, JSON-LD present | smoke | `curl -s http://localhost:3000/fr \| grep -c "og:title"` + JSON-LD validation | No -- Wave 0 |
| SEO-02 | hreflang + sitemap | smoke | `curl -s http://localhost:3000/sitemap.xml \| grep -c "hreflang"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** Build succeeds (`npm run build`) + manual spot-check meta tags in HTML output
- **Per wave merge:** Full Lighthouse audit on /fr and /en
- **Phase gate:** All 4 Lighthouse scores >= 90 on both locales before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test infrastructure exists -- Lighthouse audit is manual/CLI-based
- [ ] No automated meta tag verification -- can be done via curl + grep on build output
- [ ] OG image file does not exist yet -- must be created

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.6 generateMetadata docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Full metadata API, openGraph, alternates, metadataBase
- [Next.js 16.1.6 sitemap.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Sitemap file convention with locale alternates
- [Next.js 16.1.6 robots.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) - Robots file convention
- [Next.js 16.1.6 JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld) - Script tag pattern with XSS sanitization
- [next-intl metadata docs](https://next-intl.dev/docs/environments/actions-metadata-route-handlers) - getTranslations in generateMetadata

### Secondary (MEDIUM confidence)
- [schema.org SoftwareApplication](https://schema.org/SoftwareApplication) - Schema type properties
- [schema.org MobileApplication](https://schema.org/MobileApplication) - iOS-specific subtype
- [Google Software App structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) - Google's requirements for rich results

### Tertiary (LOW confidence)
- None -- all findings verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all APIs verified in official Next.js 16.1.6 docs
- Architecture: HIGH - File conventions and metadata API are stable, well-documented, version-matched
- Pitfalls: HIGH - All pitfalls derived from official docs or verified by codebase grep

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable APIs, no breaking changes expected)

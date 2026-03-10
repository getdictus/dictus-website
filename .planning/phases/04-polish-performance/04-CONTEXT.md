# Phase 4: Polish & Performance - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship production-ready: Lighthouse 90+ on all 4 metrics (Performance, Accessibility, Best Practices, SEO), complete SEO metadata (OG image, meta tags, JSON-LD), hreflang tags, sitemap.xml, robots.txt, and accessibility fixes. No new content sections, no new features, no design changes beyond a11y compliance fixes.

</domain>

<decisions>
## Implementation Decisions

### OG image & social sharing
- Static OG image file (1200x630) in /public — not dynamically generated
- One universal image for both locales — meta title/description handle language difference
- Visual content: Claude's discretion (logo + waveform on dark #0A1628 background, brand-forward)
- Meta descriptions: short and direct tone — "dictus — Dictation vocale 100% offline pour iOS" / "dictus — Fully offline voice dictation for iOS"
- Domain: getdictus.com for all canonical URLs, OG URLs, sitemap

### Accessibility
- Bump secondary text opacity from rgba(255,255,255,0.40) to ~0.60 minimum for WCAG AA 4.5:1 contrast ratio
- Canvas waveform: aria-hidden="true" + role="presentation" (decorative element)
- Add skip-to-content link (invisible, appears on keyboard focus)
- Claude audits all interactive elements for proper ARIA labels (nav, language toggle, CTA, links)

### Lighthouse performance
- Current JS budget acceptable: Motion v12 LazyMotion (~4.6kb) + Canvas waveform stay as-is
- No images on the page — SVG/canvas/text only. OG image is in /public but not loaded on page
- Font optimization: next/font already handles preload + swap — Claude verifies and adjusts if needed
- Run actual Lighthouse audit via Playwright on /fr and /en to validate 90+ scores

### SEO & structured data
- JSON-LD: SoftwareApplication schema (operatingSystem: iOS, applicationCategory: Utilities, offers: Free)
- Locale-specific metadata: per-locale title + description in layout.tsx (currently French-only — add EN)
- hreflang tags: link FR ↔ EN alternates + x-default pointing to /fr
- sitemap.ts: dynamic Next.js sitemap with /fr and /en entries + hreflang alternates
- robots.ts: explicit robots.txt with Allow: / and Sitemap link to https://getdictus.com/sitemap.xml

### Claude's Discretion
- OG image exact composition and generation method (hand-crafted SVG/PNG)
- Exact opacity value for secondary text (minimum ~0.60 for AA compliance)
- ARIA label wording for interactive elements
- JSON-LD field values (description, author, datePublished, etc.)
- Font subset optimization if needed
- Any additional Lighthouse fixes discovered during audit
- Meta description exact wording (within "short and direct" constraint)

</decisions>

<specifics>
## Specific Ideas

- User is new to SEO — all SEO-related code should follow clear best practices with no over-engineering
- "Court et direct" meta descriptions — factual, premium tone matching the site's aesthetic
- Zero third-party scripts constraint carries forward — no analytics, no tracking pixels, no external requests
- OG image should match the premium dark aesthetic of the site

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `layout.tsx` (src/app/[locale]/layout.tsx): Has basic metadata export — needs expansion with per-locale metadata, OG tags, JSON-LD
- Design tokens in globals.css @theme: all brand colors available for OG image generation
- `routing.ts` (src/i18n/routing.ts): Locale config — reuse for sitemap/hreflang generation
- `generateStaticParams()` already in layout — sitemap can leverage same locale list

### Established Patterns
- i18n: `useTranslations("SectionName")` + `setRequestLocale(locale)` for server components
- next/font with DM Sans + DM Mono already configured with display: swap
- Inline SVG throughout — no external image dependencies
- 6 backdrop-blur elements at DSGN-03 limit — no new blur elements in this phase

### Integration Points
- `layout.tsx`: metadata export needs major expansion (per-locale, OG, hreflang)
- New files needed: `sitemap.ts`, `robots.ts` in src/app/
- OG image: static file in /public/og-image.png
- Skip-to-content link: added in layout.tsx body, targets main element
- Secondary text color: update design token or component-level opacity values

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-polish-performance*
*Context gathered: 2026-03-10*

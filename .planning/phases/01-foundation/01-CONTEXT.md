# Phase 1: Foundation - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js scaffold with complete design system (brand kit tokens in Tailwind), self-hosted DM Sans/Mono fonts, i18n routing (FR/EN) via next-intl v4, nav shell with logo + language toggle, and favicon/touch icon. No content sections, no animations — just the skeleton everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### Nav shell layout
- Minimal nav: logo left, language toggle far right — nothing else
- No section anchor links, no CTA button in nav (hero CTA is enough)
- Logo = squircle waveform icon + "dictus" wordmark (DM Sans 200)
- Always sticky (fixed at top), glassmorphism blur activates on scroll (Phase 2)

### i18n strategy
- Default locale: French — root / redirects to /fr
- Always prefixed URLs: /fr and /en (symmetric, clean for SEO hreflang)
- Browser locale detection redirects first-time visitors to matching language
- Language toggle: "FR / EN" text buttons, active lang highlighted with accent blue
- Translation files: Claude's discretion on organization (single file vs namespaced)

### Project structure
- src/ directory for components and utilities, app/ for routing only
- Feature-based folder organization: src/components/Nav/, src/components/Hero/, etc.
- PascalCase files and folders: Nav.tsx, Hero.tsx inside Nav/, Hero/
- Design tokens live in tailwind.config.ts only — no separate token file, no CSS variables
- Motion v12 with LazyMotion installed from scaffold (ready for Phase 3)

### Favicon & touch icon
- SVG as primary favicon, PNG fallbacks at 32x32 and 180x180 (Apple touch icon)
- Full squircle icon with dark gradient background + waveform bars (not transparent)
- Icon generated from brand kit spec by Claude (3 asymmetric bars, squircle rx=18)

### Claude's Discretion
- Translation file organization (single file per locale vs namespaced sections)
- Exact nav height and padding
- Favicon generation tooling approach
- Base layout structure (providers, metadata config)

</decisions>

<specifics>
## Specific Ideas

- Brand kit is in `/dictus-brand-kit.html` — all token values come from there
- Wordmark "dictus" always lowercase, DM Sans 200, letter-spacing: -0.04em
- Waveform icon bars are intentionally asymmetric — don't make them equal
- Zero third-party scripts: fonts self-hosted via next/font, no external requests
- Dark-only: no light mode, background #0A1628 / #0B0F1A

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- No existing patterns — this phase establishes all conventions

### Integration Points
- `dictus-brand-kit.html` contains all design token values to extract
- CLAUDE.md documents the full brand kit for reference

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-09*

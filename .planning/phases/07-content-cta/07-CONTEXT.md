# Phase 7: Content & CTA - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Comparison table showing Dictus vs 4 competitors (Apple Dictation, WhisperFlow, SuperWhisper, MacWhisper) across 6 feature dimensions, plus an adaptive TestFlight CTA that replaces the current "Coming Soon" hero badge. iPhone visitors get a direct TestFlight button; desktop visitors see "Available on iPhone" with a QR code. Graceful fallback to current badge when TestFlight URL is not configured.

</domain>

<decisions>
## Implementation Decisions

### Comparison table layout
- Classic table grid on desktop: competitors as columns, features as rows
- Dictus as first data column, visually highlighted with accent-blue left border and subtle glow (rgba(61,126,255,0.12))
- Header cell for Dictus gets accent background
- Sticky header row on scroll (COMP-04)
- New dedicated section placed after Features, before HowItWorks
- Rows stagger-animate on scroll entry (~80ms delay per row, using existing ScrollReveal/Motion pattern)

### Comparison data
- 6 dimensions as defined in COMP-02: price, offline capability, privacy, platforms, AI rewrite, open source
- Cell format: icons (checkmark/cross) for boolean features + short descriptive text for nuanced ones (pricing, platforms)
- Tone: factual and neutral — state facts, let checkmarks speak, no editorializing against competitors
- All comparison data bilingual FR/EN via next-intl (COMP-07)

### Adaptive TestFlight CTA
- Replaces the existing "Coming Soon" / "Bientot disponible" badge in Hero section
- iPhone visitors: "Join TestFlight" button with deep link, styled as existing accent button (rounded-full bg-accent px-8 py-3)
- Desktop visitors: "Available on iPhone" text message + QR code pointing to TestFlight URL
- QR code hidden on mobile (scanning your own screen doesn't work) — show text link instead on non-iPhone mobile
- Device detection is client-side only (CTA-05 — no hydration mismatch)
- CTA text bilingual FR/EN (CTA-03)

### CTA fallback
- When TestFlight URL is not configured (env var empty/missing), show the current "Coming Soon" badge exactly as-is
- Zero visual change until TestFlight URL is configured — seamless transition

### Mobile responsive
- Comparison table transforms to card stack at md: breakpoint (768px), matching existing site pattern
- Each competitor becomes a vertical glass card (Tier 2 glass styling)
- Dictus card fully expanded by default with accent highlight
- Other 4 competitor cards collapsed (name visible, tap to expand)
- Cards stack vertically, Dictus card first

### Claude's Discretion
- Section headline (with or without subtitle) and exact wording
- QR code generation approach (library vs static image)
- Exact stagger animation timing and easing
- Table cell icon design (SVG checkmarks/crosses)
- Competitor card expand/collapse animation on mobile
- How TestFlight URL is configured (env var, config file, etc.)

</decisions>

<specifics>
## Specific Ideas

- Table should feel premium and aligned with the existing glass card aesthetic — not a plain HTML table
- Factual neutral tone is key — Dictus's advantages speak for themselves via the checkmark grid
- Mobile card stack with Dictus expanded and others collapsed keeps focus on Dictus without overwhelming the user with a long scroll

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ScrollReveal` (src/components/shared/ScrollReveal.tsx): Scroll-triggered animation wrapper — use for table row stagger
- Tier 2 glass styling pattern: `rounded-2xl border border-border bg-[var(--glass-t2-bg)] backdrop-blur-[12px] backdrop-saturate-[1.2]` — reuse for table container and mobile cards
- `useTranslations` (next-intl): All sections use this pattern for bilingual content
- Existing accent button style in Community.tsx: `rounded-full bg-accent px-8 py-3 font-normal text-white transition-colors hover:bg-accent-hi` — reuse for TestFlight button

### Established Patterns
- Section layout: `<section className="bg-ink py-28">` with `mx-auto max-w-6xl px-6` container
- i18n: message keys in `src/messages/{en,fr}.json` with `useTranslations("SectionName")` — add `Comparison` and update `Hero` keys
- Feature cards use `md:grid-cols-2` breakpoint — comparison should follow `md:` for table/card switch
- Hero badge: inline-flex rounded-full with accent border/bg at Hero.tsx:69-75 — this is the replacement point for CTA

### Integration Points
- `Hero.tsx` (lines 68-75): Replace "Coming Soon" badge with adaptive CTA component
- `src/messages/en.json` + `fr.json`: Add Comparison section keys and update Hero CTA keys
- New `src/components/Comparison/` directory for table component
- Main page component: Add `<Comparison />` section between `<Features />` and `<HowItWorks />`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-content-cta*
*Context gathered: 2026-03-12*

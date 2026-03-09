# Phase 2: Content & Layout - Research

**Researched:** 2026-03-09
**Domain:** Next.js App Router content sections, glassmorphism CSS, responsive layout, next-intl bilingual content
**Confidence:** HIGH

## Summary

Phase 2 transforms the placeholder landing page into a full content experience: hero, features, how-it-works, data flow, open source, community CTA, and footer. The technical domain is straightforward -- it is primarily component creation with Tailwind v4 styling, CSS glassmorphism, responsive layout, and next-intl translation wiring. No new dependencies are needed; the existing stack (Next.js 16, Tailwind v4, next-intl v4, motion v12) provides everything required.

The main complexity lies in the volume of content sections (7 distinct sections), ensuring consistent glassmorphism treatment across all of them while respecting the 6-blur-elements-per-viewport performance constraint (DSGN-03), and wiring bilingual content through next-intl for every piece of visible text.

**Primary recommendation:** Build sections as server components using `useTranslations()`, use pure CSS `backdrop-filter: blur()` for glassmorphism (no JS), and structure translations as flat namespace objects per section in the existing `fr.json`/`en.json` files.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hero: full viewport (100vh), bold headline, ambient waveform behind text (placeholder in Phase 2)
- CTA: "Coming Soon" badge, not a disabled button
- Feature cards: 2x2 grid desktop, 1-col mobile, full glassmorphism, 4 cards (Privacy/Offline, Smart Mode LLM, Keyboard Integration, Open Source)
- How it works: horizontal 3-step with arrow connectors, vertical on mobile
- Data flow: standalone glassmorphism card, separate section
- Open source: static GitHub link only, no API calls
- Community CTA: full-width banner with Telegram button (placeholder href)
- Section order: Hero > Features > How it works > Data flow > Open source > Community > Footer
- No section headings -- content flows as continuous narrative
- Background color shifts between sections (ink-deep / ink / ink-2 cycling)
- Spacious vertical padding (py-24 to py-32 range)
- Footer: minimal single line with PIVI Solutions credit, icon links, privacy statement
- NAV-03 (blur on scroll): deferred to Phase 3

### Claude's Discretion
- Feature card icon style (inline SVG vs glow circles vs other)
- Privacy statement wording
- Hero subtitle copy
- Exact glassmorphism intensity values (blur radius, opacity, border treatment)
- Waveform placeholder approach for Phase 2 (static SVG shape or CSS)
- Exact spacing values within py-24/py-32 range

### Deferred Ideas (OUT OF SCOPE)
- Nav glassmorphism blur on scroll (NAV-03) -- Phase 3
- Waveform sinusoidal animation -- Phase 3
- Scroll-triggered animations -- Phase 3
- SEO metadata -- Phase 4
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-01 | Compelling headline about offline voice dictation within 3 seconds | Translation keys in Hero namespace, 100vh section, bold typography with DM Sans 200 weight |
| HERO-04 | Primary CTA -- "Coming Soon" badge | Static badge component, no link needed, styled as intentional badge not disabled button |
| NAV-02 | Language toggle switches all content | Already implemented in LanguageToggle.tsx; all new sections must use useTranslations() with proper namespace keys |
| NAV-03 | Glassmorphism blur on nav scroll | DEFERRED to Phase 3 per CONTEXT.md -- no work needed |
| FEAT-01 | 4 feature cards with glassmorphism | CSS backdrop-filter cards, 2x2 grid, responsive, DSGN-03 blur limit |
| FEAT-02 | How it works 3-step section | Horizontal layout with arrow connectors, flex/grid responsive |
| FEAT-03 | Data flow diagram section | Standalone glassmorphism card with inline SVG illustration |
| FEAT-04 | Open source section with GitHub link | Static link to github.com/Pivii/dictus, no live stats (overrides REQUIREMENTS.md which mentions live stats) |
| FEAT-05 | Community CTA with Telegram link | Full-width banner, placeholder href="#" |
| FOOT-01 | Footer with credits and links | Minimal layout, PIVI Solutions + icon links + privacy statement |
| DSGN-03 | Glassmorphism limited to 6 blur elements per viewport | Audit blur usage: feature cards (4) + data flow card (1) = 5 max in one viewport |
| PERF-02 | Fully responsive, mobile-first, touch targets 44px+ | Tailwind responsive utilities, min-h-[44px] min-w-[44px] on interactive elements |
| PRIV-02 | Explicit "zero data collection" statement | Footer privacy statement text, bilingual |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, server components | Already configured, no changes needed |
| Tailwind CSS | 4.x | Utility-first styling, responsive | @theme tokens already in globals.css |
| next-intl | 4.8.3 | Bilingual FR/EN content | Already wired: routing, navigation, provider |
| motion | 12.35.x | Future animations | Installed but NOT used in Phase 2 (Phase 3) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DM Sans / DM Mono | via next/font | Typography | Already loaded in layout.tsx |

### No New Dependencies Needed
Phase 2 requires zero new npm packages. All content sections are built with existing Tailwind + next-intl.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Nav/              # (existing) Nav, Logo, LanguageToggle
│   ├── Hero/             # Hero.tsx
│   ├── Features/         # Features.tsx (contains feature cards)
│   ├── HowItWorks/       # HowItWorks.tsx
│   ├── DataFlow/         # DataFlow.tsx
│   ├── OpenSource/       # OpenSource.tsx
│   ├── Community/        # Community.tsx
│   └── Footer/           # Footer.tsx
├── messages/
│   ├── fr.json           # (existing) -- add all section keys
│   └── en.json           # (existing) -- add all section keys
└── app/
    └── [locale]/
        └── page.tsx      # Compose all sections
```

### Pattern 1: Server Component Sections with useTranslations
**What:** Each section is a server component that gets translations via `useTranslations("SectionName")`
**When to use:** All content sections (they have no client-side interactivity)
**Example:**
```typescript
// src/components/Hero/Hero.tsx
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="flex min-h-screen items-center justify-center bg-ink-deep">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h1 className="text-5xl text-white md:text-7xl"
            style={{ fontWeight: 200, letterSpacing: "-0.03em" }}>
          {t("headline")}
        </h1>
        <p className="mt-6 text-lg text-white-70">{t("subtitle")}</p>
      </div>
    </section>
  );
}
```

### Pattern 2: Translation File Structure
**What:** Flat namespace objects per section in fr.json / en.json
**When to use:** All translation keys
**Example:**
```json
{
  "Nav": { "fr": "FR", "en": "EN" },
  "Hero": {
    "headline": "Votre voix reste la votre.",
    "subtitle": "Dictation vocale 100% offline pour iOS.",
    "badge": "Bientot disponible"
  },
  "Features": {
    "privacy_title": "100% hors ligne",
    "privacy_desc": "Aucune donnee ne quitte votre appareil.",
    "smart_title": "Mode intelligent",
    "smart_desc": "Reformulation par IA, directement sur l'appareil."
  }
}
```

### Pattern 3: Glassmorphism Card
**What:** Pure CSS glassmorphism using backdrop-filter + translucent bg + subtle border
**When to use:** Feature cards, data flow card
**Example:**
```typescript
// Glassmorphism card styling
<div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-md">
  {/* card content */}
</div>

// Hover state (preparation for Phase 3 interactivity)
<div className="rounded-2xl border border-border hover:border-border-hi
                bg-surface/50 p-6 backdrop-blur-md transition-colors">
```

**Key values for glassmorphism:**
- `backdrop-blur-md` (12px blur) or `backdrop-blur-lg` (16px) -- Claude's discretion
- `bg-surface/50` -- 50% opacity surface color for translucency
- `border border-border` -- subtle white 7% border
- `hover:border-border-hi` -- white 14% on hover
- Optional: `shadow-[0_0_20px_var(--color-glow-soft)]` for subtle blue glow

### Pattern 4: Responsive Container Consistency
**What:** All sections use the same max-width container as Nav
**When to use:** Every section's inner content wrapper
**Example:**
```typescript
<section className="bg-ink py-28">
  <div className="mx-auto max-w-6xl px-6">
    {/* section content */}
  </div>
</section>
```

### Pattern 5: Background Color Cycling
**What:** Alternate section backgrounds using ink-deep / ink / ink-2
**When to use:** Sequential sections for visual separation
**Example flow:**
```
Hero:        bg-ink-deep  (#0A1628)
Features:    bg-ink       (#0B0F1A)
HowItWorks:  bg-ink-2     (#111827)
DataFlow:    bg-ink-deep  (#0A1628)
OpenSource:  bg-ink       (#0B0F1A)
Community:   bg-ink-2     (#111827)
Footer:      bg-ink-deep  (#0A1628)
```

### Pattern 6: Page Composition
**What:** page.tsx imports and stacks all section components
**Example:**
```typescript
// src/app/[locale]/page.tsx
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import DataFlow from "@/components/DataFlow/DataFlow";
import OpenSource from "@/components/OpenSource/OpenSource";
import Community from "@/components/Community/Community";
import Footer from "@/components/Footer/Footer";

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <DataFlow />
      <OpenSource />
      <Community />
      <Footer />
    </>
  );
}
```

### Anti-Patterns to Avoid
- **Putting all sections in page.tsx:** Breaks component isolation, makes the file huge. Use separate component files.
- **Using client components for static content:** All these sections are static text + styling. Server components are lighter and faster.
- **Creating a shared `Section` wrapper component:** Over-abstraction. Each section has different bg color, padding, and structure. Keep them independent.
- **Nested translation namespaces:** next-intl works best with flat `useTranslations("Hero")` per component, not deeply nested objects.
- **Using motion/framer-motion in Phase 2:** Animations are Phase 3. Keep components animation-free now to avoid rework.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive grid | Custom media queries | Tailwind `grid-cols-1 md:grid-cols-2` | Battle-tested, consistent breakpoints |
| Glassmorphism | JS-based blur effects | Pure CSS `backdrop-filter: blur()` | GPU-accelerated, no JS bundle cost |
| i18n content switching | Custom locale state | next-intl `useTranslations()` | Already wired, handles SSR correctly |
| Icon system | Icon font or sprite sheet | Inline SVG components | Zero network requests, tree-shakeable, brand-aligned |
| Touch target sizing | Manual padding calc | Tailwind `min-h-11 min-w-11` (44px) | Consistent, easy to audit |

**Key insight:** Phase 2 is pure content + styling. Every technical need is covered by the existing stack. The risk is over-engineering, not under-engineering.

## Common Pitfalls

### Pitfall 1: Glassmorphism Blur Count Exceeding DSGN-03
**What goes wrong:** More than 6 `backdrop-filter: blur()` elements visible simultaneously, causing mobile jank
**Why it happens:** 4 feature cards + data flow card + any other glass element = easy to exceed
**How to avoid:** Count blur elements per viewport. Feature cards (4) + data flow card (1) = 5. Leave headroom for nav blur in Phase 3. The how-it-works section should NOT use glassmorphism.
**Warning signs:** Scroll stutter on iPhone Safari, dropped frames in dev tools

### Pitfall 2: Missing Translation Keys Causing Runtime Errors
**What goes wrong:** next-intl throws or shows key names instead of content when a key is missing from one locale file
**Why it happens:** Adding keys to fr.json but forgetting en.json (or vice versa)
**How to avoid:** Always add keys to BOTH locale files simultaneously. Keep the same key structure in both files.
**Warning signs:** Raw key names visible in rendered output (e.g., "Hero.headline" as text)

### Pitfall 3: Inconsistent Container Width
**What goes wrong:** Some sections wider/narrower than others, misaligned content
**Why it happens:** Forgetting `mx-auto max-w-6xl px-6` on inner containers
**How to avoid:** Every section's content wrapper uses identical container classes. The full-width community CTA banner can break out for the background but should keep inner content contained.
**Warning signs:** Content doesn't align vertically when scrolling

### Pitfall 4: 100vh Hero Causing Issues on Mobile Safari
**What goes wrong:** `min-h-screen` or `100vh` includes the Safari URL bar, causing content to be partially hidden
**Why it happens:** Mobile Safari's dynamic viewport height
**How to avoid:** Use `min-h-dvh` (dynamic viewport height) instead of `min-h-screen` in Tailwind v4. This maps to `100dvh` which accounts for the URL bar.
**Warning signs:** Hero content cut off at bottom on iPhone Safari

### Pitfall 5: Server Component Importing Client Hooks
**What goes wrong:** Build error when a server component tries to use `useState`, `useEffect`, or client-only APIs
**Why it happens:** Mixing interactive logic into content sections
**How to avoid:** All Phase 2 sections are pure server components. No `"use client"` needed. The only client component is the existing LanguageToggle.
**Warning signs:** "useState is not a function" or "client-only" errors during build

### Pitfall 6: Touch Target Below 44px (PERF-02)
**What goes wrong:** Buttons and links too small for reliable touch interaction
**Why it happens:** Using text-only links or small icon buttons without adequate padding
**How to avoid:** All interactive elements (CTA badge, footer links, GitHub/Telegram icons) must have minimum 44x44px touch area. Use `min-h-11 min-w-11` or adequate padding.
**Warning signs:** Failed Lighthouse accessibility audit for tap targets

## Code Examples

### Glassmorphism Feature Card
```typescript
// Verified pattern using existing Tailwind v4 @theme tokens
<div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-md">
  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/50">
    {/* Inline SVG icon */}
  </div>
  <h3 className="text-lg font-normal text-white">{t("privacy_title")}</h3>
  <p className="mt-2 text-sm leading-relaxed text-white-70">{t("privacy_desc")}</p>
</div>
```

### Coming Soon Badge (not a button)
```typescript
// Intentional badge, not a disabled button
<span className="inline-flex items-center gap-2 rounded-full border border-accent/30
                 bg-accent/10 px-5 py-2.5 text-sm font-light text-accent">
  {t("badge")}
</span>
```

### Responsive 2x2 Grid
```typescript
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  {/* 4 feature cards */}
</div>
```

### How It Works Horizontal Steps with Arrows
```typescript
<div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
  <Step icon={MicIcon} text={t("step1")} />
  <Arrow className="hidden md:block" />  {/* horizontal arrow, hidden on mobile */}
  <Step icon={WaveIcon} text={t("step2")} />
  <Arrow className="hidden md:block" />
  <Step icon={TextIcon} text={t("step3")} />
</div>
```

### Footer with Privacy Statement
```typescript
<footer className="border-t border-border bg-ink-deep py-8">
  <div className="mx-auto max-w-6xl px-6">
    <div className="flex items-center justify-between">
      <span className="text-sm text-white-40">&copy; PIVI Solutions</span>
      <div className="flex items-center gap-4">
        {/* GitHub and Telegram icons with 44px touch targets */}
        <a href="https://github.com/Pivii/dictus" target="_blank" rel="noopener noreferrer"
           className="flex h-11 w-11 items-center justify-center text-white-40 hover:text-white-70 transition-colors"
           aria-label="GitHub">
          {/* SVG icon */}
        </a>
      </div>
    </div>
    <p className="mt-4 text-xs text-white-40">{t("privacy")}</p>
  </div>
</footer>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `min-h-screen` (100vh) | `min-h-dvh` (100dvh) | Tailwind v3.4+ / v4 | Fixes mobile Safari viewport issue |
| `tailwind.config.js` theme | `@theme` in globals.css | Tailwind v4 | Already using v4 @theme -- tokens available as utilities |
| Client-side i18n loading | Server component `useTranslations` | next-intl v3+ | Zero client JS for static content |
| CSS modules for scoping | Tailwind utilities | Project convention | Already established in Phase 1 |

**Already current:**
- Tailwind v4 @theme is the latest pattern (no config file needed)
- next-intl v4.8 with App Router integration is current
- Next.js 16 server components by default is optimal for content pages

## Open Questions

1. **Exact hero headline copy**
   - What we know: Tone is bold, punchy, confident ("Your voice stays yours." style)
   - What's unclear: Final bilingual copy not specified in CONTEXT.md
   - Recommendation: Use "Votre voix reste la votre." (FR) / "Your voice stays yours." (EN) as starting copy, matching the existing subtitle style. Can be refined later.

2. **Waveform placeholder visual**
   - What we know: Phase 2 needs a placeholder, Phase 3 brings animation
   - What's unclear: Static SVG vs CSS shape vs decorative gradient
   - Recommendation: Reuse the existing Logo waveform SVG (3 bars) as a large decorative background element with low opacity. Simplest approach, brand-consistent.

3. **Arrow connectors in How It Works**
   - What we know: Horizontal arrows on desktop, hidden on mobile
   - What's unclear: Arrow style (chevron, line, animated later?)
   - Recommendation: Simple SVG chevron arrow (>), text-white-40 color. Phase 3 can add animation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | `npm run build` (build verification) + `npm run lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Headline visible within 3s | manual + build | `npm run build` | N/A |
| HERO-04 | Coming Soon badge present | manual | Visual inspection | N/A |
| NAV-02 | Language toggle switches content | manual | Toggle FR/EN, verify text changes | N/A |
| NAV-03 | DEFERRED | N/A | N/A | N/A |
| FEAT-01 | 4 glassmorphism feature cards | manual | Visual inspection | N/A |
| FEAT-02 | 3-step how-it-works | manual | Visual inspection | N/A |
| FEAT-03 | Data flow diagram | manual | Visual inspection | N/A |
| FEAT-04 | GitHub link present | manual | Click test | N/A |
| FEAT-05 | Community CTA with Telegram | manual | Visual inspection | N/A |
| FOOT-01 | Footer with credits/links | manual | Visual inspection | N/A |
| DSGN-03 | Max 6 blur elements per viewport | manual | DevTools audit of backdrop-filter usage | N/A |
| PERF-02 | Responsive 320px-desktop, 44px touch | manual | DevTools responsive mode + Lighthouse | N/A |
| PRIV-02 | Zero data collection statement | manual | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `npm run build && npm run lint`
- **Per wave merge:** `npm run build && npm run lint` + manual visual check
- **Phase gate:** Build green + manual responsive check at 320px, 768px, 1280px + FR/EN toggle verification

### Wave 0 Gaps
- No test framework is installed and none is needed for Phase 2. This phase is content/layout focused -- validation is build success + manual visual/responsive checks.
- A Playwright e2e setup could be added in Phase 4 for automated visual regression, but is not required now.

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: globals.css @theme tokens, existing component patterns, next-intl wiring, page.tsx structure
- CONTEXT.md: User-locked decisions on layout, sections, glassmorphism, and scope boundaries

### Secondary (MEDIUM confidence)
- Tailwind v4 documentation: `min-h-dvh` for dynamic viewport height, `backdrop-blur-md/lg` utilities
- next-intl v4 patterns: `useTranslations()` server component usage (verified against existing LanguageToggle.tsx and page.tsx)

### Tertiary (LOW confidence)
- None -- all findings verified against existing codebase or established patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all verified in package.json and existing code
- Architecture: HIGH -- follows patterns already established in Phase 1 (component folders, @theme tokens, next-intl namespaces)
- Pitfalls: HIGH -- common known issues with glassmorphism perf, mobile viewport, and i18n key management

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable stack, no fast-moving dependencies)

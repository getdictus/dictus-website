# Phase 7: Content & CTA - Research

**Researched:** 2026-03-12
**Domain:** Comparison table component + adaptive CTA with device detection
**Confidence:** HIGH

## Summary

Phase 7 adds two distinct features to the Dictus landing page: (1) a premium comparison table section showing Dictus vs 4 competitors across 6 dimensions, and (2) an adaptive TestFlight CTA that replaces the current "Coming Soon" badge in the Hero section. Both features are well within the existing stack's capabilities -- no new frameworks needed, only one small library for QR code generation.

The codebase already has all the patterns needed: `useTranslations` for i18n, `ScrollReveal` with stagger for animations, Tier 2 glass styling for cards, and `motion/react` for transitions. The comparison table is pure presentational data; the CTA requires a `"use client"` component with `useEffect`-based device detection to avoid hydration mismatches.

**Primary recommendation:** Build the comparison table as a server component with ScrollReveal stagger animation, and the adaptive CTA as a small client-side component using `NEXT_PUBLIC_TESTFLIGHT_URL` env var with `useEffect` device detection.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Classic table grid on desktop: competitors as columns, features as rows
- Dictus as first data column, visually highlighted with accent-blue left border and subtle glow (rgba(61,126,255,0.12))
- Header cell for Dictus gets accent background
- Sticky header row on scroll (COMP-04)
- New dedicated section placed after Features, before HowItWorks
- Rows stagger-animate on scroll entry (~80ms delay per row, using existing ScrollReveal/Motion pattern)
- 6 dimensions as defined in COMP-02: price, offline capability, privacy, platforms, AI rewrite, open source
- Cell format: icons (checkmark/cross) for boolean features + short descriptive text for nuanced ones (pricing, platforms)
- Tone: factual and neutral
- All comparison data bilingual FR/EN via next-intl (COMP-07)
- Replaces the existing "Coming Soon" / "Bientot disponible" badge in Hero section
- iPhone visitors: "Join TestFlight" button with deep link, styled as existing accent button
- Desktop visitors: "Available on iPhone" text message + QR code pointing to TestFlight URL
- QR code hidden on mobile (scanning your own screen doesn't work)
- Device detection is client-side only (CTA-05 -- no hydration mismatch)
- CTA text bilingual FR/EN (CTA-03)
- When TestFlight URL is not configured, show the current "Coming Soon" badge exactly as-is
- Mobile comparison: card stack at md: breakpoint (768px)
- Dictus card fully expanded by default with accent highlight; other 4 collapsed (tap to expand)

### Claude's Discretion
- Section headline (with or without subtitle) and exact wording
- QR code generation approach (library vs static image)
- Exact stagger animation timing and easing
- Table cell icon design (SVG checkmarks/crosses)
- Competitor card expand/collapse animation on mobile
- How TestFlight URL is configured (env var, config file, etc.)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | View comparison table with Dictus + 4 competitors | Table component with i18n data, section placement after Features |
| COMP-02 | Table compares: price, offline, privacy, platforms, AI rewrite, open source | Data structure with 6 dimension rows, icon+text cell format |
| COMP-03 | Dictus column visually highlighted | Accent-blue left border + glow-soft bg on Dictus column |
| COMP-04 | Sticky header row on scroll | CSS `position: sticky; top: 0` on thead with z-index |
| COMP-05 | Card stack on mobile | Responsive breakpoint at md: (768px), glass card layout with expand/collapse |
| COMP-06 | Rows stagger-animate on scroll entry | Existing ScrollReveal stagger pattern with ~80ms delay |
| COMP-07 | Bilingual comparison data | next-intl `useTranslations("Comparison")` with en.json/fr.json keys |
| CTA-01 | iPhone visitors see "Join TestFlight" button | Client-side useEffect device detection, accent button style |
| CTA-02 | Desktop visitors see QR code + "Available on iPhone" | qrcode.react SVG rendering, hidden on mobile |
| CTA-03 | CTA text bilingual | next-intl Hero namespace additions |
| CTA-04 | Graceful fallback to "Coming Soon" | Conditional render based on NEXT_PUBLIC_TESTFLIGHT_URL |
| CTA-05 | Client-side device detection (no hydration mismatch) | useEffect + useState pattern, SSR renders fallback |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | Framework | Already in project |
| next-intl | ^4.8.3 | i18n | Already used for all sections |
| motion | ^12.35.2 | Animations | Already used for ScrollReveal, stagger |
| tailwindcss | ^4 | Styling | Already used throughout |

### New Dependency
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| qrcode.react | ^4.2.0 | QR code SVG generation | Desktop CTA with TestFlight URL |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode.react | Static PNG image | Static image requires manual regeneration if URL changes; qrcode.react generates dynamically from env var |
| qrcode.react | react-qr-code | Both work; qrcode.react has 3.5x more npm dependents and SVG+Canvas support |

**Recommendation (Claude's Discretion):** Use `qrcode.react` -- it is the most widely adopted React QR library (1,196 dependents), renders as SVG (matches the project's SVG icon approach), and dynamically generates from the TestFlight URL env var. Tiny bundle addition (~4KB gzipped).

**Installation:**
```bash
npm install qrcode.react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Comparison/
│   │   ├── Comparison.tsx          # Main section (server component wrapper)
│   │   ├── ComparisonTable.tsx     # Desktop table (client for sticky scroll)
│   │   └── ComparisonCards.tsx     # Mobile card stack (client for expand/collapse)
│   ├── Hero/
│   │   ├── Hero.tsx                # Modified: swap badge for AdaptiveCTA
│   │   ├── AdaptiveCTA.tsx         # New: client component, device detection
│   │   └── ...existing files
│   └── ...
├── messages/
│   ├── en.json                     # Add "Comparison" and Hero CTA keys
│   └── fr.json                     # Add "Comparison" and Hero CTA keys
└── ...
```

### Pattern 1: Adaptive CTA with Hydration Safety
**What:** Client component that renders "Coming Soon" on server, then upgrades to device-specific CTA after hydration
**When to use:** CTA-05 requirement -- no hydration mismatch

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

type DeviceType = "iphone" | "desktop" | "other-mobile" | "unknown";

function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iphone";
  if (/Android|webOS|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return "other-mobile";
  return "desktop";
}

export default function AdaptiveCTA() {
  const t = useTranslations("Hero");
  const testflightUrl = process.env.NEXT_PUBLIC_TESTFLIGHT_URL;
  const [device, setDevice] = useState<DeviceType>("unknown");

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  // Fallback: no TestFlight URL configured OR SSR/pre-hydration
  if (!testflightUrl || device === "unknown") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-light text-accent">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        {t("badge")}
      </span>
    );
  }

  if (device === "iphone") {
    return (
      <a href={testflightUrl} className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-normal text-white transition-colors hover:bg-accent-hi">
        {t("cta_testflight")}
      </a>
    );
  }

  // Desktop: show QR code + message
  // Other mobile: show text link only (no QR -- can't scan own screen)
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-light text-white-70">{t("cta_available_iphone")}</p>
      {device === "desktop" && (
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={testflightUrl} size={120} />
        </div>
      )}
      <a href={testflightUrl} className="text-sm text-accent underline underline-offset-4 hover:text-accent-hi">
        {t("cta_testflight_link")}
      </a>
    </div>
  );
}
```

### Pattern 2: Comparison Data as i18n Messages
**What:** Structured comparison data stored in message files, not hardcoded in components
**When to use:** COMP-07 bilingual requirement

```json
{
  "Comparison": {
    "title": "How Dictus compares",
    "feature_price": "Price",
    "feature_offline": "100% offline",
    "feature_privacy": "Privacy-first",
    "feature_platforms": "Platforms",
    "feature_ai_rewrite": "AI rewrite",
    "feature_opensource": "Open source",
    "dictus_price": "Free",
    "dictus_platforms": "iOS",
    "apple_name": "Apple Dictation",
    "apple_price": "Built-in",
    "apple_platforms": "iOS, macOS",
    "whisperflow_name": "WhisperFlow",
    "whisperflow_price": "$4.99/mo",
    "whisperflow_platforms": "iOS"
  }
}
```

Booleans (checkmark/cross) do not need translation -- they are rendered as SVG icons. Only text values (names, pricing, platform lists) need i18n keys.

### Pattern 3: Mobile Card Stack with Expand/Collapse
**What:** Competitor cards that collapse to name-only on mobile, expand on tap
**When to use:** COMP-05 responsive requirement

```typescript
// Use motion/react AnimatePresence + m.div for smooth height animation
const [expanded, setExpanded] = useState<string | null>(null);

// Dictus card always expanded (no toggle)
// Other cards: toggle on click
<m.div
  initial={false}
  animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  className="overflow-hidden"
>
  {/* Card content */}
</m.div>
```

### Pattern 4: Sticky Table Header
**What:** CSS sticky positioning on the header row
**When to use:** COMP-04

```css
/* The table container needs no overflow:hidden for sticky to work */
thead th {
  position: sticky;
  top: 64px; /* Account for fixed Nav height (pt-16 = 4rem = 64px) */
  z-index: 10;
  background: var(--glass-t2-bg);
  backdrop-filter: blur(12px);
}
```

Note: `position: sticky` requires the table to NOT be inside an `overflow: hidden` or `overflow: auto` container (unless that container is the intended scroll parent). The section wrapper should use `overflow: visible`.

### Anti-Patterns to Avoid
- **Server-side device detection:** Would cause hydration mismatches (CTA-05 violation). Always use useEffect.
- **Hardcoded comparison data in TSX:** Violates COMP-07 bilingual requirement. Use i18n message keys.
- **overflow-x: auto on table container:** Breaks sticky header. Use responsive breakpoint to switch to cards instead.
- **Rendering QR on mobile:** Users cannot scan their own screen. Hide QR code below md breakpoint.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Canvas drawing or SVG path math | `qrcode.react` QRCodeSVG | QR encoding is complex (Reed-Solomon error correction, masking patterns) |
| Stagger animation | Manual IntersectionObserver + setTimeout | Existing `ScrollReveal` with stagger + `staggerChildVariants` | Already built and tested in project, respects prefers-reduced-motion |
| i18n message loading | Manual JSON imports or context | `useTranslations("Comparison")` via next-intl | Established project pattern, handles locale routing automatically |
| Device detection library | ua-parser-js or similar | Simple regex on navigator.userAgent | Only need iPhone vs desktop distinction, not full browser parsing |

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on Device Detection
**What goes wrong:** Component renders differently on server vs client because device detection runs during render
**Why it happens:** `navigator` is undefined during SSR; if you branch on it during render, React sees a mismatch
**How to avoid:** Initialize state to "unknown", detect device in `useEffect`, render fallback (Coming Soon badge) for "unknown" state. The badge flickers only if the user has a fast connection AND TestFlight is configured -- in practice the transition is sub-frame.
**Warning signs:** React hydration warning in console, content flash on page load

### Pitfall 2: Sticky Header Broken by Overflow
**What goes wrong:** `position: sticky` does nothing because a parent has `overflow: hidden` or `overflow: auto`
**Why it happens:** CSS sticky only sticks within its nearest scrolling ancestor. If the table is wrapped in a div with overflow set, it sticks to that div, not the viewport.
**How to avoid:** Ensure no ancestor between `<thead>` and the viewport has overflow set. The existing `<section>` wrapper uses no overflow. Do NOT add `overflow-x: auto` for horizontal scrolling -- use the card layout on mobile instead.
**Warning signs:** Header scrolls away with content on desktop

### Pitfall 3: Sticky Top Offset
**What goes wrong:** Sticky header overlaps with the fixed Nav bar (64px height)
**Why it happens:** `top: 0` sticks to viewport top, but the Nav is fixed at top with height 64px
**How to avoid:** Set `top: 64px` (or `top: 4rem`) on sticky elements to account for the Nav. The main content already has `pt-16` to push below Nav.
**Warning signs:** Table header hidden behind Nav when scrolled

### Pitfall 4: NEXT_PUBLIC_ Build-Time Inlining
**What goes wrong:** TestFlight URL change requires a rebuild
**Why it happens:** `NEXT_PUBLIC_*` vars are inlined at build time by Next.js, not read at runtime
**How to avoid:** This is acceptable for this use case -- the TestFlight URL changes rarely (once when beta launches). Document in .env.example that changes require rebuild. For Vercel deployment, env var changes auto-trigger redeploy.
**Warning signs:** URL changes not reflected until next build

### Pitfall 5: Table Accessibility
**What goes wrong:** Screen readers cannot parse the comparison table
**Why it happens:** Using divs instead of semantic table elements, or missing scope attributes
**How to avoid:** Use `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<th scope="row">`. Add `aria-label` to the table. Use `sr-only` text alongside checkmark/cross icons.
**Warning signs:** VoiceOver reads "image" instead of "yes" or "no"

## Code Examples

### Environment Variable Setup
```bash
# .env.local (create this file)
NEXT_PUBLIC_TESTFLIGHT_URL=https://testflight.apple.com/join/XXXXXX
# Leave empty or omit to show "Coming Soon" fallback
```

### SVG Check/Cross Icons with Accessibility
```tsx
function CheckIcon() {
  return (
    <>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-success" aria-hidden="true">
        <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Yes</span>
    </>
  );
}

function CrossIcon() {
  return (
    <>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white-40" aria-hidden="true">
        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">No</span>
    </>
  );
}
```

### QRCodeSVG Integration
```tsx
import { QRCodeSVG } from "qrcode.react";

// Render inside a white container for contrast
<div className="rounded-xl bg-white p-3">
  <QRCodeSVG
    value={testflightUrl}
    size={120}
    level="M"
    bgColor="#FFFFFF"
    fgColor="#0A1628"
  />
</div>
```

Using `fgColor="#0A1628"` (ink-deep) instead of black keeps the QR code on-brand while maintaining sufficient contrast for scanning.

### Page Integration
```tsx
// src/app/[locale]/page.tsx — add Comparison between Features and HowItWorks
import Comparison from "@/components/Comparison/Comparison";

// In return:
<ScrollReveal><Features /></ScrollReveal>
<ScrollReveal><Comparison /></ScrollReveal>
<ScrollReveal><HowItWorks /></ScrollReveal>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ua-parser-js for device detection | Simple regex on navigator.userAgent | Ongoing | No need for 50KB library when checking one device type |
| CSS media queries for device type | JS userAgent check in useEffect | N/A | CSS cannot distinguish iPhone from Android; JS needed for CTA branching |
| Static QR code PNG | Dynamic QR via qrcode.react | N/A | URL changes don't require image regeneration |

**iOS 26 note (2025+):** Safari now freezes the OS version in User-Agent strings. However, this does not affect iPhone detection -- the `iPhone` substring remains in the UA string. Only OS version parsing is affected, which this phase does not need.

## Open Questions

1. **Competitor data accuracy**
   - What we know: The 6 dimensions and 4 competitors are defined in CONTEXT.md
   - What's unclear: Exact pricing, feature availability of competitors may change over time
   - Recommendation: Store all data in i18n files so it can be updated without code changes. Add a comment noting last-verified date.

2. **TestFlight URL format**
   - What we know: Apple TestFlight URLs follow `https://testflight.apple.com/join/{CODE}` pattern
   - What's unclear: Whether the actual code is available yet
   - Recommendation: CTA-04 fallback handles this cleanly. Use `.env.local` with `NEXT_PUBLIC_TESTFLIGHT_URL=` (empty) until URL is available.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Table renders with 5 products | smoke | `next build` (compile check) | N/A |
| COMP-02 | 6 feature rows present | manual | Visual inspection | N/A |
| COMP-03 | Dictus column highlighted | manual | Visual inspection | N/A |
| COMP-04 | Sticky header on scroll | manual | Browser scroll test | N/A |
| COMP-05 | Card stack on mobile | manual | Browser resize / devtools | N/A |
| COMP-06 | Stagger animation | manual | Visual inspection | N/A |
| COMP-07 | Bilingual data | smoke | Check en.json + fr.json have Comparison keys | N/A |
| CTA-01 | iPhone TestFlight button | manual | Safari devtools UA override | N/A |
| CTA-02 | Desktop QR code | manual | Desktop browser with env var set | N/A |
| CTA-03 | CTA bilingual | smoke | Check en.json + fr.json Hero CTA keys | N/A |
| CTA-04 | Fallback to Coming Soon | smoke | Remove env var, verify badge renders | N/A |
| CTA-05 | No hydration mismatch | smoke | `next build && next start`, check console | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript + Next.js compilation)
- **Per wave merge:** `npm run build` + manual visual check in browser
- **Phase gate:** Build green + visual verification of all 12 requirements

### Wave 0 Gaps
- No test framework installed -- all validation is build-check + manual for this UI-heavy phase
- This is acceptable: the phase is purely presentational with no business logic beyond simple device detection branching

## Sources

### Primary (HIGH confidence)
- Project codebase: Hero.tsx, ScrollReveal.tsx, Features.tsx, page.tsx, en.json, fr.json -- established patterns
- [Next.js Environment Variables docs](https://nextjs.org/docs/pages/guides/environment-variables) -- NEXT_PUBLIC_ pattern
- [qrcode.react npm](https://www.npmjs.com/package/qrcode.react) -- v4.2.0, SVG rendering, React component API

### Secondary (MEDIUM confidence)
- [iOS UA detection patterns](https://dev.to/konyu/using-javascript-to-determine-whether-the-client-is-ios-or-android-4i1j) -- navigator.userAgent regex
- [iOS 26 UA changes](https://docs.uaparser.dev/guides/how-to-detect-ios-26-using-javascript.html) -- frozen OS version, iPhone substring preserved

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all patterns verified in existing codebase, qrcode.react verified on npm
- Architecture: HIGH -- follows established project patterns exactly
- Pitfalls: HIGH -- sticky positioning, hydration mismatches, and env var behavior are well-documented issues

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain, no fast-moving dependencies)

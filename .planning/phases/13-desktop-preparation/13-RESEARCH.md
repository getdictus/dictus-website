# Phase 13: Desktop Preparation — Research

**Researched:** 2026-04-16
**Domain:** Next.js 16 App Router landing page — platform tabs with client-side OS auto-detection + centralized download config + multi-platform copy sweep
**Confidence:** HIGH

## Summary

Phase 13 is a "preparation" phase: the site must communicate that Dictus Desktop (macOS / Windows / Linux) is coming, without shipping any live download links. The phase is bounded to four deliverables (DESK-01..04) and has a fully locked `CONTEXT.md` that names every integration point, the config shape, the tab UX pattern, and every copy string to touch.

The repo already contains every primitive needed: `AdaptiveCTA.tsx` proves the SSR-safe `navigator.userAgent` pattern with a pre-hydration "unknown" fallback; `Features.tsx` provides the Tier 2 glass card + navy-tile + accent-pulse-pill coming-soon vocabulary; `donate.ts` is the canonical `as const` config template; `@iconify/react` v6 is already installed and used on `/donate` so `simple-icons:apple | windows | linux` drop in with zero new deps. No test infrastructure currently exists in the repo — Nyquist sampling therefore falls back to TypeScript + ESLint + `next build` + a manual multi-viewport smoke run.

**Primary recommendation:** Create `src/components/Platforms/Platforms.tsx` as a client component that extends the existing `detectDevice()` pattern with an OS sub-detector (`mac | win | linux | other`), renders a WAI-ARIA `tablist` above a single Tier-2 glass card, drives all content off a new `src/config/downloads.ts`, and ships a single-PR copy sweep for the four mobile-only strings. No new runtime dependencies. No test framework install in this phase — defer to a future phase once Nyquist is enforced at the repo level.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Section placement**
- New dedicated section "Available on" inserted after Hero, before Features
- Complements existing Hero `AdaptiveCTA` — does not replace it (AdaptiveCTA keeps handling iOS TestFlight + Android beta CTAs based on device detection)
- Mobile primary / Desktop "Also coming" hierarchy: iOS + Android shown as current (beta), Desktop (Mac/Win/Linux) grouped under "Also coming to Desktop" — reflects current reality
- Scope limited to home page + root metadata + support page. `/donate` and `/privacy` untouched

**Tab UX**
- Horizontal tabs row (macOS | Windows | Linux) above a single glass card showing content of selected OS (Handy.computer pattern)
- Auto-detection via `navigator.userAgent`: on desktop, pre-select the matching tab; on mobile/unknown, show tabs with no selection until tap (SSR-safe, no hydration mismatch)
- Each tab card shows: disabled "Coming Soon" badge with platform icon + secondary "Star on GitHub to follow" link → github.com/Pivii/dictus
- No email capture, no waitlist form (privacy-first stance)
- No Telegram link in this card (Community section already covers that channel)

**Platform icons**
- Iconify `simple-icons` family via `@iconify/react`: `simple-icons:apple`, `simple-icons:windows`, `simple-icons:linux` (Tux)
- Consistent with existing Iconify usage (solar:arrow-left-linear on /donate)

**downloads.ts config shape**
- Location: `src/config/downloads.ts` (mirrors `src/config/donate.ts` pattern)
- Minimal fields per variant: `{ enabled: false, url: '', label: 'Coming Soon' }`
- Arch-aware for Mac + Windows (typed from the start, fewer refactors when binaries ship):
  - `macos: { arm64: {...}, x64: {...} }`
  - `windows: { x64: {...}, arm64: {...} }`
- Linux: multi-format array `linux: { formats: [{ type, enabled, url, label }, ...] }` — format list TBD but structure prepares UI for format picker
- No version/releaseDate/checksum/size fields in v1 — add when builds exist

**Copy updates**
- **Hero subtitle**: leave untouched (platform-agnostic, platform story lives in new section)
- **Metadata title**: update — drop mobile-only phrasing, include Desktop
- **JSON-LD `operatingSystem`**: update to `"iOS 18+, Android, macOS, Windows, Linux"`
- **Comparison table `dictus_platforms`**: update to `"Mobile & Desktop"` / `"Mobile & Desktop"` (matches style consistency — competitor rows use concrete lists, Dictus keeps it terse)
- **Support compatibility line**: rewrite for multi-platform — "Dictus runs on iOS 18+ (beta), Android (beta), and Mac/Windows/Linux (coming soon)"
- **Features section**: no changes (feature cards are capability-focused, not platform-focused)
- **AdaptiveCTA**: no changes (mobile-only CTAs; Platforms section is the desktop surface)

### Claude's Discretion
- Exact section heading FR/EN (e.g. "Disponible sur" / "Available on", "Aussi sur Desktop" / "Also on Desktop")
- Exact metadata title rewrite (must drop `iOS & Android` exclusivity, stay under ~70 chars for OG)
- Tab visual details (active indicator, hover state, transition)
- i18n namespace name for the new section (e.g. `Platforms`)
- Linux formats to include at v1 (AppImage / deb / rpm / Flatpak) — pick a sensible default set
- Whether to highlight the auto-detected tab vs just pre-select
- Plan split (suggest 2 plans: section + config / copy sweep)

### Deferred Ideas (OUT OF SCOPE)
- Activate download links to GitHub Releases when Desktop builds exist — DESK-F01 (future requirement)
- Dedicated `/download` page with per-OS install instructions — DESK-F02 (future requirement)
- CDN for ML models at blob.getdictus.com — CDN-01/02/03 (future requirement, issue #2)
- Email / waitlist signup for "notify me when desktop ships" — contradicts privacy-first stance, stays out
- Version / arch / checksum / release-notes fields in `downloads.ts` — add when binaries ship
- AdaptiveCTA desktop branch (render a "Coming to Desktop" variant on desktop visitors) — can revisit once Desktop is public
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DESK-01 | Section téléchargement avec tabs par OS (macOS / Windows / Linux) et auto-detection via `navigator.userAgent` | §Architecture Pattern 1 (Tabs with OS auto-detect) + §Architecture Pattern 2 (SSR-safe pre-hydration fallback) + §Code Examples 1–2. Existing `AdaptiveCTA.tsx` is the verified blueprint. |
| DESK-02 | Badges Coming Soon désactivés pour chaque plateforme avec icônes OS (Apple, Windows, Linux) | §Standard Stack (`@iconify/react` already in deps, `simple-icons:apple|windows|linux` slugs verified) + §Architecture Pattern 3 (Coming Soon badge vocabulary reuses `Features.tsx` dashed-border + accent-pulse-pill). |
| DESK-03 | Configuration centralisée des liens de téléchargement dans `downloads.ts` prête à activer | §Architecture Pattern 4 (Config shape) + §Code Example 3. Mirrors `src/config/donate.ts` placeholder convention. Arch-aware types (arm64/x64) for Mac+Win, format array for Linux. |
| DESK-04 | Mise à jour des textes du site : Dictus n'est plus mobile-only, mentionner Desktop | §Copy Sweep Inventory (exhaustive — 4 strings in en.json/fr.json + JSON-LD field in `page.tsx` + compatibility line in `support/page.tsx`). All other strings are platform-agnostic and confirmed left-as-is. |
</phase_requirements>

## Standard Stack

### Core (already installed — zero new deps)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.1.6 | App Router framework | project standard |
| `react` / `react-dom` | 19.2.3 | UI runtime | project standard |
| `next-intl` | ^4.8.3 | FR/EN i18n namespaces | already used for all sections |
| `@iconify/react` | ^6.0.2 | On-demand SVG icons (simple-icons set) | already in deps (see `src/components/Donate/DonateCards.tsx:5`) |
| `motion` | ^12.35.2 | ScrollReveal entrance animations | project standard (imported via `motion/react`) |
| `tailwindcss` | ^4 | styling | project standard |

### Supporting (verified applicable)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@iconify/react` `Icon` | — | `<Icon icon="simple-icons:apple" />` | For the three platform tab icons; no local SVG path literals needed |
| `motion/react` `m.div` via `ScrollReveal` | — | Entrance animation for the new section | Wrap `<Platforms />` in `<ScrollReveal>` inside `page.tsx` (already the convention) |
| CSS variables from `globals.css` (`--glass-t2-bg`, `text-accent`, `border-border`, `bg-navy`, `text-sky`, `text-white-70`, `text-white-40`) | — | Glassmorphism Tier 2 card vocabulary | Reuse same class strings as Features / Community cards verbatim |

### Alternatives Considered (rejected by CONTEXT — do not research)
| Instead of | Could Use | Tradeoff / Why Rejected |
|------------|-----------|-------------------------|
| `@iconify/react` | Inline SVG paths (like `AdaptiveCTA.AppleIcon`) | Rejected: CONTEXT explicitly chose Iconify for consistency with `/donate`. Inline SVGs would force hand-drawing the Tux logo. |
| Tab auto-detection | Cookie / localStorage pre-selection | Rejected: privacy-first stance + CONTEXT locks on `navigator.userAgent` only |
| Email waitlist | "Notify me" form | Rejected by CONTEXT ("contradicts privacy-first stance") |
| Separate `/download` page | In-place section | Rejected by CONTEXT (DESK-F02 deferred) — current scope is a section, not a page |
| `navigator.userAgentData.platform` (UA-CH) | Replacement for `userAgent` | Low browser support (Chrome/Edge only as of 2026). CONTEXT locks on `userAgent`. Keep current pattern. |

**Installation:**
```bash
# No new installs required. Every runtime dep is already in package.json.
```

## Architecture Patterns

### Recommended Project Structure (new/touched files only)
```
src/
├── components/
│   └── Platforms/
│       └── Platforms.tsx          # NEW — client component, tablist + single tabpanel card
├── config/
│   └── downloads.ts               # NEW — typed config, arch-aware, placeholder URLs
├── app/[locale]/
│   ├── page.tsx                   # EDIT — insert <ScrollReveal><Platforms/></ScrollReveal> between Hero & Features; update JSON-LD operatingSystem
│   ├── layout.tsx                 # EDIT — update generateMetadata → title (via Metadata namespace)
│   └── support/page.tsx           # no structural edit — compatibility_text i18n key updated
└── messages/
    ├── en.json                    # EDIT — add Platforms namespace + edit Metadata.title, Comparison.dictus_platforms, Support.compatibility_text
    └── fr.json                    # EDIT — mirror EN edits
```

### Pattern 1: SSR-Safe Client OS Detection (blueprint lives in repo)
**What:** Render a neutral pre-hydration state on the server, then swap to the detected OS inside `useEffect` with a `requestAnimationFrame` deferral. Proven pattern already used by `AdaptiveCTA`.

**When to use:** Any client-only `navigator`-driven branching in a Next.js App Router page. Prevents React hydration mismatch warnings that would otherwise surface as runtime errors in production.

**Example (adapted for Desktop OS detection):**
```tsx
// Source: src/components/Hero/AdaptiveCTA.tsx (lines 1–15, 99–107) — verbatim pattern
"use client";
import { useState, useEffect } from "react";

type Os = "mac" | "win" | "linux" | "unknown";

function detectOs(): Os {
  const ua = navigator.userAgent;
  // Order matters: test iPad/iPhone first so "Mac-like" iPads do not pre-select macOS
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return "unknown";
  if (/Mac OS X|Macintosh/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "win";
  if (/Linux|X11/.test(ua)) return "linux";
  return "unknown";
}

export default function Platforms() {
  const [os, setOs] = useState<Os>("unknown");
  const [selected, setSelected] = useState<Os | null>(null);

  useEffect(() => {
    const detected = detectOs();
    // Must run after hydration to read navigator.userAgent
    requestAnimationFrame(() => {
      setOs(detected);
      if (detected !== "unknown") setSelected(detected);
    });
  }, []);
  // render tabs + tabpanel...
}
```

**Key invariants (derived from AdaptiveCTA line 103–107 and React 19 hydration rules):**
- `useState` initial value must be identical on server and client (`"unknown"` / `null`) — do NOT compute it from `navigator`.
- `requestAnimationFrame` defers the state update to after the first paint, avoiding the hydration-cycle warning.
- Pre-hydration render must be visually stable (never flash empty); show "unselected tablist, no tabpanel card"-equivalent so mobile users (who stay "unknown") see a valid UI.

### Pattern 2: WAI-ARIA Authoring Practices `tablist` / `tab` / `tabpanel`
**What:** Accessible tab pattern mandated for DESK-01.

**When to use:** Any time there is more than one tab; a single tab is a radio button, not a tablist. Since we have exactly three fixed tabs this applies.

**Required ARIA wiring:**
- Container: `role="tablist"` + `aria-label="Dictus platforms"` (translated)
- Each tab: `role="tab"` + `aria-selected={isActive}` + `aria-controls={panelId}` + unique `id={tabId}` + `tabIndex={isActive ? 0 : -1}` (roving tabindex)
- Tabpanel: `role="tabpanel"` + `aria-labelledby={tabId}` + unique `id={panelId}` + `tabIndex={0}` (focusable so keyboard users can scroll it)

**Keyboard contract (APG):**
- `ArrowLeft` / `ArrowRight` — cycle tabs (wrap-around)
- `Home` / `End` — jump to first / last tab
- `Tab` — exit tablist into tabpanel content
- Activation model: "automatic" (the tab activates on focus) is the simplest compliant option for three tabs; document this in the planner output

**Example (skeletal):**
```tsx
// Source: WAI-ARIA APG "Tabs with Automatic Activation" https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
<div role="tablist" aria-label={tList("aria_label")}>
  {OSES.map((o) => (
    <button
      key={o}
      role="tab"
      id={`tab-${o}`}
      aria-selected={selected === o}
      aria-controls={`panel-${o}`}
      tabIndex={selected === o ? 0 : -1}
      onClick={() => setSelected(o)}
      onKeyDown={handleTabKey} // Arrow / Home / End
    >
      <Icon icon={ICONS[o]} width={20} height={20} aria-hidden="true" />
      {t(`tab_${o}`)}
    </button>
  ))}
</div>
<div role="tabpanel" id={`panel-${selected}`} aria-labelledby={`tab-${selected}`} tabIndex={0}>
  {/* Coming Soon card */}
</div>
```

### Pattern 3: "Coming Soon" Vocabulary (reuse, do not invent)
**What:** The project already has a shipped coming-soon visual grammar in `Features.tsx`. Reuse it byte-for-byte for semantic consistency.

**Reusable class strings (copy verbatim):**

Tier 2 glass card (section wrapper / panel surface):
```
rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6
backdrop-blur-[12px] backdrop-saturate-[1.2]
transition-colors hover:border-border-hi
```
(Source: `src/components/Features/Features.tsx:12`, `src/components/Community/Community.tsx:9`)

Dashed-border disabled coming-soon card (perfect semantic match for the tabpanel inside Phase 13):
```
rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)]
p-6 opacity-75 backdrop-blur-[12px] backdrop-saturate-[1.2]
transition-opacity hover:opacity-100
```
(Source: `src/components/Features/Features.tsx:110` and identical on lines 138, 166, 193)

Navy icon tile (for the large platform icon inside the tabpanel):
```
flex h-12 w-12 items-center justify-center rounded-xl bg-navy
```
Inner icon: `className="text-sky"` + `aria-hidden="true"` (Source: `src/components/Features/Features.tsx:13`)

Accent pulse-pill (the "Coming soon" text-badge):
```
inline-flex items-center gap-2 rounded-full border border-accent/20
bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent
```
Inside it place: `<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />` (Source: `src/components/Features/Features.tsx:98–104`)

Section chrome (bg + padding + max-width container):
```
<section className="bg-ink-2 py-28">       // alternate ink color to break rhythm between Hero and Features
  <div className="mx-auto max-w-6xl px-6">  // Tailwind max-w-6xl + px-6 is the site-wide convention
    ...
  </div>
</section>
```
(Source: `src/components/Features/Features.tsx:7–8` and `src/components/Community/Community.tsx:7–8`)

### Pattern 4: `downloads.ts` Config Shape
**What:** Type-first placeholder config that survives the transition from "coming soon" → "download enabled" without a schema migration.

**Shape (locked by CONTEXT, typed here):**
```ts
// src/config/downloads.ts
export type DownloadVariant = {
  readonly enabled: boolean;
  readonly url: string;
  readonly label: string; // human-readable ("Coming Soon", "Download (.dmg)")
};

export type LinuxFormat = DownloadVariant & {
  readonly type: "appimage" | "deb" | "rpm" | "flatpak";
};

export type DownloadsConfig = {
  readonly macos: { readonly arm64: DownloadVariant; readonly x64: DownloadVariant };
  readonly windows: { readonly x64: DownloadVariant; readonly arm64: DownloadVariant };
  readonly linux: { readonly formats: readonly LinuxFormat[] };
};

export const downloads: DownloadsConfig = {
  macos: {
    arm64: { enabled: false, url: "", label: "Coming Soon" },
    x64:   { enabled: false, url: "", label: "Coming Soon" },
  },
  windows: {
    x64:   { enabled: false, url: "", label: "Coming Soon" },
    arm64: { enabled: false, url: "", label: "Coming Soon" },
  },
  linux: {
    formats: [
      { type: "appimage", enabled: false, url: "", label: "Coming Soon" },
      { type: "deb",      enabled: false, url: "", label: "Coming Soon" },
      { type: "rpm",      enabled: false, url: "", label: "Coming Soon" },
    ],
  },
} as const;
```

**Why `readonly` arrays and `as const`:** Matches `donate.ts` which uses `as const` (line 7, 14). Prevents accidental runtime mutation and narrows types at the call site (the component can say "if `downloads.macos.arm64.enabled` then render download button, else render Coming Soon").

**Linux format default set (Claude's discretion, recommended):** `appimage` + `deb` + `rpm`. Rationale: `AppImage` covers every distro (Handy.computer ships it first), `deb` for Ubuntu/Debian (largest desktop share), `rpm` for Fedora/openSUSE. `flatpak` is defer-able — adding it later is a one-line push to the array without shape change.

### Anti-Patterns to Avoid
- **Using `navigator` in the component body (top-level or initial `useState`):** causes hydration mismatch. Always gate with `useEffect`.
- **Putting the Platforms component in a Server Component:** `navigator` is browser-only. Must be `"use client"`.
- **Recomputing OS on every render:** detect once in `useEffect` and memoize in `useState`.
- **Rendering the three tabs as three *separate visible* cards instead of a single tabpanel:** breaks the CONTEXT-locked "single glass card showing content of selected OS" UX.
- **Forgetting roving `tabIndex` on the tab buttons:** causes every tab to be in the tab order, which contradicts the APG tabs pattern.
- **Hardcoding "Coming Soon" strings in the component:** keep them in `downloads.ts.label` OR in `messages/*.json` (pick one and be consistent — recommendation: use the i18n namespace `Platforms` so both locales translate "Coming Soon" / "Bientôt disponible").
- **Reading `navigator.platform`:** deprecated. Use `navigator.userAgent` (matches `AdaptiveCTA`).
- **Treating `iPad` as "mac":** modern iPadOS spoofs desktop Safari UA. Test `iPad|iPhone|iPod|Android` *before* `Mac OS X`. This is already the order the pattern above uses.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Platform brand icons (Apple, Windows, Tux) | Custom SVG paths à la `AdaptiveCTA.AppleIcon` | `<Icon icon="simple-icons:apple" />` / `simple-icons:windows` / `simple-icons:linux` from `@iconify/react` | Already installed; simple-icons is the de-facto brand-mark library (293k+ Iconify icons, used in every major design system). Drawing Tux by hand is ~180 SVG path commands and you'll get it subtly wrong. |
| Accessible tab widget | Custom `<div>` with `onClick` | WAI-ARIA APG tabs pattern (Pattern 2 above) — native `<button role="tab">` + manual keyboard handler | Hand-rolled tabs miss `aria-selected`, roving tabindex, arrow-key cycle, Home/End — all required by WCAG 2.1 SC 4.1.2 and 2.1.1. The APG spec is 40 lines of JSX, not worth a dep like Radix/Headless UI for three static tabs. |
| OS detection | `navigator.platform` switch or naive `indexOf("Mac")` | Regex-based UA sniff in `detectOs()` (Pattern 1 above) with explicit mobile-first ordering | `navigator.platform` is deprecated; naive `indexOf` breaks on iPad (which reports `"MacIntel"`). The AdaptiveCTA pattern is already battle-tested in this repo. |
| Entrance animation | `IntersectionObserver` + CSS keyframes | `<ScrollReveal>` wrapper from `src/components/shared/ScrollReveal.tsx` | Already the site-wide convention. Handles reduced-motion + session-storage skip correctly. |
| Config type discipline | Plain object exports | `as const` + `readonly` field types (see `donate.ts:7,14`) | Matches project convention; enables narrowed types and compile-time safety when a plan later toggles `enabled: true`. |

**Key insight:** The phase is "wire existing primitives together." No new runtime library is justified. Adding Radix / Headless UI / react-device-detect / ua-parser-js would all be scope creep rejected by §Scope Discipline (SuperClaude RULES) and by CONTEXT's minimalism.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from `navigator` in Initial Render
**What goes wrong:** React 19 throws `Text content does not match server-rendered HTML` and the client re-renders the entire tree, losing focus state and causing a visible flash.
**Why it happens:** Server renders "tab A selected", client detects macOS and renders "tab C selected" on first pass — the two initial DOMs differ.
**How to avoid:** Mirror `AdaptiveCTA`'s `useState<DeviceType>("unknown")` + `useEffect` + `requestAnimationFrame` pattern exactly. Server and pre-hydration client both render `selected === null` (no tabpanel or neutral state).
**Warning signs:** A browser console warning mentioning "hydration" in a fresh hard-reload of the home page. Use Next.js dev mode to catch this during implementation.

### Pitfall 2: iPad / iPadOS Reporting Mac-Like User Agent
**What goes wrong:** Since iPadOS 13, Safari on iPad sends a UA string identical to desktop Safari on macOS (`Mozilla/5.0 (Macintosh; ...)`). A naive `/Mac OS X/` test on mobile iPad pre-selects the macOS tab — misleading.
**Why it happens:** Apple's "Request Desktop Website" default behavior.
**How to avoid:** Test mobile UAs *first* (`iPhone|iPad|iPod|Android`) and return `"unknown"` on match, *then* test Mac/Win/Linux. Pattern 1 above already encodes this order.
**Warning signs:** Opening the site on an iPad and seeing the macOS tab pre-selected.

### Pitfall 3: `aria-selected` Without Roving `tabIndex`
**What goes wrong:** Screen readers announce the correct tab, but keyboard users tab through all three tab buttons before reaching the tabpanel.
**Why it happens:** Without `tabIndex={isActive ? 0 : -1}` every `<button>` is in the tab order.
**How to avoid:** Set `tabIndex={selected === o ? 0 : -1}` on each tab button AND implement Arrow/Home/End via `onKeyDown` (Pattern 2).
**Warning signs:** Pressing Tab repeatedly inside the section advances one-tab-at-a-time instead of jumping into the panel on the second Tab press.

### Pitfall 4: i18n Key Collision with Existing `Comparison.dictus_platforms`
**What goes wrong:** Updating `dictus_platforms` without a sweep leaves the mobile cards (`ComparisonCards.tsx`) or the desktop table (`ComparisonTable.tsx`) out of sync. The repo has both renderers reading the same key — edit once, re-verify both viewports.
**Why it happens:** `ComparisonCards.tsx:33-34` reads `feature === "feature_price" ? ${product}_price : ${product}_platforms` — identical key for both layouts.
**How to avoid:** The key is shared, so a single string edit propagates. The risk is wording: "Mobile & Desktop" is shorter than competitor rows (e.g. `"iOS, macOS, Windows, Android"`) and may look odd at small widths. Verify on mobile cards at 375px.
**Warning signs:** Line-wrapping or truncation on the platforms row at mobile width during visual smoke.

### Pitfall 5: Metadata Title Over Open Graph Length Budget
**What goes wrong:** OG tools truncate titles over ~70 chars with ellipsis; search results truncate around 55–60 chars. Replacing `"dictus -- 100% Offline Voice Dictation for iOS & Android"` (56 chars) with `"dictus -- 100% Offline Voice Dictation for iOS, Android, Mac, Windows, Linux"` (77 chars) is over budget.
**Why it happens:** Temptation to be exhaustive.
**How to avoid:** Use the terse "Mobile & Desktop" or "every device" framing in the title; list specifics in the description. Recommended rewrites:
- EN (56 chars): `"dictus -- 100% Offline Voice Dictation for Mobile & Desktop"` *(60 chars — within budget)*
- FR (58 chars): `"dictus -- Dictation vocale 100% offline Mobile & Desktop"` *(60 chars — within budget)*
**Warning signs:** OG debugger (e.g. opengraph.xyz) showing `…` mid-title.

### Pitfall 6: Forgetting the `<ScrollReveal>` Wrapper
**What goes wrong:** The new Platforms section appears without the entrance animation that every other section has — visually jarring.
**Why it happens:** Easy to miss when mirroring `<Hero />` in `page.tsx` (Hero is unwrapped; Features / Comparison / HowItWorks / OpenSource / Community are all wrapped).
**How to avoid:** `<ScrollReveal><Platforms /></ScrollReveal>` — page.tsx lines 43–47 show five consecutive wrapped sections; add the sixth immediately after `<Hero />`.
**Warning signs:** The section appears instantly with no fade-in when scrolling down.

### Pitfall 7: `simple-icons:windows` Renders the Win 95/Vista-style Flag
**What goes wrong:** The Iconify `simple-icons:windows` is the older four-pane wavy flag (pre-2012) — visually dated.
**Why it happens:** `simple-icons` keeps historical brand marks.
**How to avoid:** Use `simple-icons:windows11` for the modern flat four-pane mark (confirmed on simple-icons slugs.md). CONTEXT specified `simple-icons:windows` — I flag this as a *visual QA* concern, not a blocker. Planner may escalate as "Claude's discretion".
**Warning signs:** Windows tab icon looks stylistically inconsistent with the flat simple-icons Apple/Linux marks.

## Code Examples

Verified patterns from repo and authoritative sources. Planner should reference these in task actions.

### Example 1: Client Component Scaffold with SSR-Safe Detection
```tsx
// src/components/Platforms/Platforms.tsx
// Source pattern: src/components/Hero/AdaptiveCTA.tsx (lines 1–15, 99–123)
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { downloads } from "@/config/downloads";

type Os = "mac" | "win" | "linux";
type Selection = Os | null;

const ORDERED: readonly Os[] = ["mac", "win", "linux"] as const;
const ICONS: Record<Os, string> = {
  mac: "simple-icons:apple",
  win: "simple-icons:windows",     // or "simple-icons:windows11" — see Pitfall 7
  linux: "simple-icons:linux",
};

function detectOs(): Os | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return null;
  if (/Mac OS X|Macintosh/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "win";
  if (/Linux|X11/.test(ua)) return "linux";
  return null;
}

export default function Platforms() {
  const t = useTranslations("Platforms");
  const [selected, setSelected] = useState<Selection>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const detected = detectOs();
    requestAnimationFrame(() => {
      if (detected) setSelected(detected);
    });
  }, []);

  const onTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
      let next = i;
      if (e.key === "ArrowRight") next = (i + 1) % ORDERED.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + ORDERED.length) % ORDERED.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = ORDERED.length - 1;
      else return;
      e.preventDefault();
      setSelected(ORDERED[next]);
      tabsRef.current[next]?.focus();
    },
    []
  );

  return (
    <section className="bg-ink-2 py-28" aria-labelledby="platforms-heading">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="platforms-heading"
          className="text-3xl font-normal text-text-primary md:text-4xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          {t("heading")}
        </h2>
        <p className="mt-4 text-white-70">{t("subheading")}</p>

        <div
          role="tablist"
          aria-label={t("tablist_label")}
          className="mt-8 flex flex-wrap gap-2"
        >
          {ORDERED.map((o, i) => {
            const active = selected === o;
            return (
              <button
                key={o}
                ref={(el) => { tabsRef.current[i] = el; }}
                role="tab"
                id={`platforms-tab-${o}`}
                aria-selected={active}
                aria-controls={`platforms-panel-${o}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(o)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={[
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2 text-sm font-light transition-colors",
                  active
                    ? "border border-accent/40 bg-accent/10 text-accent"
                    : "border border-border bg-[var(--glass-t2-bg)] text-white-70 hover:border-border-hi",
                ].join(" ")}
              >
                <Icon icon={ICONS[o]} width={18} height={18} aria-hidden="true" />
                {t(`tab_${o}`)}
              </button>
            );
          })}
        </div>

        {/* Single tabpanel — renders content of selected OS, or neutral placeholder when selected === null */}
        {selected ? (
          <ComingSoonCard os={selected} />
        ) : (
          <p className="mt-8 text-sm text-white-40">{t("select_prompt")}</p>
        )}
      </div>
    </section>
  );
}
```

### Example 2: Coming Soon Tabpanel Card (reuses Features vocabulary)
```tsx
// Same file — ComingSoonCard subcomponent
// Source vocabulary: src/components/Features/Features.tsx:98–135
function ComingSoonCard({ os }: { os: Os }) {
  const t = useTranslations("Platforms");

  return (
    <div
      role="tabpanel"
      id={`platforms-panel-${os}`}
      aria-labelledby={`platforms-tab-${os}`}
      tabIndex={0}
      className="mt-8 rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-8 opacity-90 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100"
    >
      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy">
          <Icon icon={ICONS[os]} width={32} height={32} className="text-sky" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-normal text-text-primary">{t(`panel_${os}_title`)}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white-70">
            {t(`panel_${os}_desc`)}
          </p>

          {/* Coming Soon pulse-pill */}
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              {t("coming_soon_label")}
            </span>
          </div>

          {/* Secondary action: Star on GitHub */}
          <a
            href="https://github.com/Pivii/dictus"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
          >
            {/* Reuse GitHub SVG from src/components/OpenSource/OpenSource.tsx:18–26 */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57..."/></svg>
            {t("star_on_github")}
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Example 3: `downloads.ts` (final shape)
```ts
// src/config/downloads.ts
// Source convention: src/config/donate.ts (uses `as const`)
export type DownloadVariant = {
  readonly enabled: boolean;
  readonly url: string;
  readonly label: string;
};

export type LinuxFormat = DownloadVariant & {
  readonly type: "appimage" | "deb" | "rpm" | "flatpak";
};

export type DownloadsConfig = {
  readonly macos: {
    readonly arm64: DownloadVariant;
    readonly x64: DownloadVariant;
  };
  readonly windows: {
    readonly x64: DownloadVariant;
    readonly arm64: DownloadVariant;
  };
  readonly linux: {
    readonly formats: readonly LinuxFormat[];
  };
};

export const downloads: DownloadsConfig = {
  macos: {
    arm64: { enabled: false, url: "", label: "Coming Soon" },
    x64:   { enabled: false, url: "", label: "Coming Soon" },
  },
  windows: {
    x64:   { enabled: false, url: "", label: "Coming Soon" },
    arm64: { enabled: false, url: "", label: "Coming Soon" },
  },
  linux: {
    formats: [
      { type: "appimage", enabled: false, url: "", label: "Coming Soon" },
      { type: "deb",      enabled: false, url: "", label: "Coming Soon" },
      { type: "rpm",      enabled: false, url: "", label: "Coming Soon" },
    ],
  },
} as const;

// Convenience helper (optional, saves `.enabled` checks in component)
export function anyEnabled(v: DownloadVariant | readonly DownloadVariant[]): boolean {
  return Array.isArray(v) ? v.some((d) => d.enabled) : (v as DownloadVariant).enabled;
}
```

### Example 4: Page Integration
```tsx
// src/app/[locale]/page.tsx — DIFF
// Insert new import at top:
import Platforms from "@/components/Platforms/Platforms";

// Change JSON-LD (line 27):
-  operatingSystem: "iOS 18+, Android",
+  operatingSystem: "iOS 18+, Android, macOS, Windows, Linux",

// Insert section between <Hero /> and <Features /> (after line 42):
  <Hero />
+ <ScrollReveal><Platforms /></ScrollReveal>
  <ScrollReveal><Features /></ScrollReveal>
```

### Example 5: Copy Sweep Inventory (DESK-04 exhaustive list)

| File | Key / location | Before | After (recommended) |
|------|---------------|--------|---------------------|
| `src/messages/en.json` | `Metadata.title` | `"dictus -- 100% Offline Voice Dictation for iOS & Android"` | `"dictus -- 100% Offline Voice Dictation for Mobile & Desktop"` |
| `src/messages/fr.json` | `Metadata.title` | `"dictus -- Dictation vocale 100% offline pour iOS & Android"` | `"dictus -- Dictation vocale 100% offline Mobile & Desktop"` |
| `src/messages/en.json` | `Comparison.dictus_platforms` | `"iOS & Android"` | `"Mobile & Desktop"` |
| `src/messages/fr.json` | `Comparison.dictus_platforms` | `"iOS & Android"` | `"Mobile & Desktop"` |
| `src/messages/en.json` | `Support.compatibility_text` | `"Dictus requires iOS 18+ (iPhone) — Android support coming soon."` | `"Dictus runs on iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon)."` |
| `src/messages/fr.json` | `Support.compatibility_text` | `"Dictus nécessite iOS 18+ (iPhone) — support Android bientôt disponible."` | `"Dictus fonctionne sur iOS 18+ (beta), Android (beta), et macOS, Windows, Linux (bientôt disponibles)."` |
| `src/app/[locale]/page.tsx` | `jsonLd.operatingSystem` (line 27) | `"iOS 18+, Android"` | `"iOS 18+, Android, macOS, Windows, Linux"` |

**Strings confirmed platform-agnostic and NOT to touch (reviewed 2026-04-16):**
- `Metadata.description` — already platform-agnostic ("works entirely on your device")
- `Metadata.jsonld_description` — already platform-agnostic
- `Hero.headline` / `Hero.subtitle` — already platform-agnostic
- `Hero.badge_ios` / `badge_android` / `cta_*` — scope-locked to AdaptiveCTA mobile CTAs (CONTEXT: "AdaptiveCTA: no changes")
- `Features.*` — capability-focused (CONTEXT: "Features section: no changes")
- `Comparison` competitor platform strings (`apple_platforms`, `wisprflow_platforms`, etc.) — those describe competitors, not Dictus
- `Privacy.*` — `Full Access` paragraph mentions iOS keyboard API (correct — that's iOS-specific and remains accurate)
- `Donate.*` — scope-locked out of this phase
- Footer / Nav / HowItWorks / OpenSource / Community — no platform mentions

**New `Platforms` namespace (to add in both locales):**
```json
// Suggested keys — planner may refine wording
{
  "Platforms": {
    "heading": "Also coming to Desktop",           // EN
    "heading": "Aussi sur Desktop",                // FR
    "subheading": "Dictus is expanding to macOS, Windows, and Linux. Same 100% offline guarantee.",
    "tablist_label": "Desktop platforms",
    "tab_mac": "macOS",
    "tab_win": "Windows",
    "tab_linux": "Linux",
    "panel_mac_title": "macOS",
    "panel_mac_desc": "Apple Silicon (arm64) and Intel (x64). Native app, no login, no telemetry.",
    "panel_win_title": "Windows",
    "panel_win_desc": "Windows 10/11, x64 and ARM. Installer and MSI.",
    "panel_linux_title": "Linux",
    "panel_linux_desc": "AppImage (universal), .deb (Ubuntu/Debian), .rpm (Fedora/openSUSE).",
    "coming_soon_label": "Coming Soon",
    "select_prompt": "Pick a platform to see details.",
    "star_on_github": "Star on GitHub to follow progress"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `navigator.platform` | `navigator.userAgent` + regex | ~2020 when `.platform` deprecated in the spec | Use `userAgent` only. Already the repo convention. |
| Tab widgets via `<div role="tab">` clickable divs | Native `<button role="tab">` + APG keyboard handler | ~2021 (WAI-ARIA APG 1.2) | Use `<button>` for built-in keyboard + focus behavior. |
| Heavy UI kits (Radix/Headless UI) for tabs | Hand-rolled APG tabs when count is small and static | Project choice | Keeps bundle small, no new dep. Three fixed tabs doesn't justify a library. |
| Inline SVG for brand marks | Iconify `simple-icons:*` | ~2020 with Iconify React v3+ | Already present on `/donate`. Extend to Platforms. |

**Deprecated/outdated — do not use:**
- `navigator.platform` — deprecated (MDN).
- UA-parser-js / react-device-detect — overkill for 3-OS fork, adds 30kb+. Not justified.
- `react-tabs` / `@reach/tabs` — project philosophy is "no new deps unless essential" (confirmed by CONTEXT's `@iconify/react` reuse).
- Old Windows "flag" logo (`simple-icons:windows`) — replaceable by `simple-icons:windows11` if visual audit flags it (Pitfall 7).

## Open Questions

1. **Which Windows icon — `simple-icons:windows` (old wavy flag) or `simple-icons:windows11` (modern flat four-pane)?**
   - What we know: CONTEXT specifies `simple-icons:windows`. Both exist in the simple-icons set (confirmed on slugs.md).
   - What's unclear: Which one reads better alongside flat Apple + flat Linux marks at 18px and 32px.
   - Recommendation: Planner should treat this as a Claude's-discretion visual decision during implementation. Default to CONTEXT's `simple-icons:windows`; swap to `windows11` if visual smoke shows stylistic mismatch.

2. **Should the auto-detected tab get a visual accent beyond just being "selected"?**
   - What we know: CONTEXT lists this as Claude's discretion.
   - What's unclear: Whether users benefit from a subtle "detected for you" indicator (e.g. pulse dot or "Auto" label).
   - Recommendation: Ship without it in v1. Standard tab selection already communicates state. If user feedback requests it, add a single aria-describedby line in a follow-up.

3. **FR Metadata title wording — keep "Mobile & Desktop" (English-like) or translate?**
   - What we know: "Mobile et Desktop" is unnatural in French; "Mobile et PC" is too colloquial; "tous vos appareils" is wordy.
   - What's unclear: Brand voice preference.
   - Recommendation: Planner owns this. "Mobile & Desktop" works bilingually (Desktop is a loanword widely used in French tech). Default there unless an editorial pass objects.

4. **Does the Platforms section belong before or after Features?**
   - What we know: CONTEXT locks "after Hero, before Features."
   - What's unclear: Nothing — this is a locked decision, recorded here for traceability.
   - Recommendation: N/A — follow CONTEXT.

5. **Plan split — one plan or two?**
   - What we know: CONTEXT suggests "2 plans: section + config / copy sweep."
   - What's unclear: Whether the copy sweep is large enough to merit its own plan (it's 7 strings across 3 files).
   - Recommendation: **Two plans** — (a) `Platforms` component + `downloads.ts` + page integration + JSON-LD edit; (b) i18n copy sweep (`Metadata.title`, `Comparison.dictus_platforms`, `Support.compatibility_text` across FR+EN, plus the new `Platforms` namespace keys). Rationale: (a) is code, (b) is content. Different review lens, different rollback surface.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | **None currently installed** (no `jest`, `vitest`, `playwright`, or `@testing-library/*` in package.json; no `tests/` or `__tests__/` directory) |
| Config file | none — see Wave 0 |
| Quick run command | `npx tsc --noEmit && npx eslint .` (type-check + lint — fastest gate available today) |
| Full suite command | `npx tsc --noEmit && npx eslint . && npm run build` (adds Next.js build which catches SSR/hydration issues and broken i18n keys) |
| Phase gate | Full suite green + manual browser smoke across 3 viewport widths (375 / 768 / 1440) before `/gsd:verify-work` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DESK-01 | `detectOs()` returns `"mac"` for macOS UA, `"win"` for Windows UA, `"linux"` for Linux UA, `null` for iPhone/iPad/Android | unit | N/A — no unit framework. Fallback: **type-check** ensures `detectOs` signature + **manual smoke** with browser DevTools UA override (one-time QA script attached in plan actions) | ❌ (no test runner) |
| DESK-01 | Tablist is keyboard-navigable (Arrow/Home/End) and screen-reader-accessible | manual | Manual keyboard run + macOS VoiceOver / Windows NVDA smoke — documented checklist in plan | ❌ |
| DESK-01 | No hydration mismatch warning in dev console on first paint | smoke | `npm run dev` + open `/fr` and `/en`, watch console for hydration errors | ❌ |
| DESK-02 | Each tab renders an Iconify icon + Coming Soon pulse-pill + GitHub star link | smoke | Manual visual verification at three widths | ❌ |
| DESK-03 | `downloads.ts` exports typed config with `enabled: false` defaults; consuming component compiles against the type | unit + type-check | `npx tsc --noEmit` — compile-time catches wrong field shape | ✅ (TSC already works) |
| DESK-04 | All 7 strings (EN×3, FR×3, JSON-LD×1) updated; no stale "iOS & Android" or "mobile-only" strings remain | grep | `Grep` tool for `"iOS & Android"` returns only competitor rows (apple/wisprflow/etc.) — none on Dictus rows | ✅ (Grep works) |
| DESK-04 | OG title length ≤ 70 chars in both locales | smoke | Manual: open OG debugger + verify | ❌ |
| DESK-04 | Both locales (`/fr` and `/en`) render without missing-key warnings from next-intl | smoke | `npm run build` fails if i18n keys are referenced but absent | ✅ (build works) |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit && npx eslint .` (≤ 10 s)
- **Per wave merge:** `npx tsc --noEmit && npx eslint . && npm run build` (≤ 60 s — catches SSR/hydration and i18n key errors)
- **Phase gate:** Full suite green + manual multi-viewport smoke (375 / 768 / 1440) + VoiceOver/NVDA keyboard pass on the tablist + UA-override tests for Mac/Win/Linux/iPhone/Android pre-selection

### Wave 0 Gaps
*(The project has no test framework. Installing one is **out of scope** for Phase 13 per §Scope Discipline — the phase goal is desktop-prep copy + UI, not test infrastructure. Manual smoke is the accepted floor.)*

- [ ] **(NOT THIS PHASE)** Install `vitest` + `@testing-library/react` + `jsdom` — defer to a future "testing infrastructure" phase. Adding it here would triple the plan scope.
- [ ] **(THIS PHASE)** Document the manual smoke checklist as part of the second plan's actions (UA-override testing for all 5 platforms + keyboard nav + VoiceOver/NVDA pass).
- [ ] **(THIS PHASE)** Add a one-line script in `package.json` if convenient: `"typecheck": "tsc --noEmit"` — convenience only, not a blocker.

**Gaps this phase closes without a framework:** DESK-03 (type-checking catches config mistakes), DESK-04 (Grep catches stale strings + `next build` catches missing i18n keys). The remaining requirements (DESK-01, DESK-02) are UI behaviors that genuinely need manual QA until a runner is installed — and with three static tabs and a locked design, the manual surface is small.

## Sources

### Primary (HIGH confidence)
- `src/components/Hero/AdaptiveCTA.tsx` (lines 1–15, 99–123) — verified SSR-safe device detection pattern already shipped in this repo
- `src/components/Features/Features.tsx` (lines 98–135) — verified Tier 2 glass card + dashed coming-soon + accent pulse-pill vocabulary
- `src/components/Community/Community.tsx` (lines 7–33) — verified glass card + accent CTA pattern
- `src/components/OpenSource/OpenSource.tsx` — verified GitHub SVG + link pattern
- `src/config/donate.ts` — verified `as const` config convention
- `src/app/[locale]/page.tsx` (line 27) — verified JSON-LD `operatingSystem` location
- `src/app/[locale]/layout.tsx` (lines 38–87) — verified `generateMetadata` + `next-intl` `getTranslations` pattern
- `src/app/[locale]/support/page.tsx` (line 84) — verified `compatibility_text` i18n key location
- `src/messages/en.json`, `src/messages/fr.json` — verified complete string surface
- `src/components/Donate/DonateCards.tsx` (line 5) — verified `@iconify/react` usage pattern already present
- `package.json` — verified `@iconify/react ^6.0.2` in dependencies (zero new installs)
- `.planning/phases/13-desktop-preparation/13-CONTEXT.md` — authoritative user decisions
- `.planning/config.json` — verified `nyquist_validation: true`
- simple-icons `slugs.md` (develop branch) — verified `apple`, `windows`, `windows11`, `linux` slugs exist

### Secondary (MEDIUM confidence)
- Handy.computer `/download` (fetched 2026-04-16) — verified OS + architecture split pattern; note that Handy uses sectional headers, not horizontal tabs (CONTEXT chose tabs regardless — explicitly a design divergence)
- WAI-ARIA APG "Tabs" pattern (w3.org/WAI/ARIA/apg/patterns/tabs/) — verified keyboard contract and ARIA wiring
- MDN `navigator.userAgent` / `userAgentData` — verified deprecation of `.platform`

### Tertiary (LOW confidence — flagged for validation)
- Exact OG title character budget (55 chars for search, ~70 for OG) — industry convention, not a formal spec. Treat recommended titles as upper-bound safe.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every dep already in `package.json` and in active use elsewhere in the repo
- Architecture: **HIGH** — three of four patterns have verbatim precedents in this repo (`AdaptiveCTA`, `Features`, `donate.ts`); the fourth (ARIA tabs) is a standardized W3C APG pattern
- Pitfalls: **HIGH** for hydration / iPad-UA / roving-tabindex / ScrollReveal; **MEDIUM** for OG title budgets (convention, not spec)
- Copy sweep: **HIGH** — exhaustive grep of `/src/messages` confirms no platform-referencing strings were missed
- Validation architecture: **MEDIUM** — no test runner exists, so Nyquist leans on manual smoke + `tsc`/`eslint`/`next build`. Adequate for a preparation phase; insufficient for behavior-critical features in future phases.

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (30 days — stack is stable; only `simple-icons` slugs could shift and even that requires a Iconify index refresh which is unlikely to remove apple/windows/linux)

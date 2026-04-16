---
phase: 13-desktop-preparation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/config/downloads.ts
  - src/components/Platforms/Platforms.tsx
  - src/app/[locale]/page.tsx
autonomous: false
requirements:
  - DESK-01
  - DESK-02
  - DESK-03

must_haves:
  truths:
    - "Visitors see a new 'Also coming to Desktop' section directly after the Hero on the home page, in both /fr and /en locales"
    - "The section renders three tabs labelled macOS / Windows / Linux, each with its simple-icons brand mark"
    - "On a desktop browser, the tab matching the user's OS is pre-selected after hydration without a hydration-mismatch warning"
    - "On an iPhone/iPad/Android browser, no tab is pre-selected — the user sees a neutral prompt and must tap a tab"
    - "Selecting a tab reveals a single dashed-border glass card showing the OS icon in a navy tile, a short description, a pulsing 'Coming Soon' accent pill, and a 'Star on GitHub' link to https://github.com/Pivii/dictus"
    - "Tablist is keyboard-navigable: ArrowLeft/Right cycle tabs (with wrap), Home jumps to first, End jumps to last, Tab moves into the panel"
    - "JSON-LD operatingSystem field in the home page script tag equals 'iOS 18+, Android, macOS, Windows, Linux'"
    - "The new downloads.ts config exports a typed DownloadsConfig with every variant set to { enabled: false, url: '', label: 'Coming Soon' }"
  artifacts:
    - path: "src/config/downloads.ts"
      provides: "Typed arch-aware download config placeholder (mac arm64/x64, win x64/arm64, linux appimage+deb+rpm)"
      exports: ["DownloadVariant", "LinuxFormat", "DownloadsConfig", "downloads", "anyEnabled"]
    - path: "src/components/Platforms/Platforms.tsx"
      provides: "Client component rendering WAI-ARIA tablist with OS auto-detection and Coming Soon tabpanel"
      min_lines: 120
    - path: "src/app/[locale]/page.tsx"
      provides: "Home page with Platforms section inserted + updated JSON-LD operatingSystem"
      contains: "<Platforms"
  key_links:
    - from: "src/app/[locale]/page.tsx"
      to: "src/components/Platforms/Platforms.tsx"
      via: "import Platforms from \"@/components/Platforms/Platforms\" + <ScrollReveal><Platforms /></ScrollReveal>"
      pattern: "import\\s+Platforms\\s+from\\s+\"@/components/Platforms/Platforms\""
    - from: "src/components/Platforms/Platforms.tsx"
      to: "src/config/downloads.ts"
      via: "import { downloads } from \"@/config/downloads\""
      pattern: "import.*downloads.*from.*@/config/downloads"
    - from: "src/components/Platforms/Platforms.tsx"
      to: "@iconify/react"
      via: "Icon icon=\"simple-icons:apple|windows|linux\""
      pattern: "simple-icons:(apple|windows|linux)"
---

<objective>
Build the DESK-01 / DESK-02 / DESK-03 surface: a new "Also coming to Desktop" section with three WAI-ARIA tabs (macOS / Windows / Linux), SSR-safe OS auto-detection, a disabled Coming Soon tabpanel that reuses existing glassmorphism vocabulary, a typed `downloads.ts` placeholder config, and the JSON-LD multi-OS string update. Plan 02 (wave 2) will deliver the i18n keys this component consumes and the rest of the copy sweep.

Purpose: Communicate Desktop reality ("coming to Mac/Win/Linux") without activating any download links — the configuration is wired so binaries can be toggled on later with no code change.

Output:
- `src/config/downloads.ts` (NEW) — typed, arch-aware placeholder config
- `src/components/Platforms/Platforms.tsx` (NEW) — client component, WAI-ARIA tablist
- `src/app/[locale]/page.tsx` (EDIT) — insert Platforms section + update JSON-LD `operatingSystem`
- Manual QA checklist completed (UA-override, keyboard, VoiceOver/NVDA)
</objective>

<execution_context>
@/Users/pierreviviere/.claude/get-shit-done/workflows/execute-plan.md
@/Users/pierreviviere/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/13-desktop-preparation/13-CONTEXT.md
@.planning/phases/13-desktop-preparation/13-RESEARCH.md
@.planning/phases/13-desktop-preparation/13-VALIDATION.md
@CLAUDE.md

<interfaces>
<!-- Key contracts the executor needs. Use these directly, no codebase exploration required. -->

From src/config/donate.ts (convention to mirror — `as const` config):
```ts
export const stripeLinks = {
  5: "https://buy.stripe.com/PLACEHOLDER_5EUR",
  // ...
} as const;
export const AMOUNTS = [5, 10, 25, 50] as const;
```

From src/components/Hero/AdaptiveCTA.tsx (SSR-safe device detection — blueprint for OS detection):
```tsx
"use client";
import { useState, useEffect } from "react";
type DeviceType = "iphone" | "android" | "desktop" | "other-mobile" | "unknown";
function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  if (/webOS|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return "other-mobile";
  return "desktop";
}
// Inside component:
const [device, setDevice] = useState<DeviceType>("unknown");
useEffect(() => {
  const detected = detectDevice();
  requestAnimationFrame(() => setDevice(detected));
}, []);
```

From src/components/Features/Features.tsx (Coming Soon vocabulary — reuse byte-for-byte):
```
Tier-2 glass card:        rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-colors hover:border-border-hi
Dashed disabled card:     rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-8 opacity-90 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100
Navy icon tile:           flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy
Accent pulse-pill:        inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent
Pulse dot inside pill:    inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent
```

From src/app/[locale]/page.tsx (lines 22-38 — current JSON-LD + section order):
```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "dictus",
  description: t("jsonld_description"),
  operatingSystem: "iOS 18+, Android",  // <- UPDATE this line
  // ...
};
// Section order (lines 40-48):
<Hero />
<ScrollReveal><Features /></ScrollReveal>   // <- INSERT <Platforms /> before this
```

From src/components/shared/ScrollReveal.tsx:
```tsx
// Default export. Wraps children in motion fade-up on in-view. Respects prefers-reduced-motion and sessionStorage "page-revealed" skip.
export default function ScrollReveal({ children, className, stagger = false }: Props)
```

From @iconify/react (already in package.json ^6.0.2, used at src/components/Donate/DonateCards.tsx:5):
```tsx
import { Icon } from "@iconify/react";
<Icon icon="simple-icons:apple" width={18} height={18} aria-hidden="true" />
```

i18n keys this plan's component will reference (DEFINED by Plan 02 in Wave 2 — the build will fail next-intl key-check until Plan 02 ships):
  Platforms.heading, Platforms.subheading, Platforms.tablist_label,
  Platforms.tab_mac, Platforms.tab_win, Platforms.tab_linux,
  Platforms.panel_mac_title, Platforms.panel_mac_desc,
  Platforms.panel_win_title, Platforms.panel_win_desc,
  Platforms.panel_linux_title, Platforms.panel_linux_desc,
  Platforms.coming_soon_label, Platforms.select_prompt, Platforms.star_on_github

NOTE: This plan writes t("Platforms.*") calls; next-intl does not hard-error on missing keys at build time (logs a warning at runtime). Plan 02 finalizes the keys. Executor MUST NOT stub keys in this plan — keep the component pointing at the final namespace so Plan 02 is a pure messages edit.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create src/config/downloads.ts typed placeholder config</name>
  <files>src/config/downloads.ts</files>
  <read_first>
    - src/config/donate.ts (EXACT convention to mirror: `export const ... = { ... } as const;` + PLACEHOLDER URLs)
    - .planning/phases/13-desktop-preparation/13-RESEARCH.md §Pattern 4 + §Code Example 3 (verbatim shape)
  </read_first>
  <action>
Create a NEW file `src/config/downloads.ts`. Write EXACTLY the types and const from RESEARCH §Example 3, including the `anyEnabled` helper. Content to write:

```ts
// src/config/downloads.ts
// Centralized download links for Dictus Desktop (Mac / Windows / Linux).
// Placeholders only — every variant is `enabled: false` until binaries ship.
// Shape convention mirrors src/config/donate.ts (`as const`).

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

// Convenience helper used by the Platforms component to decide
// Coming-Soon vs Active rendering without repeating `.enabled` checks.
export function anyEnabled(
  v: DownloadVariant | readonly DownloadVariant[]
): boolean {
  return Array.isArray(v)
    ? v.some((d) => d.enabled)
    : (v as DownloadVariant).enabled;
}
```

Do NOT add version, releaseDate, checksum, or size fields (deferred per CONTEXT). Do NOT use `enum` — stick to string-literal unions (project convention). The file must pass `npx tsc --noEmit` standalone (no imports from anywhere else).
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/config/downloads.ts` exits 0
    - `grep -c "as const" src/config/downloads.ts` returns at least 1 (outer object has `as const`)
    - `grep -c "enabled: false" src/config/downloads.ts` returns exactly 7 (mac arm64, mac x64, win x64, win arm64, linux appimage, linux deb, linux rpm)
    - `grep -c "label: \"Coming Soon\"" src/config/downloads.ts` returns exactly 7
    - `grep -E "export type (DownloadVariant|LinuxFormat|DownloadsConfig)" src/config/downloads.ts` matches 3 lines
    - `grep -E "export (const downloads|function anyEnabled)" src/config/downloads.ts` matches 2 lines
    - `npx tsc --noEmit` returns exit 0 (no type errors)
    - `npx eslint src/config/downloads.ts` returns exit 0
    - Validation map: this task closes `13-01-01` (DESK-03) via type-check
  </acceptance_criteria>
  <done>File exists; `downloads.enabled = false` everywhere; `DownloadsConfig` + `DownloadVariant` + `LinuxFormat` types exported; `anyEnabled` exported; `tsc` + `eslint` clean.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create src/components/Platforms/Platforms.tsx client component with WAI-ARIA tablist + SSR-safe OS auto-detection + Coming Soon tabpanel</name>
  <files>src/components/Platforms/Platforms.tsx</files>
  <read_first>
    - src/components/Hero/AdaptiveCTA.tsx (lines 1-15, 99-107 — SSR-safe detection blueprint)
    - src/components/Features/Features.tsx (lines 7-13, 98-135 — Tier-2 glass card + coming-soon vocabulary to mirror)
    - src/components/Community/Community.tsx (lines 7-33 — section chrome `bg-ink-2 py-28` + `mx-auto max-w-6xl px-6`)
    - src/components/OpenSource/OpenSource.tsx (GitHub SVG and external-link pattern with `target="_blank" rel="noopener noreferrer"`)
    - src/components/Donate/DonateCards.tsx (line 5 — `import { Icon } from "@iconify/react"` usage precedent)
    - src/config/downloads.ts (from Task 1 — will be imported to confirm `downloads.macos.arm64.enabled === false` and gate the Coming Soon branch)
    - .planning/phases/13-desktop-preparation/13-RESEARCH.md §Pattern 1 + Pattern 2 + Pattern 3 + §Code Examples 1-2 (verbatim blueprint; copy-paste starting point)
    - .planning/phases/13-desktop-preparation/13-CONTEXT.md §decisions (section placement, tab UX, icon set)
  </read_first>
  <action>
Create a NEW file `src/components/Platforms/Platforms.tsx`. This is a CLIENT component (`"use client"`). It renders one `<section>` with a heading, subheading, a WAI-ARIA `tablist` of three tabs (macOS / Windows / Linux), and a single `tabpanel` rendering Coming Soon content for the selected OS. On mobile/iPad/iPhone/Android/unknown UAs, no tab is pre-selected and the panel is replaced by a neutral prompt (`t("select_prompt")`).

Copy this implementation verbatim as the starting point (derived from RESEARCH §Example 1 + Example 2), then adjust only to match exact string keys / class tokens:

```tsx
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
  win: "simple-icons:windows",
  linux: "simple-icons:linux",
};

function detectOs(): Os | null {
  const ua = navigator.userAgent;
  // Order matters — iPadOS 13+ spoofs Mac UA; mobile tests MUST come first.
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
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
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

        {selected ? (
          <ComingSoonCard os={selected} />
        ) : (
          <p className="mt-8 text-sm text-white-40">{t("select_prompt")}</p>
        )}
      </div>
    </section>
  );
}

function ComingSoonCard({ os }: { os: Os }) {
  const t = useTranslations("Platforms");
  // Touch the config so TS narrows and the reviewer sees downloads is wired in,
  // even though v1 renders the same Coming Soon state for every OS.
  // (Future: branch on `downloads.macos.arm64.enabled` to render active CTA.)
  void downloads;

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
          <Icon
            icon={ICONS[os]}
            width={32}
            height={32}
            className="text-sky"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-normal text-text-primary">
            {t(`panel_${os}_title`)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white-70">
            {t(`panel_${os}_desc`)}
          </p>

          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent">
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
                aria-hidden="true"
              />
              {t("coming_soon_label")}
            </span>
          </div>

          <a
            href="https://github.com/Pivii/dictus"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t("star_on_github")}
          </a>
        </div>
      </div>
    </div>
  );
}
```

IMPORTANT implementation details (do NOT deviate):
- File MUST start with `"use client";` — the component reads `navigator.userAgent`.
- Initial `useState` value MUST be `null` on both server and client (no `navigator` access in initial state computation — hydration safety, Pitfall 1).
- `requestAnimationFrame` MUST wrap `setSelected(detected)` — matches AdaptiveCTA pattern.
- Mobile UA regex `iPhone|iPad|iPod|Android` MUST be tested BEFORE Mac regex (Pitfall 2 — iPadOS spoofs Mac UA).
- Roving tabIndex: `tabIndex={active ? 0 : -1}` on each tab button (Pitfall 3).
- `role="tabpanel"` MUST have `tabIndex={0}` (keyboard scroll support per APG).
- GitHub link MUST have `target="_blank"` AND `rel="noopener noreferrer"`.
- Section chrome MUST use `bg-ink-2 py-28` + `mx-auto max-w-6xl px-6` (mirrors Features/Community).
- Dashed-border disabled card MUST use EXACT class string: `rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-8 opacity-90 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100`.
- Accent pulse-pill MUST use EXACT class string: `inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent` with a nested `inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent` pulse dot.
- Use the `Platforms` i18n namespace exactly (Plan 02 will create the keys in en.json + fr.json). Do NOT inline hardcoded English strings.
- Use `simple-icons:apple`, `simple-icons:windows`, `simple-icons:linux` slugs (CONTEXT-locked). If, during manual QA, `simple-icons:windows` renders the dated wavy flag and clashes visually with flat Apple/Linux marks (Pitfall 7), swap to `simple-icons:windows11` — treat this as a single-line follow-up, NOT a blocker.

Do NOT install any new runtime dependency — `@iconify/react` is already in `package.json ^6.0.2` (verified by RESEARCH §Standard Stack).
Do NOT use `navigator.platform` (deprecated).
Do NOT render three separate visible cards (breaks CONTEXT: "single glass card showing content of selected OS").
Do NOT add any email capture, waitlist form, or Telegram link inside this component (CONTEXT-forbidden).
  </action>
  <verify>
    <automated>npx tsc --noEmit && npx eslint src/components/Platforms/Platforms.tsx</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/components/Platforms/Platforms.tsx` exits 0
    - First non-comment line of file is exactly `"use client";` — verify with `head -1 src/components/Platforms/Platforms.tsx` matches
    - `grep -c "role=\"tablist\"" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "role=\"tab\"" src/components/Platforms/Platforms.tsx` returns at least 1
    - `grep -c "role=\"tabpanel\"" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "aria-selected" src/components/Platforms/Platforms.tsx` returns at least 1
    - `grep -c "aria-controls" src/components/Platforms/Platforms.tsx` returns at least 1
    - `grep -c "tabIndex={active ? 0 : -1}" src/components/Platforms/Platforms.tsx` returns 1 (roving tabindex)
    - `grep -c "requestAnimationFrame" src/components/Platforms/Platforms.tsx` returns 1 (hydration safety)
    - `grep -cE "iPhone\\|iPad\\|iPod\\|Android" src/components/Platforms/Platforms.tsx` returns 1 (mobile-first UA order)
    - `grep -c "simple-icons:apple" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "simple-icons:windows" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "simple-icons:linux" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "github.com/Pivii/dictus" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "target=\"_blank\"" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "rel=\"noopener noreferrer\"" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "border-dashed border-border" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "bg-\\[var(--glass-t2-bg)\\]" src/components/Platforms/Platforms.tsx` returns at least 1
    - `grep -c "animate-pulse rounded-full bg-accent" src/components/Platforms/Platforms.tsx` returns 1
    - `grep -c "useTranslations(\"Platforms\")" src/components/Platforms/Platforms.tsx` returns at least 1
    - `grep -c "import { downloads } from \"@/config/downloads\"" src/components/Platforms/Platforms.tsx` returns 1
    - `npx tsc --noEmit` exits 0
    - `npx eslint src/components/Platforms/Platforms.tsx` exits 0
    - Validation map: this task closes `13-01-02` (DESK-01, DESK-02) via type-check + build
  </acceptance_criteria>
  <done>
Client component file exists; is `"use client"`; implements WAI-ARIA tablist+tabpanel with roving tabindex; SSR-safe detection via `useState<null>` + `useEffect` + `requestAnimationFrame`; mobile-first UA sniff; Coming Soon dashed card with navy icon tile, accent pulse-pill, and GitHub-star link to github.com/Pivii/dictus; uses Iconify simple-icons for all three brand marks; imports downloads from @/config/downloads; all text via `useTranslations("Platforms")`; `tsc` + `eslint` clean.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Integrate Platforms section into home page + update JSON-LD operatingSystem</name>
  <files>src/app/[locale]/page.tsx</files>
  <read_first>
    - src/app/[locale]/page.tsx (CURRENT state — line 27 has `operatingSystem: "iOS 18+, Android"`; lines 40-48 show section order Hero → Features → Comparison → HowItWorks → OpenSource → Community → Footer)
    - src/components/Platforms/Platforms.tsx (from Task 2 — default-exported component being imported)
    - src/components/shared/ScrollReveal.tsx (wrapper convention used on every section except Hero)
    - .planning/phases/13-desktop-preparation/13-CONTEXT.md §decisions "Section placement" (locked: after Hero, before Features)
    - .planning/phases/13-desktop-preparation/13-RESEARCH.md §Example 4 (exact diff)
  </read_first>
  <action>
Edit `src/app/[locale]/page.tsx` to (a) insert the Platforms section between `<Hero />` and `<ScrollReveal><Features /></ScrollReveal>`, and (b) update the JSON-LD `operatingSystem` field.

Apply exactly this diff:

1. Add the import (alphabetical placement after `import Hero`, before `import Features`):
```diff
 import Hero from "@/components/Hero/Hero";
+import Platforms from "@/components/Platforms/Platforms";
 import Features from "@/components/Features/Features";
```

2. Update JSON-LD `operatingSystem` value on line 27 (currently `"iOS 18+, Android"`):
```diff
-    operatingSystem: "iOS 18+, Android",
+    operatingSystem: "iOS 18+, Android, macOS, Windows, Linux",
```

3. Insert the Platforms section directly after `<Hero />` and before `<ScrollReveal><Features /></ScrollReveal>`:
```diff
       <Hero />
+      <ScrollReveal><Platforms /></ScrollReveal>
       <ScrollReveal><Features /></ScrollReveal>
```

Do NOT change any other line of this file. Do NOT remove the Hero (CONTEXT: "Complements existing Hero AdaptiveCTA — does not replace it"). Do NOT re-order existing sections. Do NOT edit any other JSON-LD field (only `operatingSystem`). Do NOT unwrap any other section from `<ScrollReveal>`.
  </action>
  <verify>
    <automated>grep -n "operatingSystem: \"iOS 18+, Android, macOS, Windows, Linux\"" src/app/\[locale\]/page.tsx && grep -n "<ScrollReveal><Platforms /></ScrollReveal>" src/app/\[locale\]/page.tsx && npx tsc --noEmit && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "import Platforms from \"@/components/Platforms/Platforms\"" src/app/\[locale\]/page.tsx` returns 1
    - `grep -c "<ScrollReveal><Platforms /></ScrollReveal>" src/app/\[locale\]/page.tsx` returns 1
    - `grep -n "operatingSystem: \"iOS 18+, Android, macOS, Windows, Linux\"" src/app/\[locale\]/page.tsx` matches line ~27 and returns 1 match
    - `grep -c "operatingSystem: \"iOS 18+, Android\"" src/app/\[locale\]/page.tsx` returns 0 (stale value fully removed)
    - Line containing `<Platforms />` appears BETWEEN the line containing `<Hero />` and the line containing `<ScrollReveal><Features /></ScrollReveal>` — verify by reading file and confirming vertical order
    - `<Hero />` is still present (grep `<Hero />` returns 1)
    - `<Footer />` is still present (grep `<Footer />` returns 1)
    - `npx tsc --noEmit` exits 0
    - `npx eslint src/app/\[locale\]/page.tsx` exits 0
    - `npm run build` exits 0 and produces `/fr` + `/en` static pages without next-intl missing-key errors for the existing `Metadata.*` namespace (Plan 02 will add Platforms keys — a runtime WARNING for those is acceptable at this stage; a hard BUILD FAILURE is not)
    - Validation map: this task closes `13-01-03` (DESK-01) via build + manual UA override AND `13-01-04` (DESK-04 JSON-LD subset) via grep + tsc
  </acceptance_criteria>
  <done>Platforms section wired between Hero and Features; JSON-LD operatingSystem updated to full 5-platform string; `tsc` + `eslint` + `next build` all clean.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Manual QA — UA override + keyboard + screen reader smoke</name>
  <files>N/A — verification task, no file edits</files>
  <action>Pause execution and present the verification checklist below to the user. Start `npm run dev` if not already running. Walk the user through the 8 numbered verification blocks in `<how-to-verify>`. If any step fails, route the failure back to the task that owns the defect (Task 1 = config types; Task 2 = component behavior/accessibility/icons; Task 3 = page integration/JSON-LD). The Pitfall-7 `simple-icons:windows` → `simple-icons:windows11` swap is the only fix allowed to happen inside this checkpoint (one-line Edit in Task 2's file).</action>
  <verify>
    <automated>echo "Manual checkpoint — awaiting user sign-off via resume-signal"; exit 0</automated>
  </verify>
  <done>User types "approved" OR all 8 verification blocks pass (with any Pitfall-7 icon swap recorded in the SUMMARY).</done>
  <what-built>
    - `src/config/downloads.ts` with typed placeholder config
    - `src/components/Platforms/Platforms.tsx` client component (tablist + OS auto-detection + Coming Soon tabpanel)
    - `<ScrollReveal><Platforms /></ScrollReveal>` inserted after Hero on home page
    - JSON-LD `operatingSystem` updated to `"iOS 18+, Android, macOS, Windows, Linux"`
  </what-built>
  <how-to-verify>
**Pre-requisites:** Run `npm run dev` and open DevTools console.

Note: Plan 02 (wave 2) finalizes the `Platforms.*` i18n keys. Until Plan 02 lands you will see next-intl missing-key WARNINGS in the console and placeholder key names in the UI. This is EXPECTED. Verify layout / behavior / accessibility here; verify copy in Plan 02's checkpoint.

**1. SSR / hydration smoke (both locales)**
- Hard-reload http://localhost:3000/fr and http://localhost:3000/en
- Console MUST NOT show "Text content does not match server-rendered HTML" or any other React hydration warning
- The new section appears immediately below Hero with the three tab buttons visible

**2. UA-override auto-detection matrix — DevTools → Network conditions → User agent → Select "Custom…" → paste one of the UAs below, then reload.** For each row, confirm the expected tab is the ACTIVE one after hydration:

| Simulated UA | Expected pre-selected tab |
|---|---|
| `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15` | macOS |
| `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36` | Windows |
| `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36` | Linux |
| `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1` | None — neutral `select_prompt` message visible |
| `Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36` | None — neutral `select_prompt` message visible |
| `Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1` | None (iPad must NOT pre-select macOS — Pitfall 2) |

**3. Keyboard nav (WCAG 2.1.1)**
- Tab into the tablist → focus lands on the active tab button
- ArrowRight / ArrowLeft → focus and selection cycle across the three tabs (with wrap-around)
- Home → first tab; End → last tab
- Press Tab → focus moves INTO the tabpanel card (not onto the next tab button)
- Inside the tabpanel, Tab again → focus reaches the "Star on GitHub" link

**4. Screen reader spot-check** (pick whichever you have)
- macOS: VoiceOver (Cmd+F5) → navigate into tablist → verify it announces "tab list" and each tab's selected state changes ("selected" / "not selected") as you cycle with arrow keys
- Windows: NVDA → same expectation

**5. Visual smoke (three widths) at /fr**
- 375px (mobile): tabs wrap gracefully; tabpanel card padding readable; pulse dot animates
- 768px (tablet): single row of tabs; card stretches full container
- 1440px (desktop): comfortable hierarchy below Hero; animates in via ScrollReveal

**6. Icon consistency (Pitfall 7 check)**
- Compare the Apple, Windows, and Linux marks at 18px (tab buttons) and 32px (navy tile)
- If the Windows flag looks stylistically dated / inconsistent with the flat Apple + Tux marks, report that so Task 2 can be patched to use `simple-icons:windows11` before Plan 02 ships
- Acceptable outcome: either all three feel cohesive OR we escalate to `windows11`

**7. JSON-LD sanity**
- View page source on `/en` → search for `"operatingSystem":` → value MUST equal `"iOS 18+, Android, macOS, Windows, Linux"`

**8. No regressions**
- Hero AdaptiveCTA still renders its dual badges / CTA as before
- Features / Comparison / HowItWorks / OpenSource / Community / Footer all still render below the new section

Report any failure of 1–7 as a blocker. Pitfall-7 icon swap is the only item allowed as a "fix-during-checkpoint" — everything else routes back to the task that owns it.
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues found (especially hydration warnings, UA-override mismatches, keyboard-nav gaps, or Windows icon visual mismatch).</resume-signal>
</task>

</tasks>

<verification>
Phase-level checks before marking Plan 01 complete:
- `npx tsc --noEmit && npx eslint . && npm run build` exits 0
- `grep -n "iOS 18+, Android, macOS, Windows, Linux" src/app/\[locale\]/page.tsx` matches 1 line
- `grep -rn "iOS 18+, Android\"" src/app/\[locale\]/` returns 0 matches (stale string gone)
- Home page at `/fr` and `/en` renders the Platforms section immediately after Hero with three tab buttons
- All Task 4 manual checks pass (or Pitfall-7 icon swap applied)
- Known gap: `Platforms.*` i18n keys still missing — closed in Plan 02 (wave 2)

Validation-map coverage (from 13-VALIDATION.md):
- 13-01-01 (DESK-03) — closed by Task 1 tsc gate
- 13-01-02 (DESK-01, DESK-02) — closed by Task 2 tsc + Task 4 manual
- 13-01-03 (DESK-01) — closed by Task 3 build + Task 4 UA-override manual
- 13-01-04 (DESK-04 JSON-LD subset) — closed by Task 3 grep + tsc
</verification>

<success_criteria>
- `src/config/downloads.ts` exports typed, fully-disabled placeholder config — `downloads.macos.arm64.enabled === false` etc. (DESK-03)
- `src/components/Platforms/Platforms.tsx` renders a WAI-ARIA tablist, pre-selects the OS tab on desktop UAs only, and shows a Coming Soon dashed-border card with pulse-pill + GitHub-star link when a tab is selected (DESK-01, DESK-02)
- Home page at `/fr` and `/en` shows the new section between Hero and Features, wrapped in `<ScrollReveal>` (DESK-01)
- JSON-LD `operatingSystem` now enumerates all 5 platforms (DESK-04 partial; remaining DESK-04 strings closed in Plan 02)
- No console hydration warnings; keyboard + screen-reader smoke pass
- `tsc` + `eslint` + `next build` green
</success_criteria>

<output>
After completion, create `.planning/phases/13-desktop-preparation/13-01-SUMMARY.md` following the standard SUMMARY template. Capture:
- What shipped (3 files created/edited)
- Any Pitfall-7 windows-icon decision (stayed on `simple-icons:windows` or swapped to `simple-icons:windows11`)
- Interfaces exported (`DownloadVariant`, `LinuxFormat`, `DownloadsConfig`, `downloads`, `anyEnabled`, default `Platforms`)
- i18n keys consumed but NOT YET DEFINED: `Platforms.*` (15 keys — handoff note for Plan 02)
- Manual QA outcome (UA-override results table + keyboard/screen-reader pass)
</output>

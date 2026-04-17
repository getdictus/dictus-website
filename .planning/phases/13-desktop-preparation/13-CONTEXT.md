# Phase 13: Desktop Preparation - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Communicate that Dictus is available on Desktop (Mac, Windows, Linux) with Coming Soon badges. Adds a new "Available on" section after Hero with horizontal OS tabs (macOS/Windows/Linux) + auto-detection on desktop, a centralized `src/config/downloads.ts` config, and copy updates in Metadata, JSON-LD, Comparison table, and Support page so the site no longer reads mobile-only. Active download links stay disabled until Desktop builds ship — this phase is preparation only.

</domain>

<decisions>
## Implementation Decisions

### Section placement
- New dedicated section "Available on" inserted after Hero, before Features
- Complements existing Hero `AdaptiveCTA` — does not replace it (AdaptiveCTA keeps handling iOS TestFlight + Android beta CTAs based on device detection)
- Mobile primary / Desktop "Also coming" hierarchy: iOS + Android shown as current (beta), Desktop (Mac/Win/Linux) grouped under "Also coming to Desktop" — reflects current reality
- Scope limited to home page + root metadata + support page. `/donate` and `/privacy` untouched

### Tab UX
- Horizontal tabs row (macOS | Windows | Linux) above a single glass card showing content of selected OS (Handy.computer pattern)
- Auto-detection via `navigator.userAgent`: on desktop, pre-select the matching tab; on mobile/unknown, show tabs with no selection until tap (SSR-safe, no hydration mismatch)
- Each tab card shows: disabled "Coming Soon" badge with platform icon + secondary "Star on GitHub to follow" link → github.com/Pivii/dictus
- No email capture, no waitlist form (privacy-first stance)
- No Telegram link in this card (Community section already covers that channel)

### Platform icons
- Iconify `simple-icons` family via `@iconify/react`: `simple-icons:apple`, `simple-icons:windows`, `simple-icons:linux` (Tux)
- Consistent with existing Iconify usage (solar:arrow-left-linear on /donate)

### downloads.ts config shape
- Location: `src/config/downloads.ts` (mirrors `src/config/donate.ts` pattern)
- Minimal fields per variant: `{ enabled: false, url: '', label: 'Coming Soon' }`
- Arch-aware for Mac + Windows (typed from the start, fewer refactors when binaries ship):
  - `macos: { arm64: {...}, x64: {...} }`
  - `windows: { x64: {...}, arm64: {...} }`
- Linux: multi-format array `linux: { formats: [{ type, enabled, url, label }, ...] }` — format list TBD but structure prepares UI for format picker
- No version/releaseDate/checksum/size fields in v1 — add when builds exist

### Copy updates
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system
- `CLAUDE.md` — Brand kit colors, typography, glassmorphism specs (Tier 2 card), accent blue, Iconify conventions
- `dictus-brand-kit.html` — Visual reference for tokens (if ambiguity arises)

### Requirements
- `.planning/REQUIREMENTS.md` — DESK-01 (OS tabs + auto-detect), DESK-02 (Coming Soon badges + icons), DESK-03 (`downloads.ts` config), DESK-04 (copy update multi-platform)

### Roadmap
- `.planning/ROADMAP.md` §Phase 13 — success criteria
- `.planning/milestones/v1.3-ROADMAP.md` §Phase 13 — research findings (Handy.computer pattern)

### Existing patterns to mirror
- `src/config/donate.ts` — config file pattern (export const, `as const`, placeholders)
- `src/components/Hero/AdaptiveCTA.tsx` — device detection via `navigator.userAgent`, SSR-safe pre-hydration fallback, inline SVG / icon usage
- `src/components/Features/Features.tsx` — Tier 2 glass card class string, icon-in-navy-tile pattern, coming-soon dashed-border variant
- `src/components/Community/Community.tsx` — glassmorphism Tier 2 card
- `src/components/Comparison/Comparison.tsx` + `ComparisonTable.tsx` + `ComparisonCards.tsx` — where `dictus_platforms` i18n key is consumed
- `src/components/OpenSource/OpenSource.tsx` — GitHub link pattern (github.com/Pivii/dictus)
- `src/app/[locale]/layout.tsx` — root metadata
- `src/app/[locale]/page.tsx` — JSON-LD `operatingSystem` + section ordering (Hero → Features → ...)
- `src/app/[locale]/support/page.tsx` — Support compatibility copy
- `src/messages/en.json` + `src/messages/fr.json` — i18n namespaces (`Hero`, `Features`, `Comparison`, `Support`, `Metadata`)
- `src/i18n/routing.ts` — locales config

### External reference
- handy.computer — tabbed OS selector + auto-detection UX pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Tier 2 glass card class: `rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-colors hover:border-border-hi` (from Features + Community)
- Navy icon tile: `flex h-12 w-12 items-center justify-center rounded-xl bg-navy` (from Features)
- Accent pill badge: `inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent` with animated pulse dot (from Features coming-soon-label)
- Dashed-border disabled card: `border-dashed border-border ... opacity-75` (from Features coming-soon grid)
- ScrollReveal wrapper: entrance animations — wrap new section in `<ScrollReveal>` in `page.tsx`
- Device detection pattern: `detectDevice()` + `useEffect` + `requestAnimationFrame` from AdaptiveCTA (extend / extract for Mac/Win/Linux)
- Iconify: `@iconify/react` already in deps (verify) — use `simple-icons:*` for platform logos

### Established Patterns
- Server component pages with `setRequestLocale` + `getTranslations` + static `generateStaticParams` + OG metadata
- i18n via next-intl v4 namespaces; FR + EN parity required in `src/messages/{fr,en}.json`
- Client components (`"use client"`) for anything touching `navigator.userAgent` — pre-hydration fallback mandatory (prevents hydration mismatch)
- Config placeholders typed `as const` (see `donate.ts`)
- Section components under `src/components/{SectionName}/{SectionName}.tsx`, imported into `page.tsx` wrapped in `<ScrollReveal>`

### Integration Points
- New component: `src/components/Platforms/Platforms.tsx` (naming TBD by planner — could also be `Downloads` or `Available`)
- New config: `src/config/downloads.ts`
- Home page: insert `<ScrollReveal><Platforms /></ScrollReveal>` between `<Hero />` and `<Features />` in `src/app/[locale]/page.tsx`
- `src/app/[locale]/page.tsx` JSON-LD `operatingSystem` field update
- Root metadata (`src/app/[locale]/layout.tsx` or equivalent) — title + description
- `src/messages/{fr,en}.json` — new `Platforms` namespace + edits to `Comparison.dictus_platforms`, `Support.compatibility_text`, `Metadata.title`, `Metadata.description`
- `src/app/[locale]/support/page.tsx` — compatibility section rewrite

</code_context>

<specifics>
## Specific Ideas

- Handy.computer (https://handy.computer) as the core UX reference — horizontal OS tabs, auto-detection, config-driven links
- Mobile primary / Desktop secondary framing is intentional: iOS + Android are the current reality (beta), Desktop is a teaser for the fork-of-Handy effort
- "Star on GitHub" as the only follow-up action inside the Coming Soon card — aligns with privacy-first (no email, no form) and funnels interest into the existing OSS repo
- Linux gets multi-format structure from day one so the UI doesn't need a rewrite when AppImage + deb ship
- Metadata title honesty: search engines should know Desktop is coming rather than only indexing iOS & Android

</specifics>

<deferred>
## Deferred Ideas

- Activate download links to GitHub Releases when Desktop builds exist — DESK-F01 (future requirement)
- Dedicated `/download` page with per-OS install instructions — DESK-F02 (future requirement)
- CDN for ML models at blob.getdictus.com — CDN-01/02/03 (future requirement, issue #2)
- Email / waitlist signup for "notify me when desktop ships" — contradicts privacy-first stance, stays out
- Version / arch / checksum / release-notes fields in `downloads.ts` — add when binaries ship
- AdaptiveCTA desktop branch (render a "Coming to Desktop" variant on desktop visitors) — can revisit once Desktop is public

</deferred>

---

*Phase: 13-desktop-preparation*
*Context gathered: 2026-04-16*

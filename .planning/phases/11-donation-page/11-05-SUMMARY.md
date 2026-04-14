---
phase: 11-donation-page
plan: 05
subsystem: ui
tags: [donate, iconify, i18n, next-intl, tailwind, ux]

requires:
  - phase: 11-donation-page
    provides: "@iconify/react installed (11-04), Soutenir/Support terminology aligned across i18n + call sites (11-04), existing DonateCards redirect logic (11-01)"
provides:
  - "Reworked DonateCards.tsx with Iconify icons (solar:card-bold-duotone for Fiat, bitcoin-icons:bitcoin-circle-filled for Bitcoin) inside the navy squircle tile"
  - "Option A1 stacked card hierarchy: header (tile+title+subtitle) -> divider -> 4-col chip grid + custom stepper -> divider -> full-width gradient CTA"
  - "Fixed 4-column chip grid at sm+ (2x2 at xs) replacing the wrap-flex layout that orphaned 50 EUR on its own row"
  - "Custom amount control with no native browser spinner: digits-only text input + right-edge full-height stepper (stacked chevrons, +/-1 EUR bounded by MIN/MAX)"
  - "Full-width CTA button at each card's bottom using the brand Button gradient (linear-gradient(135deg, #1A4E8A, #0F3460))"
  - "New 'Pourquoi soutenir ? / Why support?' inline-bullets section between cards and thank-you (3 items: offline, open source, independent) with dot separators, stacked xs / inline sm+"
  - "Thank-you paragraph promoted from text-white-40 to text-mist per Design Decisions"
  - "Four new FR+EN i18n keys under Donate: why_support_title, why_support_offline, why_support_opensource, why_support_independent"
affects: [12-webhook-notifications]

tech-stack:
  added: []
  patterns:
    - "Iconify usage pattern: on-demand SVG loading via <Icon icon='pack:name-variant' width={n} height={n} className='text-*' aria-hidden />"
    - "Digits-only numeric input pattern: type=text + inputMode=numeric + pattern=[0-9]* + sanitize(replace /[^0-9]/g).slice(0, N) to avoid native browser number spinner"
    - "Full-height side stepper pattern: flex flex-col border-l with two 50% buttons separated by a thin inner divider for +/- increments"

key-files:
  created: []
  modified:
    - src/components/Donate/DonateCards.tsx
    - src/app/[locale]/donate/page.tsx
    - src/messages/fr.json
    - src/messages/en.json

key-decisions:
  - "Kept the navy squircle tile around the Iconify icons (brand consistency) rather than removing the tile — icon rendered white inside"
  - "Rendered Bitcoin icon in white inside the navy tile (per Design Decisions 'icon rendered white/accent inside the tile') instead of Bitcoin-orange, trading brand recognizability for layout consistency with the Fiat card"
  - "Kept Stripe preset-chip <a href=stripeLinks[amount]> and BTCPay <button onClick={handleBtcPayClick}> direct-redirect flow unchanged — 'selected' chip style is defined in className but not applied, ready for a future staged (pick-then-confirm) flow without refactoring"
  - "Digits-only text input (type=text + inputMode=numeric) chosen over controlled number input to eliminate the native browser spinner across all browsers without relying on browser-specific CSS (appearance:none) which is inconsistent on Firefox/Safari"
  - "Stepper increments fixed at +/-1 EUR (not chip-value-based) per Design Decisions — standard numeric stepper UX"
  - "Lightning mention moved from a standalone line above chips into the Bitcoin card header stack (as a third small caption under subtitle) to keep the post-divider amounts block visually symmetric with the Fiat card"

patterns-established:
  - "Iconify integration: import { Icon } from '@iconify/react'; use pack-qualified icon names (solar:*, bitcoin-icons:*); no per-icon dependencies"
  - "Donate card hierarchy (A1): header row (tile+icon + title/subtitle stack) -> divider -> content block -> divider -> full-width CTA using mt-auto to pin CTA to card bottom even when content heights differ"
  - "Values-reinforcement section pattern: small muted h2 + inline dot-separated ul with 3 bullets, sober text-mist, responsive flex-col <-> flex-row"

requirements-completed: [DON-01, DON-02, DON-03, DON-04]

duration: ~8 min
completed: 2026-04-14
---

# Phase 11 Plan 05: Donate Card Visual Rework (Option A1) Summary

**Donate cards reworked to Option A1 stacked hierarchy with Iconify icons, 4-column chip grid, custom digit-only stepper (no native spinner), full-width gradient CTA, plus a new "Why support?" inline-bullets section — closing UAT Test 1 and Test 3 gaps.**

## Performance

- **Duration:** ~8 min wall clock
- **Started:** 2026-04-14T21:48:05Z
- **Completed:** 2026-04-14T21:50:19Z
- **Tasks:** 3
- **Files modified:** 4 (src/components/Donate/DonateCards.tsx, src/app/[locale]/donate/page.tsx, src/messages/fr.json, src/messages/en.json)

## Accomplishments

- Replaced inline SVG icons with @iconify/react `solar:card-bold-duotone` (Fiat) and `bitcoin-icons:bitcoin-circle-filled` (Bitcoin), kept inside the existing navy squircle tile for brand consistency
- Rebuilt card layout to Option A1 stacked hierarchy (header -> divider -> amounts+custom -> divider -> full-width CTA) with `mt-auto` on the CTA so both cards end at the same visual line regardless of content height
- Switched preset-chip layout from `flex flex-wrap gap-4` to `grid grid-cols-2 sm:grid-cols-4 gap-3`, fixing the Test 1 gap where 50 EUR orphaned onto a second row at desktop width
- Eliminated the native browser number spinner by swapping `<input type="number">` for `<input type="text" inputMode="numeric" pattern="[0-9]*">` with a `sanitizeDigits` handler, paired with a custom right-edge stepper block (stacked up/down chevrons using `solar:alt-arrow-up-linear` / `solar:alt-arrow-down-linear`, +/-1 EUR bounded by `MIN_AMOUNT` / `MAX_AMOUNT`)
- Added chip state classes per spec (default: `border-border-hi` + `text-mist`; hover: `hover:scale-[1.02] + hover:shadow-[0_0_12px_var(--color-glow-soft)]`; selected variant declared in `_chipSelectedModifier` but not applied to current redirect-on-click chips, reserved for future staged flow)
- Promoted CTA buttons to full-width gradient (`linear-gradient(135deg, #1A4E8A, #0F3460)`) at the bottom of each card with `hover:brightness-110` — same `handleStripeCustom` / `handleBtcCustom` validation + redirect logic preserved
- Added 4 new Donate.* i18n keys (FR + EN) for the "Pourquoi soutenir ? / Why support?" section
- Inserted the new inline-bullets section between `<DonateCards />` and the thank-you paragraph on `/fr/donate` and `/en/donate`; heading is semantic (`<h2>`) but visually small/muted so it doesn't compete with the cards
- Promoted the thank-you paragraph from `text-white-40` to `text-mist` and tightened its top margin from `mt-8` to `mt-10`
- `npm run build` exits 0; `/fr/donate` and `/en/donate` both SSG-render on the reworked layout; all preset-chip redirect logic (Stripe Payment Links, BTCPay form POST in new tab) preserved verbatim — no regression on UAT-passing Tests 4 & 5

## Task Commits

Each task was committed atomically:

1. **Task 1: Add "Why support?" i18n keys to fr.json and en.json** - `6421a17` (feat)
2. **Task 2: Rework DonateCards.tsx — Iconify icons, Option A1 layout, 4-col chip grid, custom stepper, full-width gradient CTA** - `39b0b82` (feat)
3. **Task 3: Add "Why support?" inline-bullets section to the donate page** - `e1cea04` (feat)

**Plan metadata:** (pending final commit with SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md)

## Files Created/Modified

- `src/components/Donate/DonateCards.tsx` — Full rewrite: Iconify imports, `sanitizeDigits` + `clampStep` helpers hoisted above component, new style constants (`cardClass`, `chipBase`, `dividerClass`, `tileClass`, `ctaClass`, `ctaStyle`), A1 stacked JSX with flush right-edge stepper, full-width gradient CTAs. Payment handlers (`handleStripeCustom`, `handleBtcPayClick`, `handleBtcCustom`) copied verbatim.
- `src/app/[locale]/donate/page.tsx` — Inserted new `<section aria-labelledby="why-support-title">` with 3-bullet `<ul>` between `<DonateCards />` and the thank-you `<p>`. Thank-you class updated (`text-white-40` -> `text-mist`, `mt-8` -> `mt-10`).
- `src/messages/fr.json` — Appended 4 new keys inside `Donate`: `why_support_title: "Pourquoi soutenir ?"`, `why_support_offline: "100% offline"`, `why_support_opensource: "Open source"`, `why_support_independent: "Indépendant"`.
- `src/messages/en.json` — Appended 4 new keys inside `Donate`: `why_support_title: "Why support?"`, `why_support_offline: "100% offline"`, `why_support_opensource: "Open source"`, `why_support_independent: "Independent"`.

## Decisions Made

- **White Bitcoin glyph in navy tile:** Design Decisions say "icon rendered white/accent inside the tile" for brand consistency. Chose `text-white` for both cards over the Bitcoin-orange (`#F7931A`) of the previous inline SVG to keep the two cards visually symmetric. If UAT feedback prefers orange, a single className flip restores it.
- **Lightning mention repositioned:** The previous layout had `⚡ Lightning supporté` as a standalone paragraph above the chips, breaking symmetry with the Fiat card. Moved it into the Bitcoin card header (as a third `<p className="text-xs">` under the subtitle) so the post-divider content block (chips + custom + CTA) mirrors the Fiat card structure exactly.
- **Selected chip class declared but unused:** Per the plan's `<selected_state_semantics>` block, the current direct-redirect UX never applies a persistent selected state. Declared `_chipSelectedModifier` (prefixed + `void` to silence the unused-variable lint without suppressing TS) so a future staged-flow rework can pick it up without reintroducing the style rules.
- **Digits-only text input over `<input type="number">`:** type=number's browser spinner is styled differently per browser and its `appearance: none` workaround is fragile on Firefox/Safari. Using `type=text + inputMode=numeric + pattern=[0-9]*` gives us the numeric keyboard on mobile, no native spinner anywhere, and a deterministic sanitize path.
- **Stepper at +/-1 EUR:** Matches Design Decisions. Not tied to chip values because the custom input is for non-preset amounts; users who want a preset click the chip.

## Deviations from Plan

None material. The plan executed exactly as written.

One minor lint-friendliness adjustment: the plan's `chipSelectedModifier` constant would trigger `@typescript-eslint/no-unused-vars` (it is declared but currently unused per the direct-redirect flow). Renamed it to `_chipSelectedModifier` and added a `void _chipSelectedModifier;` reference to keep the constant visible in the file (per plan intent: "Kept for future") without tripping the linter or causing a build failure. This preserves the plan's semantics — the modifier is still declared and reachable for a future staged-flow implementation.

**Total deviations:** 0 auto-fixes, 1 trivial lint-friendliness tweak (naming + `void` ref)
**Impact on plan:** None. Build green on first try after the rewrite.

## Issues Encountered

None. The build succeeded on first run after Task 2 and again after Task 3. No TypeScript errors, no unresolved Iconify imports (CDN-based), and both locales SSG-render on the new layout.

## User Setup Required

None - no external service configuration required. Iconify loads icons on demand from the public CDN; no API key, no env var. All four Iconify icon packs used (`solar:card-bold-duotone`, `solar:alt-arrow-up-linear`, `solar:alt-arrow-down-linear`, `bitcoin-icons:bitcoin-circle-filled`) are fetched lazily at runtime.

## Next Phase Readiness

- Donate page visual rework complete. UAT Test 1 (card visual hierarchy) and UAT Test 3 (custom amount UX) gap-closures shipped.
- Payment flow (Tests 4 & 5) behavior unchanged — Stripe Payment Link redirect and BTCPay form POST in new tab preserved verbatim.
- Selected-state className is pre-wired for a future "pick-then-confirm" interaction if UAT requests it, with no refactor needed.
- Phase 11 (Donation Page) is now fully gap-closed per the UAT Design Decisions; ready for milestone v1.3 to proceed to Phase 12 (Webhook Notifications) which depends on the Stripe/BTCPay flow this plan leaves untouched.

## Self-Check

- `src/messages/fr.json` Donate.why_support_title = "Pourquoi soutenir ?": FOUND
- `src/messages/en.json` Donate.why_support_title = "Why support?": FOUND
- `src/components/Donate/DonateCards.tsx` imports `{ Icon } from "@iconify/react"`: FOUND
- `solar:card-bold-duotone` present: FOUND
- `bitcoin-icons:bitcoin-circle-filled` present: FOUND
- No `type="number"` in DonateCards.tsx: PASS
- `inputMode="numeric"` present: FOUND
- `linear-gradient(135deg, #1A4E8A, #0F3460)` present: FOUND
- `sm:grid-cols-4` present (twice, one per card): FOUND
- `grid-cols-2` present (2x2 xs fallback): FOUND
- `hover:scale-[1.02]` present: FOUND
- `hover:shadow-[0_0_12px_var(--color-glow-soft)]` present: FOUND
- `bg-navy` (navy tile) present: FOUND
- `min-h-[44px]` (touch target) present: FOUND
- Old inline SVGs removed (`<rect x="1" y="4"`, `M15.9 10.1c.3-1.8`): PASS
- `src/app/[locale]/donate/page.tsx` uses all 4 why_support_* keys: FOUND
- `aria-labelledby="why-support-title"` present: FOUND
- `flex-col items-center` + `sm:flex-row` present: FOUND
- `<DonateCards />` + `<Footer />` + `generateStaticParams` + `generateMetadata` + `setRequestLocale` preserved: FOUND
- `npm run build` exits 0 with `/fr/donate` and `/en/donate` SSG-rendered: PASS
- Commit `6421a17` in history: FOUND
- Commit `39b0b82` in history: FOUND
- Commit `e1cea04` in history: FOUND

## Self-Check: PASSED

---
*Phase: 11-donation-page*
*Completed: 2026-04-14*

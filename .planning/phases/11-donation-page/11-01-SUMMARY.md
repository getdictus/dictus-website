---
phase: 11-donation-page
plan: 01
subsystem: payments
tags: [stripe, btcpay, bitcoin, lightning, glassmorphism, next-intl, i18n]

requires: []
provides:
  - "/[locale]/donate bilingual page with Fiat and Bitcoin contribution cards"
  - "src/config/donate.ts with Stripe Payment Link URLs and BTCPay config (placeholders)"
  - "DonateCards client component with glassmorphism Tier 2 styling"
affects: [12-webhook-notifications]

tech-stack:
  added: []
  patterns: [config-driven payment links, BTCPay form POST pattern, glassmorphism card with hover glow]

key-files:
  created:
    - src/config/donate.ts
    - src/app/[locale]/donate/page.tsx
    - src/components/Donate/DonateCards.tsx
  modified:
    - src/messages/fr.json
    - src/messages/en.json

key-decisions:
  - "Fiat chips use <a> tags with direct Stripe Payment Link href for simplicity"
  - "Bitcoin chips use <button> with BTCPay form POST to open invoice in new tab"
  - "Used HTML entity &#9889; for lightning emoji instead of Unicode to avoid encoding issues"

patterns-established:
  - "Config-driven payment: all payment URLs in src/config/donate.ts, easy to swap placeholders"
  - "Dual-card layout: grid-cols-1 md:grid-cols-2 for payment method cards"

requirements-completed: [DON-01, DON-02, DON-03, DON-04, DON-05]

duration: 3min
completed: 2026-04-09
---

# Phase 11 Plan 01: Donate Page Summary

**Bilingual /donate page with Stripe fiat and BTCPay Bitcoin contribution cards using glassmorphism Tier 2 design**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-09T21:16:35Z
- **Completed:** 2026-04-09T21:19:34Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created bilingual donate page at /fr/donate and /en/donate with full metadata and alternates
- Built two glassmorphism Tier 2 cards (Fiat + Bitcoin) with amount chips, custom input, validation
- Implemented Stripe redirect via Payment Links and BTCPay invoice via form POST
- All text uses "Contribution/Contribuer" terminology, never "Don/Donation" per DON-05

## Task Commits

Each task was committed atomically:

1. **Task 1: Create donate config, i18n translations, and page route** - `5ecddfc` (feat)
2. **Task 2: Create DonateCards client component** - `7a9238c` (feat)

## Files Created/Modified
- `src/config/donate.ts` - Payment configuration with Stripe links, BTCPay config, amount constants
- `src/app/[locale]/donate/page.tsx` - Server component page with metadata, heading, motivation, DonateCards, thank-you, Footer
- `src/components/Donate/DonateCards.tsx` - Client component with two glassmorphism cards, amount chips, custom input, payment redirect logic
- `src/messages/fr.json` - Added Donate namespace with all French translations
- `src/messages/en.json` - Added Donate namespace with all English translations

## Decisions Made
- Fiat amount chips use `<a>` tags with direct Stripe Payment Link href (no JS needed for preset amounts)
- Bitcoin chips use `<button>` elements with BTCPay form POST (requires dynamic form creation)
- Used HTML entity for lightning bolt icon instead of Unicode emoji for encoding safety

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Turbopack internal panic during `next build` (pre-existing Next.js 16.1.6 bug, not caused by changes). Verified with `tsc --noEmit` which passes cleanly, and confirmed the panic occurs on the codebase without any changes.

## User Setup Required

Payment services require manual configuration before the page is functional:
- Replace Stripe Payment Link placeholder URLs in `src/config/donate.ts` with real Stripe links (requires Stripe account with SIRET + IBAN)
- Replace BTCPay Server URL and Store ID placeholders in `src/config/donate.ts` (requires BTCPay deployment)

## Next Phase Readiness
- Donate page UI complete and ready for visual review
- Payment config placeholders ready to be swapped when Stripe and BTCPay are set up
- Phase 12 (webhook notifications) can proceed with BTCPay webhook integration

---
*Phase: 11-donation-page*
*Completed: 2026-04-09*

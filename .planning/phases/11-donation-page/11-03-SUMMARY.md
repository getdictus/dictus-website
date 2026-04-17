---
phase: 11-donation-page
plan: 03
subsystem: payments
tags: [stripe, btcpay, bitcoin, lightning, phoenixd, documentation]

requires:
  - phase: 11-donation-page
    provides: "Research and context for payment integration patterns"
provides:
  - "Stripe Payment Link setup guide for 4 fixed amounts + custom"
  - "BTCPay Server deployment guide with Umbrel and Hetzner options"
affects: [11-donation-page, 12-webhook-notifications]

tech-stack:
  added: []
  patterns: ["documentation-driven setup for external services"]

key-files:
  created:
    - docs/setup-stripe.md
    - docs/setup-btcpay.md
  modified: []

key-decisions:
  - "Guides written in French to match project language"
  - "Both guides reference src/config/donate.ts as the single config file to update"

patterns-established:
  - "Setup docs in docs/ directory for external service configuration"

requirements-completed: [PAY-01, PAY-02]

duration: 2min
completed: 2026-04-09
---

# Phase 11 Plan 03: Payment Setup Documentation Summary

**Stripe and BTCPay Server setup guides covering account creation, Payment Link configuration, and BTCPay deployment with Umbrel/Hetzner options**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T21:16:37Z
- **Completed:** 2026-04-09T21:17:05Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Stripe setup guide with step-by-step Payment Link creation for 5, 10, 25, 50 EUR + custom amount
- BTCPay Server guide with two deployment options: Umbrel + Cloudflare Tunnel (0 EUR/month) and Hetzner CAX11 (4 EUR/month)
- Both guides reference `src/config/donate.ts` as the single config file to update with real values

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Stripe setup guide (PAY-01)** - `f125b9e` (docs)
2. **Task 2: Create BTCPay Server setup guide (PAY-02)** - `93dd82c` (docs)

## Files Created/Modified
- `docs/setup-stripe.md` - Stripe account creation, Payment Link setup, config update instructions
- `docs/setup-btcpay.md` - BTCPay Server deployment (Umbrel/Hetzner), store config, phoenixd Lightning setup

## Decisions Made
- Guides written in French to match the project's primary language
- Used "Contribution Dictus" terminology consistently (not "Don")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
Both guides require manual execution by the developer:
- Stripe: account creation with SIRET/IBAN, Payment Link generation
- BTCPay: server deployment choice (Umbrel vs Hetzner), store configuration

## Next Phase Readiness
- Setup documentation ready for developer to follow
- Once Stripe and BTCPay are configured, `src/config/donate.ts` can be updated with real values
- Phase 12 (webhooks) will need `STRIPE_WEBHOOK_SECRET` and `BTCPAY_WEBHOOK_SECRET` env vars

---
*Phase: 11-donation-page*
*Completed: 2026-04-09*

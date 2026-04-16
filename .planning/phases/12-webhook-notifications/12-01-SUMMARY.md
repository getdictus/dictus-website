---
phase: 12-webhook-notifications
plan: 01
subsystem: infra
tags: [stripe, telegram, webhooks, dotenv, markdownv2, btcpay]

# Dependency graph
requires:
  - phase: 11-donation-page
    provides: Stripe Payment Link flow and BTCPay "Allow anyone to create invoice" setup that generate the events this phase will consume
provides:
  - stripe npm package installed as runtime dependency (v22.0.1)
  - src/lib/telegram.ts with escapeMarkdownV2 + sendTelegramMessage helpers
  - .env.example declarations for 5 server-only secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, STRIPE_WEBHOOK_SECRET, BTCPAY_WEBHOOK_SECRET, BTCPAY_API_KEY)
  - docs/setup-telegram.md covering BotFather bot creation and chat.id discovery
  - docs/setup-stripe.md section 9 covering webhook endpoint + stripe listen local testing
  - docs/setup-btcpay.md section 9 covering InvoiceSettled webhook + Greenfield API key + Send test webhook
affects: [12-02 (webhook routes Wave 2), 13-desktop-preparation]

# Tech tracking
tech-stack:
  added: [stripe@22.0.1]
  patterns:
    - "First src/lib/ module: named-exports-only transport helpers, no default export, env vars read at call time"
    - "Server-only env vars in .env.example live below the NEXT_PUBLIC_ block, under a Phase 12 banner comment"
    - "Setup docs in docs/ follow the same numbered French structure with a dedicated section 9 for webhook configuration"

key-files:
  created:
    - src/lib/telegram.ts
    - docs/setup-telegram.md
    - .planning/phases/12-webhook-notifications/12-01-SUMMARY.md
  modified:
    - package.json
    - package-lock.json
    - .env.example
    - docs/setup-stripe.md
    - docs/setup-btcpay.md

key-decisions:
  - "Installed stripe v22.0.1 (current on npm at install time, spec accepted v22.x or v23.x)"
  - "Added BTCPAY_API_KEY as a 5th env var beyond the 4 committed in HOOK-04 because the InvoiceSettled payload omits amount/currency — Greenfield invoice fetch is mandatory to satisfy HOOK-03"
  - "Telegram helper reads TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID inside sendTelegramMessage rather than at module top-level so future tests can mock env"
  - "escapeMarkdownV2 regex covers the 18 Telegram reserved characters plus backslash in a single character class; dynamic content must be pre-escaped by callers before concatenation into MarkdownV2 templates"
  - "Native fetch + node:crypto — no node-fetch, axios, got, telegraf, or node-telegram-bot-api dependency introduced"

patterns-established:
  - "Telegram MarkdownV2 escape + send transport: escape dynamic content, embed into *bold* / [text](url) template, POST to api.telegram.org with link previews disabled"
  - "Webhook setup docs: add a top-level section 9 'Webhook Configuration (Phase 12)' with sub-sections for production setup, local testing, and troubleshooting"

requirements-completed: [HOOK-04]

# Metrics
duration: 3min
completed: 2026-04-16
---

# Phase 12 Plan 01: Webhook Foundations Summary

**Runtime-dependency install (stripe@22.0.1), shared Telegram MarkdownV2 transport helper, and full operator documentation for the 5 server-only secrets Wave 2 will consume**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T10:08:52Z
- **Completed:** 2026-04-16T10:11:46Z
- **Tasks:** 3
- **Files modified:** 6 (2 created, 4 modified, plus package-lock.json)

## Accomplishments
- stripe v22.0.1 installed as runtime dependency; Wave 2 can now `import Stripe from "stripe"` for webhook signature verification
- src/lib/telegram.ts exports escapeMarkdownV2 + sendTelegramMessage — both routes will import from `@/lib/telegram`
- .env.example declares all 5 server-only secrets under a Phase 12 banner; no regressions on the existing NEXT_PUBLIC_ block
- docs/setup-telegram.md written end-to-end: BotFather flow, 3 scenarios for getUpdates (private, group, channel), rate limits, secret hygiene
- docs/setup-stripe.md section 9 covers production endpoint (filtered on checkout.session.completed), `stripe listen` local forwarding with ephemeral secret warning, `stripe trigger`, and troubleshooting
- docs/setup-btcpay.md section 9 covers InvoiceSettled webhook, Greenfield API key creation with canviewinvoices scope, Send test webhook, and troubleshooting
- `npx tsc --noEmit` green across the whole project after Task 1

## Task Commits

Each task was committed atomically:

1. **Task 1: Install stripe and scaffold src/lib/telegram.ts** — `97a9cb7` (feat)
2. **Task 2: Extend .env.example and author docs/setup-telegram.md** — `86e99fb` (feat)
3. **Task 3: Extend setup-stripe.md and setup-btcpay.md with webhook sections** — `e94de09` (docs)

_Plan metadata commit follows (docs: complete plan)._

## Files Created/Modified

- `package.json` — added `stripe` ^22.0.1 to dependencies (runtime, not devDependencies)
- `package-lock.json` — stripe + transitive deps locked
- `src/lib/telegram.ts` (new) — escapeMarkdownV2 + sendTelegramMessage; first file under src/lib/
- `.env.example` — appended Phase 12 banner with 5 server-only secrets and inline comments explaining each source
- `docs/setup-telegram.md` (new) — 85 lines of French operator docs for bot creation and chat.id discovery
- `docs/setup-stripe.md` — new section 9 (Webhook Configuration); removed Phase 12 placeholder bullet in section 8
- `docs/setup-btcpay.md` — new section 9 (Webhook Configuration); removed Phase 12 placeholder bullet in section 8

Exact `.env.example` Phase 12 block (appended below the existing NEXT_PUBLIC_ pair):

```
# --- Phase 12: Webhook Notifications (server-only secrets, DO NOT prefix NEXT_PUBLIC_) ---

# Telegram bot token — from @BotFather after /newbot (format: 123456789:ABC-...)
TELEGRAM_BOT_TOKEN=

# Telegram chat ID — from https://api.telegram.org/bot{TOKEN}/getUpdates (string, may be negative for groups, or start with -100 for channels)
TELEGRAM_CHAT_ID=

# Stripe webhook signing secret — from Dashboard > Developers > Webhooks (format: whsec_...)
# Local dev: stripe listen prints an ephemeral whsec_... that differs from production
STRIPE_WEBHOOK_SECRET=

# BTCPay webhook HMAC secret — from BTCPay Store > Webhooks > Secret (auto-generated)
BTCPAY_WEBHOOK_SECRET=

# BTCPay Greenfield API key (scope: btcpay.store.canviewinvoices)
# Needed because InvoiceSettled webhook payload does NOT include amount/currency —
# we fetch invoice details via GET /api/v1/stores/{storeId}/invoices/{invoiceId}
BTCPAY_API_KEY=
```

## Decisions Made
- **stripe version:** v22.0.1 was current on npm at install time; PLAN explicitly accepts v22.x or v23.x, so no pinning/override was necessary.
- **BTCPAY_API_KEY added as 5th secret:** HOOK-04 originally committed 4 secrets, but the InvoiceSettled payload does not carry amount/currency. Without a Greenfield read-only key the handler cannot satisfy HOOK-03 (amount + currency in Telegram message). Authorized under CONTEXT "Claude's Discretion: Env var naming details beyond the 4 already committed in HOOK-04".
- **Env read inside function, not at module top-level:** allows future tests to mock env without mutating module-level state; matches the plan's explicit guidance.
- **Single-class regex for MarkdownV2:** covers `_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`, plus backslash. Manually verified: `escapeMarkdownV2("25.00")` returns `25\.00`.

## Deviations from Plan

None — plan executed exactly as written. The only discretionary choice (stripe minor version) falls within the spec's accepted range.

## Issues Encountered

- Node engine warning from `eslint-visitor-keys@5.0.1` during `npm install stripe` (package requires Node ^20.19.0 || ^22.13.0 || >=24, current is v20.18.3). Pre-existing devDependency issue, unrelated to this plan's install. `npx tsc --noEmit` is green so this does not block execution. Out of scope (pre-existing), deferred — not logged to deferred-items.md because it does not affect correctness of this plan's deliverables.

## User Setup Required

Operator-facing setup needed before Wave 2 webhook routes can deliver notifications:

- **Telegram:** create bot via @BotFather, retrieve chat_id via getUpdates, fill `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Full walkthrough in `docs/setup-telegram.md`.
- **Stripe:** create webhook endpoint at `https://getdictus.com/api/webhooks/stripe` subscribed to `checkout.session.completed`, copy `STRIPE_WEBHOOK_SECRET`. Full walkthrough in `docs/setup-stripe.md` section 9.
- **BTCPay:** create webhook at `https://getdictus.com/api/webhooks/btcpay` subscribed to `InvoiceSettled`, copy `BTCPAY_WEBHOOK_SECRET`; generate Greenfield API key with `btcpay.store.canviewinvoices`, copy `BTCPAY_API_KEY`. Full walkthrough in `docs/setup-btcpay.md` section 9.

No USER-SETUP.md was generated — setup is already captured in the three `docs/setup-*.md` files this plan produced or extended.

## Next Phase Readiness

Wave 2 (plan 12-02) can now proceed without any of its own scaffolding work:
- `import Stripe from "stripe"` resolves (runtime dep installed).
- `import { sendTelegramMessage, escapeMarkdownV2 } from "@/lib/telegram"` resolves.
- All 5 secrets have comment-documented slots in `.env.example`; operator can populate `.env.local` at any time.

No blockers for Wave 2 code. External provisioning (Stripe account verification, BTCPay deployment, Telegram bot creation) remains a user-side prerequisite but was already flagged in the STATE.md blockers list before this plan started.

## Self-Check: PASSED

Verified artifacts on disk:

- FOUND: src/lib/telegram.ts
- FOUND: docs/setup-telegram.md
- FOUND: docs/setup-stripe.md section 9 (`grep -q "## 9. Webhook Configuration"` succeeds)
- FOUND: docs/setup-btcpay.md section 9 (`grep -q "## 9. Webhook Configuration"` succeeds)
- FOUND: all 5 env vars in .env.example (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, STRIPE_WEBHOOK_SECRET, BTCPAY_WEBHOOK_SECRET, BTCPAY_API_KEY)
- FOUND: stripe@22.0.1 in package-lock.json (`npm ls stripe` green)
- FOUND: commit 97a9cb7 (Task 1)
- FOUND: commit 86e99fb (Task 2)
- FOUND: commit e94de09 (Task 3)
- FOUND: `npx tsc --noEmit` exits 0

---
*Phase: 12-webhook-notifications*
*Completed: 2026-04-16*

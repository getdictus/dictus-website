---
phase: 12-webhook-notifications
plan: 02
subsystem: api
tags: [stripe, btcpay, webhooks, telegram, hmac, markdownv2, greenfield-api]

# Dependency graph
requires:
  - phase: 12-webhook-notifications
    plan: 01
    provides: stripe@22.0.1 runtime dep, src/lib/telegram.ts helper, 5 server-only env var slots in .env.example
provides:
  - POST /api/webhooks/stripe — signature-verified checkout.session.completed handler with Telegram dispatch
  - POST /api/webhooks/btcpay — HMAC-verified InvoiceSettled handler with Greenfield invoice fetch and Telegram dispatch
  - First /api/* routes in the repo — establishes Node runtime + force-dynamic convention for future webhook endpoints
affects: [13-desktop-preparation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js App Router webhook route convention: explicit `runtime = 'nodejs'` + `dynamic = 'force-dynamic'` + raw body read before parsing"
    - "Stripe signature verification via stripe.webhooks.constructEvent — requires raw request.text() (NOT .json()) before parse"
    - "BTCPay HMAC verification via node:crypto createHmac + timingSafeEqual on raw arrayBuffer bytes (NOT text) to preserve exact Unicode"
    - "Provider-agnostic failure model: 500 on misconfigured secret, 400 on bad signature, 200 on unsupported event type or downstream (Telegram/Greenfield) failure — never propagate 5xx to the provider to avoid retry storms"

key-files:
  created:
    - src/app/api/webhooks/stripe/route.ts
    - src/app/api/webhooks/btcpay/route.ts
  modified: []

key-decisions:
  - "Stripe SDK constructor fallback changed from empty string to 'sk_placeholder' — stripe@22 rejects empty strings at construction time, which broke next build page-data collection on deployments without STRIPE_SECRET_KEY (we never call the Stripe API, only verify signatures, so the key value is irrelevant)"
  - "BTC equivalent pick logic: find paymentMethods[] entry whose cryptoCode is BTC or BTC-LightningNetwork with amount > 0; renders '?' as a safe fallback when no match (Send test webhook produces empty paymentMethods)"
  - "Greenfield invoice fetch failure (non-2xx, missing API key, network throw) returns 200 with console.error — the signed webhook already proves the payment happened, retrying the webhook would not help us recover the invoice details and would spam the chat when Greenfield recovers"
  - "Unicode emoji encoded as \\uXXXX escape sequences (not literal emoji characters) in message templates — keeps route files ASCII-clean, matches existing src/lib/ convention"

patterns-established:
  - "Two /api/webhooks/{provider}/route.ts endpoints reading secrets from env at call time, importing the shared src/lib/telegram.ts helper, and returning provider-specific status codes per a documented failure taxonomy"

requirements-completed: [HOOK-01, HOOK-02, HOOK-03]

# Metrics
duration: 3min
completed: 2026-04-16
---

# Phase 12 Plan 02: Webhook Routes Summary

**Two Next.js App Router webhook endpoints — Stripe (checkout.session.completed) and BTCPay (InvoiceSettled) — verify their provider's signature, fetch additional invoice data for BTCPay via the Greenfield API, and dispatch formatted MarkdownV2 notifications through the Telegram helper from Plan 01.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-16T10:15:05Z
- **Completed:** 2026-04-16T10:17:35Z
- **Tasks:** 2 planned + 1 auto-fix (bug surfaced during npm run build verification)
- **Files created:** 2 (both routes)
- **Files modified:** 0

## Accomplishments

- `POST /api/webhooks/stripe` — full failure taxonomy implemented (500 on missing secret, 400 on missing/invalid signature, 200 on non-checkout.session.completed events, 200 on Telegram failure) with MarkdownV2 notification containing method, EUR amount, ISO UTC date, and clickable dashboard.stripe.com link
- `POST /api/webhooks/btcpay` — same failure taxonomy plus Greenfield API invoice fetch (InvoiceSettled payload has no amount/currency), BTC-equivalent derivation from paymentMethods[], and graceful "?" fallback when the test webhook carries an empty paymentMethods array
- `npm run build` lists both as `ƒ` (Dynamic) routes alongside the existing static routes — no build regression on /fr, /en, /donate, etc.
- `npx tsc --noEmit` green across the whole project
- All HOOK-01, HOOK-02, HOOK-03 requirement criteria satisfied (HOOK-04 was covered by Plan 01)

## Task Commits

Each task committed atomically:

1. **Task 1: Create Stripe webhook route handler** — `b6da656` (feat)
2. **Deviation Rule 1 (bug): Stripe SDK empty-key constructor failure** — `5193c46` (fix)
3. **Task 2: Create BTCPay webhook route handler with Greenfield invoice fetch** — `de71a4f` (feat)

_Plan metadata commit follows (docs: complete plan)._

## Files Created/Modified

- `src/app/api/webhooks/stripe/route.ts` (new, 91 lines) — imports `Stripe`, `@/lib/telegram`; exports `runtime`, `dynamic`, `POST`
- `src/app/api/webhooks/btcpay/route.ts` (new, 145 lines) — imports `node:crypto`, `@/config/donate` (btcpayConfig.serverUrl), `@/lib/telegram`; exports `runtime`, `dynamic`, `POST`

Both files declare `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"` as required.

## HTTP Status Code Mapping (per-route, with file:line citations)

**Stripe route (`src/app/api/webhooks/stripe/route.ts`):**

| Line | Status | Branch                                                             |
| ---- | ------ | ------------------------------------------------------------------ |
| 21   | 500    | `STRIPE_WEBHOOK_SECRET` missing in env                             |
| 26   | 400    | `stripe-signature` header missing                                  |
| 38   | 400    | `stripe.webhooks.constructEvent` throws (invalid/tampered/expired) |
| 45   | 200    | `event.type !== "checkout.session.completed"` (silent)             |
| 86   | 200    | Success — Telegram message dispatched (or helper swallowed its own error) |

**BTCPay route (`src/app/api/webhooks/btcpay/route.ts`):**

| Line | Status | Branch                                                                |
| ---- | ------ | --------------------------------------------------------------------- |
| 41   | 500    | `BTCPAY_WEBHOOK_SECRET` missing in env                                |
| 47   | 400    | `btcpay-sig` header missing                                           |
| 65   | 400    | HMAC mismatch (length differs OR `timingSafeEqual` returns false)     |
| 72   | 400    | Raw body JSON parse failure (malformed payload even if HMAC passed)   |
| 78   | 200    | `payload.type !== "InvoiceSettled"` (silent)                          |
| 85   | 200    | `BTCPAY_API_KEY` missing in env (can't enrich, don't retry-loop)      |
| 98   | 200    | Greenfield fetch returned non-2xx (best-effort: payment happened)     |
| 107  | 200    | Greenfield fetch threw (network error, DNS failure)                   |
| 144  | 200    | Success — invoice fetched, Telegram message dispatched                |

## Decisions Made

- **Stripe SDK placeholder key:** `new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder")` instead of `?? ""`. The plan's comment "empty-string fallback is safe" predates stripe@22's constructor-level validation. Since we never call the Stripe API (only verify signatures via `constructEvent`, which uses its own HMAC path), the key value is irrelevant at runtime — but the constructor refuses empty strings.
- **BTC method selection:** `paymentMethods.find(m => (cryptoCode === "BTC" || "BTC-LightningNetwork") && amount > 0)`. Standard BTCPay invoices have one positive-amount method; the `.find()` picks the actually-paid one regardless of which was enabled. When neither matches (test webhooks, dormant invoices), `btcAmount = "?"` renders cleanly in MarkdownV2.
- **Missing BTCPAY_API_KEY → 200 (not 500):** The webhook was signed (HMAC verified), so BTCPay already knows delivery succeeded. Returning 500 would trigger BTCPay's retry policy; we'd just 500 again and spam the logs. Instead: `console.error`, return 200, and accept we miss one notification's detail. Aligned with CONTEXT's "best-effort" rule and mirrors how the Telegram failure path works.
- **No retry on Greenfield fetch:** Same rationale as CONTEXT — retrying from within a webhook handler competes with Vercel's 10-second timeout and cold-start overhead; the incident is already logged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Stripe SDK constructor rejects empty string key**

- **Found during:** Task 2 verification (`npm run build`)
- **Issue:** `npm run build` failed during page-data collection with `Error: Neither apiKey nor config.authenticator provided` — the installed `stripe@22.0.1` SDK (see `node_modules/stripe/cjs/stripe.core.js:285-288`) validates the constructor argument and throws when both `key` and `authenticator` are falsy. Empty string is falsy.
- **Fix:** Changed `new Stripe(process.env.STRIPE_SECRET_KEY ?? "")` to `new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder")`. Updated the comment to explain: the key is never used at runtime because `stripe.webhooks.constructEvent` is a pure HMAC operation independent of the SDK's API authenticator.
- **Files modified:** `src/app/api/webhooks/stripe/route.ts` (comment + 1 default value)
- **Commit:** `5193c46`
- **Why Rule 1 applies:** This blocked completion of the plan (`npm run build` is a stated acceptance criterion). The issue is in code this plan just wrote (Task 1's module-level init) and was not mentioned in CONTEXT or RESEARCH. Not architectural (no structural change, same public behavior), so Rule 4 does not apply.

### Intentional

- The plan body's implementation constraint "SDK init is safe with empty string" was superseded by observed SDK behavior. No other deviation.

## Issues Encountered

- Same pre-existing Node engine warning from `eslint-visitor-keys@5.0.1` during any npm operation — unrelated to this plan, already noted in 12-01 SUMMARY.
- `npm run build` output is clean apart from the one auto-fixed error; both webhook routes appear in the route table as `ƒ /api/webhooks/btcpay` and `ƒ /api/webhooks/stripe`.

## Build Output Excerpt

Final `npm run build` after the fix:

```
Route (app)
├ ● /[locale]
├ ● /[locale]/donate
├ ● /[locale]/privacy
├ ● /[locale]/support
├ ƒ /api/webhooks/btcpay
├ ƒ /api/webhooks/stripe
├ ○ /apple-icon.png
...

ƒ  (Dynamic)  server-rendered on demand
```

Both webhook routes are Dynamic — guaranteed to execute on every POST rather than being statically optimized.

## User Setup Required

External provisioning already documented in Plan 01's updated setup guides (`docs/setup-telegram.md`, `docs/setup-stripe.md` §9, `docs/setup-btcpay.md` §9). Before notifications can flow end-to-end, the operator must:

- Create Telegram bot + populate `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Configure Stripe webhook endpoint filtered on `checkout.session.completed` + populate `STRIPE_WEBHOOK_SECRET`
- Configure BTCPay webhook filtered on `InvoiceSettled` + populate `BTCPAY_WEBHOOK_SECRET`
- Create Greenfield API key with `btcpay.store.canviewinvoices` scope + populate `BTCPAY_API_KEY`

These are the 3 STATE.md blockers that pre-existed this phase and are still outstanding. Manual-test commands (`stripe listen`, BTCPay "Send test webhook") live in the setup guides.

## Next Phase Readiness

Phase 12 is functionally complete. The only remaining work is operator-side provisioning (above). Phase 13 (Desktop Preparation) has no dependency on Phase 12 runtime behavior.

## Self-Check: PASSED

Verified artifacts on disk:

- FOUND: src/app/api/webhooks/stripe/route.ts (91 lines, exceeds 55 min)
- FOUND: src/app/api/webhooks/btcpay/route.ts (145 lines, exceeds 75 min)
- FOUND: commit b6da656 (Task 1 — Stripe route)
- FOUND: commit 5193c46 (Rule 1 deviation — Stripe SDK placeholder)
- FOUND: commit de71a4f (Task 2 — BTCPay route)
- FOUND: `export const runtime = "nodejs"` in both routes
- FOUND: `export const dynamic = "force-dynamic"` in both routes
- FOUND: `export async function POST` in both routes
- FOUND: `stripe.webhooks.constructEvent` in stripe route
- FOUND: `crypto.createHmac` + `crypto.timingSafeEqual` in btcpay route
- FOUND: `await request.text()` in stripe route; `await request.arrayBuffer()` in btcpay route
- FOUND: import from `@/lib/telegram` in both routes (escapeMarkdownV2 + sendTelegramMessage)
- FOUND: import `btcpayConfig` from `@/config/donate` in btcpay route (no new env var for URL)
- FOUND: `api/v1/stores/${storeId}/invoices/${invoiceId}` Greenfield path in btcpay route
- FOUND: `Authorization: token ${apiKey}` header in btcpay route
- FOUND: `npx tsc --noEmit` exits 0
- FOUND: `npm run build` completes; both webhook routes listed as `ƒ` (Dynamic)
- ABSENT (as required): `request.json()` in stripe route
- ABSENT (as required): `request.json()` and `request.text()` in btcpay route

---
*Phase: 12-webhook-notifications*
*Completed: 2026-04-16*

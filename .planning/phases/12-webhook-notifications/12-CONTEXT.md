# Phase 12: Webhook Notifications - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Two Next.js API routes (`/api/webhooks/stripe` and `/api/webhooks/btcpay`) that receive signed webhook POSTs from Stripe (fiat Payment Link paid) and BTCPay Server (Bitcoin invoice settled), verify each provider's signature, and emit a formatted notification to a single Telegram chat via the Telegram Bot API. No persistence, no retry store, no user-facing surface — pure server-side integration.

</domain>

<decisions>
## Implementation Decisions

### Signature verification
- **Stripe**: install the official `stripe` npm package and use `stripe.webhooks.constructEvent()` — ships server-side only, zero Lighthouse impact
- **BTCPay**: verify `BTCPay-Sig` header with `node:crypto` HMAC-SHA256 + `timingSafeEqual` (no official BTCPay webhook SDK)
- Both routes read the raw request body — use `await request.text()` then parse manually (Stripe SDK requires raw body string, BTCPay HMAC hashes raw bytes)
- Invalid signature → `400 Bad Request` (per HOOK success criteria #3)
- Missing secret env var at runtime → `500` + `console.error` (endpoint stays up, alert visible in Vercel logs)

### Shared Telegram helper
- Extract `sendTelegramMessage(text: string)` into `src/lib/telegram.ts`
- Both webhook routes call the same helper
- Helper reads `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` at call time, hits `https://api.telegram.org/bot{token}/sendMessage` with native `fetch`
- Uses `parse_mode: "MarkdownV2"` — helper escapes reserved characters so callers pass logical text

### Which webhook events to listen for
- **Stripe**: only `checkout.session.completed` — fires once per successful Payment Link payment, payload contains `amount_total`, `currency`, `id`, `payment_intent`
- Stripe Dashboard endpoint must be configured to subscribe ONLY to `checkout.session.completed` (smaller payload, fewer signatures to verify)
- **BTCPay**: only `InvoiceSettled` — fires once per invoice fully paid + confirmed (on-chain 1 conf or Lightning final)
- Any other event type received (defensive, in case dashboard config drifts) → `return 200` silently, no log, no Telegram call

### Telegram message format
- Language: **English only** (single recipient chat, no i18n overhead)
- Parse mode: **MarkdownV2** with emoji + bold
- Fields per notification:
  - Method (Stripe / Bitcoin)
  - Amount in EUR (always)
  - BTC equivalent for Bitcoin donations (from BTCPay payload)
  - Date (ISO or human-readable UTC)
  - Clickable link to the dashboard:
    - Stripe → `https://dashboard.stripe.com/payments/{payment_intent_id}`
    - BTCPay → `https://btcpay.getdictus.com/invoices/{invoiceId}`
- Suggested shape (Claude refines exact wording at planning):
  ```
  ✨ *New contribution*

  💳 Method: Stripe
  💰 Amount: 25 EUR
  📅 2026-04-16 14:32 UTC
  🔗 [View payment](https://dashboard.stripe.com/payments/pi_...)
  ```

### Failure behavior
- Telegram API call fails (network, 5xx, chat unknown) → `return 200` + `console.error` with stack and context
  - Rationale: payment is already received, notification is best-effort, a retry would risk spamming the chat once Telegram recovers
- Logging strategy (no persistent store, only Vercel logs):
  - Success: `console.log` minimal (`"[stripe-webhook] checkout.session.completed"`)
  - Failure: `console.error` with full context
- Unknown event type: silent 200 (see Events section)

### Testing
- No automated tests added for this phase
- Add manual-test sections to `docs/setup-stripe.md` and `docs/setup-btcpay.md`:
  - Stripe: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` + `stripe trigger checkout.session.completed`
  - BTCPay: "Send test webhook" button in store settings with `InvoiceSettled` event

### Claude's Discretion
- Exact wording and emoji selection of the Telegram message body
- Whether to split the helper further (e.g., separate `formatMessage` for Stripe vs BTCPay)
- Whether API routes use Node or Edge runtime (Node recommended — `stripe` SDK + `node:crypto`)
- Idempotency handling (Stripe retries on 5xx; since we only 500 on missing secret, practical duplicate risk is negligible — but mentioning `event.id` dedup in logs is fine)
- Env var naming details beyond the 4 already committed in HOOK-04
- Whether to create a new `docs/setup-telegram.md` for bot creation via @BotFather + chat ID discovery (likely yes, to complete HOOK-04)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & prior context
- `.planning/REQUIREMENTS.md` — HOOK-01, HOOK-02, HOOK-03, HOOK-04
- `.planning/ROADMAP.md` — Phase 12 Success Criteria (400 on invalid signature, env vars documented)
- `.planning/phases/11-donation-page/11-CONTEXT.md` — Phase 11 decisions that bound the webhook inputs (Stripe Payment Link flow, BTCPay "Allow anyone to create invoice" setup)

### Setup guides (to be EXTENDED in this phase)
- `docs/setup-stripe.md` — already mentions `STRIPE_WEBHOOK_SECRET` as "needed for Phase 12"; add webhook endpoint configuration (filter on `checkout.session.completed`), test instructions (`stripe listen`)
- `docs/setup-btcpay.md` — already mentions `BTCPAY_WEBHOOK_SECRET` as "needed for Phase 12"; add webhook creation in BTCPay UI (Store > Webhooks > `InvoiceSettled`), test button usage

### External provider docs (fetch via Context7 or provider site at plan time)
- Stripe Webhooks: https://docs.stripe.com/webhooks (signature verification, event payloads)
- Stripe `checkout.session.completed` payload: https://docs.stripe.com/api/events/types#event_types-checkout.session.completed
- BTCPay Server Webhooks: https://docs.btcpayserver.org/Development/Webhooks/ (HMAC-SHA256 via `BTCPay-Sig` header, hex lowercase)
- BTCPay `InvoiceSettled` event payload reference
- Telegram Bot API `sendMessage`: https://core.telegram.org/bots/api#sendmessage
- Telegram MarkdownV2 escape rules: https://core.telegram.org/bots/api#markdownv2-style

### Existing code patterns
- `src/config/donate.ts` — only existing config file pattern in repo; webhook routes will NOT need new config here (secrets come from env vars)
- `next.config.ts` — minimal, wraps `createNextIntlPlugin`; API routes live outside `[locale]` segment so i18n middleware doesn't apply
- `.env.example` — existing comment-based structure to mirror when adding the 4 new server env vars

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `node:crypto` — no dep needed for BTCPay HMAC (`createHmac`, `timingSafeEqual`)
- Native `fetch` (Node 22 on Vercel) — no HTTP client dep needed for Telegram API calls
- `.env.example` / `.env.local` convention — already used for `NEXT_PUBLIC_TESTFLIGHT_URL`, `NEXT_PUBLIC_ANDROID_RELEASE_URL`. Phase 12 adds 4 non-public (server-only) variables on top

### Established Patterns
- Env var naming: `NEXT_PUBLIC_*` for client, plain names for server secrets
- Setup docs live in `docs/` in French (e.g. `setup-stripe.md`, `setup-btcpay.md`); matching `setup-telegram.md` is likely needed
- Config lives in `src/config/*.ts` as `as const` exports; webhooks deliberately skip this and read env vars directly so secrets stay out of bundles

### Integration Points
- New: `src/app/api/webhooks/stripe/route.ts` (first `app/api/` route in the repo)
- New: `src/app/api/webhooks/btcpay/route.ts`
- New: `src/lib/telegram.ts` (first file in `src/lib/`)
- Update: `docs/setup-stripe.md` — append webhook endpoint + test section
- Update: `docs/setup-btcpay.md` — append webhook endpoint + test section
- New (likely): `docs/setup-telegram.md` — BotFather bot creation, how to grab `TELEGRAM_CHAT_ID` via `getUpdates`
- Update: `.env.example` — add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `STRIPE_WEBHOOK_SECRET`, `BTCPAY_WEBHOOK_SECRET` with comments
- New dep: `stripe` (server-only; verify it doesn't leak into client bundles)

### Runtime Considerations
- Vercel serverless Node runtime (not Edge) — `stripe` SDK is not Edge-compatible historically, and `node:crypto` works natively in Node runtime
- Webhook routes must NOT be under the `[locale]` segment — Next.js App Router `/api/*` lives at the root, unaffected by i18n middleware

</code_context>

<specifics>
## Specific Ideas

- Single English chat as recipient: owner-only audit trail, no i18n complexity
- Message tone neutral/functional — this is an internal ops notification, not a user-facing message
- Clickable dashboard links are the killer feature: 1 click from Telegram → full payment detail
- Keep webhook routes dumb and synchronous: verify → parse → format → send → respond. No queues, no retries, no store.

</specifics>

<deferred>
## Deferred Ideas

- Donation persistence in a database (DON-F04 future requirement) — out of scope, webhooks today are notification-only
- Admin dashboard for donation history (DON-F03) — future milestone
- Custom thank-you page redirect post-donation (DON-F02) — separate concern from webhooks
- Recurring donations webhook handling (DON-F01) — Stripe Subscriptions events not addressed here
- Idempotency store (dedup by `event.id` across cold starts) — not needed given best-effort Telegram + low volume
- Stripe CLI unit tests with signed fixtures — deferred, manual testing via `stripe listen` suffices

</deferred>

---

*Phase: 12-webhook-notifications*
*Context gathered: 2026-04-16*

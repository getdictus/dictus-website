---
status: complete
phase: 12-webhook-notifications
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md]
started: 2026-04-16T16:32:31Z
updated: 2026-04-16T16:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Build Registers Webhook Routes
expected: `npm run build` completes cleanly, both `/api/webhooks/stripe` and `/api/webhooks/btcpay` appear in the route table as `ƒ` (Dynamic), and no existing routes regress.
result: pass

### 2. Telegram Helper Delivers Test Message
expected: With `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` populated in `.env.local`, invoking `sendTelegramMessage` (e.g., via a one-off script or node REPL) lands a message in the Telegram chat with MarkdownV2 formatting intact (bold, link, escaped dots).
result: pass

### 3. Stripe Webhook Rejects Invalid Signature
expected: POST to `/api/webhooks/stripe` with either no `stripe-signature` header or a tampered body returns HTTP 400. Missing `STRIPE_WEBHOOK_SECRET` returns 500. No Telegram message is sent.
result: pass

### 4. Stripe Webhook Success (stripe listen + trigger)
expected: With `stripe listen --forward-to localhost:3000/api/webhooks/stripe` running and the listener's whsec_ copied into `.env.local`, running `stripe trigger checkout.session.completed` produces: (a) 200 OK from the route, (b) Telegram message containing the method (card), EUR amount, ISO UTC date, and a clickable dashboard.stripe.com link.
result: pass

### 5. BTCPay Webhook Rejects Invalid HMAC
expected: POST to `/api/webhooks/btcpay` with a missing or wrong `btcpay-sig` header returns HTTP 400. Missing `BTCPAY_WEBHOOK_SECRET` returns 500. No Telegram message is sent.
result: skipped
reason: BTCPay not ready yet

### 6. BTCPay Webhook Success (Send test webhook)
expected: From BTCPay Store → Webhooks → "Send test webhook" on an InvoiceSettled subscription, route returns 200 and a Telegram message arrives. Because the test payload ships empty `paymentMethods`, the BTC amount renders as `?` — this is the documented safe fallback, not a regression.
result: skipped
reason: BTCPay not ready yet

### 7. Setup Docs: Telegram Walkthrough
expected: `docs/setup-telegram.md` reads end-to-end: BotFather flow, retrieving chat_id via getUpdates (private / group / channel scenarios), rate limits, secret hygiene. Clear enough for an operator who has never touched Telegram to complete setup.
result: pass

### 8. Setup Docs: Stripe + BTCPay Section 9
expected: `docs/setup-stripe.md` §9 covers the production endpoint (filtered on `checkout.session.completed`), `stripe listen` for local dev, and troubleshooting. `docs/setup-btcpay.md` §9 covers InvoiceSettled webhook, Greenfield API key with `canviewinvoices` scope, and "Send test webhook". Both sections are actionable without external knowledge.
result: pass

## Summary

total: 8
passed: 6
issues: 0
pending: 0
skipped: 2

## Gaps

[none yet]

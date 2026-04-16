---
phase: 12-webhook-notifications
verified: 2026-04-16T10:45:00Z
status: passed
score: 8/8 must-haves verified
re_verification: false
human_verification:
  - test: "Send real Stripe checkout.session.completed event via stripe listen"
    expected: "Telegram chat receives formatted message with method=Stripe, EUR amount, ISO UTC date, and clickable dashboard.stripe.com/payments/{pi_...} link"
    why_human: "Requires live Stripe CLI + real TELEGRAM_BOT_TOKEN/CHAT_ID env vars; cannot simulate HMAC-signed webhook or Telegram delivery programmatically"
  - test: "Send BTCPay InvoiceSettled test webhook from BTCPay Dashboard"
    expected: "Telegram chat receives formatted message with method=Bitcoin, EUR amount, BTC equivalent (or ? for test payload), ISO UTC date, and clickable invoice link"
    why_human: "Requires live BTCPay server instance with valid BTCPAY_WEBHOOK_SECRET + BTCPAY_API_KEY; Greenfield fetch will 404 on fake invoiceId (expected per docs)"
  - test: "POST invalid stripe-signature to /api/webhooks/stripe"
    expected: "HTTP 400 response"
    why_human: "Requires running Next.js server to test HTTP response code; static analysis confirms the 400 branch exists"
  - test: "POST invalid BTCPAY-SIG to /api/webhooks/btcpay"
    expected: "HTTP 400 response"
    why_human: "Same as above for BTCPay HMAC path"
---

# Phase 12: Webhook Notifications Verification Report

**Phase Goal:** Every donation (Stripe or BTCPay) triggers a formatted notification in a Telegram chat via a bot
**Verified:** 2026-04-16T10:45:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | POST to /api/webhooks/stripe with valid signature sends Telegram message | VERIFIED | `src/app/api/webhooks/stripe/route.ts` — `stripe.webhooks.constructEvent` on line 38, `await sendTelegramMessage(text)` on line 88 |
| 2 | POST to /api/webhooks/btcpay with valid HMAC sends Telegram message | VERIFIED | `src/app/api/webhooks/btcpay/route.ts` — `crypto.timingSafeEqual` on line 61, `await sendTelegramMessage(text)` on line 142 |
| 3 | Invalid signatures rejected with 400 status | VERIFIED | Stripe: `return new Response("Invalid signature", { status: 400 })` (line 41). BTCPay: `return new Response("Invalid signature", { status: 400 })` (line 63) |
| 4 | Environment variables documented | VERIFIED | `.env.example` lines 9–27: all 5 server secrets declared with inline comments explaining source and format |
| 5 | Shared Telegram helper importable from @/lib/telegram | VERIFIED | `src/lib/telegram.ts` — 52 lines, exports `escapeMarkdownV2` and `sendTelegramMessage`; imported in both routes |
| 6 | Stripe message contains method, amount, date, clickable link | VERIFIED | Lines 76–80: method=Stripe, `escapeMarkdownV2(amountMajor)`, `escapeMarkdownV2(createdIso)`, `dashboard.stripe.com/payments/{pi_...}` |
| 7 | BTCPay message contains method, amount, BTC equivalent, date, clickable link | VERIFIED | Lines 131–136: method=Bitcoin, `invoice.amount`, `invoice.currency`, `btcAmount`, `createdIso`, `btcpayConfig.serverUrl/invoices/{invoiceId}` |
| 8 | Telegram delivery failure never propagates 5xx to providers | VERIFIED | `sendTelegramMessage` swallows all errors internally (never throws). Both routes `await` it then return 200 unconditionally on success path |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/telegram.ts` | escapeMarkdownV2 + sendTelegramMessage helpers | VERIFIED | 52 lines, both named exports present, `api.telegram.org/bot${token}/sendMessage` fetch, `parse_mode: "MarkdownV2"`, env read at call time (not module top-level) |
| `src/app/api/webhooks/stripe/route.ts` | Stripe handler — signature + Telegram | VERIFIED | 92 lines (exceeds 55 min), exports POST + runtime + dynamic, imports from @/lib/telegram, contains `constructEvent`, raw body via `request.text()` |
| `src/app/api/webhooks/btcpay/route.ts` | BTCPay handler — HMAC + Greenfield + Telegram | VERIFIED | 145 lines (exceeds 75 min), exports POST + runtime + dynamic, imports from @/lib/telegram + @/config/donate, HMAC via `timingSafeEqual`, raw bytes via `request.arrayBuffer()` |
| `.env.example` | 5 server env var declarations | VERIFIED | All 5 present: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, STRIPE_WEBHOOK_SECRET, BTCPAY_WEBHOOK_SECRET, BTCPAY_API_KEY; original NEXT_PUBLIC_ entries untouched |
| `docs/setup-telegram.md` | BotFather bot creation + chat_id discovery | VERIFIED | 85 lines; contains BotFather, getUpdates, TELEGRAM_CHAT_ID, MarkdownV2; 3 scenarios (private/group/channel) |
| `docs/setup-stripe.md` | Webhook section 9 with stripe listen docs | VERIFIED | Section "## 9. Webhook Configuration (Phase 12)" present; contains `stripe listen`, `stripe trigger`, `checkout.session.completed`, `/api/webhooks/stripe` |
| `docs/setup-btcpay.md` | Webhook section 9 with InvoiceSettled + API key | VERIFIED | Section "## 9. Webhook Configuration (Phase 12)" present; contains `InvoiceSettled`, `btcpay.store.canviewinvoices`, `BTCPAY_API_KEY`, `/api/webhooks/btcpay` |
| `package.json` | stripe runtime dependency | VERIFIED | `"stripe": "^22.0.1"` in dependencies (not devDependencies); `npm ls stripe` → `stripe@22.0.1` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/api/webhooks/stripe/route.ts` | `src/lib/telegram.ts` | `import { sendTelegramMessage, escapeMarkdownV2 } from "@/lib/telegram"` | WIRED | Line 2; both functions used in POST handler |
| `src/app/api/webhooks/btcpay/route.ts` | `src/lib/telegram.ts` | `import { sendTelegramMessage, escapeMarkdownV2 } from "@/lib/telegram"` | WIRED | Line 3; both functions used in POST handler |
| `src/app/api/webhooks/stripe/route.ts` | stripe npm SDK | `stripe.webhooks.constructEvent(rawBody, signature, secret)` | WIRED | Line 38; `new Stripe("sk_placeholder")` init on line 18 (empty string rejected by stripe@22) |
| `src/app/api/webhooks/btcpay/route.ts` | node:crypto HMAC | `createHmac('sha256', secret).update(rawBody).digest("hex")` + `timingSafeEqual` | WIRED | Lines 55 + 61; length check guards timingSafeEqual as required |
| `src/app/api/webhooks/btcpay/route.ts` | BTCPay Greenfield API | `fetch(${btcpayConfig.serverUrl}/api/v1/stores/${storeId}/invoices/${invoiceId}, { Authorization: token ${apiKey} })` | WIRED | Lines 90–93; serverUrl from @/config/donate (not hardcoded) |
| `src/lib/telegram.ts` | api.telegram.org | `fetch(https://api.telegram.org/bot${token}/sendMessage, { parse_mode: "MarkdownV2" })` | WIRED | Line 33; link previews disabled via `link_preview_options` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| HOOK-01 | 12-02 | `/api/webhooks/stripe` verifie la signature Stripe et envoie un message Telegram | SATISFIED | Route exists at correct path, `stripe.webhooks.constructEvent` on raw body, `sendTelegramMessage` dispatched on `checkout.session.completed` |
| HOOK-02 | 12-02 | `/api/webhooks/btcpay` verifie la signature HMAC BTCPay et envoie un message Telegram | SATISFIED | Route exists at correct path, HMAC via `crypto.createHmac`+`timingSafeEqual`, `sendTelegramMessage` dispatched on `InvoiceSettled` |
| HOOK-03 | 12-02 | Messages Telegram formattes avec methode, montant, devise et date | SATISFIED | Stripe: method=Stripe + EUR amount + ISO date + dashboard link. BTCPay: method=Bitcoin + EUR amount + BTC equivalent + ISO date + invoice link. All dynamic values escaped with `escapeMarkdownV2` |
| HOOK-04 | 12-01 | Variables d'environnement documentees (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, STRIPE_WEBHOOK_SECRET, BTCPAY_WEBHOOK_SECRET) | SATISFIED | 5 vars in `.env.example` (the 4 in spec + BTCPAY_API_KEY added per CONTEXT discretion); 3 setup docs cover provisioning end-to-end |

Note on HOOK-04 scope: The requirement lists 4 env vars; the plan added `BTCPAY_API_KEY` as a 5th under explicit authorization in CONTEXT.md ("Claude's Discretion: Env var naming details beyond the 4 already committed in HOOK-04"). This is a superset, not a deviation.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/webhooks/stripe/route.ts` | 18 | `"sk_placeholder"` as Stripe SDK constructor fallback | Info | Not a real secret leak; required because stripe@22 rejects empty strings at construction. The value is never used for API calls — only `constructEvent` (HMAC-based) is called. SUMMARY documents the fix commit `5193c46`. |

No TODO/FIXME/HACK comments found. No empty implementations. No stub returns. No `request.json()` in signature-verified routes (forbidden pattern correctly absent).

### Human Verification Required

#### 1. Stripe End-to-End: Live Webhook to Telegram

**Test:** Install Stripe CLI, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, copy the ephemeral `whsec_...` into `.env.local`, start `npm run dev`, then run `stripe trigger checkout.session.completed` in a third terminal.
**Expected:** `stripe listen` output shows `2xx` for the event; Telegram chat receives a message containing emoji header, "Method: Stripe", a EUR amount like "0.00 EUR", an ISO UTC date, and a clickable `dashboard.stripe.com/payments/...` link.
**Why human:** Requires live Stripe CLI, real TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID env vars, and running Next.js server. Cannot simulate a properly signed webhook or verify Telegram delivery programmatically.

#### 2. BTCPay End-to-End: Test Webhook to Telegram

**Test:** In BTCPay Dashboard, go to Store > Webhooks, select the configured webhook, click "Send test webhook", choose `InvoiceSettled`.
**Expected:** BTCPay UI shows `200 OK`. Telegram chat receives a message with method=Bitcoin, amount/currency fields (may show "?" for BTC amount on test payload since paymentMethods is empty), ISO UTC date, and clickable invoice link. Server logs will show a Greenfield 404 for the fake invoiceId — this is documented as expected behavior in `docs/setup-btcpay.md` §9.3.
**Why human:** Requires live BTCPay server, valid BTCPAY_WEBHOOK_SECRET (to pass HMAC), and Telegram credentials. The BTCPAY_API_KEY Greenfield call will gracefully fail on test webhook (expected).

#### 3. Negative Case: Invalid Signatures Return 400

**Test:** `curl -X POST http://localhost:3000/api/webhooks/stripe -H "stripe-signature: bogus" -d '{}'` and `curl -X POST http://localhost:3000/api/webhooks/btcpay -H "btcpay-sig: sha256=invalid" -d '{}'`.
**Expected:** Both return HTTP 400.
**Why human:** Requires running server. Static analysis confirms the 400 branches are present; runtime test is the final confirmation.

### Gaps Summary

No gaps. All automated checks pass. Phase goal is satisfied at the code level.

The only items deferred to human verification are integration tests requiring live external services (Telegram bot, Stripe CLI, BTCPay server) — these are operator-level acceptance tests, not code gaps.

---

_Verified: 2026-04-16T10:45:00Z_
_Verifier: Claude (gsd-verifier)_

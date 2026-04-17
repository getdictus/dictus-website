# Phase 12: Webhook Notifications - Research

**Researched:** 2026-04-16
**Domain:** Server-side webhook handlers (Stripe + BTCPay) with Telegram Bot notifications in Next.js 16 App Router on Vercel
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Signature verification**
- Stripe: install official `stripe` npm package, use `stripe.webhooks.constructEvent()` — ships server-side only, zero Lighthouse impact
- BTCPay: verify `BTCPay-Sig` header with `node:crypto` HMAC-SHA256 + `timingSafeEqual` (no official BTCPay webhook SDK)
- Both routes read the raw request body — use `await request.text()` then parse manually
- Invalid signature → `400 Bad Request` (per HOOK success criteria #3)
- Missing secret env var at runtime → `500` + `console.error` (endpoint stays up, alert visible in Vercel logs)

**Shared Telegram helper**
- Extract `sendTelegramMessage(text: string)` into `src/lib/telegram.ts`
- Both webhook routes call the same helper
- Helper reads `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` at call time, hits `https://api.telegram.org/bot{token}/sendMessage` with native `fetch`
- Uses `parse_mode: "MarkdownV2"` — helper escapes reserved characters so callers pass logical text

**Events**
- Stripe: only `checkout.session.completed`, dashboard config should subscribe ONLY to that event
- BTCPay: only `InvoiceSettled`
- Any other event type received → return 200 silently, no log, no Telegram call

**Telegram message format**
- Language: English only (single recipient chat)
- Parse mode: MarkdownV2 with emoji + bold
- Fields: Method (Stripe / Bitcoin), Amount EUR, BTC equivalent for Bitcoin donations, Date (ISO or human-readable UTC), clickable dashboard link
- Links: Stripe → `https://dashboard.stripe.com/payments/{payment_intent_id}`, BTCPay → `https://btcpay.getdictus.com/invoices/{invoiceId}`

**Failure behavior**
- Telegram API call fails → return 200 + `console.error` with stack (payment already received, avoid spam retries)
- Success: minimal `console.log`
- Failure: `console.error` with full context
- Unknown event type: silent 200

**Testing**
- No automated tests this phase
- Manual-test sections added to `docs/setup-stripe.md` and `docs/setup-btcpay.md`

### Claude's Discretion

- Exact wording and emoji selection of the Telegram message body
- Whether to split the helper further (e.g., separate `formatMessage` for Stripe vs BTCPay)
- Whether API routes use Node or Edge runtime (Node recommended — `stripe` SDK + `node:crypto`)
- Idempotency handling (mentioning `event.id` dedup in logs is fine)
- Env var naming details beyond the 4 already committed in HOOK-04
- Whether to create a new `docs/setup-telegram.md` for bot creation (likely yes, to complete HOOK-04)

### Deferred Ideas (OUT OF SCOPE)

- Donation persistence in a database (DON-F04)
- Admin dashboard for donation history (DON-F03)
- Custom thank-you page redirect post-donation (DON-F02)
- Recurring donations webhook handling (DON-F01) — Stripe Subscriptions events
- Idempotency store (dedup by `event.id` across cold starts)
- Stripe CLI unit tests with signed fixtures
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOOK-01 | API route `/api/webhooks/stripe` verifies Stripe signature and sends Telegram message | Stripe `constructEvent` pattern (HIGH), raw body via `await request.text()` (HIGH), `stripe` npm v22 (HIGH) |
| HOOK-02 | API route `/api/webhooks/btcpay` verifies HMAC BTCPay and sends Telegram message | `BTCPAY-SIG` header + `sha256=hex` (HIGH), node:crypto timingSafeEqual (HIGH), **InvoiceSettled payload requires secondary API call for amount/currency** (HIGH, critical finding) |
| HOOK-03 | Telegram messages formatted with method, amount, currency and date | Telegram `sendMessage` + MarkdownV2 escape rules (HIGH) |
| HOOK-04 | Environment variables documented (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, STRIPE_WEBHOOK_SECRET, BTCPAY_WEBHOOK_SECRET) | .env.example convention established in repo. **Research surfaces a 5th required env var: `BTCPAY_API_KEY`** to fetch invoice details (see Open Questions) |
</phase_requirements>

## Summary

Phase 12 adds two Next.js 16 App Router route handlers (`src/app/api/webhooks/stripe/route.ts` and `src/app/api/webhooks/btcpay/route.ts`) plus a shared Telegram helper (`src/lib/telegram.ts`). All three integrations — Stripe webhooks, BTCPay Server webhooks, Telegram Bot API — are well-documented and straightforward to implement with native Node APIs (node:crypto, native fetch) plus the official `stripe` npm package (v22.0.1 at research time, pinned API version `2026-03-25.dahlia`). There is **no Magic, no Playwright, no UI work** in this phase.

Two non-obvious findings materially shape the plan:

1. **The BTCPay `InvoiceSettled` webhook payload does NOT include amount or currency** — only `invoiceId`, `storeId`, `type`, `timestamp`, `deliveryId`, `webhookId`, and a `metadata` object. To populate HOOK-03's "amount + currency + BTC equivalent" message, the handler MUST call back to the BTCPay Greenfield API: `GET /api/v1/stores/{storeId}/invoices/{invoiceId}` with an `Authorization: token {api_key}` header. This introduces a **5th env var** (`BTCPAY_API_KEY` with "View invoices" permission / `btcpay.store.canviewinvoices` scope) that CONTEXT.md does not list. This is a gap that needs a user decision before planning, or can be accepted as "Claude's discretion over env var naming details beyond the 4 committed in HOOK-04."

2. **Telegram MarkdownV2 has 18 reserved characters that MUST be escaped** or `sendMessage` returns 400 "Bad Request: can't parse entities." The escaping rules differ inside code blocks and inside link URL parentheses. The helper's escape function is not optional — an unescaped EUR amount like `25.00` will fail because `.` is reserved. This is the #1 failure mode for first-time MarkdownV2 integrators.

**Primary recommendation:** Scaffold three files in parallel (telegram helper, stripe route, btcpay route), verify signatures first, then dispatch through the helper. Route handlers must export `export const runtime = 'nodejs'` (explicit, not default) and `export const dynamic = 'force-dynamic'` to prevent any static optimization. Use `await request.text()` for Stripe (constructEvent accepts string) and `await request.arrayBuffer() → Buffer.from()` for BTCPay (HMAC needs raw bytes).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `stripe` (npm) | ^18.0.0 – ^22.0.0 | Webhook signature verification via `stripe.webhooks.constructEvent()` | Official SDK from Stripe; all other approaches (manual HMAC over signed payload format `t=...,v1=...`) are error-prone and not supported. Server-only, tree-shaken out of client bundles. |
| `node:crypto` (built-in) | Node 22 (Vercel default) | HMAC-SHA256 for BTCPay; `timingSafeEqual` for constant-time comparison | Zero dependency, exact match for BTCPay's documented verification scheme. No BTCPay Node SDK with webhook helpers exists. |
| Native `fetch` (Node 22) | built-in | POST to Telegram `sendMessage` and GET BTCPay invoice | Zero dependency, works identically in Node runtime. Replaces `node-fetch`, `axios`, `got`. |
| `next` | 16.1.6 (already installed) | Route handler runtime | Already in project. App Router route handler at `src/app/api/webhooks/*/route.ts` is outside `[locale]` so `next-intl` middleware does not apply. |

### Supporting

None. No logger, no DTO library, no validation library needed — handlers are ~50 lines each.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `stripe` npm SDK | Manual HMAC verify of `t=...,v1=...` signature | Saves ~30KB server dep but fragile; Stripe documents the SDK as the supported path. Not worth it. |
| Native `fetch` to Telegram | `node-telegram-bot-api` or `telegraf` npm | Unnecessary deps for a single `sendMessage` call. Both libraries target polling/commands which we don't need. |
| BTCPay raw API calls | A Node BTCPay client library | No officially maintained Node SDK exists for the Greenfield API. The one GET call is trivial; a library adds risk without benefit. |
| Node runtime | Edge runtime | `stripe` SDK historically had Edge compatibility issues; `node:crypto` works on both but `stripe.webhooks.constructEvent` on Edge needs `constructEventAsync` + Web Crypto. Stay on Node to avoid foot-guns. |

**Installation:**

```bash
npm install stripe
```

That is the **only** new runtime dependency.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── api/
│       └── webhooks/
│           ├── stripe/
│           │   └── route.ts         # POST handler — verify signature, dispatch to helper
│           └── btcpay/
│               └── route.ts         # POST handler — HMAC verify, fetch invoice, dispatch
├── lib/
│   └── telegram.ts                  # sendTelegramMessage(text) + escapeMarkdownV2(raw)
└── config/
    └── donate.ts                    # (existing, unchanged)

docs/
├── setup-stripe.md                  # (existing, EXTEND with webhook section)
├── setup-btcpay.md                  # (existing, EXTEND with webhook section)
└── setup-telegram.md                # (NEW — BotFather + getUpdates for chat_id)

.env.example                         # (EXTEND with 4–5 new server env vars)
```

Rationale: `src/lib/` is first file in that folder; all shared server-side utilities should live here going forward. Webhook routes deliberately live outside any `[locale]` segment since `/api/*` is i18n-agnostic.

### Pattern 1: App Router Webhook Route Handler (Node runtime, raw body)

**What:** Minimal POST handler that verifies signature before any other work, returns `200` on success and `400` on verification failure, `200` on downstream errors (best-effort notification semantic).

**When to use:** Both `/api/webhooks/stripe/route.ts` and `/api/webhooks/btcpay/route.ts`.

**Example (Stripe):**

```typescript
// Source: https://docs.stripe.com/webhooks + Next.js 16 App Router docs
import Stripe from "stripe";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";         // explicit — avoid Edge pitfalls
export const dynamic = "force-dynamic";  // never cached, never pre-rendered

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // apiVersion intentionally omitted; SDK pins a default safe version.
});

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET missing");
    return new Response("Misconfigured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await request.text(); // MUST be raw; Stripe SDK accepts string

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(null, { status: 200 }); // silent ignore per CONTEXT
  }

  const session = event.data.object as Stripe.Checkout.Session;
  // ... format + send Telegram (never throw — log + 200 on failure)
  return new Response(null, { status: 200 });
}
```

**Example (BTCPay):**

```typescript
// Source: https://docs.btcpayserver.org/Development/GreenFieldExample-NodeJS/
import crypto from "node:crypto";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.BTCPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[btcpay-webhook] BTCPAY_WEBHOOK_SECRET missing");
    return new Response("Misconfigured", { status: 500 });
  }

  const sig = request.headers.get("btcpay-sig"); // case-insensitive lookup
  if (!sig) return new Response("Missing signature", { status: 400 });

  const rawBody = Buffer.from(await request.arrayBuffer());
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const sigBuf = Buffer.from(sig, "utf8");

  if (
    expectedBuf.length !== sigBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, sigBuf)
  ) {
    return new Response("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(rawBody.toString("utf8"));
  if (payload.type !== "InvoiceSettled") {
    return new Response(null, { status: 200 });
  }

  // Fetch invoice details from BTCPay Greenfield API (amount/currency not in payload)
  // See Open Question #1 — needs BTCPAY_API_KEY
  // ... format + send Telegram
  return new Response(null, { status: 200 });
}
```

### Pattern 2: Telegram Helper with MarkdownV2 Escaping

```typescript
// Source: https://core.telegram.org/bots/api#markdownv2-style
const MD_V2_RESERVED = /[_*[\]()~`>#+\-=|{}.!\\]/g;

export function escapeMarkdownV2(s: string): string {
  return s.replace(MD_V2_RESERVED, (m) => `\\${m}`);
}

export async function sendTelegramMessage(markdownV2Text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing");
    return; // best-effort: don't throw
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: markdownV2Text,
      parse_mode: "MarkdownV2",
      link_preview_options: { is_disabled: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[telegram] sendMessage failed ${res.status} ${body}`);
  }
}
```

**IMPORTANT:** Callers must escape USER-PROVIDED data (amounts, dates) with `escapeMarkdownV2()` but not the Markdown syntax they are intentionally producing (`*bold*`, `[link](url)`). Inside link URL parens, `)` and `\` need escaping; inside code blocks, `` ` `` and `\` need escaping. For this phase's simple messages (no code blocks, only one link per message), the general escape function plus care around the link URL is sufficient.

### Anti-Patterns to Avoid

- **Parsing JSON before verifying signature.** Once `request.json()` consumes the stream, the raw bytes are gone and re-serialization will differ (whitespace, key order, Unicode). ALWAYS read raw text/bytes first.
- **Using `request.body` or `request.json()` as the first read.** Stream is single-use.
- **Running on Edge runtime with `stripe` SDK.** Historically incompatible; Node runtime avoids all ambiguity.
- **Throwing from the Telegram helper on failure.** Would cause the route to return 5xx → Stripe retries with exponential backoff for up to 3 days and BTCPay retries 6 times → duplicate Telegram spam when the service recovers.
- **Running webhook handlers under the `[locale]` segment.** They live at `src/app/api/webhooks/*` at project root under `src/app/` (sibling to `[locale]`), so `next-intl` middleware has no effect.
- **Forgetting `export const dynamic = 'force-dynamic'`.** Without it, Next 16 may attempt build-time evaluation with empty env vars → build error or worse, stale behavior.
- **Escaping MarkdownV2 syntax you want rendered.** Escaping `*bold*` produces literal `*bold*` text. Only escape the dynamic content that goes INTO the Markdown.
- **Hardcoding `TELEGRAM_CHAT_ID` as a number.** Chat IDs for private chats are positive, for groups negative, for channels start with `-100`. Store as string in env, Telegram API accepts both.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stripe signature verification | Manual HMAC over `t=...,v1=...` signed_payload | `stripe.webhooks.constructEvent()` | Must handle multiple v1 signatures (key rotation), 5-min replay tolerance, `t=` timestamp parsing, and format changes. SDK does all of it. |
| MarkdownV2 escaping | Ad-hoc replacements or partial escape functions | Single regex over the 19 reserved chars (`_*[]()~\`>#+-=\|{}.!\\`) | Missing even one char (typically `.` or `-`) breaks every message with a decimal amount or ISO date. |
| Timing-safe HMAC comparison | `===` or `Buffer.compare` | `crypto.timingSafeEqual` | String `===` leaks timing info enabling signature oracle attacks. |
| Retry / backoff for Telegram | Custom queue, retry-after handling | Just log + 200 | Phase scope is best-effort single attempt. Stripe/BTCPay already retry. Adding our own retry causes N-way amplification. |

**Key insight:** All three integrations (Stripe, BTCPay, Telegram) have enough edge cases (signature formats, retry semantics, rate limits, escape rules) that any custom reimplementation is a latent bug. Use the documented patterns verbatim.

## Common Pitfalls

### Pitfall 1: BTCPay webhook payload missing amount/currency
**What goes wrong:** HOOK-03 requires "amount and currency in the Telegram message" but `InvoiceSettled` JSON only contains `{ deliveryId, webhookId, originalDeliveryId, isRedelivery, type, timestamp, storeId, invoiceId, metadata, manuallyMarked, overPaid }`. No `amount`, no `currency`, no `btcPaid`.
**Why it happens:** BTCPay webhooks are reference notifications, not full state snapshots. Event types like `InvoiceReceivedPayment` DO include a `payment` sub-object, but `InvoiceSettled` does not.
**How to avoid:** After verifying the webhook, call `GET /api/v1/stores/{storeId}/invoices/{invoiceId}` with `Authorization: token {BTCPAY_API_KEY}`. Response contains `amount` (string, fiat), `currency` (e.g. "EUR"), plus a `paymentMethods` array with per-method amounts (BTC on-chain, BTC-LightningNetwork). Extract BTC equivalent from there.
**Warning signs:** Planner trying to read `payload.amount` will produce `undefined` — surfaces at integration test time with `stripe listen`–equivalent "Send test webhook" button in BTCPay UI.

### Pitfall 2: MarkdownV2 escape misses ruin every message with a decimal
**What goes wrong:** Telegram returns 400 `{"ok":false,"error_code":400,"description":"Bad Request: can't parse entities: Character '.' is reserved..."}` for any message containing `25.00` or an ISO date like `2026-04-16`.
**Why it happens:** MarkdownV2 has 18 reserved characters — `_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!` — plus `\` itself. Inline link URL parens and code blocks have different rules.
**How to avoid:** Apply the escape regex to EVERY piece of dynamic content before inserting into a template. Keep the Markdown syntax itself (`*`, `[]()`) out of the escape. Inside `[text](url)`, escape `)` and `\` in the URL separately.
**Warning signs:** First test with any amount containing a decimal will fail. Always test with a sample string containing `.` `-` `_` before shipping.

### Pitfall 3: Consuming the request body too early
**What goes wrong:** `await request.json()` before verifying breaks both Stripe (re-serialized JSON has different bytes → signature mismatch) and BTCPay (HMAC is over raw bytes).
**Why it happens:** Stream body can only be read once. Re-serializing `JSON.stringify(parsed)` produces different whitespace / key order / Unicode escaping.
**How to avoid:** Always `const raw = await request.text()` (Stripe) or `Buffer.from(await request.arrayBuffer())` (BTCPay) FIRST, verify, THEN `JSON.parse(raw)`.
**Warning signs:** All requests return 400 "invalid signature" in staging even though secret matches.

### Pitfall 4: Stripe CLI local testing uses a DIFFERENT webhook secret
**What goes wrong:** Developer puts the production dashboard webhook secret in `.env.local`, runs `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, and every forwarded event returns 400.
**Why it happens:** `stripe listen` generates a fresh ephemeral `whsec_...` that is different from dashboard endpoints and rotates on each run.
**How to avoid:** Document in `docs/setup-stripe.md`: "when developing locally, copy the `whsec_...` printed by `stripe listen` into `STRIPE_WEBHOOK_SECRET` in `.env.local` — production uses a separate secret from the Stripe Dashboard webhook configuration."
**Warning signs:** Local 400s but production works, or vice versa.

### Pitfall 5: Next.js middleware intercepting webhook routes
**What goes wrong:** Global middleware (Clerk, NextAuth, or even `next-intl`'s middleware) runs on `/api/webhooks/*` and returns 401/307 before the handler runs.
**Why it happens:** Middleware default matcher `'/((?!_next/static|_next/image|favicon.ico).*)'` matches API routes unless explicitly excluded.
**How to avoid:** In this repo, `next-intl` middleware is scoped to `[locale]` routes via the routing configuration and does not match `/api/*` — confirmed by inspecting `src/proxy.ts` and `src/i18n/`. Still, explicitly add `/api/webhooks/:path*` to any negative-lookahead matcher to be defensive against future middleware additions.
**Warning signs:** 307 redirects to a locale-prefixed path, or 401 with no body.

### Pitfall 6: Telegram `chat_id` retrieval requires message history
**What goes wrong:** User creates the bot, copies the token, but there's no `chat_id` to put in env.
**Why it happens:** `getUpdates` returns chats only for messages the bot has received. Bot must be added to the target chat AND receive at least one message first.
**How to avoid:** `docs/setup-telegram.md` instructs: (1) BotFather → create bot → copy token, (2) Open chat with bot (or add to group) → send "/start" or any message, (3) Visit `https://api.telegram.org/bot{TOKEN}/getUpdates` in browser → copy `result[0].message.chat.id`.
**Warning signs:** `getUpdates` returns `{"ok":true,"result":[]}`.

### Pitfall 7: stripe.webhooks.constructEvent throws on clock skew
**What goes wrong:** Vercel server clock drifts > 5 min (rare but possible during cold starts across regions) → "Timestamp outside the tolerance zone" error.
**Why it happens:** SDK enforces 5-minute replay window by default.
**How to avoid:** Accept the default. Vercel NTP sync is reliable; do not lower to 0 (disables freshness entirely per Stripe warning).
**Warning signs:** Intermittent 400s with "tolerance zone" in log.

## Code Examples

Verified patterns from official sources:

### Stripe `stripe listen` local forwarding

```bash
# In a separate terminal while running `npm run dev`:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Output:
# > Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
# Copy whsec_abc123... into .env.local as STRIPE_WEBHOOK_SECRET

# In yet another terminal, trigger a real signed event:
stripe trigger checkout.session.completed
```

Source: https://docs.stripe.com/webhooks#test-webhook

### BTCPay webhook HMAC verification (Node)

```javascript
// Source: https://docs.btcpayserver.org/Development/GreenFieldExample-NodeJS/
const sigHashAlg = 'sha256';
const sigHeaderName = 'BTCPAY-SIG';
const checksum = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
const hmac = crypto.createHmac(sigHashAlg, webhookSecret);
const digest = Buffer.from(
  sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'),
  'utf8'
);

if (
  checksum.length !== digest.length ||
  !crypto.timingSafeEqual(digest, checksum)
) {
  // Verification failed
} else {
  // Verification passed
}
```

### BTCPay Greenfield: fetch invoice after webhook

```typescript
// Source: https://docs.btcpayserver.org/API/Greenfield/v1/ + php example
const invoice = await fetch(
  `${process.env.BTCPAY_SERVER_URL}/api/v1/stores/${storeId}/invoices/${invoiceId}`,
  { headers: { Authorization: `token ${process.env.BTCPAY_API_KEY}` } }
).then(r => r.json());

// invoice.amount      → "25.00" (string, fiat)
// invoice.currency    → "EUR"
// invoice.paymentMethods[] → array of {paymentMethod, amount, rate, cryptoCode, ...}
//   find entry where cryptoCode === "BTC" for on-chain, or "BTC-LightningNetwork"
```

### Telegram sendMessage with MarkdownV2

```javascript
// Source: https://core.telegram.org/bots/api#sendmessage
await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text: '✨ *New contribution*\n\n💳 Method: Stripe\n💰 Amount: 25\\.00 EUR',
    parse_mode: 'MarkdownV2',
    link_preview_options: { is_disabled: true }
  })
});
// Note the escaped `.` in 25\.00
```

### Complete MarkdownV2 escape list

```typescript
// Source: https://core.telegram.org/bots/api#markdownv2-style
// 18 characters + backslash itself = 19 chars requiring escape in general context
const MD_V2_SPECIAL = ['_','*','[',']','(',')','~','`','>','#','+','-','=','|','{','}','.','!','\\'];
// Regex form (escape meta-chars within the char class):
const RE = /[_*[\]()~`>#+\-=|{}.!\\]/g;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `pages/api/*.ts` + `export const config = { api: { bodyParser: false } }` | App Router `app/api/*/route.ts` + `await request.text()` | Next.js 13.4 (App Router GA), canonical by Next.js 14–16 | Simpler; no bodyParser config needed because Request is Web-standard Fetch |
| Manual HMAC verification of Stripe signature | `stripe.webhooks.constructEvent()` | Official since stripe-node 8.x | Handles multi-sig key rotation + tolerance automatically |
| `node-fetch` for HTTP calls | Native `fetch` | Node 18+ (LTS since 2022) | Zero deps; identical API |
| Markdown (legacy) | MarkdownV2 | Telegram Bot API 4.5 (2019) | Stricter but consistent escape rules; legacy Markdown is deprecated in new bots |
| Basic parse_mode `HTML` | MarkdownV2 (our choice) | User-decided in CONTEXT.md | Either works; HTML has simpler escape (only `<`, `>`, `&`) and might be worth mentioning as a cleaner fallback — see Open Question #2 |

**Deprecated/outdated:**
- `parse_mode: "Markdown"` (legacy, not V2) — do not use; Telegram recommends MarkdownV2 or HTML
- `node-fetch` — unnecessary in Node 22
- Pages Router `pages/api/webhooks/*` — project is already App Router

## Open Questions

1. **BTCPay_API_KEY is required but not in HOOK-04's env var list**
   - What we know: `InvoiceSettled` payload has only `invoiceId`; amount/currency require GET `/api/v1/stores/{storeId}/invoices/{invoiceId}` with `Authorization: token {api_key}`. API key needs "View invoices" permission (`btcpay.store.canviewinvoices`).
   - What's unclear: CONTEXT.md lists only 4 env vars; HOOK-04 acceptance criterion references those 4. A 5th (`BTCPAY_API_KEY`) is functionally required to meet HOOK-03 (amount + currency in message).
   - Recommendation: Plan adds `BTCPAY_API_KEY` to `.env.example` and `docs/setup-btcpay.md`, treats it as within the "Claude's discretion: Env var naming details beyond the 4 already committed in HOOK-04" escape hatch. Alternative: skip the amount field for Bitcoin notifications and send only a link — but this contradicts HOOK-03. First option is strongly recommended.

2. **Should we use MarkdownV2 or HTML parse_mode?**
   - What we know: CONTEXT locks MarkdownV2. HTML is simpler (3 chars to escape vs 19).
   - What's unclear: Whether the user explicitly weighed this tradeoff.
   - Recommendation: Honor CONTEXT (MarkdownV2). It's a locked decision. The escape regex is one line, not a real pain point once written.

3. **`apiVersion` to pin on `new Stripe()`?**
   - What we know: stripe-node v22 pins `2026-03-25.dahlia` by default. Omitting the option uses that default.
   - What's unclear: Whether to explicitly pin for forward compatibility.
   - Recommendation: Omit `apiVersion` — SDK default is safe. Pin only if webhook payload shape issues arise.

4. **Idempotency / duplicate delivery handling**
   - What we know: Stripe retries on non-2xx up to 3 days; BTCPay retries 6 times. Both webhooks CAN redeliver the same event (e.g., if our Telegram call times out and we mistakenly return 5xx). CONTEXT says "always 200 on Telegram failure" which neutralizes the retry → no duplicates in normal operation. However, manual redeliveries from Stripe Dashboard / BTCPay UI WILL fire duplicate notifications.
   - Recommendation: Accept the duplicate-on-manual-redeliver behavior. Log `event.id` (Stripe) and `deliveryId` (BTCPay) in success console.log so duplicates are traceable. No dedup store per CONTEXT ("idempotency store deferred").

## Validation Architecture

> Note: project config has `workflow.nyquist_validation: true`. Including this section per spec. However, CONTEXT.md explicitly states "No automated tests added for this phase." That is a user decision — validation here is **manual + lint/typecheck only**.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed. Project uses `next lint` (ESLint 9) and `tsc --noEmit` via `next build`. No Jest, Vitest, or Playwright. |
| Config file | `eslint.config.*` (existing), `tsconfig.json` (existing), no test config |
| Quick run command | `npm run lint` |
| Full suite command | `npm run build` (includes typecheck) + manual `stripe trigger checkout.session.completed` + BTCPay "Send test webhook" button |
| Phase gate | `npm run build` green + both provider test webhooks produce Telegram messages in the target chat |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOOK-01 | `/api/webhooks/stripe` verifies signature and sends Telegram msg | manual-only | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` + `stripe trigger checkout.session.completed` | N/A |
| HOOK-02 | `/api/webhooks/btcpay` verifies HMAC and sends Telegram msg | manual-only | BTCPay dashboard → Store → Webhooks → "Send test webhook" with InvoiceSettled | N/A |
| HOOK-01/02 (negative) | Invalid signature → 400 | manual-only | `curl -X POST http://localhost:3000/api/webhooks/stripe -H "stripe-signature: bogus" -d '{}'` → expect `400` | N/A |
| HOOK-03 | Telegram messages formatted with method, amount, date | manual-only | Inspect the Telegram chat after each of the two manual triggers above | N/A |
| HOOK-04 | Env vars documented | automated (static) | `grep -E '^(TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID\|STRIPE_WEBHOOK_SECRET\|BTCPAY_WEBHOOK_SECRET)=' .env.example` → all 4 present | `.env.example` (existing) |
| HOOK-04 | Setup guides updated | automated (static) | `grep -l 'STRIPE_WEBHOOK_SECRET' docs/setup-stripe.md && grep -l 'BTCPAY_WEBHOOK_SECRET' docs/setup-btcpay.md && test -f docs/setup-telegram.md` | 2 existing, 1 new |

**Justification for manual-only on HOOK-01/02/03:** Automated tests would require (a) mocking Stripe's signature scheme (possible with test keys but adds dep), (b) a mock BTCPay server (no existing infra), (c) a Telegram test chat or mocked fetch (adds dep). CONTEXT explicitly defers this — signing fixture tests are listed under "Deferred Ideas." The Stripe CLI + BTCPay UI provide zero-cost manual validation that exercises the real signature path.

### Sampling Rate

- **Per task commit:** `npm run lint` (fast, no external deps)
- **Per wave merge:** `npm run build` (catches TS errors)
- **Phase gate:** Full build + both manual webhook triggers result in Telegram messages in target chat with correct format
- **Validation scope:** Endpoint-level (HTTP status + side effect), not unit level

### Wave 0 Gaps

- [ ] No test framework install — by design per CONTEXT (no automated tests)
- [ ] `.env.example` entry additions (will be added in the implementation wave, not a gap per se)
- [ ] Manual test runbook entries in `docs/setup-stripe.md` and `docs/setup-btcpay.md` (explicit phase deliverable)

*(Effectively zero traditional Wave 0 scaffolding: the "tests" here are manual provider-side tools + build/lint.)*

## Sources

### Primary (HIGH confidence)

- **Stripe Webhooks Official Documentation** — https://docs.stripe.com/webhooks — signature format (`t=,v1=`), `constructEvent` usage, 5-min replay tolerance, retry semantics (up to 3 days on non-2xx)
- **Stripe Node SDK README** — https://github.com/stripe/stripe-node — `new Stripe(secret, { apiVersion })` init pattern, raw body parameter accepts string or Buffer
- **Stripe Checkout Session object fields** — https://docs.stripe.com/api/checkout/sessions/object — `id`, `amount_total`, `currency`, `payment_intent`, `payment_status`, `mode`, `created`
- **BTCPay Greenfield API Node.js example** — https://docs.btcpayserver.org/Development/GreenFieldExample-NodeJS/ — exact HMAC verification code (`BTCPAY-SIG` header, `sha256=hex` format, `timingSafeEqual`)
- **BTCPay PHP webhook example** — https://github.com/btcpayserver/btcpayserver-greenfield-php/blob/master/examples/webhook.php — confirms `InvoiceSettled` requires secondary API fetch for amount
- **BTCPay eCommerce Integration Guide** — https://docs.btcpayserver.org/Development/ecommerce-integration-guide/ — event type list (InvoiceCreated, InvoiceReceivedPayment, InvoicePaymentSettled, InvoiceProcessing, InvoiceExpired, InvoiceSettled, InvoiceInvalid), retry schedule (10s, 1min, 6×10min), manual redelivery
- **Telegram Bot API — sendMessage** — https://core.telegram.org/bots/api#sendmessage — endpoint URL, required params, MarkdownV2 existence
- **Telegram Bot API — MarkdownV2 style** — https://core.telegram.org/bots/api#markdownv2-style — complete escape character list verified via telegraf issue #1242 (GitHub)
- **Telegram Bot FAQ — rate limits** — https://core.telegram.org/bots/faq — 1 msg/sec per chat, 30 msg/sec overall, 20 msg/min to groups
- **Next.js 16 route.js conventions** — https://nextjs.org/docs/app/api-reference/file-conventions/route — runtime export, dynamic export, Request/Response signatures

### Secondary (MEDIUM confidence)

- **dys2p/btcpay Go package** — https://pkg.go.dev/github.com/dys2p/btcpay — full `InvoiceEvent` struct with JSON tags (DeliveryID, WebhookID, OriginalDeliveryID, IsRedelivery, Timestamp as int64, ManuallyMarked, OverPaid, AfterExpiration, PaymentMethodID, Payment sub-struct). Confirms Go community mapping of BTCPay's schema — used because official OpenAPI schema was not fully accessible.
- **Max Karlsson blog on Stripe + Next.js** — https://maxkarlsson.dev/blog/verify-stripe-webhook-signature-in-next-js-api-routes — corroborates `await request.text()` pattern
- **Next.js 16 webhook handler pattern** — https://dev.to/huangyongshan46a11y/nextjs-16-webhook-handler-pattern-stripe-github-and-more-2bgh — modern runtime config + arrayBuffer pattern

### Tertiary (LOW confidence)

- None. All claims in this RESEARCH.md are backed by at least one HIGH or MEDIUM source.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `stripe` npm package, `node:crypto`, native `fetch` are all well-documented and currently installed in similar production setups
- Architecture (route handler pattern, lib/ helper): HIGH — official Next.js 16 docs + Stripe docs align
- Pitfalls: HIGH — BTCPay payload gap confirmed by multiple official sources (Node.js example, PHP example, Go library). Telegram MarkdownV2 escape list cross-verified across Telegram official docs + telegraf GitHub issue #1242 + Python community guides.
- BTCPay InvoiceSettled payload shape: HIGH — triangulated from PHP example (fetches invoice via API), Go struct definition (no amount/currency field), official eCommerce guide (only mentions `invoiceId` as payload field)
- Rate limits: HIGH — Telegram FAQ is canonical
- `apiVersion` default: MEDIUM — stripe-node version at research time is v22.0.1 with default `2026-03-25.dahlia`; this WILL advance before deploy, but omitting the option means SDK default is used which is safe

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (30 days — APIs are stable, but `stripe` npm version advances ~weekly; re-check major version before install)

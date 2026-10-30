# `POST /api/feedback` contract

The iOS app's feedback form (getdictus/dictus-ios#565) posts to
`https://getdictus.com/api/feedback`. The route relays it to a dedicated
Telegram chat. This page is the contract the app implements; the code is
`src/lib/feedback.ts`, the tests `scripts/feedback.test.mjs`.

## Request

- `POST` only, `Content-Type: application/json` (`; charset=utf-8` allowed, any other charset refused).
- Body: one UTF-8 JSON object, at most **2 MiB (2,097,152 bytes) on the wire**. Encode with
  `.withoutEscapingSlashes` so a 1 MB log stays well under the cap.
- No authentication header: a secret shipped in the app would be extractable. App Attest may come later.
- Lengths in characters are counted in **Unicode scalars** (Swift `unicodeScalars.count`), not graphemes.

| Field | Type | Required | Rule |
|---|---|---|---|
| `type` | string | yes | `bug`, `idea`, `other` or `autoReturn` |
| `name` | string | yes | trimmed, 1 to 100 characters, no control characters |
| `email` | string | no | trimmed; `""` means absent; otherwise `x@y.z`-shaped, ≤ 254 characters |
| `message` | string | yes, except `autoReturn` | ≤ 4,000 characters; whitespace-only counts as absent; tab, LF and CR are the only control characters allowed |
| `appVersion` | string | yes | `[0-9A-Za-z._+-]`, 1 to 32 |
| `build` | string | yes | `[0-9A-Za-z._-]`, 1 to 32 |
| `gitRevision` | string | yes | `[0-9A-Za-z._+-]`, 1 to 64 |
| `iosVersion` | string | yes | `[0-9A-Za-z .()_+-]`, 1 to 64 |
| `deviceModel` | string | yes | `[0-9A-Za-z ,._()+-]`, 1 to 64 (e.g. `iPhone16,1`) |
| `locale` | string | yes | `Locale.current.identifier` shape: `fr`, `fr-FR`, `fr_FR`, `zh-Hans_CN`, `en_FR@rg=frzzzz`; ≤ 64 |
| `log` | string | no | `PersistentLog.exportContent()`, ≤ 1,572,864 bytes UTF-8; `""` means absent |
| `bundleIds` | array of strings | no, `autoReturn` only | ≤ 50 items, each ≤ 255 characters, reverse-DNS (`[A-Za-z0-9_-]` segments, at least one dot); `[]` means absent |

Anything else is refused with `400`: an unknown key, a wrong type (a number, an
array or an object where a string is expected), `bundleIds` on a type other
than `autoReturn`, or one invalid bundle ID (filter them in the app).

**Decision for `autoReturn`:** at least one of a non-empty `bundleIds` or a
non-empty `message` is required, otherwise there is nothing to act on
(`{"field":"bundleIds","reason":"missing"}`).

## Responses

All bodies are JSON with `Cache-Control: no-store`. No CORS headers.

| Status | Body | When |
|---|---|---|
| `200` | `{"ok":true}` | Telegram accepted every message and the log |
| `400` | `{"ok":false,"error":"invalid_json"}` | not UTF-8 or not JSON |
| `400` | `{"ok":false,"error":"invalid_payload","fields":[{"field":"name","reason":"too_long"}]}` | validation; `reason` is `missing`, `wrong_type`, `too_long`, `too_many`, `invalid`, `unknown_field` or `not_allowed`. Values are never echoed. A non-object body gives `field: "body"`. |
| `405` | `{"ok":false,"error":"method_not_allowed"}` + `Allow: POST` | any method but POST |
| `413` | `{"ok":false,"error":"payload_too_large"}` | `Content-Length` or the streamed body over 2 MiB |
| `415` | `{"ok":false,"error":"unsupported_media_type"}` | not `application/json` |
| `429` | `{"ok":false,"error":"rate_limited"}` + `Retry-After: <seconds>` | over the limit below |
| `502` | `{"ok":false,"error":"upstream_failed"}` | Telegram refused, failed or took over 10 s |
| `503` | `{"ok":false,"error":"not_configured"}` | the server's Telegram settings are missing |

Checks run in that order: rate limit, `415`, `413`, `400`, `503`, Telegram. Every
request counts toward the rate limit, invalid ones included.

**App behaviour:** on `200` the feedback is delivered. On `429`, `502`, `503` or a
network error, keep the text and offer Retry and the share sheet. A `502` can
arrive after the text message went through but the log upload failed, so a
retry may post the message twice: accepted, a duplicate is better than a lost
log. `400`, `413` and `415` are app bugs: do not retry unchanged.

## Rate limit

5 requests per IP per 10 minutes, and 60 per 10 minutes for the whole server
instance. In memory, per serverless instance: it resets on a cold start and is
not shared across instances or regions, so it is best-effort. A Vercel
Firewall rate-limit rule or App Attest would be the stronger options.

## Telegram

- Sent to `TELEGRAM_FEEDBACK_CHAT_ID` with the existing `TELEGRAM_BOT_TOKEN`, never to the payments chat (`TELEGRAM_CHAT_ID`).
- MarkdownV2, every user value escaped, link previews off. Header
  `🐞 *Bug* · 1.9.0 (36) · iPhone16,1 · iOS 27.0` (💡 Idea, 💬 Other, ↩️ Auto-return), then name, email, locale,
  revision, the message and, for `autoReturn`, the bundle IDs.
- Over 4,096 characters, the text is split into several messages, in order, at line breaks when possible.
- The log is uploaded with `sendDocument` as `dictus-log-<build>-<YYYY-MM-DD>.txt` (UTC date), replying to the first message.
- The server logs only a category and a status (`[feedback] telegram sendMessage failed http 400`): no names,
  emails, messages, logs, IPs or token.

## Maintainer setup

1. Create a Telegram group for feedback, separate from the payment notifications, and add the existing bot.
2. Send a message in it and read its id from `https://api.telegram.org/bot<TOKEN>/getUpdates` (negative for a group), as in `docs/setup-telegram.md`.
3. Set `TELEGRAM_FEEDBACK_CHAT_ID` in Vercel for Production and Preview. `TELEGRAM_BOT_TOKEN` must be set in both too.

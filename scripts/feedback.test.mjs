// Checks POST /api/feedback (src/lib/feedback.ts, contract in
// docs/feedback-api.md) with a mocked fetch: nothing here calls Telegram.
//
// Run with `npm run test:feedback` (Node 22.18+ strips the TypeScript types).
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  MAX_BODY_BYTES,
  MAX_LOG_BYTES,
  TELEGRAM_TEXT_LIMIT,
  createRateLimiter,
  handleFeedbackPost,
  methodNotAllowed,
  renderFeedback,
} from "../src/lib/feedback.ts";
import * as telegram from "../src/lib/telegram.ts";

const TOKEN = "123456:SECRET-bot-token";
const FEEDBACK_CHAT = "-100feedback";
const PAYMENTS_CHAT = "-100payments";
const IP = "203.0.113.77";
const NAME = "Zoé Pseudonyme";
const EMAIL = "zoe.secret@example.org";
const MESSAGE = "The keyboard froze in Notes after dictating a long sentence.";

const valid = (overrides = {}) => ({
  type: "bug",
  name: NAME,
  email: EMAIL,
  message: MESSAGE,
  appVersion: "1.9.0",
  build: "36",
  gitRevision: "db8a816",
  iosVersion: "27.0",
  deviceModel: "iPhone16,1",
  locale: "fr_FR",
  ...overrides,
});

let calls;
let fetchImpl;
let logged;
const originalFetch = globalThis.fetch;
const originalConsole = { log: console.log, error: console.error, warn: console.warn, info: console.info };

beforeEach(() => {
  calls = [];
  logged = [];
  let nextId = 100;
  fetchImpl = async () => Response.json({ ok: true, result: { message_id: nextId++ } });
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return fetchImpl(url, init);
  };
  for (const level of Object.keys(originalConsole)) {
    console[level] = (...args) => logged.push(args.map(String).join(" "));
  }
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  Object.assign(console, originalConsole);
  // No console line may carry personal data or the token, whatever the test did.
  for (const line of logged) {
    for (const secret of [TOKEN, NAME, EMAIL, MESSAGE, IP, "Zoé", "zoe.secret"]) {
      assert.ok(!line.includes(secret), `console output leaked ${secret}: ${line}`);
    }
  }
});

function deps(overrides = {}) {
  return {
    env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_FEEDBACK_CHAT_ID: FEEDBACK_CHAT, TELEGRAM_CHAT_ID: PAYMENTS_CHAT },
    telegram,
    limiter: createRateLimiter(),
    now: () => Date.UTC(2026, 9, 26, 12, 0, 0),
    ...overrides,
  };
}

function post(body, { contentType = "application/json", headers = {} } = {}) {
  return new Request("https://getdictus.com/api/feedback", {
    method: "POST",
    headers: { "content-type": contentType, "x-forwarded-for": `${IP}, 10.0.0.1`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function send(body, options, d = deps()) {
  const res = await handleFeedbackPost(post(body, options), d);
  return { res, json: await res.json() };
}

async function expectFieldError(body, field, reason) {
  const { res, json } = await send(body);
  assert.equal(res.status, 400);
  assert.equal(json.error, "invalid_payload");
  assert.ok(
    json.fields.some((e) => e.field === field && e.reason === reason),
    `expected ${field}/${reason}, got ${JSON.stringify(json.fields)}`,
  );
  assert.equal(calls.length, 0, "an invalid payload must never reach Telegram");
  return json;
}

const sentText = (call) => JSON.parse(call.init.body).text;

test("every other method answers 405 with Allow: POST", async () => {
  const res = methodNotAllowed();
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("allow"), "POST");
  assert.equal(res.headers.get("access-control-allow-origin"), null);
});

test("415 unless the body is declared as UTF-8 JSON", async () => {
  for (const contentType of ["text/plain", "application/x-www-form-urlencoded", "application/json; charset=latin1"]) {
    const { res } = await send(valid(), { contentType });
    assert.equal(res.status, 415, contentType);
  }
  const { res } = await send(valid(), { contentType: "application/json; charset=utf-8" });
  assert.equal(res.status, 200);
});

test("413 from Content-Length, before reading the body", async () => {
  const { res } = await send(valid(), { headers: { "content-length": String(MAX_BODY_BYTES + 1) } });
  assert.equal(res.status, 413);
  assert.equal(calls.length, 0);
});

test("413 from a streamed body without Content-Length", async () => {
  const chunk = new Uint8Array(256 * 1024).fill(0x61);
  let pushed = 0;
  const body = new ReadableStream({
    pull(controller) {
      if (pushed > MAX_BODY_BYTES) return controller.close();
      pushed += chunk.byteLength;
      controller.enqueue(chunk);
    },
  });
  const request = new Request("https://getdictus.com/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    duplex: "half",
  });
  assert.equal(request.headers.get("content-length"), null);
  const res = await handleFeedbackPost(request, deps());
  assert.equal(res.status, 413);
  assert.equal(calls.length, 0);
});

test("400 on invalid JSON and on a non-object body", async () => {
  for (const body of ["{", "", "not json"]) {
    const { res, json } = await send(body);
    assert.equal(res.status, 400);
    assert.equal(json.error, "invalid_json");
  }
  await expectFieldError("[1,2]", "body", "wrong_type");
  await expectFieldError("null", "body", "wrong_type");
});

test("each required field is required", async () => {
  for (const field of ["type", "name", "message", "appVersion", "build", "gitRevision", "iosVersion", "deviceModel", "locale"]) {
    const body = valid();
    delete body[field];
    await expectFieldError(body, field, "missing");
  }
  await expectFieldError(valid({ name: "   " }), "name", "missing");
  await expectFieldError(valid({ message: " \n " }), "message", "missing");
});

test("field errors never echo submitted values", async () => {
  const json = await expectFieldError(valid({ name: 42, email: "nope-secret-value", extra: "x" }), "name", "wrong_type");
  assert.ok(!JSON.stringify(json).includes("nope-secret-value"));
  assert.deepEqual(Object.keys(json.fields[0]).sort(), ["field", "reason"]);
});

test("caps: name, message, log, bundleIds", async () => {
  await expectFieldError(valid({ name: "n".repeat(101) }), "name", "too_long");
  assert.equal((await send(valid({ name: "n".repeat(100) }))).res.status, 200);
  calls = [];
  await expectFieldError(valid({ message: "m".repeat(4001) }), "message", "too_long");
  await expectFieldError(valid({ log: "é".repeat(MAX_LOG_BYTES / 2 + 1) }), "log", "too_long");
  const ids = Array.from({ length: 51 }, (_, i) => `com.example.app${i}`);
  await expectFieldError(valid({ type: "autoReturn", bundleIds: ids }), "bundleIds", "too_many");
  await expectFieldError(valid({ type: "autoReturn", bundleIds: [`com.${"a".repeat(252)}`] }), "bundleIds", "too_long");
  await expectFieldError(valid({ type: "autoReturn", bundleIds: ["com.example/../x"] }), "bundleIds", "invalid");
  await expectFieldError(valid({ build: "3".repeat(33) }), "build", "invalid");
});

test("unknown keys, wrong types and nesting are refused", async () => {
  await expectFieldError(valid({ extra: "x" }), "extra", "unknown_field");
  await expectFieldError(valid({ type: "praise" }), "type", "invalid");
  await expectFieldError(valid({ message: { text: "nested" } }), "message", "wrong_type");
  await expectFieldError(valid({ appVersion: ["1.9.0"] }), "appVersion", "wrong_type");
  await expectFieldError(valid({ type: "autoReturn", bundleIds: [["com.a.b"]] }), "bundleIds", "wrong_type");
  await expectFieldError(valid({ type: "autoReturn", bundleIds: "com.a.b" }), "bundleIds", "wrong_type");
  await expectFieldError(valid({ name: "a\u0000b" }), "name", "invalid");
});

test("bundleIds only with autoReturn, and autoReturn needs something to act on", async () => {
  await expectFieldError(valid({ bundleIds: ["com.example.app"] }), "bundleIds", "not_allowed");
  await expectFieldError(valid({ type: "autoReturn", message: undefined }), "bundleIds", "missing");
  await expectFieldError(valid({ type: "autoReturn", message: "", bundleIds: [] }), "bundleIds", "missing");
  assert.equal((await send(valid({ type: "autoReturn", message: undefined, bundleIds: ["com.example.app"] }))).res.status, 200);
  assert.equal((await send(valid({ type: "autoReturn", message: "Please add Bear" }))).res.status, 200);
});

test("email: optional, empty means absent, otherwise plausible and <= 254", async () => {
  await expectFieldError(valid({ email: "not-an-email" }), "email", "invalid");
  await expectFieldError(valid({ email: "a@b" }), "email", "invalid");
  await expectFieldError(valid({ email: `${"a".repeat(250)}@b.fr` }), "email", "too_long");
  await expectFieldError(valid({ email: 5 }), "email", "wrong_type");
  const { res } = await send(valid({ email: "" }));
  assert.equal(res.status, 200);
  assert.ok(!sentText(calls[0]).includes("Email"));
});

test("locale accepts Apple and BCP-47 identifiers only", async () => {
  for (const locale of ["fr", "fr-FR", "fr_FR", "en_US", "zh-Hans_CN", "en_FR@rg=frzzzz"]) {
    calls = [];
    assert.equal((await send(valid({ locale }))).res.status, 200, locale);
  }
  for (const locale of ["f", "french!", "fr FR", "<script>", "x".repeat(65)]) {
    calls = [];
    await expectFieldError(valid({ locale }), "locale", "invalid");
  }
});

test("429 with Retry-After after 5 requests per IP, then recovery after the window", async () => {
  let now = Date.UTC(2026, 9, 26, 12, 0, 0);
  const d = deps({ now: () => now });
  for (let i = 0; i < 5; i++) assert.equal((await send(valid(), undefined, d)).res.status, 200);
  calls = [];
  const { res, json } = await send(valid(), undefined, d);
  assert.equal(res.status, 429);
  assert.equal(json.error, "rate_limited");
  assert.equal(res.headers.get("retry-after"), "600");
  assert.equal(calls.length, 0);
  // Another IP is not affected.
  assert.equal((await send(valid(), { headers: { "x-forwarded-for": "198.51.100.1" } }, d)).res.status, 200);
  now += 4 * 60 * 1000;
  assert.equal((await send(valid(), undefined, d)).res.headers.get("retry-after"), "360");
  now += 6 * 60 * 1000;
  assert.equal((await send(valid(), undefined, d)).res.status, 200);
});

test("rate limiter: invalid requests count, the global cap holds, the map stays bounded", async () => {
  const d = deps();
  for (let i = 0; i < 5; i++) assert.equal((await send("{", undefined, d)).res.status, 400);
  assert.equal((await send(valid(), undefined, d)).res.status, 429);

  const limiter = createRateLimiter({ limit: 5, globalLimit: 3, windowMs: 1000, maxEntries: 2 });
  assert.equal(limiter.check("a", 0).ok, true);
  assert.equal(limiter.check("b", 0).ok, true);
  assert.equal(limiter.check("c", 0).ok, true);
  assert.equal(limiter.size, 2, "oldest entry evicted at the cap");
  const blocked = limiter.check("d", 500);
  assert.deepEqual(blocked, { ok: false, retryAfterSeconds: 1 });
  assert.equal(limiter.check("e", 1000).ok, true, "global window reset");
  assert.ok(limiter.size <= 2);
});

test("x-real-ip is used when x-forwarded-for is absent", async () => {
  const d = deps({ limiter: createRateLimiter({ limit: 1 }) });
  const headers = { "x-forwarded-for": "", "x-real-ip": "192.0.2.9" };
  assert.equal((await send(valid(), { headers }, d)).res.status, 200);
  assert.equal((await send(valid(), { headers }, d)).res.status, 429);
});

test("503 when the feedback chat is not configured, and nothing is sent", async () => {
  for (const env of [{ TELEGRAM_BOT_TOKEN: TOKEN }, { TELEGRAM_FEEDBACK_CHAT_ID: FEEDBACK_CHAT }, { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: PAYMENTS_CHAT }]) {
    const { res, json } = await send(valid(), undefined, deps({ env }));
    assert.equal(res.status, 503);
    assert.equal(json.error, "not_configured");
  }
  assert.equal(calls.length, 0);
  // Validation comes first: an invalid payload is a 400 even without env.
  assert.equal((await send(valid({ name: "" }), undefined, deps({ env: {} }))).res.status, 400);
});

test("200 after Telegram accepts: one sendMessage to the feedback chat, escaped MarkdownV2", async () => {
  const tricky = "a_b*c[d]e(f)g~h`i>j#k+l-m=n|o{p}q.r!s\\t";
  const { res, json } = await send(valid({ name: tricky, message: tricky }));
  assert.equal(res.status, 200);
  assert.deepEqual(json, { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `https://api.telegram.org/bot${TOKEN}/sendMessage`);
  const payload = JSON.parse(calls[0].init.body);
  assert.equal(payload.chat_id, FEEDBACK_CHAT);
  assert.equal(payload.parse_mode, "MarkdownV2");
  assert.deepEqual(payload.link_preview_options, { is_disabled: true });
  const escaped = "a\\_b\\*c\\[d\\]e\\(f\\)g\\~h\\`i\\>j\\#k\\+l\\-m\\=n\\|o\\{p\\}q\\.r\\!s\\\\t";
  assert.equal(
    payload.text,
    "\u{1F41E} *Bug* · 1\\.9\\.0 \\(36\\) · iPhone16,1 · iOS 27\\.0\n\n" +
      `Name: ${escaped}\n` +
      "Email: zoe\\.secret@example\\.org\n" +
      "Locale: fr\\_FR\n" +
      "Revision: db8a816\n" +
      `\n${escaped}\n`,
  );
});

test("autoReturn lists the bundle IDs", async () => {
  await send(valid({ type: "autoReturn", message: undefined, bundleIds: ["com.example.app", "net.shinyfrog.bear"] }));
  const text = sentText(calls[0]);
  assert.ok(text.startsWith("↩️ *Auto\\-return* · "));
  assert.ok(text.endsWith("Bundle IDs:\ncom\\.example\\.app\nnet\\.shinyfrog\\.bear\n"));
});

test("long content is split under 4096 characters, in order, with nothing dropped", async () => {
  const message = Array.from({ length: 80 }, (_, i) => `line ${i}: ${"x.".repeat(20)}`).join("\n");
  const ids = Array.from({ length: 50 }, (_, i) => `com.example.${"a".repeat(200)}${i}`);
  await send(valid({ type: "autoReturn", message, bundleIds: ids }));
  assert.ok(calls.length > 1);
  const texts = calls.map(sentText);
  for (const text of texts) assert.ok(text.length <= TELEGRAM_TEXT_LIMIT, `part of ${text.length}`);
  const joined = texts.join("\n").replace(/\\(.)/g, "$1");
  for (const line of message.split("\n")) assert.ok(joined.includes(line), line);
  let last = -1;
  for (const id of ids) {
    const at = joined.indexOf(id);
    assert.ok(at > last, `${id} missing or out of order`);
    last = at;
  }

  // A single line longer than a message is cut between characters, never inside an escape.
  const parts = renderFeedback({ ...valid(), message: ".".repeat(4000) }, telegram.escapeMarkdownV2);
  assert.ok(parts.length >= 2);
  for (const part of parts) {
    assert.ok(part.length <= TELEGRAM_TEXT_LIMIT);
    assert.ok(!/(^|[^\\])(\\\\)*\\$/.test(part), "part ends inside an escape");
  }
  assert.equal(parts.join("").split("\\.").length - 1 >= 4000, true);
});

test("the log is sent as a document replying to the first message", async () => {
  const log = "2026-10-26 [app] launch\n2026-10-26 [keyboard] hostReturn hostId=com.apple.mobilenotes\n";
  const { res } = await send(valid({ log, build: "36" }));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, `https://api.telegram.org/bot${TOKEN}/sendDocument`);
  const form = calls[1].init.body;
  assert.ok(form instanceof FormData);
  assert.equal(form.get("chat_id"), FEEDBACK_CHAT);
  assert.deepEqual(JSON.parse(form.get("reply_parameters")), { message_id: 100 });
  const file = form.get("document");
  assert.equal(file.name, "dictus-log-36-2026-10-26.txt");
  assert.equal(await file.text(), log);
});

test("502 when Telegram refuses, fails or times out", async () => {
  fetchImpl = async () => new Response('{"ok":false,"description":"Bad Request: chat not found"}', { status: 400 });
  let { res, json } = await send(valid());
  assert.equal(res.status, 502);
  assert.deepEqual(json, { ok: false, error: "upstream_failed" });
  assert.ok(logged.includes("[feedback] telegram sendMessage failed http 400"), logged.join("|"));

  fetchImpl = async () => {
    throw new TypeError(`fetch failed for https://api.telegram.org/bot${TOKEN}/sendMessage`);
  };
  ({ res } = await send(valid()));
  assert.equal(res.status, 502);
  assert.ok(logged.includes("[feedback] telegram sendMessage failed network"));

  // AbortSignal.timeout's timer is unref'd: keep the loop alive until it fires.
  fetchImpl = (_url, init) =>
    new Promise((_resolve, reject) => {
      const keepAlive = setTimeout(() => {}, 5000);
      init.signal.addEventListener("abort", () => {
        clearTimeout(keepAlive);
        reject(init.signal.reason);
      });
    });
  ({ res } = await send(valid(), undefined, deps({ timeoutMs: 20 })));
  assert.equal(res.status, 502);
  assert.ok(logged.includes("[feedback] telegram sendMessage failed timeout"));
});

test("502 when the message goes through but the log upload fails", async () => {
  fetchImpl = async (url) =>
    String(url).endsWith("/sendDocument") ? new Response("", { status: 413 }) : Response.json({ ok: true, result: { message_id: 7 } });
  const { res } = await send(valid({ log: "line\n" }));
  assert.equal(res.status, 502);
  assert.equal(calls.length, 2);
  assert.ok(logged.includes("[feedback] telegram sendDocument failed http 413"));
});

test("sendTelegramMessage (payments) still targets TELEGRAM_CHAT_ID", async () => {
  const saved = { ...process.env };
  Object.assign(process.env, { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: PAYMENTS_CHAT, TELEGRAM_FEEDBACK_CHAT_ID: FEEDBACK_CHAT });
  try {
    await telegram.sendTelegramMessage("✨ *New contribution*");
    assert.equal(calls.length, 1);
    assert.equal(JSON.parse(calls[0].init.body).chat_id, PAYMENTS_CHAT);
  } finally {
    for (const key of ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "TELEGRAM_FEEDBACK_CHAT_ID"]) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});

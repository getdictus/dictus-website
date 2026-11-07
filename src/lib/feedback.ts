/**
 * POST /api/feedback: the iOS app's feedback form (getdictus/dictus-ios#565),
 * relayed to a dedicated Telegram chat. The contract is docs/feedback-api.md.
 *
 * Everything the route does lives here so `node --test` can import it
 * (scripts/feedback.test.mjs). This file has no runtime import: under plain
 * Node the `@/` alias does not resolve and extensionless relative imports
 * fail, so the Telegram helpers arrive through `deps` and the route file
 * (src/app/api/feedback/route.ts) only wires them up.
 *
 * Logging: never names, emails, messages, logs, IPs, bodies or the bot token.
 * Only `[feedback]` plus a short category and status.
 */
import type { TelegramSendResult } from "./telegram";

export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_LOG_BYTES = 1_572_864;
export const MAX_NAME = 100;
export const MAX_EMAIL = 254;
export const MAX_MESSAGE = 4000;
export const MAX_BUNDLE_IDS = 50;
export const MAX_BUNDLE_ID = 255;
export const TELEGRAM_TEXT_LIMIT = 4096;
export const TELEGRAM_TIMEOUT_MS = 10_000;

const TYPES = {
  bug: "\u{1F41E} Bug",
  idea: "\u{1F4A1} Idea",
  other: "\u{1F4AC} Other",
  autoReturn: "↩️ Auto-return",
} as const;
type FeedbackType = keyof typeof TYPES;

// Short metadata fields: required, with a conservative charset each.
const SHORT_FIELDS = {
  appVersion: /^[0-9A-Za-z._+-]{1,32}$/,
  build: /^[0-9A-Za-z._-]{1,32}$/,
  gitRevision: /^[0-9A-Za-z._+-]{1,64}$/,
  iosVersion: /^[0-9A-Za-z .()_+-]{1,64}$/,
  deviceModel: /^[0-9A-Za-z ,._()+-]{1,64}$/,
  // Apple / BCP-47 style identifiers: fr, fr-FR, fr_FR, zh-Hans_CN, en_FR@rg=frzzzz.
  locale: /^(?=.{2,64}$)[A-Za-z]{2,3}(?:[_-][A-Za-z0-9]{2,8})*(?:@[A-Za-z0-9]+=[A-Za-z0-9-]+(?:;[A-Za-z0-9]+=[A-Za-z0-9-]+)*)?$/,
} as const;
type ShortField = keyof typeof SHORT_FIELDS;

const ALLOWED_KEYS = new Set<string>(["type", "name", "email", "message", "log", "bundleIds", ...Object.keys(SHORT_FIELDS)]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUNDLE_ID = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+$/;
// C0 and C1 controls and DEL. Multi-line text strips \t \n \r out first.
const CONTROL = /[\u0000-\u001F\u007F-\u009F]/;
const CONTROL_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;

export type FieldError = { field: string; reason: "missing" | "wrong_type" | "too_long" | "too_many" | "invalid" | "unknown_field" | "not_allowed" };

export type Feedback = {
  type: FeedbackType;
  name: string;
  email?: string;
  message?: string;
  log?: string;
  bundleIds?: string[];
} & Record<ShortField, string>;

/** Length in Unicode scalars (Swift `unicodeScalars.count`), not UTF-16 units. */
const scalarLength = (s: string) => [...s].length;

export function validateFeedback(input: unknown): { ok: true; value: Feedback } | { ok: false; errors: FieldError[] } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: [{ field: "body", reason: "wrong_type" }] };
  }
  const body = input as Record<string, unknown>;
  const errors: FieldError[] = [];
  const fail = (field: string, reason: FieldError["reason"]) => errors.push({ field, reason });

  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) fail(key, "unknown_field");
  }

  const type = body.type;
  if (type === undefined) fail("type", "missing");
  else if (typeof type !== "string") fail("type", "wrong_type");
  else if (!Object.hasOwn(TYPES, type)) fail("type", "invalid");
  const isAutoReturn = type === "autoReturn";

  let name = "";
  if (body.name === undefined) fail("name", "missing");
  else if (typeof body.name !== "string") fail("name", "wrong_type");
  else {
    name = body.name.trim();
    if (!name) fail("name", "missing");
    else if (scalarLength(name) > MAX_NAME) fail("name", "too_long");
    else if (CONTROL.test(name)) fail("name", "invalid");
  }

  let email: string | undefined;
  if (body.email !== undefined) {
    if (typeof body.email !== "string") fail("email", "wrong_type");
    else {
      email = body.email.trim() || undefined;
      if (email && email.length > MAX_EMAIL) fail("email", "too_long");
      else if (email && (!EMAIL.test(email) || CONTROL.test(email))) fail("email", "invalid");
    }
  }

  let message: string | undefined;
  if (body.message !== undefined && typeof body.message !== "string") fail("message", "wrong_type");
  else {
    message = typeof body.message === "string" && body.message.trim() ? body.message : undefined;
    if (!message && !isAutoReturn) fail("message", "missing");
    else if (message && scalarLength(message) > MAX_MESSAGE) fail("message", "too_long");
    else if (message && CONTROL_EXCEPT_WHITESPACE.test(message)) fail("message", "invalid");
  }

  const short = {} as Record<ShortField, string>;
  for (const field of Object.keys(SHORT_FIELDS) as ShortField[]) {
    const value = body[field];
    if (value === undefined || value === "") fail(field, "missing");
    else if (typeof value !== "string") fail(field, "wrong_type");
    else if (!SHORT_FIELDS[field].test(value)) fail(field, "invalid");
    else short[field] = value;
  }

  let log: string | undefined;
  if (body.log !== undefined) {
    if (typeof body.log !== "string") fail("log", "wrong_type");
    else if (Buffer.byteLength(body.log, "utf8") > MAX_LOG_BYTES) fail("log", "too_long");
    else log = body.log || undefined;
  }

  let bundleIds: string[] | undefined;
  if (body.bundleIds !== undefined) {
    const ids = body.bundleIds;
    if (!isAutoReturn) fail("bundleIds", "not_allowed");
    else if (!Array.isArray(ids)) fail("bundleIds", "wrong_type");
    else if (ids.length > MAX_BUNDLE_IDS) fail("bundleIds", "too_many");
    else if (!ids.every((id) => typeof id === "string")) fail("bundleIds", "wrong_type");
    else if (ids.some((id: string) => id.length > MAX_BUNDLE_ID)) fail("bundleIds", "too_long");
    else if (!ids.every((id: string) => BUNDLE_ID.test(id))) fail("bundleIds", "invalid");
    else bundleIds = ids.length ? ids : undefined;
  }
  // Contract decision: an auto-return request with no app and no text gives
  // the team nothing to act on.
  if (isAutoReturn && !message && !bundleIds && !errors.some((e) => e.field === "bundleIds")) {
    fail("bundleIds", "missing");
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { type: type as FeedbackType, name, email, message, log, bundleIds, ...short } };
}

/**
 * Renders the feedback as MarkdownV2 texts of at most TELEGRAM_TEXT_LIMIT
 * UTF-16 units each (the raw text, escapes included, so always within
 * Telegram's 4096 limit on the parsed text). Long content is split across
 * messages, in order, at line breaks when possible; no user text is dropped.
 */
export function renderFeedback(feedback: Feedback, escape: (raw: string) => string): string[] {
  const [emoji, label] = TYPES[feedback.type].split(" ");
  const meta = [`${feedback.appVersion} (${feedback.build})`, feedback.deviceModel, `iOS ${feedback.iosVersion}`];
  const tokens: string[] = [`${emoji} *${escape(label)}* · ${meta.map(escape).join(" · ")}`, "\n\n"];
  const line = (labelText: string, value: string) => tokens.push(escape(`${labelText}: `), ...textTokens(value, escape), "\n");

  line("Name", feedback.name);
  if (feedback.email) line("Email", feedback.email);
  line("Locale", feedback.locale);
  line("Revision", feedback.gitRevision);
  if (feedback.message) tokens.push("\n", ...textTokens(feedback.message, escape), "\n");
  if (feedback.bundleIds) {
    tokens.push("\n", escape("Bundle IDs:"), "\n");
    for (const id of feedback.bundleIds) tokens.push(escape(id), "\n");
  }
  return pack(tokens, TELEGRAM_TEXT_LIMIT);
}

// One token per line of escaped text, or per character when a line alone is
// too long, so a split never separates a backslash from the character it escapes.
function textTokens(text: string, escape: (raw: string) => string): string[] {
  const tokens: string[] = [];
  text.split("\n").forEach((part, i) => {
    if (i > 0) tokens.push("\n");
    const escaped = escape(part);
    if (escaped.length <= TELEGRAM_TEXT_LIMIT) tokens.push(escaped);
    else tokens.push(...[...part].map(escape));
  });
  return tokens;
}

function pack(tokens: string[], limit: number): string[] {
  const parts: string[] = [];
  let current = "";
  for (const token of tokens) {
    if (current.length + token.length > limit) {
      parts.push(current);
      current = "";
    }
    // A line break at the very start of a message only separates it from
    // the previous one, and Telegram rejects whitespace-only texts.
    if (!current && token === "\n") continue;
    current += token;
  }
  parts.push(current);
  return parts.filter((part) => part.trim());
}

/**
 * Best-effort, in-memory fixed-window rate limiter: per IP plus a global cap,
 * both per serverless instance. It resets on cold start and is not shared
 * across instances or regions, so a determined client can exceed it. The
 * stronger options are a Vercel Firewall rate-limit rule or App Attest
 * (dictus-ios#565). The map is bounded: expired entries are swept and, when
 * still full, the oldest window is evicted.
 */
export function createRateLimiter({
  limit = 5,
  globalLimit = 60,
  windowMs = 10 * 60 * 1000,
  maxEntries = 5000,
} = {}) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  let global = { count: 0, resetAt: 0 };

  return {
    check(key: string, now: number): { ok: true } | { ok: false; retryAfterSeconds: number } {
      let entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.delete(key);
        if (hits.size >= maxEntries) {
          for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
          const oldest = hits.keys().next().value;
          if (hits.size >= maxEntries && oldest !== undefined) hits.delete(oldest);
        }
        entry = { count: 0, resetAt: now + windowMs };
        hits.set(key, entry);
      }
      const retry = (resetAt: number) => ({ ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)) });
      if (entry.count >= limit) return retry(entry.resetAt);
      if (global.resetAt <= now) global = { count: 0, resetAt: now + windowMs };
      if (global.count >= globalLimit) return retry(global.resetAt);
      entry.count += 1;
      global.count += 1;
      return { ok: true };
    },
    get size() {
      return hits.size;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

export type FeedbackDeps = {
  env: Record<string, string | undefined>;
  telegram: {
    escapeMarkdownV2: (raw: string) => string;
    sendTelegramText: (token: string, chatId: string, text: string, timeoutMs: number) => Promise<TelegramSendResult>;
    sendTelegramDocument: (
      token: string,
      chatId: string,
      file: { filename: string; content: string },
      options: { replyToMessageId?: number; timeoutMs: number },
    ) => Promise<TelegramSendResult>;
  };
  limiter: RateLimiter;
  now: () => number;
  timeoutMs?: number;
};

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });

/** Every method but POST. The native app needs no CORS, so OPTIONS is refused too. */
export function methodNotAllowed(): Response {
  return json(405, { ok: false, error: "method_not_allowed" }, { Allow: "POST" });
}

/** Vercel sets both headers and overwrites client-sent values. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isJson(contentType: string | null): boolean {
  if (!contentType) return false;
  const [type, ...params] = contentType.split(";").map((part) => part.trim().toLowerCase());
  if (type !== "application/json") return false;
  const charset = params.find((p) => p.startsWith("charset="))?.slice("charset=".length).replace(/"/g, "");
  return charset === undefined || charset === "utf-8" || charset === "utf8";
}

/** Reads at most `cap` bytes; null when the body is larger. Never trusts Content-Length alone. */
async function readCapped(request: Request, cap: number): Promise<Uint8Array | null> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > cap) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function handleFeedbackPost(request: Request, deps: FeedbackDeps): Promise<Response> {
  const now = deps.now();
  const limited = deps.limiter.check(clientIp(request), now);
  if (!limited.ok) {
    return json(429, { ok: false, error: "rate_limited" }, { "Retry-After": String(limited.retryAfterSeconds) });
  }

  if (!isJson(request.headers.get("content-type"))) {
    return json(415, { ok: false, error: "unsupported_media_type" });
  }

  const tooLarge = () => json(413, { ok: false, error: "payload_too_large" });
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return tooLarge();
  const bytes = await readCapped(request, MAX_BODY_BYTES);
  if (!bytes) return tooLarge();

  let input: unknown;
  try {
    input = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }
  const result = validateFeedback(input);
  if (!result.ok) return json(400, { ok: false, error: "invalid_payload", fields: result.errors });
  const feedback = result.value;

  // Feedback goes to its own chat only, never to TELEGRAM_CHAT_ID (payments).
  const token = deps.env.TELEGRAM_BOT_TOKEN;
  const chatId = deps.env.TELEGRAM_FEEDBACK_CHAT_ID;
  if (!token || !chatId) {
    console.error("[feedback] TELEGRAM_BOT_TOKEN or TELEGRAM_FEEDBACK_CHAT_ID missing");
    return json(503, { ok: false, error: "not_configured" });
  }

  const timeoutMs = deps.timeoutMs ?? TELEGRAM_TIMEOUT_MS;
  const upstreamFailed = (step: string, error: string) => {
    console.error(`[feedback] telegram ${step} failed ${error}`);
    return json(502, { ok: false, error: "upstream_failed" });
  };

  let firstMessageId: number | undefined;
  for (const text of renderFeedback(feedback, deps.telegram.escapeMarkdownV2)) {
    const sent = await deps.telegram.sendTelegramText(token, chatId, text, timeoutMs);
    if (!sent.ok) return upstreamFailed("sendMessage", sent.error);
    firstMessageId ??= sent.messageId;
  }

  if (feedback.log) {
    const date = new Date(now).toISOString().slice(0, 10);
    const build = feedback.build.replace(/[^0-9A-Za-z._-]/g, "_");
    // If this fails after the message went through, the app's retry sends
    // the message again: a duplicate is better than a lost log.
    const sent = await deps.telegram.sendTelegramDocument(
      token,
      chatId,
      { filename: `dictus-log-${build}-${date}.txt`, content: feedback.log },
      { replyToMessageId: firstMessageId, timeoutMs },
    );
    if (!sent.ok) return upstreamFailed("sendDocument", sent.error);
  }

  return json(200, { ok: true });
}

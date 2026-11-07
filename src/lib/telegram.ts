/**
 * Escapes the 18 Telegram MarkdownV2 reserved characters (plus backslash itself).
 * Source: https://core.telegram.org/bots/api#markdownv2-style
 *
 * Apply this to USER-PROVIDED content before inserting it into a MarkdownV2 template.
 * Do NOT apply to Markdown syntax you intend to render (e.g. `*bold*`, `[text](url)`).
 * Inside link URL parens, escape `)` and `\` separately in the URL (this regex handles both).
 */
export function escapeMarkdownV2(raw: string): string {
  return raw.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (m) => `\\${m}`);
}

/**
 * Sends a MarkdownV2-formatted message to the configured Telegram chat.
 *
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from env at call time.
 * Never throws — if env vars are missing, or the Telegram API responds non-2xx,
 * logs via console.error and returns. Webhook routes MUST stay at 200 even when
 * notification delivery fails (payment is already received; retrying would spam).
 *
 * Callers are responsible for escaping dynamic content with escapeMarkdownV2.
 * Link previews are disabled so the dashboard link stays an inline hyperlink.
 */
export async function sendTelegramMessage(markdownV2Text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing");
    return;
  }

  try {
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
  } catch (err) {
    console.error("[telegram] fetch threw", err);
  }
}

/**
 * Outcome of a feedback-route send. `error` is a short category ("http 400",
 * "timeout", "network"), safe to log: it never carries the request URL, which
 * contains the bot token, nor Telegram's response body.
 */
export type TelegramSendResult =
  | { ok: true; messageId?: number }
  | { ok: false; error: string };

async function callTelegram(
  token: string,
  method: "sendMessage" | "sendDocument",
  init: { body: BodyInit; headers?: HeadersInit },
  timeoutMs: number,
): Promise<TelegramSendResult> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false, error: `http ${res.status}` };
    const data = (await res.json().catch(() => null)) as { result?: { message_id?: unknown } } | null;
    const messageId = data?.result?.message_id;
    return { ok: true, messageId: typeof messageId === "number" ? messageId : undefined };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    return { ok: false, error: name === "TimeoutError" || name === "AbortError" ? "timeout" : "network" };
  }
}

/**
 * Status-returning sibling of sendTelegramMessage, for /api/feedback: the
 * caller passes the token and chat id, and must answer an error when Telegram
 * fails, so the app can keep the text and offer a retry. Never throws.
 */
export function sendTelegramText(
  token: string,
  chatId: string,
  markdownV2Text: string,
  timeoutMs: number,
): Promise<TelegramSendResult> {
  return callTelegram(
    token,
    "sendMessage",
    {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: markdownV2Text,
        parse_mode: "MarkdownV2",
        link_preview_options: { is_disabled: true },
      }),
    },
    timeoutMs,
  );
}

/**
 * Uploads a UTF-8 text file with sendDocument (multipart/form-data), as a reply
 * to `replyToMessageId` when given. Never throws.
 */
export function sendTelegramDocument(
  token: string,
  chatId: string,
  file: { filename: string; content: string },
  options: { replyToMessageId?: number; timeoutMs: number },
): Promise<TelegramSendResult> {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("document", new Blob([file.content], { type: "text/plain;charset=utf-8" }), file.filename);
  if (options.replyToMessageId !== undefined) {
    form.append("reply_parameters", JSON.stringify({ message_id: options.replyToMessageId }));
  }
  return callTelegram(token, "sendDocument", { body: form }, options.timeoutMs);
}

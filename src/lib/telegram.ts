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

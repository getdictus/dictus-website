import crypto from "node:crypto";
import { btcpayConfig } from "@/config/donate";
import { escapeMarkdownV2, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BTCPayWebhookPayload {
  deliveryId: string;
  webhookId: string;
  originalDeliveryId: string;
  isRedelivery: boolean;
  type: string;
  timestamp: number;
  storeId: string;
  invoiceId: string;
  metadata?: Record<string, unknown>;
  manuallyMarked?: boolean;
  overPaid?: boolean;
}

interface BTCPayInvoice {
  id: string;
  amount: string;
  currency: string;
  status: string;
  createdTime: number;
  paymentMethods?: Array<{
    paymentMethod: string;
    cryptoCode?: string;
    amount?: string;
    rate?: string;
  }>;
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.BTCPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[btcpay-webhook] BTCPAY_WEBHOOK_SECRET missing");
    return new Response("Misconfigured", { status: 500 });
  }

  // Case-insensitive header read. BTCPay documents the header as BTCPAY-SIG
  // but Fetch API normalizes to lowercase — both forms work.
  const sig = request.headers.get("btcpay-sig");
  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  // HMAC is computed over raw BYTES — read arrayBuffer, never .json() first.
  const rawBody = Buffer.from(await request.arrayBuffer());

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const sigBuf = Buffer.from(sig, "utf8");

  if (
    expectedBuf.length !== sigBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, sigBuf)
  ) {
    return new Response("Invalid signature", { status: 400 });
  }

  let payload: BTCPayWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf8")) as BTCPayWebhookPayload;
  } catch (err) {
    console.error("[btcpay-webhook] JSON parse failed", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  // Silently ignore any event other than InvoiceSettled per CONTEXT.
  if (payload.type !== "InvoiceSettled") {
    return new Response(null, { status: 200 });
  }

  const apiKey = process.env.BTCPAY_API_KEY;
  if (!apiKey) {
    console.error(
      `[btcpay-webhook] BTCPAY_API_KEY missing (invoice=${payload.invoiceId})`,
    );
    return new Response(null, { status: 200 });
  }

  // Fetch invoice details from Greenfield API — payload lacks amount/currency.
  let invoice: BTCPayInvoice | null = null;
  try {
    const url = `${btcpayConfig.serverUrl}/api/v1/stores/${payload.storeId}/invoices/${payload.invoiceId}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${apiKey}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[btcpay-webhook] invoice fetch failed ${res.status} ${body} (invoice=${payload.invoiceId})`,
      );
      return new Response(null, { status: 200 });
    }
    invoice = (await res.json()) as BTCPayInvoice;
  } catch (err) {
    console.error(
      `[btcpay-webhook] invoice fetch threw (invoice=${payload.invoiceId})`,
      err,
    );
    return new Response(null, { status: 200 });
  }

  // BTC equivalent: pick the paymentMethod entry whose cryptoCode starts with
  // "BTC" AND has a non-zero amount (that's the one actually paid). Prefers
  // on-chain if both exist with amounts (shouldn't happen for a single invoice,
  // but handle gracefully).
  const btcMethod = invoice.paymentMethods?.find(
    (m) =>
      (m.cryptoCode === "BTC" || m.cryptoCode === "BTC-LightningNetwork") &&
      parseFloat(m.amount ?? "0") > 0,
  );
  const btcAmount = btcMethod?.amount ?? "?";

  const createdIso = new Date(
    (invoice.createdTime ?? payload.timestamp ?? Math.floor(Date.now() / 1000)) *
      1000,
  )
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");

  const invoiceUrl = `${btcpayConfig.serverUrl}/invoices/${payload.invoiceId}`;

  const text =
    "\u2728 *New contribution*\n\n" +
    "\u20bf Method: Bitcoin\n" +
    `\ud83d\udcb0 Amount: ${escapeMarkdownV2(invoice.amount)} ${escapeMarkdownV2(invoice.currency)}\n` +
    `\u26a1 BTC: ${escapeMarkdownV2(btcAmount)}\n` +
    `\ud83d\udcc5 ${escapeMarkdownV2(createdIso)}\n` +
    `\ud83d\udd17 [View invoice](${escapeMarkdownV2(invoiceUrl)})`;

  console.log(
    `[btcpay-webhook] InvoiceSettled invoice=${payload.invoiceId} store=${payload.storeId} amount=${invoice.amount} ${invoice.currency} btc=${btcAmount}`,
  );

  await sendTelegramMessage(text);

  return new Response(null, { status: 200 });
}

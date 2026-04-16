import Stripe from "stripe";
import { escapeMarkdownV2, sendTelegramMessage } from "@/lib/telegram";

// Explicit Node runtime: stripe SDK is not Edge-compatible historically,
// and constructEvent on Edge requires the async variant + Web Crypto.
export const runtime = "nodejs";

// Prevent any static optimization — webhook MUST execute on every POST.
export const dynamic = "force-dynamic";

// SDK init — webhook signature verification does NOT read STRIPE_SECRET_KEY,
// so empty-string fallback is safe. If we ever make API calls (we don't here),
// this would need a real key in env.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET missing");
    return new Response("Misconfigured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // MUST read raw body BEFORE any JSON parsing — re-serialized JSON would
  // produce different bytes and fail signature verification.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Silently ignore any event other than checkout.session.completed per CONTEXT.
  // Defensive: dashboard config should subscribe only to this type, but we
  // handle drift gracefully.
  if (event.type !== "checkout.session.completed") {
    return new Response(null, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Extract fields. amount_total is in the smallest currency unit (cents for EUR).
  const amountMinor = session.amount_total ?? 0;
  const currencyRaw = (session.currency ?? "eur").toUpperCase();
  const amountMajor = (amountMinor / 100).toFixed(2); // e.g. "25.00"

  // payment_intent may be a string id or an expanded PaymentIntent object.
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? "";

  const createdIso = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z"); // e.g. "2026-04-16T14:32:05Z"

  const dashboardUrl = paymentIntentId
    ? `https://dashboard.stripe.com/payments/${paymentIntentId}`
    : "https://dashboard.stripe.com/payments";

  // Build MarkdownV2 message. Escape ONLY dynamic values; keep syntax chars raw.
  // Inside [text](url), Telegram requires `)` and `\` escaped in the URL — our
  // escapeMarkdownV2 handles both as part of the general class.
  const text =
    "\u2728 *New contribution*\n\n" +
    "\ud83d\udcb3 Method: Stripe\n" +
    `\ud83d\udcb0 Amount: ${escapeMarkdownV2(amountMajor)} ${escapeMarkdownV2(currencyRaw)}\n` +
    `\ud83d\udcc5 ${escapeMarkdownV2(createdIso)}\n` +
    `\ud83d\udd17 [View payment](${escapeMarkdownV2(dashboardUrl)})`;

  console.log(
    `[stripe-webhook] checkout.session.completed id=${event.id} session=${session.id} amount=${amountMajor} ${currencyRaw}`,
  );

  // Best-effort: helper never throws. A failed Telegram call still returns 200
  // so Stripe does not retry and spam the chat when Telegram recovers.
  await sendTelegramMessage(text);

  return new Response(null, { status: 200 });
}

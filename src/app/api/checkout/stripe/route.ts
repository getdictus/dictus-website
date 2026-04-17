import Stripe from "stripe";
import { MIN_AMOUNT, MAX_AMOUNT } from "@/config/donate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder");

interface CheckoutRequestBody {
  amount?: unknown;
  locale?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || secret === "sk_placeholder") {
    console.error("[stripe-checkout] STRIPE_SECRET_KEY missing");
    return new Response("Stripe not configured", { status: 500 });
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const amount = Number(body.amount);
  if (
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return new Response("Invalid amount", { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "fr";

  // Origin from browser-set header (Origin), reliable for same-origin POSTs.
  // Fallback to Host header reconstruction for edge cases.
  const origin =
    request.headers.get("origin") ??
    `https://${request.headers.get("host") ?? "getdictus.com"}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Contribution Dictus" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/${locale}/donate?success=1`,
      cancel_url: `${origin}/${locale}/donate?canceled=1`,
    });

    if (!session.url) {
      console.error("[stripe-checkout] session created without url", session.id);
      return new Response("Stripe session missing url", { status: 502 });
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[stripe-checkout] session creation failed", err);
    return new Response("Stripe error", { status: 502 });
  }
}

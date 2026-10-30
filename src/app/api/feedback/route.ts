import { createRateLimiter, handleFeedbackPost, methodNotAllowed } from "@/lib/feedback";
import * as telegram from "@/lib/telegram";

// Node runtime like api/webhooks/stripe: Buffer, FormData uploads, no Edge limits.
export const runtime = "nodejs";

// Every POST must run: nothing here is cacheable.
export const dynamic = "force-dynamic";

// Per-instance, best-effort limiter: see createRateLimiter in src/lib/feedback.ts.
const limiter = createRateLimiter();

export function POST(request: Request): Promise<Response> {
  return handleFeedbackPost(request, { env: process.env, telegram, limiter, now: Date.now });
}

// Next answers unexported methods with a bare 405 (no Allow header) and
// OPTIONS with 204, so every other method is refused explicitly.
export const GET = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;

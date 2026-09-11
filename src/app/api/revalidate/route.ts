import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { DOWNLOADS_CACHE_TAG } from "@/lib/downloads";

export const runtime = "nodejs";

// Prevent any static optimization — revalidation MUST execute on every POST.
export const dynamic = "force-dynamic";

// Constant-time comparison. timingSafeEqual throws when the buffers differ in
// length, so the length check has to come first — it leaks only the secret's
// length, which a timing attack would recover anyway.
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    // No degraded mode: an unconfigured deployment must not purge anything.
    console.error("[revalidate] REVALIDATE_SECRET missing");
    return new Response("Misconfigured", { status: 500 });
  }

  // Header only — a secret in the query string ends up in access logs.
  const provided = request.headers.get("x-revalidate-secret");
  if (!provided || !secretMatches(provided, secret)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Frozen endpoint: the tag is hard-coded and no tag name is accepted from the
  // request, so a leaked secret can only ever purge the Desktop downloads.
  // `{ expire: 0 }` is the webhook profile — immediate expiry rather than the
  // stale-while-revalidate of `"max"`, which would still serve the old version
  // on the first request after a release.
  revalidateTag(DOWNLOADS_CACHE_TAG, { expire: 0 });

  console.log(`[revalidate] purged tag=${DOWNLOADS_CACHE_TAG}`);

  return Response.json({
    revalidated: true,
    tag: DOWNLOADS_CACHE_TAG,
    now: Date.now(),
  });
}

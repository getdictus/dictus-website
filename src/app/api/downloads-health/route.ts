import { FETCH_TIMEOUT_MS, RELEASES_URL, githubHeaders } from "@/lib/downloads";

export const runtime = "nodejs";

// Prevent any static optimization — the monitor MUST get a fresh comparison on
// every poll, not a cached verdict.
export const dynamic = "force-dynamic";

// Public on purpose: version numbers are already published on the downloads page.
// The status code is the signal — Uptime Kuma alerts on it without reading the body.

// The page the monitor speaks for. Prefixed locale, so no middleware redirect hop.
const SERVED_PAGE_PATH = "/fr";

// Matches the version segment of a Desktop download URL in the rendered HTML,
// e.g. .../releases/download/v0.3.0/Dictus_0.3.0_x64.dmg
const SERVED_VERSION_REGEX = /releases\/download\/(v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?)\//gi;

// The truth side of the comparison: the live release, uncached. Returns null when
// GitHub is unreachable (timeout, outage, rate limit) — that is not a drift of the site.
async function fetchLatestTag(): Promise<string | null> {
  try {
    const res = await fetch(RELEASES_URL, {
      headers: githubHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    const tag = (data as Record<string, unknown>).tag_name;
    return typeof tag === "string" && tag.length > 0 ? tag : null;
  } catch {
    return null;
  }
}

type ServedVersion =
  | { kind: "ok"; version: string }
  | { kind: "unreadable"; detail: string }
  | { kind: "unverifiable"; detail: string };

// The served side: the rendered page itself, read exactly as a visitor gets it.
//
// This deliberately does NOT call getDesktopDownloads(). That reads the Data Cache,
// which on Vercel is a different cache from the prerendered page and is not refreshed
// by a deployment — the two diverged in production on 2026-09-11 and produced a 27min
// false 409 while the page was correct. The rendered HTML is the only ground truth.
async function fetchServedVersion(origin: string): Promise<ServedVersion> {
  try {
    const res = await fetch(new URL(SERVED_PAGE_PATH, origin), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
      // Manual: a redirect means we are being sent somewhere that is not the page —
      // a protected preview's SSO login, or an apex->www hop. Following it would hand
      // us someone else's HTML and we would call the missing links an incident.
      redirect: "manual",
    });
    if (res.status >= 300 && res.status < 400) {
      return {
        kind: "unverifiable",
        detail: `page redirected (${res.status}) to ${res.headers.get("location") ?? "unknown"}`,
      };
    }
    if (!res.ok) return { kind: "unreadable", detail: `page returned ${res.status}` };

    const html = await res.text();
    const found = new Set(
      [...html.matchAll(SERVED_VERSION_REGEX)].map((m) => m[1]),
    );

    // No links at all, or several versions side by side, are both incidents worth
    // waking someone for — a silent "all good" here would defeat the whole monitor.
    if (found.size === 0) return { kind: "unreadable", detail: "no download link found" };
    if (found.size > 1) {
      return { kind: "unreadable", detail: `mixed versions ${[...found].join(", ")}` };
    }

    return { kind: "ok", version: [...found][0] };
  } catch {
    return { kind: "unreadable", detail: "page fetch failed" };
  }
}

export async function GET(request: Request): Promise<Response> {
  const [served, latest] = await Promise.all([
    fetchServedVersion(new URL(request.url).origin),
    fetchLatestTag(),
  ]);

  // An upstream outage is not a drift of the site — alerting on it would be noise.
  if (latest === null) {
    console.warn("[downloads-health] GitHub API unreachable, reporting degraded");
    return Response.json({ ok: true, degraded: true });
  }

  // Not looking at the page is not the same as the page being wrong. A protected
  // preview deployment lands here, and a monitor must not page anyone over it.
  if (served.kind === "unverifiable") {
    console.warn(`[downloads-health] cannot reach the served page: ${served.detail}`);
    return Response.json({ ok: true, degraded: true, reason: served.detail });
  }

  if (served.kind === "unreadable") {
    console.error(`[downloads-health] page unreadable: ${served.detail}`);
    return Response.json(
      { ok: false, served: null, latest, reason: served.detail },
      { status: 503 },
    );
  }

  if (served.version !== latest) {
    console.error(
      `[downloads-health] drift served=${served.version} latest=${latest}`,
    );
    return Response.json(
      { ok: false, served: served.version, latest },
      { status: 409 },
    );
  }

  return Response.json({ ok: true, served: served.version, latest });
}

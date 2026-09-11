import {
  FETCH_TIMEOUT_MS,
  RELEASES_URL,
  getDesktopDownloads,
  githubHeaders,
} from "@/lib/downloads";

export const runtime = "nodejs";

// Prevent any static optimization — the monitor MUST get a fresh comparison on
// every poll, not a cached verdict.
export const dynamic = "force-dynamic";

// Public on purpose: version numbers are already published on the downloads page.
// The status code is the signal — Uptime Kuma alerts on it without reading the body.

// The truth side of the comparison: same endpoint, same headers and token as
// getDesktopDownloads(), but uncached. Returns null when GitHub is unreachable
// (timeout, outage, rate limit) — that is not a drift of the site.
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

export async function GET(): Promise<Response> {
  // Reads the tagged, cached fetch — i.e. exactly what the site currently serves.
  const [served, latest] = await Promise.all([
    getDesktopDownloads().then((d) => d.version),
    fetchLatestTag(),
  ]);

  if (latest === null) {
    console.warn("[downloads-health] GitHub API unreachable, reporting degraded");
    return Response.json({ ok: true, degraded: true });
  }

  if (served !== latest) {
    console.error(`[downloads-health] drift served=${served} latest=${latest}`);
    return Response.json({ ok: false, served, latest }, { status: 409 });
  }

  return Response.json({ ok: true, served, latest });
}

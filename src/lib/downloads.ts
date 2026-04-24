// src/lib/downloads.ts
// Server-only: resolves Desktop download URLs from the live GitHub Releases API
// at build / ISR time. Falls back to `fallbackDownloads` on any failure so
// builds never break and the site stays usable if the API is unreachable.
//
// Primary refresh path is a Vercel Deploy Hook triggered by the dictus-desktop
// release workflow. The `revalidate: 3600` below is a safety net for missed
// hooks (1h ISR).

import {
  fallbackDownloads,
  ASSET_PATTERNS,
  type DownloadsConfig,
  type DownloadVariant,
  type LinuxFormat,
} from "@/config/downloads";

const RELEASES_URL =
  "https://api.github.com/repos/getdictus/dictus-desktop/releases/latest";
const ALLOWED_URL_PREFIX =
  "https://github.com/getdictus/dictus-desktop/releases/download/";
const TAG_REGEX = /^v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i;
const FETCH_TIMEOUT_MS = 10_000;
const REVALIDATE_SECONDS = 3600;

type Asset = { name: string; browser_download_url: string };

function isValidAsset(a: unknown): a is Asset {
  if (!a || typeof a !== "object") return false;
  const x = a as Record<string, unknown>;
  return (
    typeof x.name === "string" &&
    typeof x.browser_download_url === "string" &&
    x.browser_download_url.startsWith(ALLOWED_URL_PREFIX)
  );
}

function resolveVariant(
  fallback: DownloadVariant,
  url: string | undefined
): DownloadVariant {
  if (!url) return fallback;
  return { enabled: true, url, label: fallback.label };
}

function resolveLinuxFormat(
  fallback: LinuxFormat,
  url: string | undefined
): LinuxFormat {
  if (!url) return fallback;
  return {
    type: fallback.type,
    arch: fallback.arch,
    enabled: true,
    url,
    label: fallback.label,
  };
}

function linuxPatternFor(fmt: LinuxFormat): RegExp | null {
  if (fmt.type === "appimage" && fmt.arch === "x64") return ASSET_PATTERNS.linuxAppX64;
  if (fmt.type === "appimage" && fmt.arch === "arm64") return ASSET_PATTERNS.linuxAppArm64;
  if (fmt.type === "deb" && fmt.arch === "x64") return ASSET_PATTERNS.linuxDebX64;
  if (fmt.type === "deb" && fmt.arch === "arm64") return ASSET_PATTERNS.linuxDebArm64;
  if (fmt.type === "rpm" && fmt.arch === "x64") return ASSET_PATTERNS.linuxRpmX64;
  if (fmt.type === "rpm" && fmt.arch === "arm64") return ASSET_PATTERNS.linuxRpmArm64;
  return null;
}

export async function getDesktopDownloads(): Promise<DownloadsConfig> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(RELEASES_URL, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return fallbackDownloads;

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return fallbackDownloads;
    const obj = data as Record<string, unknown>;

    const tag =
      typeof obj.tag_name === "string" && TAG_REGEX.test(obj.tag_name)
        ? obj.tag_name
        : null;
    if (!tag) return fallbackDownloads;

    const assets = Array.isArray(obj.assets)
      ? obj.assets.filter(isValidAsset)
      : [];
    if (assets.length === 0) return fallbackDownloads;

    const find = (re: RegExp): string | undefined =>
      assets.find((a) => re.test(a.name))?.browser_download_url;

    return {
      version: tag,
      macos: {
        arm64: resolveVariant(fallbackDownloads.macos.arm64, find(ASSET_PATTERNS.macArm64)),
        x64: resolveVariant(fallbackDownloads.macos.x64, find(ASSET_PATTERNS.macX64)),
      },
      windows: {
        x64: resolveVariant(fallbackDownloads.windows.x64, find(ASSET_PATTERNS.winX64)),
        arm64: resolveVariant(fallbackDownloads.windows.arm64, find(ASSET_PATTERNS.winArm64)),
      },
      linux: {
        formats: fallbackDownloads.linux.formats.map((fmt) => {
          const pattern = linuxPatternFor(fmt);
          return resolveLinuxFormat(fmt, pattern ? find(pattern) : undefined);
        }),
      },
    };
  } catch {
    return fallbackDownloads;
  }
}

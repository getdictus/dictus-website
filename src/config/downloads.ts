// src/config/downloads.ts
// Desktop download config for Dictus Desktop (Mac / Windows / Linux).
//
// Runtime source of truth is the GitHub Releases API — resolved at build time by
// `getDesktopDownloads()` in `src/lib/downloads.ts`. This module provides:
//   1. The type contract (`DownloadsConfig`, variants).
//   2. A pinned `fallbackDownloads` snapshot used when the API call fails.
//   3. `ASSET_PATTERNS` — anchored regexes that match each variant slot to an
//      asset in the release's `assets[]` array.
//
// Bump `DESKTOP_VERSION` + the fallback URLs only as a manual safety net; the
// live site auto-syncs with the latest release without needing changes here.

const DESKTOP_VERSION = "v0.1.2";
const RELEASE_BASE = `https://github.com/getdictus/dictus-desktop/releases/download/${DESKTOP_VERSION}`;

export type DownloadVariant = {
  readonly enabled: boolean;
  readonly url: string;
  readonly label: string;
};

export type LinuxFormat = DownloadVariant & {
  readonly type: "appimage" | "deb" | "rpm" | "flatpak";
  readonly arch: "x64" | "arm64";
};

export type DownloadsConfig = {
  readonly version: string;
  readonly macos: {
    readonly arm64: DownloadVariant;
    readonly x64: DownloadVariant;
  };
  readonly windows: {
    readonly x64: DownloadVariant;
    readonly arm64: DownloadVariant;
  };
  readonly linux: {
    readonly formats: readonly LinuxFormat[];
  };
};

export const fallbackDownloads: DownloadsConfig = {
  version: DESKTOP_VERSION,
  macos: {
    arm64: {
      enabled: true,
      url: `${RELEASE_BASE}/Dictus_0.1.2_aarch64.dmg`,
      label: "Apple Silicon (.dmg)",
    },
    x64: {
      enabled: true,
      url: `${RELEASE_BASE}/Dictus_0.1.2_x64.dmg`,
      label: "Intel (.dmg)",
    },
  },
  windows: {
    x64: {
      enabled: true,
      url: `${RELEASE_BASE}/Dictus_0.1.2_x64-setup.exe`,
      label: "x64 installer (.exe)",
    },
    arm64: {
      enabled: true,
      url: `${RELEASE_BASE}/Dictus_0.1.2_arm64-setup.exe`,
      label: "ARM64 installer (.exe)",
    },
  },
  linux: {
    formats: [
      {
        type: "appimage",
        arch: "x64",
        enabled: true,
        url: `${RELEASE_BASE}/Dictus_0.1.2_amd64.AppImage`,
        label: "AppImage (x64)",
      },
      {
        type: "appimage",
        arch: "arm64",
        enabled: true,
        url: `${RELEASE_BASE}/Dictus_0.1.2_aarch64.AppImage`,
        label: "AppImage (ARM64)",
      },
      {
        type: "deb",
        arch: "x64",
        enabled: true,
        url: `${RELEASE_BASE}/Dictus_0.1.2_amd64.deb`,
        label: ".deb (x64)",
      },
      {
        type: "deb",
        arch: "arm64",
        enabled: true,
        url: `${RELEASE_BASE}/Dictus_0.1.2_arm64.deb`,
        label: ".deb (ARM64)",
      },
      {
        type: "rpm",
        arch: "x64",
        enabled: true,
        url: `${RELEASE_BASE}/Dictus-0.1.2-1.x86_64.rpm`,
        label: ".rpm (x64)",
      },
      {
        type: "rpm",
        arch: "arm64",
        enabled: true,
        url: `${RELEASE_BASE}/Dictus-0.1.2-1.aarch64.rpm`,
        label: ".rpm (ARM64)",
      },
    ],
  },
} as const;

// Anchored regexes that match each variant slot to an asset filename.
// Both ends anchored + required `Dictus` prefix block mis-named / attacker-
// injected assets from matching. Kept alongside the config so changes stay
// co-located with the data shape.
export const ASSET_PATTERNS = {
  macArm64: /^Dictus_[\d.]+_aarch64\.dmg$/,
  macX64: /^Dictus_[\d.]+_x64\.dmg$/,
  winX64: /^Dictus_[\d.]+_x64-setup\.exe$/,
  winArm64: /^Dictus_[\d.]+_arm64-setup\.exe$/,
  linuxAppX64: /^Dictus_[\d.]+_amd64\.AppImage$/,
  linuxAppArm64: /^Dictus_[\d.]+_aarch64\.AppImage$/,
  linuxDebX64: /^Dictus_[\d.]+_amd64\.deb$/,
  linuxDebArm64: /^Dictus_[\d.]+_arm64\.deb$/,
  linuxRpmX64: /^Dictus-[\d.]+-\d+\.x86_64\.rpm$/,
  linuxRpmArm64: /^Dictus-[\d.]+-\d+\.aarch64\.rpm$/,
} as const;

// Convenience helper used by the Platforms component to decide
// Coming-Soon vs Active rendering without repeating `.enabled` checks.
export function anyEnabled(
  v: DownloadVariant | readonly DownloadVariant[]
): boolean {
  return Array.isArray(v)
    ? v.some((d) => d.enabled)
    : (v as DownloadVariant).enabled;
}

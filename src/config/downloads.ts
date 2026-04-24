// src/config/downloads.ts
// Centralized download links for Dictus Desktop (Mac / Windows / Linux).
// URLs point to a pinned GitHub release — bump DESKTOP_VERSION on each new
// dictus-desktop release and GitHub serves the matching assets automatically.
// Shape convention mirrors src/config/donate.ts (`as const`).

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

export const downloads: DownloadsConfig = {
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

// Convenience helper used by the Platforms component to decide
// Coming-Soon vs Active rendering without repeating `.enabled` checks.
export function anyEnabled(
  v: DownloadVariant | readonly DownloadVariant[]
): boolean {
  return Array.isArray(v)
    ? v.some((d) => d.enabled)
    : (v as DownloadVariant).enabled;
}

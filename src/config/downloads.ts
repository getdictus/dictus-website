// src/config/downloads.ts
// Centralized download links for Dictus Desktop (Mac / Windows / Linux).
// Placeholders only — every variant is `enabled: false` until binaries ship.
// Shape convention mirrors src/config/donate.ts (`as const`).

export type DownloadVariant = {
  readonly enabled: boolean;
  readonly url: string;
  readonly label: string;
};

export type LinuxFormat = DownloadVariant & {
  readonly type: "appimage" | "deb" | "rpm" | "flatpak";
};

export type DownloadsConfig = {
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
  macos: {
    arm64: { enabled: false, url: "", label: "Coming Soon" },
    x64:   { enabled: false, url: "", label: "Coming Soon" },
  },
  windows: {
    x64:   { enabled: false, url: "", label: "Coming Soon" },
    arm64: { enabled: false, url: "", label: "Coming Soon" },
  },
  linux: {
    formats: [
      { type: "appimage", enabled: false, url: "", label: "Coming Soon" },
      { type: "deb",      enabled: false, url: "", label: "Coming Soon" },
      { type: "rpm",      enabled: false, url: "", label: "Coming Soon" },
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

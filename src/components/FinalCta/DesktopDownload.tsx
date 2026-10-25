"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { anyEnabled, type DownloadsConfig, type DownloadVariant, type LinuxFormat } from "@/config/downloads";
import Section from "@/components/shared/Section";

type Os = "mac" | "win" | "linux";
const ORDERED: readonly Os[] = ["mac", "win", "linux"];

const RELEASES_URL = "https://github.com/getdictus/dictus-desktop/releases";
const SOURCE_URL = "https://github.com/getdictus/dictus-desktop";

function detectOs(): Os | null {
  const ua = navigator.userAgent;
  // iPadOS can send a desktop Mac user agent. Keep mobile visitors neutral.
  if (/iPhone|iPad|iPod|Android/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return null;
  if (/Mac OS X|Macintosh/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "win";
  if (/Linux|X11/.test(ua)) return "linux";
  return null;
}

// The user agent never changes during a visit: nothing to subscribe to.
const subscribe = () => () => {};
// The server and the hydration pass both render the neutral state; React then
// re-renders once with the detected system, so the HTML always matches.
const neutral = () => null;

function variantsFor(downloads: DownloadsConfig, os: Os): readonly DownloadVariant[] {
  if (os === "mac") return [downloads.macos.arm64, downloads.macos.x64];
  if (os === "win") return [downloads.windows.x64, downloads.windows.arm64];
  return downloads.linux.formats;
}

function isLinuxFormat(variant: DownloadVariant): variant is LinuxFormat {
  return "type" in variant;
}

/**
 * Dictus Desktop downloads (`#desktop`), right under the final CTA. Every
 * platform and file comes from the latest dictus-desktop release
 * (`getDesktopDownloads()`). The server renders all three platforms with
 * nothing highlighted; after mount the visitor's system is highlighted in
 * place. Same boxes, same order, so nothing moves.
 */
export default function DesktopDownload({ downloads }: { downloads: DownloadsConfig }) {
  const t = useTranslations("DesktopDownload");
  const detected = useSyncExternalStore(subscribe, detectOs, neutral);
  const platforms = ORDERED.filter((os) => anyEnabled(variantsFor(downloads, os)));

  return (
    <Section
      tone="grey"
      id="desktop"
      aria-labelledby="desktop-title"
      className="pb-[clamp(72px,8vw,120px)] pt-[clamp(56px,6vw,96px)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <div className="max-w-[640px]">
          <p className="font-mono text-[13px] tracking-[0.1em] text-accent-text">{t("eyebrow")}</p>
          <h2
            id="desktop-title"
            className="mt-3 text-[clamp(32px,3.6vw,52px)] font-light leading-[1.04] tracking-[-0.035em] [text-wrap:balance]"
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-[clamp(16px,1.3vw,18px)] leading-normal text-brand-body">
            {t("description")} {t("free")}
          </p>
        </div>

        <ul className="mt-[clamp(28px,3.5vw,44px)] grid gap-4 min-[900px]:grid-cols-3" aria-label={t("list_label")}>
          {platforms.map((os) => {
            const active = detected === os;
            return (
              <li
                key={os}
                data-os={os}
                data-detected={active || undefined}
                className={`flex flex-col rounded-[20px] bg-brand-white p-6 ring-inset ${
                  active ? "ring-2 ring-brand-blue" : "ring-1 ring-brand-rule"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[22px] font-normal tracking-[-0.02em]">{t(`${os}_title`)}</h3>
                  {/* The slot always exists, so the label appearing moves nothing. */}
                  <span
                    className={`font-mono text-[12px] tracking-[0.08em] text-accent-text ${active ? "" : "invisible"}`}
                    aria-hidden={!active}
                  >
                    {t("detected")}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-normal text-brand-body">{t(`${os}_desc`)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {variantsFor(downloads, os).filter((variant) => variant.enabled).map((variant) => (
                    <a
                      key={variant.url}
                      href={variant.url}
                      rel="noopener noreferrer"
                      data-download-os={os}
                      data-download-format={isLinuxFormat(variant) ? variant.type : undefined}
                      className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-navy px-3.5 text-[14px] font-medium text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#142744]"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M10 2v11m-4-4 4 4 4-4M3 14v3h14v-3" />
                      </svg>
                      {variant.label}
                    </a>
                  ))}
                </div>
                {os === "win" && <p className="mt-3 text-[13px] leading-normal text-brand-muted">{t("win_note")}</p>}
              </li>
            );
          })}
        </ul>

        <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] text-brand-body">
          <span>{t("version", { version: downloads.version })}</span>
          <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-brand-ink underline underline-offset-[3px]">
            {t("other_platforms")}
          </a>
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-brand-ink underline underline-offset-[3px]">
            {t("source")}
          </a>
        </p>
      </div>
    </Section>
  );
}

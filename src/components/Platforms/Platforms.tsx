"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { downloads, anyEnabled, type DownloadVariant, type LinuxFormat } from "@/config/downloads";

type Os = "mac" | "win" | "linux";
type Selection = Os | null;

const ORDERED: readonly Os[] = ["mac", "win", "linux"] as const;

const ICONS: Record<Os, string> = {
  mac: "simple-icons:apple",
  win: "simple-icons:windows",
  linux: "simple-icons:linux",
};

function detectOs(): Os | null {
  const ua = navigator.userAgent;
  // Order matters — iPadOS 13+ spoofs Mac UA; mobile tests MUST come first.
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return null;
  if (/Mac OS X|Macintosh/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "win";
  if (/Linux|X11/.test(ua)) return "linux";
  return null;
}

function variantsFor(os: Os): readonly DownloadVariant[] {
  if (os === "mac") return [downloads.macos.arm64, downloads.macos.x64];
  if (os === "win") return [downloads.windows.x64, downloads.windows.arm64];
  return downloads.linux.formats;
}

export default function Platforms() {
  const t = useTranslations("Platforms");
  const [selected, setSelected] = useState<Selection>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const detected = detectOs();
    requestAnimationFrame(() => {
      if (detected) setSelected(detected);
    });
  }, []);

  const onTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
      let next = i;
      if (e.key === "ArrowRight") next = (i + 1) % ORDERED.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + ORDERED.length) % ORDERED.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = ORDERED.length - 1;
      else return;
      e.preventDefault();
      setSelected(ORDERED[next]);
      tabsRef.current[next]?.focus();
    },
    []
  );

  return (
    <section className="bg-ink-2 py-28" aria-labelledby="platforms-heading">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="platforms-heading"
          className="text-3xl font-normal text-text-primary md:text-4xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          {t("heading")}
        </h2>
        <p className="mt-4 text-white-70">{t("subheading")}</p>

        <div
          role="tablist"
          aria-label={t("tablist_label")}
          className="mt-8 flex flex-wrap gap-2"
        >
          {ORDERED.map((o, i) => {
            const active = selected === o;
            return (
              <button
                key={o}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                role="tab"
                id={`platforms-tab-${o}`}
                aria-selected={active}
                aria-controls={`platforms-panel-${o}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(o)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={[
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2 text-sm font-light transition-colors",
                  active
                    ? "border border-accent/40 bg-accent/10 text-accent"
                    : "border border-border bg-[var(--glass-t2-bg)] text-white-70 hover:border-border-hi",
                ].join(" ")}
              >
                <Icon icon={ICONS[o]} width={18} height={18} aria-hidden="true" />
                {t(`tab_${o}`)}
              </button>
            );
          })}
        </div>

        {selected ? (
          anyEnabled(variantsFor(selected)) ? (
            <DownloadCard os={selected} />
          ) : (
            <ComingSoonCard os={selected} />
          )
        ) : (
          <p className="mt-8 text-sm text-white-40">{t("select_prompt")}</p>
        )}
      </div>
    </section>
  );
}

function DownloadCard({ os }: { os: Os }) {
  const t = useTranslations("Platforms");
  const variants = variantsFor(os).filter((v) => v.enabled);

  return (
    <div
      role="tabpanel"
      id={`platforms-panel-${os}`}
      aria-labelledby={`platforms-tab-${os}`}
      tabIndex={0}
      className="mt-8 rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-8 backdrop-blur-[12px] backdrop-saturate-[1.2]"
    >
      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy">
          <Icon
            icon={ICONS[os]}
            width={32}
            height={32}
            className="text-sky"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-normal text-text-primary">
              {t(`panel_${os}_title`)}
            </h3>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-1 text-xs font-light tracking-wide text-[#22C55E]">
              {t("available_label", { version: downloads.version })}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white-70">
            {t(`panel_${os}_desc`)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {variants.map((v) => {
              const format = isLinuxFormat(v) ? v.type : undefined;
              return (
                <a
                  key={v.url}
                  href={v.url}
                  rel="noopener noreferrer"
                  data-download-os={os}
                  data-download-format={format}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm font-light text-accent transition-colors hover:border-accent/50 hover:bg-accent/20"
                >
                  <Icon icon="simple-icons:github" width={16} height={16} aria-hidden="true" />
                  {v.label}
                </a>
              );
            })}
          </div>

          {os === "win" && (
            <p className="mt-4 text-xs text-white-40">{t("windows_smartscreen_note")}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="https://github.com/getdictus/dictus-desktop/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white-70 underline underline-offset-4 hover:text-text-primary"
            >
              {t("view_all_releases")}
            </a>
            <a
              href="https://github.com/getdictus/dictus-desktop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
            >
              <Icon icon="simple-icons:github" width={16} height={16} aria-hidden="true" />
              {t("star_on_github")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function isLinuxFormat(v: DownloadVariant): v is LinuxFormat {
  return "type" in v;
}

function ComingSoonCard({ os }: { os: Os }) {
  const t = useTranslations("Platforms");

  return (
    <div
      role="tabpanel"
      id={`platforms-panel-${os}`}
      aria-labelledby={`platforms-tab-${os}`}
      tabIndex={0}
      className="mt-8 rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-8 opacity-90 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100"
    >
      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy">
          <Icon
            icon={ICONS[os]}
            width={32}
            height={32}
            className="text-sky"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-normal text-text-primary">
            {t(`panel_${os}_title`)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white-70">
            {t(`panel_${os}_desc`)}
          </p>

          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent">
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
                aria-hidden="true"
              />
              {t("coming_soon_label")}
            </span>
          </div>

          <a
            href="https://github.com/getdictus/dictus-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
          >
            <Icon icon="simple-icons:github" width={16} height={16} aria-hidden="true" />
            {t("star_on_github")}
          </a>
        </div>
      </div>
    </div>
  );
}

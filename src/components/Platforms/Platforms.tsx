"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  anyEnabled,
  type DownloadsConfig,
  type DownloadVariant,
  type LinuxFormat,
} from "@/config/downloads";
import styles from "./Platforms.module.css";
import DictationPill from "./DictationPill";

type Os = "mac" | "win" | "linux";
const ORDERED: readonly Os[] = ["mac", "win", "linux"];


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

function variantsFor(downloads: DownloadsConfig, os: Os): readonly DownloadVariant[] {
  if (os === "mac") return [downloads.macos.arm64, downloads.macos.x64];
  if (os === "win") return [downloads.windows.x64, downloads.windows.arm64];
  return downloads.linux.formats;
}

export default function Platforms({ downloads }: { downloads: DownloadsConfig }) {
  const t = useTranslations("Platforms");
  const locale = useLocale();
  const [selected, setSelected] = useState<Os | null>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSelected(detectOs()));
    return () => cancelAnimationFrame(frame);
  }, []);

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % ORDERED.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + ORDERED.length) % ORDERED.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ORDERED.length - 1;
    else return;
    event.preventDefault();
    setSelected(ORDERED[next]);
    tabsRef.current[next]?.focus();
  }

  return (
    <section id="desktop" className={styles.section} aria-labelledby="platforms-heading">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.platform}>{t("platform")}</p>
          <h2 id="platforms-heading" className={styles.heading}>
            {t("title_line_one")}<br />{t("title_line_two")}
          </h2>
          <p className={styles.description}>{t("description")}</p>
          <p className={styles.free}>{t("free")}</p>
        </div>
        <figure className={styles.figure}>
          <Image
            src={`/images/products/desktop-general-${locale === "fr" ? "fr" : "en"}.jpg`}
            width={680}
            height={570}
            sizes="(max-width: 740px) calc(100vw - 48px), (max-width: 1080px) 52vw, 580px"
            alt={t("screenshot_alt")}
            className={styles.screenshot}
          />
          <figcaption>{t("screenshot_caption")}</figcaption>
          <DictationPill />
        </figure>
        <div className={styles.downloads}>
          <div
            role={selected === null ? "group" : "tablist"}
            aria-label={t("tablist_label")}
            className={styles.tabs}
          >
            {ORDERED.map((os, index) => {
              const active = selected === os;
              return (
                <button
                  key={os}
                  ref={(element) => { tabsRef.current[index] = element; }}
                  type="button"
                  role={selected === null ? undefined : "tab"}
                  id={`platforms-tab-${os}`}
                  aria-pressed={selected === null ? false : undefined}
                  aria-selected={selected === null ? undefined : active}
                  aria-controls={selected === null ? undefined : `platforms-panel-${os}`}
                  tabIndex={active || (selected === null && index === 0) ? 0 : -1}
                  onClick={() => setSelected(os)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >
                  {t(`tab_${os}`)}
                </button>
              );
            })}
          </div>
          <div className={styles.panelSpace}>
            {selected === null && <p className={styles.prompt}>{t("select_prompt")}</p>}
            {/* Keep every release URL in the server-rendered HTML for the health monitor. */}
            {ORDERED.map((os) => (
              <div
                key={os}
                role={selected === null ? undefined : "tabpanel"}
                id={`platforms-panel-${os}`}
                aria-labelledby={selected === null ? undefined : `platforms-tab-${os}`}
                tabIndex={selected === os ? 0 : undefined}
                hidden={selected !== os}
                className={styles.panel}
              >
                <p className={styles.platformDescription}>{t(`panel_${os}_desc`)}</p>
                {anyEnabled(variantsFor(downloads, os)) ? (
                  <>
                    <DownloadLinks os={os} downloads={downloads} />
                    {os === "win" && <p className={styles.note}>{t("windows_smartscreen_note")}</p>}
                  </>
                ) : <p className={styles.note}>{t("coming_soon_label")}</p>}
              </div>
            ))}
          </div>
          <div className={styles.meta}>
            <span>{downloads.version}</span>
            <a href="https://github.com/getdictus/dictus-desktop/releases" target="_blank" rel="noopener noreferrer">{t("view_all_releases")}</a>
            <a href="https://github.com/getdictus/dictus-desktop" target="_blank" rel="noopener noreferrer">{t("star_on_github")}</a>
          </div>
        </div>
      </div>
      <noscript>
        <div className={styles.noScript}>
          <h3>{t("noscript_label")}</h3>
          {ORDERED.map((os) => (
            <div key={os}>
              <h4>{t(`panel_${os}_title`)}</h4>
              <p>{t(`panel_${os}_desc`)}</p>
              {anyEnabled(variantsFor(downloads, os))
                ? <DownloadLinks os={os} downloads={downloads} />
                : <p>{t("coming_soon_label")}</p>}
              {os === "win" && <p>{t("windows_smartscreen_note")}</p>}
            </div>
          ))}
        </div>
      </noscript>
    </section>
  );
}

function DownloadLinks({ os, downloads }: { os: Os; downloads: DownloadsConfig }) {
  return (
    <div className={styles.links}>
      {variantsFor(downloads, os).filter((variant) => variant.enabled).map((variant) => (
        <a
          key={variant.url}
          href={variant.url}
          rel="noopener noreferrer"
          data-download-os={os}
          data-download-format={isLinuxFormat(variant) ? variant.type : undefined}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M10 2v11m-4-4 4 4 4-4M3 14v3h14v-3" />
          </svg>
          {variant.label}
        </a>
      ))}
    </div>
  );
}

function isLinuxFormat(variant: DownloadVariant): variant is LinuxFormat {
  return "type" in variant;
}

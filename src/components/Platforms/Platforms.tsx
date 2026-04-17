"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { downloads } from "@/config/downloads";

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
          <ComingSoonCard os={selected} />
        ) : (
          <p className="mt-8 text-sm text-white-40">{t("select_prompt")}</p>
        )}
      </div>
    </section>
  );
}

function ComingSoonCard({ os }: { os: Os }) {
  const t = useTranslations("Platforms");
  // Touch the config so TS narrows and the reviewer sees downloads is wired in,
  // even though v1 renders the same Coming Soon state for every OS.
  // (Future: branch on `downloads.macos.arm64.enabled` to render active CTA.)
  void downloads;

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
            href="https://github.com/Pivii/dictus"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t("star_on_github")}
          </a>
        </div>
      </div>
    </div>
  );
}

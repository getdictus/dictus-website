"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./AppStrip.module.css";

/**
 * App icons from Apple's iTunes lookup API (artworkUrl512, country=fr),
 * resized to 152 px WebP. Third-party marks: the line under the strip
 * says Dictus is not affiliated with them.
 */
const apps = ["whatsapp", "messages", "mail", "notes", "slack", "gmail", "instagram", "telegram"] as const;

/** 24 slots, three rounds of the eight apps, spread evenly along the wave. */
const SLOTS = 24;

/**
 * A sine wave as one smooth SVG path (Catmull-Rom through samples every
 * 1/16 wavelength). The icons follow it with `offset-path`, so the wave is
 * anchored to the screen and each icon rises and falls as it drifts past.
 */
function wavePath(width: number, height: number, amplitude: number, wavelength: number) {
  const step = wavelength / 16;
  const cy = height / 2;
  const points: [number, number][] = [];
  for (let x = 0; x <= width + step / 2; x += step) {
    points.push([x, cy + amplitude * Math.sin((2 * Math.PI * x) / wavelength)]);
  }
  let d = `M${points[0][0]} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `path("${d}")`;
}

// Widths are wider than the screens they serve, so the jump from the end of
// the path back to its start happens out of sight. Heights match --h in the
// CSS and leave room for the tilted icons and their shadows.
const WAVES = {
  "--wave-sm": wavePath(1600, 140, 12, 420),
  "--wave-lg": wavePath(2880, 204, 22, 760),
} as CSSProperties;

/**
 * The hero's app strip, after the App Store slides: app icons drifting
 * slowly along one soft wave, each with a gentle float of its own. The
 * motion is CSS only (offset-path + offset-distance), so the server markup
 * already holds every icon in place: no layout shift, and the strip box has
 * a fixed height. Off-screen or paused with the button (WCAG 2.2.2) it holds
 * its frame. Under reduced motion it is paused on the frame set by the
 * negative delays, the same evenly spread strip, and the button is hidden.
 * The button sits in the caption row under the strip, next to `children`
 * (the not-affiliated line), so it never covers an icon.
 */
export default function AppStrip({ className, children }: { className?: string; children?: ReactNode }) {
  const t = useTranslations("Hero");
  const stripRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const sync = () => {
      strip.dataset.paused = String(paused || !visibleRef.current);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      sync();
    });
    observer.observe(strip);
    sync();
    return () => observer.disconnect();
  }, [paused]);

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <div ref={stripRef} data-app-strip role="img" aria-label={t("apps_label")} className={styles.strip} style={WAVES}>
        <div className={styles.track}>
          {Array.from({ length: SLOTS }, (_, i) => (
            <div key={i} className={styles.slot} style={{ "--f": i / SLOTS, "--b": (i % 5) / 5 } as CSSProperties}>
              <div className={styles.float}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 152 px WebP already sized for the strip */}
                <img className={styles.tile} src={`/images/apps/${apps[i % apps.length]}.webp`} alt="" width={76} height={76} decoding="async" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.caption}>
        {children}
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={paused}
          aria-label={t("strip_pause")}
          onClick={() => setPaused((value) => !value)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            {paused
              ? <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
              : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

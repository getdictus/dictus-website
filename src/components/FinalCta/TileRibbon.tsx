"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./TileRibbon.module.css";

type TileKind = "bubble" | "mail" | "note" | "spark";

/** Generic app tiles: no third-party logos, decorative only. */
const kinds: readonly TileKind[] = ["bubble", "mail", "note", "spark", "bubble", "note", "mail", "spark"];
const tilts = [-6, 4, -2, 7, -4, 3, -7, 5];
const drops = [0, 14, -8, 10, -4, 12, -10, 6];

function Glyph({ kind }: { kind: TileKind }) {
  if (kind === "bubble") return <span className={styles.bubble} />;
  if (kind === "note") {
    return (
      <span className={styles.note}>
        <span /><span /><span />
      </span>
    );
  }
  if (kind === "mail") {
    return (
      <svg className={styles.mail} viewBox="0 0 27 20" fill="none" strokeWidth="2.5">
        <rect x="1.5" y="1.5" width="24" height="17" rx="3" stroke="#fff" />
        <polyline points="3,4 13.5,11 24,4" stroke="#6BA3FF" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={styles.spark} viewBox="0 0 24 24">
      <path d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z" fill="#fff" />
    </svg>
  );
}

/**
 * The CTA's tile marquee. It moves by `transform` only (a CSS animation),
 * holds its frame while off-screen and is a static row under reduced motion.
 * A pause button stops it for good (WCAG 2.2.2).
 */
export default function TileRibbon({ className }: { className?: string }) {
  const t = useTranslations("FinalCta");
  const trackRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      track.dataset.playing = String(entry.isIntersecting && !paused);
    });
    observer.observe(track);
    track.dataset.playing = String(visibleRef.current && !paused);
    return () => observer.disconnect();
  }, [paused]);

  // Two identical halves of 24 tiles (about 3,550 px at desktop size), so the
  // -50% loop lands on the same frame and covers a 2,560 px wide screen.
  const tiles = Array.from({ length: 6 }, () => kinds).flat();

  return (
    <div className={`${styles.viewport} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={paused}
        aria-label={t("ribbon_pause")}
        onClick={() => setPaused((value) => !value)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          {paused
            ? <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
            : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" />}
        </svg>
      </button>
      <div ref={trackRef} data-playing="false" aria-hidden="true" className={styles.track}>
        {tiles.map((kind, index) => (
          <div
            key={index}
            className={styles.slot}
            style={{ transform: `rotate(${tilts[index % 8]}deg) translateY(${drops[index % 8]}px)` }}
          >
            <span className={styles.tile} data-kind={kind}>
              <Glyph kind={kind} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

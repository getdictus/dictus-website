"use client";

import { useEffect, useRef } from "react";
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
 */
export default function TileRibbon({ className }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(([entry]) => {
      track.dataset.playing = String(entry.isIntersecting);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Two identical halves, so the -50% loop lands on the same frame.
  const tiles = [...kinds, ...kinds, ...kinds, ...kinds];

  return (
    <div aria-hidden="true" className={`${styles.viewport} ${className ?? ""}`}>
      <div ref={trackRef} data-playing="false" className={styles.track}>
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

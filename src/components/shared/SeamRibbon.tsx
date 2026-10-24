"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./SeamRibbon.module.css";

/**
 * Blue uses navy text: white on #3D7EFF is 3.73:1 and fails for small text,
 * navy on it is 4.86:1. Navy uses white text (17:1).
 */
const toneClasses = {
  blue: "bg-brand-blue text-brand-ink",
  navy: "bg-brand-navy text-white",
} as const;

const dotClasses = {
  blue: "bg-brand-ink",
  navy: "bg-accent-hi",
} as const;

type Props = {
  items: string[];
  tone?: keyof typeof toneClasses;
  /** Copies of `items` in each half of the loop; enough to cover the widest screen. */
  repeat?: number;
  /** One full loop, in seconds. Linear, so the speed stays constant. */
  duration?: number;
  className?: string;
};

/**
 * The tilted marquee band between two sections. It moves by `transform`
 * only (a CSS animation, off the main thread), holds still while off-screen,
 * and under reduced motion stays put as a static band.
 */
export default function SeamRibbon({ items, tone = "blue", repeat = 4, duration = 40, className }: Props) {
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const observer = new IntersectionObserver(([entry]) => {
      band.dataset.playing = String(entry.isIntersecting);
    });
    observer.observe(band);
    return () => observer.disconnect();
  }, []);

  const half = Array.from({ length: repeat }, () => items).flat();

  return (
    <div className={`${styles.viewport} ${className ?? ""}`}>
      <ul className="sr-only">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div
        ref={bandRef}
        data-playing="false"
        aria-hidden="true"
        className={`${styles.band} ${toneClasses[tone]} py-3`}
        style={{ "--seam-duration": `${duration}s` } as CSSProperties}
      >
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {half.map((item, index) => (
                <span key={index} className="flex items-center gap-6 pr-6 text-sm font-medium uppercase tracking-[0.1em] whitespace-nowrap">
                  {item}
                  <span className={`size-1.5 rounded-full ${dotClasses[tone]}`} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

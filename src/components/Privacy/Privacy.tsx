"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import styles from "./Privacy.module.css";

// Set once the entrance has played in this tab. Storage can be blocked, in
// which case the entrance may simply play again.
const REVEALED_KEY = "dictus:privacy-revealed";
const revealedBefore = () => {
  try { return sessionStorage.getItem(REVEALED_KEY) === "1"; } catch { return false; }
};
const markRevealed = () => {
  try { sessionStorage.setItem(REVEALED_KEY, "1"); } catch { /* blocked storage */ }
};
// The element the URL hash points at. A malformed escape (`#%zz`) is no target.
const hashTarget = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try { return document.getElementById(decodeURIComponent(hash)); } catch { return document.getElementById(hash); }
};

/**
 * Cards rise into place once, each the first time it scrolls into view;
 * cards arriving together are 60ms apart. Nothing is hidden when the cards
 * are already on screen (direct arrival, `#vie-privee` landing, reload, back
 * navigation) or under reduced motion, and the server markup is always visible.
 */
function useRevealOnce() {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // A hash landing scrolls here after this runs, so it counts as on screen.
    const target = hashTarget();
    const landing = target?.contains(root) || root.closest("section")?.contains(target);
    // A reload or a back/forward (browser or client-side) restores the scroll
    // after this runs: content already seen does not play its entrance again.
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const restored = navigation?.type === "reload" || navigation?.type === "back_forward"
      || revealedBefore();
    if (reduce.matches || landing || restored || root.getBoundingClientRect().top < window.innerHeight) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-reveal-item]")];
    root.dataset.reveal = "pending";
    // Shown at once, without a transition (Privacy.module.css).
    const showAll = () => {
      observer.disconnect();
      root.dataset.reveal = "shown";
      markRevealed();
    };
    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, order) => {
          const item = entry.target as HTMLElement;
          observer.unobserve(item);
          item.style.transitionDelay = `${order * 60}ms`;
          item.dataset.revealItem = "shown";
          markRevealed();
        });
    }, { threshold: 0.2 });
    items.forEach((item) => observer.observe(item));
    // Keyboard focus inside the cards, or switching reduced motion on, shows
    // everything at once.
    root.addEventListener("focusin", showAll, { once: true });
    reduce.addEventListener("change", showAll, { once: true });
    return () => {
      observer.disconnect();
      delete root.dataset.reveal;
      root.removeEventListener("focusin", showAll);
      reduce.removeEventListener("change", showAll);
    };
  }, []);
  return ref;
}

// Pointer tilt (#117): up to 4deg around each axis and a 6px shift toward
// the pointer, on top of the card's resting rotation (held by the <li>).
const TILT_DEG = 4;
const SHIFT_PX = 6;
const TILT_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function tilt(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse" || !window.matchMedia(TILT_QUERY).matches) return;
  const surface = event.currentTarget;
  // The untilted <li> is the reference, so the tilt never feeds back into it.
  const box = (surface.parentElement ?? surface).getBoundingClientRect();
  const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1) - 0.5;
  const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1) - 0.5;
  surface.dataset.tilting = "";
  surface.style.transform = `perspective(1000px) rotateX(${(-y * 2 * TILT_DEG).toFixed(2)}deg) `
    + `rotateY(${(x * 2 * TILT_DEG).toFixed(2)}deg) translate3d(${(x * 2 * SHIFT_PX).toFixed(1)}px, ${(y * 2 * SHIFT_PX).toFixed(1)}px, 0)`;
}

function untilt(event: PointerEvent<HTMLDivElement>) {
  const surface = event.currentTarget;
  delete surface.dataset.tilting;
  surface.style.removeProperty("transform");
}

/** The visible card: tilts toward a fine pointer, eases back on leave. */
function CardSurface({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`${styles.surface} ${className}`} onPointerMove={tilt} onPointerLeave={untilt} onPointerCancel={untilt}>
      {children}
    </div>
  );
}

const sourceLink = "inline-flex min-h-11 items-center text-[15px] text-brand-body underline decoration-brand-rule-strong underline-offset-4 hover:text-brand-ink";

/**
 * v4b Privacy & Open source section (`#vie-privee`). Grey ground whose
 * rounded top overlaps the section above; three tilted cards that lean
 * toward a fine pointer.
 * `#open-source` stays on the open source card for older links to it.
 */
export default function Privacy() {
  const t = useTranslations("PrivacySection");
  const tCommon = useTranslations("common");
  const cardsRef = useRevealOnce();

  return (
    <Section
      tone="grey"
      overlapTop
      id="vie-privee"
      aria-labelledby="vie-privee-title"
      className="py-[clamp(80px,10vw,150px)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <p className="font-mono text-[13px] tracking-[0.1em] text-accent-text">{t("eyebrow")}</p>
        <h2
          id="vie-privee-title"
          className="mt-3.5 max-w-[900px] text-[clamp(40px,5.8vw,88px)] font-light leading-[0.98] tracking-[-0.045em] [text-wrap:balance]"
        >
          {t("title")}
        </h2>

        <ul ref={cardsRef} className={styles.cards}>
          <li className={`${styles.card} ${styles.cardDevice} ${styles.reveal}`} data-reveal-item="">
            <CardSurface className="bg-brand-white">
              <span aria-hidden="true" className={`${styles.icon} bg-brand-blue`}>
                <span className={styles.phone} />
              </span>
              <h3 className="mt-[22px] text-[clamp(26px,2.3vw,34px)] font-normal leading-[1.1] tracking-[-0.03em]">
                {t("device.title")}
              </h3>
              <p className="mt-2.5 text-[17px] leading-normal text-brand-body">
                {tCommon("voiceNeverLeaves")} {t("device.body")}
              </p>
            </CardSurface>
          </li>

          <li className={`${styles.card} ${styles.cardTracking} ${styles.reveal}`} data-reveal-item="">
            <CardSurface className="bg-brand-blue">
              <span aria-hidden="true" className={`${styles.icon} bg-brand-navy text-[26px] font-semibold text-white`}>
                ∅
              </span>
              <h3 className="mt-[22px] text-[clamp(26px,2.3vw,34px)] font-normal leading-[1.1] tracking-[-0.03em]">
                {t("tracking.title")}
              </h3>
              <p className="mt-2.5 text-[17px] leading-normal">{t("tracking.body")}</p>
            </CardSurface>
          </li>

          <li
            id="open-source"
            className={`${styles.card} ${styles.cardSource} ${styles.reveal}`}
            data-reveal-item=""
          >
            <CardSurface className="bg-brand-white">
              <span aria-hidden="true" className={`${styles.icon} bg-brand-navy font-mono text-[20px] text-[#93C5FD]`}>
                &lt;/&gt;
              </span>
              <h3 className="mt-[22px] text-[clamp(26px,2.3vw,34px)] font-normal leading-[1.1] tracking-[-0.03em]">
                {t("source.title")}
              </h3>
              <p className="mt-2.5 text-[17px] leading-normal text-brand-body">{t("source.body")}</p>
              <a
                href="https://github.com/getdictus"
                target="_blank"
                rel="noopener noreferrer"
                className="button-lift mt-5 inline-flex h-12 items-center gap-1.5 rounded-full bg-brand-navy px-5 text-[15px] font-semibold text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#142744]"
              >
                {t("source.cta")}
                <span aria-hidden="true">→</span>
              </a>
              <p className="mt-2 flex flex-wrap gap-x-5">
                <a href="https://github.com/getdictus/dictus-ios" target="_blank" rel="noopener noreferrer" className={sourceLink}>
                  {t("source.ios")}
                </a>
                <a href="https://github.com/getdictus/dictus-desktop" target="_blank" rel="noopener noreferrer" className={sourceLink}>
                  {t("source.desktop")}
                </a>
              </p>
            </CardSurface>
          </li>
        </ul>
      </div>
    </Section>
  );
}

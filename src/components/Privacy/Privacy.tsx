"use client";

import { useEffect, useRef } from "react";
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

const sourceLink = "inline-flex min-h-11 items-center text-[15px] text-brand-body underline decoration-brand-rule-strong underline-offset-4 hover:text-brand-ink";

/**
 * v4b Privacy & Open source section (`#vie-privee`). Grey ground whose
 * rounded top overlaps the section above; three statically tilted cards.
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
          <li className={`${styles.card} ${styles.cardDevice} ${styles.reveal} bg-brand-white`} data-reveal-item="">
            <span aria-hidden="true" className={`${styles.icon} bg-brand-blue`}>
              <span className={styles.phone} />
            </span>
            <h3 className="mt-[22px] text-[clamp(26px,2.3vw,34px)] font-normal leading-[1.1] tracking-[-0.03em]">
              {t("device.title")}
            </h3>
            <p className="mt-2.5 text-[17px] leading-normal text-brand-body">
              {tCommon("voiceNeverLeaves")} {t("device.body")}
            </p>
          </li>

          <li className={`${styles.card} ${styles.cardTracking} ${styles.reveal} bg-brand-blue`} data-reveal-item="">
            <span aria-hidden="true" className={`${styles.icon} bg-brand-navy text-[26px] font-semibold text-white`}>
              ∅
            </span>
            <h3 className="mt-[22px] text-[clamp(26px,2.3vw,34px)] font-normal leading-[1.1] tracking-[-0.03em]">
              {t("tracking.title")}
            </h3>
            <p className="mt-2.5 text-[17px] leading-normal">{t("tracking.body")}</p>
          </li>

          <li
            id="open-source"
            className={`${styles.card} ${styles.cardSource} ${styles.reveal} bg-brand-white`}
            data-reveal-item=""
          >
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
              className="mt-5 inline-flex h-12 items-center gap-1.5 rounded-full bg-brand-navy px-5 text-[15px] font-semibold text-white"
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
          </li>
        </ul>
      </div>
    </Section>
  );
}

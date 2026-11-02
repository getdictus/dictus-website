"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import { pricingValues } from "@/config/pricing";
import { faqKeys } from "./faqItems";
import styles from "./Faq.module.css";

/**
 * v4b FAQ (`#faq`): grey ground, one answer open at a time, the first one
 * open on arrival as in the mockup. Answers open and close with a short
 * height transition (Faq.module.css).
 */
export default function Faq() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const [open, setOpen] = useState<string | null>(faqKeys[0]);
  // The answer above the clicked question shrinks while the clicked one grows:
  // the page scrolls by the same amount on every frame of the transition, so
  // the clicked question stays under the pointer and nothing snaps.
  const anchor = useRef<{ button: HTMLButtonElement; top: number } | null>(null);
  useLayoutEffect(() => {
    const target = anchor.current;
    if (!target) return;
    anchor.current = null;
    const hold = () => {
      const shift = target.button.getBoundingClientRect().top - target.top;
      if (shift !== 0) window.scrollBy({ top: shift, behavior: "instant" });
    };
    hold();
    // Computed durations always read in seconds, e.g. "0.24s, 0s".
    const answer = document.getElementById(target.button.getAttribute("aria-controls") ?? "");
    const duration = answer ? parseFloat(getComputedStyle(answer).transitionDuration) * 1000 || 0 : 0;
    const end = performance.now() + duration + 50;
    let frame = requestAnimationFrame(function step(now) {
      hold();
      if (now < end) frame = requestAnimationFrame(step);
    });
    // A scroll by the user takes over: stop holding the question in place.
    const release = () => cancelAnimationFrame(frame);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    return () => {
      release();
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
    };
  }, [open]);

  return (
    <Section tone="grey" id="faq" aria-labelledby="faq-title" className="py-[clamp(80px,10vw,150px)]">
      <div className="mx-auto max-w-[920px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <h2
          id="faq-title"
          className="text-[clamp(40px,5.8vw,88px)] font-light leading-[0.98] tracking-[-0.045em] [text-wrap:balance]"
        >
          {t("faq_title")}
        </h2>

        <div className="mt-[clamp(32px,4vw,56px)] border-t border-brand-rule-strong">
          {faqKeys.map((key) => {
            const isOpen = open === key;
            return (
              <div key={key} className="border-b border-brand-rule-strong">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${key}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${key}`}
                    onClick={(event) => {
                      anchor.current = { button: event.currentTarget, top: event.currentTarget.getBoundingClientRect().top };
                      setOpen(isOpen ? null : key);
                    }}
                    className={`${styles.trigger} flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-5 py-4 text-left text-[clamp(18px,1.6vw,22px)] font-medium leading-[1.3]`}
                  >
                    {t(`faq.${key}.question`)}
                    <span aria-hidden="true" className={styles.icon} data-open={isOpen || undefined}>
                      <span className={styles.plus} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${key}`}
                  role="region"
                  aria-labelledby={`faq-q-${key}`}
                  data-open={isOpen || undefined}
                  className={styles.answer}
                >
                  <div>
                    <p className="pb-6 pr-[clamp(0px,5vw,56px)] text-[17px] leading-[1.55] text-brand-body">
                      {t(`faq.${key}.answer`, values)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

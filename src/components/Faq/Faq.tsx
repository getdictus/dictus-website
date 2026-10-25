"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import { pricingValues } from "@/config/pricing";
import { faqKeys } from "./faqItems";
import styles from "./Faq.module.css";

/**
 * v4b FAQ (`#faq`): grey ground, one answer open at a time, the first one
 * open on arrival as in the mockup. Opening shows the answer at its full
 * height at once and only fades its text down into place; closing is
 * instant (Faq.module.css).
 */
export default function Faq() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const [open, setOpen] = useState<string | null>(faqKeys[0]);
  // The answer open on arrival is already there: only a click animates.
  const [toggled, setToggled] = useState(false);
  // The answer above the clicked question may close at once: the page scrolls
  // by the same amount so the clicked question stays under the pointer.
  const anchor = useRef<{ button: HTMLButtonElement; top: number } | null>(null);
  useLayoutEffect(() => {
    if (!anchor.current) return;
    const { button, top } = anchor.current;
    anchor.current = null;
    const shift = button.getBoundingClientRect().top - top;
    if (shift !== 0) window.scrollBy({ top: shift, behavior: "instant" });
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
                      setToggled(true);
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
                  hidden={!isOpen}
                  className={toggled ? styles.answerIn : undefined}
                >
                  <p className="pb-6 pr-[clamp(0px,5vw,56px)] text-[17px] leading-[1.55] text-brand-body">
                    {t(`faq.${key}.answer`, values)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

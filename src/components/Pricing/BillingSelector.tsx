"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { billingPlans, pricingValues, type BillingPlan } from "@/config/pricing";
import GlassSurface from "@/components/shared/GlassSurface";
import GlassSelectorLens from "@/components/shared/GlassSelectorLens";
import { useGlassSelector } from "@/components/shared/useGlassSelector";
import styles from "./Pricing.module.css";

export default function BillingSelector() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const [plan, setPlan] = useState<BillingPlan>("yearly");
  const { groupRef, groupProps, geometry, keyboard } = useGlassSelector(plan);

  return (
    <div className={styles.billing}>
      <fieldset className={styles.interactiveBilling}>
        <legend className="sr-only">{t("billing_label")}</legend>
        <GlassSurface className={styles.selectorSurface} style={{ display: "block" }}>
          <div className={styles.selector} ref={groupRef} {...groupProps}>
            <GlassSelectorLens geometry={geometry} keyboard={keyboard} />
            {billingPlans.map((key) => (
              <label key={key} data-lens-key={key} data-selected={plan === key || undefined}>
                <input type="radio" name="billing" value={key} checked={plan === key}
                  onChange={() => setPlan(key)} className="sr-only" aria-controls="billing-details" />
                {t(`plans.${key}.label`)}
              </label>
            ))}
          </div>
        </GlassSurface>
      </fieldset>
      <div id="billing-details" className={styles.billingDetails} aria-live="polite" aria-atomic="true" data-billing-plan={plan}>
        <p className={styles.price}><span>{values[plan]}</span> <span className={styles.frequency}>{t(`plans.${plan}.frequency`)}</span></p>
        <p className={styles.billingKind}>{t(`plans.${plan}.kind`)}</p>
        <p className={styles.billingNote}>{t(`plans.${plan}.detail`, values)}</p>
      </div>
      <noscript>
        <style>{`.${styles.interactiveBilling}, .${styles.billingDetails} { display: none; }`}</style>
        <dl className={styles.staticPlans}>
          {billingPlans.map((key) => (
            <div key={key}>
              <dt>{t(`plans.${key}.label`)} · {values[key]} {t(`plans.${key}.frequency`)}</dt>
              <dd>{t(`plans.${key}.detail`, values)}</dd>
            </div>
          ))}
        </dl>
      </noscript>
      <p className={styles.territory}>{t("territory")}</p>
    </div>
  );
}

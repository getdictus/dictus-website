"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { billingPlans, pricingValues, type BillingPlan } from "@/config/pricing";
import GlassSurface from "@/components/shared/GlassSurface";
import GlassSelectorLens from "@/components/shared/GlassSelectorLens";
import { useGlassSelector } from "@/components/shared/useGlassSelector";
import styles from "./Pricing.module.css";

const BillingContext = createContext<{ plan: BillingPlan; setPlan: (plan: BillingPlan) => void } | null>(null);

function useBilling() {
  const context = useContext(BillingContext);
  if (!context) throw new Error("Billing controls require BillingProvider");
  return context;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<BillingPlan>("yearly");
  return <BillingContext.Provider value={{ plan, setPlan }}>{children}</BillingContext.Provider>;
}

export default function BillingSelector() {
  const t = useTranslations("Pricing");
  const { plan, setPlan } = useBilling();
  const { groupRef, groupProps, geometry, keyboard } = useGlassSelector(plan);

  return (
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
      <noscript><style>{`.${styles.interactiveBilling} { display: none; }`}</style></noscript>
    </fieldset>
  );
}

export function BillingPrice() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const { plan } = useBilling();
  return (
    <div id="billing-details" className={styles.billingDetails} aria-live="polite" aria-atomic="true" data-billing-plan={plan}>
      <p className={styles.price}>{values[plan]}</p>
      <p className={styles.frequency}>{t(`plans.${plan}.frequency`)}</p>
      <span className="sr-only">{t(`plans.${plan}.kind`)}. {t(`plans.${plan}.detail`, values)}</span>
    </div>
  );
}

export function BillingNote() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const { plan } = useBilling();
  return (
    <div className={styles.billingNote} data-billing-note>
      <p>{t(`plans.${plan}.detail`, values)}</p>
      <p className={styles.territory}>{t("territory")}</p>
      {plan === "lifetime" && <details className={styles.lifetimeScope}>
        <summary>{t("lifetime_label")}</summary><p>{t("lifetime_scope")}</p>
      </details>}
      <noscript>
        <dl className={styles.staticPlans}>{billingPlans.map((key) => <div key={key}>
          <dt>{t(`plans.${key}.label`)} · {values[key]} {t(`plans.${key}.frequency`)}</dt>
          <dd>{t(`plans.${key}.detail`, values)}</dd>
        </div>)}</dl>
      </noscript>
    </div>
  );
}

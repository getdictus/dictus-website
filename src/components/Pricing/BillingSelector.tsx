"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { billingPlans, pricingValues, type BillingPlan } from "@/config/pricing";
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

/**
 * Segmented switch inside the blue Pro card: a solid white pill slides under
 * the selected plan. Native radios keep arrow-key navigation. Hidden without
 * JavaScript: BillingNote lists every plan instead.
 */
export default function BillingSelector() {
  const t = useTranslations("Pricing");
  const { plan, setPlan } = useBilling();
  const index = billingPlans.indexOf(plan);

  return (
    <fieldset className={styles.interactiveBilling}>
      <legend className="sr-only">{t("billing_label")}</legend>
      <div className={styles.selector}>
        <span aria-hidden="true" className={styles.thumb} data-billing-thumb style={{ transform: `translateX(${index * 100}%)` }} />
        {billingPlans.map((key) => (
          <label key={key} data-plan-key={key} data-selected={plan === key || undefined}>
            <input type="radio" name="billing" value={key} checked={plan === key}
              onChange={() => setPlan(key)} className="sr-only" aria-controls="billing-details" />
            {t(`plans.${key}.label`)}
          </label>
        ))}
      </div>
      <noscript><style>{`.${styles.interactiveBilling} { display: none; }`}</style></noscript>
    </fieldset>
  );
}

/** Price of the selected plan. White is allowed here: the amount is display size. */
export function BillingPrice() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const { plan } = useBilling();
  return (
    <div id="billing-details" className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite" aria-atomic="true" data-billing-plan={plan}>
      <p className="whitespace-nowrap text-[clamp(56px,6vw,76px)] font-light leading-none tracking-[-0.05em] text-brand-white">{values[plan]}</p>
      <p className="text-[16px]">{t(`plans.${plan}.frequency`)}</p>
      <span className="sr-only">{t(`plans.${plan}.kind`)}. {t(`plans.${plan}.detail`, values)}</span>
    </div>
  );
}

/** Billing terms of the selected plan, and every plan when JavaScript is off. */
export function BillingNote() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());
  const { plan } = useBilling();
  return (
    <div className="mt-3 text-[14px] leading-[1.5]" data-billing-note>
      <p>{t(`plans.${plan}.detail`, values)}</p>
      <p className="mt-0.5 text-[13px]">{t("territory")}</p>
      <noscript>
        <dl className="mt-4 grid gap-3">{billingPlans.map((key) => <div key={key}>
          <dt className="font-medium">{t(`plans.${key}.label`)} · {values[key]} {t(`plans.${key}.frequency`)}</dt>
          <dd>{t(`plans.${key}.detail`, values)}</dd>
        </div>)}</dl>
      </noscript>
    </div>
  );
}

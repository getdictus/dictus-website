/** France/EUR reference for the preview. Confirm the live Apple catalogue before publication. */
export const proCatalogue = {
  currency: "EUR",
  territory: "FR",
  trialDays: 7,
  historyLimit: 200,
  plans: {
    monthly: { cents: 499, productId: "solutions.pivi.dictus.pro.monthly" },
    yearly: { cents: 3999, productId: "solutions.pivi.dictus.pro.yearly" },
    lifetime: { cents: 14999, productId: "solutions.pivi.dictus.pro.lifetime" },
  },
} as const;

export const billingPlans = ["monthly", "yearly", "lifetime"] as const;
export type BillingPlan = (typeof billingPlans)[number];
export const freeFeatures = ["dictation", "normal", "models", "activity"] as const;
export const proFeatures = ["smart", "vocabulary", "history"] as const;

export function pricingValues(locale: string) {
  const currency = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-IE", {
    style: "currency", currency: proCatalogue.currency,
  });
  return {
    monthly: currency.format(proCatalogue.plans.monthly.cents / 100),
    yearly: currency.format(proCatalogue.plans.yearly.cents / 100),
    lifetime: currency.format(proCatalogue.plans.lifetime.cents / 100),
    trialDays: proCatalogue.trialDays,
    historyLimit: proCatalogue.historyLimit,
  };
}

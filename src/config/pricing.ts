/**
 * Dictus Pro catalogue, France/EUR reference.
 * Confirmed for launch: prices, currency, 14-day trial and 200-dictation history; no founder offer.
 * Copy never repeats these values; it reads them through pricingValues().
 */
export const proCatalogue = {
  // "available" since Dictus 2.0 ships Pro. "upcoming" restores every "coming with Dictus 2.0" sentence.
  launch: "available" as "upcoming" | "available",
  currency: "EUR",
  territory: "FR",
  // Reverse trial: Pro unlocked for free, no purchase or subscription, never charged at the end.
  trialDays: 14,
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
export const proFeatures = ["smart", "vocabulary", "history", "voiceNotes"] as const;

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
    proLaunch: proCatalogue.launch,
  };
}

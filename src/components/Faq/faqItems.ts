/**
 * Questions of the home FAQ (`#faq`), in display order. Each key reads
 * `Pricing.faq.<key>` with `pricingValues()`, so the FAQPage JSON-LD and the
 * accordion always carry the same text. `plans` and `lifetime` stay on
 * /pricing: their answers carry amounts.
 */
export const faqKeys = ["privacy", "free", "compatibility", "trial", "history", "platforms"] as const;

import { isSitePreview } from "./preview";

/** Release gate: open on launch day, once Dictus 2.0 with Pro is live on the App Store. */
export const isPricingPublic: boolean = true;
export const isPricingAvailable = isSitePreview || isPricingPublic;

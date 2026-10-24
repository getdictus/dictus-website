import { isSitePreview } from "./preview";

/** Release gate: flip only after Pierre approves prices and copy. */
export const isPricingPublic: boolean = false;
export const isPricingAvailable = isSitePreview || isPricingPublic;

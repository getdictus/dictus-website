import { isSitePreview } from "./preview";

/** Release gate: change only after separate approval of the bilingual editorial launch. */
export const isBlogPublic: boolean = false;
export const isBlogAvailable = isSitePreview || isBlogPublic;

/** Server-side gate: unfinished editorial and commercial pages never ship publicly. */
export const isSitePreview =
  process.env.VERCEL_ENV !== "production" &&
  (process.env.DICTUS_SITE_PREVIEW === "1" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development");

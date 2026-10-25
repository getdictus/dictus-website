import { DM_Sans, Kalam } from "next/font/google";

/**
 * DM Sans with its optical-size axis, for the hero headline only: at display
 * sizes it draws the tighter cut the v4b mockup uses. The site-wide DM Sans
 * (layout.tsx) stays without the axis, so nothing else changes.
 */
export const dmSansDisplay = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

/**
 * Handwriting of the hero's result phrase. Decorative and never the LCP
 * element, so it is not preloaded; until it loads, the phrase shows in the
 * fallback face.
 */
export const kalam = Kalam({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

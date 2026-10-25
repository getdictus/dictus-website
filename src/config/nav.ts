/**
 * Entries of the v4b nav pill and menu sheet (epic #51, item 3), in order.
 *
 * - `section`: id of a home-page section. The entry links there only once
 *   `live` is true; each section PR flips its own entry when the id ships.
 * - `route`: page the entry links to while its section is not live (or for
 *   good, when it has no section).
 * - `gate`: release gate that must be open for the entry to show at all
 *   (`isBlogAvailable`, `isPricingAvailable`, passed in by the layout).
 *   Closed in production, so no Pricing or Blog link ships there.
 */
export type NavGate = "blog" | "pricing";
export type NavLabelKey = "features" | "pro" | "languages" | "privacy" | "pricing" | "blog";

type NavEntry = {
  labelKey: NavLabelKey;
  section?: string;
  live?: boolean;
  route?: string;
  gate?: NavGate;
};

export const navEntries: readonly NavEntry[] = [
  { labelKey: "features", section: "clavier", live: true },
  { labelKey: "pro", section: "pro", live: false },
  { labelKey: "languages", section: "langues", live: true },
  { labelKey: "privacy", section: "vie-privee", live: true },
  { labelKey: "pricing", section: "tarifs", live: false, route: "/pricing", gate: "pricing" },
  { labelKey: "blog", route: "/blog", gate: "blog" },
];

export type NavLink =
  | { kind: "section"; labelKey: NavLabelKey; id: string }
  | { kind: "route"; labelKey: NavLabelKey; href: string };

export function resolveNavLinks(gates: Record<NavGate, boolean>): NavLink[] {
  return navEntries.flatMap((entry): NavLink[] => {
    if (entry.gate && !gates[entry.gate]) return [];
    if (entry.section && entry.live) return [{ kind: "section", labelKey: entry.labelKey, id: entry.section }];
    if (entry.route) return [{ kind: "route", labelKey: entry.labelKey, href: entry.route }];
    return [];
  });
}

/**
 * The "Download" CTA targets the v4b final CTA section once it ships. Until
 * then it goes to the top of `main`, where the hero holds the App Store and
 * Android download buttons.
 */
const downloadSection = { id: "telecharger", live: true as boolean, fallback: "main-content" };
export const downloadTargetId = downloadSection.live ? downloadSection.id : downloadSection.fallback;

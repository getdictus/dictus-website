/**
 * Motion settings shared by the v4b homepage primitives (ScenePlayer,
 * PinnedSteps, SeamRibbon).
 *
 * PIN LENGTHS ARE PROVISIONAL. The final values are Pierre's decision
 * (epic #51, open question 8). Change them here only: every pinned section
 * reads its length from `pinLengths` through its key.
 *
 * How the defaults were derived (1 screen = one viewport height):
 *
 *   v4b mockup, measured at 1440 px wide ........ 20.2 screens in total
 *   its three pins (400vh + 400vh + 440vh) ....... 4 + 4 + 4.4 = 12.4 screens
 *   everything else (hero, Languages, Privacy,
 *   Pricing, FAQ, final CTA, footer, ribbons) .... 20.2 - 12.4 = 7.8 screens
 *
 *   page budget ................................... 10 screens
 *   left for the three pins ....................... 10 - 7.8 = 2.2 screens
 *   split like v4b (4 : 4 : 4.4) .................. 0.71 / 0.71 / 0.78 screens
 *
 * A pin shorter than one screen cannot hold anything, so the budget alone
 * does not fit the v4b layout. Each pin is raised to `MIN_PIN_SCREENS`:
 * two screens, the length the taste study grants a pinned element. That
 * leaves one screen of scroll for four steps (a quarter screen, 225 px at
 * 900 px tall, per step).
 *
 *   defaults ...................................... 2 + 2 + 2 = 6 screens
 *   estimated page ................................ 7.8 + 6 = 13.8 screens
 *
 * Reaching 10 screens also needs the non-pinned sections to shrink by about
 * 3.8 screens, which is a design decision, not a motion one.
 */

/** Total homepage length aimed for, in screens. */
export const PAGE_BUDGET_SCREENS = 10;

/** Height of the v4b sections that do not pin, in screens (see above). */
export const NON_PINNED_SCREENS = 7.8;

/** Shortest pin worth having: one screen held, one screen of scroll. */
export const MIN_PIN_SCREENS = 2;

/** Pin length of each future pinned section, in screens (provisional). */
export const pinLengths = {
  keyboard: MIN_PIN_SCREENS,
  offline: MIN_PIN_SCREENS,
  smartModes: MIN_PIN_SCREENS,
  /** The non-indexed demo route; not part of the page budget. */
  demo: MIN_PIN_SCREENS,
} as const;

export type PinKey = keyof typeof pinLengths;

/** The same lengths as the v4b mockup, for comparison. */
export const V4B_PIN_LENGTHS = { keyboard: 4, offline: 4, smartModes: 4.4 } as const;

/** Estimated homepage length with the current pin lengths, in screens. */
export const ESTIMATED_PAGE_SCREENS =
  NON_PINNED_SCREENS + pinLengths.keyboard + pinLengths.offline + pinLengths.smartModes;

/**
 * Pinning needs room: below this width or height the steps fall back to
 * normal flow, stacked and readable.
 */
export const PIN_MEDIA_QUERY = "(min-width: 1024px) and (min-height: 640px)";

/** `--ease-out` from globals.css, for Motion transitions. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Step text crossfade (AUDIT, motion row 3): out first, then in. */
export const STEP_TEXT_OUT_SECONDS = 0.2;
export const STEP_TEXT_IN_SECONDS = 0.3;
export const STEP_TEXT_SHIFT_PX = 8;

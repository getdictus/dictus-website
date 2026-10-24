/**
 * Motion settings shared by the v4b homepage primitives (ScenePlayer,
 * PinnedSteps, SeamRibbon).
 *
 * PIN LENGTH DECISION (Pierre, epic #51 open question 8, settled): the
 * homepage has ONE pinned section, Smart Modes. Keyboard and Offline are
 * normal in-flow sections and are not pinned. The page aims at about 10
 * screens. Every pinned section reads its length from `pinLengths` through
 * its key.
 *
 * Arithmetic (1 screen = one viewport height, v4b mockup measured at
 * 1440 x 900):
 *
 *   v4b page ...................................... 20.2 screens
 *   its three pins (400vh + 400vh + 440vh) ......... 4 + 4 + 4.4 = 12.4 screens
 *   sections that never pinned (hero, Languages,
 *   Privacy, Pricing, FAQ, final CTA, footer,
 *   ribbons) ...................................... 20.2 - 12.4 = 7.8 screens
 *
 *   Keyboard in flow: its 620 px phone beside a heading and four short
 *   steps, plus section padding ................... about 1.0 screen
 *   Offline in flow: four step blocks (about 250 px each in v4b) stacked
 *   beside a 680 px card, plus padding ............ about 1.4 screens
 *
 *   non-pinned total .............................. 7.8 + 1.0 + 1.4 = 10.2 screens
 *   left for Smart Modes .......................... 10 - 10.2 = -0.2 screens
 *
 * That is under `MIN_PIN_SCREENS`, so Smart Modes gets the minimum: two
 * screens, one held on screen plus one of scroll (a quarter screen per step
 * for four steps). The page comes out at about 10.2 + 2 = 12.2 screens; the
 * remaining 2.2 screens over the 10-screen aim can only come from shorter
 * non-pinned sections, not from the pin.
 */

/** Total homepage length aimed for, in screens. */
export const PAGE_BUDGET_SCREENS = 10;

/** Height of every non-pinned section, Keyboard and Offline included (see above). */
export const NON_PINNED_SCREENS = 7.8 + 1.0 + 1.4;

/** Shortest pin worth having: one screen held, one screen of scroll. */
export const MIN_PIN_SCREENS = 2;

/**
 * Pin length of each pinned section, in screens. Smart Modes is the only
 * pinned section of the homepage; Keyboard and Offline are not pinned.
 */
export const pinLengths = {
  smartModes: Math.max(MIN_PIN_SCREENS, PAGE_BUDGET_SCREENS - NON_PINNED_SCREENS),
} as const;

export type PinKey = keyof typeof pinLengths;

/** Estimated homepage length with the pin above, in screens. */
export const ESTIMATED_PAGE_SCREENS = NON_PINNED_SCREENS + pinLengths.smartModes;

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

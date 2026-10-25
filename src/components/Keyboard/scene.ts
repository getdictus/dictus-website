/**
 * Scene C of the dictus-ios onboarding intro, "Dans votre clavier." / "In your
 * keyboard.": the Dictus keyboard in a note, through one whole dictation.
 *
 * The site plays the app's own render of it (assets/onboarding/intro/
 * {fr,en}.lproj/intro-c-light.mp4 in getdictus/dictus-ios). The numbers below
 * are that render's, in frames at 30 fps, from its cue table
 * (assets/onboarding/intro/src/introKeyboard.ts, `CUE`) and its loop length
 * (src/theme.ts, `LOOP_C`). Change them only with a new render.
 */
export const SCENE_FPS = 30;

/** One pass of the loop: 195 frames, 6.5 s. */
export const SCENE_FRAMES = 195;
export const SCENE_SECONDS = SCENE_FRAMES / SCENE_FPS;

/**
 * The app's still: frame 90 (3.0 s), the keyboard recording with the
 * waveform, ✕ and ✓ (OnboardingIntroScene.stillFrameSeconds). The app shows
 * it with Reduce Motion on and starts the video there, so the hand-over from
 * the still shows no jump. The site does both the same way.
 */
export const STILL_SECONDS = 90 / SCENE_FPS;

/**
 * The three steps the scene plays, as frame ranges of its cue table:
 * typing the word then tapping the mic (mic at 35), recording until ✓ is
 * tapped (check at 125), then transcribing, the paragraph landing (155) and
 * the note clearing for the next loop (175 to 195).
 */
export const SCENE_STEPS = [
  { key: "mic", from: 0, to: 35 },
  { key: "speak", from: 35, to: 125 },
  { key: "write", from: 125, to: SCENE_FRAMES },
] as const;

export type SceneStepKey = (typeof SCENE_STEPS)[number]["key"];

/** Index of the step playing at `seconds` into the loop. */
export function activeStepAt(seconds: number) {
  const frame = (((seconds * SCENE_FPS) % SCENE_FRAMES) + SCENE_FRAMES) % SCENE_FRAMES;
  const index = SCENE_STEPS.findIndex((step) => frame < step.to);
  return index === -1 ? SCENE_STEPS.length - 1 : index;
}

/** How far each step has played at `seconds`, from 0 to 1. */
export function stepProgressAt(seconds: number) {
  const frame = (((seconds * SCENE_FPS) % SCENE_FRAMES) + SCENE_FRAMES) % SCENE_FRAMES;
  return SCENE_STEPS.map(({ from, to }) => Math.min(1, Math.max(0, (frame - from) / (to - from))));
}

/**
 * Scene B of the dictus-ios onboarding intro, "Même sans réseau." / "Even
 * offline.": she dictates into her phone in a metro carriage with no network,
 * and a mail draft writes itself.
 *
 * The site plays the app's own dark render of it (assets/onboarding/intro/
 * {fr,en}.lproj/intro-b-dark.mp4 in getdictus/dictus-ios), whose page is
 * #0A1628, the section's navy. The numbers below are that render's: its loop
 * length (src/theme.ts, `LOOP_B`) and its still
 * (OnboardingIntroScene.stillFrameSeconds). Change them only with a new render.
 */
export const SCENE_FPS = 30;

/** One pass of the loop: 165 frames, 5.5 s. */
export const SCENE_SECONDS = 165 / SCENE_FPS;

/**
 * The app's still: 4.5 s, the mail draft fully written. The app shows it with
 * Reduce Motion on and starts the video there, so the hand-over from the
 * still shows no jump. The site does both the same way.
 */
export const STILL_SECONDS = 4.5;

/**
 * The model the card shows, as the dictus-ios catalogue lists it
 * (DictusCore/Sources/DictusCore/ModelInfo.swift, `parakeet-tdt-0.6b-v3`).
 * The app prints the size as whole megabytes, truncated:
 * 483 257 242 bytes is "~483 MB" ("~483 Mo" in French).
 */
export const MODEL = { name: "Parakeet v3", megabytes: 483 } as const;

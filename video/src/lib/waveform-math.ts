// Pure deterministic waveform math — ported from src/components/Hero/Waveform.tsx
// All functions are frame-based with no side effects (no RAF, no Math.random, no performance.now)

export const BAR_COUNT = 30;
export const BAR_SPACING = 3;
export const MAX_HEIGHT = 220;
export const MIN_BAR_HEIGHT = 2;

export type DemoState = "idle" | "recording" | "transcribing" | "inserted";
export type WaveformPhase = "flat" | "active" | "processing" | "calm";

export const DEMO_STATE_TO_PHASE: Record<DemoState, WaveformPhase> = {
  idle: "flat",
  recording: "active",
  transcribing: "processing",
  inserted: "calm",
};

export function computeBarLayout(width: number): {
  barWidth: number;
  offsetX: number;
} {
  const totalSpacing = BAR_SPACING * (BAR_COUNT - 1);
  const totalBarWidth = width * 0.85;
  const barWidth = Math.max((totalBarWidth - totalSpacing) / BAR_COUNT, 2);
  const actualTotalWidth =
    barWidth * BAR_COUNT + BAR_SPACING * (BAR_COUNT - 1);
  const offsetX = (width - actualTotalWidth) / 2;
  return { barWidth, offsetX };
}

export function resolveBarColor(
  index: number
): { type: "gradient" | "edge"; opacity?: number } {
  const center = (BAR_COUNT - 1) / 2;
  const distanceFromCenter = Math.abs(index - center) / center;
  if (distanceFromCenter < 0.4) {
    return { type: "gradient" };
  } else {
    const opacity = (1.0 - distanceFromCenter) * 0.9 + 0.15;
    return { type: "edge", opacity };
  }
}

/** Deterministic pseudo-random using double sin hash for wider distribution */
function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

export function generateActiveTargets(
  frame: number,
  seed: number = 0
): number[] {
  const targets: number[] = [];
  const center = (BAR_COUNT - 1) / 2;
  for (let i = 0; i < BAR_COUNT; i++) {
    const h1 = hash(frame * 13.37 + i * 51.57 + seed);
    const h2 = hash(h1 * 43758.5453 + i * 7.13);
    const rand = (h1 + h2) * 0.5;
    const distFromCenter = Math.abs(i - center) / center;
    const centerBonus = (1 - distFromCenter) * 0.25;
    targets.push(0.35 + rand * 0.55 + centerBonus);
  }
  return targets;
}

/** Smoothstep easing (from original) */
export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Frame-based phase energy computation (replaces time-based version).
 * Returns target energy [0..1] for a bar at given index in the given waveform phase.
 */
export function computePhaseEnergy(
  index: number,
  phase: WaveformPhase,
  frame: number,
  stateStartFrame: number,
  fps: number
): number {
  const elapsed = ((frame - stateStartFrame) / fps) * 1000; // ms

  if (phase === "flat") return 0.05;

  if (phase === "active") {
    // Refresh targets every ~4 frames (~133ms at 30fps)
    const targetFrame = Math.floor(frame / 4) * 4;
    const targets = generateActiveTargets(targetFrame);
    return targets[index];
  }

  if (phase === "processing") {
    const center = (BAR_COUNT - 1) / 2;
    const distFromCenter = Math.abs(index - center) / center;
    const wave = Math.sin(elapsed / 400 + index * 0.35) * 0.5 + 0.5;
    const centerWeight = 1 - distFromCenter * 0.5;
    return 0.2 + wave * 0.55 * centerWeight;
  }

  if (phase === "calm") {
    const t = Math.min(elapsed / 800, 1);
    const eased = smoothstep(t);
    // Use last active targets for decay start point
    const lastActiveFrame = Math.floor(stateStartFrame / 4) * 4 - 4;
    const lastTargets = generateActiveTargets(Math.max(0, lastActiveFrame));
    const activeLevel = lastTargets[index];
    return activeLevel * (1 - eased) + 0.05 * eased;
  }

  return 0.05;
}

/**
 * Simulate the site's frame-by-frame lerp-up / decay-down smoothing.
 * Runs the IIR filter from frame 0 → currentFrame so every Remotion frame
 * gets the same buttery-smooth bar movement as the 60fps site version.
 *
 * Smoothing factors are adjusted from 60fps → 30fps:
 *   rise:  1 - (1 - 0.30)^2 = 0.51
 *   decay: 0.85^2            = 0.7225
 */
export function computeSmoothedBars(
  currentFrame: number,
  fps: number,
  getStateAt: (frame: number) => { state: DemoState; stateStartFrame: number },
): number[] {
  const SMOOTH_UP = 0.51;
  const SMOOTH_DOWN = 0.60;

  const levels = new Array<number>(BAR_COUNT).fill(0.05);

  for (let f = 0; f <= currentFrame; f++) {
    const { state, stateStartFrame } = getStateAt(f);
    const phase = DEMO_STATE_TO_PHASE[state];

    for (let i = 0; i < BAR_COUNT; i++) {
      const target = computePhaseEnergy(i, phase, f, stateStartFrame, fps);
      const current = levels[i];

      if (target > current) {
        levels[i] = current + (target - current) * SMOOTH_UP;
      } else {
        levels[i] = target + (current - target) * SMOOTH_DOWN;
      }

      if (levels[i] < 0.005) levels[i] = 0;
    }
  }

  return levels;
}

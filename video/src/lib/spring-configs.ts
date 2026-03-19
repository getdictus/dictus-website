import type { SpringConfig } from "remotion";

// iOS-native spring configurations for Remotion spring()
export const iosSpring = {
  // Standard iOS transition (UIView.animate equivalent)
  standard: {
    mass: 1,
    damping: 18,
    stiffness: 150,
    overshootClamping: false,
  } as SpringConfig,
  // Bouncy (keyboard appearance)
  bouncy: {
    mass: 0.8,
    damping: 12,
    stiffness: 180,
    overshootClamping: false,
  } as SpringConfig,
  // Gentle (fade/slide)
  gentle: {
    mass: 1,
    damping: 20,
    stiffness: 100,
    overshootClamping: true,
  } as SpringConfig,
  // Snappy (quick UI response)
  snappy: {
    mass: 0.6,
    damping: 15,
    stiffness: 200,
    overshootClamping: false,
  } as SpringConfig,
} as const;

// State durations in frames at 30fps (from useHeroDemoState.ts timing ratios)
// Original: idle=1500ms, recording=2500ms, transcribing=2000ms, inserted=2500ms (total 8500ms)
// Video: slightly compressed for pacing (~7s per scene cycle)
export const STATE_DURATIONS = {
  idle: 40, // ~1.3s
  recording: 70, // ~2.3s
  transcribing: 55, // ~1.8s
  inserted: 45, // ~1.5s
} as const;

// Total frames per scene cycle
export const SCENE_CYCLE_FRAMES = Object.values(STATE_DURATIONS).reduce(
  (a, b) => a + b,
  0
); // 210 frames = 7s

// Transition between scenes (horizontal slide)
export const SCENE_TRANSITION_FRAMES = 20; // ~0.67s

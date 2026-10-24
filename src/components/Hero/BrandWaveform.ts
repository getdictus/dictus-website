/**
 * The Dictus waveform, as drawn by dictus-ios `BrandWaveform.swift`: 30
 * rounded bars with 2 px gaps, the centre 40 % in accent-hi #6BA3FF, the
 * outer bars white on navy, fading towards the edges. Levels rise with a
 * 0.3 smoothing factor and fall with a 0.85 decay, per 60 Hz frame.
 *
 * Extracted from the hero's former full-screen `Waveform` canvas, without
 * its gradient (the v4b hero has none) and drawn as SVG lines so the bars
 * move by `transform` only.
 */

export const BAR_COUNT = 30;
export const BAR_GAP = 2;
const MIN_BAR_HEIGHT = 2;
const SMOOTHING = 0.3;
const DECAY = 0.85;
const CENTRE_COLOUR = "#6BA3FF";
const EDGE_COLOUR = "#FFFFFF";

export type Bar = { x: number; colour: string; opacity: number };

/** Bars across `width` px starting at `x`, as in BrandWaveform. */
export function barLayout(x: number, width: number) {
  const barWidth = Math.max((width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT, 1.6);
  const centre = (BAR_COUNT - 1) / 2;
  const bars: Bar[] = Array.from({ length: BAR_COUNT }, (_, i) => {
    const distance = Math.abs(i - centre) / centre;
    const inner = distance < 0.4;
    return {
      x: x + i * (barWidth + BAR_GAP) + barWidth / 2,
      colour: inner ? CENTRE_COLOUR : EDGE_COLOUR,
      opacity: inner ? 1 : Math.min(1, (1 - distance) * 0.9 + 0.15),
    };
  });
  return { barWidth, bars };
}

/** A speaking voice: syllables, a slow swell and short pauses. */
function voice(m: number) {
  const syllable = Math.abs(Math.sin(m * 11));
  const swell = 0.55 + 0.45 * Math.sin(m * 2.7 + 0.8);
  const pause = Math.sin(m * 1.3 + 2) > 0.85 ? 0.15 : 1;
  return 0.12 + 0.78 * syllable * swell * pause;
}

/**
 * Target level (0 to 1) of every bar while recording, `seconds` into the
 * take: the newest sound enters on the right and scrolls left.
 */
export function recordingLevels(seconds: number) {
  const on = Math.min(1, Math.max(0, seconds / 0.4));
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const m = seconds - (BAR_COUNT - 1 - i) * 0.05;
    if (m <= 0) return 0;
    const value = voice(m) * on;
    return value < 0.05 ? 0 : Math.min(1, value);
  });
}

/** BrandWaveform's display levels: quick to rise, slower to fall. */
export class LevelSmoother {
  readonly levels = new Array<number>(BAR_COUNT).fill(0);

  /** Moves towards `targets` over `dt` seconds (the iOS factors are per 60 Hz frame). */
  step(targets: number[], dt: number) {
    const frames = Math.min(6, Math.max(0, dt * 60));
    const rise = 1 - Math.pow(1 - SMOOTHING, frames);
    const fall = Math.pow(DECAY, frames);
    for (let i = 0; i < BAR_COUNT; i++) {
      const current = this.levels[i], target = targets[i];
      let next = target > current ? current + (target - current) * rise : target + (current - target) * fall;
      if (next < 0.005) next = 0;
      this.levels[i] = next;
    }
    return this.levels;
  }

  set(levels: number[]) {
    for (let i = 0; i < BAR_COUNT; i++) this.levels[i] = levels[i];
    return this.levels;
  }
}

/**
 * `transform` attribute that stretches a 1 px tall bar line centred on `cy`
 * to `level` of `maxHeight`. The line keeps round caps of the bar's width
 * (`vector-effect: non-scaling-stroke`), so the drawn bar is the stretched
 * length plus one cap height.
 */
export function barTransform(level: number, cy: number, maxHeight: number, barWidth: number) {
  const height = Math.max(MIN_BAR_HEIGHT, MIN_BAR_HEIGHT + level * (maxHeight - MIN_BAR_HEIGHT));
  const k = Math.max(0.01, height - barWidth);
  return `matrix(1 0 0 ${k.toFixed(3)} 0 ${(cy * (1 - k)).toFixed(2)})`;
}

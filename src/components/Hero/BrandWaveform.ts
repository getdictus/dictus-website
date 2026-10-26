/**
 * The Dictus recording waveform, as dictus-ios draws it while recording
 * (`BrandWaveform.swift`, `KeyboardWaveformView.swift`) and feeds it
 * (`UnifiedAudioEngine.swift`):
 *
 * - 30 capsule bars, vertically centred, 2 px tall at silence; the centre
 *   40 % solid blue, the outer bars fading by (1 - d) * 0.9 + 0.15;
 * - each ~85 ms audio callback (4096 frames at 48 kHz) adds 6 bins of
 *   peak * 0.65 + rms * 6.5 to a window of the 30 newest bins, which is
 *   contrast-stretched when it is flat and thresholded at 0.05;
 * - displayed levels rise by 0.3 and fall by a 0.85 decay per 60 Hz frame.
 *
 * Deliberate differences on the hero pill:
 * - the newest bin enters on the LEFT and the shape travels right, with the
 *   walker, the strokes and the handwriting (iOS appends on the right);
 * - the site has no microphone: the bins come from a synthetic, seeded
 *   voice (syllables at 4-6 Hz, words, pauses), the same on every load;
 * - 1 px gaps instead of 2, so the bars stay readable in a pill much
 *   narrower than the keyboard;
 * - on the light glass the centre is accent blue #3D7EFF and the outer bars
 *   navy #0F3460 (iOS: #6BA3FF and white or grey), with an opacity floor so
 *   the outermost bars stay visible.
 *
 * Drawn as SVG lines stretched by their `transform` attribute: no box layout
 * of the page, but SVG geometry and repaint work every frame.
 */

export const BAR_COUNT = 30;
export const BAR_GAP = 1;
const MIN_BAR_WIDTH = 2;
const MIN_BAR_HEIGHT = 2;
const SMOOTHING = 0.3;
const DECAY = 0.85;
const CENTRE_COLOUR = "#3D7EFF";
const EDGE_COLOUR = "#0F3460";
const EDGE_MIN_OPACITY = 0.4;

export type Bar = { x: number; colour: string; opacity: number };

/** Bars across `width` px starting at `x`, as in BrandWaveform. */
export function barLayout(x: number, width: number) {
  const barWidth = Math.max((width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT, MIN_BAR_WIDTH);
  const centre = (BAR_COUNT - 1) / 2;
  const bars: Bar[] = Array.from({ length: BAR_COUNT }, (_, i) => {
    const distance = Math.abs(i - centre) / centre;
    const inner = distance < 0.4;
    return {
      x: x + i * (barWidth + BAR_GAP) + barWidth / 2,
      colour: inner ? CENTRE_COLOUR : EDGE_COLOUR,
      opacity: inner ? 1 : Math.max(EDGE_MIN_OPACITY, Math.min(1, (1 - distance) * 0.9 + 0.15)),
    };
  });
  return { barWidth, bars };
}

/** One audio tap callback on iOS: 4096 frames at 48 kHz. */
const TAP_SECONDS = 4096 / 48000;
/** makeWaveformBuckets: max(3, min(6, 1365 samples at 16 kHz / 160)). */
export const BINS_PER_CALLBACK = 6;

/** Seeded PRNG (mulberry32), so the voice is the same on every load and in tests. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A whole number of callbacks per loop (193 for 16.5 s: 85.5 ms, not 85.3). */
const callbacksPerLoop = (loopSeconds: number) => Math.round(loopSeconds / TAP_SECONDS);

/**
 * The bins of one loop of a synthetic voice, in time order: words of 2 to 5
 * syllables of 160-240 ms, short gaps between words, a longer pause every 2
 * or 3 words, and silence around the loop seam. Each bin is shaped like
 * makeWaveformBuckets: clamp(peak * 0.65 + rms * 6.5), from an rms that
 * follows the syllable envelope and a speech-like crest factor.
 */
export function speechBins(loopSeconds: number, seed = 7) {
  const next = random(seed);
  const between = (a: number, b: number) => a + (b - a) * next();
  const syllables: { start: number; end: number; level: number }[] = [];
  let t = 0.2;
  while (true) {
    const words = 2 + Math.floor(next() * 2);
    let fits = true;
    for (let w = 0; w < words && fits; w++) {
      const count = 2 + Math.floor(next() * 4);
      for (let k = 0; k < count; k++) {
        const length = between(0.16, 0.24);
        if (t + length > loopSeconds - 0.25) { fits = false; break; }
        syllables.push({ start: t, end: t + length, level: between(0.55, 1) });
        t += length;
      }
      t += between(0.05, 0.12);
    }
    if (!fits) break;
    t += between(0.25, 0.45);
  }

  const total = callbacksPerLoop(loopSeconds) * BINS_PER_CALLBACK;
  const binSeconds = loopSeconds / total;
  const bins = new Array<number>(total);
  let s = 0;
  for (let j = 0; j < total; j++) {
    const at = (j + 0.5) * binSeconds;
    while (s < syllables.length && syllables[s].end < at) s++;
    const syllable = syllables[s];
    const u = syllable && at >= syllable.start ? (at - syllable.start) / (syllable.end - syllable.start) : -1;
    const envelope = u >= 0 ? syllable.level * Math.pow(Math.sin(Math.PI * u), 1.5) : 0;
    const rms = 0.002 + envelope * 0.1 * between(0.85, 1.15);
    const peak = rms * between(2.8, 3.6);
    bins[j] = Math.min(Math.max(peak * 0.65 + rms * 6.5, 0), 1);
  }
  return bins;
}

/**
 * The 30 newest bins as of bin `newest`, NEWEST FIRST: bar 0, on the left,
 * gets the bin that just arrived, so every bin moves one bar right as the
 * next ones come in. iOS keeps them oldest first (it travels right to left).
 */
export function waveformWindow(bins: ArrayLike<number>, newest: number) {
  const n = bins.length;
  return Array.from({ length: BAR_COUNT }, (_, i) => bins[(((newest - i) % n) + n) % n]);
}

/** enhanceWaveformContrast: stretches a flat window so it still reads as a voice. */
export function enhanceContrast(values: number[]) {
  const min = Math.min(...values), max = Math.max(...values), spread = max - min;
  if (max <= 0.06 || spread >= 0.12) return values;
  const floor = Math.min(max * 0.28, 0.16);
  return values.map((value, i) => {
    const normalized = spread > 0.0001 ? (value - min) / spread : 0.5;
    const bias = 1 - Math.abs(i / (values.length - 1) - 0.5) * 0.18;
    return Math.min(Math.max((floor + normalized * (1 - floor)) * bias, 0), 1);
  });
}

const voices = new Map<number, number[]>();

/**
 * Target level (0 to 1) of every bar, `seconds` into a loop of
 * `loopSeconds`. The window moves on once per callback (~11.7 Hz, like the
 * in-app recording view; the keyboard samples it at 5 Hz, which jumps 14
 * bins at a time and hides the travel). iOS resamples the 30 bins to 30
 * bars, which leaves them as they are. The loop holds a whole number of
 * callbacks, so its end leads into its start like any other callback.
 */
export function recordingLevels(seconds: number, loopSeconds: number, bins?: ArrayLike<number>) {
  if (!bins) {
    if (!voices.has(loopSeconds)) voices.set(loopSeconds, speechBins(loopSeconds));
    bins = voices.get(loopSeconds)!;
  }
  const callbacks = callbacksPerLoop(loopSeconds);
  const callback = Math.floor((seconds / loopSeconds) * callbacks);
  const window = enhanceContrast(waveformWindow(bins, callback * BINS_PER_CALLBACK + BINS_PER_CALLBACK - 1));
  return window.map((value) => (value < 0.05 ? 0 : Math.min(Math.max(value, 0), 1)));
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

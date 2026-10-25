/**
 * Hero geometry, as pure functions of the scene size and the time: where the
 * walker stands, where the pill sits, and the three felt-pen strokes that
 * leave her mouth along an arc into the pill.
 *
 * No DOM access here, so `scripts/hero-strokes.test.mjs` can check the
 * spacing of the strokes and their clearance from the phone, the arm and the
 * hero text at every layout.
 */

export type Point = { x: number; y: number };
export type Rect = { x0: number; y0: number; x1: number; y1: number };
export type Cubic = [Point, Point, Point, Point];

/**
 * - `side`: wide screens. The walker stands bottom left beside the centred
 *   text, the result is handwritten after the pill.
 * - `stack`: tablets and short wide screens. The scene sits under the text.
 * - `compact`: phones. The scene sits under the text, the result shows in a
 *   card under the pill.
 */
export type HeroMode = "side" | "stack" | "compact";

/** Same breakpoints as Hero.module.css. */
export const SIDE_MEDIA = "(min-width: 1200px) and (min-height: 700px)";
export const COMPACT_MAX_WIDTH = 759;

/**
 * The walker video canvas (walker@2x.*, 424 x 864 px, shown at 212 x 432 CSS
 * px at most so it stays sharp). Points are fractions of the canvas, measured
 * on frame 0, which is also the poster and the reduced-motion still.
 */
export const WALKER = {
  maxWidth: 212,
  maxHeight: 432,
  aspect: 424 / 864,
  /** Her open mouth at frame 0 (208, 175 px), where the middle stroke starts. */
  mouth: { x: 0.49, y: 0.203 },
  /**
   * What the strokes must never cross, at frame 0: the phone and her hand,
   * then her shoulder and arm. They ride the bob with the mouth.
   */
  obstacles: [
    { x0: 0.7, y0: 0.21, x1: 0.97, y1: 0.42 },
    { x0: 0.53, y0: 0.27, x1: 0.97, y1: 0.42 },
  ] as Rect[],
  /** Loop of the video and of one stride. */
  loopSeconds: 5.5,
  stridesPerLoop: 5,
  /**
   * Body bob of the rig, `22 · (cos 4πu − 1)` figure units, in CSS px at the
   * full 212 px width: figure scale 1.06, 1000 / 1466 / 3 pt per unit.
   */
  bobPx: 22 * 1.06 * (1000 / 1466 / 3),
} as const;

/**
 * Vertical offset of her mouth at a moment of the video (negative is up):
 * 0 at contact (frame 0), -10.6 px at passing, for a walker `width` px wide.
 */
export function mouthBob(videoSeconds: number, width: number) {
  const tau = (videoSeconds % WALKER.loopSeconds) / WALKER.loopSeconds;
  const u = (tau * WALKER.stridesPerLoop) % 1;
  return WALKER.bobPx * (Math.cos(4 * Math.PI * u) - 1) * (width / WALKER.maxWidth);
}

export type StrokeStyle = { color: string; width: number; lambda: number; speed: number; phase: number };

/**
 * One pass of the hero scene (three 5.5 s phrases). Everything that moves
 * with time turns a whole number of times per pass, so the loop has no seam.
 */
export const SCENE_LOOP_SECONDS = 16.5;
/** Angular speed of `n` whole turns per scene loop, in radians per second. */
export const turnsPerLoop = (n: number) => (2 * Math.PI * n) / SCENE_LOOP_SECONDS;

/** Light, mid and deep blue felt pens, as in the v4b mockup. */
export const STROKE_COLORS = ["#6BA3FF", "#3D7EFF", "#2563EB"] as const;
const STROKE_WIDTHS = { wide: [3.4, 4.6, 2.2], compact: [2.6, 3.4, 1.6] } as const;
const STROKE_WAVES = [
  { lambda: 44, speed: turnsPerLoop(8), phase: 0 },
  { lambda: 58, speed: turnsPerLoop(12), phase: 1.3 },
  { lambda: 36, speed: turnsPerLoop(7), phase: 2.6 },
];
/** Swell of the voice along the strokes, and their shared wobble. */
const LOUDNESS_SPEED = turnsPerLoop(6);
const WOBBLE_SPEED = turnsPerLoop(9);

/**
 * Spacing of the three strokes, in px between neighbouring axes. The common
 * wobble moves them together; only `differential` (plus the hand-drawn
 * `jitter`) can bring two strokes closer, so the narrowest gap is
 * `start - 2 · differential - 2 · jitter`. Checked by the unit test.
 */
export type StrokeSpacing = { start: number; middle: number; end: number; common: number; differential: number; jitter: number };
const SPACING: Record<"wide" | "compact", StrokeSpacing> = {
  wide: { start: 11, middle: 12.5, end: 9.5, common: 9, differential: 1, jitter: 0.3 },
  compact: { start: 8, middle: 9, end: 7, common: 5, differential: 0.8, jitter: 0.3 },
};

/** Visible paper between two strokes, on top of their half-widths. */
export const MIN_VISIBLE_GAP = { wide: 2.5, compact: 2 } as const;

export type Pill = { cx: number; cy: number; w: number; h: number; pad: number };

export type HeroLayout = {
  mode: HeroMode;
  width: number;
  height: number;
  walker: { x: number; y: number; w: number; h: number };
  mouth: Point;
  pill: Pill;
  /** From the mouth over the phone into the left end of the pill: cubics, joined smoothly. */
  arc: Cubic[];
  /** `arc` resampled by arc length, computed once per layout. */
  samples: ArcSample[];
  /** Handwriting baseline after the pill (side and stack modes). */
  writing: Cubic | null;
  writingSize: number;
  /** Result card under the pill (compact mode). */
  card: { x: number; y: number; w: number } | null;
  strokes: StrokeStyle[];
  spacing: StrokeSpacing;
  scale: "wide" | "compact";
};

/**
 * Shape of the voice arc per mode, for a full-size walker (scaled with her):
 * - `apexX`: where it peaks, across the walker (1 = her right edge, past the
 *   phone); `rise`: how far above the mouth, in px;
 * - `tilt`: 0 enters the pill level, 1 enters along the straight line from
 *   the apex (stack and compact modes);
 * - `gateX`, `gateY`, `gateSlope` (side mode): a waypoint across the walker,
 *   `gateY` px above the pill, crossed with that slope, so the arc comes
 *   down between the walker and the text before it levels into the pill;
 * - `pillX`, `pillY`: pill centre, across the hero (side mode), across and
 *   down the walker (stack mode),
 *   or `pillY` px under the mouth (compact mode, where `pillW` is its width).
 * Tuned so `scripts/hero-strokes.test.mjs` passes with margin at every
 * layout it lists.
 */
export const ARC = {
  side: { apexX: 1, rise: 50, pillX: 0.56, gateX: 1.6, gateY: 110, gateSlope: 2 },
  stack: { apexX: 1.1, rise: 50, tilt: 1, pillX: 2.3, pillY: 0.4 },
  compact: { apexX: 0.98, rise: 45, tilt: 0.6, pillY: -20, pillW: 132 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Mouth, up to an apex right of the phone, then down into the pill. The
 * tangent is level at the apex, so the two cubics join smoothly, and every
 * control point moves right, so the path never turns back on itself.
 */
function voiceArc(mouth: Point, apex: Point, end: Point, tilt: number): Cubic[] {
  const run = end.x - apex.x, drop = end.y - apex.y;
  return [
    [mouth, { x: mouth.x + (apex.x - mouth.x) * 0.3, y: mouth.y - (mouth.y - apex.y) * 0.8 }, { x: apex.x - (apex.x - mouth.x) * 0.45, y: apex.y }, apex],
    [apex, { x: apex.x + run * 0.5, y: apex.y }, { x: end.x - run * 0.4, y: end.y - drop * 0.4 * tilt }, end],
  ];
}

/**
 * A smooth path through waypoints, each with a tangent direction: cubic
 * Hermite segments whose handles are a third of the chord.
 */
function throughWaypoints(points: { at: Point; towards: Point }[]): Cubic[] {
  const unit = (v: Point) => {
    const l = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / l, y: v.y / l };
  };
  const segments: Cubic[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const handle = Math.hypot(b.at.x - a.at.x, b.at.y - a.at.y) / 3;
    const ta = unit(a.towards), tb = unit(b.towards);
    segments.push([a.at, { x: a.at.x + ta.x * handle, y: a.at.y + ta.y * handle }, { x: b.at.x - tb.x * handle, y: b.at.y - tb.y * handle }, b.at]);
  }
  return segments;
}

function walkerBox(x: number, bottom: number, h: number) {
  const w = h * WALKER.aspect;
  return { x, y: bottom - h, w, h };
}

/** Obstacles of a placed walker, in scene px, lifted by `bob`. */
export function walkerObstacles(walker: HeroLayout["walker"], bob = 0): Rect[] {
  return WALKER.obstacles.map((o) => ({
    x0: walker.x + o.x0 * walker.w,
    y0: walker.y + o.y0 * walker.h + bob,
    x1: walker.x + o.x1 * walker.w,
    y1: walker.y + o.y1 * walker.h + bob,
  }));
}

function placeWalker(walker: HeroLayout["walker"]) {
  return {
    walker,
    mouth: { x: walker.x + WALKER.mouth.x * walker.w, y: walker.y + WALKER.mouth.y * walker.h },
    k: walker.h / WALKER.maxHeight,
  };
}

/**
 * Places the scene in a box of `width` x `height` CSS px. In `side` mode the
 * box is the whole hero; in `stack` and `compact` modes it is the area under
 * the text, so nothing in it can reach the text.
 */
export function heroLayout(mode: HeroMode, width: number, height: number): HeroLayout {
  const layout = placeScene(mode, width, height);
  return { ...layout, samples: sampleArc(layout.arc).samples };
}

function placeScene(mode: HeroMode, width: number, height: number): Omit<HeroLayout, "samples"> {
  const scale = mode === "compact" ? "compact" : "wide";
  const strokes = STROKE_WAVES.map((wave, index) => ({ ...wave, color: STROKE_COLORS[index], width: STROKE_WIDTHS[scale][index] }));
  const base = { mode, width, height, strokes, spacing: SPACING[scale], scale } as const;

  if (mode === "side") {
    const { walker, mouth, k } = placeWalker(walkerBox(Math.round(Math.max(24, width * 0.06)), height - 10, clamp(height * 0.48, 320, WALKER.maxHeight)));
    const a = ARC.side;
    const pill = { cx: Math.max(width * a.pillX, walker.x + walker.w + 160), cy: height - 104, w: 196, h: 76, pad: 18 };
    const left = pill.cx - pill.w / 2, right = pill.cx + pill.w / 2, span = width - right;
    return {
      ...base, walker, mouth, pill,
      // Up over the phone, down through the gap between the walker and the
      // text, then level into the pill.
      arc: throughWaypoints([
        { at: mouth, towards: { x: 1, y: -1 } },
        { at: { x: walker.x + a.apexX * walker.w, y: mouth.y - a.rise * k }, towards: { x: 1, y: 0 } },
        { at: { x: walker.x + a.gateX * walker.w, y: pill.cy - a.gateY }, towards: { x: 1, y: a.gateSlope } },
        { at: { x: left + 4, y: pill.cy }, towards: { x: 1, y: 0 } },
      ]),
      writing: [{ x: right + 20, y: pill.cy + 6 }, { x: right + span * 0.3, y: pill.cy + 12 }, { x: right + span * 0.6, y: pill.cy - 60 }, { x: width - 40, y: pill.cy - 150 }],
      writingSize: 30,
      card: null,
    };
  }

  if (mode === "stack") {
    const { walker, mouth, k } = placeWalker(walkerBox(Math.round(Math.max(24, width * 0.05)), height - 8, clamp(height - 24, 320, WALKER.maxHeight)));
    const a = ARC.stack;
    // Right of the walker at chest height, clear of the phone and the arm
    // (the mockup's 768 layout put the pill against them and looped). The
    // result is handwritten under it, rising to the right.
    const pill = { cx: walker.x + a.pillX * walker.w, cy: walker.y + a.pillY * walker.h, w: 176, h: 68, pad: 16 };
    const left = pill.cx - pill.w / 2, bottom = pill.cy + pill.h / 2;
    return {
      ...base, walker, mouth, pill,
      arc: voiceArc(mouth, { x: walker.x + a.apexX * walker.w, y: mouth.y - a.rise * k }, { x: left + 4, y: pill.cy }, a.tilt),
      writing: [{ x: left, y: bottom + 96 }, { x: left + (width - left) * 0.35, y: bottom + 100 }, { x: left + (width - left) * 0.65, y: bottom + 70 }, { x: width - 24, y: bottom + 34 }],
      writingSize: 26,
      card: null,
    };
  }

  const { walker, mouth, k } = placeWalker(walkerBox(-14, height - 4, clamp(height - 12, 280, 360)));
  const a = ARC.compact;
  const pill = { cx: width - 14 - a.pillW / 2, cy: mouth.y + a.pillY * k, w: a.pillW, h: 52, pad: 10 };
  const left = pill.cx - pill.w / 2;
  const cardX = Math.round(width * 0.46);
  return {
    ...base, walker, mouth, pill,
    arc: voiceArc(mouth, { x: walker.x + a.apexX * walker.w, y: mouth.y - a.rise * k }, { x: left + 4, y: pill.cy }, a.tilt),
    writing: null,
    writingSize: 20,
    card: { x: cardX, y: pill.cy + pill.h / 2 + 16, w: width - cardX - 12 },
  };
}

export function cubicAt([p0, p1, p2, p3]: Cubic, u: number): Point {
  const m = 1 - u;
  const a = m * m * m, b = 3 * m * m * u, c = 3 * m * u * u, d = u * u * u;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

/** SVG path data of a cubic, for the handwriting baseline. */
export function cubicPath([p0, p1, p2, p3]: Cubic) {
  const f = (p: Point) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return `M ${f(p0)} C ${f(p1)} ${f(p2)} ${f(p3)}`;
}

export type ArcSample = { x: number; y: number; nx: number; ny: number; u: number; s: number };

/** The path resampled every `step` px of arc length, with unit normals. */
export function sampleArc(arc: Cubic[], step = 4) {
  const perSegment = 240;
  const points = [arc[0][0]];
  for (const segment of arc) {
    for (let i = 1; i <= perSegment; i++) points.push(cubicAt(segment, i / perSegment));
  }
  const n = points.length - 1;
  const cumulative = [0];
  for (let i = 1; i <= n; i++) {
    cumulative.push(cumulative[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const length = cumulative[n];
  const count = Math.max(2, Math.ceil(length / step));
  const samples: ArcSample[] = [];
  let j = 0;
  for (let k = 0; k <= count; k++) {
    const s = (length * k) / count;
    while (j < n - 1 && cumulative[j + 1] < s) j++;
    const f = (s - cumulative[j]) / Math.max(1e-9, cumulative[j + 1] - cumulative[j]);
    const a = points[j], b = points[j + 1];
    const tx = b.x - a.x, ty = b.y - a.y, tl = Math.hypot(tx, ty) || 1;
    samples.push({ x: a.x + tx * f, y: a.y + ty * f, nx: -ty / tl, ny: tx / tl, u: s / length, s });
  }
  return { length, samples };
}

const smooth = (a: number, b: number, x: number) => {
  const l = clamp((x - a) / (b - a), 0, 1);
  return l * l * (3 - 2 * l);
};

/** Deterministic hand-drawn roughness in [-0.5, 0.5]. */
function grain(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

/**
 * The three strokes at `seconds` into the scene, as polylines from the mouth
 * (u = 0) to the pill (u = 1). `bob` is the mouth's vertical offset from
 * frame 0 (see `mouthBob`); the start follows it and the arc takes it up
 * over its first 40 %. Pass the previous result as `out` to reuse its points
 * instead of allocating new ones every frame.
 */
export function strokePolylines(layout: HeroLayout, seconds: number, bob = 0, out?: Point[][]): Point[][] {
  const { samples } = layout;
  const { start, middle, end, common, differential, jitter } = layout.spacing;
  const lines = out && out.length === layout.strokes.length && out[0].length === samples.length
    ? out
    : layout.strokes.map(() => samples.map(() => ({ x: 0, y: 0 })));
  layout.strokes.forEach((stroke, index) => {
    const side = index - 1, line = lines[index];
    samples.forEach((q, k) => {
      const u = q.u;
      const spacing = start + (middle - start) * smooth(0, 0.25, u) - (middle - end) * smooth(0.75, 1, u);
      const spread = smooth(0, 0.2, u) * (1 - smooth(0.84, 1, u));
      const loud = 0.5 + 0.5 * Math.sin(q.s / 85 - seconds * LOUDNESS_SPEED);
      const together = common * spread * loud * Math.sin(q.s / 50 - seconds * WOBBLE_SPEED);
      const apart = differential * Math.sin(q.s / stroke.lambda - seconds * stroke.speed + stroke.phase);
      const offset = side * spacing + together + apart + grain(k + index * 997) * 2 * jitter;
      const lift = bob * (1 - smooth(0, 0.4, u));
      line[k].x = q.x + q.nx * offset;
      line[k].y = q.y + q.ny * offset + lift;
    });
  });
  return lines;
}

/** SVG path data of a polyline. */
export function polylinePath(points: Point[]) {
  let d = "";
  for (const p of points) d += `${d ? " L " : "M "}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return d;
}

function pointSegmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

/** Smallest distance between two polylines (vertices against segments, both ways). */
export function polylineDistance(a: Point[], b: Point[]) {
  let best = Infinity;
  for (const [from, to] of [[a, b], [b, a]]) {
    for (const p of from) {
      for (let i = 1; i < to.length; i++) best = Math.min(best, pointSegmentDistance(p, to[i - 1], to[i]));
    }
  }
  return best;
}

/** Smallest distance from a polyline to a rectangle (0 when it enters it). */
export function rectDistance(points: Point[], r: Rect) {
  let best = Infinity;
  for (const p of points) {
    const dx = Math.max(r.x0 - p.x, 0, p.x - r.x1);
    const dy = Math.max(r.y0 - p.y, 0, p.y - r.y1);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

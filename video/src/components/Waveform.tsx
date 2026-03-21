import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  BAR_COUNT,
  BAR_SPACING,
  MAX_HEIGHT,
  MIN_BAR_HEIGHT,
  DEMO_STATE_TO_PHASE,
  computeBarLayout,
  resolveBarColor,
  computePhaseEnergy,
} from "../lib/waveform-math";
import type { DemoState } from "../lib/waveform-math";
import { WAVEFORM_COLORS } from "../lib/colors";

interface WaveformProps {
  width: number;
  height: number;
  /** Pre-computed smoothed energy levels (0-1) per bar — bypasses internal computation */
  levels?: number[];
  /** Fallback: drive bars from a single state (no cross-frame smoothing) */
  state?: DemoState;
  stateStartFrame?: number;
  /** Override edge bar RGB color (e.g. "128, 128, 128" for light theme) */
  edgeRgb?: string;
}

/**
 * Frame-driven waveform for Remotion.
 * When `levels` is provided, renders bars at those exact energies (smoothed externally).
 * Otherwise falls back to direct per-frame computation from state.
 */
export const Waveform: React.FC<WaveformProps> = ({
  width,
  height,
  levels,
  state,
  stateStartFrame,
  edgeRgb,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drawAllBars = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const { barWidth, offsetX } = computeBarLayout(width);

    for (let i = 0; i < BAR_COUNT; i++) {
      let energy: number;
      if (levels) {
        energy = levels[i] ?? 0.05;
      } else {
        const phase = DEMO_STATE_TO_PHASE[state ?? "idle"];
        energy = computePhaseEnergy(i, phase, frame, stateStartFrame ?? 0, fps);
      }

      const barHeight = Math.max(
        MIN_BAR_HEIGHT + energy * (MAX_HEIGHT - MIN_BAR_HEIGHT),
        MIN_BAR_HEIGHT
      );

      const x = offsetX + i * (barWidth + BAR_SPACING);
      const y = (height - barHeight) / 2;
      const radius = barWidth / 2;

      const colorInfo = resolveBarColor(i);

      let fillStyle: string | CanvasGradient;
      if (colorInfo.type === "gradient") {
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, WAVEFORM_COLORS.gradientStart);
        gradient.addColorStop(1, WAVEFORM_COLORS.gradientEnd);
        fillStyle = gradient;
      } else {
        fillStyle = `rgba(${edgeRgb ?? WAVEFORM_COLORS.edgeRgb},${(colorInfo.opacity ?? 0.15).toFixed(3)})`;
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
  };

  return (
    <canvas
      ref={(canvas) => {
        if (!canvas) return;
        drawAllBars(canvas);
      }}
      width={width}
      height={height}
      style={{ width, height }}
    />
  );
};

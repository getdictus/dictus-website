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
  state: DemoState;
  stateStartFrame: number;
  width: number;
  height: number;
}

/**
 * Frame-driven waveform canvas component for Remotion.
 * Renders 30 bars with center-weighted blue gradient and edge opacity.
 * No useState, useEffect, or requestAnimationFrame -- pure frame-based rendering.
 */
export const Waveform: React.FC<WaveformProps> = ({
  state,
  stateStartFrame,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phase = DEMO_STATE_TO_PHASE[state];

  const drawAllBars = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const { barWidth, offsetX } = computeBarLayout(width);

    for (let i = 0; i < BAR_COUNT; i++) {
      // Compute energy from deterministic phase function
      const energy = computePhaseEnergy(i, phase, frame, stateStartFrame, fps);

      // Compute bar height
      const barHeight = Math.max(
        MIN_BAR_HEIGHT + energy * (MAX_HEIGHT - MIN_BAR_HEIGHT),
        MIN_BAR_HEIGHT
      );

      const x = offsetX + i * (barWidth + BAR_SPACING);
      const y = (height - barHeight) / 2;
      const radius = barWidth / 2;

      // Resolve bar color
      const colorInfo = resolveBarColor(i);

      let fillStyle: string | CanvasGradient;
      if (colorInfo.type === "gradient") {
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, WAVEFORM_COLORS.gradientStart);
        gradient.addColorStop(1, WAVEFORM_COLORS.gradientEnd);
        fillStyle = gradient;
      } else {
        fillStyle = `rgba(${WAVEFORM_COLORS.edgeRgb},${(colorInfo.opacity ?? 0.15).toFixed(3)})`;
      }

      // Draw rounded rectangle
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

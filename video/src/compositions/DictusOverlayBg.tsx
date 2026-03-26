import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Waveform } from "../components/Waveform";
import { THEME_COLORS } from "../lib/colors";
import { computeSmoothedBars } from "../lib/waveform-math";
import type { DemoState } from "../lib/waveform-math";

// Always in transcribing state — matches the end of the intro overlay
function getStateAt(): { state: DemoState; stateStartFrame: number } {
  return { state: "transcribing", stateStartFrame: 0 };
}

// ─── COMPONENT ──────────────────────────────────────────────────────

type Props = {
  format: "landscape" | "portrait";
};

export const DictusOverlayBg: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  const isPortrait = format === "portrait";
  const waveformWidth = isPortrait ? 1000 : 1840;
  const waveformHeight = isPortrait ? 250 : 350;

  // Use the same smoothed bars computation as the intro
  const smoothedLevels = computeSmoothedBars(frame, fps, getStateAt);

  // Same gentle float as intro
  const waveformFloat = Math.sin(((frame % 120) / 120) * Math.PI * 2) * 3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tc.background,
      }}
    >
      {/* Very subtle glow — same as intro's end state */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(61,126,255,${0.05 * tc.glowMultiplier}) 0%, transparent 70%)`,
        }}
      />

      {/* Waveform — same position, same opacity as intro's end (0.2) */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${waveformFloat}px)`,
          opacity: 0.2,
        }}
      >
        <Waveform
          levels={smoothedLevels}
          width={waveformWidth}
          height={waveformHeight}
          edgeRgb={tc.waveformEdgeRgb}
        />
      </div>
    </AbsoluteFill>
  );
};

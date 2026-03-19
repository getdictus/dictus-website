import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { STATE_COLORS } from "../lib/colors";
import type { DemoState } from "../lib/waveform-math";

interface StateIndicatorProps {
  state: DemoState;
  label: string;
}

/**
 * State pill indicator for Remotion video.
 * Shows a colored dot with label text for active states.
 * Uses spring() for opacity transitions. Hidden during idle state.
 */
export const StateIndicator: React.FC<StateIndicatorProps> = ({
  state,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVisible = state !== "idle";
  const shouldGlow = state === "recording" || state === "transcribing";
  const dotColor = STATE_COLORS[state];

  // Spring-based opacity transition
  const opacity = spring({
    frame,
    fps,
    config: {
      mass: 1,
      damping: 20,
      stiffness: 100,
      overshootClamping: true,
    },
    from: isVisible ? 0 : 1,
    to: isVisible ? 1 : 0,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderRadius: 999,
        padding: "8px 16px",
        opacity,
      }}
    >
      {/* Colored dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: dotColor,
          boxShadow: shouldGlow
            ? `0 0 8px 2px ${dotColor}80`
            : "none",
          transition: "background-color 0.3s",
        }}
      />
      {/* Label text */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: 13,
          color: "rgba(255,255,255,0.70)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
};

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";
import { Waveform } from "../components/Waveform";
import { COLORS, THEME_COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";
import { computeSmoothedBars } from "../lib/waveform-math";
import type { DemoState } from "../lib/waveform-math";

const { fontFamily } = loadFont("normal", {
  weights: ["200", "300"],
  subsets: ["latin"],
});

// ─── TIMING (frames at 30fps, total 150 = 5s) ──────────────────────
const INTRO = {
  waveformStart: 0,
  recordingStart: 15, // 0.5s — waveform goes active
  text1Start: 30, // 1s — "Stop typing."
  text2Start: 65, // 2.17s — "Just speak."
  transitionStart: 105, // 3.5s — waveform calms down
  end: 150, // 5s
} as const;

function getStateAt(
  frame: number,
): { state: DemoState; stateStartFrame: number } {
  if (frame < INTRO.recordingStart)
    return { state: "idle", stateStartFrame: 0 };
  if (frame < INTRO.transitionStart)
    return { state: "recording", stateStartFrame: INTRO.recordingStart };
  return { state: "transcribing", stateStartFrame: INTRO.transitionStart };
}

// ─── COMPONENT ──────────────────────────────────────────────────────

type Props = {
  format: "landscape" | "portrait";
};

export const DictusOverlayIntro: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  const isPortrait = format === "portrait";
  const waveformWidth = isPortrait ? 1000 : 1840;
  const waveformHeight = isPortrait ? 250 : 350;
  const textSize1 = isPortrait ? 64 : 72;
  const textSize2 = isPortrait ? 64 : 72;

  // Smoothed waveform
  const smoothedLevels = computeSmoothedBars(frame, fps, getStateAt);

  // Waveform fade-in
  const waveformAppear = spring({
    frame,
    fps,
    config: { ...iosSpring.gentle, damping: 25 },
    durationInFrames: 40,
  });

  // Waveform float
  const waveformFloat = Math.sin(((frame % 120) / 120) * Math.PI * 2) * 3;

  // Waveform scale (grows during recording)
  const waveformScale =
    frame >= INTRO.recordingStart && frame < INTRO.transitionStart
      ? interpolate(
          frame - INTRO.recordingStart,
          [0, 30],
          [1, 1.06],
          { extrapolateRight: "clamp" },
        )
      : frame >= INTRO.transitionStart
        ? interpolate(
            frame - INTRO.transitionStart,
            [0, 30],
            [1.06, 1],
            { extrapolateRight: "clamp" },
          )
        : 1;

  // Waveform opacity — fade down at end for transition to bg overlay
  const waveformOpacity =
    frame >= INTRO.transitionStart
      ? interpolate(
          frame,
          [INTRO.transitionStart, INTRO.end],
          [1, 0.2],
          { extrapolateRight: "clamp" },
        )
      : 1;

  // Text animations
  const text1In = spring({
    frame: frame - INTRO.text1Start,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });
  const text2In = spring({
    frame: frame - INTRO.text2Start,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });

  // Both texts fade out at transition
  const textOut = interpolate(
    frame,
    [INTRO.transitionStart, INTRO.transitionStart + 20],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Glow
  const glowIntensity =
    frame >= INTRO.recordingStart && frame < INTRO.transitionStart
      ? 0.15
      : 0.05;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tc.background,
        fontFamily: `${fontFamily}, sans-serif`,
      }}
    >
      {/* Background glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(61,126,255,${glowIntensity * tc.glowMultiplier}) 0%, transparent 70%)`,
        }}
      />

      {/* Waveform */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${waveformScale}) translateY(${waveformFloat}px)`,
          opacity: waveformAppear * waveformOpacity,
        }}
      >
        <Waveform
          levels={smoothedLevels}
          width={waveformWidth}
          height={waveformHeight}
          edgeRgb={tc.waveformEdgeRgb}
        />
      </div>

      {/* Text: Stop typing. / Just speak. */}
      <div
        style={{
          position: "absolute",
          top: isPortrait ? "58%" : "60%",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isPortrait ? 12 : 8,
        }}
      >
        <div
          style={{
            opacity: text1In * textOut,
            transform: `translateY(${interpolate(text1In, [0, 1], [25, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: textSize1,
              fontWeight: 200,
              color: tc.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Stop typing.
          </span>
        </div>
        <div
          style={{
            opacity: text2In * textOut,
            transform: `translateY(${interpolate(text2In, [0, 1], [25, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: textSize2,
              fontWeight: 300,
              color: tc.textSecondary,
              letterSpacing: "-0.02em",
            }}
          >
            Just speak.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

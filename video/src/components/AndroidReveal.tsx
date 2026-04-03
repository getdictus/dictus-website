import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";
import { COLORS, THEME_COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";

const { fontFamily } = loadFont("normal", {
  weights: ["200", "300"],
  subsets: ["latin"],
});

// ─── COMPONENT ──────────────────────────────────────────────────────

export const AndroidReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  // Title entrance (immediate — fade-in comes from parent wrapper)
  const titleIn = spring({
    frame,
    fps,
    config: iosSpring.bouncy,
    durationInFrames: 25,
  });

  // Subtitle entrance (original delay)
  const subtitleIn = spring({
    frame: frame - 35,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });

  // Badge entrance (original delay)
  const badgeIn = spring({
    frame: frame - 60,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });

  // Subtle glow pulse
  const glowPulse = interpolate(
    Math.sin((frame / 60) * Math.PI * 2),
    [-1, 1],
    [0.03, 0.08],
  );

  return (
    <AbsoluteFill
      style={{
        // No background — waveform bg shows through from parent
        fontFamily: `${fontFamily}, sans-serif`,
      }}
    >
      {/* Glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, rgba(61,126,255,${glowPulse * tc.glowMultiplier}) 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleIn,
            transform: `scale(${interpolate(titleIn, [0, 1], [0.8, 1])})`,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 200,
              color: COLORS.accentBlue,
              letterSpacing: "-0.03em",
              textAlign: "center",
              display: "block",
            }}
          >
            Dictus Android beta
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleIn,
            transform: `translateY(${interpolate(subtitleIn, [0, 1], [15, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 200,
              color: tc.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            is now open.
          </span>
        </div>

        {/* Android badge */}
        <div
          style={{
            opacity: badgeIn,
            transform: `translateY(${interpolate(badgeIn, [0, 1], [15, 0])}px)`,
            marginTop: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              border: `1px solid ${COLORS.accentBlue}40`,
              borderRadius: 999,
              padding: "12px 36px",
              backgroundColor: `${COLORS.accentBlue}15`,
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill={COLORS.accentBlue}>
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.31-.56-2.76-.86-4.29-.86s-2.98.3-4.29.86L6.02 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86L6.73 9.48C3.55 11.16 1.39 14.36 1 18h22c-.39-3.64-2.55-6.84-5.73-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
            </svg>
            <span style={{ fontSize: 28, fontWeight: 300, color: COLORS.accentBlue }}>
              Android
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

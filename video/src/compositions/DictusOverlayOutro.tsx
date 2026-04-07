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

// ─── TIMING (frames at 30fps, total 210 = 7s) ──────────────────────
const OUTRO = {
  logoStart: 15,
  taglineStart: 40,
  platformsStart: 120,
  urlStart: 180,
  end: 210,
} as const;

// ─── LOGO ───────────────────────────────────────────────────────────

const DictusLogoIcon: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="outro-logo-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0D2040" />
        <stop offset="1" stopColor="#071020" />
      </linearGradient>
      <linearGradient id="outro-bar-accent" x1="35.5" y1="19" x2="44.5" y2="61" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6BA3FF" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    <rect width="80" height="80" rx="18" fill="url(#outro-logo-bg)" />
    <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
    <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="url(#outro-bar-accent)" />
    <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
  </svg>
);

// ─── COMPONENT ──────────────────────────────────────────────────────

type Props = {
  format: "landscape" | "portrait";
  tagline?: string;
};

export const DictusOverlayOutro: React.FC<Props> = ({ format, tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  const isPortrait = format === "portrait";
  const logoSize = isPortrait ? 160 : 120;
  const wordmarkSize = isPortrait ? 80 : 64;
  const taglineSize = isPortrait ? 32 : 26;

  // Animations
  const logoIn = spring({
    frame: frame - OUTRO.logoStart,
    fps,
    config: iosSpring.bouncy,
    durationInFrames: 35,
  });
  const taglineIn = spring({
    frame: frame - OUTRO.taglineStart,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  const platformsIn = spring({
    frame: frame - OUTRO.platformsStart,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  const urlIn = spring({
    frame: frame - OUTRO.urlStart,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tc.background,
        fontFamily: `${fontFamily}, sans-serif`,
      }}
    >
      {/* Subtle glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, rgba(61,126,255,${0.03 * tc.glowMultiplier}) 0%, transparent 70%)`,
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isPortrait ? 24 : 20,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoIn,
            transform: `scale(${interpolate(logoIn, [0, 1], [0.6, 1])})`,
          }}
        >
          <DictusLogoIcon size={logoSize} />
        </div>

        {/* Wordmark */}
        <div
          style={{
            opacity: logoIn,
            transform: `translateY(${interpolate(logoIn, [0, 1], [10, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: wordmarkSize,
              fontWeight: 200,
              color: tc.textPrimary,
              letterSpacing: "-0.04em",
            }}
          >
            Dictus
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineIn,
            transform: `translateY(${interpolate(taglineIn, [0, 1], [15, 0])}px)`,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: taglineSize,
              fontWeight: 300,
              color: tc.textSecondary,
              letterSpacing: "0.02em",
            }}
          >
            {tagline ?? "No cloud. Just your voice."}
          </span>
        </div>

        {/* Platform badges */}
        <div
          style={{
            opacity: platformsIn,
            transform: `translateY(${interpolate(platformsIn, [0, 1], [15, 0])}px)`,
            marginTop: 24,
            display: "flex",
            gap: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[
            { icon: "apple" as const, label: "iOS" },
            { icon: "android" as const, label: "Android" },
          ].map((platform) => (
            <div
              key={platform.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: `1px solid ${COLORS.accentBlue}40`,
                borderRadius: 999,
                padding: "8px 24px",
                backgroundColor: `${COLORS.accentBlue}15`,
                width: isPortrait ? 180 : 140,
              }}
            >
              <svg width={isPortrait ? 24 : 18} height={isPortrait ? 24 : 18} viewBox="0 0 24 24" fill={COLORS.accentBlue}>
                {platform.icon === "apple" ? (
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                ) : (
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.31-.56-2.76-.86-4.29-.86s-2.98.3-4.29.86L6.02 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86L6.73 9.48C3.55 11.16 1.39 14.36 1 18h22c-.39-3.64-2.55-6.84-5.73-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                )}
              </svg>
              <span style={{ fontSize: isPortrait ? 24 : 18, fontWeight: 300, color: COLORS.accentBlue }}>{platform.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlIn,
            transform: `translateY(${interpolate(urlIn, [0, 1], [10, 0])}px)`,
            marginTop: 20,
          }}
        >
          <span
            style={{
              fontSize: isPortrait ? 28 : 20,
              fontWeight: 300,
              color: tc.textSecondary,
              letterSpacing: "0.03em",
            }}
          >
            getdictus.com
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

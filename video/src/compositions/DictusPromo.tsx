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
import type { Theme } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";
import { PROMO_CONTENT } from "../lib/promo-i18n";
import { computeSmoothedBars } from "../lib/waveform-math";
import type { Locale } from "../lib/promo-i18n";
import type { DemoState } from "../lib/waveform-math";

// ─── FONT ────────────────────────────────────────────────────────────
const { fontFamily } = loadFont("normal", {
  weights: ["200", "300", "400"],
  subsets: ["latin"],
});

// ─── TIMING (frames at 30fps) ───────────────────────────────────────
const BEATS = {
  b1Start: 0,
  b1End: 75, // 0-2.5s — Accroche
  b2Start: 75,
  b2End: 195, // 2.5-6.5s — La voix
  b3Start: 195,
  b3End: 360, // 6.5-12s — Message clé
  b4Start: 360,
  b4End: 540, // 12-18s — Arguments
  b5Start: 540,
  b5End: 900, // 18-30s — Résolution (extended)
} as const;

// ─── STATE RESOLVER ─────────────────────────────────────────────────
function getStateAt(
  frame: number,
): { state: DemoState; stateStartFrame: number } {
  if (frame < BEATS.b2Start)
    return { state: "idle", stateStartFrame: BEATS.b1Start };
  if (frame < BEATS.b3Start)
    return { state: "recording", stateStartFrame: BEATS.b2Start };
  if (frame < BEATS.b5Start)
    return { state: "transcribing", stateStartFrame: BEATS.b3Start };
  return { state: "inserted", stateStartFrame: BEATS.b5Start };
}

// ─── SVG ICONS ──────────────────────────────────────────────────────

const WifiOffIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 1l22 22" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

const CodeIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
);

const ChipIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect
      x="9"
      y="9"
      width="6"
      height="6"
      rx="1"
      fill="currentColor"
      fillOpacity={0.2}
    />
    <line x1="9" y1="1" x2="9" y2="6" />
    <line x1="15" y1="1" x2="15" y2="6" />
    <line x1="9" y1="18" x2="9" y2="23" />
    <line x1="15" y1="18" x2="15" y2="23" />
    <line x1="1" y1="9" x2="6" y2="9" />
    <line x1="1" y1="15" x2="6" y2="15" />
    <line x1="18" y1="9" x2="23" y2="9" />
    <line x1="18" y1="15" x2="23" y2="15" />
  </svg>
);

const ICON_MAP = {
  "wifi-off": WifiOffIcon,
  code: CodeIcon,
  chip: ChipIcon,
} as const;

// ─── DICTUS LOGO (asymmetric wave bars) ─────────────────────────────

const DictusLogoIcon: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
  >
    <defs>
      <linearGradient
        id="logo-icon-bg"
        x1="0"
        y1="0"
        x2="80"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0D2040" />
        <stop offset="1" stopColor="#071020" />
      </linearGradient>
      <linearGradient
        id="logo-bar-accent"
        x1="35.5"
        y1="19"
        x2="44.5"
        y2="61"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6BA3FF" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient
        id="logo-stroke-glow"
        x1="0"
        y1="0"
        x2="80"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3D7EFF" stopOpacity={0.5} />
        <stop offset="1" stopColor="#3D7EFF" stopOpacity={0} />
      </linearGradient>
    </defs>
    {/* Squircle background */}
    <rect width="80" height="80" rx="18" fill="url(#logo-icon-bg)" />
    <rect width="80" height="80" rx="18" fill="none" stroke="url(#logo-stroke-glow)" strokeWidth="1" />
    {/* Three asymmetric bars — left short, center tall (implicit "i"), right medium */}
    <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
    <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="url(#logo-bar-accent)" />
    <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
  </svg>
);

// ─── MAIN COMPOSITION ───────────────────────────────────────────────

type DictusPromoProps = {
  locale: Locale;
  theme: Theme;
};

export const DictusPromo: React.FC<DictusPromoProps> = ({ locale, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = PROMO_CONTENT[locale];
  const tc = THEME_COLORS[theme];
  const { state } = getStateAt(frame);

  // ── Smoothed waveform bars ──
  const smoothedLevels = computeSmoothedBars(frame, fps, getStateAt);

  // ── Beat 1: Waveform fade-in ──
  const waveformAppear = spring({
    frame: frame - BEATS.b1Start,
    fps,
    config: { ...iosSpring.gentle, damping: 25 },
    durationInFrames: 45,
  });

  const waveformFloat = Math.sin(((frame % 120) / 120) * Math.PI * 2) * 3;

  const waveformScale =
    state === "recording"
      ? interpolate(
          frame - BEATS.b2Start,
          [0, 30, BEATS.b2End - BEATS.b2Start],
          [1, 1.08, 1.08],
          { extrapolateRight: "clamp" },
        )
      : state === "idle"
        ? 1
        : interpolate(
            frame,
            [BEATS.b4Start, BEATS.b5Start],
            [1.08, 0.85],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

  // Beat 4+: waveform fades to background
  const waveformBgOpacity =
    frame >= BEATS.b4Start
      ? interpolate(frame, [BEATS.b4Start, BEATS.b4Start + 20], [1, 0.25], {
          extrapolateRight: "clamp",
        })
      : 1;

  // Beat 5: waveform fades out for logo
  const waveformFinalOpacity =
    frame >= BEATS.b5Start
      ? interpolate(frame, [BEATS.b5Start, BEATS.b5Start + 30], [0.25, 0], {
          extrapolateRight: "clamp",
        })
      : waveformBgOpacity;

  // ── Beat 2: Headline ──
  const headlineIn = spring({
    frame: frame - (BEATS.b2Start + 20),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  const headlineOut = interpolate(
    frame,
    [BEATS.b3Start - 15, BEATS.b3Start],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const headlineOpacity =
    frame < BEATS.b2Start ? 0 : headlineIn * headlineOut;
  const headlineY = interpolate(headlineIn, [0, 1], [30, 0]);

  // ── Beat 3: Three lines ──
  const lines = [content.beat3.line1, content.beat3.line2, content.beat3.line3];
  const lineDelay = 53;

  // ── Beat 4: Features ──
  const featureDuration = 50;
  const featureGap = 5;

  // ── Beat 5: Logo + tagline + platforms + URL ──
  const logoIn = spring({
    frame: frame - (BEATS.b5Start + 15),
    fps,
    config: iosSpring.bouncy,
    durationInFrames: 35,
  });
  const taglineIn = spring({
    frame: frame - (BEATS.b5Start + 40),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  // Platforms badges appear at ~22s (frame 660)
  const platformsIn = spring({
    frame: frame - (BEATS.b5Start + 120),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  // URL appears at ~25s (frame 750)
  const urlIn = spring({
    frame: frame - (BEATS.b5Start + 180),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });

  // Final fade out (last 30 frames)
  const fadeOut = interpolate(
    frame,
    [BEATS.b5End - 30, BEATS.b5End],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Background glow ──
  const glowIntensity =
    state === "recording"
      ? 0.15
      : state === "transcribing"
        ? 0.1
        : frame >= BEATS.b5Start
          ? 0.03
          : 0.05;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tc.background,
        fontFamily: `${fontFamily}, sans-serif`,
        opacity: fadeOut,
      }}
    >
      {/* Background radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, rgba(61,126,255,${glowIntensity * tc.glowMultiplier}) 0%, transparent 70%)`,
        }}
      />

      {/* ── WAVEFORM ── */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${waveformScale}) translateY(${waveformFloat}px)`,
          opacity: waveformAppear * waveformFinalOpacity,
        }}
      >
        <Waveform levels={smoothedLevels} width={1840} height={350} edgeRgb={tc.waveformEdgeRgb} />
      </div>

      {/* ── BEAT 2: Headline ── */}
      {frame >= BEATS.b2Start && frame < BEATS.b3Start && (
        <div
          style={{
            position: "absolute",
            top: "58%",
            width: "100%",
            textAlign: "center",
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 200,
              color: tc.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            {content.beat2.headline}
          </span>
        </div>
      )}

      {/* ── BEAT 3: Three lines ── */}
      {frame >= BEATS.b3Start && frame < BEATS.b4Start && (
        <div
          style={{
            position: "absolute",
            top: "56%",
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          {lines.map((line, i) => {
            const lineFrame = frame - (BEATS.b3Start + 15 + i * lineDelay);
            const lineIn = spring({
              frame: lineFrame,
              fps,
              config: iosSpring.gentle,
              durationInFrames: 25,
            });
            const lineOut = interpolate(
              frame,
              [BEATS.b4Start - 20, BEATS.b4Start],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <div
                key={i}
                style={{
                  opacity: lineIn * lineOut,
                  transform: `translateY(${interpolate(lineIn, [0, 1], [20, 0])}px)`,
                }}
              >
                <span
                  style={{
                    fontSize: i === 0 ? 42 : 38,
                    fontWeight: i === 0 ? 300 : 200,
                    color: i === 0 ? tc.textPrimary : tc.textBody,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BEAT 4: Features ── */}
      {frame >= BEATS.b4Start &&
        frame < BEATS.b5Start &&
        content.beat4.features.map((feature, i) => {
          const featureStart =
            BEATS.b4Start + 15 + i * (featureDuration + featureGap);
          const relFrame = frame - featureStart;

          const slideIn = spring({
            frame: relFrame,
            fps,
            config: iosSpring.snappy,
            durationInFrames: 15,
          });
          const slideOut = spring({
            frame: relFrame - (featureDuration - 15),
            fps,
            config: iosSpring.snappy,
            durationInFrames: 12,
          });

          const opacity = slideIn * (1 - slideOut);
          const translateX = interpolate(slideIn, [0, 1], [60, 0]);
          const exitX = interpolate(slideOut, [0, 1], [0, -60]);

          if (opacity < 0.01) return null;

          const IconComponent = ICON_MAP[feature.icon];

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "43%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 28,
                opacity,
                transform: `translateX(${translateX + exitX}px)`,
              }}
            >
              <div style={{ color: COLORS.accentBlue }}>
                <IconComponent size={56} />
              </div>
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 300,
                  color: tc.textPrimary,
                  letterSpacing: "-0.02em",
                }}
              >
                {feature.label}
              </span>
            </div>
          );
        })}

      {/* ── BEAT 5: Logo + Tagline ── */}
      {frame >= BEATS.b5Start && (
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
          {/* Logo icon */}
          <div
            style={{
              opacity: logoIn,
              transform: `scale(${interpolate(logoIn, [0, 1], [0.6, 1])})`,
            }}
          >
            <DictusLogoIcon size={120} />
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
                fontSize: 64,
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
                fontSize: 26,
                fontWeight: 300,
                color: tc.textSecondary,
                letterSpacing: "0.02em",
              }}
            >
              {content.beat5.tagline}
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
                  minWidth: 120,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.accentBlue}>
                  {platform.icon === "apple" ? (
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  ) : (
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.31-.56-2.76-.86-4.29-.86s-2.98.3-4.29.86L6.02 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86L6.73 9.48C3.55 11.16 1.39 14.36 1 18h22c-.39-3.64-2.55-6.84-5.73-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                  )}
                </svg>
                <span style={{ fontSize: 18, fontWeight: 300, color: COLORS.accentBlue }}>{platform.label}</span>
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
                fontSize: 20,
                fontWeight: 300,
                color: tc.textSecondary,
                letterSpacing: "0.03em",
              }}
            >
              getdictus.com
            </span>
          </div>

        </div>
      )}
    </AbsoluteFill>
  );
};

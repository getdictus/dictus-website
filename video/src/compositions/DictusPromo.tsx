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
  b5End: 690, // 18-23s — Résolution
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
  const lineDelay = 35;

  // ── Beat 4: Features ──
  const featureDuration = 50;
  const featureGap = 5;

  // ── Beat 5: Logo + tagline ──
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

        </div>
      )}
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";
import { IPhoneMockup } from "../components/IPhoneMockup";
import { Waveform } from "../components/Waveform";
import { COLORS, THEME_COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";
import { computeSmoothedBars } from "../lib/waveform-math";
import type { DemoState } from "../lib/waveform-math";

const { fontFamily } = loadFont("normal", {
  weights: ["200", "300", "400"],
  subsets: ["latin"],
});

// ─── TIMING (frames at 30fps) ───────────────────────────────────────

const T = {
  entrance: 0,
  profileVisible: 15,
  tapPlus: 30,
  tapMic: 60,
  recording: 90,
  zoomText: 180,
  transcribed: 270,
  tapPost: 300,
  postDone: 330,
  videoEnd: 345,
  outroStart: 360,
  end: 570,
} as const;

// ─── TEXT OVERLAYS ──────────────────────────────────────────────────

const TEXT_OVERLAYS = [
  { text: "Switch to Dictus keyboard", startFrame: 15, duration: 55 },
  { text: "Tap the mic", startFrame: 75, duration: 55 },
  { text: "Transcribing in real time", startFrame: 180, duration: 85 },
  { text: "100% offline. On-device AI.", startFrame: 270, duration: 60 },
] as const;

// ─── LOGO ───────────────────────────────────────────────────────────

const DictusLogoIcon: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="sc-logo-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0D2040" />
        <stop offset="1" stopColor="#071020" />
      </linearGradient>
      <linearGradient id="sc-bar-accent" x1="35.5" y1="19" x2="44.5" y2="61" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6BA3FF" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    <rect width="80" height="80" rx="18" fill="url(#sc-logo-bg)" />
    <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
    <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="url(#sc-bar-accent)" />
    <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
  </svg>
);

// ─── BG WAVEFORM STATE ──────────────────────────────────────────────

function bgGetStateAt(): { state: DemoState; stateStartFrame: number } {
  return { state: "transcribing", stateStartFrame: 0 };
}

// ─── COMPONENT ──────────────────────────────────────────────────────

type Props = {
  outroVariant: "in-phone" | "fullscreen";
};

export const DictusDemoShowcase: React.FC<Props> = ({ outroVariant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  const phoneWidth = 520;
  const isOutroPhase = frame >= T.outroStart;

  // ── Background waveform (bigger, more visible) ──
  const bgLevels = computeSmoothedBars(frame, fps, bgGetStateAt);
  const bgFloat = Math.sin(((frame % 120) / 120) * Math.PI * 2) * 3;

  // ── Phone entrance (fast spring from bottom) ──
  const entranceSpring = spring({
    frame: frame - T.entrance,
    fps,
    config: iosSpring.snappy,
    durationInFrames: 25,
  });
  const entranceY = interpolate(entranceSpring, [0, 1], [400, 0]);
  const entranceScale = interpolate(entranceSpring, [0, 1], [0.9, 1]);
  const entranceOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // ── Zoom system (spring-based for natural easing) ──

  // Zoom 1: plan large → zoom bas (clavier) — at 1s (frame 30)
  const zoom1 = spring({
    frame: frame - 30,
    fps,
    config: { mass: 0.8, damping: 16, stiffness: 150, overshootClamping: true },
    durationInFrames: 25,
  });

  // Zoom 2: zoom bas → zoom haut (text area) — at 3s (frame 90)
  const zoom2 = spring({
    frame: frame - 90,
    fps,
    config: { mass: 1, damping: 18, stiffness: 100, overshootClamping: true },
    durationInFrames: 35,
  });

  // Zoom 3: dézoom → plan large — at 7s (frame 210)
  const zoom3 = spring({
    frame: frame - 210,
    fps,
    config: { mass: 1, damping: 20, stiffness: 100, overshootClamping: true },
    durationInFrames: 35,
  });

  const zoomScale =
    1 +
    zoom1 * (1.3 - 1) +
    zoom2 * (1.6 - 1.3) +
    zoom3 * (1 - 1.6);

  const zoomY =
    0 +
    zoom1 * 200 +
    zoom2 * (-250 - 200) +
    zoom3 * (0 - (-250));

  // ── Subtle floating ──
  const floatY = Math.sin(((frame % 180) / 180) * Math.PI * 2) * 3;

  // ── Shadow ──
  const shadowIntensity = 0.12;

  // ── Outro transitions ──
  const phoneExitOpacity = outroVariant === "fullscreen" && isOutroPhase
    ? interpolate(frame, [T.outroStart, T.outroStart + 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const phoneOutroScale = outroVariant === "fullscreen" && isOutroPhase
    ? interpolate(frame, [T.outroStart, T.outroStart + 45], [1, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // ── Fullscreen outro animations — offsets 15/40/120/180 matching promo ──
  const fsLogoIn = spring({
    frame: frame - (T.outroStart + 15),
    fps,
    config: iosSpring.bouncy,
    durationInFrames: 35,
  });
  const fsTaglineIn = spring({
    frame: frame - (T.outroStart + 40),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  const fsPlatformsIn = spring({
    frame: frame - (T.outroStart + 120),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });
  const fsUrlIn = spring({
    frame: frame - (T.outroStart + 180),
    fps,
    config: iosSpring.gentle,
    durationInFrames: 30,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: `${fontFamily}, sans-serif`,
      }}
    >
      {/* Background waveform */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${bgFloat}px)`,
          opacity: 0.25,
        }}
      >
        <Waveform
          levels={bgLevels}
          width={1400}
          height={400}
          edgeRgb={tc.waveformEdgeRgb}
        />
      </div>

      {/* Phone mockup with zooms */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${entranceScale * zoomScale * phoneOutroScale}) translateY(${entranceY + zoomY + floatY}px)`,
          opacity: entranceOpacity * phoneExitOpacity,
          filter: `drop-shadow(0 12px 40px rgba(0,0,0,${shadowIntensity}))`,
        }}
      >
        <IPhoneMockup variant="realistic" width={phoneWidth} statusBarColor="light">
          <OffthreadVideo
            src={staticFile("videos/demo-transcription.mp4")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            startFrom={0}
            pauseWhenBuffering
          />
        </IPhoneMockup>
      </div>

      {/* Text overlays (only during demo phase) */}
      {!isOutroPhase &&
        TEXT_OVERLAYS.map((overlay, i) => {
          const textIn = spring({
            frame: frame - overlay.startFrame,
            fps,
            config: iosSpring.snappy,
            durationInFrames: 15,
          });
          const textOut = interpolate(
            frame,
            [overlay.startFrame + overlay.duration - 12, overlay.startFrame + overlay.duration],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const opacity = frame < overlay.startFrame ? 0 : textIn * textOut;
          const scaleText = interpolate(textIn, [0, 1], [0.92, 1]);
          const translateY = interpolate(textIn, [0, 1], [15, 0]);

          if (opacity < 0.01) return null;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: "8%",
                width: "100%",
                textAlign: "center",
                opacity,
                transform: `translateY(${translateY}px) scale(${scaleText})`,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 300,
                  color: tc.textBody,
                  letterSpacing: "-0.01em",
                }}
              >
                {overlay.text}
              </span>
            </div>
          );
        })}

      {/* Variant B: fullscreen outro */}
      {outroVariant === "fullscreen" && isOutroPhase && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={{ opacity: fsLogoIn, transform: `scale(${interpolate(fsLogoIn, [0, 1], [0.6, 1])})` }}>
            <DictusLogoIcon size={160} />
          </div>
          <div style={{ opacity: fsLogoIn, transform: `translateY(${interpolate(fsLogoIn, [0, 1], [10, 0])}px)` }}>
            <span style={{ fontSize: 86, fontWeight: 200, color: tc.textPrimary, letterSpacing: "-0.04em" }}>
              Dictus
            </span>
          </div>
          <div style={{ opacity: fsTaglineIn, transform: `translateY(${interpolate(fsTaglineIn, [0, 1], [15, 0])}px)`, marginTop: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 300, color: tc.textSecondary, letterSpacing: "0.02em" }}>
              No cloud. Just your voice.
            </span>
          </div>
          <div
            style={{
              opacity: fsPlatformsIn,
              transform: `translateY(${interpolate(fsPlatformsIn, [0, 1], [15, 0])}px)`,
              marginTop: 28,
              display: "flex",
              gap: 20,
              justifyContent: "center",
            }}
          >
            {["iOS", "Android"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  border: `1px solid ${COLORS.accentBlue}40`,
                  borderRadius: 999,
                  padding: "10px 28px",
                  backgroundColor: `${COLORS.accentBlue}15`,
                  width: 220,
                }}
              >
                <span style={{ fontSize: 30, fontWeight: 300, color: COLORS.accentBlue }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ opacity: fsUrlIn, transform: `translateY(${interpolate(fsUrlIn, [0, 1], [10, 0])}px)`, marginTop: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 300, color: tc.textSecondary, letterSpacing: "0.03em" }}>
              getdictus.com
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  Sequence,
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

// ─── TIMING (frames at 30fps, 900 total = 30s) ─────────────────────

const T = {
  // Phase 1: Intro (all shifted -0.5s / -15 frames to compensate spring delay)
  introStart: 0,
  introRecording: 15,      // 0.5s — waveform goes active (SOUND ANCHOR)
  introText1: 15,           // 0.5s — "Stop typing." (was 1s)
  introText2: 50,           // 1.67s — "Just speak." (was 2.17s)
  introFadeOut: 95,         // 3.17s — texts fade (was 3.7s)

  // Phase 2: Demo
  phoneEntrance: 120,       // 4s — phone slides in (was 4.5s)
  tapPlus: 150,             // 5s — zoom to keyboard (was 5.5s)
  zoomText: 210,            // 7s — zoom to text area (was 7.5s)
  dezoom: 354,              // 11.8s — dézoom plan large (was 12.3s)
  videoEnd: 450,            // 15s (was 15.5s)

  // Phase 3: Outro
  outroStart: 465,          // 15.5s — phone exits, logo appears (was 16s)
  end: 900,                 // 30s
} as const;

// ─── TEXT OVERLAYS (during demo phase) ──────────────────────────────

const TEXT_OVERLAYS = [
  { text: "Switch to Dictus keyboard", startFrame: 135, duration: 50 },
  { text: "Tap the mic", startFrame: 189, duration: 50 },
  { text: "Transcribing in real time", startFrame: 240, duration: 90 },
  { text: "100% offline. On-device AI.", startFrame: 360, duration: 80 },
] as const;

// ─── LOGO ───────────────────────────────────────────────────────────

const DictusLogoIcon: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="full-logo-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0D2040" />
        <stop offset="1" stopColor="#071020" />
      </linearGradient>
      <linearGradient id="full-bar-accent" x1="35.5" y1="19" x2="44.5" y2="61" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6BA3FF" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    <rect width="80" height="80" rx="18" fill="url(#full-logo-bg)" />
    <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
    <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="url(#full-bar-accent)" />
    <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
  </svg>
);

// ─── WAVEFORM STATE ─────────────────────────────────────────────────

function getWaveformState(
  frame: number,
): { state: DemoState; stateStartFrame: number } {
  if (frame < T.introRecording)
    return { state: "idle", stateStartFrame: 0 };
  if (frame < T.introFadeOut)
    return { state: "recording", stateStartFrame: T.introRecording };
  return { state: "transcribing", stateStartFrame: T.introFadeOut };
}

// ─── COMPONENT ──────────────────────────────────────────────────────

export const DictusDemoFull: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  const phoneWidth = 520;
  const isIntroPhase = frame < T.phoneEntrance;
  const isDemoPhase = frame >= T.phoneEntrance && frame < T.outroStart;
  const isOutroPhase = frame >= T.outroStart;

  // ── Background waveform (throughout the entire video) ──
  const wfLevels = computeSmoothedBars(frame, fps, getWaveformState);
  const wfFloat = Math.sin(((frame % 120) / 120) * Math.PI * 2) * 3;

  // Waveform appearance
  const wfAppear = spring({
    frame,
    fps,
    config: { ...iosSpring.gentle, damping: 25 },
    durationInFrames: 40,
  });

  // Waveform scale (grows during recording intro)
  const wfScale =
    frame >= T.introRecording && frame < T.introFadeOut
      ? interpolate(frame - T.introRecording, [0, 30], [1, 1.06], { extrapolateRight: "clamp" })
      : frame >= T.introFadeOut
        ? interpolate(frame - T.introFadeOut, [0, 30], [1.06, 1], { extrapolateRight: "clamp" })
        : 1;

  // Waveform opacity — full during intro, fades to subtle during demo/outro
  const wfOpacity = interpolate(
    frame,
    [0, T.introFadeOut, T.phoneEntrance, T.end],
    [1, 1, 0.2, 0.2],
    { extrapolateRight: "clamp" },
  );

  // Glow intensity
  const glowIntensity =
    frame >= T.introRecording && frame < T.introFadeOut ? 0.15 : 0.05;

  // ── Intro texts ──
  const introText1In = spring({
    frame: frame - T.introText1,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });
  const introText2In = spring({
    frame: frame - T.introText2,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });
  const introTextOut = interpolate(
    frame,
    [T.introFadeOut, T.introFadeOut + 20],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Phone entrance ──
  const phoneSpring = spring({
    frame: frame - T.phoneEntrance,
    fps,
    config: iosSpring.snappy,
    durationInFrames: 25,
  });
  const phoneEntranceY = interpolate(phoneSpring, [0, 1], [400, 0]);
  const phoneEntranceScale = interpolate(phoneSpring, [0, 1], [0.9, 1]);
  const phoneEntranceOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);

  // ── Zooms (relative to phone entrance) ──
  const zoom1 = spring({
    frame: frame - T.tapPlus,
    fps,
    config: { mass: 0.8, damping: 16, stiffness: 150, overshootClamping: true },
    durationInFrames: 25,
  });
  const zoom2 = spring({
    frame: frame - T.zoomText,
    fps,
    config: { mass: 1, damping: 18, stiffness: 100, overshootClamping: true },
    durationInFrames: 35,
  });
  const zoom3 = spring({
    frame: frame - T.dezoom,
    fps,
    config: { mass: 1, damping: 20, stiffness: 100, overshootClamping: true },
    durationInFrames: 35,
  });
  // Zoom 4: re-zoom phone to foreground at 14s (frame 420)
  const zoom4 = spring({
    frame: frame - 420,
    fps,
    config: { mass: 0.8, damping: 16, stiffness: 150, overshootClamping: true },
    durationInFrames: 25,
  });

  const zoomScale = 1 + zoom1 * 0.3 + zoom2 * 0.3 + zoom3 * -0.6 + zoom4 * 0.3;
  const zoomY = zoom1 * 200 + zoom2 * -450 + zoom3 * 250 + zoom4 * 150;

  const floatY = Math.sin(((frame % 180) / 180) * Math.PI * 2) * 3;

  // ── Phone exit (outro) ──
  const phoneExitOpacity = isOutroPhase
    ? interpolate(frame, [T.outroStart, T.outroStart + 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const phoneExitScale = isOutroPhase
    ? interpolate(frame, [T.outroStart, T.outroStart + 45], [1, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // ── Outro animations (same timing as overlay-outro) ──
  // Outro offsets: 15/40/120/180 — matching promo exactly
  const fsLogoIn = spring({ frame: frame - (T.outroStart + 15), fps, config: iosSpring.bouncy, durationInFrames: 35 });
  const fsTaglineIn = spring({ frame: frame - (T.outroStart + 40), fps, config: iosSpring.gentle, durationInFrames: 30 });
  const fsPlatformsIn = spring({ frame: frame - (T.outroStart + 120), fps, config: iosSpring.gentle, durationInFrames: 30 });
  const fsUrlIn = spring({ frame: frame - (T.outroStart + 180), fps, config: iosSpring.gentle, durationInFrames: 30 });

  // Show phone only during demo + early outro
  const showPhone = frame >= T.phoneEntrance;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: `${fontFamily}, sans-serif`,
      }}
    >
      {/* Background glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 38%, rgba(61,126,255,${glowIntensity * tc.glowMultiplier}) 0%, transparent 70%)`,
        }}
      />

      {/* Waveform (throughout entire video) */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${wfScale}) translateY(${wfFloat}px)`,
          opacity: wfAppear * wfOpacity,
        }}
      >
        <Waveform
          levels={wfLevels}
          width={1400}
          height={400}
          edgeRgb={tc.waveformEdgeRgb}
        />
      </div>

      {/* ── INTRO TEXTS ── */}
      {isIntroPhase && (
        <div
          style={{
            position: "absolute",
            top: "58%",
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              opacity: introText1In * introTextOut,
              transform: `translateY(${interpolate(introText1In, [0, 1], [25, 0])}px)`,
            }}
          >
            <span style={{ fontSize: 72, fontWeight: 200, color: tc.textPrimary, letterSpacing: "-0.02em" }}>
              Stop typing.
            </span>
          </div>
          <div
            style={{
              opacity: introText2In * introTextOut,
              transform: `translateY(${interpolate(introText2In, [0, 1], [25, 0])}px)`,
            }}
          >
            <span style={{ fontSize: 72, fontWeight: 300, color: tc.textSecondary, letterSpacing: "-0.02em" }}>
              Just speak.
            </span>
          </div>
        </div>
      )}

      {/* ── PHONE MOCKUP ── */}
      {showPhone && (
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${phoneEntranceScale * zoomScale * phoneExitScale}) translateY(${phoneEntranceY + zoomY + floatY}px)`,
            opacity: phoneEntranceOpacity * phoneExitOpacity,
            filter: `drop-shadow(0 12px 40px rgba(0,0,0,0.12))`,
          }}
        >
          <IPhoneMockup variant="realistic" width={phoneWidth} statusBarColor="light">
            <Sequence from={T.phoneEntrance} layout="none">
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
                pauseWhenBuffering
              />
            </Sequence>
          </IPhoneMockup>
        </div>
      )}

      {/* ── DEMO TEXT OVERLAYS ── */}
      {isDemoPhase &&
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
              <span style={{ fontSize: 48, fontWeight: 300, color: tc.textBody, letterSpacing: "-0.01em" }}>
                {overlay.text}
              </span>
            </div>
          );
        })}

      {/* ── FULLSCREEN OUTRO ── */}
      {isOutroPhase && (
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

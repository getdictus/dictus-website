import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont as loadDMMono } from "@remotion/google-fonts/DMMono";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { COLORS, THEME_COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";

const { fontFamily: monoFont } = loadDMMono("normal", {
  weights: ["300", "400"],
  subsets: ["latin"],
});

const { fontFamily: sansFont } = loadDMSans("normal", {
  weights: ["300", "400", "600"],
  subsets: ["latin"],
});

// ─── COLORS (light theme — matches intro/outro) ────────────────────

const TC = THEME_COLORS.light;
const C = {
  text: TC.textPrimary,
  textBody: TC.textBody,
  textMuted: TC.textSecondary,
  accent: COLORS.accentBlue,
  accentHi: COLORS.accentHi,
  border: "rgba(0,0,0,0.08)",
  statusBg: "rgba(255,255,255,0.6)",
  success: "#22C55E",
} as const;

// ─── TIMING (local frames at 30fps) ────────────────────────────────

const T = {
  headerAppear: 0,
  claudeType: 9,
  infoBlock: 18,
  separator: 35,
  promptAppear: 42,
  typeStart: 50,
  statusBar: 30,
} as const;

// Typing config
const COMMAND_TEXT = "ok claude, build Dictus for Android. Make no mistakes.";
const PAUSE_AFTER = "ok claude, build Dictus for Android.";
const CHAR_FRAMES = 2;
const PAUSE_FRAMES = 10;

// ─── TYPEWRITER ─────────────────────────────────────────────────────

const getTypedText = (
  frame: number,
  fullText: string,
  pauseAfter: string,
  charFrames: number,
  pauseFrames: number,
): string => {
  const pauseIndex = fullText.indexOf(pauseAfter);
  const preLen =
    pauseIndex >= 0 ? pauseIndex + pauseAfter.length : fullText.length;

  let typedChars = 0;
  if (frame < preLen * charFrames) {
    typedChars = Math.floor(frame / charFrames);
  } else if (frame < preLen * charFrames + pauseFrames) {
    typedChars = preLen;
  } else {
    const postPhase = frame - preLen * charFrames - pauseFrames;
    typedChars = Math.min(
      fullText.length,
      preLen + Math.floor(postPhase / charFrames),
    );
  }
  return fullText.slice(0, typedChars);
};

// Derived timings
const TYPING_TOTAL_FRAMES =
  COMMAND_TEXT.length * CHAR_FRAMES + PAUSE_FRAMES;
const CODE_SCROLL_START = T.typeStart + TYPING_TOTAL_FRAMES + 15;
const CODE_SCROLL_DURATION = 90;
const DONE_APPEAR = CODE_SCROLL_START + CODE_SCROLL_DURATION + 10;

// ─── FAKE CODE LINES ────────────────────────────────────────────────

const CODE_LINES = [
  "⠋ Setting up Android project...",
  "  Creating app/build.gradle.kts",
  "  Adding Whisper model integration",
  "⠙ Configuring on-device ML runtime",
  "  src/main/kotlin/com/dictus/",
  "    DictusKeyboardService.kt",
  "    WhisperEngine.kt",
  "    AudioProcessor.kt",
  "  Compiling native libraries...",
  "⠹ Building speech recognition pipeline",
  "  Linking libwhisper.so (arm64-v8a)",
  "  Optimizing model quantization",
  "⠸ Running tests...",
  "  ✓ AudioCapture",
  "  ✓ WhisperInference",
  "  ✓ KeyboardIME",
  "  ✓ OfflineMode",
  "⠼ Generating signed APK",
  "  Build successful.",
];

// ─── CLAUDE CRAB ASCII LOGO ─────────────────────────────────────────

const CrabLogo: React.FC<{ size: number }> = ({ size }) => {
  const s = size;
  const px = s / 10;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <rect x={2 * px} y={0} width={px} height={px} fill="#D4654A" />
      <rect x={7 * px} y={0} width={px} height={px} fill="#D4654A" />
      <rect x={3 * px} y={px} width={px} height={px} fill="#E8805A" />
      <rect x={6 * px} y={px} width={px} height={px} fill="#E8805A" />
      <rect x={3 * px} y={2 * px} width={4 * px} height={px} fill="#E8805A" />
      <rect x={2 * px} y={3 * px} width={6 * px} height={px} fill="#E8805A" />
      <rect x={3 * px} y={3 * px} width={px} height={px} fill="#1A1A2E" />
      <rect x={6 * px} y={3 * px} width={px} height={px} fill="#1A1A2E" />
      <rect x={2 * px} y={4 * px} width={6 * px} height={px} fill="#D4654A" />
      <rect x={0} y={5 * px} width={px} height={px} fill="#D4654A" />
      <rect x={1 * px} y={5 * px} width={px} height={px} fill="#E8805A" />
      <rect x={2 * px} y={5 * px} width={6 * px} height={px} fill="#D4654A" />
      <rect x={8 * px} y={5 * px} width={px} height={px} fill="#E8805A" />
      <rect x={9 * px} y={5 * px} width={px} height={px} fill="#D4654A" />
      <rect x={0} y={6 * px} width={px} height={px} fill="#E8805A" />
      <rect x={1 * px} y={6 * px} width={px} height={px} fill="#D4654A" />
      <rect x={3 * px} y={6 * px} width={4 * px} height={px} fill="#D4654A" />
      <rect x={8 * px} y={6 * px} width={px} height={px} fill="#D4654A" />
      <rect x={9 * px} y={6 * px} width={px} height={px} fill="#E8805A" />
      <rect x={2 * px} y={7 * px} width={px} height={px} fill="#D4654A" />
      <rect x={4 * px} y={7 * px} width={px} height={px} fill="#D4654A" />
      <rect x={5 * px} y={7 * px} width={px} height={px} fill="#D4654A" />
      <rect x={7 * px} y={7 * px} width={px} height={px} fill="#D4654A" />
    </svg>
  );
};

// ─── CURSOR ─────────────────────────────────────────────────────────

const BlockCursor: React.FC<{ frame: number }> = ({ frame }) => {
  const blinkFrames = 16;
  const opacity = interpolate(
    frame % blinkFrames,
    [0, blinkFrames / 2, blinkFrames],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <span
      style={{
        display: "inline-block",
        width: 12,
        height: 24,
        backgroundColor: C.text,
        opacity,
        marginLeft: 2,
        verticalAlign: "middle",
      }}
    />
  );
};

// ─── COMPONENT ──────────────────────────────────────────────────────

export const ClaudeCodeTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fontSize = 26;
  const lineHeight = 1.6;
  const padding = 60;

  // ── Animations ──

  const headerIn = spring({
    frame: frame - T.headerAppear,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 20,
  });

  const claudeIn = spring({
    frame: frame - T.claudeType,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 15,
  });

  const infoIn = spring({
    frame: frame - T.infoBlock,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });

  const sepIn = spring({
    frame: frame - T.separator,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 20,
  });

  const promptIn = spring({
    frame: frame - T.promptAppear,
    fps,
    config: iosSpring.snappy,
    durationInFrames: 15,
  });

  const statusIn = spring({
    frame: frame - T.statusBar,
    fps,
    config: iosSpring.gentle,
    durationInFrames: 25,
  });

  // Typewriter
  const typingFrame = frame - T.typeStart;
  const typedText =
    typingFrame > 0
      ? getTypedText(typingFrame, COMMAND_TEXT, PAUSE_AFTER, CHAR_FRAMES, PAUSE_FRAMES)
      : "";
  const isTypingDone = typedText.length === COMMAND_TEXT.length;

  // Code scroll
  const scrollProgress =
    frame >= CODE_SCROLL_START
      ? interpolate(
          frame,
          [CODE_SCROLL_START, CODE_SCROLL_START + CODE_SCROLL_DURATION],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 0;

  const visibleCodeLines = Math.floor(scrollProgress * CODE_LINES.length);

  // Done
  const showDone = frame >= DONE_APPEAR;
  const doneIn = spring({
    frame: frame - DONE_APPEAR,
    fps,
    config: iosSpring.bouncy,
    durationInFrames: 20,
  });

  return (
    <AbsoluteFill
      style={{
        // Transparent — light bg comes from overlay behind
        fontFamily: `${monoFont}, monospace`,
        fontSize,
        lineHeight,
        color: C.text,
        padding,
        paddingTop: 80,
        overflow: "hidden",
      }}
    >
      {/* ── Git header ── */}
      <div style={{ opacity: headerIn }}>
        <span style={{ color: C.textMuted }}>~/dev/dictus-android </span>
        <span style={{ color: C.textMuted }}>git:</span>
        <span style={{ color: C.accent }}>(develop)</span>
      </div>

      {/* ── "claude" command ── */}
      {frame >= T.claudeType && (
        <div style={{ opacity: claudeIn, marginTop: 8 }}>
          <span style={{ fontWeight: 600, fontFamily: `${sansFont}, sans-serif`, fontSize: fontSize * 1.1, color: C.text }}>
            claude
          </span>
        </div>
      )}

      {/* ── Info block ── */}
      {frame >= T.infoBlock && (
        <div
          style={{
            opacity: infoIn,
            transform: `translateY(${interpolate(infoIn, [0, 1], [10, 0])}px)`,
            marginTop: 16,
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            paddingLeft: 24,
          }}
        >
          <CrabLogo size={70} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span>
              <span style={{ fontFamily: `${sansFont}, sans-serif`, fontWeight: 600, fontSize: fontSize * 1.05, color: C.text }}>
                Claude Code
              </span>
              <span style={{ color: C.textMuted, marginLeft: 12 }}>v2.1.91</span>
            </span>
            <span style={{ color: C.textBody, fontSize: fontSize * 0.85 }}>
              Opus 4.6 (1M context) · Claude Max
            </span>
            <span style={{ color: C.textMuted, fontSize: fontSize * 0.85 }}>
              ~/dev/dictus-android
            </span>
          </div>
        </div>
      )}

      {/* ── Separator ── */}
      {frame >= T.separator && (
        <div
          style={{
            marginTop: 24,
            marginBottom: 24,
            height: 1,
            backgroundColor: C.border,
            transform: `scaleX(${sepIn})`,
            transformOrigin: "left",
          }}
        />
      )}

      {/* ── Prompt + typing ── */}
      {frame >= T.promptAppear && (
        <div style={{ opacity: promptIn, display: "flex", alignItems: "center" }}>
          <span style={{ color: C.accent, marginRight: 12, fontSize: fontSize * 1.2 }}>
            ❯
          </span>
          <span style={{ color: C.text }}>
            {typedText}
          </span>
          {!isTypingDone && typingFrame >= 0 && (
            <BlockCursor frame={frame} />
          )}
        </div>
      )}

      {/* ── Code scroll output ── */}
      {frame >= CODE_SCROLL_START && (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: fontSize * 0.8,
          }}
        >
          {CODE_LINES.slice(0, visibleCodeLines).map((line, i) => {
            const lineFrame = frame - CODE_SCROLL_START - (i / CODE_LINES.length) * CODE_SCROLL_DURATION;
            const lineOpacity = interpolate(lineFrame, [0, 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const isSpinner = line.startsWith("⠋") || line.startsWith("⠙") || line.startsWith("⠹") || line.startsWith("⠸") || line.startsWith("⠼");
            const isCheck = line.includes("✓");
            return (
              <div key={i} style={{ opacity: lineOpacity }}>
                <span
                  style={{
                    color: isCheck
                      ? C.success
                      : isSpinner
                        ? C.accent
                        : C.textBody,
                  }}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Done ── */}
      {showDone && (
        <div
          style={{
            marginTop: 32,
            opacity: doneIn,
            transform: `scale(${interpolate(doneIn, [0, 1], [0.6, 1])})`,
            transformOrigin: "left center",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: C.accent, fontSize: fontSize * 1.4 }}>✓</span>
          <span style={{ color: C.accent, fontSize: fontSize * 1.2, fontWeight: 600, fontFamily: `${sansFont}, sans-serif` }}>
            Done.
          </span>
        </div>
      )}

      {/* ── Status bar (bottom) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          opacity: statusIn,
          borderTop: `1px solid ${C.border}`,
          padding: "10px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: fontSize * 0.7,
          backgroundColor: C.statusBg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.accent }}>▸▸</span>
          <span style={{ color: C.textBody }}>bypass permissions on</span>
          <span style={{ color: C.textMuted }}>(shift+tab to cycle)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.textMuted }}>Opus 4.6 (1M context)</span>
          <span style={{ color: C.textMuted }}>│</span>
          <span style={{ color: C.textBody }}>dictus-android</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

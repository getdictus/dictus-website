import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { DictusOverlayIntro } from "./DictusOverlayIntro";
import { DictusOverlayOutro } from "./DictusOverlayOutro";
import { ClaudeCodeTerminal } from "../components/ClaudeCodeTerminal";
import { AndroidReveal } from "../components/AndroidReveal";
import { Waveform } from "../components/Waveform";
import { THEME_COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";
import { computeSmoothedBars } from "../lib/waveform-math";
import type { DemoState } from "../lib/waveform-math";

// ─── TIMING (frames at 30fps, 900 total = 30s) ────────────────────
//
// Layer 0: Light background + overlay bg waveform  — CONTINUOUS (0 → 900)
// Scene 1: Intro overlay         0 → 150   (5s)    — fade out last 20f
// Scene 2: Claude Code terminal  140 → 500  (12s)   — fade in 20f, fade out 25f
// Scene 3: Android reveal        490 → 690  (6.7s)  — fade in 20f, fade out 20f
// Scene 4: Outro overlay         680 → 900  (7.3s)  — fade in 20f
//
// Music sync (sound anchor = frame 15 = 0.5s):
//   6.5s  (f195) → terminal visible
//   8.8s  (f264) → typing
//   10.5s (f315) → code scrolling
//   12s   (f360) → code climax
//   14.3s (f429) → "✓ Done."
//   16.7s (f500) → reveal fades in
//   18s   (f540) → "is now open."
//   23s   (f690) → outro starts

const SCENES = {
  intro:    { start: 0,   duration: 150 },
  terminal: { start: 140, duration: 360 },  // 140 → 500
  reveal:   { start: 490, duration: 200 },  // 490 → 690
  outro:    { start: 680, duration: 220 },   // 680 → 900
} as const;

// ─── FADE WRAPPER ───────────────────────────────────────────────────

const FadeInOut: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}> = ({ children, durationInFrames, fadeInFrames = 20, fadeOutFrames = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    config: iosSpring.gentle,
    durationInFrames: fadeInFrames,
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── WAVEFORM ONLY (no opaque background) ───────────────────────────

function getWfState(): { state: DemoState; stateStartFrame: number } {
  return { state: "transcribing", stateStartFrame: 0 };
}

const WaveformOnly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = THEME_COLORS.light;

  const smoothedLevels = computeSmoothedBars(frame, fps, getWfState);
  const waveformFloat = Math.sin(((frame % 120) / 120) * Math.PI * 2) * 3;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${waveformFloat}px)`,
          opacity: 0.3,
        }}
      >
        <Waveform
          levels={smoothedLevels}
          width={1000}
          height={250}
          edgeRgb={tc.waveformEdgeRgb}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION ────────────────────────────────────────────────────

export const DictusAndroidBeta: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME_COLORS.light.background }}>
      {/* Scene 1: Intro — waveform + "Stop typing. Just speak." */}
      <Sequence
        from={SCENES.intro.start}
        durationInFrames={SCENES.intro.duration}
        premountFor={30}
      >
        <FadeInOut durationInFrames={SCENES.intro.duration} fadeInFrames={1} fadeOutFrames={20}>
          <DictusOverlayIntro format="portrait" />
        </FadeInOut>
      </Sequence>

      {/* Scene 2: Claude Code terminal */}
      <Sequence
        from={SCENES.terminal.start}
        durationInFrames={SCENES.terminal.duration}
        premountFor={30}
      >
        <FadeInOut durationInFrames={SCENES.terminal.duration} fadeInFrames={20} fadeOutFrames={25}>
          <ClaudeCodeTerminal />
        </FadeInOut>
      </Sequence>

      {/* Scene 3: Android reveal */}
      <Sequence
        from={SCENES.reveal.start}
        durationInFrames={SCENES.reveal.duration}
        premountFor={30}
      >
        <FadeInOut durationInFrames={SCENES.reveal.duration} fadeInFrames={20} fadeOutFrames={20}>
          <AndroidReveal />
        </FadeInOut>
      </Sequence>

      {/* Scene 4: Outro */}
      <Sequence
        from={SCENES.outro.start}
        durationInFrames={SCENES.outro.duration}
        premountFor={30}
      >
        <FadeInOut durationInFrames={SCENES.outro.duration} fadeInFrames={20} fadeOutFrames={1}>
          <DictusOverlayOutro format="portrait" />
        </FadeInOut>
      </Sequence>

      {/* Top layer: Waveform bg overlay — starts with terminal, stays until end */}
      <Sequence from={SCENES.terminal.start} durationInFrames={900 - SCENES.terminal.start}>
        <AbsoluteFill style={{ opacity: 0.65, pointerEvents: "none" }}>
          {/* Remove the opaque bg — just the waveform */}
          <WaveformOnly />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

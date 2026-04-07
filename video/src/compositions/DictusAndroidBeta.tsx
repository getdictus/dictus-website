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
import { Waveform } from "../components/Waveform";
import { THEME_COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";
import { computeSmoothedBars } from "../lib/waveform-math";
import type { DemoState } from "../lib/waveform-math";

// ─── TIMING (frames at 30fps, 900 total = 30s) ────────────────────
//
// Layer 0: Light background continuous
// Scene 1: Intro overlay         0 → 150    (5s)
// Scene 2: Claude Code terminal  140 → 510  (12.3s)
// Scene 3: Outro overlay         500 → 900  (13.3s)
//          ↳ tagline = "The beta is now open."
// Waveform bg layer: terminal start → end (140 → 900)
//
// Music sync (sound anchor = frame 15 = 0.5s):
//   14.3s (f429) → "✓ Done."
//   ~17s  (f510) → outro logo drop

const SCENES = {
  intro:    { start: 0,   duration: 150 },
  terminal: { start: 140, duration: 350 },   // 140 → 490
  outro:    { start: 480, duration: 420 },    // 480 → 900 (logo at 16s = f480)
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
      {/* Bottom layer: Waveform bg — starts with terminal, stays until end */}
      <Sequence from={SCENES.terminal.start} durationInFrames={900 - SCENES.terminal.start}>
        <AbsoluteFill style={{ opacity: 0.65 }}>
          <WaveformOnly />
        </AbsoluteFill>
      </Sequence>

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

      {/* Scene 3: Outro — "The beta is now open." + badges + URL */}
      <Sequence
        from={SCENES.outro.start}
        durationInFrames={SCENES.outro.duration}
        premountFor={30}
      >
        <FadeInOut durationInFrames={SCENES.outro.duration} fadeInFrames={20} fadeOutFrames={1}>
          <DictusOverlayOutro format="portrait" tagline="The beta is now open." />
        </FadeInOut>
      </Sequence>
    </AbsoluteFill>
  );
};

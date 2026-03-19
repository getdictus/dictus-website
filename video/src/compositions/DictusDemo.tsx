import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { IPhoneMockup } from "../components/IPhoneMockup";
import { MessagesScene } from "../components/MessagesScene";
import { NotesScene } from "../components/NotesScene";
import { StateIndicator } from "../components/StateIndicator";
import { COLORS } from "../lib/colors";
import { CONTENT, type Locale } from "../lib/i18n";
import {
  STATE_DURATIONS,
  SCENE_CYCLE_FRAMES,
  SCENE_TRANSITION_FRAMES,
  iosSpring,
} from "../lib/spring-configs";
import type { DemoState } from "../lib/waveform-math";

interface DictusDemoProps {
  locale: Locale;
  variant?: "realistic" | "screen-only";
}

const TOTAL_FRAMES =
  2 * SCENE_CYCLE_FRAMES + 2 * SCENE_TRANSITION_FRAMES; // 460

const PHONE_WIDTH = 375;

/**
 * Compute demo state and its start frame given a relative frame within a scene cycle.
 */
function getStateAtFrame(relativeFrame: number): {
  state: DemoState;
  stateStartFrame: number;
} {
  const { idle, recording, transcribing } = STATE_DURATIONS;

  if (relativeFrame < idle) {
    return { state: "idle", stateStartFrame: 0 };
  }
  if (relativeFrame < idle + recording) {
    return { state: "recording", stateStartFrame: idle };
  }
  if (relativeFrame < idle + recording + transcribing) {
    return { state: "transcribing", stateStartFrame: idle + recording };
  }
  return {
    state: "inserted",
    stateStartFrame: idle + recording + transcribing,
  };
}

/**
 * Get the caption label for a given state.
 */
function getCaptionLabel(
  state: DemoState,
  locale: Locale
): string {
  const captions = CONTENT[locale].captions;
  switch (state) {
    case "recording":
      return captions.recording;
    case "transcribing":
      return captions.transcribing;
    case "inserted":
      return captions.inserted;
    default:
      return "";
  }
}

/**
 * Main DictusDemo composition.
 * Orchestrates Messages and Notes scenes with horizontal slide transitions,
 * 4-state demo cycle per scene, and seamless looping.
 */
export const DictusDemo: React.FC<DictusDemoProps> = ({
  locale,
  variant = "realistic",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline boundaries
  const scene1End = SCENE_CYCLE_FRAMES; // 210
  const transition1End = scene1End + SCENE_TRANSITION_FRAMES; // 230
  const scene2End = transition1End + SCENE_CYCLE_FRAMES; // 440
  const loopTransitionStart = scene2End; // 440
  // loopTransitionEnd = TOTAL_FRAMES = 460

  // Determine which scene is active and compute state
  let currentState: DemoState = "idle";
  let currentStateStartFrame = 0;
  let sceneIndex = 0; // 0=Messages, 1=Notes

  if (frame < scene1End) {
    // Scene 1: Messages
    sceneIndex = 0;
    const result = getStateAtFrame(frame);
    currentState = result.state;
    currentStateStartFrame = result.stateStartFrame;
  } else if (frame < transition1End) {
    // Transition: Messages -> Notes (keep last state of scene 1)
    sceneIndex = 0;
    currentState = "inserted";
    currentStateStartFrame =
      STATE_DURATIONS.idle +
      STATE_DURATIONS.recording +
      STATE_DURATIONS.transcribing;
  } else if (frame < scene2End) {
    // Scene 2: Notes
    sceneIndex = 1;
    const relativeFrame = frame - transition1End;
    const result = getStateAtFrame(relativeFrame);
    currentState = result.state;
    currentStateStartFrame = transition1End + result.stateStartFrame;
  } else {
    // Loop transition: cross-fade back to idle Messages
    sceneIndex = 0;
    currentState = "idle";
    currentStateStartFrame = loopTransitionStart;
  }

  // Scene 2 state (for rendering during transition)
  const scene2RelativeFrame = Math.max(0, frame - transition1End);
  const scene2StateResult = getStateAtFrame(
    Math.min(scene2RelativeFrame, SCENE_CYCLE_FRAMES - 1)
  );

  // Horizontal slide transition progress
  const isInTransition = frame >= scene1End && frame < transition1End;
  let slideProgress = 0;
  if (isInTransition) {
    slideProgress = spring({
      frame: frame - scene1End,
      fps,
      config: iosSpring.standard,
      from: 0,
      to: 1,
    });
  } else if (frame >= transition1End) {
    slideProgress = 1;
  }

  // Loop cross-fade
  const isLooping = frame >= loopTransitionStart;
  const loopFade = isLooping
    ? interpolate(
        frame,
        [loopTransitionStart, TOTAL_FRAMES - 1],
        [1, 0],
        { extrapolateRight: "clamp" }
      )
    : 1;

  // Scene 1 (Messages) state -- for rendering during transition
  const scene1StateResult = getStateAtFrame(
    Math.min(frame, SCENE_CYCLE_FRAMES - 1)
  );

  // Caption label
  const captionLabel = getCaptionLabel(currentState, locale);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.inkDeep,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Radial glow behind phone */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${COLORS.glowSoft} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Phone mockup with scenes */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IPhoneMockup variant={variant} width={PHONE_WIDTH}>
          {/* Scene container with horizontal slide */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: PHONE_WIDTH,
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Scene 1: Messages */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: PHONE_WIDTH,
                height: "100%",
                transform: `translateX(${-slideProgress * 100}%)`,
                opacity: isLooping ? loopFade : 1,
              }}
            >
              <MessagesScene
                locale={locale}
                demoState={
                  frame < scene1End
                    ? scene1StateResult.state
                    : "inserted"
                }
                stateStartFrame={
                  frame < scene1End
                    ? scene1StateResult.stateStartFrame
                    : STATE_DURATIONS.idle +
                      STATE_DURATIONS.recording +
                      STATE_DURATIONS.transcribing
                }
              />
            </div>

            {/* Scene 2: Notes */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: PHONE_WIDTH,
                height: "100%",
                transform: `translateX(${(1 - slideProgress) * 100}%)`,
                opacity: isLooping ? loopFade : 1,
              }}
            >
              <NotesScene
                locale={locale}
                demoState={scene2StateResult.state}
                stateStartFrame={
                  transition1End + scene2StateResult.stateStartFrame
                }
              />
            </div>

            {/* Loop: idle Messages fading in over current content */}
            {isLooping && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: PHONE_WIDTH,
                  height: "100%",
                  opacity: 1 - loopFade,
                }}
              >
                <MessagesScene
                  locale={locale}
                  demoState="idle"
                  stateStartFrame={loopTransitionStart}
                />
              </div>
            )}
          </div>
        </IPhoneMockup>
      </div>

      {/* State indicator below phone */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <StateIndicator state={currentState} label={captionLabel} />
      </div>

      {/* Branding: Dictus wordmark + tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: 28,
            color: COLORS.white40,
            letterSpacing: "-0.04em",
          }}
        >
          Dictus
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 14,
            color: COLORS.white30,
            letterSpacing: "0.01em",
          }}
        >
          {CONTENT[locale].tagline}
        </span>
      </div>
    </AbsoluteFill>
  );
};

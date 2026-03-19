import React from "react";
import { CONTENT, type Locale } from "../lib/i18n";
import { COLORS } from "../lib/colors";
import { DictusKeyboard } from "./DictusKeyboard";
import { TextReveal } from "./TextReveal";
import type { DemoState } from "../lib/waveform-math";

interface NotesSceneProps {
  locale: Locale;
  demoState: DemoState;
  stateStartFrame: number;
}

const NOTES_BG = "#1C1C1E";
const NOTES_YELLOW = "#FFD60A";
const KEYBOARD_HEIGHT = 260;

/**
 * Apple Notes-style scene for Remotion video.
 * Shows a note title with dictated text appearing on "inserted" state.
 */
export const NotesScene: React.FC<NotesSceneProps> = ({
  locale,
  demoState,
  stateStartFrame,
}) => {
  const content = CONTENT[locale].notes;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: NOTES_BG,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* App header */}
      <div
        style={{
          paddingTop: 50,
          height: 94,
          backgroundColor: NOTES_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 16px 0 16px",
          borderBottom: `0.5px solid rgba(255,255,255,0.1)`,
        }}
      >
        {/* Left: folder icon + back */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingBottom: 10,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 1L2 7L9 13"
              stroke={NOTES_YELLOW}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <path
              d="M1 4h16v10a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"
              fill={NOTES_YELLOW}
              opacity={0.9}
            />
            <path
              d="M1 3a1 1 0 011-1h5l2 2h7a1 1 0 011 1v0H1V3z"
              fill={NOTES_YELLOW}
            />
          </svg>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: 17,
              color: NOTES_YELLOW,
            }}
          >
            Notes
          </span>
        </div>

        {/* Right: Done button */}
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: 17,
            color: NOTES_YELLOW,
            paddingBottom: 10,
          }}
        >
          Done
        </span>
      </div>

      {/* Note content area */}
      <div
        style={{
          flex: 1,
          padding: "20px 20px",
          paddingBottom: KEYBOARD_HEIGHT + 8,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Note title */}
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 24,
            color: COLORS.white,
            lineHeight: "1.3",
          }}
        >
          {content.title}
        </div>

        {/* Date line */}
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 13,
            color: COLORS.white40,
            textAlign: "center",
          }}
        >
          {locale === "fr" ? "19 mars 2026 a 14:32" : "March 19, 2026 at 2:32 PM"}
        </div>

        {/* Existing text */}
        {content.existingText && (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 17,
              color: COLORS.white70,
              lineHeight: "1.6",
            }}
          >
            {content.existingText}
          </div>
        )}

        {/* Dictated text — appears on "inserted" state */}
        {demoState === "inserted" && (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 17,
              lineHeight: "1.6",
            }}
          >
            <TextReveal
              text={content.dictatedText}
              startFrame={stateStartFrame}
              durationFrames={35}
            />
          </div>
        )}
      </div>

      {/* Keyboard */}
      <DictusKeyboard
        state={demoState}
        stateStartFrame={stateStartFrame}
        width={375}
      />
    </div>
  );
};

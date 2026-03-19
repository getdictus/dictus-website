import React from "react";
import { CONTENT, type Locale } from "../lib/i18n";
import { COLORS } from "../lib/colors";
import { DictusKeyboard } from "./DictusKeyboard";
import { TextReveal } from "./TextReveal";
import type { DemoState } from "../lib/waveform-math";

interface MessagesSceneProps {
  locale: Locale;
  demoState: DemoState;
  stateStartFrame: number;
}

const MESSAGES_BLUE = "#007AFF";
const MESSAGES_GRAY = "#3A3A3C";
const MESSAGES_BG = "#1C1C1E";
const KEYBOARD_HEIGHT = 260;

/**
 * iMessage-style conversation scene for Remotion video.
 * Shows existing messages with the dictated phrase appearing on "inserted" state.
 */
export const MessagesScene: React.FC<MessagesSceneProps> = ({
  locale,
  demoState,
  stateStartFrame,
}) => {
  const content = CONTENT[locale].messages;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: MESSAGES_BG,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* App header */}
      <div
        style={{
          paddingTop: 50,
          height: 94,
          backgroundColor: MESSAGES_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderBottom: `0.5px solid rgba(255,255,255,0.1)`,
        }}
      >
        {/* Back arrow */}
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path
              d="M9 1L2 8.5L9 16"
              stroke={MESSAGES_BLUE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: 17,
              color: MESSAGES_BLUE,
            }}
          >
            Messages
          </span>
        </div>
        {/* Contact name */}
        <span
          style={{
            position: "absolute",
            bottom: 12,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 17,
            color: COLORS.white,
          }}
        >
          {content.contactName}
        </span>
      </div>

      {/* Message list */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "12px 16px",
          paddingBottom: KEYBOARD_HEIGHT + 8,
          gap: 6,
          overflow: "hidden",
        }}
      >
        {content.existingMessages.map((msg, i) => {
          const isUser = msg.from === "user";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "9px 14px",
                  borderRadius: 18,
                  backgroundColor: isUser ? MESSAGES_BLUE : MESSAGES_GRAY,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 16,
                  lineHeight: "1.35",
                  color: COLORS.white,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Dictated phrase — appears on "inserted" state */}
        {demoState === "inserted" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "9px 14px",
                borderRadius: 18,
                backgroundColor: MESSAGES_BLUE,
                fontSize: 16,
                lineHeight: "1.35",
              }}
            >
              <TextReveal
                text={content.dictatedPhrase}
                startFrame={stateStartFrame}
                durationFrames={25}
              />
            </div>
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

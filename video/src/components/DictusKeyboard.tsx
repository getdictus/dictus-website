import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Waveform } from "./Waveform";
import { COLORS } from "../lib/colors";
import { iosSpring } from "../lib/spring-configs";
import type { DemoState } from "../lib/waveform-math";

interface DictusKeyboardProps {
  state: DemoState;
  stateStartFrame: number;
  width: number;
}

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", "backspace"],
];

const BOTTOM_ROW = ["globe", "dictus", "return"];

/**
 * iOS-style keyboard with Dictus waveform bar at the top.
 * Slides up with bouncy spring on first appearance.
 */
export const DictusKeyboard: React.FC<DictusKeyboardProps> = ({
  state,
  stateStartFrame,
  width,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Keyboard slide-up animation
  const slideProgress = spring({
    frame,
    fps,
    config: iosSpring.bouncy,
    from: 0,
    to: 1,
  });

  const keyboardHeight = 260;
  const waveformBarHeight = 44;
  const keyHeight = 42;
  const keyGap = 6;
  const rowPadding = 4;
  const isRecording = state === "recording";

  // Key dimensions based on keyboard width
  const keyboardPadding = 4;
  const innerWidth = width - keyboardPadding * 2;

  const renderKey = (
    label: string,
    keyWidth: number,
    x: number,
    y: number
  ) => {
    const isSpecial = ["shift", "backspace", "globe", "return"].includes(label);
    const isSpace = label === "dictus";

    let displayLabel = label;
    if (label === "shift") displayLabel = "\u21E7";
    if (label === "backspace") displayLabel = "\u232B";
    if (label === "globe") displayLabel = "\uD83C\uDF10";
    if (label === "return") displayLabel = "return";

    return (
      <div
        key={`${label}-${x}-${y}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: keyWidth,
          height: keyHeight,
          backgroundColor: isSpace
            ? COLORS.surface
            : isSpecial
              ? "rgba(255,255,255,0.05)"
              : COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: isSpace ? 14 : isSpecial ? 18 : 16,
          color: COLORS.white,
          letterSpacing: isSpace ? "-0.04em" : undefined,
        }}
      >
        {displayLabel}
      </div>
    );
  };

  const keys: React.ReactNode[] = [];
  let currentY = waveformBarHeight + rowPadding;

  // Render QWERTY rows
  for (const row of KEY_ROWS) {
    const isMiddleRow = row[0] === "A";
    const isBottomRow = row[0] === "shift";
    const regularKeys = row.filter(
      (k) => !["shift", "backspace"].includes(k)
    );
    const hasSpecialKeys = isBottomRow;

    const specialKeyWidth = hasSpecialKeys ? innerWidth * 0.12 : 0;
    const regularKeyTotalWidth = hasSpecialKeys
      ? innerWidth - specialKeyWidth * 2 - keyGap * (regularKeys.length + 1)
      : innerWidth - keyGap * (row.length - 1);
    const regularKeyWidth = regularKeyTotalWidth / regularKeys.length;

    // Center offset for middle row (slightly narrower)
    const rowWidth = hasSpecialKeys
      ? innerWidth
      : regularKeyWidth * row.length + keyGap * (row.length - 1);
    const rowOffset = (innerWidth - rowWidth) / 2 + keyboardPadding;

    let currentX = rowOffset;

    for (const key of row) {
      if (key === "shift" || key === "backspace") {
        keys.push(renderKey(key, specialKeyWidth, currentX, currentY));
        currentX += specialKeyWidth + keyGap;
      } else {
        keys.push(renderKey(key, regularKeyWidth, currentX, currentY));
        currentX += regularKeyWidth + keyGap;
      }
    }

    currentY += keyHeight + rowPadding;
  }

  // Render bottom row: globe | space bar (dictus) | return
  {
    const globeWidth = innerWidth * 0.1;
    const returnWidth = innerWidth * 0.18;
    const spaceWidth =
      innerWidth - globeWidth - returnWidth - keyGap * 2;
    let bx = keyboardPadding;

    keys.push(renderKey("globe", globeWidth, bx, currentY));
    bx += globeWidth + keyGap;
    keys.push(renderKey("dictus", spaceWidth, bx, currentY));
    bx += spaceWidth + keyGap;
    keys.push(renderKey("return", returnWidth, bx, currentY));
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width,
        height: keyboardHeight,
        backgroundColor: COLORS.ink2,
        borderTop: `1px solid ${COLORS.border}`,
        transform: `translateY(${(1 - slideProgress) * keyboardHeight}px)`,
        overflow: "hidden",
      }}
    >
      {/* Waveform bar with mic button */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: waveformBarHeight,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Mic button */}
        <div
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: isRecording
              ? COLORS.accentBlue
              : "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {/* Mic icon (simple SVG) */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <rect
              x="5"
              y="1"
              width="4"
              height="8"
              rx="2"
              fill={COLORS.white}
            />
            <path
              d="M3 6.5C3 8.71 4.79 10.5 7 10.5C9.21 10.5 11 8.71 11 6.5"
              stroke={COLORS.white}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="7"
              y1="10.5"
              x2="7"
              y2="13"
              stroke={COLORS.white}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Waveform */}
        <div style={{ marginLeft: 44, flex: 1, height: waveformBarHeight }}>
          <Waveform
            state={state}
            stateStartFrame={stateStartFrame}
            width={width - 52}
            height={waveformBarHeight}
          />
        </div>
      </div>

      {/* Key rows */}
      {keys}
    </div>
  );
};

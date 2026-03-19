import React from "react";
import { COLORS } from "../lib/colors";

interface IPhoneMockupProps {
  variant: "realistic" | "screen-only";
  children: React.ReactNode;
  width?: number;
}

// iPhone 15 Pro proportions (logical)
const ASPECT_RATIO = 2.17; // height/width
const DYNAMIC_ISLAND_WIDTH = 120;
const DYNAMIC_ISLAND_HEIGHT = 35;
const HOME_INDICATOR_WIDTH = 134;
const HOME_INDICATOR_HEIGHT = 5;

/**
 * iPhone device frame with two swappable variants.
 * - "realistic": Full titanium frame with side buttons and Dynamic Island
 * - "screen-only": Minimal rounded container with border
 * Both include status bar and Dynamic Island.
 */
export const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
  variant,
  children,
  width = 375,
}) => {
  const height = Math.round(width * ASPECT_RATIO);

  const statusBar = (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 10,
      }}
    >
      {/* Time */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          color: COLORS.white,
          letterSpacing: "-0.02em",
        }}
      >
        9:41
      </span>

      {/* Status icons (signal, wifi, battery) */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill={COLORS.white} />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill={COLORS.white} />
          <rect x="9" y="2" width="3" height="10" rx="0.5" fill={COLORS.white} />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill={COLORS.white} />
        </svg>

        {/* WiFi icon */}
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
          <path
            d="M7.5 10.5a1 1 0 100 2 1 1 0 000-2z"
            fill={COLORS.white}
          />
          <path
            d="M4.5 8.5C5.3 7.7 6.35 7.2 7.5 7.2s2.2.5 3 1.3"
            stroke={COLORS.white}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M2 6C3.5 4.5 5.4 3.5 7.5 3.5S11.5 4.5 13 6"
            stroke={COLORS.white}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M0 3.5C2 1.5 4.6 0 7.5 0S13 1.5 15 3.5"
            stroke={COLORS.white}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="2.5"
            stroke={COLORS.white}
            strokeWidth="1"
          />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill={COLORS.white} />
          <path
            d="M23 4v4a1 1 0 001-1V5a1 1 0 00-1-1z"
            fill={COLORS.white}
            opacity={0.4}
          />
        </svg>
      </div>
    </div>
  );

  // Dynamic Island pill (centered at top)
  const dynamicIsland = (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: DYNAMIC_ISLAND_WIDTH,
        height: DYNAMIC_ISLAND_HEIGHT,
        backgroundColor: "#000000",
        borderRadius: DYNAMIC_ISLAND_HEIGHT / 2,
        zIndex: 20,
      }}
    />
  );

  // Home indicator bar
  const homeIndicator = (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: HOME_INDICATOR_WIDTH,
        height: HOME_INDICATOR_HEIGHT,
        backgroundColor: COLORS.white40,
        borderRadius: HOME_INDICATOR_HEIGHT / 2,
        zIndex: 10,
      }}
    />
  );

  if (variant === "realistic") {
    const frameInset = 8;
    const frameRadius = 50;
    const innerRadius = frameRadius - frameInset;

    return (
      <div
        style={{
          position: "relative",
          width: width + frameInset * 2,
          height: height + frameInset * 2,
        }}
      >
        {/* Outer titanium frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: frameRadius,
            background: "#1C1C1E",
            border: "3px solid",
            borderImage:
              "linear-gradient(135deg, #3A3A3C, #2C2C2E, #48484A) 1",
            borderImageSlice: 1,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        />

        {/* Side buttons — power (right) */}
        <div
          style={{
            position: "absolute",
            right: -3,
            top: height * 0.28,
            width: 3,
            height: 60,
            backgroundColor: "#1C1C1E",
            borderRadius: "0 2px 2px 0",
          }}
        />

        {/* Side buttons — volume up (left) */}
        <div
          style={{
            position: "absolute",
            left: -3,
            top: height * 0.22,
            width: 3,
            height: 32,
            backgroundColor: "#1C1C1E",
            borderRadius: "2px 0 0 2px",
          }}
        />

        {/* Side buttons — volume down (left) */}
        <div
          style={{
            position: "absolute",
            left: -3,
            top: height * 0.22 + 42,
            width: 3,
            height: 32,
            backgroundColor: "#1C1C1E",
            borderRadius: "2px 0 0 2px",
          }}
        />

        {/* Screen area */}
        <div
          style={{
            position: "absolute",
            top: frameInset,
            left: frameInset,
            width,
            height,
            borderRadius: innerRadius,
            overflow: "hidden",
            backgroundColor: COLORS.inkDeep,
          }}
        >
          {dynamicIsland}
          {statusBar}
          {children}
          {homeIndicator}
        </div>
      </div>
    );
  }

  // Variant: screen-only
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 40,
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
        backgroundColor: COLORS.inkDeep,
      }}
    >
      {dynamicIsland}
      {statusBar}
      {children}
      {homeIndicator}
    </div>
  );
};

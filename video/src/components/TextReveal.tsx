import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { iosSpring } from "../lib/spring-configs";
import { COLORS } from "../lib/colors";

interface TextRevealProps {
  text: string;
  startFrame: number;
  durationFrames?: number;
}

/**
 * Text appearance animation for Remotion video.
 * Words reveal progressively with spring-driven opacity + translateY.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  startFrame,
  durationFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");
  const framesPerWord = durationFrames / Math.max(words.length, 1);

  return (
    <span
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 300,
        color: COLORS.white,
        display: "inline",
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * framesPerWord;

        const progress = spring({
          frame: Math.max(0, frame - wordStart),
          fps,
          config: iosSpring.gentle,
          from: 0,
          to: 1,
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const translateY = interpolate(progress, [0, 1], [8, 0]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${translateY}px)`,
              marginRight: i < words.length - 1 ? "0.3em" : 0,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

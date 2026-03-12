"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DemoState = "idle" | "recording" | "transcribing" | "inserted";

interface DemoStateConfig {
  duration: number;
  color: string;
  pulse: boolean;
}

const STATE_CONFIG: Record<DemoState, DemoStateConfig> = {
  idle: { duration: 1500, color: "rgba(255,255,255,0.3)", pulse: false },
  recording: { duration: 2500, color: "#EF4444", pulse: true },
  transcribing: { duration: 2000, color: "#3D7EFF", pulse: true },
  inserted: { duration: 2500, color: "#22C55E", pulse: false },
};

const STATE_SEQUENCE: DemoState[] = [
  "idle",
  "recording",
  "transcribing",
  "inserted",
];

interface UseHeroDemoStateOptions {
  sentences: string[];
  shouldReduce: boolean;
}

interface HeroDemoState {
  currentState: DemoState;
  stateColor: string;
  shouldPulse: boolean;
  visibleText: string;
  showCursor: boolean;
  sentenceIndex: number;
}

export function useHeroDemoState({
  sentences,
  shouldReduce,
}: UseHeroDemoStateOptions): HeroDemoState {
  const [stateIndex, setStateIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentState = STATE_SEQUENCE[stateIndex];
  const config = STATE_CONFIG[currentState];
  const currentSentence = sentences[sentenceIndex] || "";

  // State machine cycling
  useEffect(() => {
    const advanceState = () => {
      setStateIndex((prev) => {
        const next = prev + 1;
        if (next >= STATE_SEQUENCE.length) {
          // Cycle to next sentence
          setSentenceIndex((si) => (si + 1) % Math.max(sentences.length, 1));
          return 0;
        }
        return next;
      });
    };

    stateTimerRef.current = setTimeout(advanceState, config.duration);

    return () => {
      if (stateTimerRef.current !== null) {
        clearTimeout(stateTimerRef.current);
        stateTimerRef.current = null;
      }
    };
  }, [stateIndex, sentenceIndex, config.duration, sentences.length]);

  // Text only visible during inserted state — appears all at once
  const visibleText = currentState === "inserted" ? currentSentence : "";

  return {
    currentState,
    stateColor: config.color,
    shouldPulse: shouldReduce ? false : config.pulse,
    visibleText,
    showCursor: false,
    sentenceIndex,
  };
}

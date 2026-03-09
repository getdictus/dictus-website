"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DemoState = "idle" | "recording" | "transcribing" | "smart" | "inserted";

interface DemoStateConfig {
  duration: number;
  color: string;
  pulse: boolean;
}

const STATE_CONFIG: Record<DemoState, DemoStateConfig> = {
  idle: { duration: 1500, color: "rgba(255,255,255,0.3)", pulse: false },
  recording: { duration: 2000, color: "#EF4444", pulse: true },
  transcribing: { duration: 2500, color: "#3D7EFF", pulse: true },
  smart: { duration: 2000, color: "#8B5CF6", pulse: true },
  inserted: { duration: 2000, color: "#22C55E", pulse: false },
};

const STATE_SEQUENCE: DemoState[] = [
  "idle",
  "recording",
  "transcribing",
  "smart",
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
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentState = STATE_SEQUENCE[stateIndex];
  const config = STATE_CONFIG[currentState];
  const currentSentence = sentences[sentenceIndex] || "";
  const words = currentSentence.split(" ");

  // Clear word timer
  const clearWordTimer = useCallback(() => {
    if (wordTimerRef.current !== null) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  }, []);

  // Word-by-word typing effect during recording + transcribing
  useEffect(() => {
    if (shouldReduce) return;

    if (currentState === "recording" || currentState === "transcribing") {
      // Calculate how many words should be typed during this state
      const totalTypingStates = 2; // recording + transcribing
      const isRecording = currentState === "recording";
      const targetWordCount = isRecording
        ? Math.ceil(words.length / totalTypingStates)
        : words.length;

      const startFrom = isRecording ? 0 : Math.ceil(words.length / totalTypingStates);

      if (isRecording) {
        setVisibleWordCount(0);
      }

      let currentWord = isRecording ? 0 : startFrom;

      const typeNextWord = () => {
        currentWord++;
        const target = isRecording ? Math.min(currentWord, targetWordCount) : Math.min(currentWord, targetWordCount);
        setVisibleWordCount(target);

        if (target < targetWordCount) {
          const variation = Math.random() * 100 - 50; // +/- 50ms
          wordTimerRef.current = setTimeout(typeNextWord, 250 + variation);
        }
      };

      const variation = Math.random() * 100 - 50;
      wordTimerRef.current = setTimeout(typeNextWord, 250 + variation);

      return clearWordTimer;
    }

    if (currentState === "smart" || currentState === "inserted") {
      setVisibleWordCount(words.length);
    }

    if (currentState === "idle") {
      setVisibleWordCount(0);
    }
  }, [currentState, words.length, shouldReduce, clearWordTimer]);

  // State machine cycling
  useEffect(() => {
    if (shouldReduce) {
      // In reduced motion: cycle states but show full text immediately
      setVisibleWordCount(words.length);
    }

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
  }, [stateIndex, sentenceIndex, config.duration, shouldReduce, words.length, sentences.length]);

  // Build visible text
  const visibleText = shouldReduce
    ? currentSentence
    : words.slice(0, visibleWordCount).join(" ");

  const showCursor =
    currentState === "recording" ||
    currentState === "transcribing" ||
    currentState === "smart";

  return {
    currentState,
    stateColor: config.color,
    shouldPulse: shouldReduce ? false : config.pulse,
    visibleText,
    showCursor: shouldReduce ? false : showCursor,
    sentenceIndex,
  };
}

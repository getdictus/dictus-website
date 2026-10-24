"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

/**
 * Draws a scene at a moment of its loop, in seconds from the loop start.
 * It writes through refs (style.transform, style.opacity, CSS variables or
 * SVG attributes); it never sets React state.
 */
export type SceneDraw = (seconds: number) => void;

type Props = {
  /** One pass of the scene, in seconds. */
  duration: number;
  /** The moment shown under reduced motion. Pick one that explains the scene. */
  stillAt: number;
  /** Where the loop starts the first time it plays. */
  startAt?: number;
  draw: SceneDraw;
  /**
   * Told when the scene starts or stops playing, for media that must follow
   * it (a looping video pauses off-screen with the scene). Never called
   * under reduced motion, where the scene never plays.
   */
  onPlayingChange?: (playing: boolean) => void;
  className?: string;
  /**
   * The scene's elements. Their server markup should already show the
   * `stillAt` moment, so the page reads the same before hydration.
   */
  children: ReactNode;
};

// One scene plays at a time: the most visible one. Every other visible
// scene holds its current frame until it becomes the most visible.
type Contender = { ratio: number; playing: boolean; setPlaying: (playing: boolean) => void };
const contenders = new Map<symbol, Contender>();

function electScene() {
  let winner: symbol | null = null;
  let best = 0;
  if (!document.hidden) {
    for (const [id, contender] of contenders) {
      if (contender.ratio > best) {
        best = contender.ratio;
        winner = id;
      }
    }
  }
  for (const [id, contender] of contenders) {
    const playing = id === winner;
    if (contender.playing !== playing) {
      contender.playing = playing;
      contender.setPlaying(playing);
    }
  }
}

function enterContest(id: symbol, contender: Contender) {
  if (contenders.size === 0) document.addEventListener("visibilitychange", electScene);
  contenders.set(id, contender);
}

function leaveContest(id: symbol) {
  contenders.delete(id);
  if (contenders.size === 0) document.removeEventListener("visibilitychange", electScene);
  else electScene();
}

const now = () => performance.now() / 1000;

/**
 * Plays a drawn scene on a loop, as a function of time, like dictus-ios
 * `AnimatedScenePlayer`: a pure "time to drawing" restarts exactly, pauses
 * exactly and gives a still frame for free.
 *
 * - The clock only counts while playing, so it resumes where it paused.
 * - It plays only while it is the most visible scene on a visible tab;
 *   off-screen or hidden, no animation frame is requested at all.
 * - Under reduced motion it draws `stillAt` once and never loops.
 * - It is decorative: hidden from assistive technology and not clickable.
 *   The text around it carries the meaning.
 */
export default function ScenePlayer({
  duration,
  stillAt,
  startAt = 0,
  draw,
  onPlayingChange,
  className,
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef(draw);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const elapsed = useRef(0);
  const resumedAt = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    drawRef.current = draw;
    onPlayingChangeRef.current = onPlayingChange;
  }, [draw, onPlayingChange]);

  const loopTime = () => {
    const running = resumedAt.current === null ? 0 : now() - resumedAt.current;
    return (startAt + elapsed.current + running) % duration;
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reduceMotion) {
      drawRef.current(stillAt);
      return;
    }

    drawRef.current(loopTime());
    const id = Symbol("scene");
    const contender: Contender = { ratio: 0, playing: false, setPlaying };
    enterContest(id, contender);
    const observer = new IntersectionObserver(
      ([entry]) => {
        contender.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        electScene();
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      leaveContest(id);
      setPlaying(false);
    };
    // loopTime only reads refs and the props below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, stillAt, startAt, duration]);

  // Start or stop the pausable clock with playback.
  useEffect(() => {
    onPlayingChangeRef.current?.(playing);
    if (!playing) return;
    resumedAt.current = now();
    return () => {
      if (resumedAt.current !== null) elapsed.current += now() - resumedAt.current;
      resumedAt.current = null;
    };
  }, [playing]);

  useAnimationFrame(() => drawRef.current(loopTime()), playing);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-scene-playing={playing}
      className={`pointer-events-none select-none ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

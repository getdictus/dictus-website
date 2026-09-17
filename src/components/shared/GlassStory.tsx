"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import GlassSurface from "./GlassSurface";
import styles from "./GlassStory.module.css";

/** A quiet reading companion. The text remains server-rendered and static. */
export default function GlassStory({ children, pauseLabel, playLabel }: {
  children: ReactNode;
  pauseLabel: string;
  playLabel: string;
}) {
  const storyRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const playing = !paused && inView && documentVisible && reduceMotion === false;
  const playingRef = useRef(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreference = () => setReduceMotion(motionQuery.matches);
    onMotionPreference();
    motionQuery.addEventListener("change", onMotionPreference);
    return () => motionQuery.removeEventListener("change", onMotionPreference);
  }, []);

  useEffect(() => {
    playingRef.current = playing;
    if (playing) animationRef.current?.play();
    else animationRef.current?.pause();
  }, [playing]);

  useEffect(() => {
    const story = storyRef.current;
    const orb = orbRef.current;
    if (!story || !orb) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(story);
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const positionOrb = () => {
      const stops = [...story.querySelectorAll<HTMLElement>("[data-glass-story-stop]")];
      if (!stops.length) return;
      const origin = story.getBoundingClientRect().top;
      const radius = orb.offsetHeight / 2;
      const positions = stops.map((stop) => stop.getBoundingClientRect().top - origin + 16 - radius);
      const previousTime = animationRef.current?.currentTime ?? 0;
      animationRef.current?.cancel();
      const keyframes = positions.flatMap((position, index) => [
        { transform: `translateY(${position}px)`, offset: index / positions.length },
        { transform: `translateY(${position}px)`, offset: (index + 0.67) / positions.length, easing: "cubic-bezier(0.45, 0, 0.2, 1)" },
      ]);
      keyframes.push({ transform: `translateY(${positions[0]}px)`, offset: 1 });
      const animation = orb.animate(keyframes, {
        duration: positions.length * 8000,
        iterations: Infinity,
        fill: "both",
      });
      animation.currentTime = previousTime;
      animationRef.current = animation;
      if (!playingRef.current) animation.pause();
    };

    positionOrb();
    const resizeObserver = new ResizeObserver(positionOrb);
    resizeObserver.observe(story);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      animationRef.current?.cancel();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div ref={storyRef} className={styles.story} data-glass-story data-playing={playing}>
        <div ref={orbRef} className={styles.orb} aria-hidden="true">
          <span className={styles.orbTint} />
          <GlassSurface className={styles.lens}>
            <span className={styles.reflection} />
          </GlassSurface>
        </div>
        {children}
      </div>
      <button
        type="button"
        className={styles.pause}
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? playLabel : pauseLabel}
        aria-pressed={paused}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          {paused
            ? <path d="m5 3 7 5-7 5V3Z" fill="currentColor" />
            : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}

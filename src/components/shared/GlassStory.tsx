"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cubicBezier } from "motion";
import styles from "./GlassStory.module.css";

// Reading time and travel time serve different purposes: rest over the copy,
// then accelerate into the next paragraph and brake gently at its center.
const HOLD_MS = 1_600;
const TRAVEL_MS = 800;
const STEP_MS = HOLD_MS + TRAVEL_MS;
// Same on-screen movement curve as --ease-in-out in globals.css.
const easeTravel = cubicBezier(0.77, 0, 0.175, 1);
/** A moving glass surface beneath crisp, selectable text. */
export default function GlassStory({ children, pauseLabel, playLabel }: {
  children: ReactNode;
  pauseLabel: string;
  playLabel: string;
}) {
  const storyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);
  const paintRef = useRef<() => void>(() => undefined);
  const [geometry, setGeometry] = useState<{ width: number; height: number; radius: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [textSelected, setTextSelected] = useState(false);
  const playing = !paused && inView && documentVisible && !reduceMotion && !textSelected;

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreference = () => setReduceMotion(motionQuery.matches);
    onMotionPreference();
    motionQuery.addEventListener("change", onMotionPreference);
    return () => motionQuery.removeEventListener("change", onMotionPreference);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    const content = contentRef.current;
    if (!story || !content) return;
    let disposed = false;
    let measureFrame = 0;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(story);
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    const onSelection = () => {
      const selection = window.getSelection();
      setTextSelected(Boolean(selection?.rangeCount && !selection.isCollapsed
        && selection.getRangeAt(0).intersectsNode(content)));
    };
    document.addEventListener("selectionchange", onSelection);

    const measure = () => {
      if (disposed) return;
      const stops = [...content.querySelectorAll<HTMLElement>("[data-glass-story-stop]")];
      if (!stops.length) return;
      const bounds = story.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const height = Math.max(...stops.map((stop) => stop.offsetHeight)) + 16;
      const positions = stops.map((stop) => stop.getBoundingClientRect().top - bounds.top + stop.offsetHeight / 2);
      // Travel back through the middle paragraph instead of jumping to the top.
      const route = [...positions, ...positions.slice(1, -1).reverse()];
      const nextGeometry = { width: bounds.width - 8, height, radius: Math.min(72, height / 2) };
      setGeometry(nextGeometry);
      paintRef.current = () => {
        const progress = elapsedRef.current / STEP_MS;
        const index = Math.floor(progress) % route.length;
        const travel = Math.max(0, (elapsedRef.current % STEP_MS - HOLD_MS) / TRAVEL_MS);
        const eased = easeTravel(travel);
        const y = route[index] + (route[(index + 1) % route.length] - route[index]) * eased;
        if (rimRef.current) rimRef.current.style.transform = `translateY(${y - height / 2}px)`;
      };
      paintRef.current();
    };
    const scheduleMeasure = () => {
      if (disposed) return;
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(measure);
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(content);
    document.fonts.ready.then(scheduleMeasure);
    scheduleMeasure();
    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(measureFrame);
      paintRef.current = () => undefined;
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("selectionchange", onSelection);
    };
  }, [children]);

  useEffect(() => {
    // React has now mounted the surface; align it with the measured paragraph.
    paintRef.current();
  }, [geometry]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous: number | null = null;
    const animate = (now: number) => {
      elapsedRef.current += previous === null ? 0 : Math.min(now - previous, 100);
      previous = now;
      // Only the decorative surface moves; text never transforms or filters.
      paintRef.current();
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  return (
    <div className={styles.wrapper}>
      <div ref={storyRef} className={styles.story} data-glass-story data-playing={playing} data-glass-variant="reading-lens" data-text-selected={textSelected}>
        <div ref={contentRef} className={styles.content} data-glass-story-content>{children}</div>
        {geometry && (
          <div ref={rimRef} data-glass-lens aria-hidden="true" className={styles.rim}
            style={{ width: geometry.width, height: geometry.height, borderRadius: geometry.radius }} />
        )}
      </div>
      <button type="button" className={styles.pause} onClick={() => setPaused((value) => !value)}
        aria-label={paused ? playLabel : pauseLabel} aria-pressed={paused}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          {paused
            ? <path d="m5 3 7 5-7 5V3Z" fill="currentColor" />
            : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}

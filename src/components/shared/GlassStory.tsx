"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Glass, glassValue } from "@samasante/liquid-glass";
import styles from "./GlassStory.module.css";

const HOLD_MS = 6_000;
const TRAVEL_MS = 3_000;
const STEP_MS = HOLD_MS + TRAVEL_MS;
const optics = {
  mapSize: 256, strength: 0.025, depth: 0.8, curvature: 0.16,
  bend: 0.32, bendWidth: 0.12, dispersion: 0.025, frost: 0,
  brightness: 0.018, specular: 0.7, sheen: 0.2, sheenWidth: 2, glow: 0.025,
};

/** A moving reading lens. The original text stays in the document flow. */
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
  const [centerY] = useState(() => glassValue(0));
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
      const nextGeometry = { width: bounds.width - 8, height, radius: Math.min(82, height / 2) };
      setGeometry(nextGeometry);
      paintRef.current = () => {
        const progress = elapsedRef.current / STEP_MS;
        const index = Math.floor(progress) % route.length;
        const travel = Math.max(0, (elapsedRef.current % STEP_MS - HOLD_MS) / TRAVEL_MS);
        const eased = travel * travel * (3 - 2 * travel);
        const y = route[index] + (route[(index + 1) % route.length] - route[index]) * eased;
        centerY.set(y / bounds.height);
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
  }, [centerY, children]);

  useEffect(() => {
    // React has now mounted the rim; align it with the measured optical lens.
    paintRef.current();
  }, [geometry]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous: number | null = null;
    let lastPaint = 0;
    const animate = (now: number) => {
      elapsedRef.current += previous === null ? 0 : Math.min(now - previous, 100);
      previous = now;
      // Slow glass needs only 30 position updates per second. At each stop the
      // signal stays constant, so the library does no additional filter work.
      if (now - lastPaint >= 1000 / 30) {
        paintRef.current();
        lastPaint = now;
      }
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
          <>
            {/* A clipped optical copy makes actual refraction work in Safari
                and Firefox too. The original remains selectable and accessible.
                Move centerY, never transform the filtered DOM. Normalized SVG
                coordinates preserve WebKit displacement (pixelUnits does not). */}
            <Glass
              aria-hidden="true" inert className={styles.refraction}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
              refract={<div className={styles.content}>{children}</div>}
              behind="var(--theme-bg-primary)" pixelUnits={false}
              width={geometry.width} height={geometry.height} radius={geometry.radius}
              center={{ x: 0.5, y: centerY }} optics={optics}
              filterResolution={1} live={false}
            />
            <div ref={rimRef} data-glass-lens aria-hidden="true" className={styles.rim}
              style={{ width: geometry.width, height: geometry.height, borderRadius: geometry.radius }} />
          </>
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

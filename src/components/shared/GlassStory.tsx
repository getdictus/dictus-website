"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Glass, glassValue } from "@samasante/liquid-glass";
import { cubicBezier } from "motion";
import GlassLight from "./GlassLight";
import styles from "./GlassStory.module.css";

// Reading time and travel time serve different purposes: rest over the copy,
// then accelerate into the next paragraph and brake gently at its center.
const HOLD_MS = 1_600;
const TRAVEL_MS = 800;
const STEP_MS = HOLD_MS + TRAVEL_MS;
// Same on-screen movement curve as --ease-in-out in globals.css.
const easeTravel = cubicBezier(0.77, 0, 0.175, 1);
const RIM_WIDTH = 16;
const optics = {
  mapSize: 256, strength: 0.025, depth: 0.1, curvature: 0.3,
  bend: 0.65, bendWidth: 0.16, dispersion: 0.025, frost: 0,
  brightness: 0, specular: 0.7, sheen: 0.2, sheenWidth: 2, glow: 0,
};

function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${2 * r - w}a${r},${r} 0 0 1 ${-r},${-r}v${2 * r - h}a${r},${r} 0 0 1 ${r},${-r}Z`;
}

/** Refraction lives only in a narrow rim; the reading area is the original text. */
export default function GlassStory({ children }: { children: ReactNode }) {
  const clipId = `story-rim-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const storyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const elapsedRef = useRef(0);
  const paintRef = useRef<() => void>(() => undefined);
  const [centerY] = useState(() => glassValue(0));
  const [geometry, setGeometry] = useState<{ width: number; height: number; radius: number } | null>(null);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [textSelected, setTextSelected] = useState(false);
  const playing = inView && documentVisible && !reduceMotion && !textSelected;

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
      let previousY = Number.NaN;
      let paintedRim: HTMLDivElement | null = null;
      paintRef.current = () => {
        const progress = elapsedRef.current / STEP_MS;
        const index = Math.floor(progress) % route.length;
        const travel = Math.max(0, (elapsedRef.current % STEP_MS - HOLD_MS) / TRAVEL_MS);
        const eased = easeTravel(travel);
        const y = route[index] + (route[(index + 1) % route.length] - route[index]) * eased;
        // Avoid invalidating the SVG clip throughout each reading hold. A newly
        // mounted rim still needs its first paint even when the clock is static.
        if (y === previousY && paintedRim === rimRef.current) return;
        previousY = y;
        paintedRim = rimRef.current;
        centerY.set(y / bounds.height);
        if (rimRef.current) rimRef.current.style.transform = `translateY(${y - height / 2}px)`;
        clipRef.current?.setAttribute("transform", `translate(0 ${y - height / 2})`);
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
      // Optics and contour share a clock so the rim never trails its refraction.
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
          <>
            <svg width="0" height="0" aria-hidden="true" className={styles.definitions}>
              <defs>
                <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                  <path ref={clipRef} data-glass-rim-clip clipRule="evenodd" d={
                    roundedRect(4, 0, geometry.width, geometry.height, geometry.radius)
                    + roundedRect(4 + RIM_WIDTH, RIM_WIDTH, geometry.width - 2 * RIM_WIDTH,
                      geometry.height - 2 * RIM_WIDTH, geometry.radius - RIM_WIDTH)
                  } />
                </clipPath>
              </defs>
            </svg>
            {/* A real optical copy works in WebKit too. The ring cutout excludes
                the center entirely, rather than approximating clear text with
                a weaker filter. The original stays selectable and accessible. */}
            <Glass aria-hidden="true" inert data-glass-rim-refraction className={styles.refraction}
              style={{ position: "absolute", inset: 0, pointerEvents: "none", clipPath: `url(#${clipId})` }}
              refract={<div className={styles.content}>{children}</div>}
              behind="var(--theme-bg-primary)" pixelUnits={false}
              width={geometry.width} height={geometry.height} radius={geometry.radius}
              center={{ x: 0.5, y: centerY }} optics={optics} filterResolution={1} live={false} />
            <div ref={rimRef} data-glass-lens aria-hidden="true" className={styles.rim}
              style={{ width: geometry.width, height: geometry.height, borderRadius: geometry.radius }}>
              <GlassLight targetRef={storyRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

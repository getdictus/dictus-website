"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./GlassSteps.module.css";

const HOLD_MS = 1_600;
const TRAVEL_MS = 800;
const STEP_MS = HOLD_MS + TRAVEL_MS;
const RAIL_WIDTH = 80;
const RAIL_INSET = 16;

type Geometry = { height: number; stops: { x: number; y: number }[] };

/** One material joins the stationary markers and the moving drop. Labels stay
 * outside the filtered SVG so the numbers remain sharp, even during a merge. */
export default function GlassSteps({ children }: {
  children: ReactNode;
}) {
  const id = useId().replaceAll(":", "");
  const listRef = useRef<HTMLOListElement>(null);
  const travelerRef = useRef<SVGGElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const elapsedRef = useRef(0);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const playing = inView && visible && !reduceMotion;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let disposed = false;
    let measureFrame = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreference = () => setReduceMotion(motionQuery.matches);
    const onVisibility = () => {
      // Stop the native animation immediately when the tab becomes hidden.
      if (document.hidden) animationRef.current?.pause();
      setVisible(!document.hidden);
    };
    onMotionPreference();
    onVisibility();
    motionQuery.addEventListener("change", onMotionPreference);
    document.addEventListener("visibilitychange", onVisibility);
    const intersection = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) animationRef.current?.pause();
      setInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    intersection.observe(list);

    const measure = () => {
      if (disposed) return;
      const bounds = list.getBoundingClientRect();
      if (!bounds.height) return;
      const stops = [...list.querySelectorAll<HTMLElement>("[data-glass-step-marker]")].map((marker) => {
        const rect = marker.getBoundingClientRect();
        return {
          x: rect.left - bounds.left + rect.width / 2 + RAIL_INSET,
          y: rect.top - bounds.top + rect.height / 2 + RAIL_INSET,
        };
      });
      setGeometry({ height: bounds.height + RAIL_INSET * 2, stops });
    };
    const scheduleMeasure = () => {
      if (disposed) return;
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(list);
    document.fonts.ready.then(scheduleMeasure);
    scheduleMeasure();
    return () => {
      disposed = true;
      cancelAnimationFrame(measureFrame);
      intersection.disconnect();
      resize.disconnect();
      motionQuery.removeEventListener("change", onMotionPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const traveler = travelerRef.current;
    if (!traveler || !geometry?.stops.length) return;
    // Return through 02 rather than teleporting from the final step to 01.
    const route = [...geometry.stops, ...geometry.stops.slice(1, -1).reverse()];
    const duration = route.length * STEP_MS;
    const easing = getComputedStyle(traveler).getPropertyValue("--ease-in-out").trim();
    const frames: Keyframe[] = route.flatMap((point, index) => [
      { transform: `translate(${point.x}px, ${point.y}px)`, offset: index * STEP_MS / duration },
      { transform: `translate(${point.x}px, ${point.y}px)`, offset: (index * STEP_MS + HOLD_MS) / duration, easing },
    ]);
    frames.push({ transform: `translate(${route[0].x}px, ${route[0].y}px)`, offset: 1 });
    const animation = traveler.animate(frames, { duration, iterations: Infinity, fill: "both" });
    animation.pause();
    animation.currentTime = elapsedRef.current;
    animationRef.current = animation;
    return () => {
      elapsedRef.current = Number(animation.currentTime) || 0;
      animation.cancel();
      animationRef.current = null;
    };
  }, [geometry]);

  useEffect(() => {
    if (playing) animationRef.current?.play();
    else animationRef.current?.pause();
  }, [geometry, playing]);

  return (
    <div className={styles.wrapper} data-glass-steps data-playing={playing} data-ready={Boolean(geometry)}>
      <ol ref={listRef} className={styles.list}>
        {children}
      </ol>
      {geometry && (
          <div aria-hidden="true" className={styles.decoration}>
            <svg className={styles.rail} width={RAIL_WIDTH} height={geometry.height}
              viewBox={`0 0 ${RAIL_WIDTH} ${geometry.height}`} focusable="false">
              <defs>
                {/* A shared alpha surface makes a liquid neck as the drop leaves
                    and rejoins a marker. No overlapping circle rims are drawn. */}
                <filter id={`${id}-fusion`} x="-25%" y="-5%" width="150%" height="110%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                  <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
                </filter>
                <filter id={`${id}-material`} x="-25%" y="-5%" width="150%" height="110%" colorInterpolationFilters="sRGB">
                  <feFlood className={styles.tint} result="tint" />
                  <feComposite in="tint" in2="SourceAlpha" operator="in" result="body" />
                  <feMorphology in="SourceAlpha" operator="erode" radius="1" result="inner" />
                  <feComposite in="SourceAlpha" in2="inner" operator="out" result="edge" />
                  <feFlood floodColor="white" floodOpacity="0.78" />
                  <feComposite in2="edge" operator="in" result="rim" />
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="bevel" />
                  <feSpecularLighting in="bevel" surfaceScale="2" specularConstant="0.65" specularExponent="24" lightingColor="white" result="light">
                    <feDistantLight azimuth="225" elevation="55" />
                  </feSpecularLighting>
                  <feComposite in="light" in2="SourceAlpha" operator="in" result="shine" />
                  <feMerge><feMergeNode in="body" /><feMergeNode in="rim" /><feMergeNode in="shine" /></feMerge>
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#334e80" floodOpacity="0.1" />
                </filter>
              </defs>
              <g filter={`url(#${id}-material)`}>
                <g filter={`url(#${id}-fusion)`} fill="white">
                  {geometry.stops.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="24" />)}
                  <g ref={travelerRef} className={styles.traveler} data-glass-step-orb>
                    <circle r="20" />
                  </g>
                </g>
              </g>
            </svg>
          </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, type RefObject } from "react";
import styles from "./GlassLight.module.css";

/** A light on the material, not a moving surface or custom cursor. Pass an
 * event target when the glass itself is decorative (pointer-events: none). */
export default function GlassLight({ targetRef }: {
  targetRef?: RefObject<HTMLElement | null>;
}) {
  const lightRef = useRef<HTMLSpanElement>(null);
  const reflectionRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const light = lightRef.current;
    const reflection = reflectionRef.current;
    const target = targetRef?.current ?? light?.closest<HTMLElement>(".glass-surface") ?? light?.parentElement;
    if (!light || !reflection || !target) return;
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      light.dataset.active = "false";
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      light.dataset.active = "true";
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = light.getBoundingClientRect();
        const localX = Math.max(0, Math.min(bounds.width, x - bounds.left));
        const localY = Math.max(0, Math.min(bounds.height, y - bounds.top));
        // The gradient's texture stays fixed; only its composited layer moves.
        reflection.style.transform = `translate(${localX - 90}px, ${localY - 90}px)`;
      });
    };
    const removeListeners = () => {
      target.removeEventListener("pointerenter", move);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerleave", leave);
      target.removeEventListener("pointercancel", leave);
      leave();
    };
    const configure = () => {
      removeListeners();
      reflection.style.removeProperty("transform");
      if (!pointerQuery.matches || motionQuery.matches) return;
      target.addEventListener("pointerenter", move, { passive: true });
      target.addEventListener("pointermove", move, { passive: true });
      target.addEventListener("pointerleave", leave, { passive: true });
      target.addEventListener("pointercancel", leave, { passive: true });
    };
    configure();
    pointerQuery.addEventListener("change", configure);
    motionQuery.addEventListener("change", configure);
    document.addEventListener("visibilitychange", leave);
    return () => {
      removeListeners();
      pointerQuery.removeEventListener("change", configure);
      motionQuery.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", leave);
    };
  }, [targetRef]);

  return (
    <span ref={lightRef} className={styles.light} data-glass-light data-active="false" aria-hidden="true">
      <span ref={reflectionRef} className={styles.reflection} data-glass-reflection />
    </span>
  );
}

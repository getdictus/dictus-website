"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";

export type GlassSelectorGeometry = { x: number; y: number; width: number; height: number; baseWidth: number };

/** Previewing a target never changes the controlled selection or its action. */
export function useGlassSelector<T extends HTMLElement = HTMLDivElement>(selectedKey: string | null) {
  const groupRef = useRef<T>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [keyboardInput, setKeyboardInput] = useState(false);
  const [geometry, setGeometry] = useState<GlassSelectorGeometry | null>(null);
  const targetKey = focusedKey ?? hoveredKey ?? selectedKey;
  const keyboard = focusedKey !== null || keyboardInput;

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    let alive = true;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!alive) return;
        const items = [...group.querySelectorAll<HTMLElement>("[data-lens-key]:not([data-lens-excluded])")];
        const target = items.find((item) => item.dataset.lensKey === targetKey);
        if (!target || !target.offsetWidth) { setGeometry(null); return; }
        setGeometry({ x: target.offsetLeft, y: target.offsetTop, width: target.offsetWidth,
          height: target.offsetHeight, baseWidth: Math.max(...items.map((item) => item.offsetWidth)) });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    group.querySelectorAll("[data-lens-key]").forEach((item) => observer.observe(item));
    document.fonts.ready.then(measure);
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [targetKey]);

  function itemKey(target: EventTarget | null) {
    return target instanceof Element ? target.closest<HTMLElement>("[data-lens-key]")?.dataset.lensKey ?? null : null;
  }

  const groupProps = {
    "data-glass-selector": true,
    "data-lens-ready": geometry !== null || undefined,
    "data-lens-target": targetKey ?? undefined,
    "data-keyboard": keyboard || undefined,
    onPointerOver(event: PointerEvent<HTMLElement>) {
      if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      setKeyboardInput(false);
      setHoveredKey(itemKey(event.target));
    },
    onPointerDown() { setKeyboardInput(false); setFocusedKey(null); },
    onPointerLeave() { setHoveredKey(null); },
    onFocus(event: FocusEvent<HTMLElement>) {
      if (event.target.matches(":focus-visible")) { setFocusedKey(itemKey(event.target)); setKeyboardInput(true); }
      else setFocusedKey(null);
    },
    onBlur(event: FocusEvent<HTMLElement>) {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocusedKey(null);
    },
    onKeyDownCapture(event: KeyboardEvent<HTMLElement>) {
      setKeyboardInput(true);
      setFocusedKey(itemKey(event.target));
    },
  };

  return { groupRef, groupProps, geometry, keyboard, clearPreview() { setHoveredKey(null); setFocusedKey(null); } };
}

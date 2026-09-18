"use client";

import { cubicBezier } from "motion";
import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** The scroll scene moves the physical frame, never the recording's playhead. */
export function useIphoneStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const phoneAnchorRef = useRef<HTMLDivElement>(null);
  const phoneMotionRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const bubbleOneRef = useRef<HTMLDivElement>(null);
  const bubbleTwoRef = useRef<HTMLDivElement>(null);
  const bypassScene = useRef<(() => void) | null>(null);
  const keyboardInput = useRef(false);
  const [preloadAllowed, setPreloadAllowed] = useState(false);
  const [playbackAllowed, setPlaybackAllowed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const anchor = phoneAnchorRef.current;
    const phone = phoneMotionRef.current;
    const copy = copyRef.current;
    if (!section || !viewport || !anchor || !phone || !copy) return;

    const spacious = window.matchMedia("(min-width: 1024px) and (min-height: 800px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tokens = getComputedStyle(document.documentElement);
    const readEase = (name: string, fallback: [number, number, number, number]) => {
      const values = tokens.getPropertyValue(name).match(/-?\d*\.?\d+/g)?.map(Number);
      return cubicBezier(...(values?.length === 4 ? values as typeof fallback : fallback));
    };
    const easeOut = readEase("--ease-out", [.23, 1, .32, 1]);
    const easeInOut = readEase("--ease-in-out", [.77, 0, .175, 1]);
    const bubbles = [bubbleOneRef.current, bubbleTwoRef.current];
    let frame = 0;
    let needsMeasurement = true;
    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = 0;
    let centeredX = 0;
    let cinematic = false;
    let bypassed = window.location.hash === "#iphone";
    let initialized = false;
    let entered = false;
    let settled: boolean | null = null;
    let lastProgress: number | null = null;
    let entrancePlayed = false;
    let entrance: Animation | null = null;

    const setSettled = (value: boolean) => {
      if (settled === value) return;
      settled = value;
      section.dataset.stageSettled = String(value);
      setPlaybackAllowed(value);
    };
    const clearTransforms = () => {
      entrance?.cancel();
      entrance = null;
      for (const element of [phone, copy, ...bubbles]) {
        element?.style.removeProperty("transform");
        element?.style.removeProperty("opacity");
      }
    };
    const measure = () => {
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      sectionHeight = section.offsetHeight;
      viewportHeight = viewport.offsetHeight;
      const bounds = anchor.getBoundingClientRect();
      centeredX = window.innerWidth / 2 - (bounds.left + bounds.width / 2);
      lastProgress = null;
      needsMeasurement = false;
    };
    const permitPreload = () => {
      // iOS now follows Hero. Its near-phone margin must not fetch the MP4
      // before the visitor starts entering this section.
      if (!entered && (window.scrollY > 1 || bypassed)
        && sectionTop - window.scrollY < window.innerHeight
        && sectionTop + sectionHeight - window.scrollY > 0) {
        entered = true;
        setPreloadAllowed(true);
      }
    };
    const paint = () => {
      frame = 0;
      if (needsMeasurement) measure();
      permitPreload();
      if (!cinematic) return;

      const progress = clamp((window.scrollY - sectionTop) / Math.max(1, sectionHeight - viewportHeight));
      // Once offscreen or settled at an endpoint, unrelated page scrolling
      // needs no repeated compositing writes. Resizing invalidates this cache.
      if (progress === lastProgress) return;
      lastProgress = progress;
      const rise = easeOut(clamp(progress / .35));
      const dock = easeInOut(clamp((progress - .35) / .25));
      const x = centeredX * (1 - dock);
      const y = Math.min(120, window.innerHeight * .12) * (1 - rise);
      const scale = 1.1 - .07 * rise - .03 * dock;
      phone.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${-4 * (1 - rise)}deg)`;
      copy.style.transform = `translate3d(${-24 * (1 - dock)}px, ${12 * (1 - dock)}px, 0)`;
      copy.style.opacity = String(dock);
      section.dataset.stageProgress = progress.toFixed(4);
      section.dataset.stageCopyVisible = String(progress >= .35);
      setSettled(progress >= .6);

      if (bubbles[0]) {
        bubbles[0].style.transform = `translate3d(${-70 * (1 - dock)}px, ${35 - 70 * rise + 30 * dock}px, 0) scale(${.85 + .15 * rise})`;
        bubbles[0].style.opacity = String(.65 * (1 - dock));
      }
      if (bubbles[1]) {
        bubbles[1].style.transform = `translate3d(${45 * (1 - dock)}px, ${-20 + 60 * rise - 35 * dock}px, 0) scale(${1.05 - .1 * dock})`;
        bubbles[1].style.opacity = String(.6 * (1 - dock));
      }
    };
    const schedule = (measureAgain = false) => {
      needsMeasurement ||= measureAgain;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const alignFinalScene = () => {
      // Collapsing the extra scroll distance while it is pinned must not leave
      // keyboard users below the content they just focused.
      window.scrollTo({ top: Math.max(0, sectionTop - 100), behavior: "instant" });
    };
    const showStatic = () => {
      cinematic = false;
      section.dataset.iphoneCinema = "false";
      section.dataset.stageProgress = "1";
      section.dataset.stageCopyVisible = "true";
      section.dataset.stageBypassed = String(bypassed);
      clearTransforms();
      setSettled(true);
      needsMeasurement = true;
      measure();
      permitPreload();
    };
    const bypass = (align: boolean) => {
      const pinned = cinematic && section.getBoundingClientRect().top < 0
        && section.getBoundingClientRect().bottom > window.innerHeight;
      bypassed = true;
      entrancePlayed = true;
      showStatic();
      if (align && pinned) alignFinalScene();
    };
    bypassScene.current = () => bypass(true);

    const configure = () => {
      const bounds = section.getBoundingClientRect();
      // Restore/deep-link hydration starts with the useful final composition;
      // inserting an introduction above an already reached section would jump.
      if (!initialized && (bounds.top < -1 || section.contains(document.activeElement))) bypassed = true;
      // The media query can remove sticky CSS before this callback. Use the
      // previous geometry to preserve the reader's place during that collapse.
      const wasPinned = cinematic && window.scrollY > sectionTop
        && window.scrollY < sectionTop + sectionHeight - viewportHeight;
      if (initialized && !cinematic && bounds.top < -1) bypassed = true;
      initialized = true;
      clearTransforms();
      cinematic = spacious.matches && !reduced.matches && !bypassed;
      if (cinematic) {
        section.dataset.iphoneCinema = "true";
        section.dataset.stageBypassed = "false";
        measure();
        paint();
      } else {
        showStatic();
        if (wasPinned) alignFinalScene();
      }
    };
    const onScroll = () => schedule();
    const onResize = () => schedule(true);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Tab") keyboardInput.current = true; };
    const onPointer = () => { keyboardInput.current = false; };
    const onAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname === window.location.pathname
        && destination.search === window.location.search && destination.hash === "#iphone") bypass(false);
    };
    const onHash = () => { if (window.location.hash === "#iphone") bypass(false); };
    const onVisibility = () => {
      if (document.hidden && entrance) {
        entrance.cancel();
        entrance = null;
      }
    };
    const entranceObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || cinematic || reduced.matches || bypassed || entrancePlayed) return;
      entrancePlayed = true;
      // The unenhanced DOM is already readable; only an entering frame moves.
      entrance = phone.animate([
        { transform: "translate3d(0, 24px, 0) scale(.97)", opacity: .55 },
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
      ], { duration: 600, easing: tokens.getPropertyValue("--ease-out").trim() || "cubic-bezier(.23, 1, .32, 1)" });
    }, { threshold: .15 });
    const sizeObserver = new ResizeObserver(() => schedule(true));
    sizeObserver.observe(section);
    sizeObserver.observe(viewport);
    sizeObserver.observe(anchor);
    entranceObserver.observe(anchor);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("click", onAnchor, true);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("visibilitychange", onVisibility);
    spacious.addEventListener("change", configure);
    reduced.addEventListener("change", configure);
    const initialization = requestAnimationFrame(configure);
    let alive = true;
    document.fonts.ready.then(() => { if (alive) schedule(true); });

    return () => {
      alive = false;
      cancelAnimationFrame(initialization);
      cancelAnimationFrame(frame);
      clearTransforms();
      sizeObserver.disconnect();
      entranceObserver.disconnect();
      bypassScene.current = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("click", onAnchor, true);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("visibilitychange", onVisibility);
      spacious.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
    };
  }, []);

  const onFocusCapture = useCallback((event: FocusEvent<HTMLElement>) => {
    if (keyboardInput.current || event.target.matches(":focus-visible")) bypassScene.current?.();
  }, []);

  return {
    sectionRef, viewportRef, phoneAnchorRef, phoneMotionRef, copyRef,
    bubbleOneRef, bubbleTwoRef, onFocusCapture, preloadAllowed, playbackAllowed,
  };
}

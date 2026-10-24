"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type RefObject } from "react";
import { PIN_MEDIA_QUERY } from "@/config/motion";

/** Room kept above the content when the page is re-aligned (fixed nav). */
const NAV_CLEARANCE_PX = 100;

/**
 * True when the URL hash targets content after `element`. Pinning then would
 * insert scroll distance above a target the page is already scrolling to.
 */
export function hashTargetsAfter(element: Element) {
  let id = window.location.hash.slice(1);
  try { id = decodeURIComponent(id); } catch { /* malformed escape: keep it raw */ }
  const target = id ? document.getElementById(id) : null;
  return !!target && !!(element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/**
 * Decides whether a scroll-pinned section pins, and gets out of the way when
 * it should not. The rules come from `ProductScenes/useIphoneStage.ts`,
 * which is verified on Chromium and WebKit:
 *
 * - It pins only with room (`PIN_MEDIA_QUERY`) and without reduced motion.
 * - A hash link to the section or to content after it, or arriving with
 *   the section already scrolled past (restored scroll, deep link), keeps it
 *   in normal flow.
 * - Keyboard focus inside the section drops the pin, so Tab never walks
 *   through content held off-screen by the extra scroll distance.
 * - When the pin collapses while the reader is inside it, the page is
 *   re-aligned on the section instead of leaving them below it.
 *
 * Once bypassed, the section stays in normal flow until the page reloads.
 */
export function usePinMode(trackRef: RefObject<HTMLElement | null>, anchorId: string) {
  const [pinned, setPinned] = useState(false);
  const bypassRef = useRef<(() => void) | null>(null);
  const keyboardInput = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const roomy = window.matchMedia(PIN_MEDIA_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const anchor = `#${anchorId}`;
    let active = false;
    let initialized = false;
    let bypassed = window.location.hash === anchor || hashTargetsAfter(track);

    const isHolding = () => {
      const bounds = track.getBoundingClientRect();
      return active && bounds.top < 0 && bounds.bottom > window.innerHeight;
    };
    const alignOnSection = () => {
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - NAV_CLEARANCE_PX), behavior: "instant" });
    };
    const apply = (next: boolean, wasHolding: boolean) => {
      active = next;
      track.dataset.pinned = String(next);
      setPinned(next);
      if (!next && wasHolding) alignOnSection();
    };
    const configure = () => {
      const bounds = track.getBoundingClientRect();
      // Hydrating below the section's start: pinning now would insert
      // scroll distance above the reader and jump the page.
      if (!initialized && (bounds.top < -1 || track.contains(document.activeElement))) bypassed = true;
      if (initialized && !active && bounds.top < -1) bypassed = true;
      initialized = true;
      apply(roomy.matches && !reduced.matches && !bypassed, isHolding());
    };
    const bypass = (align: boolean) => {
      const wasHolding = isHolding();
      bypassed = true;
      apply(false, align && wasHolding);
    };
    bypassRef.current = () => bypass(true);

    const onKey = (event: KeyboardEvent) => { if (event.key === "Tab") keyboardInput.current = true; };
    const onPointer = () => { keyboardInput.current = false; };
    const onAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname === window.location.pathname
        && destination.search === window.location.search && destination.hash === anchor) bypass(false);
    };
    const onHash = () => { if (window.location.hash === anchor) bypass(false); };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("click", onAnchor, true);
    window.addEventListener("hashchange", onHash);
    roomy.addEventListener("change", configure);
    reduced.addEventListener("change", configure);
    const initialization = requestAnimationFrame(configure);

    return () => {
      cancelAnimationFrame(initialization);
      bypassRef.current = null;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("click", onAnchor, true);
      window.removeEventListener("hashchange", onHash);
      roomy.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
    };
  }, [trackRef, anchorId]);

  const onFocusCapture = useCallback((event: FocusEvent<HTMLElement>) => {
    if (keyboardInput.current || event.target.matches(":focus-visible")) bypassRef.current?.();
  }, []);

  return { pinned, onFocusCapture };
}

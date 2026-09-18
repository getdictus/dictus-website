"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** A one-time product entrance. Server HTML and direct arrivals stay visible. */
export default function ProductReveal({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const finishRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-product-reveal-item]")];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Never hide SSR content already being read, including deep links/back.
    if (!items.length || motion.matches || root.getBoundingClientRect().top < window.innerHeight) {
      root.dataset.revealed = "true";
      return;
    }
    const animations: Animation[] = [];
    let disposed = false;
    const finish = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      items.forEach((item) => {
        item.style.removeProperty("transform");
        item.style.removeProperty("opacity");
      });
      root.dataset.revealed = "true";
    };
    finishRef.current = finish;
    items.forEach((item) => {
      item.style.transform = "translateY(32px) scale(.97)";
      item.style.opacity = "0";
    });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      items.forEach((item, index) => {
        animations.push(item.animate([
          { transform: "translateY(32px) scale(.97)", opacity: 0 },
          { transform: "translateY(0px) scale(1)", opacity: 1 },
        ], {
          duration: 600, delay: index * 70, fill: "both",
          easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim(),
        }));
      });
      Promise.all(animations.map((animation) => animation.finished))
        .then(() => { if (!disposed) finish(); })
        .catch(() => { /* A focus, preference change or unmount cancels the entrance. */ });
    }, { threshold: 0.12 });
    observer.observe(root);
    const onPreference = () => { if (motion.matches) finish(); };
    const onVisibility = () => { if (document.hidden && animations.length) finish(); };
    motion.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      finish();
      finishRef.current = () => undefined;
      motion.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <figure ref={rootRef} className={className} data-product-reveal onFocusCapture={() => finishRef.current()}>{children}</figure>;
}

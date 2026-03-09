"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAnimationFrame(
  callback: (time: number) => void,
  isActive: boolean
) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref current without re-registering rAF
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
    }
    callbackRef.current(time);
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isActive) {
      previousTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isActive, animate]);
}

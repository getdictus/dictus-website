"use client";

import { useEffect, useRef } from "react";

export function useAnimationFrame(
  callback: (time: number) => void,
  isActive: boolean
) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    previousTimeRef.current = null;

    const animate = (time: number) => {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = time;
      }
      callbackRef.current(time);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isActive]);
}

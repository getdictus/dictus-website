"use client";

import { useCallback, useRef } from "react";
import ScenePlayer from "@/components/shared/ScenePlayer";

const BARS = 9;
const DURATION = 4;
const STILL_AT = 1.1;

/** Bar height (0 to 1) at a moment. Whole-number frequencies loop seamlessly. */
function level(seconds: number, bar: number) {
  const phase = (seconds / DURATION) * Math.PI * 2;
  const slow = Math.sin(phase * 2 + bar * 0.7) * 0.5 + 0.5;
  const fast = Math.sin(phase * 3 - bar * 1.3) * 0.5 + 0.5;
  const envelope = Math.sin((Math.PI * (bar + 0.5)) / BARS);
  return 0.15 + 0.85 * envelope * (0.35 + 0.65 * (slow * 0.6 + fast * 0.4));
}

/** A neutral demo scene: brand-coloured bars, drawn through refs. */
export default function WaveformScene({ className }: { className?: string }) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const draw = useCallback((seconds: number) => {
    bars.current.forEach((bar, index) => {
      if (bar) bar.style.transform = `scaleY(${level(seconds, index)})`;
    });
  }, []);

  return (
    <ScenePlayer duration={DURATION} stillAt={STILL_AT} draw={draw} className={className}>
      <div className="flex h-64 items-center gap-2.5">
        {Array.from({ length: BARS }, (_, index) => (
          <span
            key={index}
            ref={(node) => { bars.current[index] = node; }}
            className="h-full w-3 rounded-full bg-linear-to-b from-accent-hi to-accent-strong"
            style={{ transform: `scaleY(${level(STILL_AT, index)})` }}
          />
        ))}
      </div>
    </ScenePlayer>
  );
}

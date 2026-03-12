"use client";

import { useReducedMotion } from "motion/react";

interface TextRevealProps {
  visibleText: string;
  showCursor: boolean;
}

export default function TextReveal({ visibleText, showCursor }: TextRevealProps) {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-[var(--glass-t2-bg)] px-4 py-3">
      <span className="font-mono text-sm text-white-70">
        {visibleText}
        {showCursor && (
          <span
            className={shouldReduce ? "opacity-70" : ""}
            style={
              shouldReduce
                ? undefined
                : {
                    animation: "blink 1.06s step-end infinite",
                  }
            }
          >
            |
          </span>
        )}
      </span>
    </div>
  );
}

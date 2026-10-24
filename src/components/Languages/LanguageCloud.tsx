"use client";

import { useEffect, useRef } from "react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { greetingRows, type Greeting } from "./greetings";

/** Horizontal travel of each row across the section's pass, v4b values. */
const DRIFT_WIDE = 260;
const DRIFT_NARROW = 120;
const WIDE_QUERY = "(min-width: 760px)";

const toneClasses: Record<Greeting["tone"], string> = {
  0: "text-[30px] font-normal text-brand-ink dark:text-text-primary min-[760px]:text-[64px]",
  1: "text-[38px] font-medium text-brand-blue dark:text-accent-hi min-[760px]:text-[80px]",
  2: "text-[26px] font-light text-brand-muted dark:text-white-40 min-[760px]:text-[54px]",
};

/** Scripts where negative tracking would break joining or crowd the glyphs. */
const untrackedLangs = new Set(["ar", "hi", "ja", "ko", "th"]);

function Word({ greeting }: { greeting: Greeting }) {
  const font = greeting.system
    ? "font-[system-ui,-apple-system,'Segoe_UI','Noto_Sans',sans-serif]"
    : "";
  const tracking = untrackedLangs.has(greeting.lang) ? "" : "tracking-[-0.03em]";

  return (
    <span
      lang={greeting.lang}
      dir={greeting.rtl ? "rtl" : undefined}
      className={`leading-[1.1] ${toneClasses[greeting.tone]} ${font} ${tracking}`}
    >
      {greeting.word}
    </span>
  );
}

function DriftRow({
  words,
  direction,
  progress,
  amplitude,
}: {
  words: Greeting[];
  direction: 1 | -1;
  progress: MotionValue<number>;
  amplitude: MotionValue<number>;
}) {
  // Full transform string: Motion's x shorthand runs off the compositor path.
  const transform = useTransform(() => {
    const amp = amplitude.get();
    if (amp === 0) return "none";
    const offset = (progress.get() - 0.5) * direction * amp;
    return `translate3d(${offset.toFixed(1)}px, 0, 0)`;
  });

  return (
    <m.div
      data-drift-row
      style={{ transform }}
      className="flex items-baseline justify-center gap-[clamp(14px,2.6vw,44px)] whitespace-nowrap"
    >
      {words.map((greeting) => (
        <Word key={greeting.lang} greeting={greeting} />
      ))}
    </m.div>
  );
}

/**
 * Rows of greetings that drift sideways, alternating direction, while the
 * section crosses the viewport. Scroll progress is mapped straight to a
 * transform through motion values: no React render per frame. The rows stay
 * centred (static) until hydration and under reduced motion.
 */
export default function LanguageCloud() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const amplitude = useMotionValue(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    if (reduce) {
      amplitude.set(0);
      return;
    }
    const wide = window.matchMedia(WIDE_QUERY);
    const update = () => amplitude.set(wide.matches ? DRIFT_WIDE : DRIFT_NARROW);
    update();
    wide.addEventListener("change", update);
    return () => wide.removeEventListener("change", update);
  }, [reduce, amplitude]);

  // Promote the rows to their own layers only while they can move on screen.
  useEffect(() => {
    const root = ref.current;
    if (!root || reduce) return;
    const rows = root.querySelectorAll<HTMLElement>("[data-drift-row]");
    const observer = new IntersectionObserver(([entry]) => {
      const value = entry.isIntersecting ? "transform" : "";
      rows.forEach((row) => {
        row.style.willChange = value;
      });
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      rows.forEach((row) => {
        row.style.willChange = "";
      });
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="flex flex-col gap-[clamp(4px,1vw,14px)]"
    >
      {greetingRows.map((words, index) => (
        <DriftRow
          key={words[0].lang}
          words={words}
          direction={index % 2 ? -1 : 1}
          progress={scrollYProgress}
          amplitude={amplitude}
        />
      ))}
    </div>
  );
}

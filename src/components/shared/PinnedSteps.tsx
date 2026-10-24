"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  m,
  motionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Section, { type SectionTone } from "@/components/shared/Section";
import { usePinMode } from "@/hooks/usePinMode";
import {
  EASE_OUT,
  STEP_TEXT_IN_SECONDS,
  STEP_TEXT_OUT_SECONDS,
  STEP_TEXT_SHIFT_PX,
  pinLengths,
  type PinKey,
} from "@/config/motion";

export type PinnedStep = { id: string; title: string; body: string };

export type PinnedStepState = {
  /** The step on screen. In normal flow, the last one. */
  stepIndex: number;
  /** 0 to 1 through the current step, scroll-linked. Read it in transforms. */
  stepProgress: MotionValue<number>;
  /** False in normal flow: the visual should show its final, composed state. */
  pinned: boolean;
};

const settled = motionValue(1);
const PinnedStepContext = createContext<PinnedStepState>({ stepIndex: 0, stepProgress: settled, pinned: false });

/** Step state for the visual placed inside a `PinnedSteps`. */
export const usePinnedStep = () => useContext(PinnedStepContext);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const twoDigits = (value: number) => String(value).padStart(2, "0");

type Props = {
  /** Anchor id. A hash link to it shows the section in normal flow. */
  id: string;
  /** Key of the pin length in `src/config/motion.ts`. */
  pin: PinKey;
  tone: SectionTone;
  eyebrow?: string;
  heading: string;
  steps: PinnedStep[];
  /** Right-hand visual. It reads the step with `usePinnedStep()`. */
  visual?: ReactNode;
};

/**
 * A section that holds on screen while the reader scrolls through its steps.
 *
 * Scroll maps to a step index and a progress inside it through Motion values,
 * so scrolling re-renders nothing until the step changes. The step text
 * leaves first (200 ms) and the next one enters after it (300 ms): two step
 * texts are never on screen together.
 *
 * Without room, under reduced motion, or after a hash link or keyboard
 * focus, it renders in normal flow: every step stacked and readable, and the
 * visual in its final state.
 */
export default function PinnedSteps({ id, pin, tone, eyebrow, heading, steps, visual }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { pinned, onFocusCapture } = usePinMode(trackRef, id);
  const count = steps.length;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const indexAt = (progress: number) => Math.min(count - 1, Math.floor(clamp01(progress) * count));
  const [stepIndex, setStepIndex] = useState(0);
  const stepProgress = useTransform(scrollYProgress, (progress) => clamp01(progress * count - indexAt(progress)));

  // Setting the same index bails out, so only a step change re-renders.
  useMotionValueEvent(scrollYProgress, "change", (progress) => setStepIndex(indexAt(progress)));

  const muted = tone === "navy" ? "text-brand-on-navy" : "text-brand-body";
  const state: PinnedStepState = pinned
    ? { stepIndex, stepProgress, pinned }
    : { stepIndex: count - 1, stepProgress: settled, pinned };

  const intro = (
    <>
      {eyebrow && (
        <p className={`flex gap-3 text-xs font-medium uppercase tracking-[0.1em] ${muted}`}>
          <span>{eyebrow}</span>
          {pinned && (
            <span aria-hidden="true" className="tabular-nums">
              {twoDigits(stepIndex + 1)} / {twoDigits(count)}
            </span>
          )}
        </p>
      )}
      <h2 className="mt-4 text-4xl font-light leading-[1.05] tracking-[-0.03em] min-[1024px]:text-5xl">
        {heading}
      </h2>
    </>
  );

  return (
    <Section tone={tone} id={id} onFocusCapture={onFocusCapture}>
      <PinnedStepContext.Provider value={state}>
        <div
          ref={trackRef}
          data-pinned={pinned}
          style={pinned ? { height: `${pinLengths[pin] * 100}svh` } : undefined}
        >
          {/* One tree for both modes: dropping the pin on focus must not remount what holds focus. */}
          <div className={pinned ? "sticky top-0 flex h-[100svh] items-center overflow-hidden" : undefined}>
            <div
              className={pinned
                ? "mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-16 px-8 pt-20"
                : "mx-auto grid max-w-6xl gap-12 px-6 py-24 min-[1024px]:grid-cols-2 min-[1024px]:items-center min-[1024px]:px-8"}
            >
              <div>
                {intro}
                {pinned ? (
                  <>
                    <ol className="sr-only">
                      {steps.map((step) => (
                        <li key={step.id}>{step.title}. {step.body}</li>
                      ))}
                    </ol>
                    <div aria-hidden="true" className="mt-10 grid">
                      {/* Invisible copies reserve the tallest step, so nothing below moves. */}
                      {steps.map((step) => (
                        <div key={step.id} className="invisible col-start-1 row-start-1">
                          <StepText step={step} muted={muted} />
                        </div>
                      ))}
                      <div className="col-start-1 row-start-1">
                        <AnimatePresence mode="wait" initial={false}>
                          <m.div
                            key={steps[stepIndex].id}
                            initial={{ opacity: 0, transform: `translateY(${STEP_TEXT_SHIFT_PX}px)` }}
                            animate={{
                              opacity: 1,
                              transform: "translateY(0px)",
                              transition: { duration: STEP_TEXT_IN_SECONDS, ease: EASE_OUT },
                            }}
                            exit={{
                              opacity: 0,
                              transform: `translateY(-${STEP_TEXT_SHIFT_PX}px)`,
                              transition: { duration: STEP_TEXT_OUT_SECONDS, ease: EASE_OUT },
                            }}
                          >
                            <StepText step={steps[stepIndex]} muted={muted} />
                          </m.div>
                        </AnimatePresence>
                      </div>
                    </div>
                    <div aria-hidden="true" className="mt-10 flex gap-2">
                      {steps.map((step, index) => (
                        <ProgressSegment key={step.id} progress={scrollYProgress} index={index} count={count} tone={tone} />
                      ))}
                    </div>
                  </>
                ) : (
                  <ol className="mt-10 grid gap-8">
                    {steps.map((step) => (
                      <li key={step.id}>
                        <StepText step={step} muted={muted} />
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {visual && <div className="flex justify-center">{visual}</div>}
            </div>
          </div>
        </div>
      </PinnedStepContext.Provider>
    </Section>
  );
}

function StepText({ step, muted }: { step: PinnedStep; muted: string }) {
  return (
    <>
      <h3 className="text-2xl font-normal tracking-[-0.02em]">{step.title}</h3>
      <p className={`mt-3 max-w-md text-lg font-light leading-relaxed ${muted}`}>{step.body}</p>
    </>
  );
}

function ProgressSegment({
  progress,
  index,
  count,
  tone,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  tone: SectionTone;
}) {
  const transform = useTransform(progress, [index / count, (index + 1) / count], ["scaleX(0)", "scaleX(1)"]);
  const rail = tone === "navy" || tone === "blue" ? "bg-white/20" : "bg-brand-rule-strong";
  const fill = tone === "blue" ? "bg-brand-ink" : "bg-accent";
  return (
    <div className={`h-1 flex-1 overflow-hidden rounded-full ${rail}`}>
      <m.div className={`h-full origin-left ${fill}`} style={{ transform }} />
    </div>
  );
}

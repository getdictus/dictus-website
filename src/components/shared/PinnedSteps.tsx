"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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
  STEP_TEXT_SYNC_SECONDS,
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
  /**
   * The step the reader is on in both modes: `stepIndex` when pinned, the
   * step crossing the middle of the viewport in normal flow.
   */
  activeIndex: number;
  /** Scrolls the page to a step, so the scroll position stays the source of truth. */
  goToStep: (index: number) => void;
};

const settled = motionValue(1);
const PinnedStepContext = createContext<PinnedStepState>({
  stepIndex: 0,
  stepProgress: settled,
  pinned: false,
  activeIndex: 0,
  goToStep: () => {},
});

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
  /** Rounded inset card on `insetGround` (see `Section`). */
  inset?: boolean;
  insetGround?: SectionTone;
  /** Shown in place of the eyebrow text, before the step counter. */
  badge?: ReactNode;
  /**
   * Keeps the heading for screen readers only; the step titles are then the
   * display text, set large.
   */
  headingHidden?: boolean;
  /**
   * The step text switches on the frame the step changes, with no exit
   * phase, so it never lags a visual that switches on that frame too.
   */
  syncText?: boolean;
  /** The scroll-linked progress bar under the steps. On by default. */
  progress?: boolean;
  /**
   * Under the step text when pinned; above the steps in normal flow, where
   * it sticks under the nav. Reads the step with `usePinnedStep()`.
   */
  controls?: ReactNode;
  /** In normal flow, a visual beside each step instead of one `visual`. */
  stepVisual?: (index: number) => ReactNode;
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
export default function PinnedSteps({
  id,
  pin,
  tone,
  eyebrow,
  heading,
  steps,
  visual,
  inset,
  insetGround,
  badge,
  headingHidden = false,
  syncText = false,
  progress = true,
  controls,
  stepVisual,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { pinned, onFocusCapture } = usePinMode(trackRef, id);
  const count = steps.length;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const indexAt = (progress: number) => Math.min(count - 1, Math.floor(clamp01(progress) * count));
  const [stepIndex, setStepIndex] = useState(0);
  const stepProgress = useTransform(scrollYProgress, (progress) => clamp01(progress * count - indexAt(progress)));

  // Setting the same index bails out, so only a step change re-renders.
  useMotionValueEvent(scrollYProgress, "change", (value) => setStepIndex(indexAt(value)));

  // In normal flow, the active step is the one crossing the middle of the viewport.
  const [flowIndex, setFlowIndex] = useState(0);
  useEffect(() => {
    const track = trackRef.current;
    if (pinned || !track) return;
    const items = [...track.querySelectorAll<HTMLElement>("[data-step-index]")];
    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => setFlowIndex(Number((entry.target as HTMLElement).dataset.stepIndex)));
    }, { rootMargin: "-45% 0px -45% 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [pinned]);

  const goToStep = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (track.dataset.pinned === "true") {
      // The middle of the step's share of the pinned scroll distance.
      const top = track.getBoundingClientRect().top + window.scrollY;
      const span = track.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (span * (index + 0.5)) / count, behavior });
      return;
    }
    track.querySelector<HTMLElement>(`[data-step-index="${index}"]`)?.scrollIntoView({ block: "start", behavior });
  }, [count]);

  // Ink on blue: the body grey reads at 2.6:1 there, ink at 4.86:1.
  const muted = tone === "navy" ? "text-brand-on-navy" : tone === "blue" ? "text-brand-ink" : "text-brand-body";
  const state: PinnedStepState = pinned
    ? { stepIndex, stepProgress, pinned, activeIndex: stepIndex, goToStep }
    : { stepIndex: count - 1, stepProgress: settled, pinned, activeIndex: flowIndex, goToStep };
  const display = headingHidden;

  const intro = (
    <>
      {badge ? (
        <div className={`flex items-center gap-3 ${muted}`}>
          {badge}
          {pinned && (
            <span aria-hidden="true" className="font-mono text-[13px] tabular-nums">
              {twoDigits(stepIndex + 1)} / {twoDigits(count)}
            </span>
          )}
        </div>
      ) : eyebrow && (
        <p className={`flex gap-3 text-xs font-medium uppercase tracking-[0.1em] ${muted}`}>
          <span>{eyebrow}</span>
          {pinned && (
            <span aria-hidden="true" className="tabular-nums">
              {twoDigits(stepIndex + 1)} / {twoDigits(count)}
            </span>
          )}
        </p>
      )}
      <h2
        id={`${id}-heading`}
        className={headingHidden ? "sr-only" : "mt-4 text-4xl font-light leading-[1.05] tracking-[-0.03em] min-[1024px]:text-5xl"}
      >
        {heading}
      </h2>
    </>
  );

  return (
    <Section
      tone={tone}
      id={id}
      inset={inset}
      insetGround={insetGround}
      aria-labelledby={`${id}-heading`}
      className={inset ? "pt-2 min-[760px]:pt-3" : undefined}
      onFocusCapture={onFocusCapture}
    >
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
                : `mx-auto grid max-w-6xl gap-12 px-6 py-24 min-[1024px]:px-8 ${stepVisual ? "" : "min-[1024px]:grid-cols-2 min-[1024px]:items-center"}`}
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
                    <div aria-hidden="true" className={display ? "mt-5 grid" : "mt-10 grid"}>
                      {/* Invisible copies reserve the tallest step, so nothing below moves. */}
                      {steps.map((step) => (
                        <div key={step.id} className="invisible col-start-1 row-start-1">
                          <StepText step={step} muted={muted} display={display} />
                        </div>
                      ))}
                      <div className="col-start-1 row-start-1">
                        {syncText ? (
                          // Remounted on the step's frame: the new text is there at once and
                          // only settles its last few pixels, so it never lags the visual.
                          <m.div
                            key={steps[stepIndex].id}
                            data-step-text={steps[stepIndex].id}
                            initial={{ opacity: 0.4, transform: `translateY(${STEP_TEXT_SHIFT_PX}px)` }}
                            animate={{
                              opacity: 1,
                              transform: "translateY(0px)",
                              transition: { duration: STEP_TEXT_SYNC_SECONDS, ease: EASE_OUT },
                            }}
                          >
                            <StepText step={steps[stepIndex]} muted={muted} display={display} />
                          </m.div>
                        ) : (
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
                            <StepText step={steps[stepIndex]} muted={muted} display={display} />
                          </m.div>
                        </AnimatePresence>
                        )}
                      </div>
                    </div>
                    {progress && (
                      <div aria-hidden="true" className="mt-10 flex gap-2">
                        {steps.map((step, index) => (
                          <ProgressSegment key={step.id} progress={scrollYProgress} index={index} count={count} tone={tone} />
                        ))}
                      </div>
                    )}
                    {controls}
                  </>
                ) : (
                  <>
                    {controls}
                    <ol className={stepVisual ? "mt-8 grid gap-16" : "mt-10 grid gap-8"}>
                      {steps.map((step, index) => (
                        <li
                          key={step.id}
                          data-step-index={index}
                          className={stepVisual ? "grid scroll-mt-14 gap-8 min-[1024px]:grid-cols-2 min-[1024px]:items-center min-[1024px]:gap-16" : undefined}
                        >
                          <div>
                            <StepText step={step} muted={muted} display={display} />
                          </div>
                          {stepVisual && <div className="flex justify-center">{stepVisual(index)}</div>}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
              {visual && (pinned || !stepVisual) && <div className="flex justify-center">{visual}</div>}
            </div>
          </div>
        </div>
      </PinnedStepContext.Provider>
    </Section>
  );
}

function StepText({ step, muted, display = false }: { step: PinnedStep; muted: string; display?: boolean }) {
  if (display) {
    // White only at this size: 3.73:1 on blue passes as large text.
    return (
      <>
        <h3 className="max-w-[12ch] text-[clamp(34px,4.6vw,64px)] font-light leading-[1.02] tracking-[-0.045em] text-white [text-wrap:balance]">
          {step.title}
        </h3>
        <p className={`mt-4 max-w-[460px] text-[clamp(17px,1.4vw,19px)] leading-[1.45] ${muted}`}>{step.body}</p>
      </>
    );
  }
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

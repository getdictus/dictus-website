"use client";

import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import { useHeroDemoState } from "@/hooks/useHeroDemoState";
import Waveform from "@/components/Hero/Waveform";
import StateIndicator from "@/components/Hero/StateIndicator";
import TextReveal from "@/components/Hero/TextReveal";

export default function Hero() {
  const t = useTranslations("Hero");
  const tDemo = useTranslations("HeroDemo");
  const shouldReduce = useReducedMotion() ?? false;

  const sentences = [
    tDemo("sentences.0"),
    tDemo("sentences.1"),
    tDemo("sentences.2"),
    tDemo("sentences.3"),
  ];

  const demoState = useHeroDemoState({ sentences, shouldReduce });

  const translatedStateLabel = tDemo(`states.${demoState.currentState}`);

  const showPill =
    demoState.currentState === "recording" ||
    demoState.currentState === "transcribing";

  const showText = demoState.currentState === "inserted";

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-deep px-6">
      {/* Large waveform anchored to top of hero */}
      <Waveform demoState={demoState.currentState} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl rounded-2xl bg-[var(--glass-t1-bg)] px-8 py-12 text-center backdrop-blur-[20px] backdrop-saturate-[1.5] shadow-[inset_1px_1px_0_0_var(--glass-t1-border-highlight)]">
        <h1
          className="text-4xl text-text-primary sm:text-5xl md:text-7xl"
          style={{ fontWeight: 200, letterSpacing: "-0.03em" }}
        >
          {t("headline")}
        </h1>

        <p className="mt-6 text-lg font-light text-white-70">
          {t("subtitle")}
        </p>

        {/* Demo area: state indicator OR text result */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {showPill && (
            <StateIndicator
              currentState={demoState.currentState}
              stateColor={demoState.stateColor}
              shouldPulse={demoState.shouldPulse}
              stateLabel={translatedStateLabel}
            />
          )}
          {showText && (
            <TextReveal
              visibleText={demoState.visibleText}
              showCursor={false}
            />
          )}
        </div>

        {/* Coming Soon badge */}
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-light text-accent">
          <span
            className="inline-block h-2 w-2 rounded-full bg-accent"
            aria-hidden="true"
          />
          {t("badge")}
        </span>
      </div>
    </section>
  );
}

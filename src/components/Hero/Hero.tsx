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

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-deep px-6">
      {/* Large waveform anchored to top of hero */}
      <Waveform />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <h1
          className="text-4xl text-white sm:text-5xl md:text-7xl"
          style={{ fontWeight: 200, letterSpacing: "-0.03em" }}
        >
          {t("headline")}
        </h1>

        <p className="mt-6 text-lg font-light text-white-70">
          {t("subtitle")}
        </p>

        {/* Demo area: state indicator + text reveal */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <StateIndicator
            currentState={demoState.currentState}
            stateColor={demoState.stateColor}
            shouldPulse={demoState.shouldPulse}
            stateLabel={translatedStateLabel}
          />
          <TextReveal
            visibleText={demoState.visibleText}
            showCursor={demoState.showCursor}
          />
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

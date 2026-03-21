"use client";

import { useTranslations } from "next-intl";
import Waveform from "@/components/Hero/Waveform";
import AdaptiveCTA from "@/components/Hero/AdaptiveCTA";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-deep px-6">
      {/* Large waveform anchored to top of hero */}
      <Waveform />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1
          className="text-4xl text-text-primary sm:text-5xl md:text-7xl"
          style={{ fontWeight: 200, letterSpacing: "-0.03em" }}
        >
          {t("headline")}
        </h1>

        <p className="mt-6 text-lg font-light text-white-70">
          {t("subtitle")}
        </p>

        {/* Adaptive CTA: TestFlight button / QR / Coming Soon fallback */}
        <AdaptiveCTA />
      </div>
    </section>
  );
}

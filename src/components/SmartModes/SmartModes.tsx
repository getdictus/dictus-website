"use client";

import { useLocale, useTranslations } from "next-intl";
import PinnedSteps from "@/components/shared/PinnedSteps";
import { pricingValues } from "@/config/pricing";
import CardStack from "./CardStack";
import Chips from "./Chips";
import FeatureCard from "./FeatureCard";
import { SMART_MODES_STEPS, type SmartModesStep } from "./steps";
import SmartModesStill from "./scenes/SmartModesStill";
import VocabularyStill from "./scenes/VocabularyStill";
import VoiceNotesStill from "./scenes/VoiceNotesStill";
import HistoryStill from "./scenes/HistoryStill";

const scenes: Record<SmartModesStep, (props: { locale: "fr" | "en" }) => React.ReactNode> = {
  smart: SmartModesStill,
  vocabulary: VocabularyStill,
  voiceNotes: VoiceNotesStill,
  history: HistoryStill,
};

/**
 * v4b Smart Modes & Pro section (`#pro`): the blue inset card, pinned over
 * the four Dictus Pro features. Text, lit chip and front card all read the
 * same step, so they change on the same frame. Each card is a still of the
 * feature's dictus-ios onboarding scene.
 *
 * Without room or under reduced motion, `PinnedSteps` lays the steps out in
 * normal flow, each beside its own card, under a sticky chip row.
 */
export default function SmartModes() {
  const t = useTranslations("SmartModes");
  const tPricing = useTranslations("Pricing");
  const locale = useLocale() === "fr" ? "fr" : "en";
  const count = SMART_MODES_STEPS.length;

  const card = (key: SmartModesStep, index: number) => {
    const Scene = scenes[key];
    return (
      <FeatureCard
        name={t(`steps.${key}.chip`)}
        eyebrow={index === 0 ? t("eyebrow_new") : t("eyebrow_also")}
        index={index}
        count={count}
      >
        <Scene locale={locale} />
      </FeatureCard>
    );
  };
  const cards = SMART_MODES_STEPS.map(card);

  return (
    <PinnedSteps
      id="pro"
      pin="smartModes"
      tone="blue"
      inset
      insetGround="white"
      headingHidden
      syncText
      progress={false}
      heading={t("heading")}
      badge={
        <>
          <span className="rounded-full bg-brand-ink px-3 py-1 text-[13px] font-semibold text-white">{t("badge")}</span>
          <span className="text-[14px] font-medium">{tPricing("cards.pro.cta", pricingValues(locale))}</span>
        </>
      }
      steps={SMART_MODES_STEPS.map((key) => ({
        id: key,
        title: t(`steps.${key}.title`),
        body: t(`steps.${key}.body`),
      }))}
      controls={
        <Chips
          label={t("chips_label")}
          chips={SMART_MODES_STEPS.map((key) => t(`steps.${key}.chip`))}
          compatibility={t("compatibility")}
        />
      }
      visual={<CardStack cards={cards} />}
      stepVisual={(index) => cards[index]}
    />
  );
}

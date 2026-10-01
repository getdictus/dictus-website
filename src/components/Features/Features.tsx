import { useTranslations } from "next-intl";
import GlassStory from "@/components/shared/GlassStory";

export default function Features() {
  const t = useTranslations("Features");

  return (
    <section id="uses" aria-labelledby="uses-title" className="px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <div>
          <h2 id="uses-title" className="max-w-xl text-4xl font-extralight leading-[1.12] tracking-[-0.035em] sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-white-70">{t("intro")}</p>
        </div>
        <GlassStory>
          {(["messages", "notes", "emails"] as const).map((use) => (
            <div key={use} data-glass-story-stop>
              <h3 className="text-2xl font-light tracking-tight">{t(`${use}_title`)}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-white-70">{t(`${use}_desc`)}</p>
            </div>
          ))}
        </GlassStory>
      </div>
    </section>
  );
}

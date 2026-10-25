import { useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import LanguageCloud from "./LanguageCloud";

const layouts = ["french", "english", "spanish", "german"] as const;

/** v4b Languages section, on a white surface. */
export default function Languages() {
  const t = useTranslations("Languages");

  return (
    <Section
      tone="white"
      id="langues"
      aria-labelledby="langues-title"
      className="overflow-clip pb-[clamp(80px,9vw,140px)] pt-[clamp(96px,11vw,160px)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 text-center min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <p className="font-mono text-[13px] tracking-[0.1em] text-accent-text">{t("eyebrow")}</p>
        <h2
          id="langues-title"
          className="mt-3 text-[clamp(40px,5.8vw,88px)] font-light leading-[0.98] tracking-[-0.045em] [text-wrap:balance]"
        >
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[clamp(16px,1.35vw,19px)] leading-normal text-brand-body">
          {t("sub")}
        </p>
      </div>

      <p className="sr-only">{t("cloud_label")}</p>
      <div className="mt-[clamp(36px,5vw,72px)]">
        <LanguageCloud />
      </div>

      <div className="mx-auto mt-[clamp(48px,6vw,96px)] max-w-[1240px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <h3 className="text-center text-[clamp(20px,1.8vw,26px)] font-normal tracking-[-0.02em]">{t("keyboard_title")}</h3>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {layouts.map((layout) => (
            <li
              key={layout}
              className="rounded-[10px] bg-brand-navy px-3.5 py-2.5 font-mono text-[13px] tracking-[0.06em] text-white"
            >
              {t(`layout_${layout}`)}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

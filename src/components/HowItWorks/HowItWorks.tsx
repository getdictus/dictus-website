import { useTranslations } from "next-intl";
import GlassSteps from "./GlassSteps";
import styles from "./GlassSteps.module.css";

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");

  return (
    <section id="local" aria-labelledby="local-title" className="bg-ink-2 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="local-title" className="text-4xl font-extralight tracking-[-0.035em] sm:text-5xl">{t("privacy_title")}</h2>
          <p className="mt-6 text-lg leading-relaxed text-white-70">{t("privacy_desc")}</p>
        </div>
        <GlassSteps>
          {([1, 2, 3] as const).map((step) => (
            <li key={step} className="relative grid grid-cols-[3rem_1fr] gap-x-6 py-7 first:pt-0 last:pb-0 sm:gap-x-10">
              <span aria-hidden="true" data-glass-step-marker className={`${styles.marker} relative z-10 mt-0.5 flex h-12 w-12 items-center justify-center rounded-full text-sm font-normal text-[#2563eb] dark:text-accent-hi`}>
                0{step}
              </span>
              <div className="grid items-start gap-3 pt-2 sm:grid-cols-[1fr_1.35fr] sm:gap-10">
                <h3 className="text-xl font-normal leading-snug tracking-tight">{t(`step${step}_title`)}</h3>
                <p className="leading-relaxed text-white-70">{t(`step${step}_desc`)}</p>
              </div>
            </li>
          ))}
        </GlassSteps>
        <p className="ml-18 mt-12 max-w-2xl text-sm leading-relaxed text-white-70 sm:ml-22">{t("privacy_accent")}</p>
      </div>
    </section>
  );
}

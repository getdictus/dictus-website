import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");

  return (
    <section id="local" aria-labelledby="local-title" className="bg-ink-2 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 id="local-title" className="text-4xl font-extralight tracking-[-0.035em] sm:text-5xl">{t("privacy_title")}</h2>
          <p className="mt-6 text-lg leading-relaxed text-white-70">{t("privacy_desc")}</p>
        </div>
        <ol className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-12">
          {([1, 2, 3] as const).map((step) => (
            <li key={step}>
              <span aria-hidden="true" className="text-sm font-normal text-[#2563eb] dark:text-accent-hi">0{step}</span>
              <h3 className="mt-4 text-xl font-normal tracking-tight">{t(`step${step}_title`)}</h3>
              <p className="mt-3 leading-relaxed text-white-70">{t(`step${step}_desc`)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-white-70">{t("privacy_accent")}</p>
      </div>
    </section>
  );
}

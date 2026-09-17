import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("Features");

  return (
    <section aria-labelledby="uses-title" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 id="uses-title" className="max-w-2xl text-4xl font-extralight tracking-[-0.035em] sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white-70">{t("intro")}</p>
        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-12">
          {(["messages", "notes", "emails"] as const).map((use) => (
            <div key={use} className="border-t border-border pt-6">
              <h3 className="text-xl font-normal tracking-tight">{t(`${use}_title`)}</h3>
              <p className="mt-3 leading-relaxed text-white-70">{t(`${use}_desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

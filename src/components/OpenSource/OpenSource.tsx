import { useTranslations } from "next-intl";

export default function OpenSource() {
  const t = useTranslations("OpenSource");

  return (
    <section id="open-source" aria-labelledby="source-title" className="px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:gap-20">
        <h2 id="source-title" className="max-w-md text-4xl font-extralight tracking-[-0.035em] sm:text-5xl">{t("title")}</h2>
        <div>
          <p className="text-lg leading-relaxed text-white-70">{t("desc")}</p>
          <a href="https://github.com/getdictus" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center text-[#2563eb] dark:text-accent-hi underline decoration-accent/30 underline-offset-4 hover:decoration-accent">
            {t("cta")}
          </a>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-white-70">
            <a href="https://github.com/getdictus/dictus-ios" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-border-hi underline-offset-4 hover:text-text-primary">{t("ios_source")}</a>
            <a href="https://github.com/getdictus/dictus-desktop" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-border-hi underline-offset-4 hover:text-text-primary">{t("desktop_source")}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

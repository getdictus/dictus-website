import { useTranslations } from "next-intl";
import GlassSurface from "@/components/shared/GlassSurface";

export default function OpenSource() {
  const t = useTranslations("OpenSource");

  return (
    <section id="open-source" aria-labelledby="source-title" className="px-6 pb-20 pt-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto grid max-w-5xl gap-8 border-t border-border pt-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div>
          <div aria-hidden="true" className="mb-6 w-14">
            <GlassSurface style={{ display: "grid", placeItems: "center" }} className="h-14 w-14 text-[#2563eb] dark:text-accent-hi">
              <svg className="relative z-10" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />
              </svg>
            </GlassSurface>
          </div>
          <h2 id="source-title" className="max-w-md text-3xl font-extralight leading-tight tracking-[-0.035em] sm:text-4xl">{t("title")}</h2>
        </div>
        <div>
          <p className="text-lg leading-relaxed text-white-70">{t("desc")}</p>
          <a href="https://github.com/getdictus" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center text-[#2563eb] dark:text-accent-hi underline decoration-accent/30 underline-offset-4 hover:decoration-accent">
            {t("cta")}
          </a>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white-70">
            <a href="https://github.com/getdictus/dictus-ios" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-border-hi underline-offset-4 hover:text-text-primary">{t("ios_source")}</a>
            <a href="https://github.com/getdictus/dictus-desktop" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-border-hi underline-offset-4 hover:text-text-primary">{t("desktop_source")}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

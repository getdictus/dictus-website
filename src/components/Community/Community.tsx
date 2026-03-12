import { useTranslations } from "next-intl";

export default function Community() {
  const t = useTranslations("Community");

  return (
    <section className="bg-ink-2 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] px-6 py-12 text-center backdrop-blur-[12px] backdrop-saturate-[1.2]">
        <h2 className="text-3xl font-extralight text-text-primary md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-white-70">{t("desc")}</p>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-8 py-3 font-normal text-white transition-colors hover:bg-accent-hi"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a11.96 11.96 0 0 0 1.744 6.236L.058 24l5.824-1.528A11.936 11.936 0 0 0 12 24a12 12 0 0 0 0-24zm5.09 8.29l-1.89 8.928c-.14.636-.508.79-.99.492l-2.81-2.071-1.354 1.304c-.15.15-.276.276-.566.276l.2-2.862 5.18-4.678c.226-.2-.048-.31-.348-.11L8.312 14.14l-2.8-.878c-.606-.19-.618-.606.128-.898l10.934-4.215c.506-.19.95.122.78.898l-.32.243z" />
          </svg>
          {t("cta")}
        </a>
        </div>
      </div>
    </section>
  );
}

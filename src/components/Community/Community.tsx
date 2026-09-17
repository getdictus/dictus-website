import { useTranslations } from "next-intl";

export default function Community() {
  const t = useTranslations("Community");

  return (
    <section aria-labelledby="community-title" className="bg-ink-2 px-6 py-20 sm:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-16">
        <div>
          <h2 id="community-title" className="text-3xl font-extralight tracking-[-0.035em] text-text-primary sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-white-70">{t("desc")}</p>
        </div>
        <a
          href="https://t.me/getdictus"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 max-w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-7 py-3 text-center font-normal text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.78 18.65l.28-4.23 7.68-6.93c.34-.31-.07-.46-.53-.18l-9.48 6-4.1-1.28c-.88-.25-.89-.86.2-1.3l16-6.17c.73-.33 1.43.18 1.15 1.3l-2.73 12.87c-.19.91-.74 1.13-1.5.71l-4.17-3.08-2 1.93c-.23.23-.42.42-.85.42z" />
          </svg>
          {t("cta")}
        </a>
      </div>
    </section>
  );
}

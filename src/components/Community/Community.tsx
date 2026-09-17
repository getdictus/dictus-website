import { useTranslations } from "next-intl";

export default function Community() {
  const t = useTranslations("Community");

  return (
    <section aria-labelledby="community-title" className="bg-ink-2 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
        <h2 id="community-title" className="text-4xl font-extralight tracking-[-0.035em] text-text-primary sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white-70">{t("desc")}</p>
        <a
          href="https://t.me/getdictus"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2563eb] px-8 py-3 font-normal text-white transition-colors hover:bg-[#1d4ed8]"
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
      </div>
    </section>
  );
}

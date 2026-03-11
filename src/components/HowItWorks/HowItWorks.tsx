import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");

  return (
    <section className="bg-ink-2 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Step 1: Tap the mic */}
          <div className="flex max-w-[200px] flex-col items-center text-center md:max-w-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-navy">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sky"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-normal text-text-primary">
              {t("step1_title")}
            </h3>
            <p className="mt-1 text-sm text-white-40">{t("step1_desc")}</p>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:flex" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white-40"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Step 2: Speak */}
          <div className="flex max-w-[200px] flex-col items-center text-center md:max-w-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-navy">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sky"
                aria-hidden="true"
              >
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10a7 7 0 0 1-14 0" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M20 10c.5-1 1-2 1-3" />
                <path d="M22 12c.3-.8.5-1.7.5-2.5" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-normal text-text-primary">
              {t("step2_title")}
            </h3>
            <p className="mt-1 text-sm text-white-40">{t("step2_desc")}</p>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:flex" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white-40"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Step 3: Text appears */}
          <div className="flex max-w-[200px] flex-col items-center text-center md:max-w-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-navy">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sky"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="12" y2="17" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-normal text-text-primary">
              {t("step3_title")}
            </h3>
            <p className="mt-1 text-sm text-white-40">{t("step3_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

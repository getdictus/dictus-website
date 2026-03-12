import { useTranslations } from "next-intl";

export default function DataFlow() {
  const t = useTranslations("DataFlow");

  return (
    <section className="bg-ink-deep py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] sm:p-8 md:p-12">
          {/* Flow diagram */}
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8">
            {/* Voice node */}
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-navy">
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
              <span className="mt-2 text-xs text-white-40">Voice</span>
            </div>

            {/* Arrow */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden text-white-40 md:block"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-90 text-white-40 md:hidden"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>

            {/* On-Device Model node */}
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-navy">
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
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                  <path d="M4 12H2M22 12h-2M12 4V2M12 22v-2" />
                </svg>
              </div>
              <span className="mt-2 text-xs text-white-40">On-device</span>
            </div>

            {/* Arrow */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden text-white-40 md:block"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-90 text-white-40 md:hidden"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>

            {/* Text node */}
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-navy">
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
              <span className="mt-2 text-xs text-white-40">Text</span>
            </div>
          </div>

          {/* No cloud indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-recording"
              aria-hidden="true"
            >
              <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.13A7 7 0 1 0 4 14.9" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          </div>

          {/* Text content */}
          <h2 className="mt-6 text-center text-xl font-normal text-text-primary">
            {t("title")}
          </h2>
          <p className="mt-3 text-center text-white-70">{t("desc")}</p>
          <p className="mt-4 text-center text-sm font-light text-accent">
            {t("no_cloud")}
          </p>
        </div>
      </div>
    </section>
  );
}

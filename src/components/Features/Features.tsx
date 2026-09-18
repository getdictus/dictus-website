import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("Features");

  return (
    <section className="bg-ink py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Available features — 3 columns */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Privacy / Offline */}
          <div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-normal text-text-primary">
              {t("privacy_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("privacy_desc")}
            </p>
          </div>

          {/* Keyboard Integration */}
          <div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01" />
                <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
                <path d="M8 16h8" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-normal text-text-primary">
              {t("keyboard_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("keyboard_desc")}
            </p>
          </div>

          {/* Open Source */}
          <div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-normal text-text-primary">
              {t("opensource_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("opensource_desc")}
            </p>
          </div>
        </div>

        {/* Coming soon section */}
        <div className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-light tracking-wide text-accent">
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
                aria-hidden="true"
              />
              {t("coming_soon_label")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Smart Mode Pro */}
            <div className="rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-6 opacity-75 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                  <path d="M12 2l1.09 3.26L16 6l-2.18 1.59L14.55 11 12 9.27 9.45 11l.73-3.41L8 6l2.91-.74z" />
                  <path d="M5 16l.82 2.46L8 19.5l-1.64 1.2.55 2.56L5 22l-1.91 1.26.55-2.56L2 19.5l2.18-.54z" />
                  <path d="M19 16l.82 2.46L22 19.5l-1.64 1.2.55 2.56L19 22l-1.91 1.26.55-2.56L16 19.5l2.18-.54z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-normal text-text-primary">
                {t("smart_title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white-70">
                {t("smart_desc")}
              </p>
            </div>

            {/* Custom Vocabulary */}
            <div className="rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-6 opacity-75 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M8 7h8M8 11h6" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-normal text-text-primary">
                {t("vocab_title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white-70">
                {t("vocab_desc")}
              </p>
            </div>

            {/* Transcription History */}
            <div className="rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-6 opacity-75 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-normal text-text-primary">
                {t("history_title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white-70">
                {t("history_desc")}
              </p>
            </div>

            {/* Audio File Transcription */}
            <div className="rounded-2xl border border-dashed border-border bg-[var(--glass-t2-bg)] p-6 opacity-75 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-opacity hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
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
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-normal text-text-primary">
                {t("audio_title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white-70">
                {t("audio_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

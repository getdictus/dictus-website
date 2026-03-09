import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("Features");

  return (
    <section className="bg-ink py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Privacy / Offline */}
          <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-md transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/50">
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
            <h3 className="mt-4 text-lg font-normal text-white">
              {t("privacy_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("privacy_desc")}
            </p>
          </div>

          {/* Smart Mode */}
          <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-md transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/50">
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
            <h3 className="mt-4 text-lg font-normal text-white">
              {t("smart_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("smart_desc")}
            </p>
          </div>

          {/* Keyboard Integration */}
          <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-md transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/50">
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
            <h3 className="mt-4 text-lg font-normal text-white">
              {t("keyboard_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("keyboard_desc")}
            </p>
          </div>

          {/* Open Source */}
          <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-md transition-colors hover:border-border-hi">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/50">
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
            <h3 className="mt-4 text-lg font-normal text-white">
              {t("opensource_title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white-70">
              {t("opensource_desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

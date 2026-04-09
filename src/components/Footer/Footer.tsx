import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border bg-ink-deep py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-white-40">
            &copy; {t("copyright")}
          </span>
          <div className="flex gap-4">
            <a
              href="https://github.com/getdictus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("github_label")}
              className="flex h-11 w-11 items-center justify-center text-white-40 transition-colors hover:text-white-70"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://x.com/getdictus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("twitter_label")}
              className="flex h-11 w-11 items-center justify-center text-white-40 transition-colors hover:text-white-70"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/getdictus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("telegram_label")}
              className="flex h-11 w-11 items-center justify-center text-white-40 transition-colors hover:text-white-70"
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
            </a>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <Link
            href="/privacy"
            className="text-white-40 transition-colors hover:text-white-70"
          >
            {t("privacy_link")}
          </Link>
          <span className="text-white-40" aria-hidden="true">·</span>
          <Link
            href="/support"
            className="text-white-40 transition-colors hover:text-white-70"
          >
            {t("support_link")}
          </Link>
        </div>
        <p className="mt-4 text-xs text-white-40">{t("privacy")}</p>
      </div>
    </footer>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border bg-ink-deep py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-white-70">
            &copy; {t("copyright")}
          </span>
          <div className="flex gap-4">
            <a
              href="https://github.com/getdictus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("github_label")}
              className="flex h-11 w-11 items-center justify-center text-white-70 transition-colors hover:text-white-70"
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
              className="flex h-11 w-11 items-center justify-center text-white-70 transition-colors hover:text-white-70"
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
              className="flex h-11 w-11 items-center justify-center text-white-70 transition-colors hover:text-white-70"
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
            </a>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center text-white-70 transition-colors hover:text-text-primary"
          >
            {t("privacy_link")}
          </Link>
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center text-white-70 transition-colors hover:text-text-primary"
          >
            {t("terms_link")}
          </Link>
          <Link
            href="/support"
            className="inline-flex min-h-11 items-center text-white-70 transition-colors hover:text-text-primary"
          >
            {t("help_link")}
          </Link>
          <Link
            href="/donate"
            className="inline-flex min-h-11 items-center text-white-70 transition-colors hover:text-text-primary"
          >
            {t("support_link")}
          </Link>
        </div>
        <p className="mt-5 max-w-2xl text-xs leading-relaxed text-white-70">{t("privacy")}</p>
      </div>
    </footer>
  );
}

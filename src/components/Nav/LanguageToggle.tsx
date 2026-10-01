"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export type ArticleLocaleRoutes = Record<string, Partial<Record<"fr" | "en", string>>>;

export default function LanguageToggle({ articleRoutes = {} }: { articleRoutes?: ArticleLocaleRoutes }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const article = articleRoutes[`/${locale}${pathname}`];

  function switchTo(target: "fr" | "en") {
    if (target === locale) return;
    if (article && !article[target]) return;
    router.replace(article?.[target] ?? pathname, { locale: target, scroll: false });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-light">
      <button
        onClick={() => switchTo("fr")}
        className={`min-h-11 min-w-11 px-2 py-2 transition-colors ${
          locale === "fr"
            ? "text-[#2563eb] dark:text-accent-hi"
            : "text-white-70 hover:text-text-primary"
        }`}
        aria-label="Passer en français"
        disabled={Boolean(article && !article.fr)}
        title={article && !article.fr ? "Traduction en préparation" : undefined}
        aria-current={locale === "fr" ? "true" : undefined}
      >
        FR
      </button>
      <span className="text-white-70" aria-hidden="true">/</span>
      <button
        onClick={() => switchTo("en")}
        className={`min-h-11 min-w-11 px-2 py-2 transition-colors ${
          locale === "en"
            ? "text-[#2563eb] dark:text-accent-hi"
            : "text-white-70 hover:text-text-primary"
        }`}
        aria-label="Switch to English"
        disabled={Boolean(article && !article.en)}
        title={article && !article.en ? "Translation in preparation" : undefined}
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export type ArticleLocaleRoutes = Record<string, Partial<Record<"fr" | "en", string>>>;

type Locale = "fr" | "en";

// Each language is named in its own language, whatever the page locale.
const languages: Record<Locale, { short: string; name: string; action: string; pending: string }> = {
  fr: { short: "FR", name: "Français", action: "Passer en français", pending: "Traduction en préparation" },
  en: { short: "EN", name: "English", action: "Switch to English", pending: "Translation in preparation" },
};

/**
 * FR/EN switcher. `pill` is the compact segmented control of the desktop
 * nav, `menu` the full-name buttons of the menu sheet. Both keep the current
 * route and hash; blog articles switch to their translation when one exists.
 */
export default function LanguageToggle({ articleRoutes = {}, variant, className, onSwitch }: {
  articleRoutes?: ArticleLocaleRoutes;
  variant: "pill" | "menu";
  className?: string;
  onSwitch?: () => void;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const article = articleRoutes[`/${locale}${pathname}`];

  function switchTo(target: Locale) {
    if (target === locale) return;
    if (article && !article[target]) return;
    onSwitch?.();
    router.replace(`${article?.[target] ?? pathname}${window.location.hash}`, { locale: target, scroll: false });
  }

  return (
    <div role="group" aria-label={t("language_label")} className={className}>
      {(Object.keys(languages) as Locale[]).map((target) => {
        const missing = Boolean(article && !article[target]);
        return (
          <button
            key={target}
            type="button"
            lang={target}
            onClick={() => switchTo(target)}
            aria-label={variant === "pill" ? languages[target].action : undefined}
            aria-current={locale === target ? "true" : undefined}
            disabled={missing}
            title={missing ? languages[target].pending : undefined}
          >
            {variant === "pill" ? languages[target].short : languages[target].name}
          </button>
        );
      })}
    </div>
  );
}

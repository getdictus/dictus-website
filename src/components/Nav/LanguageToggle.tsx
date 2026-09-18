"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(target: "fr" | "en") {
    if (target === locale) return;
    router.replace(pathname, { locale: target, scroll: false });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-light">
      <button
        onClick={() => switchTo("fr")}
        className={`min-h-11 min-w-11 px-2 py-2 transition-colors ${
          locale === "fr" ? "text-accent" : "text-white-40 hover:text-white-70"
        }`}
        aria-label="Passer en francais"
        aria-current={locale === "fr" ? "true" : undefined}
      >
        FR
      </button>
      <span className="text-white-40">/</span>
      <button
        onClick={() => switchTo("en")}
        className={`min-h-11 min-w-11 px-2 py-2 transition-colors ${
          locale === "en" ? "text-accent" : "text-white-40 hover:text-white-70"
        }`}
        aria-label="Switch to English"
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </div>
  );
}

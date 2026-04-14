"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";

export default function Nav() {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-[var(--glass-t1-bg)] backdrop-blur-[20px] backdrop-saturate-[1.5] shadow-[inset_1px_1px_0_0_var(--glass-t1-border-highlight)]"
          : "bg-ink-deep"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/donate"
            className="min-h-[44px] flex items-center rounded-full bg-accent px-4 py-2 text-sm font-normal text-white transition-colors hover:bg-accent-hi focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
          >
            {t("support_label")}
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}

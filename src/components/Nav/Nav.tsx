"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import GlassSurface from "@/components/shared/GlassSurface";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import styles from "./Nav.module.css";

export default function Nav({ preview = false }: { preview?: boolean }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const links = [
    { href: "/", label: t("home") },
    ...(preview ? [{ href: "/blog", label: t("blog") }, { href: "/pricing", label: t("pricing") }] : []),
    { href: "/donate", label: t("support_label") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.brand}><Logo /></div>
      <GlassSurface className={styles.pill}>
        <nav aria-label={t("navigation_label")} className={styles.links}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} prefetch={false} aria-current={pathname === href ? "page" : undefined}
              className={href === "/donate" ? styles.support : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </GlassSurface>
      <div className={styles.language}><LanguageToggle /></div>
    </header>
  );
}

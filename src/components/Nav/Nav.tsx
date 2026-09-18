"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import GlassSurface from "@/components/shared/GlassSurface";
import GlassSelectorLens from "@/components/shared/GlassSelectorLens";
import { useGlassSelector } from "@/components/shared/useGlassSelector";
import Logo from "./Logo";
import LanguageToggle, { type ArticleLocaleRoutes } from "./LanguageToggle";
import styles from "./Nav.module.css";

export default function Nav({ preview = false, blogAvailable = preview, articleRoutes = {} }: {
  preview?: boolean;
  blogAvailable?: boolean;
  articleRoutes?: ArticleLocaleRoutes;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const activePath = pathname.startsWith("/blog/") ? "/blog" : pathname;
  const { groupRef, groupProps, geometry, keyboard, clearPreview } = useGlassSelector<HTMLElement>(activePath);
  const links = [
    { href: "/", label: t("home") },
    ...(blogAvailable ? [{ href: "/blog", label: t("blog") }] : []),
    ...(preview ? [{ href: "/pricing", label: t("pricing") }] : []),
    { href: "/donate", label: t("support_label") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.brand}><Logo /></div>
      <GlassSurface className={styles.pill}>
        <nav ref={groupRef} aria-label={t("navigation_label")} className={styles.links} {...groupProps}>
          <GlassSelectorLens geometry={geometry} keyboard={keyboard} />
          {links.map(({ href, label }) => (
            <Link key={href} href={href} prefetch={false} aria-current={activePath === href ? "page" : undefined}
              data-route={href}
              data-lens-key={href} data-lens-excluded={href === "/donate" || undefined}
              onClick={clearPreview}
              className={href === "/donate" ? styles.support : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </GlassSurface>
      <div className={styles.language}><LanguageToggle articleRoutes={articleRoutes} /></div>
    </header>
  );
}

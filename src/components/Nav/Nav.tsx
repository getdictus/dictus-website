"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import GlassSurface from "@/components/shared/GlassSurface";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import styles from "./Nav.module.css";

export default function Nav({ preview = false }: { preview?: boolean }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [pointedRoute, setPointedRoute] = useState<string | null>(null);
  const [focusedRoute, setFocusedRoute] = useState<string | null>(null);
  const [keyboardInput, setKeyboardInput] = useState(false);
  const [lens, setLens] = useState<{ x: number; width: number; baseWidth: number } | null>(null);
  const targetRoute = focusedRoute ?? pointedRoute ?? pathname;
  const showLens = targetRoute === "/" || (preview && ["/blog", "/pricing"].includes(targetRoute));
  const links = [
    { href: "/", label: t("home") },
    ...(preview ? [{ href: "/blog", label: t("blog") }, { href: "/pricing", label: t("pricing") }] : []),
    { href: "/donate", label: t("support_label") },
  ];

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let alive = true;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!alive) return;
        const mainLinks = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[data-route]"))
          .filter((link) => link.dataset.route !== "/donate");
        const target = mainLinks.find((link) => link.dataset.route === targetRoute);
        if (!target || target.offsetWidth === 0) return;
        setLens({ x: target.offsetLeft, width: target.offsetWidth,
          baseWidth: Math.max(...mainLinks.map((link) => link.offsetWidth)) });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    for (const link of nav.querySelectorAll("a")) observer.observe(link);
    document.fonts.ready.then(measure);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [targetRoute, t]);

  return (
    <header className={styles.header}>
      <div className={styles.brand}><Logo /></div>
      <GlassSurface className={styles.pill}>
        <nav ref={navRef} aria-label={t("navigation_label")} className={styles.links}
          data-lens-ready={lens !== null || undefined}
          data-keyboard={keyboardInput || undefined}
          onPointerDown={() => setKeyboardInput(false)}
          onPointerLeave={() => setPointedRoute(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocusedRoute(null);
          }}>
          <div className={styles.lens} aria-hidden="true" style={{
            width: lens?.baseWidth ?? 0,
            transform: `translateX(${lens?.x ?? 0}px) scaleX(${lens ? lens.width / lens.baseWidth : 1})`,
            opacity: lens && showLens ? 1 : 0,
          }}>
            <div className={styles.lensGlass}>
              <span className={styles.lensLight} />
            </div>
          </div>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} prefetch={false} aria-current={pathname === href ? "page" : undefined}
              data-route={href}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                  setKeyboardInput(false);
                  setPointedRoute(href);
                }
              }}
              onFocus={(event) => {
                setKeyboardInput(event.currentTarget.matches(":focus-visible"));
                setFocusedRoute(href);
              }}
              onClick={() => { setPointedRoute(null); setFocusedRoute(null); }}
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

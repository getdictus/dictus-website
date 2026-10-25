"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { downloadTargetId, resolveNavLinks, type NavLink } from "@/config/nav";
import Logo from "./Logo";
import LanguageToggle, { type ArticleLocaleRoutes } from "./LanguageToggle";
import styles from "./Nav.module.css";

/** Matches the desktop breakpoint in Nav.module.css. */
const DESKTOP_QUERY = "(min-width: 900px)";
/** Vertical centre of the pill: the section under it sets the nav theme. */
const THEME_PROBE_Y = 42;
const FOCUSABLE = "a[href], button:not([disabled])";

export default function Nav({ blogAvailable = false, pricingAvailable = false, articleRoutes = {} }: {
  blogAvailable?: boolean;
  pricingAvailable?: boolean;
  articleRoutes?: ArticleLocaleRoutes;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const activePath = pathname.startsWith("/blog/") ? "/blog" : pathname;
  const links = resolveNavLinks({ blog: blogAvailable, pricing: pricingAvailable });
  const anchor = (id: string) => (onHome ? `#${id}` : `/${locale}#${id}`);
  const item = { anchor, activePath, label: (link: NavLink) => t(link.labelKey) };

  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const unlockScroll = useRef<(() => void) | null>(null);

  // Unlocks synchronously so a section link's own scroll is not blocked.
  const closeMenu = useCallback((restoreFocus: boolean) => {
    unlockScroll.current?.();
    unlockScroll.current = null;
    document.getElementById("main-content")?.removeAttribute("inert");
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  function openMenu() {
    const root = document.documentElement;
    const { overflow, scrollbarGutter } = root.style;
    // Keep the scrollbar's gutter so nothing shifts when the page locks.
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    unlockScroll.current = () => Object.assign(root.style, { overflow, scrollbarGutter });
    document.getElementById("main-content")?.setAttribute("inert", "");
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab" || !sheet || !toggleRef.current) return;
      const cycle = [toggleRef.current, ...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const index = cycle.indexOf(document.activeElement as HTMLElement);
      const next = (index + (event.shiftKey ? -1 : 1) + cycle.length) % cycle.length;
      event.preventDefault();
      cycle[index === -1 ? 0 : next].focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!sheet?.contains(target) && !toggleRef.current?.contains(target)) closeMenu(false);
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => { if (desktop.matches) closeMenu(false); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open, closeMenu]);

  useEffect(() => () => closeMenu(false), [closeMenu]);

  // Light or dark material from the section under the pill (`data-navtheme`,
  // set by shared/Section). Every home section is light today.
  useEffect(() => {
    let frame = 0;
    const probe = () => {
      frame = 0;
      let next: "light" | "dark" = "light";
      for (const section of document.querySelectorAll<HTMLElement>("[data-navtheme]")) {
        const { top, bottom } = section.getBoundingClientRect();
        if (top <= THEME_PROBE_Y && bottom > THEME_PROBE_Y) next = section.dataset.navtheme === "dark" ? "dark" : "light";
      }
      setTheme(next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(probe); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return (
    <header className={styles.header} data-theme={theme}>
      <div className={styles.pill}>
        <div className={styles.brand}><Logo /></div>
        <nav aria-label={t("navigation_label")} className={styles.links}>
          {links.map((link) => <NavItem key={link.labelKey} link={link} {...item} />)}
        </nav>
        <LanguageToggle variant="pill" className={styles.segmented} articleRoutes={articleRoutes} />
        <a className={styles.cta} href={anchor(downloadTargetId)}>{t("download")}</a>
        <button ref={toggleRef} type="button" className={styles.toggle}
          aria-expanded={open} aria-controls="nav-menu" aria-label={t(open ? "menu_close" : "menu_open")}
          onClick={() => (open ? closeMenu(true) : openMenu())}>
          <span /><span />
        </button>
      </div>
      <div ref={sheetRef} id="nav-menu" role="dialog" aria-modal="true" aria-label={t("menu_label")}
        className={styles.sheet} data-open={open || undefined}>
        <nav aria-label={t("navigation_label")} className={styles.menuLinks}>
          {links.map((link) => <NavItem key={link.labelKey} link={link} {...item} onNavigate={() => closeMenu(false)} />)}
        </nav>
        <LanguageToggle variant="menu" className={styles.menuLanguages} articleRoutes={articleRoutes}
          onSwitch={() => closeMenu(false)} />
      </div>
    </header>
  );
}

function NavItem({ link, anchor, activePath, label, onNavigate }: {
  link: NavLink;
  anchor: (id: string) => string;
  activePath: string;
  label: (link: NavLink) => string;
  onNavigate?: () => void;
}) {
  if (link.kind === "section") return <a href={anchor(link.id)} onClick={onNavigate}>{label(link)}</a>;
  return (
    <Link href={link.href} prefetch={false} onClick={onNavigate}
      aria-current={activePath === link.href ? "page" : undefined}>
      {label(link)}
    </Link>
  );
}

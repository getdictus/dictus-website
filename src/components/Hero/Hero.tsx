import { useTranslations } from "next-intl";
import DownloadButtons from "@/components/shared/DownloadButtons";
import Section from "@/components/shared/Section";
import AppStrip from "./AppStrip";
import { dmSansDisplay } from "./fonts";
import styles from "./Hero.module.css";

/**
 * Home hero: the headline, the download buttons and the app strip. The text
 * renders on the server and paints first; the strip is decorative, with one
 * label for the whole row and the owners of the marks named under it.
 */
export default function Hero() {
  const t = useTranslations("Hero");
  return (
    <Section tone="white" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.content}>
        <h1 id="hero-title" className={`${styles.title} ${dmSansDisplay.className}`}>
          {t("title_a")}{" "}
          <span className={styles.titleAccent}>{t("title_b")}</span>
        </h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
        <DownloadButtons className={styles.downloads} />
        <a className={styles.desktop} href="#desktop">
          {t("desktop_prefix")} <span className={styles.desktopName}>{t("desktop_link")}</span>{" "}
          <span>· {t("desktop_platforms")}</span>
        </a>
      </div>
      <AppStrip className={styles.strip} />
      <p className={styles.trademarks}>{t("trademarks")}</p>
    </Section>
  );
}

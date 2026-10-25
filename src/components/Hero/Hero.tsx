import { useTranslations } from "next-intl";
import DownloadButtons from "@/components/shared/DownloadButtons";
import Section from "@/components/shared/Section";
import HeroScene from "./HeroScene";
import { dmSansDisplay } from "./fonts";
import styles from "./Hero.module.css";

/**
 * v4b hero: the headline, the download buttons and the walker scene. The
 * text renders on the server and paints first; the scene is decorative.
 */
export default function Hero() {
  const t = useTranslations("Hero");
  return (
    <Section tone="white" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.content}>
        <h1 id="hero-title" className={`${styles.title} ${dmSansDisplay.className}`}>
          {t("title_a")}
          <br />
          <span className={styles.titleAccent}>{t("title_b")}</span>
        </h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
        <DownloadButtons className={styles.downloads} />
        <a className={styles.desktop} href="#desktop">
          {t("desktop_prefix")} <span className={styles.desktopName}>{t("desktop_link")}</span>{" "}
          <span>· {t("desktop_platforms")}</span>
        </a>
      </div>
      <HeroScene phrases={t.raw("phrases") as string[]} writtenLabel={t("written_label")} />
    </Section>
  );
}

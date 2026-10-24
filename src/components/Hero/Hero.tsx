"use client";

import { useTranslations } from "next-intl";
import DownloadButtons from "@/components/shared/DownloadButtons";
import Waveform from "./Waveform";
import styles from "./Hero.module.css";

export default function Hero() {
  const t = useTranslations("Hero");
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Waveform />
      <div className={styles.content}>
        <h1 id="hero-title">{t("headline")}</h1>
        <p>{t("subtitle")}</p>
        <a className={styles.cta} href="#iphone">{t("cta_discover")}<span aria-hidden="true">⌄</span></a>
        <DownloadButtons className={styles.downloads} />
        <a className={styles.desktop} href="#desktop">{t("platform_desktop")}</a>
      </div>
    </section>
  );
}

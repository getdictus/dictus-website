"use client";

import { useTranslations } from "next-intl";
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
        <div className={styles.platforms}>
          <a href="#iphone">{t("platform_ios")}</a>
          <span aria-hidden="true">/</span>
          <a href="#desktop">{t("platform_desktop")}</a>
        </div>
      </div>
    </section>
  );
}

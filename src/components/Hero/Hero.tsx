"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Waveform from "./Waveform";
import styles from "./Hero.module.css";

export default function Hero() {
  const t = useTranslations("Hero");
  const [paused, setPaused] = useState(false);
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Waveform active={!paused} />
      <div className={styles.content}>
        <h1 id="hero-title">{t("headline")}</h1>
        <p>{t("subtitle")}</p>
        <a className={styles.cta} href="#desktop">{t("cta_discover")}<span aria-hidden="true">⌄</span></a>
        <div className={styles.platforms}>
          <a href="#desktop">{t("platform_desktop")}</a>
          <span aria-hidden="true">/</span>
          <a href="#iphone">{t("platform_ios")}</a>
        </div>
      </div>
      <button className={styles.motionControl} onClick={() => setPaused(!paused)}
        aria-label={t(paused ? "play_waveform" : "pause_waveform")}>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          {paused ? <path d="m6 4 9 6-9 6Z" /> : <path d="M7 4v12M13 4v12" />}
        </svg>
      </button>
    </section>
  );
}

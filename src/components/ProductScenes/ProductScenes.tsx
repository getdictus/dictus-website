"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import GlassSurface from "@/components/shared/GlassSurface";
import styles from "./ProductScenes.module.css";

const screens = [
  { key: "keyboard", src: "/images/products/ios-notes-keyboard.png" },
  { key: "dictation", src: "/images/products/ios-notes-dictation.png" },
  { key: "app", src: "/images/products/ios-home.png" },
] as const;

export default function ProductScenes() {
  const t = useTranslations("ProductScenes");
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const testflightUrl = process.env.NEXT_PUBLIC_TESTFLIGHT_URL;

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % screens.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + screens.length) % screens.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = screens.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="iphone" className={styles.section} aria-labelledby="iphone-title">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.platform}>{t("platform")}</p>
          <h2 id="iphone-title" className={styles.title}>{t("title_line_one")}<br />{t("title_line_two")}</h2>
          <p className={styles.description}>{t("description")}</p>
          <GlassSurface className={styles.picker} style={{ borderRadius: 999 }}>
            <div role="tablist" aria-label={t("picker")} className={styles.options}>
              {screens.map((screen, index) => (
                <button
                  key={screen.key}
                  ref={(element) => { tabs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`iphone-tab-${index}`}
                  aria-controls={`iphone-screen-${index}`}
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => setSelected(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >{t(`screens.${screen.key}.label`)}</button>
              ))}
            </div>
          </GlassSurface>
          <p className={styles.caption} aria-live="polite">{t(`screens.${screens[selected].key}.caption`)}</p>
          <a className={styles.link} href={testflightUrl || "https://github.com/getdictus/dictus-ios"}>
            {testflightUrl ? t("beta") : t("discover")}
          </a>
        </div>
        <div className={styles.phoneFigure}>
          <div className={styles.phone}>
            <div className={styles.phoneButtons} aria-hidden="true" />
            <div className={styles.screen}>
              {screens.map((screen, index) => (
                <div
                  key={screen.key}
                  id={`iphone-screen-${index}`}
                  role="tabpanel"
                  aria-labelledby={`iphone-tab-${index}`}
                  hidden={selected !== index}
                  tabIndex={0}
                  className={styles.screenPanel}
                >
                  <Image
                    src={screen.src}
                    width={1290}
                    height={2796}
                    sizes="(max-width: 700px) 266px, 290px"
                    alt={t(`screens.${screen.key}.alt`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.android}>
        {t("android")}
      </p>
    </section>
  );
}

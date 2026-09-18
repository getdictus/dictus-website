"use client";

import { useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import GlassSurface from "@/components/shared/GlassSurface";
import GlassSelectorLens from "@/components/shared/GlassSelectorLens";
import { useGlassSelector } from "@/components/shared/useGlassSelector";
import { iphoneChapters, iphoneVideo, useIphoneDemo } from "./useIphoneDemo";
import styles from "./ProductScenes.module.css";

export default function ProductScenes() {
  const t = useTranslations("ProductScenes");
  const { videoRef, phoneRef, selected, sourceLoaded, playing, failed,
    showPoster, showPlayButton, selectChapter, startPlayback, events } = useIphoneDemo();
  const chapter = iphoneChapters[selected];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { groupRef, groupProps, geometry, keyboard } = useGlassSelector(chapter.key);
  const testflightUrl = process.env.NEXT_PUBLIC_TESTFLIGHT_URL;

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % iphoneChapters.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + iphoneChapters.length) % iphoneChapters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = iphoneChapters.length - 1;
    else return;
    event.preventDefault();
    selectChapter(next);
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
            <div ref={groupRef} role="tablist" aria-label={t("picker")} className={styles.options} {...groupProps}>
              <GlassSelectorLens geometry={geometry} keyboard={keyboard} />
              {iphoneChapters.map((screen, index) => (
                <button
                  key={screen.key}
                  ref={(element) => { tabs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`iphone-tab-${index}`}
                  data-lens-key={screen.key}
                  aria-controls="iphone-screen"
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => selectChapter(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >{t(`screens.${screen.key}.label`)}</button>
              ))}
            </div>
          </GlassSurface>
          <p className={styles.caption} aria-live={playing ? "off" : "polite"}>{t(`screens.${chapter.key}.caption`)}</p>
          <p id="iphone-demo-description" className="sr-only">{t("video_description")}</p>
          <a data-iphone-cta className={styles.link} href={testflightUrl || "https://github.com/getdictus/dictus-ios"}>
            {testflightUrl ? t("beta") : t("discover")}
          </a>
        </div>
        <div className={styles.phoneFigure}>
          <div ref={phoneRef} className={styles.phone}>
            <div className={styles.phoneButtons} aria-hidden="true" />
            <div id="iphone-screen" role="tabpanel" aria-labelledby={`iphone-tab-${selected}`}
              tabIndex={0} className={styles.screen}>
              <video ref={videoRef} id="iphone-demo-video" data-iphone-video
                src={sourceLoaded ? iphoneVideo : undefined}
                width={860} height={1864} muted playsInline loop preload="metadata"
                aria-label={t("video_label")} aria-describedby="iphone-demo-description"
                aria-hidden={showPoster} className={styles.video} {...events} />
              <Image src={chapter.poster} width={860} height={1864}
                sizes="(max-width: 700px) 266px, 290px"
                alt={t(`screens.${chapter.key}.alt`)}
                aria-hidden={!showPoster} data-visible={showPoster}
                className={styles.poster} />
            </div>
          </div>
          {(failed || showPlayButton) && <div className={styles.playback}>
            {failed ? <p className={styles.playbackStatus} role="status">{t("video_unavailable")}</p> : (
              <button type="button" className={styles.playbackButton} onClick={startPlayback}
                aria-controls="iphone-demo-video">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m5 3 7 5-7 5V3Z" fill="currentColor" />
                </svg>
                {t("video_play")}
              </button>
            )}
          </div>}
        </div>
      </div>
      <p className={styles.android}>
        {t("android")}
      </p>
    </section>
  );
}

"use client";

import { useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import GlassSurface from "@/components/shared/GlassSurface";
import { iphoneChapters, iphoneVideo, useIphoneDemo } from "./useIphoneDemo";
import styles from "./ProductScenes.module.css";

export default function ProductScenes() {
  const t = useTranslations("ProductScenes");
  const { videoRef, phoneRef, selected, sourceLoaded, playing, ended, failed,
    showPoster, selectChapter, togglePlayback, events } = useIphoneDemo();
  const chapter = iphoneChapters[selected];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
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
            <div role="tablist" aria-label={t("picker")} className={styles.options}>
              {iphoneChapters.map((screen, index) => (
                <button
                  key={screen.key}
                  ref={(element) => { tabs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`iphone-tab-${index}`}
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
          <a className={styles.link} href={testflightUrl || "https://github.com/getdictus/dictus-ios"}>
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
                width={860} height={1864} muted playsInline preload="metadata"
                aria-label={t("video_label")} aria-describedby="iphone-demo-description"
                aria-hidden={showPoster} className={styles.video} {...events} />
              <Image src={chapter.poster} width={860} height={1864}
                sizes="(max-width: 700px) 266px, 290px"
                alt={t(`screens.${chapter.key}.alt`)}
                aria-hidden={!showPoster} data-visible={showPoster}
                className={styles.poster} />
            </div>
          </div>
          <div className={styles.playback}>
            {failed ? <p className={styles.playbackNote} role="status">{t("video_unavailable")}</p> : (
              <button type="button" className={styles.playbackButton} onClick={togglePlayback}
                aria-controls="iphone-demo-video">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  {ended
                    ? <path d="M3 5a5 5 0 1 1-.2 5M3 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    : playing
                      ? <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      : <path d="m5 3 7 5-7 5V3Z" fill="currentColor" />}
                </svg>
                {t(ended ? "video_replay" : playing ? "video_pause" : "video_play")}
              </button>
            )}
            <p className={styles.playbackNote}>{t("video_note")}</p>
          </div>
        </div>
      </div>
      <p className={styles.android}>
        {t("android")}
      </p>
    </section>
  );
}

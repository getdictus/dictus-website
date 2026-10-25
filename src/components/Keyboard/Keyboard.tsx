"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import ScenePlayer from "@/components/shared/ScenePlayer";
import {
  SCENE_SECONDS,
  SCENE_STEPS,
  STILL_SECONDS,
  activeStepAt,
  stepProgressAt,
} from "./scene";
import styles from "./Keyboard.module.css";

/**
 * Files of scene C per language, from getdictus/dictus-ios. The MP4 is the
 * app's own HEVC render, byte for byte; the WebM is the same frames in AV1
 * for browsers without HEVC; the WebP is the app's still (frame 90), lossless,
 * pixel for pixel the app's PNG.
 */
const sceneFiles = {
  fr: { av1: "/videos/keyboard/intro-c-light-fr.webm", hevc: "/videos/keyboard/intro-c-light-fr.mp4", still: "/images/keyboard/intro-c-light-fr.webp" },
  en: { av1: "/videos/keyboard/intro-c-light-en.webm", hevc: "/videos/keyboard/intro-c-light-en.mp4", still: "/images/keyboard/intro-c-light-en.webp" },
} as const;

const stillActive = activeStepAt(STILL_SECONDS);
const stillProgress = stepProgressAt(STILL_SECONDS);

/**
 * v4b Keyboard section ("Dans votre clavier", `#clavier`). Normal document
 * flow, no pin. The phone plays the dictus-ios keyboard intro scene; the
 * steps beside it follow the video's own clock. Light only: the scene is the
 * app's light render on the #F2F2F7 ground.
 */
export default function Keyboard() {
  const t = useTranslations("Keyboard");
  const files = sceneFiles[useLocale() === "fr" ? "fr" : "en"];
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const shown = useRef({ active: stillActive, progress: [...stillProgress] });
  // Sources are attached the first time the scene plays, never under
  // reduced motion, so the video is not downloaded until it is needed.
  const [armed, setArmed] = useState(false);
  // The visitor's pause, kept in a ref for the callbacks and in state for the button.
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});

  // Writes the steps for a moment of the loop, only what changed.
  const paintSteps = useCallback((seconds: number) => {
    const active = activeStepAt(seconds);
    const progress = stepProgressAt(seconds);
    if (active !== shown.current.active) {
      stepRefs.current[shown.current.active]?.setAttribute("data-active", "false");
      stepRefs.current[active]?.setAttribute("data-active", "true");
      shown.current.active = active;
    }
    progress.forEach((value, index) => {
      if (Math.abs(value - shown.current.progress[index]) < 0.002) return;
      const fill = fillRefs.current[index];
      if (fill) fill.style.transform = `scaleX(${value})`;
      shown.current.progress[index] = value;
    });
  }, []);

  // The video is the clock: the steps show what the phone shows. Until the
  // video has a frame (or when it cannot play), that is the still. A paused
  // video holds its frame, so there is nothing to write.
  const draw = useCallback(() => {
    const video = videoRef.current;
    if (video?.dataset.ready !== "true") paintSteps(STILL_SECONDS);
    else if (!video.paused) paintSteps(video.currentTime);
  }, [paintSteps]);

  // ScenePlayer decides when the scene may play (most visible scene, visible
  // tab, no reduced motion) and marks its root; the video follows it, unless
  // the visitor paused it. The first time, the sources are attached.
  useEffect(() => {
    const video = videoRef.current;
    const root = mediaRef.current?.closest<HTMLElement>("[data-scene-playing]");
    if (!video || !root) return;

    const sync = () => {
      if (root.dataset.scenePlaying !== "true" || pausedRef.current) {
        video.pause();
        return;
      }
      if (!armed) {
        setArmed(true);
        return;
      }
      if (video.dataset.cued !== "true") return;
      video.play().catch((error: unknown) => {
        // Autoplay refused (for example Low Power Mode): the still stays
        // and the button offers to play it. A play() cut short by pause()
        // (AbortError, scrolling past) is not the visitor's pause.
        if ((error as DOMException | undefined)?.name !== "NotAllowedError") return;
        pausedRef.current = true;
        setPaused(true);
      });
    };
    syncRef.current = sync;
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-scene-playing"] });
    sync();
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [armed]);

  // Once armed: load, move to the still's frame like the app does, and only
  // then play, so the still hands over to the very same frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!armed || !video) return;

    const onMetadata = () => {
      video.currentTime = STILL_SECONDS;
    };
    const onSeeked = () => {
      video.dataset.cued = "true";
      syncRef.current();
    };
    const onPlaying = () => {
      video.dataset.ready = "true";
    };
    const onError = () => {
      delete video.dataset.ready;
      paintSteps(STILL_SECONDS);
    };
    video.addEventListener("loadedmetadata", onMetadata, { once: true });
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError, true);
    video.load();
    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError, true);
    };
  }, [armed, paintSteps]);

  // WCAG 2.2.2: the loop starts by itself and lasts more than five seconds,
  // so the visitor can pause it. The click is also the gesture a browser
  // that refused autoplay waits for.
  const togglePlayback = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    syncRef.current();
  };

  return (
    <Section
      tone="grey"
      id="clavier"
      aria-labelledby="clavier-title"
      className="py-[clamp(72px,9vw,128px)]"
    >
      {/* Former id of the iPhone section: older links (blog, hero) land here. */}
      <span id="iphone" aria-hidden="true" className="absolute top-0" />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={paused ? t("play") : t("pause")}
        title={paused ? t("play") : t("pause")}
        className={styles.playback}
      >
        {paused ? (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3.5 2.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L4.4 1.7a.6.6 0 0 0-.9.5Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="3" y="2" width="2.6" height="10" rx="0.8" fill="currentColor" />
            <rect x="8.4" y="2" width="2.6" height="10" rx="0.8" fill="currentColor" />
          </svg>
        )}
      </button>
      <div className={`mx-auto max-w-[1240px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)] ${styles.layout}`}>
        <div className={styles.head}>
          <p className="font-mono text-[13px] tracking-[0.1em] text-accent-text">{t("eyebrow")}</p>
          <h2
            id="clavier-title"
            className="mt-2.5 text-[clamp(34px,4.4vw,64px)] font-normal leading-none tracking-[-0.04em]"
          >
            {t("title")}
          </h2>
          <p className="sr-only">{t("scene_description")}</p>
        </div>

        <div className={styles.figure}>
          <ScenePlayer duration={SCENE_SECONDS} stillAt={STILL_SECONDS} startAt={STILL_SECONDS} draw={draw}>
            <div className={styles.frame}>
              <div ref={mediaRef} className={styles.media}>
                <Image
                  src={files.still}
                  alt=""
                  width={1000}
                  height={1440}
                  unoptimized
                />
                <video
                  ref={videoRef}
                  width={1000}
                  height={1440}
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  disableRemotePlayback
                  preload="none"
                  tabIndex={-1}
                >
                  {armed && <source src={files.av1} type='video/webm; codecs="av01.0.08M.10"' />}
                  {armed && <source src={files.hevc} type='video/mp4; codecs="hvc1.2.4.L120.90"' />}
                </video>
              </div>
            </div>
          </ScenePlayer>
        </div>

        <div className={styles.steps}>
          <ol
            aria-label={t("steps_label")}
            className="grid gap-x-8 gap-y-6 min-[640px]:max-[1023px]:grid-cols-3 min-[1024px]:max-w-[520px]"
          >
            {SCENE_STEPS.map(({ key }, index) => (
              <li
                key={key}
                ref={(element) => { stepRefs.current[index] = element; }}
                data-active={index === stillActive}
                className={styles.step}
              >
                <span aria-hidden="true" className={styles.track}>
                  <span
                    ref={(element) => { fillRefs.current[index] = element; }}
                    className={styles.fill}
                    style={{ transform: `scaleX(${stillProgress[index]})` }}
                  />
                </span>
                <h3 className={`mt-3.5 text-[clamp(20px,1.7vw,24px)] font-medium tracking-[-0.02em] ${styles.stepTitle}`}>
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-[clamp(16px,1.25vw,18px)] leading-normal text-brand-body">
                  {t(`steps.${key}.body`)}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 border-t border-brand-rule-strong pt-6 min-[1024px]:max-w-[520px]">
            <h3 className="text-[clamp(20px,1.7vw,24px)] font-medium tracking-[-0.02em]">{t("where.title")}</h3>
            <p className="mt-1.5 text-[clamp(16px,1.25vw,18px)] leading-normal text-brand-body">{t("where.body")}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

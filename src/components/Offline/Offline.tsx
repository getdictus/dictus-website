"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import ScenePlayer from "@/components/shared/ScenePlayer";
import { MODEL, SCENE_SECONDS, STILL_SECONDS } from "./scene";
import styles from "./Offline.module.css";

/**
 * Files of scene B per language, from getdictus/dictus-ios. The MP4 is the
 * app's own HEVC render, byte for byte; the WebM is the same frames in AV1
 * for browsers without HEVC; the WebP is the app's still (4.5 s).
 */
const sceneFiles = {
  fr: { av1: "/videos/offline/intro-b-dark-fr.webm", hevc: "/videos/offline/intro-b-dark-fr.mp4", still: "/images/offline/intro-b-dark-fr.webp" },
  en: { av1: "/videos/offline/intro-b-dark-en.webm", hevc: "/videos/offline/intro-b-dark-en.mp4", still: "/images/offline/intro-b-dark-en.webp" },
} as const;

const STEPS = ["model", "speak", "voice"] as const;

// The video is its own clock: there is nothing to draw per frame.
const drawNothing = () => {};

/**
 * Steps and cards rise into place once, each the first time it scrolls into
 * view; items arriving together are 60ms apart. Nothing is hidden when the
 * section is already on screen (direct arrival, `#hors-ligne` landing, back
 * navigation) or under reduced motion, and the server markup is always visible.
 */
function useRevealOnce() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // A hash landing scrolls here after this runs, so it counts as on screen.
    const hashTarget = window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
    const landing = hashTarget?.contains(root) || root.closest("section")?.contains(hashTarget);
    if (reduce.matches || landing || root.getBoundingClientRect().top < window.innerHeight) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-reveal-item]")];
    root.dataset.reveal = "pending";
    const showAll = () => {
      observer.disconnect();
      root.dataset.reveal = "shown";
    };
    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, order) => {
          const item = entry.target as HTMLElement;
          observer.unobserve(item);
          item.style.transitionDelay = `${order * 60}ms`;
          item.dataset.revealItem = "shown";
        });
    }, { threshold: 0.2 });
    items.forEach((item) => observer.observe(item));
    // Keyboard focus inside the section, or switching reduced motion on,
    // shows everything at once.
    root.addEventListener("focusin", showAll, { once: true });
    reduce.addEventListener("change", showAll, { once: true });
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", showAll);
      reduce.removeEventListener("change", showAll);
    };
  }, []);
  return ref;
}

/**
 * v4b Offline section ("Même sans réseau", `#hors-ligne`). Normal document
 * flow, no pin. The picture plays the dictus-ios metro intro scene in its
 * dark render, whose page is the section's navy. Every text sits beside or
 * under the picture, never on it.
 */
export default function Offline() {
  const t = useTranslations("Offline");
  const locale = useLocale() === "fr" ? "fr" : "en";
  const files = sceneFiles[locale];
  const layoutRef = useRevealOnce();
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Sources are attached the first time the scene plays, never under
  // reduced motion, so the video is not downloaded until it is needed.
  const [armed, setArmed] = useState(false);
  // The visitor's pause, kept in a ref for the callbacks and in state for the button.
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});

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
  }, [armed]);

  // WCAG 2.2.2: the loop starts by itself and lasts more than five seconds,
  // so the visitor can pause it. The click is also the gesture a browser
  // that refused autoplay waits for.
  const togglePlayback = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    syncRef.current();
  }, []);

  return (
    <Section
      tone="navy"
      id="hors-ligne"
      aria-labelledby="hors-ligne-title"
      className="py-[clamp(72px,9vw,128px)]"
    >
      <div
        ref={layoutRef}
        className={`mx-auto max-w-[1240px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)] ${styles.layout}`}
      >
        <div className={styles.head}>
          <p className="font-mono text-[13px] tracking-[0.1em] text-accent-hi">{t("eyebrow")}</p>
          <h2
            id="hors-ligne-title"
            className="mt-2.5 text-[clamp(34px,4.4vw,64px)] font-normal leading-none tracking-[-0.04em]"
          >
            {t("title")}
          </h2>
          <p className="mt-4 max-w-[520px] text-[clamp(17px,1.4vw,20px)] leading-normal text-brand-on-navy">
            {t("lead")}
          </p>
          <p className="sr-only">{t("scene_description")}</p>
        </div>

        <div className={styles.figure}>
          <div className={styles.figureBar}>
            <p className={styles.pill}>
              <span aria-hidden="true" className={styles.pillDot} />
              {t("no_network")}
            </p>
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
          </div>
          <ScenePlayer duration={SCENE_SECONDS} stillAt={STILL_SECONDS} startAt={STILL_SECONDS} draw={drawNothing}>
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

          <div className={styles.cards}>
            <div className={`${styles.modelCard} ${styles.reveal}`} data-reveal-item="">
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-[18px] font-medium tracking-[-0.01em] text-brand-ink">{MODEL.name}</span>
                <span className={styles.badge}>{t("model.badge")}</span>
              </p>
              <p className="mt-1 text-[14px] leading-snug text-brand-muted">
                {t("model.meta", { megabytes: MODEL.megabytes })}
              </p>
            </div>
            <div className={`${styles.noteCard} ${styles.reveal}`} data-reveal-item="">
              <p className="font-mono text-[12px] tracking-[0.1em] text-accent-hi">{t("note.label")}</p>
              <p className="mt-2 text-[16px] leading-snug">
                <span className="font-medium">{t("note.subject")}</span>
                <br />
                <span className="text-brand-on-navy">{t("note.body")}</span>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.steps}>
          <ol aria-label={t("steps_label")} className="grid gap-x-8 gap-y-7 min-[640px]:max-[1023px]:grid-cols-3 min-[1024px]:max-w-[520px]">
            {STEPS.map((key) => (
              <li key={key} className={styles.reveal} data-reveal-item="">
                <span aria-hidden="true" className={styles.rule} />
                <h3 className="mt-3.5 text-[clamp(20px,1.7vw,24px)] font-medium tracking-[-0.02em]">
                  {key === "voice" ? t("voice") : t(`steps.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-[clamp(16px,1.25vw,18px)] leading-normal text-brand-on-navy">
                  {t(`steps.${key}.body`)}
                </p>
              </li>
            ))}
          </ol>
          <p className={`mt-8 font-mono text-[12px] tracking-[0.1em] text-brand-on-navy ${styles.reveal}`} data-reveal-item="">
            {t("facts")}
          </p>
        </div>
      </div>
    </Section>
  );
}

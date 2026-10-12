"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export const iphoneChapters = [
  { key: "keyboard", start: 0, poster: "/images/products/ios-demo-keyboard.jpg" },
  { key: "dictation", start: 19 / 1.5, poster: "/images/products/ios-demo-dictation.jpg" },
  { key: "app", start: 19 / 1.5 + 9.5, poster: "/images/products/ios-demo-app.jpg" },
] as const;

export const iphoneVideo = "/videos/products/ios-demo.mp4";

type DemoOptions = {
  observationRef?: RefObject<HTMLElement | null>;
  preloadAllowed?: boolean;
  playbackAllowed?: boolean;
};

/** One continuous capture; chapter seeks never recreate an iOS transition. */
export function useIphoneDemo({ observationRef, preloadAllowed = true, playbackAllowed = true }: DemoOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const nearPhone = useRef(false);
  const preloadPermission = useRef(preloadAllowed);
  const pendingSeek = useRef<number | null>(0);
  const pausedPosition = useRef<number | null>(null);
  const seekInProgress = useRef(false);
  const restoringPause = useRef(false);
  const playAttempt = useRef(0);
  const [selected, setSelected] = useState(0);
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const [metadataReady, setMetadataReady] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [explicitPlayback, setExplicitPlayback] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    preloadPermission.current = preloadAllowed;
    if (preloadAllowed && nearPhone.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // A scroll scene can become eligible after the proximity observer fired.
      const frame = requestAnimationFrame(() => setSourceLoaded(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [preloadAllowed]);

  useEffect(() => {
    // Scroll transforms affect a child, while visibility uses its stable slot.
    const phone = observationRef?.current ?? phoneRef.current;
    if (!phone) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        // A newly enabled preference cancels any earlier playback opt-in.
        setExplicitPlayback(false);
        videoRef.current?.pause();
      } else if (nearPhone.current && preloadPermission.current) setSourceLoaded(true);
    };
    onMotionPreference();
    preference.addEventListener("change", onMotionPreference);
    const onVisibility = () => {
      setDocumentVisible(!document.hidden);
      if (document.hidden) videoRef.current?.pause();
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      nearPhone.current = true;
      if (!preference.matches && preloadPermission.current) setSourceLoaded(true);
      preloadObserver.disconnect();
    }, { rootMargin: "300px" });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      setInView(visible);
      if (!visible) videoRef.current?.pause();
    }, { threshold: 0.35 });
    preloadObserver.observe(phone);
    playbackObserver.observe(phone);
    return () => {
      preloadObserver.disconnect();
      playbackObserver.disconnect();
      preference.removeEventListener("change", onMotionPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [observationRef]);

  const applyPendingSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 1) return false;
    if (pendingSeek.current === null) return !video.seeking && video.readyState >= 2;
    if (Math.abs(video.currentTime - pendingSeek.current) < 0.025) {
      pausedPosition.current = video.paused ? video.currentTime : null;
      pendingSeek.current = null;
      return !video.seeking && video.readyState >= 2;
    } else video.currentTime = pendingSeek.current;
    return false;
  }, []);

  const cancelPlay = useCallback(() => { ++playAttempt.current; }, []);

  const requestPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const attempt = ++playAttempt.current;
    void video.play().catch((error: unknown) => {
      // A pause/seek may abort an older play promise. It isn't a policy failure.
      if (attempt !== playAttempt.current || (error instanceof DOMException && error.name === "AbortError")) return;
      setBlocked(true);
      setPlaying(false);
    });
  }, []);

  const canPlay = sourceLoaded && metadataReady && inView && documentVisible && playbackAllowed
    && !blocked && !failed
    && (reducedMotion === false || explicitPlayback);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!canPlay) {
      cancelPlay();
      video.pause();
      return;
    }
    applyPendingSeek();
    requestPlay();
    return () => {
      cancelPlay();
      video.pause();
    };
  }, [canPlay, applyPendingSeek, requestPlay, cancelPlay]);

  function syncChapter() {
    const video = videoRef.current;
    if (!video || video.seeking || seekInProgress.current || pendingSeek.current !== null) return;
    // WebKit can rewind an autoplayed video when it is suspended offscreen.
    // Keep the paused frame, while letting explicit chapter seeks take priority.
    if (video.paused && !video.ended && pausedPosition.current !== null
      && Math.abs(video.currentTime - pausedPosition.current) > 0.025) {
      restoringPause.current = true;
      video.currentTime = pausedPosition.current;
      return;
    }
    const index = iphoneChapters.findLastIndex((chapter) => video.currentTime >= chapter.start);
    setSelected(Math.max(0, index));
  }

  function selectChapter(index: number) {
    setSelected(index);
    pendingSeek.current = iphoneChapters[index].start;
    setFrameReady(false);
    // Reduced-motion chapter browsing stays entirely on the real posters.
    if ((reducedMotion === false || explicitPlayback) && applyPendingSeek()) setFrameReady(true);
  }

  function startPlayback() {
    setBlocked(false);
    setExplicitPlayback(true);
    setSourceLoaded(true);
    applyPendingSeek();
    // Keep an explicit play inside the user gesture for Safari's media policy.
    if (metadataReady && inView && documentVisible && playbackAllowed && !failed) requestPlay();
  }

  const events = {
    onLoadedMetadata() {
      setMetadataReady(true);
      applyPendingSeek();
    },
    onLoadedData() {
      applyPendingSeek();
      if (pendingSeek.current === null && !videoRef.current?.seeking) setFrameReady(true);
    },
    onSeeking() {
      seekInProgress.current = true;
      // Native looping keeps the video frame visible. Only an explicit chapter
      // jump needs its poster while the requested frame is being decoded.
      if (pendingSeek.current !== null && !restoringPause.current) setFrameReady(false);
    },
    onSeeked() {
      seekInProgress.current = false;
      restoringPause.current = false;
      const video = videoRef.current;
      pausedPosition.current = video?.paused ? video.currentTime : null;
      applyPendingSeek();
      if (pendingSeek.current === null) {
        setFrameReady(true);
        syncChapter();
      }
    },
    onTimeUpdate: syncChapter,
    onPlaying() { pausedPosition.current = null; setPlaying(true); setFrameReady(true); },
    onPause() {
      const video = videoRef.current;
      pausedPosition.current = video && !video.ended ? video.currentTime : null;
      setPlaying(false);
    },
    onError() { setFailed(true); setPlaying(false); setFrameReady(false); },
  };

  return {
    videoRef, phoneRef, selected, sourceLoaded, playing, failed,
    showPoster: failed || blocked || !frameReady || (reducedMotion !== false && !explicitPlayback),
    showPlayButton: !failed && !playing && (blocked || (reducedMotion === true && !explicitPlayback)),
    selectChapter, startPlayback, events,
  };
}

"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import ScenePlayer from "@/components/shared/ScenePlayer";
import { BAR_COUNT, LevelSmoother, barLayout, barTransform, recordingLevels } from "./BrandWaveform";
import { kalam } from "./fonts";
import {
  COMPACT_MAX_WIDTH,
  SCENE_LOOP_SECONDS,
  SIDE_MEDIA,
  WALKER,
  cubicPath,
  heroLayout,
  mouthBob,
  polylinePath,
  strokePolylines,
  type HeroLayout,
  type HeroMode,
  type Point,
} from "./strokes";
import styles from "./Hero.module.css";

/** Three phrases of 5.5 s each, one walker loop per phrase. */
const LOOP_SECONDS = SCENE_LOOP_SECONDS;
const PHRASE_SECONDS = 5.5;
/** Reduced motion: the first phrase fully written, the waveform mid-take. */
const STILL_AT = 4.2;
const STILL_LEVELS_AT = 2.3;
/** Handwriting: first letter at 0.35 s, then one letter every 55 ms. */
const FIRST_LETTER = 0.35;
const LETTER_SECONDS = 0.055;
const FADE_OUT_AT = 4.9;
const FADE_OUT_SECONDS = 0.45;

const WALKER_FILES = {
  still: "/images/hero/walker@2x.png",
  hevc: "/images/hero/walker@2x-hevc-alpha.mov",
  vp9: "/images/hero/walker@2x.webm",
};

function readMode(): HeroMode {
  if (window.matchMedia(SIDE_MEDIA).matches) return "side";
  return window.matchMedia(`(max-width: ${COMPACT_MAX_WIDTH}px)`).matches ? "compact" : "stack";
}

type PhraseRefs = { line: Element | null; letters: (Element | null)[] };

/** Writes opacity only when it changes; SVG text takes it as fill-opacity. */
function setOpacity(cache: WeakMap<Element, number>, element: Element | null, value: number) {
  if (!element) return;
  const rounded = Math.round(value * 100) / 100;
  if (cache.get(element) === rounded) return;
  cache.set(element, rounded);
  if (element instanceof SVGElement && element.tagName !== "text") element.setAttribute("fill-opacity", String(rounded));
  else (element as HTMLElement | SVGElement).style.opacity = String(rounded);
}

type Props = { phrases: string[]; writtenLabel: string };

/**
 * The walker speaks; three felt-pen strokes carry her voice into the Dictus
 * pill, and the result is written by hand. Decorative: the hero text says
 * the same thing.
 *
 * - Server markup: the walker's still frame only, placed by CSS.
 * - After hydration: the strokes, pill and phrase, placed for the measured
 *   scene box, drawn through refs by ScenePlayer.
 * - After the page's load event, and only when motion is allowed: the
 *   walker video (HEVC with alpha for Safari, VP9 with alpha elsewhere). It
 *   plays and pauses with the scene. The strokes start where her mouth is in
 *   the current video frame.
 */
export default function HeroScene({ phrases, writtenLabel }: Props) {
  const writingId = useId();
  const reduceMotion = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<HeroLayout | null>(null);
  const layoutRef = useRef<HeroLayout | null>(null);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playingRef = useRef(false);
  const strokeRefs = useRef<(SVGPathElement | null)[]>([]);
  const barRefs = useRef<(SVGLineElement | null)[]>([]);
  const phraseRefs = useRef<PhraseRefs[]>([]);
  const opacities = useRef(new WeakMap<Element, number>());
  const smoother = useRef(new LevelSmoother());
  const lines = useRef<Point[][] | undefined>(undefined);
  const barTransforms = useRef<string[]>([]);
  const lastFrame = useRef<number | null>(null);
  const lastSeconds = useRef(STILL_AT);
  const stillRef = useRef(false);

  // Before ScenePlayer's own effect draws the still moment.
  useLayoutEffect(() => {
    stillRef.current = Boolean(reduceMotion);
  }, [reduceMotion]);

  const draw = useCallback(
    (seconds: number) => {
      lastSeconds.current = seconds;
      const scene = layoutRef.current;
      if (!scene) return;
      const still = stillRef.current;

      const video = videoRef.current;
      const bob = video && video.readyState >= 2 ? mouthBob(video.currentTime, scene.walker.w) : 0;
      lines.current = strokePolylines(scene, seconds, bob, lines.current);
      lines.current.forEach((line, index) => {
        strokeRefs.current[index]?.setAttribute("d", polylinePath(line));
      });

      const { pill } = scene;
      const maxHeight = pill.h - (scene.scale === "compact" ? 20 : 28);
      const { barWidth } = barLayout(pill.cx - pill.w / 2 + pill.pad, pill.w - pill.pad * 2);
      const now = performance.now();
      const targets = recordingLevels(still ? STILL_LEVELS_AT : seconds, LOOP_SECONDS);
      const levels = still || lastFrame.current === null
        ? smoother.current.set(targets)
        : smoother.current.step(targets, (now - lastFrame.current) / 1000);
      lastFrame.current = now;
      for (let i = 0; i < BAR_COUNT; i++) {
        const transform = barTransform(levels[i], pill.cy, maxHeight, barWidth);
        if (barTransforms.current[i] === transform) continue;
        barTransforms.current[i] = transform;
        barRefs.current[i]?.setAttribute("transform", transform);
      }

      const current = Math.floor(seconds / PHRASE_SECONDS) % phrases.length;
      const local = seconds % PHRASE_SECONDS;
      const written = Math.max(0, (local - FIRST_LETTER) / LETTER_SECONDS);
      // Fades out on an ease-out (cubic): quick at first, no lingering smear.
      const out = Math.min(1, Math.max(0, (local - FADE_OUT_AT) / FADE_OUT_SECONDS));
      const fade = local > FADE_OUT_AT ? Math.pow(1 - out, 3) : 1;
      phraseRefs.current.forEach((refs, index) => {
        if (!refs) return;
        setOpacity(opacities.current, refs.line, index === current ? fade : 0);
        if (index !== current) return;
        refs.letters.forEach((letter, k) => {
          setOpacity(opacities.current, letter, Math.min(1, Math.max(0, written - k)));
        });
      });
    },
    [phrases.length],
  );

  // Lay the scene out for its box, again on every resize.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const mode = readMode();
      const width = box.clientWidth, height = box.clientHeight;
      const previous = layoutRef.current;
      if (previous && previous.mode === mode && previous.width === width && previous.height === height) return;
      const next = heroLayout(mode, width, height);
      layoutRef.current = next;
      setLayout(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Draw the new layout at once, even while paused or still.
  useEffect(() => {
    if (!layout) return;
    barTransforms.current = [];
    draw(lastSeconds.current);
  }, [layout, draw]);

  // The video only exists when motion is allowed, and only after the page
  // has loaded, so it never competes with the text for the first paint.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loaded = document.readyState === "complete";
    let frame = 0;
    const update = () => {
      const allowed = loaded && !query.matches;
      setVideoAllowed(allowed);
      if (!allowed) setVideoReady(false);
    };
    const onLoad = () => {
      loaded = true;
      update();
    };
    if (loaded) frame = requestAnimationFrame(update);
    else window.addEventListener("load", onLoad, { once: true });
    query.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
      query.removeEventListener("change", update);
    };
  }, []);

  const onPlayingChange = useCallback((playing: boolean) => {
    playingRef.current = playing;
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => undefined);
    else video.pause();
  }, []);

  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    // Off-screen at mount: cancel autoplay until the scene plays.
    if (video && !playingRef.current) video.pause();
  }, []);

  const walkerStyle = layout
    ? { left: layout.walker.x, top: layout.walker.y, width: layout.walker.w, height: layout.walker.h }
    : undefined;
  const pill = layout?.pill;
  const bars = pill ? barLayout(pill.cx - pill.w / 2 + pill.pad, pill.w - pill.pad * 2) : null;

  const phraseLetters = (phrase: string, index: number, svg: boolean) =>
    Array.from(phrase).map((letter, k) => {
      const ref = (node: Element | null) => {
        phraseRefs.current[index] ??= { line: null, letters: [] };
        phraseRefs.current[index].letters[k] = node;
      };
      return svg
        ? <tspan key={k} ref={ref}>{letter}</tspan>
        : <span key={k} ref={ref}>{letter}</span>;
    });
  const phraseLine = (index: number) => (node: Element | null) => {
    phraseRefs.current[index] ??= { line: null, letters: [] };
    phraseRefs.current[index].line = node;
  };

  return (
    <div ref={boxRef} className={styles.scene}>
      <ScenePlayer
        duration={LOOP_SECONDS}
        stillAt={STILL_AT}
        draw={draw}
        onPlayingChange={onPlayingChange}
        className={styles.player}
      >
        <div className={styles.walker} style={walkerStyle} data-video={videoReady ? "ready" : undefined}>
          <Image
            className={styles.walkerStill}
            src={WALKER_FILES.still}
            width={WALKER.maxWidth}
            height={WALKER.maxHeight}
            alt=""
            // In the stacked layouts it outsizes the headline and is the LCP
            // element: preload it at high priority (`preload` replaces the
            // deprecated `priority` in Next 16 and turns lazy loading off).
            preload
            fetchPriority="high"
            unoptimized
          />
          {videoAllowed && (
            <video
              ref={attachVideo}
              className={styles.walkerVideo}
              width={WALKER.maxWidth}
              height={WALKER.maxHeight}
              poster={WALKER_FILES.still}
              preload="metadata"
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={() => setVideoReady(true)}
            >
              {/* Safari takes the HEVC with alpha. Chrome and Firefox answer "" to
                  video/quicktime and take the VP9 with alpha (Chrome would decode an
                  HEVC labelled video/mp4, without its alpha). */}
              <source src={WALKER_FILES.hevc} type='video/quicktime; codecs="hvc1"' />
              <source src={WALKER_FILES.vp9} type='video/webm; codecs="vp9"' />
            </video>
          )}
        </div>

        {layout && pill && bars && (
          <svg
            className={styles.overlay}
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
          >
            {layout.strokes.map((stroke, index) => (
              <path
                key={index}
                ref={(node) => { strokeRefs.current[index] = node; }}
                fill="none"
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            <rect x={pill.cx - pill.w / 2} y={pill.cy - pill.h / 2} width={pill.w} height={pill.h} rx={pill.h / 2} fill="#0A1628" />
            {bars.bars.map((bar, index) => (
              <line
                key={index}
                ref={(node) => { barRefs.current[index] = node; }}
                x1={bar.x}
                x2={bar.x}
                y1={pill.cy - 0.5}
                y2={pill.cy + 0.5}
                stroke={bar.colour}
                strokeOpacity={bar.opacity}
                strokeWidth={bars.barWidth}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {layout.writing && (
              <>
                <path id={writingId} d={cubicPath(layout.writing)} fill="none" />
                {phrases.map((phrase, index) => (
                  <text
                    key={index}
                    ref={phraseLine(index)}
                    className={kalam.className}
                    fontSize={layout.writingSize}
                    fill="#0A1628"
                    opacity={0}
                    style={{ whiteSpace: "pre" }}
                  >
                    <textPath href={`#${writingId}`} startOffset={layout.mode === "side" ? 28 : 8}>
                      {phraseLetters(phrase, index, true)}
                    </textPath>
                  </text>
                ))}
              </>
            )}
          </svg>
        )}

        {layout?.card && (
          <div className={styles.card} style={{ left: layout.card.x, top: layout.card.y, width: layout.card.w }}>
            <p className={styles.cardLabel}>{writtenLabel}</p>
            <div className={`${styles.cardPhrases} ${kalam.className}`}>
              {phrases.map((phrase, index) => (
                <p key={index} ref={phraseLine(index)} className={styles.cardPhrase} style={{ opacity: 0 }}>
                  {phraseLetters(phrase, index, false)}
                </p>
              ))}
            </div>
          </div>
        )}
      </ScenePlayer>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./DictationPill.module.css";

const BAR_COUNT = 30;
const RECORDING_MS = 7_500;
const TRANSCRIBING_MS = 5_000;
const CYCLE_MS = 16_000;
type Stage = "recording" | "transcribing" | "idle";

// Geometry, colours and waveform behaviour come from Dictus Desktop's
// RecordingOverlay, not a recording of microphone input. See product-assets.md.
function barColor(index: number) {
  const distance = Math.abs(index - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);
  return distance < 0.4 ? "#6BA3FF" : `rgba(255,255,255,${(1 - distance) * 0.9 + 0.15})`;
}

function initialLevel(index: number) {
  return 0.14 + 0.25 * Math.sin((index / (BAR_COUNT - 1)) * Math.PI) ** 2;
}

export default function DictationPill() {
  const t = useTranslations("Platforms");
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsedRef = useRef(0);
  const levelsRef = useRef(Array.from({ length: BAR_COUNT }, (_, index) => initialLevel(index)));
  const targetsRef = useRef<number[]>(Array(BAR_COUNT).fill(0));
  const lastTargetRef = useRef(-Infinity);
  const stageRef = useRef<Stage>("recording");
  const [stage, setStage] = useState<Stage>("recording");
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const running = !paused && reducedMotion === false && visible && documentVisible;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(container);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreference = () => setReducedMotion(motionQuery.matches);
    onMotionPreference();
    motionQuery.addEventListener("change", onMotionPreference);
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous: number | null = null;

    const animate = (now: number) => {
      const delta = previous === null ? 0 : Math.min(now - previous, 64);
      previous = now;
      elapsedRef.current += delta;
      const cycle = elapsedRef.current % CYCLE_MS;
      const nextStage: Stage = cycle < RECORDING_MS ? "recording"
        : cycle < RECORDING_MS + TRANSCRIBING_MS ? "transcribing" : "idle";
      if (stageRef.current !== nextStage) {
        stageRef.current = nextStage;
        setStage(nextStage);
      }

      if (nextStage === "recording" && elapsedRef.current - lastTargetRef.current > 140) {
        lastTargetRef.current = elapsedRef.current;
        // Uneven, gently paced phrases with short breaths. Never request a mic.
        const voice = 0.15 + 0.55 * Math.abs(Math.sin(cycle / 710) * Math.cos(cycle / 1_390));
        targetsRef.current = Array.from({ length: BAR_COUNT }, (_, index) => {
          const distance = Math.abs(index - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);
          const envelope = distance < 0.65 ? 1 : 1 - ((distance - 0.65) / 0.35) * 0.8;
          return voice * envelope * (0.5 + Math.random() * 0.5);
        });
      }

      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        const target = nextStage === "recording" ? targetsRef.current[index]
          : nextStage === "transcribing"
            ? 0.2 + 0.25 * (Math.sin(2 * Math.PI * (index / (BAR_COUNT - 1) + (cycle - RECORDING_MS) / 1_000)) + 1)
            : 0;
        const previousLevel = levelsRef.current[index];
        const retention = target > previousLevel ? 0.3 : 0.85;
        const level = target + (previousLevel - target) * Math.pow(retention, delta / (1_000 / 60));
        levelsRef.current[index] = level;
        // Preserve the native 3px end caps as height changes. Scaling the bars
        // vertically would flatten their corners into a different silhouette.
        bar.style.height = `${Math.max(2 / 64, level) * 100}%`;
      });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  return (
    <div ref={containerRef} className={styles.demo} data-dictation-pill data-stage={stage} data-running={running}>
      <div className={styles.visual} role="img" aria-label={t("demo_label")}>
        <div className={styles.native} aria-hidden="true">
          <div className={styles.pill}>
            <div className={styles.bars}>
              {Array.from({ length: BAR_COUNT }, (_, index) => (
                <span key={index} ref={(element) => { barsRef.current[index] = element; }}
                  className={styles.bar}
                  style={{ backgroundColor: barColor(index), height: `${(initialLevel(index) * 100).toFixed(4)}%` }} />
              ))}
            </div>
          </div>
          <div className={styles.cancelSlot} data-visible={stage === "recording"}>
            <div className={styles.cancel}>
              <svg viewBox="0 0 24 24" fill="none">
                <g fill="#3D7EFF">
                  <path d="m14.293 8.29297c.3905-.39052 1.0235-.39052 1.414 0s.3905 1.02354 0 1.41406l-5.99998 5.99997c-.39053.3906-1.02354.3906-1.41407 0-.39052-.3905-.39052-1.0235 0-1.414z" />
                  <path d="m8.29295 8.29297c.39053-.39052 1.02354-.39052 1.41407 0l5.99998 6.00003c.3905.3905.3905 1.0235 0 1.414-.3905.3906-1.0235.3906-1.414 0l-6.00005-5.99997c-.39052-.39052-.39052-1.02354 0-1.41406z" />
                  <path d="m20 12c0-4.41828-3.5817-8-8-8-4.41828 0-8 3.58172-8 8 0 4.4183 3.58172 8 8 8 4.4183 0 8-3.5817 8-8zm2 0c0 5.5228-4.4772 10-10 10-5.52285 0-10-4.4772-10-10 0-5.52285 4.47715-10 10-10 5.5228 0 10 4.47715 10 10z" opacity=".4" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.caption}>
        <span aria-hidden="true">{t(`demo_${stage}`)}</span>
          <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={t(paused ? "demo_resume" : "demo_pause")}
            className={styles.control}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              {paused ? <path d="m6 4 9 6-9 6Z" /> : <path d="M7 4v12M13 4v12" />}
            </svg>
          </button>
      </div>
    </div>
  );
}

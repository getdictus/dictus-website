"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

// --- Constants matching iOS BrandWaveform.swift ---
const BAR_COUNT = 30;
const BAR_SPACING = 3; // px between bars
const MAX_HEIGHT = 160; // big imposing bars
const MIN_BAR_HEIGHT = 2; // baseline visibility even in silence

// Color lerp duration in ms
const COLOR_LERP_DURATION = 300;

type ThemeColors = {
  edgeRgb: string;
  gradientStart: string;
  gradientEnd: string;
};

const DEFAULT_COLORS: ThemeColors = {
  edgeRgb: "255, 255, 255",
  gradientStart: "#6BA3FF",
  gradientEnd: "#2563EB",
};

/** Parse a hex color (#RRGGBB) to [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Parse an RGB tuple string "r, g, b" to [r, g, b] */
function parseRgbTuple(s: string): [number, number, number] {
  const parts = s.split(",").map((p) => parseInt(p.trim(), 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/** Smoothstep easing */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Interpolate between two [r,g,b] arrays */
function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Port of iOS BrandWaveform.swift to Canvas.
 *
 * 30 vertical rounded bars with:
 * - Center 40%: blue gradient (theme-aware)
 * - Outer 60%: edge color with opacity decreasing toward edges
 * - Sinusoidal traveling wave envelope for processing animation
 * - Smooth lerp rise + exponential decay fall
 * - MutationObserver watches .dark class for theme changes with 300ms color lerp
 */
export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const shouldReduce = useReducedMotion() ?? false;
  const hasDrawnStaticRef = useRef(false);
  const displayLevelsRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const colorsRef = useRef<ThemeColors>({ ...DEFAULT_COLORS });
  const lerpAnimRef = useRef<number | null>(null);

  /** Read CSS custom properties for current theme */
  const resolveThemeColors = useCallback((): ThemeColors => {
    const style = getComputedStyle(document.documentElement);
    return {
      edgeRgb:
        style.getPropertyValue("--theme-waveform-edge-rgb").trim() ||
        "255, 255, 255",
      gradientStart:
        style.getPropertyValue("--theme-waveform-gradient-start").trim() ||
        "#6BA3FF",
      gradientEnd:
        style.getPropertyValue("--theme-waveform-gradient-end").trim() ||
        "#2563EB",
    };
  }, []);

  /** Smoothly interpolate colorsRef from old to new over duration ms */
  const lerpColors = useCallback(
    (oldColors: ThemeColors, newColors: ThemeColors, duration: number) => {
      // Cancel any in-flight lerp
      if (lerpAnimRef.current !== null) {
        cancelAnimationFrame(lerpAnimRef.current);
      }

      const oldEdge = parseRgbTuple(oldColors.edgeRgb);
      const newEdge = parseRgbTuple(newColors.edgeRgb);
      const oldGradStart = hexToRgb(oldColors.gradientStart);
      const newGradStart = hexToRgb(newColors.gradientStart);
      const oldGradEnd = hexToRgb(oldColors.gradientEnd);
      const newGradEnd = hexToRgb(newColors.gradientEnd);

      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const rawT = Math.min(elapsed / duration, 1);
        const t = smoothstep(rawT);

        const edge = lerpRgb(oldEdge, newEdge, t);
        const gradStart = lerpRgb(oldGradStart, newGradStart, t);
        const gradEnd = lerpRgb(oldGradEnd, newGradEnd, t);

        colorsRef.current = {
          edgeRgb: `${edge[0]}, ${edge[1]}, ${edge[2]}`,
          gradientStart: `#${edge2hex(gradStart)}`,
          gradientEnd: `#${edge2hex(gradEnd)}`,
        };

        if (rawT < 1) {
          lerpAnimRef.current = requestAnimationFrame(step);
        } else {
          lerpAnimRef.current = null;
        }
      }

      lerpAnimRef.current = requestAnimationFrame(step);
    },
    []
  );

  // Watch for theme class changes on <html>
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const oldColors = { ...colorsRef.current };
      // Small delay to let CSS variables update after class change
      requestAnimationFrame(() => {
        const newColors = resolveThemeColors();
        lerpColors(oldColors, newColors, COLOR_LERP_DURATION);
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    // Initialize colors from current theme
    colorsRef.current = resolveThemeColors();
    return () => {
      observer.disconnect();
      if (lerpAnimRef.current !== null) {
        cancelAnimationFrame(lerpAnimRef.current);
      }
    };
  }, [resolveThemeColors, lerpColors]);

  // Handle retina + resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      dimensionsRef.current = { width: rect.width, height: rect.height };
      hasDrawnStaticRef.current = false;
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  /**
   * Compute sinusoidal processing energy for a bar at given index.
   * Mirrors iOS: sin(2pi * (normalizedIndex + phase)) mapped to 0.2..0.7
   */
  const processingEnergy = useCallback(
    (index: number, phase: number): number => {
      const normalizedIndex = index / Math.max(BAR_COUNT - 1, 1);
      const sineValue = Math.sin(2 * Math.PI * (normalizedIndex + phase));
      // Map sine (-1..1) to energy (0.2..0.7)
      return 0.2 + 0.25 * (sineValue + 1.0);
    },
    []
  );

  /**
   * Resolve bar color/gradient matching iOS logic:
   * - Inner 40% (from center): blue gradient using theme colors
   * - Outer 60%: edge color with opacity decreasing toward edges
   */
  const resolveBarColor = useCallback(
    (
      index: number,
      ctx: CanvasRenderingContext2D,
      y: number,
      barHeight: number
    ): string | CanvasGradient => {
      const center = (BAR_COUNT - 1) / 2;
      const distanceFromCenter = Math.abs(index - center) / center; // 0..1
      const colors = colorsRef.current;

      if (distanceFromCenter < 0.4) {
        // Inner 40%: blue gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, colors.gradientStart);
        gradient.addColorStop(1, colors.gradientEnd);
        return gradient;
      } else {
        // Outer 60%: edge color with decreasing opacity toward edges
        const opacity = (1.0 - distanceFromCenter) * 0.9 + 0.15;
        return `rgba(${colors.edgeRgb},${opacity.toFixed(3)})`;
      }
    },
    []
  );

  /**
   * Draw all 30 bars as rounded rectangles on canvas.
   * Mirrors iOS Canvas rendering approach for 60fps single draw call.
   */
  const drawBars = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Processing phase: time / 2000 to match iOS (timeInterval / 2.0)
      const phase = time / 2000;

      // Smoothing constants matching iOS
      const smoothingFactor = 0.3;
      const decayFactor = 0.85;
      const displayLevels = displayLevelsRef.current;

      // Compute bar layout -- center the waveform
      const totalSpacing = BAR_SPACING * (BAR_COUNT - 1);
      const totalBarWidth = width * 0.6; // Use 60% of container width
      const barWidth = Math.max(
        (totalBarWidth - totalSpacing) / BAR_COUNT,
        2
      );
      const actualTotalWidth =
        barWidth * BAR_COUNT + BAR_SPACING * (BAR_COUNT - 1);
      const offsetX = (width - actualTotalWidth) / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Target energy from sinusoidal processing wave
        const targetEnergy = processingEnergy(i, phase);

        // Smooth interpolation: lerp up, decay down (matching iOS)
        const current = displayLevels[i];
        if (targetEnergy > current) {
          displayLevels[i] =
            current + (targetEnergy - current) * smoothingFactor;
        } else {
          displayLevels[i] =
            targetEnergy + (current - targetEnergy) * decayFactor;
        }
        // Snap to near-zero
        if (displayLevels[i] < 0.005) {
          displayLevels[i] = 0;
        }

        const energy = displayLevels[i];
        const barHeight = Math.max(
          MIN_BAR_HEIGHT + energy * (MAX_HEIGHT - MIN_BAR_HEIGHT),
          MIN_BAR_HEIGHT
        );

        const x = offsetX + i * (barWidth + BAR_SPACING);
        const y = (height - barHeight) / 2;
        const radius = barWidth / 2;

        // Draw rounded rectangle
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fillStyle = resolveBarColor(i, ctx, y, barHeight);
        ctx.fill();
      }
    },
    [processingEnergy, resolveBarColor]
  );

  // Animated loop
  useAnimationFrame(
    useCallback(
      (time: number) => {
        drawBars(time);
      },
      [drawBars]
    ),
    !shouldReduce
  );

  // Static frame for reduced motion
  useEffect(() => {
    if (shouldReduce && !hasDrawnStaticRef.current) {
      requestAnimationFrame((time) => {
        drawBars(time);
        hasDrawnStaticRef.current = true;
      });
    }
  }, [shouldReduce, drawBars]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none absolute left-0 top-0 h-[250px] w-full sm:h-[350px]"
    />
  );
}

/** Convert [r,g,b] to hex string without # prefix */
function edge2hex(rgb: [number, number, number]): string {
  return rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

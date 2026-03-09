"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

// --- Constants matching iOS BrandWaveform.swift ---
const BAR_COUNT = 30;
const BAR_SPACING = 3; // px between bars
const MAX_HEIGHT = 160; // big imposing bars
const MIN_BAR_HEIGHT = 2; // baseline visibility even in silence

// Brand colors from CLAUDE.md
const BRAND_BLUE = "#3D7EFF"; // dictusGradientStart equivalent
const EDGE_COLOR_RGB = "255,255,255"; // white for dark mode edges

/**
 * Port of iOS BrandWaveform.swift to Canvas.
 *
 * 30 vertical rounded bars with:
 * - Center 40%: brand blue (#3D7EFF)
 * - Outer 60%: white with opacity decreasing toward edges
 * - Sinusoidal traveling wave envelope for processing animation
 * - Smooth lerp rise + exponential decay fall
 */
export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const shouldReduce = useReducedMotion() ?? false;
  const hasDrawnStaticRef = useRef(false);
  const displayLevelsRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));

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
   * Mirrors iOS: sin(2π * (normalizedIndex + phase)) mapped to 0.2..0.7
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
   * Resolve bar color matching iOS logic:
   * - Inner 40% (from center): solid brand blue
   * - Outer 60%: white with opacity decreasing toward edges
   */
  const resolveBarColor = useCallback((index: number): string => {
    const center = (BAR_COUNT - 1) / 2;
    const distanceFromCenter = Math.abs(index - center) / center; // 0..1

    if (distanceFromCenter < 0.4) {
      // Inner 40%: brand blue
      return BRAND_BLUE;
    } else {
      // Outer 60%: white with decreasing opacity toward edges
      const opacity = (1.0 - distanceFromCenter) * 0.9 + 0.15;
      return `rgba(${EDGE_COLOR_RGB},${opacity.toFixed(3)})`;
    }
  }, []);

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

      // Compute bar layout — center the waveform
      const totalSpacing = BAR_SPACING * (BAR_COUNT - 1);
      const totalBarWidth = (width * 0.6); // Use 60% of container width
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
        ctx.fillStyle = resolveBarColor(i);
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
      className="pointer-events-none absolute left-0 top-0 h-[250px] w-full sm:h-[350px]"
    />
  );
}

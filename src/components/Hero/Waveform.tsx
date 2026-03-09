"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

interface WaveConfig {
  frequency: number;
  amplitude: number;
  speed: number;
  color: string;
  opacity: number;
}

const WAVES: WaveConfig[] = [
  { frequency: 0.02, amplitude: 0.3, speed: 0.001, color: "#3D7EFF", opacity: 0.15 },
  { frequency: 0.015, amplitude: 0.25, speed: 0.0008, color: "#6BA3FF", opacity: 0.12 },
  { frequency: 0.025, amplitude: 0.2, speed: 0.0012, color: "#93C5FD", opacity: 0.1 },
];

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const shouldReduce = useReducedMotion() ?? false;
  const hasDrawnStaticRef = useRef(false);

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

  const drawWaves = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);
      const centerY = height / 2;

      for (const wave of WAVES) {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.opacity;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = wave.color + "59"; // ~35% opacity hex

        for (let x = 0; x <= width; x += 2) {
          const y =
            centerY +
            Math.sin(x * wave.frequency + time * wave.speed) *
              (height * wave.amplitude);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Reset shadow and alpha
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
    []
  );

  // Animated loop
  useAnimationFrame(
    useCallback(
      (time: number) => {
        drawWaves(time);
      },
      [drawWaves]
    ),
    !shouldReduce
  );

  // Static frame for reduced motion
  useEffect(() => {
    if (shouldReduce && !hasDrawnStaticRef.current) {
      // Draw a single static frame
      requestAnimationFrame((time) => {
        drawWaves(time);
        hasDrawnStaticRef.current = true;
      });
    }
  }, [shouldReduce, drawWaves]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-[200px] w-full sm:h-[300px]"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    />
  );
}

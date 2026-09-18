"use client";

import { Glass } from "@samasante/liquid-glass";
import type { CSSProperties, ReactNode } from "react";
import GlassLight from "./GlassLight";

// Material mode: server-rendered children, no WebGL or live animation loop.
// Chromium refracts the backdrop; Safari/Firefox retain the tint and lit edge.
const optics = {
  strength: 0.035, frost: 2, dispersion: 0.012, depth: 0.25,
  curvature: 0.2, bend: 0.6, brightness: 0, specular: 0.65,
  sheen: 0.14, glow: 0.02, saturate: 1.1,
};

export default function GlassSurface({ children, className = "", style }: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Glass
      className={`glass-surface ${className}`}
      style={{ position: "relative", borderRadius: 999, ...style }}
      optics={optics}
    >
      <GlassLight />
      {children}
    </Glass>
  );
}

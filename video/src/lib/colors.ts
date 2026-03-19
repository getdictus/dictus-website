// Brand colors from CLAUDE.md brand kit
export const COLORS = {
  inkDeep: "#0A1628",
  ink: "#0B0F1A",
  ink2: "#111827",
  surface: "#161C2C",
  navy: "#0F3460",
  accentBlue: "#3D7EFF",
  accentHi: "#6BA3FF",
  sky: "#93C5FD",
  mist: "#DBEAFE",
  white: "#FFFFFF",
  white70: "rgba(255,255,255,0.70)",
  white40: "rgba(255,255,255,0.40)",
  white30: "rgba(255,255,255,0.30)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.14)",
  glow: "rgba(61,126,255,0.35)",
  glowSoft: "rgba(61,126,255,0.12)",
} as const;

// Semantic state colors (4 states, no smart mode per CONTEXT.md)
export const STATE_COLORS = {
  idle: "rgba(255,255,255,0.3)",
  recording: "#EF4444",
  transcribing: "#3D7EFF",
  inserted: "#22C55E",
} as const;

// Waveform gradient colors (dark theme only for video)
export const WAVEFORM_COLORS = {
  edgeRgb: "255, 255, 255",
  gradientStart: "#6BA3FF",
  gradientEnd: "#2563EB",
} as const;

// Gradients from brand kit
export const GRADIENTS = {
  iconBg: "linear-gradient(135deg, #0D2040, #071020)",
  button: "linear-gradient(135deg, #1A4E8A, #0F3460)",
  barAccent: "linear-gradient(180deg, #6BA3FF, #2563EB)",
} as const;

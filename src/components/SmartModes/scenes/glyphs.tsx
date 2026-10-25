/**
 * Simple line glyphs standing in for the SF Symbols the scenes use. Drawn
 * for the site, 24-unit grid, stroke follows `currentColor`.
 */
type GlyphProps = { size: number; className?: string; weight?: number };

const paths = {
  plus: "M12 5v14M5 12h14",
  mic: "M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3ZM6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20",
  undo: "M9 6 4.5 10.5 9 15M5 10.5h9a5 5 0 0 1 0 10h-2",
  shift: "M12 4 4 12h4.5v7h7v-7H20Z",
  delete: "M9 5h11v14H9l-6-7ZM12 9l5 6M17 9l-5 6",
  smile: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5v.5M15 9.5v.5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c-3 3.3-3 14.7 0 18M12 3c3 3.3 3 14.7 0 18",
  chevronLeft: "M15 5 8 12l7 7",
  chevronRight: "m9 6 6 6-6 6",
  xmark: "M6 6l12 12M18 6 6 18",
  trash: "M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 13h9l1-13M10 10v6M14 10v6",
  share: "M14 4h6v6M20 4l-8 8M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20",
  xmarkCircle: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9 9l6 6M15 9l-6 6",
} as const;

export function Glyph({ name, size, className, weight = 1.8 }: GlyphProps & { name: keyof typeof paths }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}

/** Filled mic (`mic.fill`) and play (`play.fill`). */
export function MicFill({ size, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="8.5" y="3" width="7" height="12" rx="3.5" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16.5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlayFill({ size, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M7 4.5v15a.8.8 0 0 0 1.2.7l12-7.5a.8.8 0 0 0 0-1.4l-12-7.5A.8.8 0 0 0 7 4.5Z" />
    </svg>
  );
}

/** The scenes' iOS system font. */
export const SYSTEM_FONT = { fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, sans-serif" } as const;

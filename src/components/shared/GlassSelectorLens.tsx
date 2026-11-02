"use client";

import { useState } from "react";
import type { GlassSelectorGeometry } from "./useGlassSelector";
import styles from "./GlassSelectorLens.module.css";

/** Scale only the empty material, never the label. The outer GlassSurface owns
 * refraction; another SVG backdrop filter here darkens overlapping surfaces.
 * With no target (a group with nothing selected, once the pointer leaves),
 * the lens fades out where it was instead of sliding back to the start. */
export default function GlassSelectorLens({ geometry, keyboard }: {
  geometry: GlassSelectorGeometry | null;
  keyboard: boolean;
}) {
  const [last, setLast] = useState(geometry);
  if (geometry && geometry !== last) setLast(geometry);
  const shown = geometry ?? last;
  return (
    <div className={styles.lens} data-glass-selector-lens data-instant={keyboard || undefined} aria-hidden="true" style={{
      width: shown?.baseWidth ?? 0,
      height: shown?.height ?? 44,
      transform: `translate(${shown?.x ?? 0}px, ${shown?.y ?? 0}px) scaleX(${shown ? shown.width / shown.baseWidth : 1})`,
      opacity: geometry ? 1 : 0,
    }}>
      <div className={styles.material}><span className={styles.light} /></div>
    </div>
  );
}

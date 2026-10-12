import type { GlassSelectorGeometry } from "./useGlassSelector";
import styles from "./GlassSelectorLens.module.css";

/** Scale only the empty material, never the label. The outer GlassSurface owns
 * refraction; another SVG backdrop filter here darkens overlapping surfaces. */
export default function GlassSelectorLens({ geometry, keyboard }: {
  geometry: GlassSelectorGeometry | null;
  keyboard: boolean;
}) {
  return (
    <div className={styles.lens} data-glass-selector-lens data-instant={keyboard || undefined} aria-hidden="true" style={{
      width: geometry?.baseWidth ?? 0,
      height: geometry?.height ?? 44,
      transform: `translate(${geometry?.x ?? 0}px, ${geometry?.y ?? 0}px) scaleX(${geometry ? geometry.width / geometry.baseWidth : 1})`,
      opacity: geometry ? 1 : 0,
    }}>
      <div className={styles.material}><span className={styles.light} /></div>
    </div>
  );
}

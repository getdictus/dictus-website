import { Glyph } from "./glyphs";

/**
 * iOS pieces the dictus-ios scenes draw themselves, in their 402 pt space.
 * Colours are the scenes' own, except text: Apple's secondary (0.6) and
 * tertiary (0.3) labels and the accent are darkened just enough to reach
 * 4.5:1 on every ground they sit on (the language badge sets 0.85). Glass
 * has no colour in the app (`.glassEffect`), so it is a plain translucent
 * white here, without blur.
 */
export const SECONDARY = "rgba(60,60,67,0.85)";
export const TERTIARY = "rgba(60,60,67,0.71)";
/** Accent #3D7EFF shaded for text on white, and under white text (4.51:1). */
export const ACCENT_ON_WHITE = "#3771E5";
/** On glass (#FCFCFD): 4.53:1. */
export const ACCENT_ON_GLASS = "#366FE1";
/** On its 12 % pill over the keyboard (#C0CBDF): 4.5:1. */
export const ACCENT_ON_KEYBOARD = "#2852A7";
export const GLASS = "bg-white/75 ring-[0.5px] ring-black/10";
export const KEYBOARD_BACKDROP = "#D2D5DB";

/** Messages input bar: "+" circle and the field capsule (SmartModesScene.swift 329-367). */
export function InputBar({ text, placeholder }: { text?: string; placeholder?: string }) {
  return (
    <div className="flex h-[60px] items-center gap-2.5 px-3">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full border border-[#E5E5EA] bg-white text-black">
        <Glyph name="plus" size={18} weight={2} />
      </span>
      <span className="flex h-[38px] min-w-0 flex-1 items-center rounded-full border border-[#E5E5EA] bg-white px-3.5">
        <span className="min-w-0 flex-1 truncate text-[17px]" style={{ color: text ? "#000" : TERTIARY }}>
          {text ?? placeholder}
        </span>
        <Glyph name="mic" size={15} className="shrink-0" weight={1.6} />
      </span>
    </div>
  );
}

/** The bar under the keyboard: globe and mic (SmartModesScene.swift 789-802). */
export function SystemBar() {
  return (
    <div className="flex h-16 items-start justify-between px-[30px] pt-2 text-black">
      <Glyph name="globe" size={24} weight={1.5} />
      <Glyph name="mic" size={24} weight={1.5} />
    </div>
  );
}

/** A switch, on, tinted with the accent (VocabularyScene.swift 333-338). */
export function Toggle() {
  return (
    <span className="relative inline-block h-[31px] w-[51px] shrink-0 rounded-full bg-accent">
      <span className="absolute right-0.5 top-0.5 size-[27px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
    </span>
  );
}

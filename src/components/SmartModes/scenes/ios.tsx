import { Glyph } from "./glyphs";

/**
 * iOS pieces the dictus-ios scenes draw themselves, in their 402 pt space.
 * Colours are the scenes' own; iOS secondary and tertiary labels are Apple's
 * light-mode values. Glass has no colour in the app (`.glassEffect`), so it
 * is a plain translucent white here, without blur.
 */
export const SECONDARY = "rgba(60,60,67,0.6)";
export const TERTIARY = "rgba(60,60,67,0.3)";
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

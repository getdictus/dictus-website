import Phone from "./Phone";
import { Glyph, MicFill, SYSTEM_FONT } from "./glyphs";
import { ACCENT_ON_KEYBOARD, ACCENT_ON_WHITE, GLASS, InputBar, KEYBOARD_BACKDROP, SystemBar } from "./ios";

/**
 * Still of dictus-ios `SmartModesScene` at its still moment (19.5 s of 20,
 * SmartModesSceneScript.swift 56): the end of the translation leg. The field
 * holds the translated sentence, the toolbar offers Undo, and the mic pill
 * carries the target language badge. The scene's speaker is the page's
 * reader: French readers translate to English on an AZERTY keyboard,
 * English readers to French on QWERTY (SmartModePick.swift 37-40).
 */
const copy = {
  fr: {
    sentence: "I’ll be there in ten minutes.",
    badge: "EN",
    undo: "Annuler",
    rows: ["azertyuiop", "qsdfghjklm", "wxcvbn’"],
    space: "espace",
    enter: "retour",
  },
  en: {
    sentence: "J’arrive dans dix minutes.",
    badge: "FR",
    undo: "Undo",
    rows: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
    space: "space",
    enter: "return",
  },
} as const;

const key = "flex h-[43px] items-center justify-center rounded-[8px] bg-white text-black";

export default function SmartModesStill({ locale }: { locale: "fr" | "en" }) {
  const c = copy[locale];
  return (
    <Phone end="bottom" height={473} screen="#FFFFFF">
      <div className="flex h-full flex-col bg-white" style={SYSTEM_FONT}>
        <div className="h-[92px]" />
        <InputBar text={c.sentence} />
        <div className="flex-1 rounded-t-[18px]" style={{ background: KEYBOARD_BACKDROP }}>
          {/* Dictus toolbar: Undo replaces the menu button, then the armed mic pill. */}
          <div className="flex h-[52px] items-center justify-between px-3 pt-1">
            <span className="flex h-9 items-center gap-[5px] rounded-full bg-accent/[0.12] px-3.5" style={{ color: ACCENT_ON_KEYBOARD }}>
              <Glyph name="undo" size={13} weight={2.6} />
              <span className="text-[15px] font-semibold">{c.undo}</span>
            </span>
            <span className={`relative flex h-[46px] w-[66px] items-center justify-center rounded-full border-2 border-accent/45 ${GLASS}`}>
              <span className="flex h-9 w-14 items-center justify-center rounded-full bg-accent text-white">
                <MicFill size={14} />
              </span>
              <span className="absolute left-[calc(50%+24px-9px)] top-[calc(50%+13px-9px)] flex size-[18px] items-center justify-center rounded-full bg-white text-[8px] font-bold shadow-[0_0.5px_1.5px_rgba(0,0,0,0.18)]" style={{ color: ACCENT_ON_WHITE }}>
                {c.badge}
              </span>
            </span>
          </div>
          {/* Keys at rest. */}
          <div className="flex flex-col gap-[11px] px-1">
            {c.rows.map((row, index) => (
              <div key={row} className="flex justify-center gap-1.5">
                {index === 2 && (
                  <span className={`${key} mr-auto w-[47.6px]`}><Glyph name="shift" size={18} weight={1.6} /></span>
                )}
                {[...row].map((letter) => (
                  <span key={letter} className={`${key} w-[34px] text-[23px]`}>{letter}</span>
                ))}
                {index === 2 && (
                  <span className={`${key} ml-auto w-[47.6px]`}><Glyph name="delete" size={18} weight={1.6} /></span>
                )}
              </div>
            ))}
            <div className="flex gap-1.5 text-[16px]">
              <span className={`${key} w-[56.4px]`}>123</span>
              <span className={`${key} w-[56.4px]`}><Glyph name="smile" size={20} weight={1.6} /></span>
              <span className={`${key} w-[188px]`}>{c.space}</span>
              <span className={`${key} w-[75.2px]`}>{c.enter}</span>
            </div>
          </div>
          <SystemBar />
        </div>
      </div>
    </Phone>
  );
}

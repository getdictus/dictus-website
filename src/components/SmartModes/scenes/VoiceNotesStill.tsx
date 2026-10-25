import { Fragment } from "react";
import Phone from "./Phone";
import { Glyph, PlayFill, SYSTEM_FONT } from "./glyphs";
import { GLASS, InputBar, KEYBOARD_BACKDROP, SECONDARY, SystemBar } from "./ios";

/**
 * Still of dictus-ios `VoiceNotesScene` at its still moment (13.5 s of 15.3,
 * VoiceNotesSceneScript.swift 135): chapter 2, "for every voice note", with
 * the Dictus reader open in the keyboard under the received voice message.
 * The header above the phone is the scene's own (VoiceNotesScene.swift
 * 69-153). Transcript and badge follow the page language, as they follow
 * the app language.
 */
const copy = {
  fr: {
    caption: "Ensuite, à chaque vocal",
    chips: ["Partager", "Dictus", "Texte dans le clavier"],
    badge: "FR",
    transcript: "Réunion de chantier : la livraison des fenêtres est repoussée à lundi, le plombier passe mercredi matin, et il faut valider le devis de l’électricien avant vendredi.",
    insert: "Insérer",
  },
  en: {
    caption: "Then, for every voice note",
    chips: ["Share", "Dictus", "Text in your keyboard"],
    badge: "EN",
    transcript: "Site meeting: the window delivery is pushed back to Monday, the plumber comes on Wednesday morning, and the electrician’s quote has to be approved before Friday.",
    insert: "Insert",
  },
} as const;

/** Bar heights of the voice bubble (VoiceNotesScene.swift 299). */
const BARS = [8, 14, 20, 12, 18, 24, 16, 10, 20, 26, 14, 18, 12, 22, 16, 10, 14, 8, 18, 12, 6];
const READER_ICON = "rgba(38,38,38,0.5)";

export default function VoiceNotesStill({ locale }: { locale: "fr" | "en" }) {
  const c = copy[locale];
  return (
    <div className="flex h-full flex-col" style={SYSTEM_FONT}>
      <div className="pb-3 pt-1">
        <p className="text-[13px] font-semibold" style={{ color: SECONDARY }}>{c.caption}</p>
        <div className="mt-2 flex items-center gap-1 whitespace-nowrap text-[11px] text-black">
          {c.chips.map((chip, index) => (
            <Fragment key={chip}>
              {index > 0 && <Glyph name="chevronRight" size={10} weight={2.4} className="shrink-0 text-[rgba(60,60,67,0.3)]" />}
              <span className="flex items-center gap-1 rounded-full bg-[#F2F2F7] px-2 py-1">
                <b className="font-bold text-accent">{index + 1}</b>
                {chip}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="relative flex-1">
        <Phone end="bottom" height={440} screen="#FFFFFF">
          <div className="flex h-full flex-col bg-white">
            <div className="flex flex-1 items-end px-3.5 pb-2.5">
              <span className="flex h-10 items-center gap-2.5 rounded-full bg-[#E9E9EB] px-3.5 text-black">
                <PlayFill size={15} />
                <span className="flex items-center gap-0.5">
                  {BARS.map((height, index) => (
                    <span key={index} className="w-[2.5px] rounded-full bg-black/55" style={{ height }} />
                  ))}
                </span>
                <span className="font-mono text-[13px] tabular-nums" style={{ color: SECONDARY }}>4:12</span>
              </span>
            </div>
            <InputBar placeholder="iMessage" />
            <div className="flex h-[321px] flex-col rounded-t-[18px]" style={{ background: KEYBOARD_BACKDROP }}>
              <div className="relative flex h-[52px] items-center justify-between px-3 pt-1">
                <span className={`flex h-9 w-14 items-center justify-center rounded-full ${GLASS}`} style={{ color: READER_ICON }}>
                  <Glyph name="xmark" size={17} weight={2} />
                </span>
                <span className="absolute inset-x-0 flex items-center justify-center gap-1.5">
                  <span className="text-[13px] font-medium tabular-nums" style={{ color: SECONDARY }}>4:12</span>
                  <span className="rounded-full bg-[rgba(38,38,38,0.1)] px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: SECONDARY }}>{c.badge}</span>
                </span>
                <span className={`flex h-9 w-14 items-center justify-center rounded-full text-[#FF3B30] ${GLASS}`}>
                  <Glyph name="trash" size={17} weight={1.8} />
                </span>
              </div>
              <p className="h-[149px] overflow-hidden px-4 py-2.5 text-[17px] leading-snug text-[#262626] [mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)]">
                {c.transcript}
              </p>
              <div className="flex gap-2.5 px-3 pb-2 pt-1">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${GLASS}`} style={{ color: READER_ICON }}>
                  <Glyph name="share" size={17} weight={1.8} />
                </span>
                <span className="flex h-11 flex-1 items-center justify-center rounded-full bg-accent text-[16px] font-semibold text-white">{c.insert}</span>
              </div>
              <SystemBar />
            </div>
          </div>
        </Phone>
      </div>
    </div>
  );
}


import { Fragment } from "react";
import Phone from "./Phone";
import { Glyph, SYSTEM_FONT } from "./glyphs";
import { ACCENT_ON_GLASS, ACCENT_ON_WHITE, GLASS, SECONDARY, Toggle } from "./ios";

/**
 * Still of dictus-ios `VocabularyScene` at its still moment (8.5 s of 11.6,
 * VocabularySceneScript.swift 71): the editor has closed and the list shows
 * three terms, the new "Dr Nguyen" last (VocabularyScene.swift 93-204).
 */
const copy = {
  fr: {
    title: "Vocabulaire",
    edit: "Modifier",
    terms: "Vos termes",
    replaces: "Remplace :",
    nguyen: "docteur Nguyen",
    footer: "Quand Dictus écrit l’une de ces variantes, elle est remplacée par votre orthographe.",
    add: "Ajouter un terme",
  },
  en: {
    title: "Vocabulary",
    edit: "Edit",
    terms: "Your terms",
    replaces: "Replaces:",
    nguyen: "doctor Nguyen",
    footer: "When Dictus writes one of these variants, it is replaced by your spelling.",
    add: "Add a term",
  },
} as const;

export default function VocabularyStill({ locale }: { locale: "fr" | "en" }) {
  const c = copy[locale];
  const rows = [
    ["Kowalczyk", "Kovalchik, Kovaltchik"],
    ["Kubernetes", "cubernetes"],
    ["Dr Nguyen", c.nguyen],
  ];
  return (
    <Phone end="top" height={560} screen="#F2F2F7">
      <div className="h-full bg-[#F2F2F7] text-black" style={SYSTEM_FONT}>
        <div className="flex h-[60px] items-center justify-between px-4">
          <span className={`flex size-11 items-center justify-center rounded-full ${GLASS}`}>
            <Glyph name="chevronLeft" size={17} weight={2.4} />
          </span>
          <span className="text-[17px] font-semibold">{c.title}</span>
          <span className={`flex h-11 items-center rounded-full px-3.5 text-[17px] ${GLASS}`} style={{ color: ACCENT_ON_GLASS }}>{c.edit}</span>
        </div>
        <div className="px-4 pt-2">
          <div className="flex min-h-[52px] items-center justify-between rounded-[22px] bg-white px-5 text-[17px]">
            {c.title}
            <Toggle />
          </div>
          <p className="mt-6 px-5 pb-2 text-[15px] font-semibold" style={{ color: SECONDARY }}>{c.terms}</p>
          <div className="rounded-[22px] bg-white">
            {rows.map(([term, variants], index) => (
              <Fragment key={term}>
                {index > 0 && <div className="ml-5 h-px bg-[rgba(60,60,67,0.18)]" />}
                <div className="flex min-h-[60px] items-center gap-3 px-5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px]">{term}</span>
                    <span className="mt-0.5 block text-[12px]" style={{ color: SECONDARY }}>{c.replaces} {variants}</span>
                  </span>
                  <Toggle />
                </div>
              </Fragment>
            ))}
          </div>
          <p className="px-5 pb-5 pt-2 text-[13px] leading-snug" style={{ color: SECONDARY }}>{c.footer}</p>
          <div className="flex min-h-[52px] items-center gap-2 rounded-[22px] bg-white px-5 text-[17px]" style={{ color: ACCENT_ON_WHITE }}>
            <Glyph name="plus" size={18} weight={2} />
            {c.add}
          </div>
        </div>
      </div>
    </Phone>
  );
}

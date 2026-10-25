"use client";

import { useSyncExternalStore } from "react";
import Phone from "./Phone";
import { Glyph, SYSTEM_FONT } from "./glyphs";
import { GLASS, SECONDARY } from "./ios";

/**
 * Still of dictus-ios `HistoryScene` at its still moment (5.5 s of 10,
 * HistorySceneScript.swift 53): the search is open, the query typed, and the
 * three cards that contain it are listed, drawn as the app's `HistoryCard`
 * (HistoryView.swift 336-383). The cursor blinks off at that instant.
 *
 * The app dates its cards from today (today 20:42, 8 and 14 days ago). The
 * page does the same once it runs in the browser; the server markup uses a
 * fixed day, so both renders match before that.
 */
const copy = {
  fr: {
    query: "dentiste",
    cards: [
      "Penser à rappeler le dentiste pour décaler le rendez-vous de jeudi.",
      "Liste de courses : pharmacie, dentiste, pressing, et les courses pour le week-end.",
      "Le dentiste a dit de revenir dans six mois pour un contrôle.",
    ],
  },
  en: {
    query: "dentist",
    cards: [
      "Remember to call the dentist to move Thursday’s appointment.",
      "Shopping list: pharmacy, dentist, dry cleaner, and the groceries for the weekend.",
      "The dentist said to come back in six months for a check-up.",
    ],
  },
} as const;

/** Days before today and length in seconds of each card (HistoryScene.swift 201-229). */
const CARDS = [{ daysAgo: 0, seconds: 9 }, { daysAgo: 8, seconds: 8 }, { daysAgo: 14, seconds: 6 }];
/** The day the server markup uses: the date of the dictus-ios commit read. */
const FIXED_DAY = "2026-10-25";
const noSubscription = () => () => {};
const localDay = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

function cardDate(today: Date, daysAgo: number, locale: "fr" | "en") {
  const tag = locale === "fr" ? "fr-FR" : "en-US";
  if (daysAgo === 0) {
    const time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 42);
    return new Intl.DateTimeFormat(tag, { timeStyle: "short" }).format(time);
  }
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo, 12);
  const sameYear = day.getFullYear() === today.getFullYear();
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) }).format(day);
}

export default function HistoryStill({ locale }: { locale: "fr" | "en" }) {
  const c = copy[locale];
  // Today's date in the browser, the fixed day on the server and at hydration.
  const [year, month, date] = useSyncExternalStore(noSubscription, localDay, () => FIXED_DAY).split("-").map(Number);
  const today = new Date(year, month - 1, date);

  return (
    <Phone end="top" height={560} screen="#F2F2F7">
      <div className="relative h-full bg-[#F2F2F7] text-black" style={SYSTEM_FONT}>
        <div className="flex justify-center pt-2">
          <span className="h-[5px] w-9 rounded-full bg-black/20" />
        </div>
        <div className="flex flex-col gap-3 px-4 pt-3">
          {CARDS.map(({ daysAgo, seconds }, index) => (
            <div key={daysAgo} className={`flex flex-col gap-2 rounded-2xl p-4 ${GLASS}`}>
              <p className="line-clamp-2 text-[17px] leading-snug">{c.cards[index]}</p>
              <p className="flex gap-1.5 text-[12px]" style={{ color: SECONDARY }}>
                <span>{cardDate(today, daysAgo, locale)}</span>·<span>{locale.toUpperCase()}</span>·<span>{seconds}s</span>
              </p>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-[488px] flex items-center gap-2.5 px-4 py-3">
          <span className={`flex h-12 flex-1 items-center gap-2 rounded-full px-4 ${GLASS}`}>
            <Glyph name="search" size={17} weight={2} className="shrink-0 text-[rgba(60,60,67,0.6)]" />
            <span className="flex-1 text-[17px]">{c.query}</span>
            <Glyph name="xmarkCircle" size={17} weight={1.8} className="shrink-0 text-[rgba(60,60,67,0.6)]" />
          </span>
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${GLASS}`}>
            <Glyph name="xmark" size={17} weight={2.4} />
          </span>
        </div>
      </div>
    </Phone>
  );
}

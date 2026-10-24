/**
 * Greetings shown in the Languages section, one per language, in the v4b
 * order. Every language is one Dictus transcribes: all of them are in the
 * Whisper set of dictus-ios `ModelLanguageSupport.whisperTierGroups`.
 *
 * - `lang`: BCP 47 code set on the word for screen readers and shaping.
 * - `tone`: 0 ink, 1 blue (largest), 2 muted (smallest), as in v4b.
 * - `system`: the word needs glyphs outside the DM Sans latin subset, so it
 *   is set entirely in the system font instead of mixing two fonts.
 * - `rtl`: right-to-left script.
 */
export type GreetingTone = 0 | 1 | 2;

export interface Greeting {
  word: string;
  lang: string;
  tone: GreetingTone;
  system?: boolean;
  rtl?: boolean;
}

export const greetingRows: Greeting[][] = [
  [
    { word: "Bonjour", lang: "fr", tone: 1 },
    { word: "Hello", lang: "en", tone: 0 },
    { word: "Hola", lang: "es", tone: 2 },
    { word: "Ciao", lang: "it", tone: 0 },
    { word: "Hallo", lang: "de", tone: 1 },
    { word: "Olá", lang: "pt", tone: 2 },
  ],
  [
    { word: "Hej", lang: "sv", tone: 2 },
    { word: "Cześć", lang: "pl", tone: 1, system: true },
    { word: "Привет", lang: "ru", tone: 0, system: true },
    { word: "Ahoj", lang: "cs", tone: 1 },
    { word: "Γεια σου", lang: "el", tone: 2, system: true },
    { word: "Szia", lang: "hu", tone: 0 },
  ],
  [
    { word: "Salut", lang: "ro", tone: 0 },
    { word: "Привіт", lang: "uk", tone: 2, system: true },
    { word: "नमस्ते", lang: "hi", tone: 1, system: true },
    { word: "Labas", lang: "lt", tone: 0 },
    { word: "こんにちは", lang: "ja", tone: 2, system: true },
    { word: "Hei", lang: "fi", tone: 1 },
  ],
  [
    { word: "Merhaba", lang: "tr", tone: 1 },
    { word: "안녕하세요", lang: "ko", tone: 0, system: true },
    { word: "สวัสดี", lang: "th", tone: 2, system: true },
    { word: "مرحبا", lang: "ar", tone: 1, system: true, rtl: true },
    { word: "Hoi", lang: "nl", tone: 0 },
    { word: "Moien", lang: "lb", tone: 2 },
  ],
];

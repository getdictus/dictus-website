export type Locale = "fr" | "en";

export interface VideoContent {
  messages: {
    contactName: string;
    existingMessages: Array<{ from: "contact" | "user"; text: string }>;
    dictatedPhrase: string;
  };
  notes: {
    title: string;
    existingText: string;
    dictatedText: string;
  };
  captions: {
    recording: string;
    transcribing: string;
    inserted: string;
  };
  tagline: string;
}

export const CONTENT: Record<Locale, VideoContent> = {
  fr: {
    messages: {
      contactName: "Sophie",
      existingMessages: [
        { from: "contact", text: "On fait quoi ce soir ?" },
        { from: "user", text: "Bonne question, laisse-moi reflechir" },
        { from: "contact", text: "Ok dis-moi !" },
      ],
      dictatedPhrase: "On se retrouve a 19h au restaurant ce soir ?",
    },
    notes: {
      title: "Liste de courses",
      existingText: "",
      dictatedText:
        "Acheter du pain, des oeufs et du fromage pour ce soir. Penser aussi a prendre du lait et des cereales pour demain matin.",
    },
    captions: {
      recording: "Enregistrement",
      transcribing: "Transcription",
      inserted: "Insere",
    },
    tagline: "Votre voix, votre appareil. Rien ne sort.",
  },
  en: {
    messages: {
      contactName: "Sophie",
      existingMessages: [
        { from: "contact", text: "What are we doing tonight?" },
        { from: "user", text: "Good question, let me think" },
        { from: "contact", text: "Ok let me know!" },
      ],
      dictatedPhrase: "Let's meet at 7pm at the restaurant tonight?",
    },
    notes: {
      title: "Grocery list",
      existingText: "",
      dictatedText:
        "Buy bread, eggs and cheese for tonight. Also remember to get milk and cereal for tomorrow morning.",
    },
    captions: {
      recording: "Recording",
      transcribing: "Transcribing",
      inserted: "Inserted",
    },
    tagline: "Your voice, your device. Nothing leaves.",
  },
};

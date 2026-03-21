export type Locale = "fr" | "en";

export interface PromoContent {
  beat2: {
    headline: string;
  };
  beat3: {
    line1: string;
    line2: string;
    line3: string;
  };
  beat4: {
    features: Array<{
      label: string;
      icon: "wifi-off" | "code" | "chip";
    }>;
  };
  beat5: {
    tagline: string;
  };
}

export const PROMO_CONTENT: Record<Locale, PromoContent> = {
  fr: {
    beat2: {
      headline: "Votre voix.",
    },
    beat3: {
      line1: "Transcrite sur votre appareil.",
      line2: "Pas de serveur.",
      line3: "Pas de cloud.",
    },
    beat4: {
      features: [
        { label: "100% offline", icon: "wifi-off" },
        { label: "Open source", icon: "code" },
        { label: "On-device AI", icon: "chip" },
      ],
    },
    beat5: {
      tagline: "Pas de cloud. Juste votre voix.",
    },
  },
  en: {
    beat2: {
      headline: "Your voice.",
    },
    beat3: {
      line1: "Transcribed on your device.",
      line2: "No server.",
      line3: "No cloud.",
    },
    beat4: {
      features: [
        { label: "100% offline", icon: "wifi-off" },
        { label: "Open source", icon: "code" },
        { label: "On-device AI", icon: "chip" },
      ],
    },
    beat5: {
      tagline: "No cloud. Just your voice.",
    },
  },
};

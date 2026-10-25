import { setRequestLocale, getTranslations } from "next-intl/server";
import { getDesktopDownloads } from "@/lib/downloads";
import { ANDROID_RELEASE_URL } from "@/config/downloads";
import Hero from "@/components/Hero/Hero";
import Platforms from "@/components/Platforms/Platforms";
import Keyboard from "@/components/Keyboard/Keyboard";
import Features from "@/components/Features/Features";
import Comparison from "@/components/Comparison/Comparison";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import Languages from "@/components/Languages/Languages";
import Offline from "@/components/Offline/Offline";

import OpenSource from "@/components/OpenSource/OpenSource";
import Community from "@/components/Community/Community";
import Footer from "@/components/Footer/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Metadata");
  const downloads = await getDesktopDownloads();

  const desktopApp = {
    "@type": "SoftwareApplication",
    name: "Dictus Desktop",
    description: t("desktop_jsonld_description"),
    operatingSystem: "macOS, Windows, Linux",
    applicationCategory: "UtilitiesApplication",
    softwareVersion: downloads.version,
    codeRepository: "https://github.com/getdictus/dictus-desktop",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    author: {
      "@type": "Organization",
      name: "PIVI Solutions",
    },
  };

  const androidApp = {
    "@type": "SoftwareApplication",
    name: "Dictus Android",
    description: t("android_jsonld_description"),
    operatingSystem: "Android 10+",
    applicationCategory: "UtilitiesApplication",
    downloadUrl: ANDROID_RELEASE_URL,
    codeRepository: "https://github.com/getdictus/dictus-android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    author: {
      "@type": "Organization",
      name: "PIVI Solutions",
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [desktopApp, androidApp],
  };

  return (
    <>
      <Hero />
      <Keyboard />
      <Offline />
      <Platforms downloads={downloads} />
      <Features />
      <HowItWorks />
      <Comparison />
      <Languages />
      <OpenSource />
      <Community />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

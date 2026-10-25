import { setRequestLocale, getTranslations } from "next-intl/server";
import { getDesktopDownloads } from "@/lib/downloads";
import { ANDROID_RELEASE_URL } from "@/config/downloads";
import Hero from "@/components/Hero/Hero";
import Keyboard from "@/components/Keyboard/Keyboard";
import Languages from "@/components/Languages/Languages";
import Offline from "@/components/Offline/Offline";
import SmartModes from "@/components/SmartModes/SmartModes";
import Privacy from "@/components/Privacy/Privacy";
import FinalCta from "@/components/FinalCta/FinalCta";
import DesktopDownload from "@/components/FinalCta/DesktopDownload";
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
      <SmartModes />
      <Languages />
      <Privacy />
      <FinalCta />
      <DesktopDownload downloads={downloads} />
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

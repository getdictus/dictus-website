import { setRequestLocale, getTranslations } from "next-intl/server";
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import Comparison from "@/components/Comparison/Comparison";
import HowItWorks from "@/components/HowItWorks/HowItWorks";

import OpenSource from "@/components/OpenSource/OpenSource";
import Community from "@/components/Community/Community";
import Footer from "@/components/Footer/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Metadata");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "dictus",
    description: t("jsonld_description"),
    operatingSystem: "iOS 18+",
    applicationCategory: "UtilitiesApplication",
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

  return (
    <>
      <Hero />
      <ScrollReveal><Features /></ScrollReveal>
      <ScrollReveal><Comparison /></ScrollReveal>
      <ScrollReveal><HowItWorks /></ScrollReveal>
      <ScrollReveal><OpenSource /></ScrollReveal>
      <ScrollReveal><Community /></ScrollReveal>
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

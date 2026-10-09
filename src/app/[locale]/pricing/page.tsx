import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isSitePreview } from "@/config/preview";
import Footer from "@/components/Footer/Footer";
import Pricing from "@/components/Pricing/Pricing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isSitePreview) notFound();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return {
    title: t("meta_title"),
    description: t("description"),
    openGraph: {
      title: t("meta_title"), description: t("description"), url: `/${locale}/pricing`,
      locale: locale === "fr" ? "fr_FR" : "en_US", type: "website",
    },
    twitter: { card: "summary_large_image", title: t("meta_title"), description: t("description") },
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { fr: "/fr/pricing", en: "/en/pricing", "x-default": "/fr/pricing" },
    },
  };
}

export default async function PricingPage({ params }: Props) {
  if (!isSitePreview) notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Pricing />
      <Footer />
    </>
  );
}

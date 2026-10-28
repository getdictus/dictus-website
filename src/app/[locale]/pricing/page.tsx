import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isSitePreview } from "@/config/preview";
import { isPricingAvailable, isPricingPublic } from "@/config/pricing-release";
import { pageMetadata } from "@/lib/metadata";
import Footer from "@/components/Footer/Footer";
import Pricing from "@/components/Pricing/Pricing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isPricingAvailable) notFound();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return {
    ...pageMetadata({ locale, path: "/pricing", title: t("meta_title"), description: t("description") }),
    robots: { index: isPricingPublic && !isSitePreview, follow: isPricingPublic && !isSitePreview },
  };
}

export default async function PricingPage({ params }: Props) {
  if (!isPricingAvailable) notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Pricing />
      <Footer />
    </>
  );
}

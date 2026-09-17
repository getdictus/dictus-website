import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isSitePreview } from "@/config/preview";
import Footer from "@/components/Footer/Footer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isSitePreview) notFound();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return {
    title: t("meta_title"),
    description: t("description"),
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
  const t = await getTranslations("Pricing");

  return (
    <>
      <article className="mx-auto flex min-h-[80svh] max-w-3xl flex-col justify-center px-6 pt-44 pb-24 sm:pt-40 sm:pb-32">
        <h1 className="text-5xl font-extralight leading-[1.1] tracking-[-0.04em] sm:text-6xl">{t("title")}</h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-white-70">{t("description")}</p>
        <p className="mt-4 max-w-xl leading-relaxed text-white-70">{t("notice")}</p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/#desktop" className="inline-flex min-h-11 items-center text-[#2563eb] dark:text-accent-hi underline decoration-accent/30 underline-offset-4 hover:decoration-accent">{t("desktop_link")}</Link>
          <Link href="/" className="inline-flex min-h-11 items-center text-white-70 underline decoration-border-hi underline-offset-4 hover:text-text-primary">{t("home_link")}</Link>
        </div>
      </article>
      <Footer />
    </>
  );
}

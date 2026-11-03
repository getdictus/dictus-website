import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Footer from "@/components/Footer/Footer";
import { ogImage, ogLocale } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

/** No canonical, hreflang or og:url: a missing page must not point at the home page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = (await getTranslations({ locale, namespace: "NotFound" }))("message");
  return {
    title,
    description: null,
    robots: { index: false },
    alternates: null,
    openGraph: { title, siteName: "dictus", images: [ogImage], locale: ogLocale(locale), type: "website" },
    twitter: { card: "summary_large_image", title, images: [ogImage.url] },
  };
}

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <>
      <div className="flex min-h-[70svh] flex-col items-center justify-center bg-ink px-6 text-center">
        <h1 className="text-2xl font-light text-text-primary">404</h1>
        <p className="mt-2 text-sm text-white-70">{t("message")}</p>
      </div>
      <Footer />
    </>
  );
}

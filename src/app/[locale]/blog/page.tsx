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
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("meta_title"),
    description: t("description"),
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { fr: "/fr/blog", en: "/en/blog", "x-default": "/fr/blog" },
    },
  };
}

export default async function BlogPage({ params }: Props) {
  if (!isSitePreview) notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  return (
    <>
      <article className="mx-auto flex min-h-[80svh] max-w-3xl flex-col justify-center px-6 pt-44 pb-24 sm:pt-40 sm:pb-32">
        <p className="text-sm text-white-70">{t("status")}</p>
        <h1 className="mt-5 text-5xl font-extralight leading-[1.1] tracking-[-0.04em] sm:text-6xl">{t("title")}</h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-white-70">{t("description")}</p>
        <Link href="/" className="mt-8 inline-flex min-h-11 w-fit items-center text-[#2563eb] dark:text-accent-hi underline decoration-accent/30 underline-offset-4 hover:decoration-accent">{t("home_link")}</Link>
      </article>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { isSitePreview } from "@/config/preview";
import { SITE_URL } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { isBlogAvailable } from "@/config/blog";
import { isPricingAvailable } from "@/config/pricing-release";
import { getBlogArticles, getTranslationPaths } from "@/lib/blog";
import type { ArticleLocaleRoutes } from "@/components/Nav/LanguageToggle";
import Nav from "@/components/Nav/Nav";
import MotionProvider from "@/components/shared/MotionProvider";
import "../globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const title = t("title");
  const description = t("description");

  return {
    ...pageMetadata({ locale, path: "", title, description }),
    metadataBase: new URL(SITE_URL),
    applicationName: "dictus",
    robots: {
      index: !isSitePreview,
      follow: !isSitePreview,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  const articleRoutes: ArticleLocaleRoutes = {};
  if (isBlogAvailable) {
    for (const articleLocale of routing.locales) {
      for (const article of getBlogArticles(articleLocale, { preview: isSitePreview })) {
        const paths = getTranslationPaths(article.id, { preview: isSitePreview });
        articleRoutes[`/${articleLocale}/blog/${article.slug}`] = Object.fromEntries(
          Object.entries(paths).map(([language, path]) => [language, path.replace(/^\/(fr|en)(?=\/)/, "")]),
        );
      }
    }
  }

  return (
    // data-scroll-behavior: Next.js jumps instead of smooth-scrolling on a route
    // change, so a cross-route hash link lands before the pins measure the page.
    <html lang={locale} className={`${dmSans.variable} ${dmMono.variable}`} data-scroll-behavior="smooth">
      <body className="bg-ink font-sans text-[var(--theme-text-primary)] antialiased">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#2563eb] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
          >
            {tNav("skip_to_content")}
          </a>
          <Nav blogAvailable={isBlogAvailable} pricingAvailable={isPricingAvailable} articleRoutes={articleRoutes} />
          <MotionProvider>
            <main id="main-content">{children}</main>
          </MotionProvider>
        </NextIntlClientProvider>
        <Script
          src="https://api.preview.aiguilleuse.ai/balise.js?assistant=6f2da35d-7bf0-40b7-84e8-e7b33f990aac"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";

export const ogImage = { url: "/og-image.png", width: 1200, height: 630, alt: "dictus" };

export function ogLocale(locale: string) {
  return locale === "en" ? "en_US" : "fr_FR";
}

type PageMetadataInput = {
  locale: string;
  /** Path after the locale, e.g. "/donate"; "" for the home page. */
  path: string;
  title: string;
  description?: string;
};

/**
 * Title, description, canonical, hreflang, Open Graph and Twitter tags of a
 * page. A page's `openGraph` and `twitter` replace the layout's, so the shared
 * site name, locale, type and image are set again here.
 */
export function pageMetadata({ locale, path, title, description }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      siteName: "dictus",
      images: [ogImage],
      locale: ogLocale(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        fr: `/fr${path}`,
        en: `/en${path}`,
        "x-default": `/fr${path}`,
      },
    },
  };
}

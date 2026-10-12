import type { Metadata } from "next";
import { articlePath, getTranslationPaths, type LocalizedArticle } from "@/lib/blog";
import { isSitePreview } from "@/config/preview";

const origin = "https://getdictus.com";

export function absoluteBlogUrl(path: string) {
  return new URL(path, origin).toString();
}

export function articleMetadata(article: LocalizedArticle): Metadata {
  const translations = getTranslationPaths(article.id, { preview: isSitePreview });
  const languages = Object.fromEntries(
    Object.entries(translations).map(([locale, path]) => [locale, absoluteBlogUrl(path)]),
  );
  if (translations.fr) languages["x-default"] = absoluteBlogUrl(translations.fr);
  const url = absoluteBlogUrl(articlePath(article, article.locale));
  const image = { url: absoluteBlogUrl(article.image.src), width: article.image.width, height: article.image.height, alt: article.image.alt };

  return {
    title: article.seo.title,
    description: article.seo.description,
    authors: [{ name: article.author.name, url: article.author.url }],
    robots: { index: !isSitePreview && article.status === "published", follow: !isSitePreview && article.status === "published" },
    alternates: { canonical: url, languages },
    openGraph: {
      type: "article",
      title: article.social.title,
      description: article.social.description,
      url,
      siteName: "Dictus",
      locale: article.locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: Object.keys(translations).filter((locale) => locale !== article.locale).map((locale) => locale === "fr" ? "fr_FR" : "en_US"),
      authors: [article.author.url],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: article.social.title,
      description: article.social.description,
      images: [image],
    },
  };
}

export function articleJsonLd(article: LocalizedArticle) {
  const url = absoluteBlogUrl(articlePath(article, article.locale));
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: article.title,
    description: article.summary,
    inLanguage: article.locale,
    author: { "@type": "Person", name: article.author.name, url: article.author.url },
    publisher: { "@type": "Organization", name: "Dictus", url: origin },
    image: { "@type": "ImageObject", url: absoluteBlogUrl(article.image.src), width: article.image.width, height: article.image.height, caption: article.image.caption },
    dateCreated: article.createdAt,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    dateModified: article.updatedAt,
    articleSection: article.category,
    wordCount: article.wordCount,
    citation: article.sources.map((source) => source.href),
    isAccessibleForFree: true,
  }).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

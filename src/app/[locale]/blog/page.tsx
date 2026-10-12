import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isSitePreview } from "@/config/preview";
import { isBlogAvailable } from "@/config/blog";
import { getBlogArticles, type Locale } from "@/lib/blog";
import ArticleImage from "@/components/Blog/ArticleImage";
import ArticleList from "@/components/Blog/ArticleList";
import ArticleMeta from "@/components/Blog/ArticleMeta";
import { absoluteBlogUrl } from "@/components/Blog/metadata";
import styles from "@/components/Blog/Blog.module.css";
import Footer from "@/components/Footer/Footer";

type Props = { params: Promise<{ locale: string }> };

function blogLocale(value: string): Locale {
  if (value !== "fr" && value !== "en") notFound();
  return value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isBlogAvailable) notFound();
  const locale = blogLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Blog" });
  const title = t("meta_title");
  const description = t("description");
  const feature = getBlogArticles(locale, { preview: isSitePreview })[0];
  const image = feature ? { url: absoluteBlogUrl(feature.image.src), width: feature.image.width, height: feature.image.height, alt: feature.image.alt } : { url: absoluteBlogUrl("/og-image.png"), width: 1200, height: 630, alt: "Dictus" };

  return {
    title,
    description,
    robots: { index: !isSitePreview, follow: !isSitePreview },
    alternates: {
      canonical: absoluteBlogUrl(`/${locale}/blog`),
      languages: { fr: absoluteBlogUrl("/fr/blog"), en: absoluteBlogUrl("/en/blog"), "x-default": absoluteBlogUrl("/fr/blog") },
    },
    openGraph: { title, description, type: "website", url: absoluteBlogUrl(`/${locale}/blog`), siteName: "Dictus", locale: locale === "fr" ? "fr_FR" : "en_US", alternateLocale: [locale === "fr" ? "en_US" : "fr_FR"], images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogPage({ params }: Props) {
  if (!isBlogAvailable) notFound();
  const locale = blogLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Blog" });
  const [feature, ...articles] = getBlogArticles(locale, { preview: isSitePreview });

  return (
    <>
      <div className={styles.page}>
        <header className={styles.indexHeader}>
          <h1 className={styles.indexTitle}>{t("title")}</h1>
          <p className={styles.indexIntro}>{t("description")}</p>
          {isSitePreview && <p className={styles.previewNote}><strong>{t("preview_title")}</strong>{" "}{t("preview_description")}</p>}
        </header>
        {feature ? (
          <article className={styles.feature}>
            <ArticleImage article={feature} priority sizes="(max-width: 600px) calc(100vw - 92px), (max-width: 850px) 40vw, 436px" />
            <div>
              <p className={styles.category}>{feature.category}</p>
              <h2 className={styles.featureTitle}>
                <Link href={`/blog/${feature.slug}`} className={styles.titleLink}>{feature.title}</Link>
              </h2>
              <p className={styles.summary}>{feature.summary}</p>
              <ArticleMeta article={feature} />
              <Link href={`/blog/${feature.slug}`} className={styles.readLink}>{feature.status === "draft" ? t("read_draft") : t("read_article")}</Link>
            </div>
          </article>
        ) : <p className={styles.empty}>{t("empty")}</p>}
        {articles.length > 0 && (
          <section className={styles.secondary} aria-labelledby="more-articles">
            <h2 id="more-articles" className={styles.sectionTitle}>{t("more_articles")}</h2>
            <ArticleList articles={articles} />
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}

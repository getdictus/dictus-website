import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isSitePreview } from "@/config/preview";
import { isBlogAvailable } from "@/config/blog";
import { getBlogArticle, getBlogArticleById, getBlogArticles, type Locale, type LocalizedArticle } from "@/lib/blog";
import ArticleImage from "@/components/Blog/ArticleImage";
import ArticleList from "@/components/Blog/ArticleList";
import ArticleMeta from "@/components/Blog/ArticleMeta";
import { articleMetadata, articleJsonLd } from "@/components/Blog/metadata";
import styles from "@/components/Blog/Blog.module.css";
import Footer from "@/components/Footer/Footer";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

function blogLocale(value: string): Locale {
  if (value !== "fr" && value !== "en") notFound();
  return value;
}

function localizedHref(href: string, locale: Locale) {
  if (!href.startsWith("/")) return href;
  const path = href
    .replace(/^\/(?:fr|en)(?=\/|#|\?|$)/, "")
    .replace(/^\/(?=[#?]|$)/, "");
  return `/${locale}${path}`;
}

async function resolveArticle(params: Props["params"]) {
  if (!isBlogAvailable) notFound();
  const { locale: value, slug } = await params;
  const locale = blogLocale(value);
  const article = getBlogArticle(locale, slug, { preview: isSitePreview });
  if (!article) notFound();
  return article;
}

export function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isBlogAvailable) return [];
  const locale = blogLocale(params.locale);
  return getBlogArticles(locale, { preview: isSitePreview }).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return articleMetadata(await resolveArticle(params));
}

export default async function BlogArticlePage({ params }: Props) {
  const article = await resolveArticle(params);
  const { locale } = article;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Blog" });
  const showToc = article.sections.length >= 3 && article.readingMinutes >= 3;
  const related = article.relatedIds
    .map((id) => getBlogArticleById(locale, id, { preview: isSitePreview }))
    .filter((item): item is LocalizedArticle => !!item && item.id !== article.id);

  return (
    <>
      <article className={styles.page}>
        <Link href="/blog" className={styles.backLink}>{t("back_to_blog")}</Link>
        <header className={styles.articleHeader}>
          <p className={styles.category}>{article.category}</p>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <p className={styles.articleIntro}>{article.intro}</p>
          <div className={styles.byline}>
            <a href={article.author.url} rel="author" className={styles.authorLink}>{t("by_author", { author: article.author.name })}</a>
            <ArticleMeta article={article} full />
          </div>
          {article.status === "draft" && <p className={styles.previewNote}><strong>{t("draft_title")}</strong>{" "}{t("draft_description")}</p>}
        </header>
        <ArticleImage article={article} priority caption sizes={article.image.height > article.image.width ? "240px" : "(max-width: 600px) calc(100vw - 76px), 680px"} />
        <div className={styles.readingLayout} data-toc={showToc}>
          {showToc && (
            <nav className={styles.toc} aria-labelledby="article-toc">
              <h2 id="article-toc" className={styles.tocTitle}>{t("contents")}</h2>
              <ol>
                {article.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}
              </ol>
            </nav>
          )}
          <div className={styles.prose}>
            {article.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id} tabIndex={-1}>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {!!section.bullets?.length && <ul>{section.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}
              </section>
            ))}
            {article.sources.length > 0 && (
              <section className={styles.sources} aria-labelledby="article-sources">
                <h2 id="article-sources">{t("sources")}</h2>
                <ul>{article.sources.map((source) => <li key={source.href}><a href={localizedHref(source.href, locale)} className={styles.sourceLink}>{source.label}</a></li>)}</ul>
              </section>
            )}
            <aside className={styles.cta} aria-label={article.cta.label}>
              <p>{article.cta.description}</p>
              <NextLink href={localizedHref(article.cta.href, locale)} className={styles.ctaLink}>{article.cta.label}</NextLink>
            </aside>
          </div>
        </div>
        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-articles">
            <h2 id="related-articles" className={styles.sectionTitle}>{t("related_articles")}</h2>
            <ArticleList articles={related} />
          </section>
        )}
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(article) }} />
      <Footer />
    </>
  );
}

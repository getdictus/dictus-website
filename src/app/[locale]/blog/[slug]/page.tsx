import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isSitePreview } from "@/config/preview";
import { isBlogAvailable } from "@/config/blog";
import { getBlogArticle, getBlogArticleById, getBlogArticles, type Locale, type LocalizedArticle } from "@/lib/blog";
import ArticleImage from "@/components/Blog/ArticleImage";
import ArticleList, { blogEyebrow } from "@/components/Blog/ArticleList";
import ArticleMeta from "@/components/Blog/ArticleMeta";
import { articleMetadata, articleJsonLd } from "@/components/Blog/metadata";
import styles from "@/components/Blog/Blog.module.css";
import Footer from "@/components/Footer/Footer";
import Section from "@/components/shared/Section";
import { dmSansDisplay } from "@/components/Hero/fonts";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

const container = "mx-auto max-w-[1120px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]";

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
      <article>
        <Section
          tone="white"
          aria-labelledby="article-title"
          className={`pt-[clamp(112px,11vw,152px)] ${related.length > 0 ? "pb-[clamp(104px,11vw,160px)]" : "pb-[clamp(72px,8vw,120px)]"}`}
        >
          <div className={container}>
            <Link href="/blog" className="button-lift inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-grey px-4 text-[14px] font-medium">
              <span aria-hidden="true">←</span>{t("back_to_blog")}
            </Link>
            <header className="mt-[clamp(28px,3.5vw,44px)] max-w-[880px]">
              <p className={blogEyebrow}>{article.category}</p>
              <h1
                id="article-title"
                className={`${dmSansDisplay.className} mt-4 text-[clamp(38px,5.2vw,66px)] font-light leading-[1.05] tracking-[-0.045em] [text-wrap:balance]`}
              >
                {article.title}
              </h1>
              <p className="mt-6 max-w-[760px] text-[clamp(18px,1.7vw,22px)] leading-[1.5] text-brand-body [text-wrap:pretty]">{article.intro}</p>
              <div className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[14px]">
                <a href={article.author.url} rel="author" className="font-medium underline decoration-brand-rule-strong underline-offset-4">
                  {t("by_author", { author: article.author.name })}
                </a>
                <ArticleMeta article={article} full />
              </div>
              {article.status === "draft" && (
                <p className="mt-6 max-w-[680px] rounded-[16px] bg-mist px-4 py-3 text-[14px] leading-[1.55] text-brand-ink">
                  <strong className="font-semibold">{t("draft_title")}</strong>{" "}{t("draft_description")}
                </p>
              )}
            </header>

            <div className="mt-[clamp(36px,5vw,56px)]">
              <ArticleImage
                article={article}
                variant="cover"
                ground="grey"
                priority
                caption
                sizes={article.image.height > article.image.width ? "280px" : "(max-width: 760px) calc(100vw - 80px), 720px"}
              />
            </div>

            <div
              className={`mt-[clamp(48px,6vw,80px)] ${showToc ? "grid items-start gap-[clamp(36px,5vw,72px)] min-[900px]:grid-cols-[240px_minmax(0,1fr)]" : ""}`}
              data-toc={showToc}
            >
              {showToc && (
                <nav
                  className={`${styles.toc} rounded-[20px] bg-brand-grey px-5 pb-3 pt-5 min-[900px]:sticky min-[900px]:top-[116px]`}
                  aria-labelledby="article-toc"
                >
                  <h2 id="article-toc" className="mb-2 font-mono text-[12px] uppercase tracking-[0.1em] text-brand-muted">{t("contents")}</h2>
                  <ol>
                    {article.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}
                  </ol>
                </nav>
              )}
              <div className={`${styles.prose} ${showToc ? "" : "mx-auto"}`}>
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
                <aside className="mt-[clamp(40px,5vw,56px)] rounded-[28px] bg-brand-blue p-[clamp(24px,3vw,40px)] text-brand-ink" aria-label={article.cta.label}>
                  <p className="m-0 text-[clamp(18px,1.6vw,21px)] font-normal leading-[1.45] text-brand-ink">{article.cta.description}</p>
                  <NextLink
                    href={localizedHref(article.cta.href, locale)}
                    className="button-lift mt-6 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-brand-white px-5 text-[16px] font-semibold text-accent-strong no-underline"
                  >
                    {article.cta.label}<span aria-hidden="true">→</span>
                  </NextLink>
                </aside>
              </div>
            </div>
          </div>
        </Section>

        {related.length > 0 && (
          <Section tone="grey" overlapTop aria-labelledby="related-articles" className="pb-[clamp(80px,9vw,132px)] pt-[clamp(64px,7vw,104px)]">
            <div className={container}>
              <h2 id="related-articles" className="text-[clamp(32px,3.6vw,52px)] font-light leading-[1.04] tracking-[-0.035em] [text-wrap:balance]">
                {t("related_articles")}
              </h2>
              <div className="mt-[clamp(28px,3.5vw,44px)]"><ArticleList articles={related} /></div>
            </div>
          </Section>
        )}
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(article) }} />
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isSitePreview } from "@/config/preview";
import { isBlogAvailable } from "@/config/blog";
import { getBlogArticles, type Locale } from "@/lib/blog";
import ArticleImage from "@/components/Blog/ArticleImage";
import ArticleList, { blogEyebrow } from "@/components/Blog/ArticleList";
import ArticleMeta from "@/components/Blog/ArticleMeta";
import { absoluteBlogUrl } from "@/components/Blog/metadata";
import Section from "@/components/shared/Section";
import { dmSansDisplay } from "@/components/Hero/fonts";
import Footer from "@/components/Footer/Footer";

type Props = { params: Promise<{ locale: string }> };

const container = "mx-auto max-w-[1120px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]";

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
      <Section tone="white" aria-labelledby="blog-title" className="pb-[clamp(96px,10vw,148px)] pt-[clamp(120px,12vw,168px)]">
        <div className={container}>
          <header className="mx-auto max-w-[760px] text-center">
            <p className={blogEyebrow}>{t("eyebrow")}</p>
            <h1
              id="blog-title"
              className={`${dmSansDisplay.className} mt-4 text-[clamp(44px,6vw,72px)] font-light leading-[1.04] tracking-[-0.045em] [text-wrap:balance]`}
            >
              {t("title_a")}
              <span className="block text-brand-blue">{t("title_b")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[580px] text-[clamp(17px,1.4vw,20px)] leading-[1.45] text-brand-body [text-wrap:pretty]">
              {t("description")}
            </p>
            {isSitePreview && (
              <p className="mx-auto mt-6 max-w-[600px] rounded-[16px] bg-mist px-4 py-3 text-[14px] leading-[1.55] text-brand-ink">
                <strong className="font-semibold">{t("preview_title")}</strong>{" "}{t("preview_description")}
              </p>
            )}
          </header>

          {feature ? (
            <article className="mt-[clamp(40px,5vw,64px)] grid items-center gap-[clamp(24px,4vw,56px)] rounded-[28px] bg-brand-grey p-[clamp(12px,1.6vw,20px)] min-[860px]:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
              <ArticleImage article={feature} variant="feature" ground="white" priority sizes="(max-width: 860px) calc(100vw - 64px), 560px" />
              <div className="px-[clamp(8px,1.4vw,16px)] pb-[clamp(12px,2vw,24px)] min-[860px]:py-6 min-[860px]:pr-[clamp(16px,3vw,40px)]">
                <p className={blogEyebrow}>{feature.category}</p>
                <h2 className="mt-4 text-[clamp(30px,3.2vw,42px)] font-light leading-[1.08] tracking-[-0.04em] [text-wrap:balance]">
                  <Link href={`/blog/${feature.slug}`} className="decoration-1 underline-offset-[6px] [@media(hover:hover)_and_(pointer:fine)]:hover:underline">
                    {feature.title}
                  </Link>
                </h2>
                <p className="mt-4 text-[17px] leading-[1.55] text-brand-body [text-wrap:pretty]">{feature.summary}</p>
                <div className="mt-5"><ArticleMeta article={feature} /></div>
                <Link
                  href={`/blog/${feature.slug}`}
                  className="button-lift button-blue mt-7 inline-flex min-h-12 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold"
                >
                  {feature.status === "draft" ? t("read_draft") : t("read_article")}<span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ) : <p className="mt-16 text-center text-[18px] text-brand-body">{t("empty")}</p>}
        </div>
      </Section>

      {articles.length > 0 && (
        <Section tone="grey" overlapTop aria-labelledby="more-articles" className="pb-[clamp(80px,9vw,132px)] pt-[clamp(64px,7vw,104px)]">
          <div className={container}>
            <h2 id="more-articles" className="text-[clamp(32px,3.6vw,52px)] font-light leading-[1.04] tracking-[-0.035em] [text-wrap:balance]">
              {t("more_articles")}
            </h2>
            <div className="mt-[clamp(28px,3.5vw,44px)]"><ArticleList articles={articles} /></div>
          </div>
        </Section>
      )}
      <Footer />
    </>
  );
}

import records from '@/content/blog/articles.json';
import { selectArticles, translationPaths, sitemapEntries, validateArticles, articlePath as pathForArticle } from './blog-core.mjs';

export type Locale = 'fr' | 'en';
export type ArticleContent = {
  slug: string; title: string; summary: string; intro: string; category: string; tags: string[];
  seo: { title: string; description: string };
  social: { title: string; description: string };
  image: { src: string; width: number; height: number; alt: string; caption: string };
  cta: { label: string; description: string; href: string };
  sections: { id: string; heading: string; paragraphs: string[]; bullets?: string[] }[];
  sources: { label: string; href: string }[];
};
export type Article = {
  id: string; sourceLocale: 'fr'; status: 'draft' | 'published';
  author: { name: string; url: string }; createdAt: string; updatedAt: string; publishedAt?: string;
  relatedIds: string[]; locales: Partial<Record<Locale, ArticleContent>>;
  review: Partial<Record<Locale, { contentHash: string; reviewedBy: string; reviewedAt: string }>>;
  translation?: { sourceHash: string; generatedAt: string; method: string };
};
export type LocalizedArticle = ArticleContent & Pick<Article, 'id' | 'status' | 'author' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'relatedIds'> & { locale: Locale; readingMinutes: number; wordCount: number };
export type BlogOptions = { preview?: boolean };
const articles = validateArticles(records as unknown as Article[]);
export function getBlogArticles(locale: Locale, options: BlogOptions = {}): LocalizedArticle[] { return selectArticles(articles, locale, options) as LocalizedArticle[]; }
export function getBlogArticle(locale: Locale, slug: string, options: BlogOptions = {}): LocalizedArticle | undefined { return getBlogArticles(locale, options).find((article) => article.slug === slug); }
export function getBlogArticleById(locale: Locale, id: string, options: BlogOptions = {}): LocalizedArticle | undefined { return getBlogArticles(locale, options).find((article) => article.id === id); }
export function articlePath(article: Pick<ArticleContent, 'slug'>, locale: Locale): string { return pathForArticle(article, locale); }
export function getTranslationPaths(id: string, options: BlogOptions = {}): Partial<Record<Locale, string>> { return translationPaths(articles, id, options); }
export function getBlogSitemapEntries(baseUrl: string): { url: string; lastModified: string; alternates: { languages: Record<string, string> } }[] { return sitemapEntries(articles, baseUrl); }

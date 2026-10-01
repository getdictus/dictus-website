import { createHash } from 'node:crypto';

export const BLOG_LOCALES = ['fr', 'en'];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};
const safeHref = (value) => nonempty(value) && !/[\\\u0000-\u001f]/.test(value) && (/^https:\/\/[^\s]+$/.test(value) || /^\/(?!\/)[^\s]*$/.test(value));
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
export function contentHash(article, locale = 'fr') {
  return createHash('sha256').update(JSON.stringify(canonical({ id: article.id, sourceLocale: article.sourceLocale, author: article.author, relatedIds: article.relatedIds, createdAt: article.createdAt, updatedAt: article.updatedAt, content: article.locales?.[locale] }))).digest('hex');
}
export function contentErrors(content, prefix = 'content') {
  const errors = [];
  const required = (value, field) => { if (!nonempty(value)) errors.push(`${prefix}.${field} must not be blank`); };
  if (!content || typeof content !== 'object' || Array.isArray(content)) return [`${prefix} is missing`];
  for (const field of ['slug', 'title', 'summary', 'intro', 'category']) required(content[field], field);
  if (!slugPattern.test(content.slug ?? '')) errors.push(`${prefix}.slug must be a lowercase URL slug`);
  if (!Array.isArray(content.tags) || content.tags.some((tag) => !nonempty(tag))) errors.push(`${prefix}.tags must be an array of nonblank labels`);
  for (const group of ['seo', 'social']) for (const field of ['title', 'description']) required(content[group]?.[field], `${group}.${field}`);
  for (const field of ['src', 'alt', 'caption']) required(content.image?.[field], `image.${field}`);
  if (!/^\/images\/[a-zA-Z0-9/_.-]+$/.test(content.image?.src ?? '') || content.image?.src.split('/').some((part) => part === '..' || part === '.')) errors.push(`${prefix}.image.src must be a local image`);
  for (const dimension of ['width', 'height']) if (!Number.isInteger(content.image?.[dimension]) || content.image[dimension] < 1) errors.push(`${prefix}.image.${dimension} must be a positive integer`);
  for (const field of ['label', 'description', 'href']) required(content.cta?.[field], `cta.${field}`);
  if (!safeHref(content.cta?.href)) errors.push(`${prefix}.cta.href is not a safe URL`);
  if (!Array.isArray(content.sections) || content.sections.length === 0) errors.push(`${prefix}.sections must contain body content`);
  const sectionIds = new Set();
  for (const [index, section] of (Array.isArray(content.sections) ? content.sections : []).entries()) {
    const label = `sections[${index}]`;
    if (!section || typeof section !== 'object') { errors.push(`${prefix}.${label} is invalid`); continue; }
    required(section.heading, `${label}.heading`);
    if (!slugPattern.test(section.id ?? '') || sectionIds.has(section.id)) errors.push(`${prefix}.${label}.id must be unique and URL safe`);
    sectionIds.add(section.id);
    if (!Array.isArray(section.paragraphs) || section.paragraphs.length === 0 || section.paragraphs.some((p) => !nonempty(p))) errors.push(`${prefix}.${label}.paragraphs must contain nonblank body text`);
    if (section.bullets !== undefined && (!Array.isArray(section.bullets) || section.bullets.some((p) => !nonempty(p)))) errors.push(`${prefix}.${label}.bullets contains invalid text`);
  }
  if (!Array.isArray(content.sources) || content.sources.length === 0 || content.sources.some((source) => !nonempty(source?.label) || !safeHref(source?.href))) errors.push(`${prefix}.sources must contain labeled safe URLs`);
  return errors;
}
export function articleErrors(article, { requirePublished = false } = {}) {
  const errors = [];
  if (!article || typeof article !== 'object') return ['Article must be an object'];
  const label = article.id ?? 'unknown';
  const error = (message) => errors.push(`${label}: ${message}`);
  if (!slugPattern.test(article.id ?? '')) error('id must be stable and URL safe');
  if (article.sourceLocale !== 'fr') error('sourceLocale must be fr');
  if (!['draft', 'published'].includes(article.status)) error('status must be draft or published');
  if (!nonempty(article.author?.name) || !safeHref(article.author?.url)) error('a real author and profile URL are required');
  for (const field of ['createdAt', 'updatedAt']) if (!validDate(article[field])) error(`${field} must be a real ISO date`);
  if (article.updatedAt < article.createdAt) error('updatedAt cannot precede createdAt');
  if (!Array.isArray(article.relatedIds) || article.relatedIds.some((id) => !slugPattern.test(id))) error('relatedIds must be stable article identifiers');
  if (!article.locales || typeof article.locales !== 'object' || Array.isArray(article.locales)) error('locales must be an object');
  if (article.status === 'published' || requirePublished) {
    if (!validDate(article.publishedAt)) error('publishedAt must be a real ISO date');
    if (article.publishedAt < article.createdAt || article.updatedAt < article.publishedAt) error('publication dates are inconsistent');
    for (const locale of BLOG_LOCALES) {
      errors.push(...contentErrors(article.locales?.[locale], `${label}.${locale}`));
      const review = article.review?.[locale];
      if (!review || !nonempty(review.reviewedBy) || !validDate(review.reviewedAt)) error(`${locale} requires an explicit editorial review`);
      if (review?.contentHash !== contentHash(article, locale)) error(`${locale} review is stale; review the current content`);
    }
    if (article.translation?.sourceHash !== contentHash(article, 'fr')) error('English translation is missing or stale after a source change');
    if (!validDate(article.translation?.generatedAt) || !nonempty(article.translation?.method)) error('translation provenance is required');
    if (article.locales?.fr && article.locales?.en) errors.push(...translationErrors(article.locales.fr, article.locales.en).map((message) => `${label}: ${message}`));
  }
  return errors;
}
export function validateArticles(articles) {
  if (!Array.isArray(articles)) throw new Error('Blog registry must be an array');
  const errors = articles.flatMap((article) => articleErrors(article));
  const ids = new Set();
  const slugs = new Set();
  for (const article of articles) {
    if (ids.has(article.id)) errors.push(`Duplicate article id: ${article.id}`);
    ids.add(article.id);
    for (const locale of BLOG_LOCALES) {
      const slug = article.locales?.[locale]?.slug;
      if (!slug) continue;
      if (slugs.has(`${locale}:${slug}`)) errors.push(`Duplicate ${locale} slug: ${slug}`);
      slugs.add(`${locale}:${slug}`);
    }
  }
  for (const article of articles) for (const id of article.relatedIds ?? []) if (!ids.has(id) || id === article.id) errors.push(`${article.id}: invalid related article ${id}`);
  if (errors.length) throw new Error(`Blog validation failed:\n- ${errors.join('\n- ')}`);
  return articles;
}
function translatableText(content) {
  return [content.title, content.summary, content.intro, content.category, ...(content.tags ?? []), content.seo?.title, content.seo?.description, content.social?.title, content.social?.description, content.image?.alt, content.image?.caption, content.cta?.label, content.cta?.description, ...(content.sections ?? []).flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])]), ...(content.sources ?? []).map((s) => s.label)].join(' ');
}
const normalizedLink = (href) => href.replace(/^\/(fr|en)(?=\/|#|$)/, '/LOCALE');
export function translationErrors(source, target) {
  const errors = contentErrors(target, 'en');
  if (contentErrors(source).length || errors.length) return errors;
  if (JSON.stringify(source.sections.map((s) => s.id)) !== JSON.stringify(target.sections.map((s) => s.id))) errors.push('Translation must preserve section identifiers and order');
  if (JSON.stringify(source.sources.map((s) => normalizedLink(s.href))) !== JSON.stringify(target.sources.map((s) => normalizedLink(s.href)))) errors.push('Translation must preserve source URLs and order');
  if (normalizedLink(source.cta.href) !== normalizedLink(target.cta.href)) errors.push('Translation must preserve the CTA destination');
  const localizedImage = (path) => path.replace(/-(?:fr|en)(?=\.(?:jpg|png|webp|avif)$)/, '-LOCALE');
  if (localizedImage(source.image.src) !== localizedImage(target.image.src) || source.image.width !== target.image.width || source.image.height !== target.image.height) errors.push('Translation must preserve the real image and dimensions');
  const sourceText = translatableText(source);
  const targetText = translatableText(target);
  // Counts as well as values matter: a claim removed or duplicated needs attention.
  const tokens = (value) => (value.match(/\b\d+(?:[.,]\d+)*\b/g) ?? []).sort();
  if (JSON.stringify(tokens(sourceText)) !== JSON.stringify(tokens(targetText))) errors.push('Translation changed numeric claims');
  for (const product of ['Dictus Desktop', 'Dictus iOS', 'iOS', 'macOS', 'Windows', 'Linux', 'Android', 'Whisper Turbo']) {
    const count = (value) => value.split(product).length - 1;
    if (count(sourceText) !== count(targetText)) errors.push(`Translation changed product identifier: ${product}`);
  }
  return errors;
}
export function readingStats(content) {
  const body = [content.title, content.intro, ...content.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])])].join(' ');
  const wordCount = body.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return { wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount / 200)) };
}
export function selectArticles(articles, locale, { preview = false } = {}) {
  if (!BLOG_LOCALES.includes(locale)) return [];
  return articles.filter((article) => (article.status === 'published' || preview) && !contentErrors(article.locales?.[locale]).length && (article.status !== 'published' || !articleErrors(article).length)).map((article) => ({ ...article.locales[locale], id: article.id, locale, status: article.status, author: article.author, createdAt: article.createdAt, updatedAt: article.updatedAt, publishedAt: article.publishedAt, relatedIds: article.relatedIds, ...readingStats(article.locales[locale]) })).sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}
export function articlePath(article, locale) { return `/${locale}/blog/${article.slug}`; }
export function translationPaths(articles, id, options = {}) {
  return Object.fromEntries(BLOG_LOCALES.flatMap((locale) => {
    const article = selectArticles(articles, locale, options).find((item) => item.id === id);
    return article ? [[locale, articlePath(article, locale)]] : [];
  }));
}
export function sitemapEntries(articles, baseUrl) {
  const published = selectArticles(articles, 'fr');
  if (!published.length) return [];
  const lastModified = published.map((article) => article.updatedAt).sort().at(-1);
  const indexLanguages = Object.fromEntries(BLOG_LOCALES.map((locale) => [locale, new URL(`/${locale}/blog`, baseUrl).href]));
  const indexes = BLOG_LOCALES.map((locale) => ({ url: indexLanguages[locale], lastModified, alternates: { languages: indexLanguages } }));
  return [...indexes, ...published.flatMap((article) => {
    const paths = translationPaths(articles, article.id);
    const languages = Object.fromEntries(Object.entries(paths).map(([locale, path]) => [locale, new URL(path, baseUrl).href]));
    return BLOG_LOCALES.map((locale) => ({ url: languages[locale], lastModified: article.updatedAt, alternates: { languages } }));
  })];
}

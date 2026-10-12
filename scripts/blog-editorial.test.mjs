import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { articleErrors, contentErrors, contentHash, readingStats, selectArticles, sitemapEntries, translationPaths, validateArticles } from '../src/lib/blog-core.mjs';
import { generateTranslation, main, newArticle, publishArticle, reviewArticle } from './blog-editorial.mjs';
const date = new Date().toISOString().slice(0, 10);
function content(locale) {
  return { slug: locale === 'fr' ? 'dictee-locale' : 'local-dictation', title: locale === 'fr' ? 'Dictus Desktop en local' : 'Dictus Desktop locally', summary: locale === 'fr' ? 'Une note complète.' : 'A complete note.', intro: locale === 'fr' ? 'La transcription reste locale.' : 'Transcription stays local.', category: locale === 'fr' ? 'Ordinateur' : 'Desktop', tags: [], seo: { title: 'Dictus', description: 'A useful note.' }, social: { title: 'Dictus', description: 'A useful note.' }, image: { src: '/images/products/desktop-general-fr.jpg', width: 680, height: 570, alt: 'An actual screen.', caption: 'Captured in 2026.' }, cta: { label: 'Discover', description: 'See the application.', href: `/${locale}#desktop` }, sections: [{ id: 'local', heading: locale === 'fr' ? 'La transcription' : 'Transcription', paragraphs: [locale === 'fr' ? 'Le traitement audio est local.' : 'Audio processing is local.'], bullets: [] }], sources: [{ label: 'Source', href: 'https://github.com/getdictus/dictus-desktop' }] };
}
function draft(id = 'example') {
  return { ...newArticle(id, date), locales: { fr: content('fr'), en: content('en') } };
}
async function ready(id = 'example') {
  let article = await generateTranslation(draft(id), async () => content('en'), date);
  article = reviewArticle(article, 'fr', 'Editor', date);
  article = reviewArticle(article, 'en', 'Translator', date);
  return article;
}
test('draft scaffolding is valid but incomplete drafts do not leak through public reads', () => {
  const article = newArticle('new-source', date);
  assert.equal(validateArticles([article]).length, 1);
  assert.deepEqual(selectArticles([article], 'fr'), []);
  assert.deepEqual(selectArticles([article], 'fr', { preview: true }), []);
  const completeFrench = { ...article, locales: { fr: content('fr') } };
  assert.equal(selectArticles([completeFrench], 'fr', { preview: true }).length, 1);
  assert.equal(selectArticles([completeFrench], 'en', { preview: true }).length, 0);
  assert.deepEqual(translationPaths([completeFrench], article.id, { preview: true }), { fr: '/fr/blog/dictee-locale' });
});
test('mocked CLI transport receives complete source and schema; generation clears both reviews and preserves stable English URL', async () => {
  const article = await ready();
  article.locales.en.slug = 'already-shared-url';
  let called = false;
  const next = await generateTranslation(article, async (prompt, schema) => {
    called = true;
    assert.match(prompt, /Translate every human-readable field/);
    assert.match(prompt, /La transcription reste locale/);
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(schema.required, Object.keys(content('en')));
    return JSON.stringify(content('en'));
  }, date);
  assert.ok(called);
  assert.equal(next.locales.en.slug, 'already-shared-url');
  assert.equal(next.status, 'draft');
  assert.deepEqual(next.review, {});
  assert.equal(next.translation.sourceHash, contentHash(next, 'fr'));
  assert.throws(() => publishArticle(next, date), /explicit editorial review/);
});
test('both reviewed complete versions publish together and changed source invalidates translation plus source review', async () => {
  const article = publishArticle(await ready(), date);
  assert.deepEqual(articleErrors(article), []);
  article.locales.fr.intro += ' Une correction produit.';
  assert.throws(() => validateArticles([article]), /English translation is missing or stale/);
  assert.throws(() => reviewArticle(article, 'en', 'Translator', date), /translation is stale/);
  assert.equal(selectArticles([article], 'en').length, 0);
  assert.deepEqual(sitemapEntries([article], 'https://getdictus.com'), []);
});
test('changes to translation, author, source image, source dates or links invalidate their relevant reviews', async () => {
  const article = publishArticle(await ready(), date);
  for (const change of [
    (a) => { a.locales.en.sections[0].paragraphs[0] += ' Changed.'; },
    (a) => { a.author.name = 'Another editor'; },
    (a) => { a.locales.fr.image.caption += ' Corrected.'; },
    (a) => { a.updatedAt = '2030-01-01'; },
    (a) => { a.locales.fr.sources[0].href += '/tree/main'; },
  ]) {
    const changed = structuredClone(article); change(changed);
    assert.throws(() => validateArticles([changed]), /review is stale/);
  }
});
test('missing, blank or malformed required fields block publication including SEO social alt captions CTA and body', async () => {
  const article = await ready();
  const edits = [
    (a) => { delete a.locales.en; },
    (a) => { a.locales.en.title = '  '; },
    (a) => { a.locales.en.seo.description = ''; },
    (a) => { a.locales.en.social.title = ''; },
    (a) => { a.locales.en.image.alt = ''; },
    (a) => { a.locales.en.image.caption = ''; },
    (a) => { a.locales.en.cta.description = ''; },
    (a) => { a.locales.en.sections = []; },
    (a) => { a.locales.en.sections[0].paragraphs = [' ']; },
    (a) => { a.locales.en.sections[0].bullets = [' ']; },
    (a) => { a.locales.en.sources = []; },
    (a) => { a.locales.en.tags = ['']; },
    (a) => { a.locales.en.cta.href = 'javascript:alert(1)'; },
    (a) => { a.locales.en.cta.href = '//untrusted.invalid'; },
    (a) => { a.locales.en.image.src = 'https://unverified.invalid/picture.jpg'; },
  ];
  for (const edit of edits) { const changed = structuredClone(article); edit(changed); assert.throws(() => publishArticle(changed, date)); }
});
test('generated translation cannot change numeric claims, products, source links, image identity or section identifiers', async () => {
  for (const edit of [
    (c) => { c.image.caption = 'Captured in 2027.'; },
    (c) => { c.title = 'Another application locally'; },
    (c) => { c.sources[0].href = 'https://example.com'; },
    (c) => { c.image.src = '/images/invented.jpg'; },
    (c) => { c.sections[0].id = 'changed'; },
  ]) {
    await assert.rejects(() => generateTranslation(draft(), async () => { const c = content('en'); edit(c); return c; }, date), /Translation rejected/);
  }
  await assert.rejects(() => generateTranslation(draft(), async () => { throw new Error('CLI unavailable'); }), /CLI unavailable/);
});
test('localized captures with equivalent paths and dimensions are accepted, unknown images are not substituted', async () => {
  const article = await generateTranslation(draft(), async () => ({ ...content('en'), image: { ...content('en').image, src: '/images/products/desktop-general-en.jpg' } }), date);
  assert.equal(article.locales.en.image.src, '/images/products/desktop-general-en.jpg');
});
test('stable ids connect localized slugs, duplicate per-locale slugs and broken relations are rejected', () => {
  const a = draft('first'); const b = draft('second');
  assert.throws(() => validateArticles([a, b]), /Duplicate fr slug/);
  b.locales.fr.slug = 'other-french'; b.locales.en.slug = 'other-english';
  assert.equal(validateArticles([a, b]).length, 2);
  a.relatedIds = ['missing']; assert.throws(() => validateArticles([a, b]), /invalid related article/);
  a.relatedIds = []; b.id = a.id; assert.throws(() => validateArticles([a, b]), /Duplicate article id/);
});
test('adding a fourth data-only article updates index, localized lookup and future sitemap with authored dates', async () => {
  const articles = [];
  for (const id of ['one', 'two', 'three', 'four']) {
    const a = draft(id); a.locales.fr.slug = `${id}-fr`; a.locales.en.slug = `${id}-en`;
    let translated = await generateTranslation(a, async () => ({ ...content('en'), slug: `${id}-en` }), date);
    translated = reviewArticle(reviewArticle(translated, 'fr', 'Editor', date), 'en', 'Translator', date);
    articles.push(publishArticle(translated, date));
  }
  assert.equal(selectArticles(articles, 'fr').length, 4);
  assert.equal(selectArticles(articles, 'en').length, 4);
  assert.deepEqual(translationPaths(articles, 'four'), { fr: '/fr/blog/four-fr', en: '/en/blog/four-en' });
  const sitemap = sitemapEntries(articles, 'https://getdictus.com');
  assert.equal(sitemap.length, 10);
  assert.ok(sitemap.every((entry) => entry.lastModified === date));
  assert.deepEqual(sitemap.at(-1).alternates.languages, { fr: 'https://getdictus.com/fr/blog/four-fr', en: 'https://getdictus.com/en/blog/four-en' });
  assert.equal(sitemap[0].url, 'https://getdictus.com/fr/blog');
});
test('real dates are checked without throwing RangeError and body determines computed reading time', () => {
  for (const value of ['2026-99-99', '2026-02-30', 'yesterday']) assert.match(articleErrors({ ...draft(), updatedAt: value }).join(' '), /real ISO date/);
  assert.equal(readingStats(content('fr')).readingMinutes, 1);
  const long = content('en'); long.sections[0].paragraphs = [Array(601).fill('word').join(' ')];
  assert.equal(readingStats(long).readingMinutes, 4);
  assert.equal(contentErrors(null).length, 1);
});
test('actual npm prebuild rejects an incomplete and then a stale published pair using isolated validation fixtures', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dictus-blog-build-test-'));
  const path = join(directory, 'articles.json');
  try {
    const article = publishArticle(await ready(), date);
    const incomplete = structuredClone(article); delete incomplete.locales.en;
    const stale = structuredClone(article); stale.locales.fr.title += ' corrected';
    for (const fixture of [incomplete, stale]) {
      await writeFile(path, JSON.stringify([fixture]));
      const result = spawnSync('npm', ['run', 'prebuild'], { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, BLOG_VALIDATION_FILE: path } });
      assert.notEqual(result.status, 0);
      assert.match(result.stdout + result.stderr, /Blog validation failed/);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('translation save rejects concurrent edits to its article and keeps unrelated concurrent article edits', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dictus-blog-concurrency-'));
  const path = join(directory, 'articles.json');
  try {
    const article = draft();
    await writeFile(path, JSON.stringify([article]));
    await assert.rejects(() => main(['translate', article.id], path, { transport: async () => {
      const edited = structuredClone(article); edited.locales.en.title = 'Concurrent edit';
      await writeFile(path, JSON.stringify([edited])); return content('en');
    } }), /Article changed during editing/);
    assert.equal(JSON.parse(await readFile(path, 'utf8'))[0].locales.en.title, 'Concurrent edit');
    const unrelated = newArticle('unrelated', date);
    await writeFile(path, JSON.stringify([article, unrelated]));
    await main(['translate', article.id], path, { transport: async () => {
      unrelated.locales.fr.title = 'Another editor at work';
      await writeFile(path, JSON.stringify([unrelated, article])); return content('en');
    } });
    const saved = JSON.parse(await readFile(path, 'utf8'));
    assert.equal(saved[0].locales.fr.title, 'Another editor at work');
    assert.equal(saved[1].translation.method, 'codex-cli');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('internal source links follow the destination locale while external URLs stay exact', async () => {
  const article = draft(); article.locales.fr.sources.push({ label: 'Confidentialité', href: '/fr/privacy' });
  const translated = content('en'); translated.sources.push({ label: 'Privacy', href: '/en/privacy' });
  const result = await generateTranslation(article, async () => translated, date);
  assert.equal(result.locales.en.sources[1].href, '/en/privacy');
});

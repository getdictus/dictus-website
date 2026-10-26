// Headless checks for #33. Run against a Portly-managed production build.
// VERIFY_MODE=production checks the closed release gate; default checks preview.
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { chromium, webkit, expect } from "@playwright/test";

const origin = new URL(process.argv[2] || "http://localhost:4329").origin;
const preview = process.env.VERIFY_MODE !== "production";
const engines = { chromium, webkit };
const selected = (process.env.VERIFY_ENGINES || "chromium,webkit").split(",");
const directory = new URL("../src/content/blog/", import.meta.url);
const articles = (await Promise.all((await readdir(directory)).filter((name) => name.endsWith(".json"))
  .map(async (name) => JSON.parse(await readFile(new URL(name, directory), "utf8"))))).flat();
let failures = 0;
let passed = 0;

async function check(name, run) {
  try {
    await run();
    passed++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}: ${error.stack || error}`);
  }
}

function route(article, locale) {
  return `/${locale}/blog/${article.locales[locale].slug}`;
}

// v4b nav: the pill and the closed menu sheet both hold the links, so locate
// by role, which skips the hidden copy.
const navLabels = { fr: "Navigation principale", en: "Main navigation" };
const menuLabels = { fr: "Ouvrir le menu", en: "Open menu" };

function navLink(page, locale, name) {
  return page.getByRole("navigation", { name: navLabels[locale] }).getByRole("link", { name, exact: true });
}

// Below 900px the links and language switch live in the menu sheet.
async function openMenu(page, locale) {
  await page.getByRole("button", { name: menuLabels[locale] }).tap();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  return menu;
}

async function assertNoOverflow(page) {
  const [content, viewport] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  assert.ok(content <= viewport + 1, `Content width ${content} exceeds viewport ${viewport}`);
}

for (const engine of selected) {
  const browser = await engines[engine].launch({ headless: true });
  try {
    await check(`${engine}: ${preview ? "preview SSR, localized SEO and JSON-LD" : "production route and navigation protection"}`, async () => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      try {
        for (const locale of ["fr", "en"]) {
          const index = await page.goto(`${origin}/${locale}/blog`);
          assert.equal(index.status(), preview ? 200 : 404);
          assert.doesNotMatch(index.headers().link ?? "", /hreflang=/, "Blog head owns authoritative alternates, not pathname-preserving middleware links");
          if (preview) {
            await expect(page.locator("h1")).toBeVisible();
            await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*nofollow/);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://getdictus.com/${locale}/blog`);
            await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", locale === "fr" ? "fr_FR" : "en_US");
            await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://getdictus.com/${locale}/blog`);
            await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
            for (const article of articles.filter((item) => item.locales[locale])) {
              await expect(page.locator(`main a[href="${route(article, locale)}"]`).first()).toBeVisible();
              assert.ok((await page.locator("main").innerText()).includes(article.locales[locale].title));
            }
          }
          for (const article of articles.filter((item) => item.locales[locale])) {
            const content = article.locales[locale];
            const pathname = route(article, locale);
            const response = await page.goto(`${origin}${pathname}`);
            assert.equal(response.status(), preview ? 200 : 404, pathname);
            assert.doesNotMatch(response.headers().link ?? "", /hreflang=/, "Middleware must not advertise an alternate with an untranslated slug");
            if (!preview) continue;
            await expect(page.locator("html")).toHaveAttribute("lang", locale);
            await expect(page.locator("h1")).toHaveText(content.title);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://getdictus.com${pathname}`);
            for (const language of ["fr", "en"].filter((item) => article.locales[item])) {
              await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute("href", `https://getdictus.com${route(article, language)}`);
            }
            assert.equal(await page.title(), content.seo.title);
            await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", content.seo.description);
            await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", content.social.title);
            await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", content.social.description);
            await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://getdictus.com${pathname}`);
            await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", locale === "fr" ? "fr_FR" : "en_US");
            await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", content.social.title);
            await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", content.social.description);
            await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*nofollow/);
            assert.equal(await page.locator('meta[name="keywords"]').count(), 0);
            const json = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
            assert.equal(json["@type"], "BlogPosting");
            assert.equal(json.headline, content.title);
            assert.equal(json.inLanguage, locale);
            assert.equal(json.author.name, article.author.name);
            assert.equal(json.author.url, article.author.url);
            assert.equal(json.dateModified, article.updatedAt);
            assert.ok(JSON.stringify(json.image).includes(content.image.src));
            if (article.publishedAt) assert.equal(json.datePublished, article.publishedAt);
            else assert.equal(json.datePublished, undefined, "Drafts must not invent a publication date");
            const text = await page.locator("main").innerText();
            assert.ok(text.includes(content.intro), "Introduction must be server-rendered");
            for (const section of content.sections) {
              assert.ok(text.includes(section.heading));
              for (const paragraph of section.paragraphs) assert.ok(text.includes(paragraph), "Body must be server-rendered");
              for (const bullet of section.bullets ?? []) assert.ok(text.includes(bullet), "Practical steps must be server-rendered");
            }
            assert.match(text, /\d+ min/);
            await expect(page.locator(`main a[href="${content.cta.href.startsWith("/") && !/^\/(fr|en)(?:\/|#|$)/.test(content.cta.href) ? `/${locale}${content.cta.href}` : content.cta.href}"]`).first()).toBeAttached();
            for (const source of content.sources) {
              await expect(page.locator(`main a[href="${source.href}"]`).first()).toHaveText(source.label);
            }
            for (const relatedId of article.relatedIds) {
              const related = articles.find((item) => item.id === relatedId);
              if (related?.locales[locale]) await expect(page.locator(`main a[href="${route(related, locale)}"]`).first()).toBeAttached();
            }
            const image = page.locator("main img").first();
            assert.ok(Number(await image.getAttribute("width")) > 0);
            assert.ok(Number(await image.getAttribute("height")) > 0);
            await expect(image).toHaveAttribute("alt", content.image.alt);
          }
          const unknown = await page.goto(`${origin}/${locale}/blog/unknown-article-for-test`);
          assert.equal(unknown.status(), 404);
          const other = locale === "fr" ? "en" : "fr";
          const pair = articles.find((article) => article.locales.fr?.slug !== article.locales.en?.slug);
          const crossed = await page.goto(`${origin}/${locale}/blog/${pair.locales[other].slug}`);
          assert.equal(crossed.status(), 404, "Foreign-language slugs must not create duplicate localized pages");
          if (!preview) {
            await page.goto(`${origin}/${locale}/support`);
            assert.equal(await page.locator(`header a[href="/${locale}/blog"]`).count(), 0);
          }
        }
      } finally { await context.close(); }
    });

    if (!preview) continue;
    await check(`${engine}: direct loads, reloads, translated slugs and normal pages`, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      try {
        for (const article of articles.filter((item) => item.locales.fr && item.locales.en)) {
          for (const startingLocale of ["fr", "en"]) {
            await page.goto(`${origin}${route(article, startingLocale)}`);
            await page.reload();
            const other = startingLocale === "fr" ? "en" : "fr";
            for (const locale of [other, startingLocale]) {
              const toggle = page.getByRole("button", { name: locale === "fr" ? "Passer en français" : "Switch to English" });
              await toggle.focus();
              await page.keyboard.press("Enter");
              await page.waitForURL(`${origin}${route(article, locale)}`);
              await expect(page.locator("h1")).toHaveText(article.locales[locale].title);
              await expect(navLink(page, locale, "Blog")).toHaveAttribute("aria-current", "page");
            }
          }
        }
        await page.goto(`${origin}/fr/support`);
        await page.getByRole("button", { name: "Switch to English" }).click();
        await page.waitForURL(`${origin}/en/support`);
        await page.goto(`${origin}/en/blog`);
        await page.getByRole("button", { name: "Passer en français" }).click();
        await page.waitForURL(`${origin}/fr/blog`);
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    await check(`${engine}: CTA to #clavier lands under the nav and keeps the Pro pin (#84)`, async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      try {
        for (const locale of ["fr", "en"]) {
          const article = articles.find((item) => item.locales[locale]?.cta.href === `/${locale}#clavier`);
          await page.goto(`${origin}${route(article, locale)}`);
          // The footer "Features" link shares this href; the CTA is the article aside.
          const cta = page.locator(`main aside a[href="/${locale}#clavier"]`);
          await cta.scrollIntoViewIfNeeded();
          await page.evaluate(() => { window.__sameDocument = true; });
          await cta.click();
          await page.waitForURL(`${origin}/${locale}#clavier`);
          assert.equal(await page.evaluate(() => window.__sameDocument), true, "The CTA must navigate client-side");
          // --nav-clearance: the target lands 100px from the top.
          await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("clavier").getBoundingClientRect().top - 100))).toBeLessThanOrEqual(2);
          const track = page.locator("#pro [data-pinned]");
          await expect(track).toHaveAttribute("data-pinned", "true");
          const { start, span } = await track.evaluate((node) => ({ start: node.getBoundingClientRect().top + window.scrollY, span: node.offsetHeight - window.innerHeight }));
          for (const share of [0.2, 0.5, 0.8]) {
            await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), start + span * share);
            const sticky = await track.evaluate((node) => {
              const child = node.firstElementChild;
              return { position: getComputedStyle(child).position, top: child.getBoundingClientRect().top };
            });
            assert.equal(sticky.position, "sticky");
            assert.ok(Math.abs(sticky.top) <= 1, `Pinned Pro section left the top at ${share}: ${sticky.top}`);
          }
        }
      } finally { await context.close(); }
    });

    await check(`${engine}: legacy #iphone alias still lands on the Keyboard section on direct load`, async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      try {
        for (const locale of ["fr", "en"]) {
          await page.goto(`${origin}/${locale}#iphone`);
          await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("clavier").getBoundingClientRect().top - 100))).toBeLessThanOrEqual(2);
        }
      } finally { await context.close(); }
    });

    await check(`${engine}: responsive reading, touch, focus, anchors, reduced motion and glass fallback`, async () => {
      const context = await browser.newContext({ hasTouch: true, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const article = [...articles].sort((a, b) => b.locales.fr.sections.length - a.locales.fr.sections.length)[0];
      try {
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          for (const locale of ["fr", "en"]) {
            for (const pathname of [`/${locale}/blog`, ...articles.filter((item) => item.locales[locale]).map((item) => route(item, locale))]) {
              await page.goto(`${origin}${pathname}`);
              await expect(page.locator("h1")).toBeVisible();
              await assertNoOverflow(page);
              const cover = page.locator("main img").first();
              await cover.scrollIntoViewIfNeeded();
              await expect.poll(() => cover.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
              await assertNoOverflow(page);
            }
          }
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${origin}${route(article, "fr")}`);
        await (await openMenu(page, "fr")).getByRole("button", { name: "English", exact: true }).tap();
        await page.waitForURL(`${origin}${route(article, "en")}`);
        await (await openMenu(page, "en")).getByRole("button", { name: "Français", exact: true }).tap();
        await page.waitForURL(`${origin}${route(article, "fr")}`);
        const toc = page.locator('main a[href^="#"]').first();
        await expect(toc).toBeVisible();
        for (let attempts = 0; attempts < 30 && !await toc.evaluate((node) => node === document.activeElement); attempts++) {
          await page.keyboard.press(engine === "webkit" ? "Alt+Tab" : "Tab");
        }
        await expect(toc).toBeFocused();
        assert.notEqual(await toc.evaluate((node) => getComputedStyle(node).outlineStyle), "none");
        const anchor = await toc.getAttribute("href");
        await page.keyboard.press("Enter");
        await expect.poll(() => page.evaluate((id) => document.querySelector(id).getBoundingClientRect().top, anchor)).toBeGreaterThanOrEqual(120);
        await expect(page.locator(anchor)).toBeInViewport();
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
        await page.addStyleTag({ content: "* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; filter: none !important; }" });
        await (await openMenu(page, "fr")).getByRole("link", { name: "Blog", exact: true }).tap();
        await page.waitForURL(`${origin}/fr/blog`);
        await expect(page.locator("h1")).toBeVisible();
        await assertNoOverflow(page);
      } finally { await context.close(); }
    });
  } finally { await browser.close(); }
}

await check("robots and sitemap preserve the release gate", async () => {
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  if (preview) assert.match(robots, /Disallow: \/\s/);
  else {
    assert.match(robots, /Disallow: \/fr\/blog/);
    assert.match(robots, /Disallow: \/en\/blog/);
  }
  assert.doesNotMatch(sitemap, /\/blog/);
});

console.log(`${passed} checks passed; ${failures} failed.`);
process.exitCode = failures ? 1 : 0;

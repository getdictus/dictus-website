// Headless pricing contract checks. No screenshots or videos are written.
// VERIFY_ENGINES=chromium,webkit npm run test:pricing -- http://localhost:4328
import assert from "node:assert/strict";
import { chromium, firefox, webkit, expect } from "@playwright/test";

const origin = new URL(process.argv[2] || "http://localhost:4328").origin;
const engines = { chromium, firefox, webkit };
let passed = 0;
let failed = 0;

async function check(name, fn) {
  try { await fn(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.stack}`); }
}

async function noOverflow(page) {
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  assert.ok(widths[0] <= widths[1] + 1, `Page overflows: ${widths}`);
}

for (const engine of (process.env.VERIFY_ENGINES || "chromium,firefox,webkit").split(",")) {
  let browser;
  await check(`${engine}: browser available`, async () => { browser = await engines[engine].launch({ headless: true }); });
  if (!browser) continue;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const locale of ["fr", "en"]) {
    const expected = locale === "fr" ? { yearly: /39,99\s*€/, monthly: /4,99\s*€/, lifetime: /149,99\s*€/ } : { yearly: /€39\.99/, monthly: /€4\.99/, lifetime: /€149\.99/ };
    await check(`${engine}/${locale}: free foundation, forthcoming Pro and complete comparison`, async () => {
      const response = await page.goto(`${origin}/${locale}/pricing`);
      assert.equal(response.status(), 200);
      await expect(page.locator("#desktop-free-title")).toBeVisible();
      await expect(page.locator("#free-title")).toBeVisible();
      await expect(page.locator("#pro-title")).toBeVisible();
      await expect(page.locator('[data-pricing-cards] button')).toBeDisabled();
      await expect(page.locator('[data-pricing-cards] button')).toContainText(locale === "fr" ? "Bientôt disponible" : "Coming soon");
      const cards = await page.locator('[data-pricing-cards] > section').evaluateAll((nodes) => nodes.map((node) => {
        const box = node.getBoundingClientRect(); return { top: box.top, bottom: box.bottom };
      }));
      assert.equal(cards.length, 3);
      assert.ok(cards.every((box) => Math.abs(box.top - cards[0].top) < 1 && Math.abs(box.bottom - cards[0].bottom) < 1), "Desktop cards align");
      assert.ok(cards[0].bottom < 1000, "The desktop offer overview fits in the first viewport");
      const comparison = page.locator('[data-pricing-comparison]');
      await expect(comparison).not.toHaveAttribute("open", "");
      await expect(page.locator('[data-pricing-faq] details[open]')).toHaveCount(0);
      await comparison.locator("summary").click();
      await expect(page.locator("article")).toContainText("iOS 17");
      await expect(page.locator("article")).toContainText("iPhone 15 Pro");
      await expect(page.locator("article")).toContainText("iPhone Air");
      await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(7);
      await expect(page.getByRole("table")).toContainText("200");
      await expect(page.locator("[data-pricing-faq] details")).toHaveCount(10);
      await comparison.locator("summary").click();
      const article = await page.locator("article").innerText();
      assert.doesNotMatch(article, /79[.,]99|fondateur|founder|popular|populaire|\$/i);
      assert.equal(await page.locator('article a[href*="stripe"], article a[href*="btcpay"], article form').count(), 0);
    });

    await check(`${engine}/${locale}: annual default, native keyboard and honest billing`, async () => {
      const details = page.locator("#billing-details");
      const yearly = page.locator('input[value="yearly"]');
      await expect(yearly).toBeChecked();
      await expect(details).toContainText(expected.yearly);
      await expect(details).toContainText(locale === "fr" ? "éligible" : "eligible");
      await yearly.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(page.locator('input[value="monthly"]')).toBeChecked();
      await expect(details).toContainText(expected.monthly);
      await expect(details).toContainText(locale === "fr" ? "Sans essai" : "No trial");
      await expect(page.locator('[data-billing-note]')).toContainText(locale === "fr" ? "Sans essai" : "No trial");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator('input[value="lifetime"]')).toBeChecked();
      await expect(details).toContainText(expected.lifetime);
      await expect(details).toContainText(locale === "fr" ? "renouvellement" : "renewal");
      await expect(page.locator('[data-billing-note] summary')).toBeVisible();
      await page.locator('[data-lens-key="monthly"]').hover();
      await expect(page.locator('input[value="lifetime"]')).toBeChecked();
      await expect(details).toHaveAttribute("data-billing-plan", "lifetime");
      await page.locator('[data-lens-key="yearly"]').click();
      await expect(yearly).toBeChecked();
      await expect(page.locator('[data-billing-note]')).toContainText(expected.yearly);
      assert.ok(await yearly.evaluate((input) => getComputedStyle(input.closest("label")).minHeight === "44px"));
      // Accessibility names can pass even when the glass compositor hides the labels.
      // Inspect pixels in memory to ensure real text ink reaches the rendered control.
      // Muted labels are #5c606a; allow their anti-aliased edges, still below the pale glass.
      for (const label of await page.locator("fieldset [data-lens-key]").all()) {
        const png = await label.screenshot();
        const ink = await page.evaluate(async (data) => {
          const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
          const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
          const context = canvas.getContext("2d"); context.drawImage(image, 0, 0);
          const pixels = context.getImageData(0, 0, image.width, image.height).data;
          let count = 0;
          for (let index = 0; index < pixels.length; index += 4) if (pixels[index] < 145 && pixels[index + 1] < 145 && pixels[index + 2] < 145 && pixels[index + 3] > 200) count++;
          return count;
        }, png.toString("base64"));
        assert.ok(ink > 20, `Billing label must be visibly painted: ${ink} text pixels`);
      }
    });

    await check(`${engine}/${locale}: disclosures, exact lifetime scope and consistent Terms`, async () => {
      const details = page.locator("[data-pricing-faq] details");
      for (const disclosure of await details.all()) {
        await disclosure.locator("summary").focus();
        await page.keyboard.press("Enter");
        await expect(disclosure).toHaveAttribute("open", "");
      }
      await expect(details.nth(2)).toContainText(expected.monthly);
      await expect(details.nth(2)).toContainText(expected.yearly);
      await expect(details.nth(2)).toContainText(expected.lifetime);
      const lifetime = locale === "en"
        ? "The lifetime purchase covers every current and future Pro feature that runs on your device or on a server you provide. Any feature relying on Dictus infrastructure is a separate offering."
        : "L’achat à vie couvre toutes les fonctionnalités Pro actuelles et futures qui s’exécutent sur votre appareil ou sur un serveur que vous fournissez. Toute fonctionnalité reposant sur une infrastructure Dictus fait l’objet d’une offre distincte.";
      await expect(details.nth(7)).toContainText(lifetime);
      for (const route of ["terms", "privacy", "support", "donate"]) {
        assert.ok(await page.locator(`article a[href="/${locale}/${route}"]`).count() > 0);
        assert.equal((await page.request.get(`${origin}/${locale}/${route}`)).status(), 200);
      }
      await page.goto(`${origin}/${locale}/terms`);
      await expect(page.locator("article")).toContainText(expected.yearly);
      await expect(page.locator("article")).toContainText(lifetime);
      await expect(page.locator("article")).toContainText(locale === "fr" ? "Seul l’abonnement annuel" : "Only the yearly");
    });

    await check(`${engine}/${locale}: pricing metadata and locale route`, async () => {
      await page.goto(`${origin}/${locale}/pricing`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://getdictus.com/${locale}/pricing`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://getdictus.com/${locale}/pricing`);
      await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute("href", "https://getdictus.com/fr/pricing");
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", "https://getdictus.com/en/pricing");
      assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
      const language = page.locator("header").getByRole("button", { name: locale === "fr" ? "Switch to English" : "Passer en français", exact: true });
      await language.click();
      await expect(page).toHaveURL(new RegExp(`/${locale === "fr" ? "en" : "fr"}/pricing$`));
    });

    await check(`${engine}/${locale}: 320–1440px, reduced motion and dark fallback`, async () => {
      await page.goto(`${origin}/${locale}/pricing`);
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await noOverflow(page);
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator('[data-lens-key="lifetime"]').click();
      await expect(page.locator('input[value="lifetime"]')).toBeChecked();
      const lens = page.locator('fieldset [data-glass-selector-lens]');
      assert.ok(parseFloat(await lens.evaluate((node) => getComputedStyle(node).transitionDuration)) <= .001);
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await noOverflow(page);
      await expect(page.locator("#billing-details")).toBeVisible();
      await page.evaluate(() => document.documentElement.classList.remove("dark"));
    });
  }

  await check(`${engine}: no-JavaScript prices and accessible native FAQ`, async () => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    const staticPage = await context.newPage();
    await staticPage.goto(`${origin}/en/pricing`);
    await expect(staticPage.locator('input[type="radio"]')).toHaveCount(3);
    await expect(staticPage.locator('input[type="radio"]').first()).not.toBeVisible();
    const text = await staticPage.locator("article").innerText();
    assert.match(text, /€4\.99/); assert.match(text, /€39\.99/); assert.match(text, /€149\.99/);
    await staticPage.locator("[data-pricing-faq] summary").first().click();
    await expect(staticPage.locator("[data-pricing-faq] details").first()).toHaveAttribute("open", "");
    await noOverflow(staticPage);
    await context.close();
  });

  await check(`${engine}: touch changes billing`, async () => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
    const touch = await context.newPage();
    await touch.goto(`${origin}/fr/pricing`);
    await touch.locator('#pro-title').scrollIntoViewIfNeeded();
    await expect(touch.locator('fieldset')).toBeInViewport();
    await touch.locator('[data-lens-key="monthly"]').tap();
    await expect(touch.locator('input[value="monthly"]')).toBeChecked();
    await touch.locator('[data-lens-key="lifetime"]').tap();
    await expect(touch.locator("#billing-details")).toContainText(/149,99\s*€/);
    await noOverflow(touch);
    await context.close();
  });
  await check(`${engine}: no browser errors`, async () => assert.deepEqual(errors, []));
  await browser.close();
}

await check("preview: robots and sitemap keep unfinished offers unindexed", async () => {
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /Disallow: \//);
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  assert.doesNotMatch(sitemap, /\/pricing</);
});
console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;

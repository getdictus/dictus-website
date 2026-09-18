// Headless pricing contract checks. No screenshots or videos are written.
// VERIFY_ENGINES=chromium,webkit npm run test:pricing -- http://localhost:4329
import assert from "node:assert/strict";
import { chromium, firefox, webkit, expect } from "@playwright/test";

const origin = new URL(process.argv[2] || "http://localhost:4329").origin;
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
      await expect(page.getByRole("note")).toContainText(locale === "fr" ? "Les achats Pro ne sont pas encore disponibles" : "Pro purchases are not available yet");
      await expect(page.locator("article")).toContainText("iOS 17");
      await expect(page.locator("article")).toContainText("iPhone 15 Pro");
      await expect(page.locator("article")).toContainText("iPhone Air");
      await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(7);
      await expect(page.getByRole("table")).toContainText("200");
      await expect(page.locator("article details")).toHaveCount(10);
      const article = await page.locator("article").innerText();
      assert.doesNotMatch(article, /79[.,]99|fondateur|founder|popular|populaire|\$/i);
      assert.equal(await page.locator('article a[href*="stripe"], article a[href*="btcpay"], article form').count(), 0);
    });

    await check(`${engine}/${locale}: annual default, native keyboard and honest billing`, async () => {
      const details = page.locator("#billing-details");
      const yearly = page.locator('input[value="yearly"]');
      await expect(yearly).toBeChecked();
      await expect(details).toContainText(expected.yearly);
      await expect(details).toContainText(locale === "fr" ? "éligibilité" : "eligible");
      await yearly.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(page.locator('input[value="monthly"]')).toBeChecked();
      await expect(details).toContainText(expected.monthly);
      await expect(details).toContainText(locale === "fr" ? "Aucun essai gratuit" : "No free trial");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator('input[value="lifetime"]')).toBeChecked();
      await expect(details).toContainText(expected.lifetime);
      await expect(details).toContainText(locale === "fr" ? "aucun renouvellement" : "no renewal");
      await page.locator('[data-lens-key="monthly"]').hover();
      await expect(page.locator('input[value="lifetime"]')).toBeChecked();
      await expect(details).toHaveAttribute("data-billing-plan", "lifetime");
      await page.locator('[data-lens-key="yearly"]').click();
      await expect(yearly).toBeChecked();
      assert.ok(await yearly.evaluate((input) => getComputedStyle(input.closest("label")).minHeight === "44px"));
    });

    await check(`${engine}/${locale}: disclosures, exact lifetime scope and consistent Terms`, async () => {
      const details = page.locator("article details");
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
      const language = page.locator("header").getByRole("button", { name: locale === "fr" ? "EN" : "FR", exact: true });
      await language.click();
      await expect(page).toHaveURL(new RegExp(`/${locale === "fr" ? "en" : "fr"}/pricing$`));
    });

    await check(`${engine}/${locale}: 320–1440px, reduced motion and dark fallback`, async () => {
      await page.goto(`${origin}/${locale}/pricing`);
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
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
    await staticPage.locator("summary").first().click();
    await expect(staticPage.locator("details").first()).toHaveAttribute("open", "");
    await noOverflow(staticPage);
    await context.close();
  });

  await check(`${engine}: touch changes billing`, async () => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
    const touch = await context.newPage();
    await touch.goto(`${origin}/fr/pricing`);
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

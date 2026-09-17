// Production-preview smoke checks for issue #29.
// Start the production server first, then run:
//   npx playwright install chromium firefox webkit
//   npm run test:e2e -- http://localhost:3000
// Requires Playwright and its browsers. PLAYWRIGHT_MODULE may
// point at an external installation; no browser dependency ships with the app.
// Set VERIFY_ENGINES=chromium for a shorter pass, CHROME_CHANNEL=chrome to use
// installed Chrome, and VERIFY_ARTIFACTS to choose the report/screenshot folder.
// VERIFY_MODE=production checks a separately built production configuration.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || "@playwright/test");
const { expect } = playwright;
const origin = new URL(process.argv[2] || "http://localhost:3000").origin;
const preview = process.env.VERIFY_MODE !== "production";
const artifacts = process.env.VERIFY_ARTIFACTS || join(tmpdir(), "dictus-redesign-verification");
const engines = (process.env.VERIFY_ENGINES || "chromium,firefox,webkit").split(",");
const results = [];
await mkdir(artifacts, { recursive: true });

async function check(name, fn) {
  try {
    const details = await fn();
    results.push({ name, passed: true, ...(details ? { details } : {}) });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack || String(error) });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function visibleToReader(locator) {
  assert.ok(await locator.isVisible(), "Content must have a visible layout box");
  assert.ok(await locator.evaluate((node) => {
    for (let element = node; element; element = element.parentElement) {
      if (Number(getComputedStyle(element).opacity) === 0) return false;
    }
    return true;
  }), "Content must not depend on hydration to become opaque");
}

async function noOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.content <= dimensions.viewport + 1, JSON.stringify(dimensions));
}

async function settleFrames(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

function collectBrowserErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function canvasState(canvas) {
  return canvas.evaluate((element) => {
    const image = element.toDataURL();
    let hash = 5381;
    for (let index = 0; index < image.length; index++) hash = ((hash * 33) ^ image.charCodeAt(index)) >>> 0;
    return {
      hash,
      drawn: element.getContext("2d").getImageData(0, 0, element.width, element.height).data.some((value, index) => index % 4 === 3 && value !== 0),
    };
  });
}

async function captureScene(page, scene, path) {
  const section = page.locator(`#${scene}`);
  await section.scrollIntoViewIfNeeded();
  for (const image of await section.locator("img:visible").all()) {
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
    await image.evaluate((element) => element.decode());
  }
  // Isolate the section for visual review; viewport screenshots retain the nav.
  await section.screenshot({ path, style: "header { visibility: hidden !important; }" });
}

for (const engine of engines) {
  let browser;
  await check(`${engine}: browser available`, async () => {
    const options = engine === "chromium" && process.env.CHROME_CHANNEL
      ? { channel: process.env.CHROME_CHANNEL }
      : {};
    browser = await playwright[engine].launch(options);
  });
  if (!browser) continue;

  await check(`${engine}: server-rendered content and localized routes`, async () => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      for (const locale of ["fr", "en"]) {
        for (const route of ["", "/donate", "/support", "/privacy", "/terms", "/blog", "/pricing"]) {
          const response = await page.goto(`${origin}/${locale}${route}`);
          if (!preview && ["/blog", "/pricing"].includes(route)) {
            assert.equal(response.status(), 404, "Unfinished pages must not be available in production");
            continue;
          }
          assert.equal(response.status(), 200, `${locale}${route} must load`);
          assert.equal(await page.locator("html").getAttribute("lang"), locale);
          await visibleToReader(page.locator("h1"));
          const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
          assert.equal(new URL(canonical).pathname, `/${locale}${route}`);
          const robots = await page.locator('meta[name="robots"]').getAttribute("content");
          if (preview) {
            assert.match(robots, /noindex/);
            assert.match(robots, /nofollow/);
          } else {
            assert.doesNotMatch(robots, /noindex/);
          }
          if (!route) {
            for (const heading of await page.locator("main h2").all()) await visibleToReader(heading);
            assert.equal(await page.locator('a[href*="getdictus/dictus-desktop/releases/download/"]:visible').count(), 10,
              "All ten Desktop installers must be usable without JavaScript");
            const html = await response.text();
            const versions = new Set([...html.matchAll(/releases\/download\/(v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?)\//gi)].map((match) => match[1]));
            assert.equal(versions.size, 1, "Download health requires exactly one served release version");
            const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
            for (const text of jsonLd) {
              const payload = JSON.parse(text);
              const applications = payload["@graph"] || [payload];
              for (const app of applications) {
                assert.ok(!/Android/.test(String(app.operatingSystem || "")), "Android must not be advertised as released");
                if (/iOS/.test(String(app.operatingSystem || ""))) {
                  assert.ok(!app.offers, "Undecided iOS prices must not appear in structured data");
                }
              }
            }
          }
        }
      }
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: navigation, keyboard controls, downloads and responsive layout`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    try {
      await page.goto(`${origin}/fr`);
      const nav = page.getByRole("navigation").first();
      const destinations = await nav.locator("a").evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
      assert.deepEqual(destinations, preview
        ? ["/fr", "/fr/blog", "/fr/pricing", "/fr/donate"]
        : ["/fr", "/fr/donate"]);

      const desktop = page.locator("#desktop");
      const tabLabels = [/macOS/i, /Windows/i, /Linux/i];
      const expectedLinks = [2, 2, 6];
      for (const [index, label] of tabLabels.entries()) {
        const tab = desktop.getByRole("tab", { name: label });
        await tab.click();
        await expect(tab).toHaveAttribute("aria-selected", "true");
        const links = desktop.getByRole("tabpanel").locator('a[href*="/releases/download/"]');
        assert.equal(await links.count(), expectedLinks[index]);
        for (const link of await links.all()) await visibleToReader(link);
      }
      const linux = desktop.getByRole("tab", { name: /Linux/i });
      await linux.focus();
      await page.keyboard.press("Home");
      await expect(desktop.getByRole("tab", { name: /macOS/i })).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("End");
      await expect(linux).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("ArrowLeft");
      await expect(desktop.getByRole("tab", { name: /Windows/i })).toHaveAttribute("aria-selected", "true");

      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => {
          const previous = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, 0);
          document.documentElement.style.scrollBehavior = previous;
        });
        await settleFrames(page);
        await noOverflow(page);
        for (const link of await nav.getByRole("link").all()) await visibleToReader(link);
        await page.screenshot({ path: join(artifacts, `${engine}-${width}-hero.png`) });
        for (const scene of ["desktop", "iphone"]) {
          await captureScene(page, scene, join(artifacts, `${engine}-${width}-${scene}.png`));
        }
      }
      const languageRoute = preview ? "/blog" : "/support";
      await page.goto(`${origin}/fr${languageRoute}`);
      await page.getByRole("button", { name: /Switch to English/ }).click();
      await page.waitForURL(`**/en${languageRoute}`);
      await page.getByRole("navigation").first().locator('a[href="/en/donate"]').click();
      await page.waitForURL("**/en/donate");
      await visibleToReader(page.locator("h1"));
      assert.deepEqual(errors, [], "No uncaught browser errors");
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: iPhone selector exposes real screenshots with keyboard access`, async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    try {
      await page.goto(`${origin}/fr`);
      const iphone = page.locator("#iphone");
      const tabs = iphone.getByRole("tab");
      assert.equal(await tabs.count(), 3);
      for (let index = 0; index < 3; index++) {
        await tabs.nth(index).click();
        await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
        const image = iphone.getByRole("tabpanel").locator("img");
        await expect(image).toBeVisible();
        await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
        assert.ok((await image.getAttribute("alt")).length > 10);
        await captureScene(page, "iphone", join(artifacts, `${engine}-iphone-state-${index}.png`));
      }
      await tabs.last().focus();
      for (const [key, index] of [["Home", 0], ["End", 2], ["ArrowRight", 0], ["ArrowLeft", 2]]) {
        await page.keyboard.press(key);
        await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
        await expect(tabs.nth(index)).toBeFocused();
      }
      assert.equal(await page.locator('a[href*="dictus-android/releases/download/"]').count(), 0);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: OS detection keeps mobile and iPad visitors neutral`, async () => {
    const cases = [
      ["Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15", "MacIntel", 0, "mac"],
      ["Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36", "Win32", 0, "win"],
      ["Linux", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36", "Linux x86_64", 0, "linux"],
      ["iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1", "iPhone", 5, null],
      ["Android", "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/153.0.0.0 Mobile Safari/537.36", "Linux armv8l", 5, null],
      ["iPad desktop UA", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15", "MacIntel", 5, null],
    ];
    for (const [name, userAgent, platform, touchPoints, selected] of cases) {
      const context = await browser.newContext({ userAgent });
      const page = await context.newPage();
      try {
        await page.addInitScript(({ platform, touchPoints }) => {
          Object.defineProperty(navigator, "platform", { get: () => platform });
          Object.defineProperty(navigator, "maxTouchPoints", { get: () => touchPoints });
        }, { platform, touchPoints });
        await page.goto(`${origin}/fr`);
        // Confirm event handlers are hydrated before testing the detection result.
        await page.locator("#iphone-tab-1").click();
        await expect(page.locator("#iphone-tab-1")).toHaveAttribute("aria-selected", "true");
        const active = page.locator('#desktop [role="tab"][aria-selected="true"]');
        if (selected) {
          await expect(active, name).toHaveAttribute("id", `platforms-tab-${selected}`);
        } else {
          await expect(active, name).toHaveCount(0);
          await expect(page.locator("#platforms-tab-mac"), name).toHaveAttribute("tabindex", "0");
        }
      } finally {
        await context.close();
      }
    }
  });

  await check(`${engine}: reduced motion keeps a static waveform after resize`, async () => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/fr`);
      const canvas = page.locator("main canvas").first();
      await canvas.waitFor();
      await settleFrames(page);
      const readCanvas = () => canvasState(canvas);
      let first = await readCanvas();
      assert.ok(first.drawn, "Reduced-motion waveform must be drawn");
      await page.waitForTimeout(150);
      assert.equal((await readCanvas()).hash, first.hash, "Reduced-motion waveform must remain static");
      await page.setViewportSize({ width: 768, height: 900 });
      await settleFrames(page);
      first = await readCanvas();
      assert.ok(first.drawn, "Canvas resize must redraw the static waveform");
      await page.waitForTimeout(150);
      assert.equal((await readCanvas()).hash, first.hash);
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: waveform pauses offscreen, on visibility change and with its control`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/fr`);
      const canvas = page.locator("main canvas").first();
      await settleFrames(page);
      const first = await canvasState(canvas);
      await expect.poll(async () => (await canvasState(canvas)).hash).not.toBe(first.hash);
      await page.locator("#iphone").scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      let paused = await canvasState(canvas);
      await page.waitForTimeout(150);
      assert.equal((await canvasState(canvas)).hash, paused.hash, "Waveform keeps drawing when offscreen");
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(async () => (await canvasState(canvas)).hash).not.toBe(paused.hash);
      // Model the visibility event directly; headless browsers do not reliably
      // background pages. This verifies the handler, not native iOS suspension.
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForTimeout(100);
      paused = await canvasState(canvas);
      await page.waitForTimeout(150);
      assert.equal((await canvasState(canvas)).hash, paused.hash, "Waveform keeps drawing when document.hidden is true");
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect.poll(async () => (await canvasState(canvas)).hash).not.toBe(paused.hash);
      await page.getByRole("button", { name: "Arrêter l’animation" }).click();
      await page.waitForTimeout(100);
      paused = await canvasState(canvas);
      await page.waitForTimeout(150);
      assert.equal((await canvasState(canvas)).hash, paused.hash, "Pause button must stop the waveform");
    } finally {
      await context.close();
    }
  });

  await browser.close();
}

await check("sitemap and robots respect the preview boundary", async () => {
  const response = await fetch(`${origin}/sitemap.xml`);
  assert.equal(response.status, 200);
  const sitemap = await response.text();
  assert.doesNotMatch(sitemap, /\/(?:blog|pricing)</);
  if (preview) assert.doesNotMatch(sitemap, /<url>/);
  else assert.match(sitemap, /\/fr\/donate</);
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  if (preview) assert.match(robots, /Disallow: \/\s*$/m);
  else assert.match(robots, /Allow: \/\s*$/m);
});

await check("download health matches the rendered page", async () => {
  const response = await fetch(`${origin}/api/downloads-health`);
  const health = await response.json();
  assert.equal(response.status, 200, JSON.stringify(health));
  assert.equal(health.ok, true);
  // An upstream GitHub outage is reported as degraded, not falsely as verified.
  return health;
});

await writeFile(join(artifacts, "results.json"), JSON.stringify({ origin, mode: preview ? "preview" : "production", results }, null, 2));
console.log(`Artifacts: ${artifacts}`);
process.exitCode = results.some((result) => !result.passed) ? 1 : 0;

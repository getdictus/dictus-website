// Production-preview smoke checks for issue #29.
// Start the production server first, then run:
//   npx playwright install chromium firefox webkit
//   npm run test:e2e -- http://localhost:3000
// Requires Playwright and its browsers. PLAYWRIGHT_MODULE may
// point at an external installation; no browser dependency ships with the app.
// Set VERIFY_ENGINES=chromium for a shorter pass, CHROME_CHANNEL=chrome to use
// installed Chrome, and VERIFY_ARTIFACTS to choose the report/screenshot folder.
// VERIFY_CHECKS is an optional regular expression matching check names.
// VERIFY_SCREENSHOTS=0 skips screenshot files; optical assertions stay in memory.
// VERIFY_MODE=production checks a separately built production configuration.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || "@playwright/test");
const { expect } = playwright;
const { Resvg } = require("@resvg/resvg-js");
const origin = new URL(process.argv[2] || "http://localhost:3000").origin;
const preview = process.env.VERIFY_MODE !== "production";
const artifacts = process.env.VERIFY_ARTIFACTS || join(tmpdir(), "dictus-redesign-verification");
const engines = (process.env.VERIFY_ENGINES || "chromium,firefox,webkit").split(",");
const selectedChecks = process.env.VERIFY_CHECKS ? new RegExp(process.env.VERIFY_CHECKS) : null;
const screenshots = process.env.VERIFY_SCREENSHOTS !== "0";
const results = [];
const iphoneDictationStart = 19 / 1.5;
const iphoneAppStart = iphoneDictationStart + 9.5;
await mkdir(artifacts, { recursive: true });

async function check(name, fn) {
  if (selectedChecks && !name.endsWith(": browser available") && !selectedChecks.test(name)) return;
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
  if (screenshots) await section.screenshot({ path, style: "header { display: none !important; }" });
}

function changedTextInk(glassPng, plainPng) {
  // Decode browser PNGs with the image renderer already used by this project.
  // Compare only dark glyphs: changing the glass's pale backdrop must not
  // obscure, duplicate or distort the text rendered above it.
  const pixels = (png) => {
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    return new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image width="${width}" height="${height}" href="data:image/png;base64,${png.toString("base64")}"/></svg>`).render().pixels;
  };
  const glass = pixels(glassPng);
  const plain = pixels(plainPng);
  assert.equal(glass.length, plain.length);
  let changed = 0;
  let ink = 0;
  for (let offset = 0; offset < plain.length; offset += 4) {
    const a = glass[offset + 3] > 127 && Math.max(...glass.subarray(offset, offset + 3)) < 110;
    const b = plain[offset + 3] > 127 && Math.max(...plain.subarray(offset, offset + 3)) < 110;
    if (a || b) ink++;
    if (a !== b) changed++;
  }
  assert.ok(ink > 100, "The optical comparison must include readable text");
  return changed / ink;
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
        // Let resize anchoring settle before returning from the last scene.
        await settleFrames(page);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await expect(page.locator("h1")).toBeInViewport();
        await noOverflow(page);
        const usageColumns = await page.locator("#uses > div").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
        assert.equal(usageColumns, width >= 1024 ? 2 : 1, "Usage layout must retain its desktop columns and mobile stacking in the compiled CSS");
        for (const link of await nav.getByRole("link").all()) await visibleToReader(link);
        if (screenshots) await page.screenshot({ path: join(artifacts, `${engine}-${width}-hero.png`) });
        for (const scene of ["desktop", "iphone", "uses", "local"]) {
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

  await check(`${engine}: homepage removes pause controls and visible playback notes`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      for (const locale of ["fr", "en"]) {
        await page.goto(`${origin}/${locale}`);
        for (const reducedMotion of ["no-preference", "reduce"]) {
          await page.emulateMedia({ reducedMotion });
          for (const scene of ["desktop", "iphone", "uses", "local"]) {
            await page.locator(`#${scene}`).scrollIntoViewIfNeeded();
            await settleFrames(page);
            await expect(page.locator("main").getByRole("button", {
              name: /pause|arrêter.*animation|stop.*animation|reprendre.*(?:animation|démonstration|parcours)|resume.*(?:animation|demo|steps)/i,
              includeHidden: true,
            })).toHaveCount(0);
          }
          await expect(page.locator("#iphone").getByText(/Capture réelle|Real capture/)).toHaveCount(0);
        }
      }
    } finally { await context.close(); }
  });

  await check(`${engine}: glass reflections track a fine pointer and respect reduced motion`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/fr`);
      const target = page.locator("header .glass-surface").first();
      const light = target.locator("[data-glass-light]").first();
      const reflection = light.locator("[data-glass-reflection]");
      await expect(light).toHaveAttribute("aria-hidden", "true");
      assert.equal(await light.evaluate((node) => getComputedStyle(node).pointerEvents), "none");
      const bounds = await target.boundingBox();
      await page.mouse.move(bounds.x + 20, bounds.y + bounds.height / 2);
      await expect(light).toHaveAttribute("data-active", "true");
      await expect.poll(() => reflection.evaluate((node) => node.style.transform)).not.toBe("");
      const first = await reflection.evaluate((node) => node.style.transform);
      await page.mouse.move(bounds.x + bounds.width - 20, bounds.y + bounds.height / 2);
      await expect.poll(() => reflection.evaluate((node) => node.style.transform)).not.toBe(first);
      await page.mouse.move(10, 400);
      await expect(light).toHaveAttribute("data-active", "false");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.mouse.move(bounds.x + 30, bounds.y + bounds.height / 2);
      await expect(light).toHaveAttribute("data-active", "false");
      await expect(reflection).toBeHidden();
      assert.equal(await reflection.evaluate((node) => node.style.transform), "",
        "Reduced motion must remove pointer tracking, not just hide a running effect");
    } finally { await context.close(); }

    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const touchPage = await touch.newPage();
    try {
      await touchPage.goto(`${origin}/fr`);
      const target = touchPage.locator("header .glass-surface").first();
      const light = target.locator("[data-glass-light]").first();
      // A touch pointer must never activate the moving desktop reflection.
      await target.dispatchEvent("pointermove", { pointerType: "touch", clientX: 150, clientY: 40 });
      await settleFrames(touchPage);
      await expect(light).toHaveAttribute("data-active", "false");
      assert.equal(await light.locator("[data-glass-reflection]").evaluate((node) => node.style.transform), "");
    } finally { await touch.close(); }
  });

  await check(`${engine}: iPhone chapters expose localized posters and keyboard access`, async () => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    try {
      for (const locale of ["fr", "en"]) {
        await page.goto(`${origin}/${locale}`);
        await page.evaluate(() => document.fonts.ready);
        const iphone = page.locator("#iphone");
        const tabs = iphone.getByRole("tab");
        const panel = iphone.getByRole("tabpanel");
        const video = iphone.locator("[data-iphone-video]");
        await expect(tabs).toHaveCount(3);
        await expect(panel).toHaveCount(1);
        await expect(panel).toHaveAttribute("id", "iphone-screen");
        await expect(video).toHaveCount(1);
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await settleFrames(page);
          for (let index = 0; index < 3; index++) {
            await tabs.nth(index).click();
            await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
            await expect(tabs.nth(index)).toHaveAttribute("aria-controls", "iphone-screen");
            await expect(panel).toHaveAttribute("aria-labelledby", `iphone-tab-${index}`);
            const image = panel.locator("img:visible");
            await expect(image).toHaveCount(1);
            await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
            assert.ok((await image.getAttribute("alt")).length > 10);
            assert.equal(await video.evaluate((node) => node.paused), true, "Reduced-motion chapter browsing must remain static");
            await noOverflow(page);
            if (locale === "fr" && width === 390) {
              await captureScene(page, "iphone", join(artifacts, `${engine}-iphone-state-${index}.png`));
            }
          }
        }
        assert.equal(await video.getAttribute("src"), null, "Reduced-motion posters must not load the MP4 before explicit playback");
        assert.equal(await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => /\/videos\/products\/ios-demo\.mp4/.test(entry.name)).length), 0);
        await tabs.last().focus();
        for (const [key, index] of [["Home", 0], ["End", 2], ["ArrowRight", 0], ["ArrowLeft", 2]]) {
          await page.keyboard.press(key);
          await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
          await expect(tabs.nth(index)).toBeFocused();
        }
        await expect(iphone.getByRole("button", { name: locale === "fr" ? "Lire la démonstration" : "Play the demo", exact: true })).toBeVisible();
      }
      assert.equal(await page.locator('a[href*="dictus-android/releases/download/"]').count(), 0);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: iPhone video loads near the phone and loops real chapter footage`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    const requests = [];
    page.on("request", (request) => { if (/\/videos\/products\/ios-demo\.mp4/.test(request.url())) requests.push(request.url()); });
    try {
      await page.goto(`${origin}/fr`);
      const iphone = page.locator("#iphone");
      const video = iphone.locator("[data-iphone-video]");
      await settleFrames(page);
      assert.equal(await video.getAttribute("src"), null, "Hero must not attach the demo source");
      assert.equal(requests.length, 0, "Hero must not fetch the MP4");
      const panel = iphone.getByRole("tabpanel");
      await panel.evaluate((node) => window.scrollTo({
        top: window.scrollY + node.getBoundingClientRect().top - window.innerHeight - 150,
        behavior: "instant",
      }));
      await expect(video).toHaveAttribute("src", "/videos/products/ios-demo.mp4");
      await expect.poll(() => requests.length, { timeout: 15_000 }).toBeGreaterThan(0);
      await page.waitForTimeout(150);
      assert.equal(await video.evaluate((node) => node.paused), true, "Prefetching below the viewport must not start playback");
      await panel.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((node) => node.readyState), { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
      const media = await video.evaluate((node) => ({
        muted: node.muted, playsInline: node.playsInline, loop: node.loop,
        duration: node.duration, width: node.videoWidth, height: node.videoHeight,
      }));
      assert.equal(media.muted, true);
      assert.equal(media.playsInline, true);
      assert.equal(media.loop, true);
      assert.ok(media.duration >= 31.4 && media.duration <= 31.5, JSON.stringify(media));
      assert.deepEqual([media.width, media.height], [860, 1864]);
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
      const start = await video.evaluate((node) => node.currentTime);
      await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(start + 0.15);
      assert.ok(requests.length > 0);

      const tabs = iphone.getByRole("tab");
      await tabs.nth(2).click();
      await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThanOrEqual(iphoneAppStart - 1 / 60);
      assert.ok(await video.evaluate((node) => node.currentTime < 24));
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
      await expect(iphone.getByRole("button", { name: /démonstration/ })).toHaveCount(0);
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
      for (const [index, time] of [[0, 0], [1, iphoneDictationStart], [2, iphoneAppStart]]) {
        await tabs.nth(index).click();
        await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeCloseTo(time, 1);
        await expect.poll(() => video.evaluate((node) => node.seeking)).toBe(false);
        assert.equal(await video.evaluate((node) => node.paused), true, "Chapter selection must not resume a hidden document");
      }
      await tabs.first().focus();
      // Approach a boundary through the media timeline, then verify native
      // timeupdate synchronizes chapters without stealing keyboard focus.
      await video.evaluate((node, start) => { node.currentTime = start - 0.15; }, iphoneDictationStart);
      await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await tabs.first().focus();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(tabs.first()).toBeFocused();
      await expect(iphone.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "iphone-tab-1");

      for (let cycle = 0; cycle < 2; cycle++) {
        // Seek close to the end, then let the native media timeline perform
        // the actual wrap. No synthetic ended event or scripted restart.
        await video.evaluate((node) => { node.currentTime = node.duration - 0.65; });
        await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
        await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeLessThan(2);
        await expect.poll(() => video.evaluate((node) => node.seeking)).toBe(false);
        await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
        await expect(tabs.first()).toBeFocused();
        await expect(panel).toHaveAttribute("aria-labelledby", "iphone-tab-0");
        await expect(iphone.getByRole("button", { name: /démonstration/ })).toHaveCount(0);
        assert.equal(await video.evaluate((node) => node.paused || node.ended), false);
        const wrappedAt = await video.evaluate((node) => node.currentTime);
        await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(wrappedAt + 0.15);
        await expect(panel.locator("img:visible")).toHaveCount(0);
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
      await video.evaluate((node) => { node.currentTime = node.duration - 0.15; });
      await expect.poll(() => video.evaluate((node) => node.seeking)).toBe(false);
      const stoppedNearEnd = await video.evaluate((node) => node.currentTime);
      await page.waitForTimeout(300);
      assert.equal(await video.evaluate((node) => node.paused), true);
      assert.equal(await video.evaluate((node) => node.currentTime), stoppedNearEnd, "Reduced motion near the end must prevent the next loop");
      await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
      await expect(iphone.getByRole("button", { name: "Lire la démonstration", exact: true })).toBeVisible();
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });

  await check(`${engine}: iPhone video respects visibility and motion preferences`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/en`);
      const iphone = page.locator("#iphone");
      const video = iphone.locator("[data-iphone-video]");
      const isPaused = () => video.evaluate((node) => node.paused);
      const time = () => video.evaluate((node) => node.currentTime);
      const freeze = async (reason) => {
        await expect.poll(isPaused).toBe(true);
        const pausedAt = await time();
        await page.waitForTimeout(180);
        assert.equal(await time(), pausedAt, reason);
      };
      await iphone.getByRole("tabpanel").scrollIntoViewIfNeeded();
      await expect.poll(isPaused, { timeout: 15_000 }).toBe(false);
      await expect.poll(time).toBeGreaterThan(0.5);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await freeze("Offscreen video must stop playback");
      const offscreenTime = await time();
      await iphone.getByRole("tabpanel").scrollIntoViewIfNeeded();
      await expect.poll(isPaused).toBe(false);
      assert.ok(await time() >= offscreenTime - 1 / 60, "Returning to the video must resume its paused position, not restart the demo");
      // Headless pages cannot reliably be backgrounded; model the visibility
      // event to verify the handler, not the platform's native suspension.
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await freeze("Hidden document must stop playback");
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect.poll(isPaused).toBe(false);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await freeze("A changed reduced-motion preference must pause playback");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await iphone.getByRole("tabpanel").scrollIntoViewIfNeeded();
      await freeze("Returning to the section must preserve the reduced-motion preference");
      await iphone.getByRole("button", { name: "Play the demo", exact: true }).click();
      await expect.poll(isPaused).toBe(false);
      await expect(iphone.getByRole("button", { name: "Play the demo", exact: true })).toHaveCount(0);
      const resumedAt = await time();
      await expect.poll(time).toBeGreaterThan(resumedAt + 0.1);
    } finally { await context.close(); }
  });

  await check(`${engine}: iPhone video handles pending metadata, autoplay refusal and media failure`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let release;
    const blocked = new Promise((resolve) => { release = resolve; });
    await page.route("**/videos/products/ios-demo.mp4", async (route) => { await blocked; await route.continue(); });
    try {
      await page.goto(`${origin}/fr`);
      const iphone = page.locator("#iphone");
      const video = iphone.locator("[data-iphone-video]");
      await iphone.getByRole("tab").last().click();
      await expect(iphone.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
      await iphone.getByRole("button", { name: "Lire la démonstration", exact: true }).click();
      await expect(video).toHaveAttribute("src", "/videos/products/ios-demo.mp4");
      assert.equal(await video.evaluate((node) => node.readyState), 0);
      release();
      await expect.poll(() => video.evaluate((node) => node.readyState), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
      await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(iphoneAppStart + 0.1);
      assert.ok(await video.evaluate((node) => node.currentTime < 24), "A pending chapter selection must be applied before playback begins");
      await expect(iphone.getByRole("button", { name: "Lire la démonstration", exact: true })).toHaveCount(0);
      await page.unroute("**/videos/products/ios-demo.mp4");

      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.addInitScript(() => {
        const play = HTMLMediaElement.prototype.play;
        let refused = false;
        HTMLMediaElement.prototype.play = function () {
          if (this.id === "iphone-demo-video" && !refused) {
            refused = true;
            return Promise.reject(new DOMException("Test autoplay policy", "NotAllowedError"));
          }
          return play.call(this);
        };
      });
      await page.goto(`${origin}/fr`);
      await iphone.getByRole("tabpanel").scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((node) => node.readyState), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
      await expect(iphone.getByRole("button", { name: "Lire la démonstration", exact: true })).toBeVisible();
      await expect(iphone.getByRole("tabpanel").locator("img:visible")).toHaveCount(1);
      assert.equal(await video.evaluate((node) => node.paused), true);
      assert.deepEqual(errors, [], "Rejected play() must not become an unhandled rejection");
      await iphone.getByRole("button", { name: "Lire la démonstration", exact: true }).click();
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
      await expect(iphone.getByRole("button", { name: "Lire la démonstration", exact: true })).toHaveCount(0);

      await video.evaluate((node) => node.dispatchEvent(new Event("error")));
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
      const poster = iphone.getByRole("tabpanel").locator("img:visible");
      await expect(poster).toHaveCount(1);
      await expect.poll(() => poster.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
      await iphone.getByRole("tab").last().click();
      await expect(iphone.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
      await expect(poster).toBeVisible();
      assert.deepEqual(errors, [], "Media failure must preserve usable chapter posters");
    } finally {
      release();
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
      // ResizeObserver clears the bitmap before its scheduled static redraw.
      await expect.poll(() => canvas.evaluate((node) => node.width / devicePixelRatio)).toBe(768);
      await expect.poll(async () => (await readCanvas()).drawn).toBe(true);
      first = await readCanvas();
      assert.ok(first.drawn, "Canvas resize must redraw the static waveform");
      await page.waitForTimeout(150);
      assert.equal((await readCanvas()).hash, first.hash);
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: waveform pauses offscreen, on visibility change and reduced motion`, async () => {
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
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(100);
      paused = await canvasState(canvas);
      await page.waitForTimeout(150);
      assert.equal((await canvasState(canvas)).hash, paused.hash, "Reduced motion must stop the waveform");
    } finally {
      await context.close();
    }
  });

  await check(`${engine}: waveform keeps desktop proportions on narrow and tall windows`, async () => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const extent = () => page.locator("main canvas").first().evaluate((canvas) => {
      const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      let first = canvas.height;
      let last = -1;
      for (let row = 0; row < canvas.height; row++) {
        for (let column = 0; column < canvas.width; column++) {
          if (pixels[(row * canvas.width + column) * 4 + 3] > 10) {
            first = Math.min(first, row);
            last = row;
            break;
          }
        }
      }
      return (last - first + 1) / devicePixelRatio;
    });
    try {
      await page.goto(`${origin}/fr`);
      await expect.poll(extent).toBeGreaterThan(100);
      const desktop = await extent();
      assert.ok(desktop <= 190, `Desktop waveform is too tall: ${desktop}`);
      await page.setViewportSize({ width: 390, height: 600 });
      await expect.poll(extent).toBeLessThan(desktop * 0.45);
      const compact = await extent();
      assert.ok(compact > 20, "Compact waveform remains visible");
      await page.setViewportSize({ width: 390, height: 1000 });
      // ResizeObserver clears the canvas, then redraws on the following frame.
      await expect.poll(async () => Math.abs((await extent()) - compact), {
        message: "Waveform height must not grow with viewport height",
      }).toBeLessThanOrEqual(2);
    } finally { await context.close(); }
  });

  await check(`${engine}: localized Desktop captures and automatic motion lifecycle`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    try {
      await page.goto(`${origin}/fr`);
      const desktopImage = page.locator("#desktop figure img");
      await expect(desktopImage).toHaveAttribute("src", /desktop-general-fr\.jpg/);
      await page.getByRole("button", { name: "Switch to English" }).click();
      await page.waitForURL("**/en");
      await expect(desktopImage).toHaveAttribute("src", /desktop-general-en\.jpg/);
      await page.getByRole("button", { name: "Passer en francais" }).click();
      await page.waitForURL("**/fr");
      await expect(desktopImage).toHaveAttribute("src", /desktop-general-fr\.jpg/);
      const pill = page.locator("[data-dictation-pill]");
      await pill.scrollIntoViewIfNeeded();
      await expect(pill).toHaveAttribute("data-running", "true");
      const bars = () => pill.locator('[role="img"] span').evaluateAll((nodes) => nodes.map((node) => node.style.height));
      const movingBars = await bars();
      assert.equal(movingBars.length, 30);
      await expect.poll(bars).not.toEqual(movingBars);
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect(pill).toHaveAttribute("data-running", "false");
      const pausedBars = await bars();
      await page.waitForTimeout(180);
      assert.deepEqual(await bars(), pausedBars);
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect(pill).toHaveAttribute("data-running", "true");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(pill).toHaveAttribute("data-running", "false");
      const reducedBars = await bars();
      await page.waitForTimeout(180);
      assert.deepEqual(await bars(), reducedBars, "Reduced motion must hold the Desktop pill still");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect(pill).toHaveAttribute("data-running", "true");

      const story = page.locator("[data-glass-story]");
      await story.scrollIntoViewIfNeeded();
      await expect(story).toHaveAttribute("data-playing", "true");
      await expect(pill).toHaveAttribute("data-running", "false");
      const lens = story.locator("[data-glass-lens]");
      const position = () => lens.evaluate((node) => node.style.transform);
      await expect(lens).toBeVisible();
      await expect.poll(position).not.toBe("");
      const restingPosition = await position();
      // Wait for actual travel before testing automatic suspension, so a
      // permanently static surface cannot pass these lifecycle assertions.
      await expect.poll(position, { timeout: 11_000, intervals: [100] }).not.toBe(restingPosition);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(story).toHaveAttribute("data-playing", "false");
      const reducedPosition = await position();
      await page.waitForTimeout(180);
      assert.equal(await position(), reducedPosition, "A preference change must freeze the lens in place");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect(story).toHaveAttribute("data-playing", "true");
      await story.locator("[data-glass-story-content] p").first().evaluate((paragraph) => {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      });
      await expect(story).toHaveAttribute("data-text-selected", "true");
      await expect(story).toHaveAttribute("data-playing", "false");
      await expect(lens).toBeHidden();
      await page.evaluate(() => window.getSelection().removeAllRanges());
      await expect(story).toHaveAttribute("data-text-selected", "false");
      await expect(story).toHaveAttribute("data-playing", "true");
      await expect(lens).toBeVisible();
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect(story).toHaveAttribute("data-playing", "false");
      const hiddenPosition = await position();
      await page.waitForTimeout(180);
      assert.equal(await position(), hiddenPosition, "A hidden document must stop updating the lens");
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect(story).toHaveAttribute("data-playing", "true");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await expect(story).toHaveAttribute("data-playing", "false");
      const offscreenPosition = await position();
      await page.waitForTimeout(180);
      assert.equal(await position(), offscreenPosition, "An offscreen lens must stop updating");
      await story.scrollIntoViewIfNeeded();
      await expect(story).toHaveAttribute("data-playing", "true");
      await expect.poll(position, { timeout: 11_000, intervals: [100] }).not.toBe(offscreenPosition);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });

  await check(`${engine}: reduced motion stops the pill, glass story and iPhone transitions`, async () => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/fr`);
      const pill = page.locator("[data-dictation-pill]");
      await pill.scrollIntoViewIfNeeded();
      await expect(pill).toHaveAttribute("data-running", "false");
      await expect(pill.getByRole("button")).toHaveCount(0);
      await page.locator("#iphone-tab-2").click();
      const screen = page.locator("#iphone").getByRole("tabpanel");
      await expect(screen).toHaveCount(1);
      await expect(screen).toHaveAttribute("id", "iphone-screen");
      await expect(screen).toHaveAttribute("aria-labelledby", "iphone-tab-2");
      await expect(screen.locator("img:visible")).toHaveCount(1);
      const video = screen.locator("[data-iphone-video]");
      assert.equal(await video.evaluate((node) => node.paused), true);
      const videoTime = await video.evaluate((node) => node.currentTime);
      await page.waitForTimeout(180);
      // Metadata arrival may apply a pending seek, but must never start playback.
      assert.equal(await video.evaluate((node) => node.paused), true);
      assert.ok(await video.evaluate((node, appStart) => Math.abs(node.currentTime - appStart) < 1 / 60 || node.currentTime === 0 || node.currentTime === node.duration, iphoneAppStart),
        `Reduced-motion demo must show a static chapter (initial time ${videoTime})`);
      const story = page.locator("[data-glass-story]");
      await story.scrollIntoViewIfNeeded();
      await expect(story).toHaveAttribute("data-playing", "false");
      const lens = story.locator("[data-glass-lens]");
      await expect(lens).toBeVisible();
      const position = await lens.evaluate((node) => node.style.transform);
      await page.waitForTimeout(180);
      assert.equal(await lens.evaluate((node) => node.style.transform), position);
      await expect(page.locator("#uses").getByRole("button")).toHaveCount(0);
      const steps = page.locator("[data-glass-steps]");
      await steps.scrollIntoViewIfNeeded();
      await expect(steps).toHaveAttribute("data-playing", "false");
      await expect(steps.locator("[data-glass-step-orb]")).toBeHidden();
      await expect(steps.getByRole("button")).toHaveCount(0);
      for (const marker of await steps.locator("[data-glass-step-marker]").all()) await expect(marker).toBeVisible();
    } finally { await context.close(); }
  });

  await check(`${engine}: numbered glass orb visits each step and suspends automatically`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    try {
      for (const locale of ["fr", "en"]) {
        await page.goto(`${origin}/${locale}`);
        await page.evaluate(() => document.fonts.ready);
        const steps = page.locator("[data-glass-steps]");
        const orb = steps.locator("[data-glass-step-orb]");
        const markers = steps.locator("[data-glass-step-marker]");
        const time = () => orb.evaluate((node) => Number(node.getAnimations()[0]?.currentTime));
        const pausedTime = async () => {
          // WAAPI pause() schedules a pending pause task. Sample only after
          // that task has fixed the animation's hold time on the next frame.
          await expect.poll(() => orb.evaluate((node) => {
            const animation = node.getAnimations()[0];
            return animation?.playState === "paused" && !animation.pending;
          })).toBe(true);
          return time();
        };
        await steps.scrollIntoViewIfNeeded();
        await expect(steps).toHaveAttribute("data-ready", "true");
        await expect(steps).toHaveAttribute("data-playing", "true");
        await expect(steps.getByRole("list")).toHaveCount(1);
        await expect(steps.getByRole("listitem")).toHaveCount(3);
        await expect(steps.getByRole("heading", { level: 3 })).toHaveCount(3);
        assert.deepEqual(await markers.allTextContents(), ["01", "02", "03"]);
        await page.evaluate(() => {
          Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await expect(steps).toHaveAttribute("data-playing", "false");
        const pausedAt = await pausedTime();
        await page.waitForTimeout(150);
        assert.equal(await time(), pausedAt, "A hidden document must freeze the actual numbered path");

        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await settleFrames(page);
          await steps.scrollIntoViewIfNeeded();
          for (const [elapsed, index] of [[800, 0], [3200, 1], [5600, 2], [8000, 1], [10_400, 0]]) {
            await orb.evaluate((node, value) => { node.getAnimations()[0].currentTime = value; }, elapsed);
            await settleFrames(page);
            const separation = await steps.evaluate((node, markerIndex) => {
              const moving = node.querySelector("[data-glass-step-orb]").getBoundingClientRect();
              const marker = node.querySelectorAll("[data-glass-step-marker]")[markerIndex].getBoundingClientRect();
              return Math.hypot(moving.left + moving.width / 2 - marker.left - marker.width / 2,
                moving.top + moving.height / 2 - marker.top - marker.height / 2);
            }, index);
            assert.ok(separation <= 1, `${locale}/${width}: orb must merge into number ${index + 1}, including the return journey (${separation}px apart)`);
          }
          assert.ok(await markers.evaluateAll((nodes) => nodes.every((node) => !node.closest("svg") && getComputedStyle(node).filter === "none")),
            "Step numbers must remain outside the optical filters");
          await noOverflow(page);
        }
        await page.evaluate(() => {
          delete document.hidden;
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await expect(steps).toHaveAttribute("data-playing", "true");
        const resumedAt = await time();
        await expect.poll(time).toBeGreaterThan(resumedAt + 100);
        if (locale === "fr") {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
          await expect(steps).toHaveAttribute("data-playing", "false");
          const offscreenAt = await pausedTime();
          await page.waitForTimeout(150);
          assert.equal(await time(), offscreenAt);
          await steps.scrollIntoViewIfNeeded();
          await expect(steps).toHaveAttribute("data-playing", "true");
          await page.evaluate(() => {
            Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
            document.dispatchEvent(new Event("visibilitychange"));
          });
          await expect(steps).toHaveAttribute("data-playing", "false");
          const hiddenAt = await pausedTime();
          await page.waitForTimeout(150);
          assert.equal(await time(), hiddenAt);
          await page.evaluate(() => {
            delete document.hidden;
            document.dispatchEvent(new Event("visibilitychange"));
          });
          await expect(steps).toHaveAttribute("data-playing", "true");
          await page.emulateMedia({ reducedMotion: "reduce" });
          await expect(steps).toHaveAttribute("data-playing", "false");
          await expect(orb).toBeHidden();
          for (const marker of await markers.all()) await expect(marker).toBeVisible();
          await page.emulateMedia({ reducedMotion: "no-preference" });
        }
      }
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });

  await check(`${engine}: reading lens accelerates, brakes and settles between paragraphs`, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/fr`);
      const story = page.locator("[data-glass-story]");
      await story.scrollIntoViewIfNeeded();
      await expect(story).toHaveAttribute("data-playing", "true");
      const trajectory = await story.evaluate((node) => new Promise((resolve, reject) => {
        const lens = node.querySelector("[data-glass-lens]");
        const stops = [...node.querySelectorAll("[data-glass-story-content] [data-glass-story-stop]")];
        const bounds = node.getBoundingClientRect();
        const center = (stop) => {
          const rect = stop.getBoundingClientRect();
          return rect.top - bounds.top + rect.height / 2 - lens.getBoundingClientRect().height / 2;
        };
        const from = center(stops[0]);
        const to = center(stops[1]);
        const samples = [];
        const startedAt = performance.now();
        let settledAt;
        const sample = (time) => {
          const y = new DOMMatrixReadOnly(getComputedStyle(lens).transform).m42;
          samples.push({ time, progress: (y - from) / (to - from) });
          if (Math.abs(y - to) < 0.05) settledAt ??= time;
          if (settledAt && time - settledAt >= 240) {
            resolve(samples);
          } else if (time - startedAt > 8_000) {
            reject(new Error("Lens did not complete its first paragraph transition"));
          } else {
            requestAnimationFrame(sample);
          }
        };
        requestAnimationFrame(sample);
      }));
      assert.ok(trajectory[0].progress < 0.01, "Capture must start during the first reading pause");
      for (let index = 1; index < trajectory.length; index++) {
        assert.ok(trajectory[index].progress >= trajectory[index - 1].progress - 0.001,
          "The lens must travel continuously without reversing direction");
        assert.ok(trajectory[index].progress <= 1.001, "The reading lens must not overshoot its paragraph");
      }
      // Measure speed at equal fractions of the actual path, independently of
      // the implementation's easing function and display refresh rate.
      const timeAt = (progress) => {
        const index = trajectory.findIndex((sample) => sample.progress >= progress);
        assert.ok(index > 0, `Trajectory must cross ${progress * 100}% of its path`);
        const before = trajectory[index - 1];
        const after = trajectory[index];
        return before.time + (after.time - before.time)
          * (progress - before.progress) / (after.progress - before.progress);
      };
      const speed = (from, to) => (to - from) / (timeAt(to) - timeAt(from));
      const accelerating = speed(0.05, 0.2);
      const cruising = speed(0.4, 0.6);
      const braking = speed(0.8, 0.95);
      assert.ok(cruising > accelerating * 1.5, "The lens must visibly accelerate away from rest");
      assert.ok(cruising > braking * 1.5, "The lens must visibly brake before reaching the text");
      const travelMs = timeAt(0.999) - timeAt(0.001);
      const firstHoldMs = timeAt(0.001) - trajectory[0].time;
      assert.ok(firstHoldMs <= 2_200, `Reading stops must move on more frequently: ${Math.round(firstHoldMs)} ms before the first movement`);
      assert.ok(travelMs <= 1_200, `Paragraph travel feels too slow: ${Math.round(travelMs)} ms`);
      assert.ok(trajectory.filter(({ progress }) => progress > 0.01 && progress < 0.99).length >= 8,
        "The transition must contain continuous movement, not a jump between states");
      assert.ok(trajectory.slice(-5).every(({ progress }) => Math.abs(progress - 1) < 0.001),
        "The lens must settle at the destination so the paragraph can be read");
      return {
        travelMs: Math.round(travelMs),
        firstHoldMs: Math.round(firstHoldMs),
        accelerationRatio: Math.round(cruising / accelerating * 10) / 10,
        brakingRatio: Math.round(cruising / braking * 10) / 10,
      };
    } finally { await context.close(); }
  });

  await check(`${engine}: reading lens visibly refracts text only as its rim crosses`, async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/fr`);
      await page.evaluate(() => document.fonts.ready);
      const story = page.locator("[data-glass-story]");
      const heading = story.locator("[data-glass-story-content] h3").first();
      await story.scrollIntoViewIfNeeded();
      await expect(story).toHaveAttribute("data-playing", "true");
      // Freeze the genuine animation when its top rim crosses the title.
      // Do not move the filter manually: the test must exercise the shared
      // animation clock and the actual browser's displacement renderer.
      await story.evaluate((node) => new Promise((resolve, reject) => {
        const lens = node.querySelector("[data-glass-lens]");
        const title = node.querySelector("[data-glass-story-content] h3");
        const started = performance.now();
        const sample = () => {
          const rim = lens.getBoundingClientRect();
          const text = title.getBoundingClientRect();
          if (rim.top >= text.top + text.height * 0.35 - 8 && rim.top < text.bottom - 3) {
            Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
            document.dispatchEvent(new Event("visibilitychange"));
            resolve();
          } else if (performance.now() - started > 8_000) {
            reject(new Error("The moving glass rim did not cross the first title"));
          } else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }));
      await expect(story).toHaveAttribute("data-playing", "false");
      await settleFrames(page);
      const refracted = await heading.screenshot({ style: "header { display: none !important; }" });
      const plain = await heading.screenshot({
        style: "header, [data-glass-rim-refraction] { display: none !important; }",
      });
      const glyphChange = changedTextInk(refracted, plain);
      assert.ok(glyphChange > 0.05,
        `${engine}: crossing the rim must visibly refract the title (${Math.round(glyphChange * 100)}% changed)`);
      return { rimGlyphChange: glyphChange };
    } finally { await context.close(); }
  });

  await check(`${engine}: reading lens keeps original text crisp and unobstructed`, async () => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    let glyphChange = 0;
    try {
      for (const locale of ["fr", "en"]) {
        await page.goto(`${origin}/${locale}`);
        await page.evaluate(() => document.fonts.ready);
        const story = page.locator("[data-glass-story]");
        const original = story.locator("[data-glass-story-content]");
        const lens = story.locator("[data-glass-lens]");
        await expect(lens).toBeVisible();
        await expect(original).toHaveCount(1);
        const refraction = story.locator("[data-glass-rim-refraction]");
        await expect(refraction).toHaveCount(1);
        await expect(refraction).toHaveAttribute("aria-hidden", "true");
        await expect(refraction).toHaveAttribute("inert", "");
        assert.match(await refraction.evaluate((node) => getComputedStyle(node).clipPath), /url\(/,
          "The optical copy must be clipped to its rim, leaving a clear reading center");
        const rimClip = story.locator("[data-glass-rim-clip]");
        await expect(rimClip).toHaveAttribute("clip-rule", "evenodd");
        assert.equal((await rimClip.getAttribute("d")).match(/M/g)?.length, 2,
          "The ring must include an outer contour and an excluded inner contour");
        assert.ok(await refraction.locator("feDisplacementMap").count() > 0,
          "The rim must use actual optical displacement, not only a pale border");
        const headings = original.locator("h3");
        await expect(headings).toHaveCount(3);
        await expect(story.getByRole("heading", { level: 3 })).toHaveCount(3);
        assert.deepEqual(await story.getByRole("heading", { level: 3 }).allTextContents(), await headings.allTextContents());
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await settleFrames(page);
          await story.scrollIntoViewIfNeeded();
          await expect.poll(() => story.evaluate((node) => {
            const bounds = node.getBoundingClientRect();
            const lensBounds = node.querySelector("[data-glass-lens]").getBoundingClientRect();
            return Math.abs(lensBounds.width - (bounds.width - 8));
          }), { message: `${locale}/${width}: lens must span the paragraph column` }).toBeLessThanOrEqual(1);
          const geometry = await story.evaluate((node) => {
            const lensBounds = node.querySelector("[data-glass-lens]").getBoundingClientRect();
            const stopBounds = node.querySelector("[data-glass-story-content] [data-glass-story-stop]").getBoundingClientRect();
            return {
              covers: lensBounds.left <= stopBounds.left && lensBounds.right >= stopBounds.right
                && lensBounds.top <= stopBounds.top && lensBounds.bottom >= stopBounds.bottom,
              width: lensBounds.width, height: lensBounds.height,
              leftClearance: stopBounds.left - lensBounds.left,
              rightClearance: lensBounds.right - stopBounds.right,
            };
          });
          assert.ok(geometry.covers, `${locale}/${width}: resting lens must enclose the full text block (${JSON.stringify(geometry)})`);
          const minimumClearance = width < 640 ? 30 : 40;
          assert.ok(Math.min(geometry.leftClearance, geometry.rightClearance) > minimumClearance,
            `${locale}/${width}: text needs breathing room inside the glass (${JSON.stringify(geometry)})`);
          const filters = await original.evaluate((node) => [node, ...node.querySelectorAll("h3, p")].map((element) => ({
            filter: getComputedStyle(element).filter,
            clip: getComputedStyle(element).clipPath,
          })));
          assert.ok(filters.every(({ filter, clip }) => filter === "none" && clip === "none"),
            "Paragraph text must not pass through distortion filters or masks");
          await noOverflow(page);
          if (locale === "fr" && width === 390) {
            // Reduced motion fixes the lens over the first paragraph so every
            // engine gets the same inspectable glass backdrop.
            await captureScene(page, "uses", join(artifacts, `${engine}-390-reading-lens-rest.png`));
            const glassText = await headings.first().screenshot({
              ...(screenshots ? { path: join(artifacts, `${engine}-lens-text.png`) } : {}),
              style: "header { display: none !important; }",
            });
            const plainText = await headings.first().screenshot({
              ...(screenshots ? { path: join(artifacts, `${engine}-plain-text.png`) } : {}),
              style: "header, [data-glass-lens], [data-glass-rim-refraction] { display: none !important; }",
            });
            glyphChange = changedTextInk(glassText, plainText);
            assert.ok(glyphChange <= 0.08,
              `${engine}: glass must leave text glyphs stable (${Math.round(glyphChange * 100)}% changed)`);
          }
        }
      }
      assert.deepEqual(errors, []);
      return { glyphChange };
    } finally { await context.close(); }
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

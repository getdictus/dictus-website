import { readFileSync, writeFileSync } from "fs";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const svgSource = readFileSync("src/assets/brand/appicon-light.svg", "utf-8");

// Generate PNG at a given size from the SVG
function renderSvgToPng(svg, width, height) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  });
  const rendered = resvg.render();
  return rendered.asPng();
}

// 1. icon.png — 32x32 favicon
const icon32 = renderSvgToPng(svgSource, 32);
writeFileSync("src/app/icon.png", icon32);
console.log("✓ icon.png (32x32)");

// 2. apple-icon.png — 180x180
const icon180 = renderSvgToPng(svgSource, 180);
writeFileSync("src/app/apple-icon.png", icon180);
console.log("✓ apple-icon.png (180x180)");

// 3. GitHub avatar — 500x500
const icon500 = renderSvgToPng(svgSource, 500);
writeFileSync("src/assets/brand/github-avatar.png", icon500);
console.log("✓ github-avatar.png (500x500)");

// 4. og-image.png — 1200x630, icon centered on #0A1628 background
const iconForOg = renderSvgToPng(svgSource, 280);
const ogImage = await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: { r: 10, g: 22, b: 40, alpha: 1 }, // #0A1628
  },
})
  .composite([
    {
      input: iconForOg,
      gravity: "centre",
    },
  ])
  .png()
  .toBuffer();
writeFileSync("public/og-image.png", ogImage);
console.log("✓ og-image.png (1200x630)");

console.log("\nAll icons generated.");

// Fails if a directory (default src/) contains a violet or purple colour:
// Tailwind violet/purple/fuchsia/indigo utilities, or any hex, rgb() or hsl()
// colour whose hue is 255-320 deg with saturation above 25 %.
// Local check, not wired into CI.
// node scripts/check-no-violet.mjs [dir]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] || "src";
const exts = /\.(css|scss|ts|tsx|js|jsx|mjs|json|md|mdx|svg|html)$/;
const named = /\b(?:violet|purple|fuchsia|indigo)-\d{2,3}\b|\b(?:violet|purple|fuchsia|indigo|magenta|orchid|plum|lavender)\b(?=\s*[;,)"'])/gi;
const hex = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const rgb = /rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/gi;
const hsl = /hsla?\(\s*(-?\d+(?:\.\d+)?)(?:deg)?[\s,]+(\d+(?:\.\d+)?)%/gi;

function hueSat(r, g, b) {
  [r, g, b] = [r / 255, g / 255, b / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return [0, 0];
  const s = d / (1 - Math.abs(max + min - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s * 100];
}

const isViolet = ([h, s]) => h >= 255 && h <= 320 && s > 25;

function hexToRgb(value) {
  let v = value.slice(1);
  if (v.length <= 4) v = [...v].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (exts.test(name)) yield path;
  }
}

const hits = [];
for (const file of walk(root)) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    const at = `${relative(process.cwd(), file)}:${i + 1}`;
    for (const m of line.matchAll(named)) hits.push(`${at} ${m[0]}`);
    for (const m of line.matchAll(hex)) {
      if (isViolet(hueSat(...hexToRgb(m[0])))) hits.push(`${at} ${m[0]}`);
    }
    for (const m of line.matchAll(rgb)) {
      if (isViolet(hueSat(+m[1], +m[2], +m[3]))) hits.push(`${at} ${m[0]}`);
    }
    for (const m of line.matchAll(hsl)) {
      if (isViolet([((+m[1] % 360) + 360) % 360, +m[2]])) hits.push(`${at} ${m[0]}`);
    }
  });
}

if (hits.length) {
  console.error(`Violet or purple colours found in ${root}/:\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`No violet or purple colours in ${root}/.`);

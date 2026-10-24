// WCAG 2.x contrast ratios for the v4b text/ground pairs documented in globals.css.
// node scripts/contrast-v4b.mjs
const pairs = [
  ["#1F5FE0", "#FFFFFF", "accent-text on white"],
  ["#1F5FE0", "#F2F2F7", "accent-text on grey"],
  ["#FFFFFF", "#3D7EFF", "white on blue"],
  ["#3D7EFF", "#FFFFFF", "accent on white"],
  ["#0A1628", "#3D7EFF", "ink on blue"],
  ["#B8C4D9", "#0A1628", "on-navy body on navy"],
  ["#33415C", "#FFFFFF", "body on white"],
  ["#33415C", "#F2F2F7", "body on grey"],
  ["#5B6880", "#FFFFFF", "muted on white"],
  ["#5B6880", "#F2F2F7", "muted on grey"],
];

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const verdict = (ok) => (ok ? "pass" : "FAIL");
console.log("| Text | Ground | Pair | Ratio | AA normal (4.5) | AA large (3.0) |");
console.log("|---|---|---|---|---|---|");
for (const [fg, bg, label] of pairs) {
  const r = ratio(fg, bg);
  console.log(`| \`${fg}\` | \`${bg}\` | ${label} | ${r.toFixed(2)}:1 | ${verdict(r >= 4.5)} | ${verdict(r >= 3)} |`);
}

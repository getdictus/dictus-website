// Checks the pure hero geometry (src/components/Hero/strokes.ts): the three
// felt-pen strokes never touch, from the mouth (u = 0) to the pill (u = 1),
// they stay clear of the phone and the arm, they never loop back, and the
// scene stays clear of the hero text.
//
// Run with `npm run test:hero` (Node 22.18+ strips the TypeScript types).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MIN_VISIBLE_GAP,
  WALKER,
  heroLayout,
  mouthBob,
  polylineDistance,
  rectDistance,
  sampleArc,
  strokePolylines,
  walkerObstacles,
} from "../src/components/Hero/strokes.ts";

// Scene boxes measured on the page (Playwright, Chromium). In side mode the
// box is the hero and `text` lists the headline, subtitle, buttons and
// Desktop line, each the union of its FR and EN boxes. In stack and compact
// modes the box sits under the text, so its own top edge is the limit.
const layouts = [
  { name: "1440x900", mode: "side", width: 1440, height: 900, text: [{ x0: 378, y0: 112, x1: 1062, y1: 377 }, { x0: 450, y0: 401, x1: 990, y1: 458 }, { x0: 544, y0: 466, x1: 896, y1: 538 }, { x0: 515, y0: 538, x1: 925, y1: 582 }] },
  { name: "1920x1080", mode: "side", width: 1920, height: 1080, text: [{ x0: 618, y0: 112, x1: 1302, y1: 377 }, { x0: 690, y0: 401, x1: 1230, y1: 458 }, { x0: 784, y0: 466, x1: 1136, y1: 538 }, { x0: 755, y0: 538, x1: 1165, y1: 582 }] },
  { name: "1280x800", mode: "side", width: 1280, height: 800, text: [{ x0: 336, y0: 112, x1: 944, y1: 348 }, { x0: 370, y0: 371, x1: 910, y1: 421 }, { x0: 464, y0: 429, x1: 816, y1: 501 }, { x0: 435, y0: 501, x1: 845, y1: 545 }] },
  { name: "1366x768 (hero 800)", mode: "side", width: 1366, height: 800, text: [{ x0: 358, y0: 112, x1: 1008, y1: 363 }, { x0: 413, y0: 387, x1: 953, y1: 442 }, { x0: 507, y0: 450, x1: 859, y1: 522 }, { x0: 478, y0: 522, x1: 888, y1: 566 }] },
  { name: "1200x700 (hero 800)", mode: "side", width: 1200, height: 800, text: [{ x0: 315, y0: 112, x1: 885, y1: 333 }, { x0: 330, y0: 354, x1: 870, y1: 403 }, { x0: 424, y0: 410, x1: 776, y1: 482 }, { x0: 395, y0: 482, x1: 805, y1: 526 }] },
  { name: "1024x768", mode: "stack", width: 1024, height: 456 },
  { name: "768x1024", mode: "stack", width: 768, height: 456 },
  { name: "1199x900", mode: "stack", width: 1199, height: 456 },
  { name: "1440x650", mode: "stack", width: 1440, height: 456 },
  { name: "390x844", mode: "compact", width: 390, height: 411 },
  { name: "390x664", mode: "compact", width: 390, height: 372 },
  { name: "375x812", mode: "compact", width: 375, height: 372 },
  { name: "360", mode: "compact", width: 360, height: 372 },
  { name: "759", mode: "compact", width: 759, height: 372 },
];

const times = Array.from({ length: 67 }, (_, i) => i * 0.25); // the 16.5 s loop
const bobs = (layout) => [0, mouthBob(1.1 * 0.25, layout.walker.w), mouthBob(1.1 * 0.12, layout.walker.w)];

for (const fixture of layouts) {
  const layout = heroLayout(fixture.mode, fixture.width, fixture.height);

  test(`${fixture.name}: neighbouring strokes stay visibly apart from u = 0 to u = 1`, () => {
    let worst = { gap: Infinity };
    for (const t of times) for (const bob of bobs(layout)) {
      const lines = strokePolylines(layout, t, bob);
      for (let i = 0; i < 2; i++) {
        const need = (layout.strokes[i].width + layout.strokes[i + 1].width) / 2 + MIN_VISIBLE_GAP[layout.scale];
        const gap = polylineDistance(lines[i], lines[i + 1]);
        if (gap - need < (worst.gap ?? Infinity) - (worst.need ?? 0)) worst = { gap, need, t, bob, pair: i };
        assert.ok(gap > need, `pair ${i} at t=${t}, bob=${bob.toFixed(1)}: axes ${gap.toFixed(2)} px apart, need > ${need.toFixed(2)}`);
      }
    }
    // The mouth exit on its own (the mockup's defect: 4.6 px at 1440, 2.9 px at 390).
    for (const t of times) {
      const lines = strokePolylines(layout, t, 0);
      for (let i = 0; i < 2; i++) {
        const need = (layout.strokes[i].width + layout.strokes[i + 1].width) / 2 + MIN_VISIBLE_GAP[layout.scale];
        const d = Math.hypot(lines[i][0].x - lines[i + 1][0].x, lines[i][0].y - lines[i + 1][0].y);
        assert.ok(d > need, `first points of pair ${i} at t=${t}: ${d.toFixed(2)} px`);
      }
    }
    console.log(`  ${fixture.name}: narrowest axis gap ${worst.gap.toFixed(2)} px (needs > ${worst.need.toFixed(2)})`);
  });

  test(`${fixture.name}: strokes clear the phone and the arm`, () => {
    let closest = Infinity;
    for (const t of times) for (const bob of bobs(layout)) {
      // The phone and the arm ride the bob with the mouth.
      for (const [index, line] of strokePolylines(layout, t, bob).entries()) {
        for (const rect of walkerObstacles(layout.walker, bob)) {
          const d = rectDistance(line, rect) - layout.strokes[index].width / 2;
          closest = Math.min(closest, d);
          assert.ok(d > 4, `stroke ${index} at t=${t} comes ${d.toFixed(1)} px from the walker`);
        }
      }
    }
    console.log(`  ${fixture.name}: closest approach to phone/arm ${closest.toFixed(1)} px`);
  });

  test(`${fixture.name}: the arc never loops back and bends gently`, () => {
    const { samples } = sampleArc(layout.arc);
    for (let i = 1; i < samples.length; i++) {
      assert.ok(samples[i].x >= samples[i - 1].x - 1e-6, `x goes back at u=${samples[i].u.toFixed(3)}`);
    }
    // Radius of curvature from three consecutive samples: it must stay well
    // above the outer strokes' offset, or the offsets fold onto each other.
    const reach = layout.spacing.middle + layout.spacing.common + layout.spacing.differential;
    let tightest = Infinity;
    for (let i = 2; i < samples.length; i++) {
      const [a, b, c] = [samples[i - 2], samples[i - 1], samples[i]];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      const radius = (Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(c.x - b.x, c.y - b.y) * Math.hypot(c.x - a.x, c.y - a.y)) / (2 * Math.abs(cross) || 1e-9);
      tightest = Math.min(tightest, radius);
    }
    assert.ok(tightest > 2 * reach, `tightest bend ${tightest.toFixed(1)} px, needs > ${2 * reach} px`);
    console.log(`  ${fixture.name}: tightest bend radius ${tightest.toFixed(0)} px`);
  });

  test(`${fixture.name}: the scene stays clear of the text`, () => {
    const lines = times.flatMap((t) => bobs(layout).flatMap((bob) => strokePolylines(layout, t, bob)));
    if (fixture.mode === "side") {
      const walker = { x0: layout.walker.x + 0.09 * layout.walker.w, y0: layout.walker.y, x1: layout.walker.x + 0.97 * layout.walker.w, y1: layout.walker.y + layout.walker.h };
      for (const rect of fixture.text) {
        for (const line of lines) assert.ok(rectDistance(line, rect) > 16, `a stroke comes within 16 px of the text at ${JSON.stringify(rect)}`);
        const overlapX = Math.min(walker.x1, rect.x1) - Math.max(walker.x0, rect.x0);
        const overlapY = Math.min(walker.y1, rect.y1) - Math.max(walker.y0, rect.y0);
        assert.ok(overlapX < -16 || overlapY < -16, `walker overlaps the text at ${JSON.stringify(rect)}`);
        const p = layout.pill;
        const pillRect = { x0: p.cx - p.w / 2, y0: p.cy - p.h / 2, x1: p.cx + p.w / 2, y1: p.cy + p.h / 2 };
        assert.ok(pillRect.y0 > rect.y1 + 16 || pillRect.x1 < rect.x0 - 16 || pillRect.x0 > rect.x1 + 16, "pill overlaps the text");
      }
    } else {
      const top = Math.min(...lines.flatMap((line) => line.map((p) => p.y)));
      assert.ok(top > 8, `strokes rise to ${top.toFixed(1)} px, above the scene box`);
      assert.ok(layout.walker.y >= -1, "walker taller than the scene box");
    }
  });
}

test("mouthBob follows the rig: 0 at contact, -10.6 px at passing for a 212 px walker", () => {
  assert.equal(mouthBob(0, 212), 0);
  assert.ok(Math.abs(mouthBob(1.1 / 4, 212) + 2 * WALKER.bobPx) < 1e-9);
  assert.ok(Math.abs(2 * WALKER.bobPx - 10.6) < 0.1);
  assert.ok(Math.abs(mouthBob(5.5, 212)) < 1e-9, "the loop closes");
});

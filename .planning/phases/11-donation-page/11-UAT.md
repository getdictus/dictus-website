---
status: resolved
phase: 11-donation-page
source: [11-01-SUMMARY.md, 11-02-SUMMARY.md, 11-03-SUMMARY.md]
started: 2026-04-09T21:30:00Z
updated: 2026-04-16T07:55:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Donate page loads in French
expected: Visiting /fr/donate displays a donation page with a heading, motivation text, two cards side by side (Fiat and Bitcoin), and a thank-you section. Page title and metadata are in French.
result: issue
reported: "pas fan du design de manière générale. Pas fan du mot 'contribuer': fait axer contribution au dev pas financier. Les icônes carte et bitcoin vraiment pas belles — utiliser Iconify (icones.js.org)."
severity: major

### 2. Donate page loads in English
expected: Visiting /en/donate displays the same page structure but with all text in English. Language toggle switches between /fr/donate and /en/donate.
result: pass

### 3. Fiat card — amount chips and custom input
expected: The Fiat (Stripe) card shows 4 selectable amount chips: 5, 10, 25, 50 EUR. A custom amount input field is available below. Selecting a chip highlights it. The card uses glassmorphism styling with hover glow effect.
result: issue
reported: "Les flèches du custom montant ne sont pas belles — devraient prendre toute la hauteur et être au bout à droite de la cellule montant. Boutons Contribuer mal placés. Globalement la page est mal équilibrée (critique pour Test 1)."
severity: major

### 4. Bitcoin card — CTA and styling
expected: The Bitcoin card has a CTA button to open a BTCPay Server invoice. The card matches the glassmorphism Tier 2 styling of the Fiat card with hover glow.
result: pass

### 5. Terminology — "Contribution" not "Donation"
expected: All text on the page uses "Contribution" / "Contribuer" terminology. The word "Don" or "Donation" does not appear anywhere on the page.
result: pass

### 6. Nav — accent pill button
expected: The navigation bar shows an accent blue pill button labeled "Contribuer" (FR) or "Contribute" (EN) that links to /donate. The button has a minimum touch target of 44px.
result: pass

### 7. Footer — contribute text link
expected: The footer contains a "Contribuer" / "Contribute" text link after the Support link, separated by a dot. Clicking it navigates to /donate.
result: pass

### 8. Setup documentation — Stripe guide
expected: docs/setup-stripe.md exists and contains step-by-step instructions for Stripe account creation, Payment Link setup for 5/10/25/50 EUR amounts, and references src/config/donate.ts for configuration.
result: pass

### 9. Setup documentation — BTCPay guide
expected: docs/setup-btcpay.md exists and contains deployment options (Umbrel and Hetzner), store configuration, phoenixd Lightning setup, and references src/config/donate.ts for configuration.
result: pass

## Summary

total: 9
passed: 7
issues: 2
pending: 0
skipped: 0

## Design Decisions (agreed with user 2026-04-14, consume during planning)

- **Terminology**: rename "Contribuer/Contribute" → "Soutenir/Support" everywhere (i18n keys, Nav pill, Footer link, donate page copy, page metadata, HTML title, OG tags).
  - i18n keys: `Nav.contribute_label` → `Nav.support_label`, `Footer.contribute_link` → `Footer.support_link`, donate page namespace updated accordingly.
- **Icon library**: install `@iconify/react` (pick latest stable, tree-shaken on-demand loading). No other icon packs — Iconify sources everything.
- **Card icons**:
  - Fiat: `solar:card-bold-duotone` (fallback `solar:card-2-bold-duotone` if rendering feels off — builder decides during implementation).
  - Bitcoin: `bitcoin-icons:bitcoin-circle-filled`.
  - **Keep** the existing navy squircle tile around the icon (brand consistency). Icon rendered white/accent inside the tile.
- **Card layout (Option A1 — stacked hierarchy)**:
  1. Header row: tile+icon (left) + title + subtitle stacked (right).
  2. Subtle divider (border-hi at 0.07 opacity).
  3. Amounts block: fixed **4-column grid** for chips (5 / 10 / 25 / 50 EUR on a single row at all breakpoints >= sm; 2x2 on xs). Below chips: custom amount input + stepper.
  4. Divider.
  5. CTA: **full-width** button at the bottom of the card, using the brand `Button gradient` token (`linear-gradient(135deg, #1A4E8A, #0F3460)`).
- **Custom amount stepper**:
  - Replace native `<input type="number">` (no browser spinner).
  - Text input masked to digits only.
  - Suffix "€" visible at the left or right of the input (builder choice, must read natural in FR/EN).
  - On the right edge: a **full-height** stepper block with two stacked chevrons (up / down), separated by a 1px divider. Hover = accent glow.
  - Increment = **+1 EUR** per chevron click (standard, not tied to chip values).
- **Chip states**:
  - Default: border-hi outline, text mist.
  - Hover: micro-scale 1.02 + glow soft.
  - Selected: accent translucent fill + accent border + glow soft.
- **Page composition (overall rebalance)**:
  1. Hero section: title "Soutenir Dictus" / "Support Dictus" + motivation paragraph (keep the current copy or refine lightly).
  2. Two cards side-by-side (desktop) / stacked (mobile).
  3. **New "Pourquoi soutenir ?" / "Why support ?" section** — 3 short inline bullets (NOT cards), values-focused: "100% offline", "Open source", "Indépendant / Independent". Sober text-mist styling, small, inline on desktop, stacked on mobile.
  4. Thank-you line at the bottom (slim, centered, text-mist).
- **Out of scope for this gap closure**: changing Stripe Payment Link URLs, BTCPay config, or the payment flow itself. This is a UI/UX refinement pass.

## Gaps

- truth: "Donate page design is polished and uses terminology that clearly signals financial support"
  status: resolved
  reason: |
    User reported three combined issues on Test 1:
    1. Word "Contribuer/Contribute" feels like open-source dev contribution, not financial support. Replace with "Soutenir/Support" across Nav, Footer, donate page, i18n keys, and metadata.
    2. Card icons (Fiat credit card icon, Bitcoin icon) look unpolished. Replace with higher-quality icons from Iconify (icones.js.org), installed via @iconify/react.
    3. Overall card design feels weak — user suspects icons are a large part of the issue. Revisit card visual design alongside icon replacement (proportions, iconography, hierarchy).
  severity: major
  test: 1
  root_cause: |
    Design and copy decisions (not a code bug). Three distinct UX gaps:
    (a) Terminology choice "Contribuer/Contribute" was chosen as an anti-"donation" softener, but creates ambiguity with open-source contribution; user prefers "Soutenir/Support" (common pattern for indie projects).
    (b) Card icons use default/inline SVGs that don't match the polish bar set by the rest of the brand; need a professional icon set (Iconify) with consistent stroke/fill language.
    (c) Card visual composition (icon + title + chips + custom input + CTA) was built feature-first; needs a deliberate pass to improve hierarchy, spacing, and iconography together.
  artifacts:
    - path: "src/components/DonateCards.tsx"
      issue: "Inline SVG icons are unpolished; card layout needs visual rework"
    - path: "src/components/Nav.tsx"
      issue: "Uses Nav.contribute_label — needs rename to support_label"
    - path: "src/components/Footer.tsx"
      issue: "Uses Footer.contribute_link — needs rename to support_link"
    - path: "src/i18n/messages/fr.json"
      issue: "Contains Contribuer terminology across Nav/Footer/donate keys"
    - path: "src/i18n/messages/en.json"
      issue: "Contains Contribute terminology across Nav/Footer/donate keys"
    - path: "src/app/[locale]/donate/page.tsx"
      issue: "Page metadata and copy reference Contribuer terminology"
    - path: "package.json"
      issue: "@iconify/react not installed"
  missing:
    - "Rename 'Contribuer'/'Contribute' → 'Soutenir'/'Support' in i18n keys (Nav.contribute_label → Nav.support_label, Footer.contribute_link → Footer.support_link, donate page namespace) and update all call sites"
    - "Install @iconify/react dependency"
    - "Replace Fiat and Bitcoin card icons with Iconify icons (choose polished set, e.g. solar, ph, lucide)"
    - "Review and refine card visual design (layout, spacing, icon sizing, hierarchy) once icons are upgraded"
  debug_session: ""

- truth: "Custom amount input and CTA button inside each card are visually polished and well-placed"
  status: resolved
  reason: |
    User reported on Test 3 (with screenshot):
    1. Native number input spinner arrows on custom Montant field look ugly and small. Expected: custom chevron buttons (or +/- controls) taking full cell height, positioned at the right edge of the input field.
    2. CTA button ("Contribuer", will become "Soutenir") placement inside the card is awkward — sits next to the custom input in a cramped way, making the card feel off-balance.
    3. Overall donate page layout feels unbalanced (reinforces Test 1 design gap). Two cards side-by-side with current chip wrapping (5/10/25 on row 1, 50 alone on row 2) contribute to visual weight imbalance.
  severity: major
  test: 3
  root_cause: |
    DonateCards.tsx uses a bare <input type="number"> which renders native browser spinner arrows (ugly, tiny, non-themed). The CTA was placed inline next to the custom input because no deliberate vertical layout was defined for the card footer. Chip container uses flex-wrap without a fixed grid — 4 chips at current chip width force a 3+1 wrap on the card's column width. No design-time pass was done on card composition after assembling the primitives.
  artifacts:
    - path: "src/components/DonateCards.tsx"
      issue: "Native number input with browser spinner; inline CTA next to Montant input; flex-wrap chip row causes 3+1 layout"
  missing:
    - "Replace native number input spinner with custom full-height stepper control (chevron up/down or +/-) anchored to the right edge of the amount cell"
    - "Rework CTA placement inside each card — consider full-width button at the bottom of the card, separated from the amount controls"
    - "Fix chip layout so 4 chips fit cleanly (single row on desktop, 2x2 grid on narrow) without the orphaned 50 EUR on a second row"
    - "Rebalance overall page composition (card proportions, spacing between cards, vertical rhythm of sections)"
  debug_session: ""

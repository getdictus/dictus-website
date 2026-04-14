---
phase: 11-donation-page
verified: 2026-04-14T22:00:00Z
status: passed
score: 8/8 must-haves verified
re_verification:
  previous_status: passed
  previous_score: 6/6
  gaps_closed:
    - "Donate page design is polished and uses terminology that clearly signals financial support"
    - "Custom amount input and CTA button inside each card are visually polished and well-placed"
  gaps_remaining: []
  regressions: []
---

# Phase 11: Donation Page Verification Report (Re-verification after Gap Closure)

**Phase Goal:** Visitors can access /donate and choose to contribute via Stripe (fiat) or BTCPay Server (Bitcoin)
**Verified:** 2026-04-14T22:00:00Z
**Status:** passed
**Re-verification:** Yes — after gap closure (plans 11-04 and 11-05)

## Gap-Closure Context

Two UAT gaps were recorded in 11-UAT.md and addressed by plans 11-04 and 11-05:

1. **UAT Test 1 gap** — Terminology "Contribuer/Contribute" felt like open-source dev contribution rather than financial support; card icons unpolished; overall card design weak. Closed by 11-04 (terminology rename, @iconify/react install) and 11-05 (A1 card visual rework with Iconify icons).
2. **UAT Test 3 gap** — Native number input spinner ugly; CTA button placement cramped; 4-chip grid wrapped into 3+1 layout. Closed by 11-05 (custom stepper, full-width CTA, 4-col grid).

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visiting /fr/donate and /en/donate displays a bilingual donation page with two cards and structural integrity | VERIFIED | page.tsx: generateStaticParams, generateMetadata, DonateCards, why_support section, Footer — all present and substantive (83 lines) |
| 2 | No user-facing string or i18n key uses "Contribuer" or "Contribute" — replaced by "Soutenir"/"Support" everywhere | VERIFIED | `grep -rn "contribute_label\|contribute_link\|Contribuer" src/` returns no matches; support_label/support_link present in both locales |
| 3 | Nav pill and Footer link use support_label/support_link keys with correct values | VERIFIED | Nav.tsx line 37: t("support_label"); Footer.tsx lines 80+87: t("help_link") / t("support_link"); fr.json: "Soutenir", en.json: "Support" |
| 4 | Both donate cards use Iconify icons (solar:card-bold-duotone, bitcoin-icons:bitcoin-circle-filled) inside the navy squircle tile | VERIFIED | DonateCards.tsx lines 114-120 and 239-245: Icon components with correct icon props; tileClass = "bg-navy" squircle; import { Icon } from "@iconify/react" at line 5 |
| 5 | Chips use a fixed 4-column grid (sm:grid-cols-4 / grid-cols-2 at xs) — no orphaned 50 EUR chip | VERIFIED | DonateCards.tsx lines 137 and 265: "grid grid-cols-2 gap-3 sm:grid-cols-4" on both cards |
| 6 | Custom amount input has no native browser spinner; uses digit-only text input with right-edge full-height stepper (+/-1 EUR) | VERIFIED | No type="number" found; inputMode="numeric" at lines 161+289; sanitizeDigits + clampStep helpers present; stepper buttons with Icon arrows at lines 183-213 (Fiat) and 311-339 (Bitcoin) |
| 7 | Each card ends with a full-width gradient CTA using linear-gradient(135deg, #1A4E8A, #0F3460) | VERIFIED | ctaStyle = {backgroundImage: "linear-gradient(135deg, #1A4E8A, #0F3460)"} at line 104; ctaClass includes "w-full mt-auto" at line 102; applied to both CTA buttons |
| 8 | "Pourquoi soutenir ? / Why support?" section appears between cards and thank-you with 3 inline bullets | VERIFIED | page.tsx lines 45-75: section with aria-labelledby="why-support-title", ul with 3 li items using why_support_offline/opensource/independent i18n keys; both locales have all 4 keys |

**Score:** 8/8 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | @iconify/react dependency | VERIFIED | Line 12: "@iconify/react": "^6.0.2" in dependencies |
| `src/messages/fr.json` | Renamed keys (support_label, support_link, help_link) + why_support_* | VERIFIED | Lines 6, 100-101, 163-166: all keys present with correct FR values |
| `src/messages/en.json` | Renamed keys + why_support_* (EN variants) | VERIFIED | Lines 6, 100-101, 163-166: all keys present with correct EN values |
| `src/components/Nav/Nav.tsx` | Uses t('support_label') | VERIFIED | Line 37: t("support_label") |
| `src/components/Footer/Footer.tsx` | Uses t('support_link') for donate, t('help_link') for /support page | VERIFIED | Line 80: t("help_link"); line 87: t("support_link") — key collision resolved correctly |
| `src/components/Donate/DonateCards.tsx` | A1 layout, Iconify icons, 4-col grid, custom stepper, full-width gradient CTA — min 150 lines | VERIFIED | 363 lines; all required patterns confirmed by grep |
| `src/app/[locale]/donate/page.tsx` | Why support? section between DonateCards and thank-you | VERIFIED | Lines 45-75: section with all 4 why_support_* keys; DonateCards + Footer + generateStaticParams + generateMetadata preserved |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/Nav/Nav.tsx` | `src/messages/fr.json (Nav.support_label)` | `t('support_label')` | WIRED | Line 37 in Nav.tsx; fr.json = "Soutenir", en.json = "Support" |
| `src/components/Footer/Footer.tsx` | `src/messages/fr.json (Footer.support_link)` | `t('support_link')` | WIRED | Line 87 in Footer.tsx; fr.json = "Soutenir", en.json = "Support" |
| `src/components/Footer/Footer.tsx` | `src/messages/fr.json (Footer.help_link)` | `t('help_link')` | WIRED | Line 80 in Footer.tsx; /support help page link preserved after collision resolution |
| `src/components/Donate/DonateCards.tsx` | `@iconify/react` | `import { Icon } from '@iconify/react'` | WIRED | Line 5: import present; icons used at lines 114-120, 192, 207, 239-245, 320, 335 |
| `src/components/Donate/DonateCards.tsx` | `solar:card-bold-duotone` | `Icon icon='solar:card-bold-duotone'` | WIRED | Line 115 in DonateCards.tsx |
| `src/components/Donate/DonateCards.tsx` | `bitcoin-icons:bitcoin-circle-filled` | `Icon icon='bitcoin-icons:bitcoin-circle-filled'` | WIRED | Line 240 in DonateCards.tsx |
| `src/components/Donate/DonateCards.tsx` | Brand Button gradient | `style={ctaStyle}` where ctaStyle.backgroundImage = 'linear-gradient(135deg, #1A4E8A, #0F3460)' | WIRED | Line 104 declaration; applied on both CTA buttons |
| `src/app/[locale]/donate/page.tsx` | `src/messages/*.json (why_support_* keys)` | `t('why_support_title')` etc. | WIRED | page.tsx lines 50, 58, 65, 72 reference all 4 keys; both fr.json and en.json contain them |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|--------------|-------------|--------|----------|
| DON-01 | 11-01, 11-02, 11-04, 11-05 | Page /donate bilingue FR/EN avec deux cartes (Fiat et Bitcoin), entry points Nav et Footer | SATISFIED | /fr/donate + /en/donate render; DonateCards has two cards; Nav t("support_label") → /donate; Footer t("support_link") → /donate |
| DON-02 | 11-01, 11-05 | Carte Fiat avec montants suggeres (5/10/25/50 EUR) + montant libre, redirige vers Stripe | SATISFIED | 4-col chip grid with AMOUNTS.map → stripeLinks[amount] hrefs; custom input + handleStripeCustom → stripeLinks.custom |
| DON-03 | 11-01 | Carte Bitcoin ouvre une invoice BTCPay Server | SATISFIED | handleBtcPayClick preserved verbatim: form POST to btcpayConfig.serverUrl/api/v1/invoices with target="_blank" |
| DON-04 | 11-01, 11-05 | Design coherent avec le design system Dictus (dark, glassmorphism, accent blue, hover glow) | SATISFIED | cardClass: bg-[var(--glass-t2-bg)] backdrop-blur-[12px] hover:shadow-[0_0_20px_var(--color-glow-soft)]; chipBase: hover:scale-[1.02] + glow; brand gradient CTA |
| DON-05 | 11-04 | Label "Contribution" (pas "Don") — PIVI Solutions est une entreprise | SATISFIED | No "Contribuer" or "Contribute" verb forms remain; all CTAs and nav read "Soutenir"/"Support"; noun "contribution" in motivation text is permitted per UAT design decisions |
| PAY-01 | 11-03 | Guide de setup Stripe pour PIVI Solutions | SATISFIED (unchanged) | docs/setup-stripe.md exists with Payment Link instructions referencing src/config/donate.ts |
| PAY-02 | 11-03 | Guide de setup BTCPay Server | SATISFIED (unchanged) | docs/setup-btcpay.md exists with Umbrel + Hetzner options, phoenixd, config update instructions |

All 7 requirements satisfied. REQUIREMENTS.md marks all DON-01 through PAY-02 as Complete for Phase 11. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/config/donate.ts` | 2-11 | PLACEHOLDER_* values for Stripe URLs and BTCPay Store ID | Info | Expected — setup guides PAY-01 / PAY-02 document exact replacement steps. Not a blocker. |
| `src/components/Donate/DonateCards.tsx` | 91-94 | `_chipSelectedModifier` declared but unused (`void` ref) | Info | Intentional — documented in 11-05-SUMMARY as reserved for future staged-flow interaction. Lint-safe. |

No blocker anti-patterns. No TODO/FIXME comments. No empty implementations.

---

### Git Commits Verified

All gap-closure commits confirmed in repository history (`git log --oneline`):

- `403d696` — chore(11-04): add @iconify/react dependency
- `f60b22b` — refactor(11-04): rename Contribuer/Contribute -> Soutenir/Support
- `6421a17` — feat(11-05): add Why support? i18n keys to FR/EN
- `39b0b82` — feat(11-05): rework DonateCards to Option A1 hierarchy with Iconify icons
- `e1cea04` — feat(11-05): add Why support? inline-bullets section to donate page

---

### Human Verification Required

#### 1. Card visual quality with Iconify icons

**Test:** Visit /fr/donate. Examine the Fiat card header (credit card icon in navy squircle) and Bitcoin card header (Bitcoin circle icon in navy squircle).
**Expected:** Both icons render cleanly in white inside the navy tile; no broken icon placeholders (Iconify loads SVGs on demand from CDN).
**Why human:** CDN-loaded SVG rendering cannot be verified without a live browser.

#### 2. 4-column chip grid at desktop width

**Test:** View /fr/donate on a screen wider than 640px (sm breakpoint). Check the chip row on each card.
**Expected:** 5 EUR, 10 EUR, 25 EUR, 50 EUR appear on a single row. No chip wraps to a second row.
**Why human:** Grid breakpoint behavior requires browser rendering.

#### 3. Custom stepper visual and interaction

**Test:** Click the up chevron on the Fiat card's custom input (starting from empty). Then type "500" and click down.
**Expected:** Input increments to 1 (MIN_AMOUNT), then decrements to 499. Chevrons take full cell height. No native browser spinner visible anywhere.
**Why human:** Pixel-level stepper height and cross-browser rendering require visual inspection.

#### 4. Full-width gradient CTA

**Test:** View /fr/donate. Observe the "Soutenir" button at the bottom of each card.
**Expected:** Button spans full card width, shows navy-to-darker-navy gradient, brightens slightly on hover.
**Why human:** CSS gradient and hover rendering require visual inspection.

#### 5. "Pourquoi soutenir ?" section — responsive layout

**Test:** View /fr/donate on desktop (1024px+) then mobile (375px).
**Expected:** Desktop — 3 bullets inline with dot separators. Mobile — bullets stacked. Section is visually subordinate to the cards (small muted text, no competition).
**Why human:** Responsive flex direction (flex-col / sm:flex-row) requires browser rendering.

#### 6. Payment redirect behavior (requires external service setup)

**Test:** Click the "5 EUR" chip on the Fiat card; click "10 EUR" on the Bitcoin card.
**Expected:** Fiat chip redirects to Stripe Payment Link (PLACEHOLDER until PAY-01 executed). Bitcoin chip opens BTCPay invoice in new tab (requires PAY-02 setup).
**Why human:** Requires live external services. Code flow verified correct; endpoints are placeholder.

---

### Gaps Summary

No gaps remain. Both UAT gaps fully closed:

**Gap 1 (terminology + icons + card design):** Resolved. "Soutenir"/"Support" replaces "Contribuer"/"Contribute" across all i18n keys and call sites. @iconify/react ^6.0.2 installed. DonateCards rebuilt with Iconify icons inside the existing navy squircle tile. Card layout follows A1 stacked hierarchy (header row, divider, amounts block, divider, full-width CTA).

**Gap 2 (native spinner + misplaced CTA + chip grid):** Resolved. `<input type="number">` replaced with `type="text" inputMode="numeric"` plus a custom right-edge stepper (full-height stacked chevrons, +/-1 EUR bounded by MIN_AMOUNT/MAX_AMOUNT). CTA is now a full-width gradient button at card bottom via mt-auto. Chip grid changed from flex-wrap to grid-cols-2 / sm:grid-cols-4.

**Footer key collision (auto-fixed by 11-04):** Pre-existing Footer.support_link (help page) renamed to Footer.help_link, freeing support_link for the donate link. Both links functional and wired correctly.

---

_Verified: 2026-04-14T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes — after gap closure (plans 11-04 and 11-05)_

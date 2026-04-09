---
phase: 11-donation-page
verified: 2026-04-09T00:00:00Z
status: passed
score: 6/6 must-haves verified
re_verification: false
---

# Phase 11: Donation Page Verification Report

**Phase Goal:** Visitors can access /donate and choose to contribute via Stripe (fiat) or BTCPay Server (Bitcoin)
**Verified:** 2026-04-09
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                   | Status     | Evidence                                                                                                     |
|----|----------------------------------------------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------------------------|
| 1  | Visiting /fr/donate and /en/donate displays a bilingual donation page with two cards side by side        | VERIFIED   | Build output confirms `/fr/donate` and `/en/donate` SSG-rendered. `page.tsx` renders heading, motivation, DonateCards, thank-you in both locales. |
| 2  | Fiat card shows 4 suggested amounts (5/10/25/50 EUR) as selectable chips + custom amount input           | VERIFIED   | `DonateCards.tsx` maps `AMOUNTS = [5, 10, 25, 50]` to `<a>` chips with `stripeLinks[amount]` href; custom `<input>` + `<button>` present. |
| 3  | Bitcoin card has a CTA that opens a BTCPay Server invoice                                                | VERIFIED   | `handleBtcPayClick` creates a form POST to `btcpayConfig.serverUrl/api/v1/invoices` with `target="_blank"`. Bitcoin chips use `<button onClick>`. |
| 4  | Page uses glassmorphism cards with hover glow consistent with design system                              | VERIFIED   | `cardClass` contains `bg-[var(--glass-t2-bg)] backdrop-blur-[12px] hover:shadow-[0_0_20px_var(--color-glow-soft)]` matching Features.tsx pattern. |
| 5  | Nav bar has accent pill button linking to /donate                                                        | VERIFIED   | `Nav.tsx` has `Link href="/donate"` with `rounded-full bg-accent min-h-[44px]` styling, uses `t("contribute_label")`. |
| 6  | Footer has text link to /donate                                                                          | VERIFIED   | `Footer.tsx` has `Link href="/donate"` after Support link, uses `t("contribute_link")`. |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact                                          | Expected                                          | Status   | Details                                                              |
|---------------------------------------------------|---------------------------------------------------|----------|----------------------------------------------------------------------|
| `src/config/donate.ts`                            | Stripe Payment Link URLs and BTCPay config        | VERIFIED | Exports `stripeLinks`, `btcpayConfig`, `AMOUNTS`, `MIN_AMOUNT`, `MAX_AMOUNT`. 16 lines. |
| `src/app/[locale]/donate/page.tsx`                | Server component page shell, min 30 lines          | VERIFIED | 52 lines. Has `generateStaticParams`, `generateMetadata`, `setRequestLocale`, `DonateCards`, `Footer`. |
| `src/components/Donate/DonateCards.tsx`           | Client component with cards, chips, redirect logic, min 80 lines | VERIFIED | 226 lines. Full implementation — both cards, chips, custom inputs, error validation, payment handlers. |
| `src/components/Nav/Nav.tsx`                      | Accent pill button linking to /donate             | VERIFIED | Contains `href="/donate"`, `rounded-full bg-accent`, `t("contribute_label")`. |
| `src/components/Footer/Footer.tsx`                | Contribute text link in footer                    | VERIFIED | Contains `href="/donate"`, `t("contribute_link")`. |
| `docs/setup-stripe.md`                            | Step-by-step Stripe setup, references donate.ts   | VERIFIED | 11 occurrences of "Payment Link", contains SIRET, donate.ts, "Customer chooses what to pay". |
| `docs/setup-btcpay.md`                            | BTCPay setup with Umbrel and Hetzner options      | VERIFIED | Contains phoenixd, Umbrel, Hetzner, "Allow anyone to create invoice", donate.ts. |

### Key Link Verification

| From                                        | To                                          | Via                              | Status   | Details                                                             |
|---------------------------------------------|---------------------------------------------|----------------------------------|----------|---------------------------------------------------------------------|
| `src/app/[locale]/donate/page.tsx`          | `src/components/Donate/DonateCards.tsx`     | `import DonateCards`             | WIRED    | Line 4: `import DonateCards from "@/components/Donate/DonateCards"` — used at line 44 |
| `src/components/Donate/DonateCards.tsx`     | `src/config/donate.ts`                      | `import stripeLinks, btcpayConfig, AMOUNTS` | WIRED | Lines 6-11: all exports imported and actively used in rendering and handlers |
| `src/components/Donate/DonateCards.tsx`     | `next-intl`                                 | `useTranslations("Donate")`      | WIRED    | Line 4 import, line 14: `const t = useTranslations("Donate")` — used throughout |
| `src/components/Nav/Nav.tsx`                | `/[locale]/donate`                          | `Link href="/donate"`            | WIRED    | `@/i18n/navigation` Link at line 33 with `href="/donate"` |
| `src/components/Footer/Footer.tsx`          | `/[locale]/donate`                          | `Link href="/donate"`            | WIRED    | `@/i18n/navigation` Link at line 83 with `href="/donate"` |
| `docs/setup-stripe.md`                      | `src/config/donate.ts`                      | Instructions to update config    | WIRED    | Explicit instruction to open `src/config/donate.ts` and replace PLACEHOLDER URLs |
| `docs/setup-btcpay.md`                      | `src/config/donate.ts`                      | Instructions to update config    | WIRED    | Explicit instruction to open `src/config/donate.ts` and replace storeId |

### Requirements Coverage

| Requirement | Source Plan | Description                                                                                | Status    | Evidence                                                                        |
|-------------|-------------|--------------------------------------------------------------------------------------------|-----------|---------------------------------------------------------------------------------|
| DON-01      | 11-01, 11-02 | Page /donate bilingue FR/EN avec deux cartes cote a cote (Fiat et Bitcoin)                | SATISFIED | /fr/donate and /en/donate SSG-rendered. Two-column grid with fiat + bitcoin cards. Nav and footer links added. |
| DON-02      | 11-01       | Carte Fiat avec montants suggeres (5/10/25/50 EUR) + montant libre, redirige vers Stripe  | SATISFIED | Chips map AMOUNTS to stripeLinks hrefs. Custom input + handleStripeCustom redirects to stripeLinks.custom. |
| DON-03      | 11-01       | Carte Bitcoin ouvre une invoice BTCPay Server                                              | SATISFIED | `handleBtcPayClick` performs form POST to BTCPay `/api/v1/invoices` with `target="_blank"`. |
| DON-04      | 11-01       | Design coherent avec le design system Dictus (dark, glassmorphism, accent blue, hover glow) | SATISFIED | `glass-t2-bg`, `backdrop-blur-[12px]`, `hover:shadow-[0_0_20px_var(--color-glow-soft)]`, `border-accent` hover on chips. |
| DON-05      | 11-01       | Label "Contribution" (pas "Don") — PIVI Solutions est une entreprise                      | SATISFIED | No standalone "Don" value found in fr.json or en.json. Uses "Contribuer"/"Contribuer" throughout. |
| PAY-01      | 11-03       | Guide de setup Stripe pour PIVI Solutions                                                  | SATISFIED | `docs/setup-stripe.md` covers account creation, 4 fixed + 1 custom Payment Link, config update instructions. |
| PAY-02      | 11-03       | Guide de setup BTCPay Server (Umbrel recommande, phoenixd pour Lightning)                  | SATISFIED | `docs/setup-btcpay.md` covers Umbrel (0 EUR) + Hetzner (4 EUR) options, phoenixd, "Allow anyone to create invoice", config update. |

All 7 requirements satisfied. No orphaned requirements found — REQUIREMENTS.md marks all DON-01 through PAY-02 as Complete for Phase 11.

### Anti-Patterns Found

| File                          | Line  | Pattern                          | Severity | Impact                                             |
|-------------------------------|-------|----------------------------------|----------|----------------------------------------------------|
| `src/config/donate.ts`        | 2-6   | `PLACEHOLDER_5EUR`, etc.         | Info     | Expected — setup guides explain how to replace. URLs are placeholder until Stripe account configured. |
| `src/config/donate.ts`        | 11    | `PLACEHOLDER_STORE_ID`           | Info     | Expected — setup guide (PAY-02) instructs developer to replace with real Store ID. |

No blockers. Placeholder values in `donate.ts` are intentional and documented — the plans explicitly state these are placeholders pending external service setup (PAY-01, PAY-02 guides provide the instructions).

### Human Verification Required

#### 1. Payment redirect behavior (Stripe)

**Test:** Visit /fr/donate, click the "5 EUR" chip on the Fiat card.
**Expected:** Browser navigates to Stripe Payment Link URL (currently a PLACEHOLDER — will work once PAY-01 is executed).
**Why human:** Redirect behavior requires browser interaction; placeholder URL means this will 404 until real URLs are configured.

#### 2. BTCPay invoice opens in new tab

**Test:** Visit /fr/donate, click "10 EUR" on the Bitcoin card.
**Expected:** A new tab opens with a BTCPay Server invoice QR code for 10 EUR.
**Why human:** Requires a live BTCPay Server instance (PLACEHOLDER_STORE_ID currently). Form POST logic is correct in code but cannot be validated until PAY-02 is executed.

#### 3. Custom amount validation UX

**Test:** Enter "0" in the fiat custom input, click "Contribuer". Then enter "1000", click again.
**Expected:** Red error message appears below input ("Montant minimum : 1 EUR" then "Montant maximum : 999 EUR").
**Why human:** Client-side state behavior requires browser rendering.

#### 4. Responsive layout — two cards side by side

**Test:** View /fr/donate on a 1024px+ screen, then on a 375px screen.
**Expected:** Desktop — two cards side by side. Mobile — single column stack.
**Why human:** Visual layout requires browser rendering to confirm grid breakpoint works as intended.

#### 5. Nav pill button visibility on mobile (320px)

**Test:** Open site on 320px width screen, check nav bar.
**Expected:** Accent blue pill "Contribuer" button visible alongside logo and language toggle, no overflow.
**Why human:** Mobile layout may require visual inspection — `min-h-[44px]` ensures tap target but cannot verify horizontal overflow without rendering.

### Build Verification

`npm run build` (with `--webpack` flag per `package.json` scripts): **PASSED**

- `/fr/donate` — SSG generated
- `/en/donate` — SSG generated
- TypeScript check passed
- 15 pages total generated without errors

---

_Verified: 2026-04-09_
_Verifier: Claude (gsd-verifier)_

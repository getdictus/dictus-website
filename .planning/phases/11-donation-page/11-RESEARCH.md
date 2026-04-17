# Phase 11: Donation Page - Research

**Researched:** 2026-04-09
**Domain:** Payment integration (Stripe Payment Links + BTCPay Server), Next.js page creation, i18n
**Confidence:** HIGH

## Summary

Phase 11 creates a bilingual donation page at `/[locale]/donate` with two glassmorphism cards -- Fiat (Stripe) and Bitcoin (BTCPay Server). The implementation is almost entirely frontend: Stripe uses pre-created Payment Links (one per amount + one "customer chooses" for custom amounts), and BTCPay Server uses a simple HTML form POST that creates an invoice and redirects to checkout without needing an API key or backend route.

The project already has all the patterns needed: the privacy page provides the exact server component template (async page, `setRequestLocale`, `getTranslations`, `generateMetadata`, `generateStaticParams`), the Community section provides the glassmorphism Tier 2 card pattern, and the Footer/Nav provide integration points. The i18n namespace pattern (next-intl v4) is well established. No new dependencies are required.

**Primary recommendation:** Use Stripe Payment Links (no backend) + BTCPay HTML form POST (no backend). Create a client component for the interactive card grid (chip selection, custom amount input, redirect logic) wrapped in the standard server component page shell.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Heading: direct & simple -- "Soutenir Dictus" / "Support Dictus"
- Short motivation paragraph (2-3 sentences) -- tone: appreciation, soutien au projet open source / dev independant
- Do NOT insist on "gratuit" -- Dictus has a freemium model (like Bitwarden). Contributions are voluntary support, not the business model
- Label "Contribution" not "Don" (PIVI Solutions is a company, not a non-profit)
- Small thank-you line below the cards ("Merci pour votre soutien")
- 4 suggested amounts: 5 / 10 / 25 / 50 EUR -- EUR only, Stripe handles conversion
- No pre-selection on page load -- visitor makes an active choice
- Chip click = direct redirect to Stripe Payment Link with amount pre-filled (one click = done)
- Custom amount: text input + small "Contribuer" button next to it (only custom path needs confirm since chips redirect directly)
- Bitcoin card mirrors fiat card: same EUR amount chips (5/10/25/50 EUR) + custom input
- Bitcoin click opens BTCPay Server invoice in new tab -- BTCPay converts EUR to BTC equivalent
- Small Lightning mention: "Lightning supporte" -- reassures crypto users
- Nav bar: accent blue pill button "Contribuer" / "Contribute" -- stands out from other nav links
- Footer: "Contribuer" / "Contribute" link added next to Privacy and Support links
- Both entry points link to /[locale]/donate

### Claude's Discretion
- Exact wording of motivation paragraph (within tone guidelines above)
- Card visual details (icon choice, subtle animations, hover glow intensity)
- Responsive layout (side by side on desktop, stacked on mobile)
- Page metadata (OG tags, description)
- Custom amount input validation (min/max)

### Deferred Ideas (OUT OF SCOPE)
- Recurring donations / monthly subscriptions via Stripe -- DON-F01 (future requirement)
- Custom thank-you page after donation -- DON-F02 (future requirement)
- Admin dashboard for donation history -- DON-F03 (future requirement)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DON-01 | Page `/donate` bilingue FR/EN accessible depuis le site, avec deux cartes cote a cote (Fiat et Bitcoin) | Page creation pattern from privacy/page.tsx, i18n namespace "Donate", Nav + Footer integration points identified |
| DON-02 | Carte Fiat affiche des montants suggeres (5/10/25/50 EUR) + montant libre, redirige vers Stripe Payment Link | Stripe Payment Links: create 4 fixed-price links + 1 "customer chooses" link. No URL amount parameter exists -- use separate links per amount |
| DON-03 | Carte Bitcoin ouvre une invoice BTCPay Server (Pay Button ou lien direct) | BTCPay HTML form POST to `/api/v1/invoices` with storeId + price + currency. No API key needed (enable "Allow anyone to create invoice"). Opens checkout in new tab |
| DON-04 | Design coherent avec le design system Dictus (dark, glassmorphism, accent blue, hover glow) | Glassmorphism Tier 2 pattern from Community.tsx. UI-SPEC provides complete visual contract |
| DON-05 | Label "Contribution" (pas "Don") -- PIVI Solutions est une entreprise, pas une association | Copywriting contract in UI-SPEC uses "Contribution" and "Contribuer" throughout |
| PAY-01 | Guide de setup Stripe pour PIVI Solutions (compte, Payment Link avec montant personnalisable) | Stripe dashboard workflow documented: create product, enable "customer chooses", set suggested amounts, copy links |
| PAY-02 | Guide de setup BTCPay Server (option recommandee avec couts, pruned node, phoenixd pour Lightning) | BTCPay deployment options documented: Umbrel + Cloudflare Tunnel (0 EUR) or Hetzner CAX11 (4 EUR/month), phoenixd for Lightning |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, server components, static generation | Project framework |
| next-intl | ^4.8.3 | i18n translations, locale routing | Project i18n solution |
| React | 19.2.3 | UI components | Project UI library |
| Tailwind CSS | ^4 | Styling, responsive design | Project styling |
| motion | ^12.35.2 | Animations (LazyMotion already wrapping pages) | Project animation library |

### Supporting (no new installs needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @/i18n/navigation | (internal) | `Link` component for locale-aware routing | Nav pill button, Footer link |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Payment Links (no-code) | Stripe Checkout Sessions (API) | Checkout Sessions need backend API routes + stripe npm package. Payment Links are zero-backend, sufficient for donation use case |
| BTCPay HTML form POST | BTCPay Greenfield API via Next.js API route | API route would need env vars and server-side fetch. Form POST is simpler and works without backend code |
| Multiple fixed Stripe links | Single "customer chooses" link for all | Multiple links give one-click UX for preset amounts (no amount entry on Stripe page). Single link requires customer to type amount |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/donate/
│   └── page.tsx              # Server component (metadata, translations, shell)
├── components/Donate/
│   ├── DonateCards.tsx        # Client component ("use client") - card grid with chip logic
│   └── AmountChips.tsx        # Optional: extracted chip + custom input component (reused in both cards)
├── config/
│   └── donate.ts             # Payment link URLs and BTCPay config (centralized, easy to update)
├── messages/
│   ├── fr.json               # Add "Donate" namespace
│   └── en.json               # Add "Donate" namespace
└── components/
    ├── Nav/Nav.tsx            # Add "Contribuer" pill button
    └── Footer/Footer.tsx      # Add "Contribuer" text link
```

### Pattern 1: Server Component Page Shell
**What:** Async server component for the page, delegates interactive parts to client component
**When to use:** Always for Next.js App Router pages with interactive elements
**Example:**
```typescript
// src/app/[locale]/donate/page.tsx
// Source: Existing privacy/page.tsx pattern
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Footer from "@/components/Footer/Footer";
import DonateCards from "@/components/Donate/DonateCards";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Donate" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/donate`,
      languages: { fr: "/fr/donate", en: "/en/donate", "x-default": "/fr/donate" },
    },
  };
}

export default async function DonatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Donate");

  return (
    <>
      <article className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        <div className="text-center">
          <h1 className="text-3xl font-extralight text-text-primary md:text-4xl">
            {t("heading")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white-70">
            {t("motivation")}
          </p>
        </div>
        <DonateCards />
        <p className="mt-8 text-center text-sm text-white-40">
          {t("thank_you")}
        </p>
      </article>
      <Footer />
    </>
  );
}
```

### Pattern 2: Stripe Payment Links (Zero Backend)
**What:** Pre-created Stripe Payment Links, one per preset amount + one "customer chooses" for custom
**When to use:** For the fiat donation card
**Example:**
```typescript
// src/config/donate.ts
// Stripe Payment Links created in Stripe Dashboard
// Each link is a fixed-price product OR the custom one uses "customer chooses"
export const stripeLinks = {
  5: "https://buy.stripe.com/XXXXX_5EUR",
  10: "https://buy.stripe.com/XXXXX_10EUR",
  25: "https://buy.stripe.com/XXXXX_25EUR",
  50: "https://buy.stripe.com/XXXXX_50EUR",
  custom: "https://buy.stripe.com/XXXXX_custom", // "customer chooses" pricing
} as const;

// BTCPay Server config
export const btcpayConfig = {
  serverUrl: "https://btcpay.getdictus.com", // or whatever the instance URL is
  storeId: "STORE_ID_HERE",
} as const;
```

### Pattern 3: BTCPay HTML Form POST (Zero Backend)
**What:** Simple form POST to BTCPay Server that creates invoice and redirects to checkout
**When to use:** For the Bitcoin donation card
**Example:**
```typescript
// Inside DonateCards.tsx client component
function handleBtcPayClick(amount: number) {
  // Create a form dynamically and POST to BTCPay
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${btcpayConfig.serverUrl}/api/v1/invoices`;
  form.target = "_blank"; // opens in new tab

  const fields = {
    storeId: btcpayConfig.storeId,
    price: amount.toString(),
    currency: "EUR",
    checkoutDesc: "Contribution Dictus",
  };

  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
```

### Pattern 4: Glassmorphism Tier 2 Card
**What:** Consistent card styling from the existing design system
**When to use:** For both Fiat and Bitcoin cards
**Example:**
```typescript
// Source: Community.tsx pattern
<div className="rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-all duration-300 hover:border-border-hi hover:shadow-[0_0_20px_var(--color-glow-soft)]">
  {/* Card content */}
</div>
```

### Anti-Patterns to Avoid
- **Adding Stripe SDK or stripe npm package:** Not needed. Payment Links are just URLs. No server-side Stripe code for this phase.
- **Exposing BTCPay API keys in frontend:** The form POST approach does not need API keys. Never put `Authorization: token` headers in client code.
- **Creating API routes for payment creation in Phase 11:** API routes are Phase 12 scope (webhooks). Phase 11 is frontend-only.
- **Using Stripe Checkout Sessions:** Overkill for donations. Payment Links are simpler and match the zero-backend approach.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment processing | Custom payment form with card inputs | Stripe Payment Links (redirect) | PCI compliance, security, Stripe handles everything |
| Bitcoin invoicing | Custom BTC address generation | BTCPay Server (form POST + their checkout page) | Exchange rates, Lightning, QR codes, payment detection all handled |
| i18n routing | Manual locale detection/routing | next-intl routing + Link component | Already configured, handles locale prefix, SSG params |
| Amount validation | Complex validation library | Simple min/max check on number input | Only need 1-999 EUR range, HTML5 input attrs + JS check |

**Key insight:** Both payment integrations are "redirect to hosted page" patterns. The donation page is a fancy link launcher, not a payment processor. Keep it simple.

## Common Pitfalls

### Pitfall 1: Stripe Payment Link URLs as Environment Variables
**What goes wrong:** Storing Stripe Payment Link URLs in `.env` files, making them harder to update
**Why it happens:** Instinct to treat external URLs as config
**How to avoid:** Store in a TypeScript config file (`src/config/donate.ts`). Payment Links are public URLs (not secrets). They change rarely and benefit from type safety.
**Warning signs:** `.env.local` growing with `NEXT_PUBLIC_STRIPE_LINK_*` variables

### Pitfall 2: BTCPay "Allow anyone to create invoice" Not Enabled
**What goes wrong:** Form POST returns 403/401 error
**Why it happens:** BTCPay Server has this setting disabled by default for security
**How to avoid:** Document in PAY-02 setup guide: Store Settings > General > "Allow anyone to create invoice" must be enabled
**Warning signs:** BTCPay form submissions failing silently

### Pitfall 3: Nav Pill Button Breaking Mobile Layout
**What goes wrong:** "Contribuer" button + LanguageToggle overflow on small screens
**Why it happens:** Adding a new element to the nav without testing 320px viewport
**How to avoid:** Test at 320px. The button is compact (`px-4 py-2 text-sm`) and "Contribuer" is short enough. But verify.
**Warning signs:** Horizontal scroll on mobile, elements wrapping unexpectedly

### Pitfall 4: Missing i18n Keys Causing Runtime Errors
**What goes wrong:** `t("key")` throws or shows raw key string
**Why it happens:** Forgetting to add keys to both `fr.json` and `en.json`
**How to avoid:** Add the complete "Donate" namespace to both translation files in the same task. Use the copywriting contract from UI-SPEC verbatim.
**Warning signs:** Page showing translation key names instead of text

### Pitfall 5: Stripe "Customer Chooses" Link Not Handling Custom Amounts
**What goes wrong:** Custom amount input redirects to Stripe but amount is not pre-filled
**Why it happens:** Stripe Payment Links with "customer chooses" pricing do NOT accept a URL parameter for amount. The customer must type the amount on the Stripe page.
**How to avoid:** Accept this limitation. The custom amount flow is: user types amount on our page -> clicks "Contribuer" -> Stripe page opens -> user re-enters amount on Stripe. This is acceptable UX for custom amounts (the 4 preset chips handle the common case with one click).
**Warning signs:** Trying to append `?amount=XX` to Stripe Payment Link URL (it will be ignored)

### Pitfall 6: Client Component Importing Server-Only Functions
**What goes wrong:** Build fails with "server-only" import error
**Why it happens:** Using `getTranslations` (server) in a client component
**How to avoid:** Use `useTranslations` (client hook) in `DonateCards.tsx`. The page shell uses `getTranslations` (server).
**Warning signs:** Build error mentioning "server-only" or "client boundary"

## Code Examples

### Complete Nav Integration
```typescript
// Nav.tsx modification - add before LanguageToggle in the gap-1 div
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

// Inside Nav component:
const t = useTranslations("Nav");

// In JSX, before <LanguageToggle />:
<Link
  href="/donate"
  className="rounded-full bg-accent px-4 py-2 text-sm font-normal text-white transition-colors hover:bg-accent-hi min-h-[44px] flex items-center"
>
  {t("contribute_label")}
</Link>
```

### Complete Footer Integration
```typescript
// Footer.tsx modification - add after Support link
<span className="text-white-40" aria-hidden="true">&middot;</span>
<Link
  href="/donate"
  className="text-white-40 transition-colors hover:text-white-70"
>
  {t("contribute_link")}
</Link>
```

### Translation Namespace Structure
```json
{
  "Donate": {
    "meta_title": "Soutenir Dictus - Contribution",
    "meta_description": "Soutenez le developpement de Dictus...",
    "heading": "Soutenir Dictus",
    "motivation": "Dictus est un projet independant et open source...",
    "fiat_title": "Carte bancaire",
    "fiat_subtitle": "Visa, Mastercard, Apple Pay...",
    "btc_title": "Bitcoin",
    "btc_subtitle": "On-chain & Lightning",
    "lightning_mention": "Lightning supporte",
    "chip_5": "5 EUR",
    "chip_10": "10 EUR",
    "chip_25": "25 EUR",
    "chip_50": "50 EUR",
    "custom_placeholder": "Montant",
    "custom_submit": "Contribuer",
    "thank_you": "Merci pour votre soutien",
    "error_min": "Montant minimum : 1 EUR",
    "error_max": "Montant maximum : 999 EUR"
  },
  "Nav": {
    "contribute_label": "Contribuer"
  },
  "Footer": {
    "contribute_link": "Contribuer"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Checkout Sessions (server-side) | Stripe Payment Links (no-code) | 2021+ | Zero backend needed for simple payments/donations |
| BTCPay API with API key | BTCPay form POST (no auth) | Available since BTCPay v1 | No API key exposure risk, simpler integration |
| Custom payment forms | Hosted payment pages (redirect) | Industry standard | PCI compliance handled by provider |

**Deprecated/outdated:**
- BTCPay Bitpay-compatible API: Legacy, use Greenfield API v1 for any advanced integrations
- Stripe `<script>` checkout.js embed: Replaced by Payment Links for simple use cases

## Setup Guides (PAY-01 and PAY-02 Content)

### PAY-01: Stripe Setup Guide
1. Create Stripe account at stripe.com (needs SIRET + IBAN for PIVI Solutions)
2. Wait 1-2 days for verification
3. In Dashboard > Products: create "Contribution Dictus" product
4. For each preset amount (5, 10, 25, 50 EUR): create a Price with fixed amount, then create a Payment Link
5. Create one additional Price with "Customer chooses what to pay" (min: 1 EUR, max: 999 EUR), then create a Payment Link
6. Copy all 5 Payment Link URLs into `src/config/donate.ts`
7. Test each link in test mode before going live

### PAY-02: BTCPay Server Setup Guide
**Recommended: Umbrel + Cloudflare Tunnel (0 EUR/month)**
1. Install BTCPay Server app on Umbrel
2. Configure Cloudflare Tunnel for public access (e.g., btcpay.getdictus.com)
3. Create a store in BTCPay
4. Enable "Allow anyone to create invoice" in Store Settings > General
5. Set up a Bitcoin wallet (on-chain)
6. Install phoenixd plugin for Lightning (auto liquidity management)
7. Copy Store ID into `src/config/donate.ts`

**Fallback: Hetzner CAX11 (4 EUR/month)**
1. Rent Hetzner CAX11 ARM VPS
2. Deploy BTCPay Server via Docker
3. Use pruned Bitcoin node to save disk space
4. Same store setup as above

## Open Questions

1. **Stripe Payment Links not yet created**
   - What we know: Stripe account needs SIRET + IBAN, 1-2 day verification
   - What's unclear: Exact Payment Link URLs (will be known after account setup)
   - Recommendation: Use placeholder URLs in `donate.ts`, document how to replace them in PAY-01 guide

2. **BTCPay Server not yet deployed**
   - What we know: User will choose Umbrel or Hetzner approach
   - What's unclear: Final BTCPay instance URL and Store ID
   - Recommendation: Use placeholder values in `donate.ts`, document how to replace them in PAY-02 guide

3. **BTCPay form POST exact behavior**
   - What we know: POST to `/api/v1/invoices` with storeId, price, currency creates invoice and redirects
   - What's unclear: Exact redirect behavior (does it auto-redirect to checkout, or return JSON?)
   - Recommendation: Implement form POST approach. If it returns JSON instead of redirecting, fall back to a thin API route in a follow-up. **Confidence: MEDIUM** -- needs testing with a live BTCPay instance.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- no test framework in project |
| Config file | none -- see Wave 0 |
| Quick run command | `npx next build` (type-check + build) |
| Full suite command | `npx next build && npx eslint .` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DON-01 | /donate page renders in both locales | smoke | `npx next build` (SSG will fail if page errors) | N/A (build) |
| DON-02 | Fiat card shows 4 chips + custom input | manual-only | Visual inspection | N/A |
| DON-03 | Bitcoin card opens BTCPay invoice | manual-only | Requires live BTCPay instance | N/A |
| DON-04 | Glassmorphism design matches spec | manual-only | Visual inspection against UI-SPEC | N/A |
| DON-05 | Uses "Contribution" not "Don" | manual-only | Grep translation files for "Don" | N/A |
| PAY-01 | Stripe setup guide exists | manual-only | File existence check | N/A |
| PAY-02 | BTCPay setup guide exists | manual-only | File existence check | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` (catches type errors, missing translations, broken imports)
- **Per wave merge:** `npx next build && npx eslint .`
- **Phase gate:** Full build green + manual visual check of /fr/donate and /en/donate

### Wave 0 Gaps
- No test framework installed (jest/vitest) -- not blocking for this phase since it is primarily a UI page
- Manual testing required for payment redirects (needs live Stripe + BTCPay accounts)
- `npx next build` serves as the primary automated validation (static generation catches most errors)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `privacy/page.tsx`, `Community.tsx`, `Nav.tsx`, `Footer.tsx`, `fr.json`, `en.json` -- patterns verified by reading actual files
- UI-SPEC: `.planning/phases/11-donation-page/11-UI-SPEC.md` -- complete visual and interaction contract
- CONTEXT.md: `.planning/phases/11-donation-page/11-CONTEXT.md` -- locked user decisions

### Secondary (MEDIUM confidence)
- [Stripe Payment Links docs](https://docs.stripe.com/payment-links/create) -- Payment Link creation, "customer chooses" pricing
- [Stripe URL Parameters docs](https://docs.stripe.com/payment-links/url-parameters) -- confirmed NO amount URL parameter exists
- [BTCPay Custom Integration docs](https://docs.btcpayserver.org/CustomIntegration/) -- form POST invoice creation
- [BTCPay Greenfield API Node.js example](https://docs.btcpayserver.org/Development/GreenFieldExample-NodeJS/) -- API structure reference
- [BTCPay Forms docs](https://docs.btcpayserver.org/Forms/) -- HTML form POST approach confirmed

### Tertiary (LOW confidence)
- BTCPay form POST redirect behavior -- documented but not tested with a live instance. May return JSON instead of auto-redirecting to checkout page.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and patterns established in codebase
- Architecture: HIGH - follows exact patterns from existing pages (privacy, community)
- Payment integration (Stripe): HIGH - Payment Links are well-documented, zero-backend approach confirmed
- Payment integration (BTCPay): MEDIUM - form POST approach documented but redirect behavior needs live testing
- Pitfalls: HIGH - based on concrete investigation of URL parameters and API constraints

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (stable -- payment link APIs rarely change)

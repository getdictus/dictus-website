# Phase 11: Donation Page - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors can access /donate (bilingual FR/EN) and choose to contribute via Stripe (fiat) or BTCPay Server (Bitcoin). Two glassmorphism cards side by side with amount selection. Page accessible from nav bar and footer. Setup guides for Stripe and BTCPay documented.

</domain>

<decisions>
## Implementation Decisions

### Page content & tone
- Heading: direct & simple — "Soutenir Dictus" / "Support Dictus"
- Short motivation paragraph (2-3 sentences) — tone: appreciation, soutien au projet open source / dev indépendant
- Do NOT insist on "gratuit" — Dictus has a freemium model (like Bitwarden). Contributions are voluntary support, not the business model
- Label "Contribution" not "Don" (PIVI Solutions is a company, not a non-profit)
- Small thank-you line below the cards ("Merci pour votre soutien")

### Amount chips UX (Fiat card)
- 4 suggested amounts: 5 / 10 / 25 / 50 EUR — EUR only, Stripe handles conversion
- No pre-selection on page load — visitor makes an active choice
- Chip click = direct redirect to Stripe Payment Link with amount pre-filled (one click = done)
- Custom amount: text input + small "Contribuer" button next to it (only custom path needs confirm since chips redirect directly)

### Bitcoin card behavior
- Mirror fiat card: same EUR amount chips (5/10/25/50 EUR) + custom input
- Click opens BTCPay Server invoice in new tab — BTCPay converts EUR to BTC equivalent
- Small Lightning mention: "⚡ Lightning supporté" — reassures crypto users
- BTCPay handles QR, amount, Lightning automatically on their invoice page

### Navigation & access
- Nav bar: accent blue pill button "Contribuer" / "Contribute" — stands out from other nav links (inspired by Handy's donate button)
- Footer: "Contribuer" / "Contribute" link added next to Privacy and Support links
- Both entry points link to /[locale]/donate

### Claude's Discretion
- Exact wording of motivation paragraph (within tone guidelines above)
- Card visual details (icon choice, subtle animations, hover glow intensity)
- Responsive layout (side by side on desktop, stacked on mobile)
- Page metadata (OG tags, description)
- Custom amount input validation (min/max)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system
- `CLAUDE.md` — Brand kit colors, typography, glassmorphism specs, design rules

### Requirements
- `.planning/REQUIREMENTS.md` — DON-01 through DON-05 (donation page), PAY-01/PAY-02 (setup guides)

### Existing patterns
- `src/app/[locale]/privacy/page.tsx` — Page creation pattern (i18n, metadata, Footer import)
- `src/components/Community/Community.tsx` — Glassmorphism Tier 2 card pattern
- `src/components/Nav/Nav.tsx` — Navigation bar (add "Contribuer" button here)
- `src/components/Footer/Footer.tsx` — Footer links (add "Contribuer" link here)
- `src/i18n/routing.ts` — Locale routing configuration

### External reference
- handy.computer — Nav "donate" button placement and style reference (accent pill button in nav bar)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Glassmorphism Tier 2: `rounded-2xl border border-border bg-[var(--glass-t2-bg)] backdrop-blur-[12px] backdrop-saturate-[1.2]` (from Community section)
- ScrollReveal component: entrance animations for the donate page
- Link component from `@/i18n/navigation` for locale-aware internal links
- MotionProvider + LazyMotion already wrapping all pages

### Established Patterns
- Page structure: async server component with `setRequestLocale`, `getTranslations`, Footer import
- i18n: namespace-based translations via next-intl v4 (e.g., "Donate" namespace)
- Static params: `generateStaticParams()` with `routing.locales.map`
- Metadata: `generateMetadata()` with OG tags, alternates, canonical

### Integration Points
- New route: `src/app/[locale]/donate/page.tsx`
- Nav.tsx: add "Contribuer" accent pill button linking to /donate
- Footer.tsx: add "Contribuer" text link in the links row
- Translation files: new "Donate" namespace + nav/footer labels in FR and EN

</code_context>

<specifics>
## Specific Ideas

- Inspired by Handy's nav: "donate" pill button in nav bar with accent color, visually distinct from plain text links
- Both cards have the same chip-based amount selection (5/10/25/50 EUR) for consistency
- Bitcoin card mentions Lightning support with ⚡ icon
- Freemium model like Bitwarden — contributions support the project, not replace revenue

</specifics>

<deferred>
## Deferred Ideas

- Recurring donations / monthly subscriptions via Stripe — DON-F01 (future requirement)
- Custom thank-you page after donation — DON-F02 (future requirement)
- Admin dashboard for donation history — DON-F03 (future requirement)

</deferred>

---

*Phase: 11-donation-page*
*Context gathered: 2026-04-09*

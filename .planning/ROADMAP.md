# Roadmap: dictus Landing Page

## Overview

Marketing landing page for dictus -- an offline iOS voice dictation keyboard by PIVI Solutions. Premium design with light/dark theme, Liquid Glass glassmorphism, bilingual FR/EN, animated hero with choreographed waveform, competitor comparison, adaptive TestFlight CTA, Lighthouse 90+ across all metrics.

## Milestones

- ✅ **v1.0 dictus Landing Page** — Phases 1-4 (shipped 2026-03-10)
- ✅ **v1.1 Polish & Differentiation** — Phases 5-7 (shipped 2026-03-17)
- ✅ **v1.2 Video & Compliance** — Phases 8-9 (shipped 2026-03-21)
- **v1.3 Donate & Desktop** — Phases 10-13 (active)

## Phases

<details>
<summary>✅ v1.0 dictus Landing Page (Phases 1-4) — SHIPPED 2026-03-10</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-09
- [x] Phase 2: Content & Layout (4/4 plans) — completed 2026-03-09
- [x] Phase 3: Animations (2/2 plans) — completed 2026-03-09
- [x] Phase 4: Polish & Performance (2/2 plans) — completed 2026-03-10

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Polish & Differentiation (Phases 5-7) — SHIPPED 2026-03-17</summary>

- [x] Phase 5: Theme System (2/2 plans) — completed 2026-03-11
- [x] Phase 6: Visual Effects (2/2 plans) — completed 2026-03-12
- [x] Phase 7: Content & CTA (2/2 plans) — completed 2026-03-12

Full details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Video & Compliance (Phases 8-9) — SHIPPED 2026-03-21</summary>

- [x] Phase 8: App Store Compliance (2/2 plans) — completed 2026-03-19
- [x] Phase 9: Remotion Promo Video (4/4 plans) — completed 2026-03-21

Full details: `.planning/milestones/v1.2-ROADMAP.md`

</details>

### v1.3 Donate & Desktop (Phases 10-13) — ACTIVE

**Milestone Goal:** Add donation page (Stripe fiat + BTCPay Bitcoin), webhook notifications via Telegram bot, Desktop platform badges (Coming Soon), and X/Twitter social link.

### Phase 10: Social & Footer
**Goal**: X/Twitter icon visible in the footer on every page, linking to https://x.com/getdictus
**Depends on**: Nothing
**Requirements**: SOC-01, SOC-02
**Success Criteria**:
  1. Footer displays 3 social icons in order: GitHub, X/Twitter, Telegram
  2. X/Twitter icon links to https://x.com/getdictus (opens in new tab)
  3. Icon uses the official X logo SVG, same size and style as existing icons
  4. i18n label twitter_label exists in FR and EN translation files

**Plans:** 1 plan
Plans:
- [x] 10-01-PLAN.md — Add X/Twitter icon to footer with i18n labels

### Phase 11: Donation Page
**Goal**: Visitors can access /donate and choose to contribute via Stripe (fiat) or BTCPay Server (Bitcoin)
**Depends on**: Nothing
**Requirements**: DON-01, DON-02, DON-03, DON-04, DON-05, PAY-01, PAY-02
**Success Criteria**:
  1. Visiting /fr/donate and /en/donate displays a bilingual donation page with two cards side by side
  2. Fiat card shows 4 suggested amounts (5/10/25/50 EUR) as selectable chips + custom amount input
  3. Bitcoin card has a CTA that opens a BTCPay Server invoice
  4. Page uses glassmorphism cards with hover glow consistent with design system
  5. Setup guides for Stripe and BTCPay Server documented

**Plans:** 3 plans
Plans:
- [ ] 11-01-PLAN.md — Donate page with Fiat (Stripe) and Bitcoin (BTCPay) cards
- [ ] 11-02-PLAN.md — Nav pill button and Footer link entry points
- [ ] 11-03-PLAN.md — Stripe and BTCPay Server setup guides

### Phase 12: Webhook Notifications
**Goal**: Every donation (Stripe or BTCPay) triggers a formatted notification in a Telegram chat via a bot
**Depends on**: Phase 11
**Requirements**: HOOK-01, HOOK-02, HOOK-03, HOOK-04
**Success Criteria**:
  1. POST to /api/webhooks/stripe with valid signature sends Telegram message
  2. POST to /api/webhooks/btcpay with valid HMAC sends Telegram message
  3. Invalid signatures rejected with 400 status
  4. Environment variables documented

### Phase 13: Desktop Preparation
**Goal**: The site communicates that Dictus is available on Desktop (Mac, Windows, Linux) with Coming Soon badges
**Depends on**: Nothing
**Requirements**: DESK-01, DESK-02, DESK-03, DESK-04
**Success Criteria**:
  1. Download section displays tabs (macOS/Windows/Linux) with OS auto-detection
  2. Each tab shows Coming Soon badge with platform icon
  3. downloads.ts config centralizes all platform links
  4. Site copy updated to reflect multi-platform availability

Full details: `.planning/milestones/v1.3-ROADMAP.md`

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Content & Layout | v1.0 | 4/4 | Complete | 2026-03-09 |
| 3. Animations | v1.0 | 2/2 | Complete | 2026-03-09 |
| 4. Polish & Performance | v1.0 | 2/2 | Complete | 2026-03-10 |
| 5. Theme System | v1.1 | 2/2 | Complete | 2026-03-11 |
| 6. Visual Effects | v1.1 | 2/2 | Complete | 2026-03-12 |
| 7. Content & CTA | v1.1 | 2/2 | Complete | 2026-03-12 |
| 8. App Store Compliance | v1.2 | 2/2 | Complete | 2026-03-19 |
| 9. Remotion Promo Video | v1.2 | 4/4 | Complete | 2026-03-21 |
| 10. Social & Footer | v1.3 | 1/1 | Complete | 2026-04-09 |
| 11. Donation Page | v1.3 | 0/3 | Pending | — |
| 12. Webhook Notifications | v1.3 | 0/2 | Pending | — |
| 13. Desktop Preparation | v1.3 | 0/2 | Pending | — |

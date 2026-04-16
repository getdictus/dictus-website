---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Donate & Desktop
status: unknown
stopped_at: Completed 12-02-PLAN.md
last_updated: "2026-04-16T10:19:11.372Z"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 8
  completed_plans: 8
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09)

**Core value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.
**Current focus:** v1.3 Donate & Desktop — donation page, webhooks Telegram, desktop badges, X/Twitter footer

## Current Position

Milestone v1.3 Donate & Desktop: IN PROGRESS
Phases 10, 11, 11.1, 12 complete. Only Phase 13 (Desktop Preparation) remains.

Progress: [██████░░░░] 60% of phases (3 core + phase-12 done, 4/5 including 11.1) | [██████████] 100% of plans (8/8 planned plans done)

## Phase Overview

| Phase | Goal | Status | Depends on |
|-------|------|--------|------------|
| 10. Social & Footer | X/Twitter icon in footer | Complete | — |
| 11. Donation Page | /donate with Stripe + BTCPay | Complete | — |
| 11.1. Donate 2-step UX rework | Method-picker + amount card, brand-blue CTA | Complete | Phase 11 |
| 12. Webhook Notifications | Telegram bot notifications | Complete (12-01 + 12-02 shipped) | Phase 11 |
| 13. Desktop Preparation | Coming Soon badges Mac/Win/Linux | Pending | — |

**Next action:** `/gsd:plan-phase 13` for the quick-win desktop badges phase. Operator-side Phase 12 provisioning (Stripe account, BTCPay Server, Telegram bot) remains before webhook notifications can flow end-to-end.

## Accumulated Context

### Decisions

- BTCPay Server: Cloudflare Tunnel from Umbrel (0 EUR) recommended, Hetzner CAX11 (4 EUR/month) as fallback
- Stripe: Payment Link with allow_custom_amounts, no backend needed
- phoenixd for Lightning (officially supported by BTCPay, auto liquidity)
- Desktop downloads: Coming Soon placeholders, config-driven links in downloads.ts
- Label "Contribution" not "Don" (PIVI Solutions is a company)
- Handy.computer inspiration: tabbed OS selector with auto-detection
- X/Twitter footer: official X logo SVG, icon order GitHub > X > Telegram
- [Phase 11]: Setup docs in docs/ directory, written in French, referencing donate.ts
- [Phase 11]: Fiat chips use <a> tags with direct Stripe Payment Link href; Bitcoin chips use <button> with BTCPay form POST
- [Phase 11]: Nav CTA uses accent pill button with min-h-[44px] touch target, gap-2 from LanguageToggle
- [Phase 11]: [Phase 11]: Terminology renamed Contribuer/Contribute -> Soutenir/Support across i18n, Nav, Footer, donate CTA — UAT feedback: 'Contribuer' felt like open-source dev contribution, not financial support
- [Phase 11]: [Phase 11]: Footer.support_link (was help page link) renamed to Footer.help_link to resolve JSON key collision when donate link was renamed to support_link — Pre-existing support_link key collided with planned rename; renaming the older key preserved both links while honoring the plan's intent
- [Phase 11]: White Bitcoin glyph in navy tile (not BTC-orange) for visual symmetry with Fiat card per Design Decisions 'icon rendered white/accent inside the tile'
- [Phase 11]: Digits-only text input (type=text + inputMode=numeric + sanitizeDigits) over type=number to eliminate native browser spinner deterministically across Firefox/Safari
- [Phase 11]: Custom stepper increments fixed at +/-1 EUR (not chip-value-based) per Design Decisions
- [Phase 11]: Selected-chip className declared but not applied in redirect-on-click flow; reserved for future staged (pick-then-confirm) interaction
- [Phase 11.1]: 2-step donate flow (method-picker -> amount card) replaces twin-card layout; CTA is the sole redirect trigger
- [Phase 11.1]: Accent Blue gradient (#3D7EFF->#2563EB) on CTA + method tiles + amount-card border replaces off-brand navy for consistent brand presence on /donate
- [Phase 11.1]: Use theme-aware Tailwind tokens (text-text-primary, text-white-70) instead of static text-mist to keep donate-page copy readable in both light and dark themes
- [Phase 11.1]: Iconify solar:arrow-left-linear replaces Unicode back-arrow glyph for reliable inline-flex vertical alignment with DM Sans
- [Phase 12-webhook-notifications]: stripe@22.0.1 installed + shared src/lib/telegram.ts helper + 5 server-only env vars + BotFather setup doc, laying foundation for Wave 2 webhook routes
- [Phase 12-webhook-notifications]: Added BTCPAY_API_KEY (5th env var beyond HOOK-04's 4) because InvoiceSettled webhook payload omits amount/currency — Greenfield API fetch is required to satisfy HOOK-03
- [Phase 12-webhook-notifications]: Stripe SDK constructor requires non-empty key (v22.0.1) — placeholder 'sk_placeholder' used since webhook verification never calls Stripe API
- [Phase 12-webhook-notifications]: Webhook routes follow Node runtime + force-dynamic + raw-body-first convention; failure taxonomy is 500 (misconfig) / 400 (bad sig) / 200 (unsupported event or downstream failure) to prevent provider retry storms

### Roadmap Evolution

- Phase 11.1 inserted after Phase 11: Donate page 2-step UX rework (URGENT)

### Pending Todos

None.

### Blockers/Concerns

- Stripe account not yet created (needs SIRET + IBAN, 1-2 days verification)
- BTCPay Server not yet deployed (user needs to choose infra option)
- Telegram bot not yet created (needs @BotFather setup)

## Session Continuity

Last session: 2026-04-16T10:19:11.370Z
Stopped at: Completed 12-02-PLAN.md

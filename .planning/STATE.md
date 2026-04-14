---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Donate & Desktop
status: unknown
stopped_at: Completed 11-05-PLAN.md
last_updated: "2026-04-14T21:52:22.362Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 5
  completed_plans: 5
  percent: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09)

**Core value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.
**Current focus:** v1.3 Donate & Desktop — donation page, webhooks Telegram, desktop badges, X/Twitter footer

## Current Position

Milestone v1.3 Donate & Desktop: IN PROGRESS
Phase 10 complete (1/4 phases). Next: Phase 11 or 13.

Progress: [█░░░░░░░░░] 12% (v1.3 milestone)

## Phase Overview

| Phase | Goal | Status | Depends on |
|-------|------|--------|------------|
| 10. Social & Footer | X/Twitter icon in footer | Complete | — |
| 11. Donation Page | /donate with Stripe + BTCPay | Pending | — |
| 12. Webhook Notifications | Telegram bot notifications | Pending | Phase 11 |
| 13. Desktop Preparation | Coming Soon badges Mac/Win/Linux | Pending | — |

**Next action:** `/gsd:plan-phase 11` (main feature) or `/gsd:plan-phase 13` (quick win)

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

### Pending Todos

None.

### Blockers/Concerns

- Stripe account not yet created (needs SIRET + IBAN, 1-2 days verification)
- BTCPay Server not yet deployed (user needs to choose infra option)
- Telegram bot not yet created (needs @BotFather setup)

## Session Continuity

Last session: 2026-04-14T21:52:22.360Z
Stopped at: Completed 11-05-PLAN.md

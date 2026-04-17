---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Donate & Desktop
status: in-progress
stopped_at: Completed 13-02-copy-sweep-PLAN.md
last_updated: "2026-04-17T06:02:09.828Z"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 10
  completed_plans: 10
  percent: 60
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09)

**Core value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.
**Current focus:** v1.3 Donate & Desktop — donation page, webhooks Telegram, desktop badges, X/Twitter footer

## Current Position

Milestone v1.3 Donate & Desktop: IN PROGRESS
Phase 13 Desktop Preparation COMPLETE — both 13-01 (Platforms component + downloads.ts + JSON-LD) and 13-02 (Platforms i18n namespace + Metadata/Comparison/Support copy sweep) now have SUMMARY files on disk. All 17 v1.3 requirements marked Complete. Ready for `/gsd:complete-milestone v1.3`.

Progress: [██████████] 100% of phases (5/5 with SUMMARY on disk — Phase 13 closed at 2026-04-17) | 12/12 plans complete (includes Phase 13's 2 plans)

## Phase Overview

| Phase | Goal | Status | Depends on |
|-------|------|--------|------------|
| 10. Social & Footer | X/Twitter icon in footer | Complete | — |
| 11. Donation Page | /donate with Stripe + BTCPay | Complete | — |
| 11.1. Donate 2-step UX rework | Method-picker + amount card, brand-blue CTA | Complete | Phase 11 |
| 12. Webhook Notifications | Telegram bot notifications | Complete (12-01 + 12-02 shipped) | Phase 11 |
| 13. Desktop Preparation | Coming Soon badges Mac/Win/Linux | Complete (2026-04-17) | — |

**Next action:** `/gsd:complete-milestone v1.3` to wrap the Donate & Desktop milestone. Operator-side Phase 12 provisioning (Stripe account, BTCPay Server, Telegram bot) remains before webhook notifications can flow end-to-end, but all v1.3 code/docs are shipped and all 17 requirements marked Complete.

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
- [Phase 13-desktop-preparation]: SSR-safe OS auto-detection on Platforms component: initial useState<Selection>(null) + useEffect + requestAnimationFrame + mobile-first UA regex (iPhone|iPad|iPod|Android tested BEFORE Mac/Windows/Linux) to defeat iPadOS 13+ Mac-UA spoof (Pitfall 2) — iPadOS 13+ ships a desktop-Safari UA indistinguishable from macOS. A naive Mac-first UA regex would mis-select the macOS tab on iPad. Putting the mobile regex first returns null for iPads and shows the neutral select_prompt. Confirmed in manual QA with the iPadOS 17 UA. Identical useState<null> on server and client guarantees hydration parity (no "Text content does not match" warnings). Pattern is reusable for any future UA-keyed UI.
- [Phase 13-desktop-preparation]: Config-first desktop wiring: src/config/downloads.ts typed `as const` with every variant `enabled: false` and anyEnabled() helper; future binary drop is a pure config toggle, not a code change — Mirrors donate.ts convention. Arch-aware (mac arm64/x64, win x64/arm64, linux appimage/deb/rpm). Platforms component imports downloads (touched via `void downloads`) so TS narrows the dependency and when binaries ship, flipping enabled:true is the only edit. Avoids scattered URL constants and makes the activation checklist trivial.
- [Phase 13-02]: Metadata.title final wording — EN "dictus -- 100% Offline Voice Dictation for Mobile & Desktop" (59 chars) / FR "dictus -- Dictation vocale 100% offline Mobile & Desktop" (56 chars) — both under the 70-char OG budget
- [Phase 13-02]: Comparison.dictus_platforms uses "Mobile & Desktop" in both locales (not translated to "Mobile et Desktop" in FR) for consistent compact rendering next to competitor rows like "iOS, macOS, Windows, Android"
- [Phase 13-02]: Keep "Desktop" as English loanword in FR copy — aligns with brand-voice convention of untranslated product/platform names (Apple Pay, Visa, Mastercard precedent)
- [Phase 13-02]: New Platforms namespace inserted between Support and Donate in JSON order (not alphabetical) to group landing-page section namespaces for reviewer clarity
- [Phase 13-02]: Support.compatibility_text restructured from em-dash clause to comma-list sentence — new content enumerates 5 platform states (iOS beta, Android beta, macOS/Windows/Linux coming soon) that read more naturally as a list

### Roadmap Evolution

- Phase 11.1 inserted after Phase 11: Donate page 2-step UX rework (URGENT)

### Pending Todos

None. Phase 13 closed; v1.3 milestone ready for `/gsd:complete-milestone`.

### Blockers/Concerns

- Stripe account not yet created (needs SIRET + IBAN, 1-2 days verification)
- BTCPay Server not yet deployed (user needs to choose infra option)
- Telegram bot not yet created (needs @BotFather setup)

## Session Continuity

Last session: 2026-04-17T06:02:09.826Z
Stopped at: Completed 13-02-copy-sweep-PLAN.md — Phase 13 fully closed (13-01 + 13-02 both have SUMMARY on disk); v1.3 milestone ready to wrap

# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.2 — Video & Compliance

**Shipped:** 2026-03-22
**Phases:** 2 | **Plans:** 6 | **Timeline:** 3 days

### What Was Built
- Bilingual privacy policy (10 Apple-required sections) and support pages for App Store compliance
- Footer links and sitemap integration for compliance pages
- Isolated Remotion workspace with deterministic frame-based waveform math
- DictusPromo composition: 5-beat storyboard (accroche, voix, transcription, features, logo reveal)
- 4 rendered MP4 promos (FR/EN x dark/light) with theme-aware colors and smoothed waveform bars
- Hero simplified (demo state machine removed), Logo refined, contact email updated

### What Worked
- Isolated `video/` workspace kept Remotion deps out of the Next.js build -- zero coupling
- Pivoting from demo to promo video was the right call -- cleaner, more versatile asset
- Deciding NOT to embed video on landing page avoided unnecessary complexity
- Phase 8 (compliance) ran fully through GSD with clean UAT (7/7 pass)
- Waveform math port was reusable across DictusDemo and DictusPromo compositions

### What Was Inefficient
- Phase 9 plan 04 had significant work done outside GSD -- summary tracking lost
- VID-05/VID-06 requirements weren't updated during execution (stale tracking again)
- Some debug screenshots (.png) accumulated in project root during manual iteration
- Phase 10 was planned but never needed -- scope should have been validated earlier

### Patterns Established
- `computeSmoothedBars()` IIR filter for buttery waveform animation in Remotion (60fps site -> 30fps video)
- Theme-aware color system: `THEME_COLORS` record with dark/light variants for video rendering
- Google Fonts loaded via `@remotion/google-fonts` for consistent typography in video
- Session-based animation skip in ScrollReveal (sessionStorage flag)

### Key Lessons
1. Validate phase scope before planning -- Phase 10 was unnecessary and should have been questioned earlier
2. Work done outside GSD loses tracking -- either commit through GSD or reconcile promptly
3. REQUIREMENTS.md tracking continues to fall behind during execution (3rd milestone in a row)
4. Promo videos are more versatile than demo videos -- can be used externally without page integration

### Cost Observations
- Model mix: opus for GSD phases 8-9, manual work for video iteration
- Sessions: ~3 sessions across 3 days
- Notable: significant manual iteration on video aesthetics outside GSD workflow

---

## Milestone: v1.1 — Polish & Differentiation

**Shipped:** 2026-03-17
**Phases:** 3 | **Plans:** 6 | **Timeline:** 7 days

### What Was Built
- Light/dark theme system with CSS variable swap (9 swappable tokens), next-themes, sun/moon toggle with SVG morph
- Two-tier Liquid Glass glassmorphism: Tier 1 frosted glass on Nav/Hero, Tier 2 soft glass on all section cards
- 3-phase waveform choreography (flat/active/calm) synced to demo state with reduced-motion static frame
- Competitor comparison table (5 products x 6 dimensions) with desktop sticky header and mobile card stack
- Adaptive TestFlight CTA with client-side device detection, QR code for desktop, direct button for iPhone

### What Worked
- Dark-origin token names for zero-churn migration -- no existing component files needed updating for theme system
- Two-tier glass hierarchy gave clear design language without over-engineering
- CSS custom properties as the indirection layer -- theme, glass, and waveform all use the same pattern
- Coarse granularity (3 phases, 6 plans) matched the scope well -- no unnecessary plan splits
- UAT passed clean across all 3 phases (16/16 pass, 0 issues)

### What Was Inefficient
- REQUIREMENTS.md tracking fell behind -- THEME-01 and THEME-03 completed but checkboxes not updated (stale tracking)
- Phase 5 marked as "Not started" in ROADMAP.md progress table despite being complete (stale ROADMAP tracking)
- Phase 7 progress table row had misaligned columns

### Patterns Established
- CSS variable swap pattern: @theme tokens reference var(--theme-*) which resolve differently under :root vs .dark
- Two-tier glass tokens: --glass-t1-bg (blur-20, saturate-1.5) and --glass-t2-bg (blur-12, saturate-1.2)
- No nested backdrop-filter: children inside glass panels use bg-only
- Client-side device branching: unknown state during SSR, detect on mount via useEffect
- Env-var feature flag: NEXT_PUBLIC_ prefix for build-time inlining, empty = disabled

### Key Lessons
1. Keep REQUIREMENTS.md and ROADMAP.md progress tables updated during execution, not just at milestone boundaries
2. CSS variable indirection is the right abstraction for any value that changes by context (theme, glass tier, responsive)
3. Client-side detection patterns must always have an SSR fallback to prevent hydration mismatches

### Cost Observations
- Model mix: primarily opus for planning/execution
- Sessions: ~4 sessions across 7 days
- Notable: all 6 plans executed in under 3 min each -- high velocity due to clear phase boundaries

---

## Milestone: v1.0 — dictus Landing Page

**Shipped:** 2026-03-10
**Phases:** 4 | **Plans:** 10 | **Timeline:** 2 days

### What Was Built
- Complete bilingual FR/EN marketing landing page for dictus (offline iOS voice dictation keyboard)
- 7 content sections with dark glassmorphism design aligned to brand kit
- Canvas waveform animation ported from iOS BrandWaveform.swift, word-by-word text reveal, 5-state micro-animation
- Scroll-triggered reveals with reduced-motion support
- Full SEO suite (OG, JSON-LD, hreflang, sitemap) -- Lighthouse 97-98/93/100/92
- Zero third-party scripts architecture

### What Worked
- Content-before-animations phase ordering prevented rework -- all sections were stable before adding Motion
- Tailwind v4 @theme in globals.css as single source of truth simplified token management
- next-intl v4 with proxy.ts middleware pattern handled i18n cleanly
- LazyMotion (~4.6kb) kept bundle small while enabling rich animations
- Phase 2 gap closure (NAV-03 blur) caught early via verification, fixed in same phase

### What Was Inefficient
- Phase 4 plan 04-01/04-02 split was artificial -- SEO + Lighthouse could have been one plan
- staggerChildVariants exported speculatively and never used (dead code)
- LanguageToggle aria-labels were hardcoded instead of using existing i18n -- should have been caught during Phase 2

### Patterns Established
- Inline SVG icons throughout (no icon library dependency)
- Server components with useTranslations for section-level i18n
- min-h-dvh for mobile-safe viewport height
- min-h-11 min-w-11 pattern for 44px touch targets
- Canvas animation with useAnimationFrame hook + requestAnimationFrame

### Key Lessons
1. Verify integration points (like aria-labels using i18n) during the phase that creates them, not in a polish phase
2. Turbopack has edge cases with static assets -- always test production build early
3. WCAG contrast requirements should be checked when defining design tokens, not as a late fix

### Cost Observations
- Model mix: primarily opus for planning/execution
- Sessions: ~6 sessions across 2 days
- Notable: 10 plans completed in approximately 2 days -- high velocity for a complete landing page

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 2 days | 4 | Initial project -- established GSD workflow |
| v1.1 | 7 days | 3 | Polish iteration -- all plans under 3 min, zero UAT issues |
| v1.2 | 3 days | 2 | Video + compliance -- significant manual work outside GSD |

### Cumulative Quality

| Milestone | Lighthouse Perf | Lighthouse A11y | Lighthouse BP | Lighthouse SEO |
|-----------|-----------------|-----------------|---------------|----------------|
| v1.0 | 97-98 | 93 | 100 | 92 |
| v1.1 | TBD | TBD | TBD | TBD |

### Top Lessons (Verified Across Milestones)

1. Phase ordering matters: build content before animations to avoid rework
2. Verify i18n integration in every component during its creation phase
3. CSS variable indirection is the right abstraction for context-dependent values
4. Keep tracking docs (REQUIREMENTS.md, ROADMAP.md) updated during execution (repeated v1.0, v1.1, v1.2)
5. Validate phase necessity before planning -- unnecessary phases waste planning effort (v1.2 Phase 10)

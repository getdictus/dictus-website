# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

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

### Cumulative Quality

| Milestone | Lighthouse Perf | Lighthouse A11y | Lighthouse BP | Lighthouse SEO |
|-----------|-----------------|-----------------|---------------|----------------|
| v1.0 | 97-98 | 93 | 100 | 92 |

### Top Lessons (Verified Across Milestones)

1. Phase ordering matters: build content before animations to avoid rework
2. Verify i18n integration in every component during its creation phase

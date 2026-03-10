# Requirements: dictus Landing Page

**Defined:** 2026-03-10
**Core Value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.

## v1.1 Requirements

Requirements for milestone v1.1 — Polish & Differentiation. Each maps to roadmap phases.

### Theme (Light/Dark Mode)

- [ ] **THEME-01**: User can toggle between light, dark, and system theme via Nav toggle
- [ ] **THEME-02**: All 72 dark-only color references migrated to semantic tokens that swap per theme
- [ ] **THEME-03**: Canvas waveform reads colors from CSS custom properties (theme-aware)
- [ ] **THEME-04**: Theme preference persists across sessions (localStorage)
- [ ] **THEME-05**: Theme switch animates with smooth 200ms cross-fade transition
- [ ] **THEME-06**: No flash of wrong theme on page load (FOWT prevention)

### Comparison Table

- [ ] **COMP-01**: User can view a comparison table with Dictus, Apple Dictation, WhisperFlow, SuperWhisper, MacWhisper
- [ ] **COMP-02**: Table compares: price, offline capability, privacy, platforms, AI rewrite, open source
- [ ] **COMP-03**: Dictus column visually highlighted with accent border and subtle glow
- [ ] **COMP-04**: Table has sticky header row on scroll
- [ ] **COMP-05**: Table displays as card stack on mobile (responsive)
- [ ] **COMP-06**: Table rows stagger-animate on scroll entry
- [ ] **COMP-07**: Comparison data is bilingual (FR + EN via i18n)

### Hero Waveform

- [ ] **HERO-01**: Waveform starts flat/idle when section enters viewport
- [ ] **HERO-02**: Waveform animates with simulated voice energy (random amplitude movement)
- [ ] **HERO-03**: Waveform transitions to transcription state with rhythmic pattern
- [ ] **HERO-04**: Text reveal timing syncs with waveform energy (text appears as waveform calms)
- [ ] **HERO-05**: Full sequence respects prefers-reduced-motion

### Liquid Glass

- [ ] **GLASS-01**: Liquid Glass effect applied to nav bar, hero overlay, and 2-3 feature cards
- [ ] **GLASS-02**: CSS baseline: backdrop-filter blur + saturate works in all browsers
- [ ] **GLASS-03**: SVG displacement filter adds refraction effect on Chromium (progressive enhancement)
- [ ] **GLASS-04**: Liquid Glass tuned for both light and dark themes
- [ ] **GLASS-05**: Performance acceptable on mobile Safari (no jank, no battery drain)

### Adaptive CTA

- [ ] **CTA-01**: iPhone visitors see "Join TestFlight" button with deep link
- [ ] **CTA-02**: Desktop visitors see "Available on iPhone" with QR code pointing to TestFlight
- [ ] **CTA-03**: CTA text is bilingual (FR + EN)
- [ ] **CTA-04**: Graceful fallback if TestFlight URL not yet available (current "Coming Soon" behavior)
- [ ] **CTA-05**: Device detection is client-side only (no hydration mismatch)

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Demo Videos

- **DEMO-01**: User can view demo videos of the app in HowItWorks and/or DataFlow sections
- **DEMO-02**: Videos are self-hosted MP4 (zero third-party, aligned with privacy stance)
- **DEMO-03**: Videos display poster frame initially, load on interaction or viewport entry (facade pattern)
- **DEMO-04**: Videos play inline, muted, looping (iOS-compatible)
- **DEMO-05**: Videos are lazy-loaded via IntersectionObserver (Lighthouse 90+ maintained)

### App Store

- **STORE-01**: App Store badge and screenshots section
- **STORE-02**: Device-detection for badge display

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Email capture / newsletter | Contradicts privacy-first positioning |
| Analytics / tracking | Zero tracking is the stance |
| Cookie consent banner | No cookies = no banner needed |
| Blog / CMS | Scope creep, landing page only |
| Parallax scrolling | Janky on mobile Safari, dated in 2026 |
| Chat widget / support | GitHub Issues + Telegram suffice |
| Social media embeds | Third-party scripts, contradicts privacy |
| Multi-page navigation | Single landing page, one flow, one CTA |
| YouTube/Vimeo embeds | Third-party iframes violate zero-tracking policy |
| Full-page Liquid Glass | SVG filters broken in Safari, GPU budget on mobile |
| Animated SVG logo in nav | Constant GPU load, competes with hero waveform |
| Custom theme builder | Scope creep, two themes (light/dark) sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| THEME-01 | Phase 5 | Pending |
| THEME-02 | Phase 5 | Pending |
| THEME-03 | Phase 5 | Pending |
| THEME-04 | Phase 5 | Pending |
| THEME-05 | Phase 5 | Pending |
| THEME-06 | Phase 5 | Pending |
| GLASS-01 | Phase 6 | Pending |
| GLASS-02 | Phase 6 | Pending |
| GLASS-03 | Phase 6 | Pending |
| GLASS-04 | Phase 6 | Pending |
| GLASS-05 | Phase 6 | Pending |
| HERO-01 | Phase 6 | Pending |
| HERO-02 | Phase 6 | Pending |
| HERO-03 | Phase 6 | Pending |
| HERO-04 | Phase 6 | Pending |
| HERO-05 | Phase 6 | Pending |
| COMP-01 | Phase 7 | Pending |
| COMP-02 | Phase 7 | Pending |
| COMP-03 | Phase 7 | Pending |
| COMP-04 | Phase 7 | Pending |
| COMP-05 | Phase 7 | Pending |
| COMP-06 | Phase 7 | Pending |
| COMP-07 | Phase 7 | Pending |
| CTA-01 | Phase 7 | Pending |
| CTA-02 | Phase 7 | Pending |
| CTA-03 | Phase 7 | Pending |
| CTA-04 | Phase 7 | Pending |
| CTA-05 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after roadmap creation*

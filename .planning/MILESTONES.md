# Milestones

## v1.0 dictus Landing Page (Shipped: 2026-03-10)

**Phases completed:** 4 phases, 10 plans
**Timeline:** 2 days (2026-03-09 → 2026-03-10)
**Stats:** 27 source files, 1,600 LOC TypeScript/CSS, 60 commits

**Key accomplishments:**
- Next.js 16 scaffold with Tailwind v4 design tokens, self-hosted DM Sans/Mono fonts, dark-only brand styling
- Full bilingual FR/EN landing page with 7 content sections, glassmorphism cards, and responsive layout (320px-desktop)
- Canvas waveform animation (iOS BrandWaveform port), word-by-word text reveal, 5-state micro-animation cycle
- Scroll-triggered section reveals with prefers-reduced-motion support via Motion v12 LazyMotion
- SEO metadata (OG tags, JSON-LD, hreflang, sitemap) and Lighthouse 90+ on all 4 metrics
- Zero third-party scripts -- complete privacy-first architecture (no analytics, no cookies, self-hosted fonts)

**Tech debt carried forward:**
- Telegram CTA href="#" placeholders (pre-launch, intentional)
- Dead exports: staggerChildVariants, staggerChildReducedVariants in ScrollReveal.tsx
- LanguageToggle aria-labels hardcoded instead of using i18n translations

---


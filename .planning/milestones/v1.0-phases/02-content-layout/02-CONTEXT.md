# Phase 2: Content & Layout - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all content sections (hero, features, how-it-works, data flow diagram, open source, community CTA, footer) with static content, glassmorphism cards, responsive layout, and bilingual FR/EN support. No animations (Phase 3), no SEO metadata (Phase 4), no nav blur on scroll (deferred to Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Hero section
- Full viewport height (100vh), immersive dark hero
- Bold & direct headline tone — short, punchy, confident ("Your voice stays yours." style)
- Waveform animation sits as ambient/background element behind the headline (not stacked below)
- CTA: "Coming Soon" badge — no TestFlight link available yet, swap later
- Subtitle + Coming Soon badge centered below headline
- Waveform is a placeholder in Phase 2 (static or minimal) — Phase 3 brings the sinusoidal animation

### Feature cards
- 2x2 grid layout on desktop, stacking to 1 column on mobile
- Full glassmorphism effect: visible backdrop-blur, translucent background, frosted edges (respect DSGN-03: ≤6 blur elements per viewport)
- Each card contains: icon + title + 1-2 sentence description
- 4 cards: Privacy/Offline, Smart Mode LLM, Keyboard Integration, Open Source
- Icon style: Claude's discretion (will choose best approach for glassmorphism cards + brand kit)

### How it works
- Horizontal 3-step layout with arrow connectors: tap mic → speak → text appears
- Each step has an icon + short text
- Stacks vertically on mobile

### Data flow diagram
- Standalone glassmorphism card with illustration inside
- Shows: voice → on-device model → text, with no-cloud messaging
- Separate section from features (not folded into Privacy card)

### Open source section
- Static link to github.com/Pivii/dictus only — no live GitHub stats, no API calls
- Brief text about transparency and open source values
- Consistent with privacy stance (no external requests)

### Community CTA
- Full-width banner CTA with headline ("Join the community" style) and Telegram button
- Telegram link: placeholder (#) for now — swap real URL later
- Prominent, distinct section before footer

### Section flow & spacing
- Section order: Hero → Features → How it works → Data flow → Open source → Community → Footer
- Subtle background color shifts between sections (ink-deep ↔ ink ↔ ink-2 cycling)
- Spacious vertical padding (py-24 to py-32 range) — premium dark aesthetic
- No section headings — content flows without explicit titles, sections speak for themselves

### Footer
- Minimal single line: "© PIVI Solutions" left, GitHub + Telegram icon links right
- Privacy statement below (PRIV-02)
- Ultra-clean, not cluttered

### Nav (Phase 2 scope)
- NAV-02: Language toggle already exists — ensure it works with all new content
- NAV-03 (glassmorphism blur on scroll): deferred to Phase 3 with other animations

### Claude's Discretion
- Feature card icon style (inline SVG vs glow circles vs other)
- Privacy statement wording (short or slightly expanded)
- Hero subtitle copy
- Exact glassmorphism intensity values (blur radius, opacity, border treatment)
- Waveform placeholder approach for Phase 2 (static SVG shape or CSS)
- Exact spacing values within the py-24/py-32 range

</decisions>

<specifics>
## Specific Ideas

- Hero: full viewport, bold, ambient waveform behind text — Apple keynote energy
- "Coming Soon" badge, not a disabled button — should feel intentional, not broken
- Glassmorphism is real (backdrop-blur), not faked — the user chose full glass effect
- No section headings: the page should feel like one continuous narrative, not a checklist
- Background shifts use existing ink-deep/ink/ink-2 tokens — no new colors

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Nav` component (src/components/Nav/Nav.tsx): sticky nav with Logo + LanguageToggle, max-w-6xl container
- `Logo` component (src/components/Nav/Logo.tsx): inline SVG waveform icon + wordmark
- `LanguageToggle` component (src/components/Nav/LanguageToggle.tsx): FR/EN toggle using useRouter.replace
- Design tokens in globals.css @theme: all brand colors, borders, glows available as Tailwind utilities

### Established Patterns
- Feature-based folders: src/components/Nav/ → new sections follow same pattern (src/components/Hero/, src/components/Features/, etc.)
- i18n: `useTranslations("SectionName")` for translations, `setRequestLocale(locale)` for server components
- Layout: NextIntlClientProvider wraps all content, main has pt-16 for nav offset
- Styling: Tailwind utilities + @theme tokens, no CSS modules

### Integration Points
- `page.tsx` (src/app/[locale]/page.tsx): currently a placeholder — will be replaced with all section components
- Translation files: need to add keys for all section content in both FR and EN
- Max-width container: nav uses max-w-6xl px-6 — sections should use consistent container width

</code_context>

<deferred>
## Deferred Ideas

- Nav glassmorphism blur on scroll (NAV-03) — moved to Phase 3 with other animations
- Waveform sinusoidal animation — Phase 3

</deferred>

---

*Phase: 02-content-layout*
*Context gathered: 2026-03-09*

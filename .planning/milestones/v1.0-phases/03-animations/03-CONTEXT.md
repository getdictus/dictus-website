# Phase 3: Animations - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

The page feels alive — waveform pulses, text appears word-by-word, sections reveal on scroll, and state indicators cycle through dictus modes. All animations respect `prefers-reduced-motion`. No new content sections, no SEO work, no performance optimization beyond motion best practices.

</domain>

<decisions>
## Implementation Decisions

### Sinusoidal waveform (HERO-02)
- Canvas-based rendering (not SVG) for smooth sinusoidal animation via requestAnimationFrame
- 2-3 overlapping sine waves at different frequencies/amplitudes with varying opacity — organic, voice-spectrum feel
- Subtle ambient intensity: ~10-20% opacity with soft glow, lives behind hero text as atmosphere
- Continuous loop — waves pulse endlessly at a calm rhythm, not tied to a dictation sequence
- Replaces the current static 3-bar SVG in the hero section
- Uses brand kit accent blue (#3D7EFF) / accent hi (#6BA3FF) / sky (#93C5FD) palette

### Word-by-word text reveal (HERO-03)
- A demo sentence appears word-by-word in a dedicated area below the hero subtitle
- Displayed inside a glassmorphism input field container (frosted glass bg, backdrop-blur, border-white/7, blinking cursor) — this becomes the 6th blur element, hitting the DSGN-03 limit
- Loops through 3-4 different example sentences, cycling continuously (clear and restart with next sentence)
- Sentences are bilingual — match current locale (FR sentences for /fr, EN for /en)
- Natural speech pace: ~200-300ms per word with slight variation for organic feel
- Blinking cursor at the insertion point

### Scroll-triggered section reveals (ANIM-01)
- Fade + slide up: sections fade in while sliding up ~30-50px
- Stagger children within sections: e.g., feature cards appear one by one (~100-150ms apart)
- Trigger threshold: animation starts when ~20% of the section is in viewport
- Play once only — no replay on scroll back up, sections stay visible after animating in
- Uses Motion v12 with LazyMotion (already installed, ~4.6kb)

### State micro-animation (ANIM-02)
- Lives in the hero area, positioned above the glassmorphism text input field as a status indicator
- Visual: colored dot + text label per state
- Dot uses brand kit state colors: idle (white/30%), recording (#EF4444 + pulse), transcribing (#3D7EFF + pulse), smart mode (#8B5CF6 + pulse), inserted (#22C55E, static)
- Full cycle: ~8-10 seconds total (~2s per state), loops continuously
- Loosely synced with the text reveal: idle → recording (text starts appearing) → transcribing (words flowing) → smart mode (pause) → inserted (sentence complete, brief hold, then reset)

### Reduced motion (ANIM-03)
- All animations disabled or simplified when `prefers-reduced-motion: reduce` is active
- Canvas waveform: static or very slow opacity pulse only
- Text reveal: show full sentence immediately, no word-by-word
- Scroll reveals: instant visibility, no transition
- State indicator: show states without dot pulse animation

### Claude's Discretion
- Exact sine wave frequencies, amplitudes, and phase offsets for the 2-3 layers
- Canvas sizing and responsive scaling approach
- Demo sentence content (the actual example phrases in FR and EN)
- Exact stagger timing and easing curves for scroll animations
- Motion v12 LazyMotion feature bundle strategy (domAnimation vs domMax)
- How to coordinate the loose sync between state cycle and text reveal timing
- Exact slide distance (within 30-50px range) and animation duration for scroll reveals

</decisions>

<specifics>
## Specific Ideas

- The hero becomes a mini product demo: waveform + state indicator + text reveal working together tell the dictation story
- State indicator above the text input field mirrors the actual app UX (tap → speak → text appears)
- Glassmorphism input field should feel like a real iOS text field — clean, frosted, with cursor
- The waveform is ambient atmosphere, not the star — it supports the text reveal experience
- "Apple keynote energy" from Phase 2 context carries forward — polished, confident, not flashy

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Hero.tsx` (src/components/Hero/Hero.tsx): Current hero with static SVG waveform at 7% opacity — Canvas replaces this SVG
- `Logo.tsx` (src/components/Nav/Logo.tsx): Inline SVG waveform icon pattern — reference for wave bar proportions
- Motion v12 (`motion` package) already in package.json — ready for LazyMotion setup
- Design tokens in globals.css @theme: all state colors, accent colors, glows available as Tailwind utilities

### Established Patterns
- Inline SVG throughout (no icon libraries) — consistent with Phase 2 decisions
- Feature-based folders: src/components/Hero/, src/components/Features/, etc.
- i18n: `useTranslations("SectionName")` — demo sentences need translation keys
- Client components where interactivity needed (LanguageToggle pattern)
- 5 backdrop-blur elements currently (4 feature cards + 1 DataFlow) — glassmorphism text input adds 6th, hitting DSGN-03 limit

### Integration Points
- Hero.tsx needs major rework: add Canvas waveform, text reveal, state indicator components
- All section components need scroll-trigger wrappers (Features, HowItWorks, DataFlow, OpenSource, Community, Footer)
- Translation files: add demo sentence content for FR and EN
- LazyMotion provider needs to wrap the app (or page) for Motion v12 tree-shaking

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-animations*
*Context gathered: 2026-03-09*

# Phase 5: Theme System - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Light/dark mode toggle with semantic token migration, FOWT prevention, and smooth 200ms transition. All 13 files with hardcoded dark-only colors must be migrated. Canvas waveform must become theme-aware.

</domain>

<decisions>
## Implementation Decisions

### Light mode color palette
- Match the Dictus iOS app exactly (from DictusColors.swift)
- Background: `#F2F2F7` (iOS secondarySystemBackground)
- Surface/cards: `#FFFFFF`
- Text primary: `#000000` (iOS .label)
- Text body: system gray (~`#808080`)
- Borders: ~`#E0E0E0` (iOS systemGray4)
- Accent blue: `#3D7EFF` — same in both modes, no adjustment for light
- Semantic colors (recording, smart, success, warning) stay identical across modes
- Cards in light mode keep frosted glass aesthetic (semi-transparent white with backdrop-blur), not solid white

### Toggle design
- Placement: next to the language toggle (FR/EN) on the right side of the nav
- Style: animated sun/moon icon morph (smooth transition between sun and moon)
- 2-state toggle: light / dark only (no explicit "system" option)
- Default for first visit: respect system preference (prefers-color-scheme)
- After first toggle, user choice persists via localStorage

### Waveform theme colors
- Edge bars: gray (~#808080 with varying opacity) in light mode, white with opacity in dark mode — matches iOS BrandWaveform.swift
- Center bars: upgrade to gradient (#6BA3FF -> #2563EB) in BOTH modes — matches iOS app, replaces current solid #3D7EFF
- Waveform smoothly transitions colors when theme switches (~300ms lerp between old and new color values)
- Canvas reads theme from CSS custom properties or React context — no more hardcoded BRAND_BLUE and EDGE_COLOR_RGB constants

### Claude's Discretion
- Exact semantic token naming strategy (bg-primary vs bg-app etc.)
- Implementation of the sun/moon morph animation (SVG path morph, CSS, or canvas)
- How to propagate theme to canvas (CSS custom properties vs React context vs ThemeProvider prop)
- FOWT prevention script placement and approach
- Tailwind v4 @custom-variant dark configuration
- Migration order across the 13 affected files

</decisions>

<specifics>
## Specific Ideas

- "Match the iOS app exactly" — Light palette comes from DictusColors.swift adaptive colors
- iOS app uses `UIColor(dynamicProvider:)` pattern with light/dark pairs — website should feel the same
- The frosted glass cards in light mode are important — keeps the premium glassmorphism identity even in light mode
- Sun/moon morph animation should feel premium — not a jarring icon swap

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LanguageToggle` (src/components/Nav/LanguageToggle.tsx): Pattern for toggle placement in nav — theme toggle sits beside it
- `useReducedMotion` (from motion/react): Already used in Hero/Waveform — reuse for reduced-motion theme transition
- `useAnimationFrame` hook: Could be used for smooth waveform color lerp during theme switch

### Established Patterns
- Tailwind v4 `@theme` block in globals.css: All 17 color tokens defined here — this is the single source of truth to migrate
- Component styling: All components use Tailwind utility classes (`bg-ink-deep`, `text-white-70`, etc.) — systematic find/replace after token migration
- Canvas rendering: Waveform.tsx uses hardcoded color constants (BRAND_BLUE, EDGE_COLOR_RGB) — these must read from theme

### Integration Points
- `globals.css` @theme block: Add light mode token values, configure @custom-variant dark
- `src/app/[locale]/layout.tsx`: Add ThemeProvider wrapper (next-themes)
- `Nav.tsx`: Add ThemeToggle component next to LanguageToggle
- `Waveform.tsx`: Refactor color resolution to be theme-aware (lines 14-15 hardcoded constants)
- All 13 files with dark-only color classes: Systematic migration to semantic/theme-aware tokens

### iOS App Color Reference
- Source: ~/dev/dictus/DictusCore/Sources/DictusCore/Design/DictusColors.swift
- Adaptive colors: dictusBackground (#F2F2F7 light / #0A1628 dark), dictusSurface (#FFFFFF light / #161C2C dark)
- Waveform: BrandWaveform.swift — gray edges in light, white edges in dark, gradient center bars (#6BA3FF -> #2563EB)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-theme-system*
*Context gathered: 2026-03-11*

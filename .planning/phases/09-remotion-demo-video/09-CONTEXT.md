# Phase 9: Remotion Demo Video - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Isolated Remotion workspace that produces polished MP4 demo videos (FR + EN) showing the full dictus voice dictation flow with iOS-native feel. The video shows an iPhone with real app context (Messages, Notes) and the dictus keyboard in action. Phase 10 handles embedding the video on the site.

</domain>

<decisions>
## Implementation Decisions

### iPhone mockup style
- Render **two mockup variants** for comparison: realistic device frame AND screen-only (rounded rectangle)
- User will pick the final variant after reviewing both renders
- Both variants must be easy to swap (component-level toggle)

### Screen content — Messages scene
- Messages-style app UI (iMessage-like) with dictus keyboard visible at bottom
- Conversation with 2-3 existing messages, then user dictates a short everyday reply
- Phrase courte du quotidien (e.g., FR: "On se retrouve a 19h au restaurant ce soir ?", EN: equivalent)
- Keyboard rendered faithfully — iOS-style keys with dictus waveform bar at top and mic button

### Screen content — Notes scene
- Apple Notes-style app UI with dictus keyboard
- Longer dictated text (a few sentences) to show fluidity on real content
- Transition from Messages to Notes via **horizontal slide/swipe** (iOS app-switching feel)

### Demo flow (4 states, NOT 5)
- Sequence per scene: idle → recording → transcribing → inserted
- **No smart mode** — feature not yet implemented in the app
- State colors match existing site: idle=rgba(255,255,255,0.3), recording=#EF4444, transcribing=#3D7EFF, inserted=#22C55E
- Waveform matches hero canvas: 30 bars, center-weighted gradient, edge opacity

### Background & composition
- Dark background (ink-deep #0A1628) with subtle radial blue gradient (glow-soft) behind the iPhone
- Premium depth feel, consistent with site aesthetic

### Branding & captions
- Claude's discretion on branding (logo intro/outro) and state captions (labels under iPhone)
- Keep it elegant — let the demo speak for itself

### Bilingual video (i18n)
- **Two separate MP4 renders**: one FR, one EN
- **All visible text is localized**: dictated phrases, contact names, UI labels, captions, tagline
- Phase 10 will serve the correct video based on site locale

### Video loop
- Must loop seamlessly — end transitions back to beginning naturally
- Designed for autoplay-loop on the landing page

### Claude's Discretion
- Video resolution and aspect ratio (optimize for landing page section integration)
- Total duration (optimize for content pacing and loop feel)
- Branding level (logo, tagline presence, placement)
- Caption/label design during demo states
- Exact text content for dictated phrases (everyday, relatable)
- Contact name in Messages conversation
- Notes content topic

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Waveform source of truth
- `src/components/Hero/Waveform.tsx` — Full 30-bar canvas waveform with center-weighted gradient, edge opacity, 4-phase state machine (flat/active/processing/calm). Port this logic to Remotion.
- `src/hooks/useHeroDemoState.ts` — State sequence (idle/recording/transcribing/inserted), durations (1500/2500/2000/2500ms), colors

### Brand & design
- `CLAUDE.md` — Full brand kit: colors, typography, logo, semantic colors, gradients, micro-states
- `.planning/PROJECT.md` — Design constraints, key decisions, tech stack

### Requirements
- `.planning/REQUIREMENTS.md` — VID-01 through VID-05 requirement definitions (note: VID-02 mentions 5 states but smart mode is NOT in scope — use 4 states only)

### Hero components for reference
- `src/components/Hero/Hero.tsx` — How waveform integrates with demo state, text reveal, state indicator
- `src/components/Hero/StateIndicator.tsx` — State pill UI (recording/transcribing indicators)
- `src/components/Hero/TextReveal.tsx` — Text appearance animation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Waveform.tsx`: 460 LOC canvas implementation — core drawing logic (bar layout, color resolution, phase energy computation) can be ported to Remotion's frame-based rendering
- `useHeroDemoState.ts`: State machine with timing config — reuse timing ratios for video pacing
- `StateIndicator.tsx`: State pill component — visual reference for video state labels
- Brand color tokens in `globals.css` and `CLAUDE.md` — use exact same values

### Established Patterns
- Canvas drawing: `computeBarLayout()`, `resolveBarColor()`, `computePhaseEnergy()` — these are the core functions to port
- Center-weighted gradient: inner 40% blue gradient, outer 60% edge color with decreasing opacity
- Smoothing: lerp up (0.3 factor), decay down (0.85 factor) — iOS-matching feel
- Active targets: random amplitudes refreshed every ~150ms with center bonus

### Integration Points
- Output: `public/videos/` directory for MP4 + poster images (FR + EN variants)
- Isolation: `remotion/` workspace with own package.json, fully separate from Next.js build
- STATE.md blocker note: folder name `remotion/` could conflict with `import from "remotion"` — may need alternate naming (e.g., `video/` or `remotion-workspace/`)

</code_context>

<specifics>
## Specific Ideas

- Two mockup variants (realistic frame + screen only) rendered for user to compare and pick
- Messages scene: short everyday phrase — relatable, shows real-world usage in a conversation
- Notes scene: longer text — shows fluidity and accuracy on multi-sentence content
- Horizontal swipe transition between scenes — feels like iOS app switching
- Seamless loop — video designed for continuous autoplay on landing page
- All text fully localized FR/EN — two complete MP4 renders

</specifics>

<deferred>
## Deferred Ideas

- Smart mode (5th state, purple #8B5CF6) — feature not yet implemented in the app. Add to video when smart mode ships.
- Localized voiceover versions (VID-F02 in REQUIREMENTS.md) — future enhancement

</deferred>

---

*Phase: 09-remotion-demo-video*
*Context gathered: 2026-03-19*

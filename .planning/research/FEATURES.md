# Feature Landscape: v1.2 Video & Compliance

**Domain:** Remotion programmatic demo video + App Store compliance pages for iOS app landing page
**Researched:** 2026-03-17
**Overall confidence:** MEDIUM
**Scope:** NEW features only. Existing v1.0/v1.1 features (hero waveform, 7 sections, bilingual, light/dark theme, glassmorphism, comparison table, adaptive CTA) are already shipped.

---

## Table Stakes

Features that are required or expected. Missing = App Store rejection or incomplete milestone.

| Feature | Why Expected | Complexity | Depends On | Notes |
|---------|--------------|------------|------------|-------|
| Privacy Policy page (`/[locale]/privacy/`) | Apple App Store guideline 5.1.1(i) requires a privacy policy URL in App Store Connect metadata AND accessible within the app. Rejection without it. No negotiation. | Low | i18n messages (FR + EN content), App Router page file, Footer link | Content is straightforward for Dictus: "we collect nothing, process everything on-device, share nothing with third parties." Must still cover: data collected, how collected, all uses, third-party sharing, retention/deletion policy, how to revoke consent. Even "none" must be explicitly stated per Apple's guidelines. |
| Support URL visible on site | Apple guideline 1.5 requires "an easy way to contact you." Failure = rejection. | Low | Footer component update, privacy policy page (include contact there too) | A `mailto:` link is sufficient. No need for a support portal, contact form, or ticketing system at this stage. Include in Footer and in the Privacy Policy page. |
| Footer links to Privacy + Support | Privacy policy must be reachable from the public site (Apple reviewers visit the URL). Support contact must be easily discoverable. | Low | Privacy Policy page exists, support email decided | Convert existing `t("privacy")` text in Footer to a Next.js Link pointing to `/[locale]/privacy`. Add a support mailto link or text. |
| Demo video section on landing page | v1.2 milestone explicitly targets this. A landing page for a voice dictation app without a demo showing it in action leaves the core value proposition unproven. | High | Remotion packages installed, composition built, section component created | The Remotion `<Player>` component embeds the video inline as a React component. Must autoplay muted (browser policy) or show clear play controls. Must be responsive (375px to 1440px+). |
| Demo video loads without degrading performance | Existing site scores Lighthouse 97-98. Adding a heavy video component that tanks LCP or TBT would be a regression. | Medium | Lazy loading strategy, code-splitting | Use `next/dynamic` with `ssr: false` to lazy-load the Remotion Player. Wrap in IntersectionObserver to defer mount until near-viewport. Remotion Player's `lazyComponent` prop for the composition itself. |
| Demo video is bilingual | Site is bilingual FR/EN. A demo video showing French text to English visitors (or vice versa) breaks the experience. | Low | Remotion composition accepts `inputProps.locale`, i18n text for demo content | Remotion compositions accept `inputProps` -- pass the current locale. All demo text strings (placeholder messages, UI labels) come from translation files. |

## Differentiators

Features that elevate the demo beyond a screen recording and create premium perception.

| Feature | Value Proposition | Complexity | Depends On | Notes |
|---------|-------------------|------------|------------|-------|
| Programmatic iOS-native feel (Remotion composition) | Instead of a screen recording, build the demo as a React component that pixel-perfectly mimics an iOS message thread with the Dictus keyboard. Controllable, resolution-independent, brand-consistent. No competitor does this for a voice dictation app. | High | Remotion core, iOS frame mockup components (status bar, keyboard tray, message bubbles) | Build iOS chrome as SVG/CSS components inside the Remotion composition. Status bar with time/signal/battery, a Messages-style thread, and the Dictus keyboard tray at bottom. All rendered at composition resolution (1080x1920 for portrait mobile feel, or 1920x1080 for landscape embed). |
| Waveform animation in video matching hero | The site hero already has a choreographed canvas waveform. The demo video should show the same waveform style inside the keyboard mockup. Visual continuity between site and "app" reinforces that this is the real product experience. | Medium | Existing Waveform.tsx logic ported to Remotion | Replace `requestAnimationFrame` with Remotion's `useCurrentFrame()` and `interpolate()`. The vertical-bar waveform logic from `Waveform.tsx` maps directly -- each frame calculates bar heights based on frame number instead of timestamp. Port the 3-phase choreography (flat/active/calm) as `<Sequence>` blocks. |
| State transition choreography | Demo cycles through all 5 dictus states: idle (gray) -> recording (red pulse) -> transcribing (blue pulse) -> smart mode (purple pulse) -> inserted (green). Each state has distinct waveform energy and color, matching the brand kit semantic colors. | Medium | Waveform port, Remotion `interpolateColors()`, `<Sequence>` | Map directly from existing `useHeroDemoState` timing. Use Remotion `<Sequence>` for each state phase. `interpolateColors()` handles smooth color transitions between states. This is the video's narrative arc -- it tells the product story without words. |
| Word-by-word text typing in video | Show transcribed text appearing word-by-word in the message field of the iOS mockup, synced to the transcribing state. Then show smart-mode reformulation replacing the raw text. | Medium | Remotion composition, text content per locale | `useCurrentFrame()` makes frame-precise text reveal trivial. Calculate which words are visible at each frame. For smart mode: animate a "rewriting" effect (blur/fade old text, type new text). Reuses the concept from `TextReveal.tsx` but frame-based instead of time-based. |
| Pre-rendered MP4 for social/App Store | Render the Remotion composition to MP4 via CLI for sharing on social media, embedding in App Store listing, or as a fallback for browsers that struggle with the Player. | Medium | Remotion CLI (`@remotion/cli`), composition complete | `npx remotion render` during build or as a manual script. Output 1080p H.264 MP4. Can generate both portrait (for App Store preview) and landscape (for social/OG video). Store in `/public/videos/`. Use as `poster` fallback or `<video>` fallback on mobile. |
| Interactive Player with scrubbing | Desktop visitors can scrub through the demo, pause on specific states, replay. More engaging than a passive video loop. | Low | `@remotion/player` with `controls` prop | Remotion Player supports `controls`, `loop`, `PlayerRef` for programmatic control. Add custom-styled controls matching the brand kit (accent blue scrubber, glass-style control bar). |
| Intersection-triggered playback | Video starts playing when scrolled into view, pauses when scrolled away. Avoids wasting resources on off-screen animation. | Low | IntersectionObserver, PlayerRef | Use `IntersectionObserver` to call `playerRef.current.play()` / `.pause()`. Standard pattern, well-documented in Remotion best practices. |

## Anti-Features

Features to explicitly NOT build in v1.2.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Server-side on-demand Remotion rendering | Remotion Lambda/Cloud adds infrastructure complexity, cost, AWS dependency, and cold-start latency. Total overkill for a single demo video that never changes per-user. | Pre-render MP4 at build time with `remotion render` CLI. Use `<Player>` for interactive version on the page. |
| YouTube/Vimeo embed for demo | Third-party iframes violate zero-tracking policy. YouTube loads 500KB+ JS, sets cookies, tanks Lighthouse. Contradicts the entire privacy-first brand. | Self-hosted Remotion Player (client-side React) or self-hosted MP4 fallback. Zero external calls. |
| Full-page video background | Performance killer, distracts from existing content sections, dated aesthetic. The site already has a strong hero with canvas waveform -- a video background would compete with it. | Embed demo video in a dedicated section between existing sections (after HowItWorks or as a standalone DemoVideo section). |
| Video with audio/unmute controls | Sound on a landing page is universally unwanted. Autoplay with sound is blocked by all browsers. Adding unmute UI creates false expectation. The waveform animation IS the audio metaphor. | All video content is silent. The visual waveform animation communicates "voice" without actual audio. |
| Complex legal pages (Terms of Service, EULA) | Not required by Apple for initial TestFlight/App Store submission of a free app. Premature legal overhead. | Ship Privacy Policy only (hard Apple requirement). Defer ToS to post-launch if needed. |
| GDPR cookie consent banner | Site collects zero data, uses zero cookies, loads zero third-party scripts. A consent banner would be factually misleading and actively damage the privacy-first positioning. | State "no data collected, no cookies used" in the privacy policy. |
| Support ticket system / contact form | Over-engineering for a pre-launch app with a small user base. Apple only requires "an easy way to contact you." | Simple `mailto:` link. Upgrade to a proper support page later if volume demands it. |
| Scroll-jacking video playback | Playing video at scroll speed is trendy but janky on Safari, unpredictable at variable scroll speeds, and hurts accessibility (no keyboard control, no pause). | Standard intersection-triggered play/pause. User controls playback via Player controls or scrolling past. |
| Real device screen recording instead of Remotion | A screen recording has inconsistent frame rates, captures notification bar content, shows real user data, looks amateur on retina displays due to compression. | Programmatic Remotion composition gives pixel-perfect, brand-consistent, resolution-independent output. Worth the higher complexity. |

## Feature Dependencies

```
Privacy Policy page
  +-- i18n messages: FR + EN privacy policy content
  +-- New page: /src/app/[locale]/privacy/page.tsx
  +-- Layout reuse: existing [locale]/layout.tsx provides Nav, fonts, theme
  +-- Footer update: convert existing privacy text to Link
  +-- Sitemap update: add /privacy to sitemap.ts

Support URL
  +-- Email address decided (e.g., support@getdictus.com)
  +-- Footer update: add mailto link
  +-- Privacy Policy page: include contact info in policy text

Remotion Demo Video
  +-- Package install: remotion, @remotion/player
  +-- Remotion composition component (the "video" as React)
  |     +-- iOS frame mockup (status bar, app chrome, keyboard tray)
  |     +-- Waveform animation (port from canvas to useCurrentFrame)
  |     +-- State choreography (Sequence blocks for each state)
  |     +-- Text typing animation (word-by-word reveal)
  |     +-- Locale-aware text (inputProps.locale)
  +-- DemoVideo section component (embeds Player on landing page)
  |     +-- Responsive container (aspect-ratio based)
  |     +-- Lazy loading (next/dynamic ssr:false + IntersectionObserver)
  |     +-- ScrollReveal integration
  +-- i18n messages: section heading, description text, demo content strings
  +-- Landing page update: add DemoVideo section to page.tsx

MP4 Export (optional, deferred)
  +-- @remotion/cli as devDependency
  +-- Remotion composition complete and finalized
  +-- Build script or npm script for rendering
  +-- /public/videos/ directory for output
```

**Critical dependency chain:**
1. Privacy Policy + Support URL have NO dependencies on Remotion -- ship independently
2. Remotion composition is the critical path for the demo video -- everything else depends on it
3. The iOS frame mockup and waveform port are the two hardest sub-components of the composition
4. DemoVideo section is trivial once the composition exists
5. MP4 export is optional and only possible after composition is finalized

## Cross-Feature Interactions

| Feature A | Feature B | Interaction | Risk |
|-----------|-----------|-------------|------|
| Privacy Policy page | Existing i18n routing | New page under `[locale]` uses same routing, layout, and message loading patterns. Straightforward extension of existing architecture. | Low -- follows established pattern |
| Privacy Policy page | Sitemap/SEO | Must add `/fr/privacy` and `/en/privacy` to sitemap.ts. Add appropriate metadata (noindex is acceptable for a legal page, but indexing is fine too). | Low |
| Remotion Player | Lighthouse scores | Remotion Player bundles ~150-200KB of JS (composition + player). Must be lazy-loaded and code-split to avoid impacting LCP/TBT. | Medium -- requires careful lazy loading |
| Remotion Player | Light/dark theme | The composition renders its own internal pixels -- it does not inherit CSS theme. If the site is in light mode, the demo video still shows a dark iOS mockup (which is fine -- iOS apps often have dark keyboards). No theme interaction needed inside the composition. | Low -- intentionally decoupled |
| Remotion Player | Motion v12 (existing) | Both are animation frameworks but operate independently. Remotion handles frames inside the Player; Motion handles scroll animations outside. No conflict. | Low |
| Demo video section | Existing section ordering | New section must fit naturally in the page flow. Best placement: after HowItWorks (shows the product in action after explaining the concept) or as a standalone section before OpenSource. | Low -- design decision, not technical risk |
| Footer changes | Existing Footer layout | Adding 1-2 text links to the existing flex layout. Minimal visual change. Must maintain the existing GitHub + Telegram icon row. | Low |

## Complexity Assessment

| Feature | Estimated Effort | Complexity Driver | Risk |
|---------|-----------------|-------------------|------|
| Privacy Policy page | 0.5 day | Mostly content writing (FR + EN). Page component is a simple static page reusing existing layout. | LOW |
| Support URL | 0.5 day (bundled with privacy) | Just a mailto link in Footer + privacy page. Trivial code change. | LOW |
| Footer link updates | Included above | Minor edit to existing Footer.tsx. | LOW |
| Remotion composition (iOS mockup) | 3-4 days | Building a convincing iOS frame, message thread, keyboard tray, and waveform as React components rendered by Remotion. Requires visual design iteration and frame-by-frame timing. This is the creative/polish work. | HIGH -- visual fidelity and timing |
| Waveform port to Remotion | 1 day | Translating existing canvas + requestAnimationFrame logic to Remotion's useCurrentFrame + interpolate. The math is the same; the rendering API changes. | MEDIUM -- already solved in canvas |
| State choreography | 1 day | Mapping useHeroDemoState timing to Remotion Sequences. Mostly configuration, not new logic. | MEDIUM |
| DemoVideo section + Player embed | 0.5 day | Standard section component with lazy-loaded Player. Follows existing section patterns. | LOW |
| MP4 export script | 0.5 day | CLI command wrapped in npm script. Straightforward once composition exists. | LOW |
| Bilingual video content | Included in composition | Just passing locale as inputProps and reading translated strings. | LOW |

**Total estimated effort:** 5-7 days (compliance: ~1 day, demo video: 4-6 days)

## MVP Recommendation

**Phase 1 -- Compliance (ship first, unblocks App Store submission):**
1. Privacy Policy page at `/[locale]/privacy/` -- bilingual static content, covers all Apple 5.1.1(i) requirements
2. Support URL -- `mailto:` link in Footer and in Privacy Policy
3. Footer update -- add Privacy link, add Support link
4. Sitemap update -- include new privacy pages

**Phase 2 -- Demo Video (the differentiator):**
1. Install `remotion` + `@remotion/player`
2. Build Remotion composition: iOS frame mockup, waveform animation, 5-state choreography, text typing
3. Build DemoVideo section component with lazy-loaded Player
4. Add section to landing page after HowItWorks
5. Bilingual text via `inputProps.locale`
6. Intersection-triggered playback

**Defer:**
- **MP4 pre-render:** Nice-to-have for social sharing and App Store preview video, but not blocking for the landing page. Add after the Player version is polished.
- **App Store preview video:** Apple requires specific resolutions per device class (6.7", 6.1", etc.). Different deliverable from the website demo. Defer until actual App Store submission.
- **Custom Player controls:** Start with Remotion's default controls. Custom brand-styled controls can be iterated on later.

**Rationale:** Compliance pages are low-effort and high-urgency -- they block App Store submission. Ship them independently, even before the demo video is started. The demo video is the creative centerpiece of v1.2 but has zero external blockers (unlike v1.1's demo videos which needed recorded footage, Remotion compositions are fully programmatic). This makes v1.2's video deliverable more predictable than v1.1's.

## Remotion Integration Technical Notes

**Packages needed:**
- `remotion` -- core framework, provides `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `interpolateColors()`, `<Sequence>`, `<AbsoluteFill>`
- `@remotion/player` -- the `<Player>` component for embedding in React apps
- `@remotion/cli` -- dev dependency only, for MP4 rendering via `npx remotion render`

**Next.js App Router integration:**
- Remotion Player is client-only -- must use `"use client"` or `next/dynamic` with `ssr: false`
- Composition components are also client-only (they use hooks like `useCurrentFrame()`)
- Player `compositionWidth` / `compositionHeight` define internal resolution (use 390x844 for iPhone 14-style portrait, or 1080x1920 for full HD portrait)
- `style={{ width: '100%' }}` on Player for responsive sizing -- it scales the internal composition to fit
- Memoize `inputProps` with `useMemo()` to prevent unnecessary re-renders (Remotion best practice)
- Pass browser `event` to `.play()` / `.toggle()` to minimize autoplay restriction issues

**Composition architecture recommendation:**
```
src/
  remotion/
    DictusDemo.tsx          -- root composition
    components/
      iOSFrame.tsx          -- status bar + safe area chrome
      MessageThread.tsx     -- chat bubbles with typing animation
      DictusKeyboard.tsx    -- keyboard tray with waveform
      DemoWaveform.tsx      -- waveform bars (ported from Waveform.tsx)
    lib/
      timing.ts             -- frame ranges for each state phase
      colors.ts             -- semantic color constants
```

**Performance budget:**
- Remotion Player JS: ~150-200KB (must be lazy-loaded)
- Lazy load via `next/dynamic(() => import('./DemoVideoPlayer'), { ssr: false })`
- Defer Player mount until section is near viewport (IntersectionObserver with rootMargin)
- Target: zero impact on initial LCP, zero impact on TBT for visitors who never scroll to the demo section

## App Store Compliance Technical Notes

**Apple Guideline 5.1.1(i) -- Privacy Policy must state:**
1. What data the app collects -- "Dictus does not collect any personal data"
2. How data is collected -- "All voice processing occurs entirely on-device"
3. All uses of data -- "No data leaves your device"
4. Third-party sharing -- "We do not share data with any third parties"
5. Data retention/deletion -- "No data is stored remotely. Uninstalling the app removes all local data"
6. Revoking consent / requesting deletion -- "No remote data exists to delete. Uninstall the app to remove all local data"

**Apple Guideline 1.5 -- Support:**
- Must include "an easy way to contact you"
- `mailto:` link is sufficient
- Must be accurate and up-to-date

**Page structure for `/[locale]/privacy/`:**
- Reuse existing `[locale]/layout.tsx` (Nav, fonts, theme, i18n provider)
- Simple server component with translated content
- Minimal styling: prose-style text on brand background
- Last-updated date visible
- Contact email visible
- Link back to home page

## Sources

- Remotion Player documentation: https://www.remotion.dev/docs/player/ -- MEDIUM confidence (verified via WebFetch)
- Remotion Player examples and props: https://www.remotion.dev/docs/player/examples -- MEDIUM confidence (verified via WebFetch)
- Remotion Player best practices: https://www.remotion.dev/docs/player/best-practices -- MEDIUM confidence (verified via WebFetch)
- Remotion browser rendering: https://www.remotion.dev/docs/miscellaneous/render-in-browser -- MEDIUM confidence (verified via WebFetch)
- Apple App Store Review Guidelines (5.1.1, 1.5): https://developer.apple.com/app-store/review/guidelines/ -- HIGH confidence (verified via WebFetch, official Apple source)
- Existing codebase: Footer.tsx, useHeroDemoState.ts, Waveform.tsx, i18n/routing.ts, layout.tsx -- HIGH confidence (direct code inspection)

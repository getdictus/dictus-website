# Feature Landscape

**Domain:** Premium iOS app landing page (privacy-focused, open source, voice dictation)
**Researched:** 2026-03-09
**Overall confidence:** HIGH

## Table Stakes

Features users expect. Missing = product feels incomplete or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section with clear value prop | Users decide in 3-5 seconds whether to stay. Must communicate "offline voice dictation for iOS" instantly | Med | Headline + subline + single CTA. The sinusoidal animation from the app is a strong hero anchor. Frame as outcome ("Your voice, your device, your privacy") not spec |
| Primary CTA (TestFlight / App Store) | The entire page exists to drive downloads. No CTA = no conversion | Low | Device-detect to show TestFlight vs App Store badge. Need a "Coming Soon" state for pre-launch. Signal's pattern: single "Get Signal" button that adapts per device |
| Feature showcase section (4 pillars) | Users need to understand what the app does before downloading | Med | Privacy/offline, Smart Mode LLM, keyboard integration, open source. Icon + title + one-sentence benefit per feature. Outcomes over specs: "Works everywhere you type" not "Third-party keyboard extension" |
| Responsive design (mobile-first) | 60%+ traffic for iOS app pages comes from mobile. Broken mobile = immediate bounce | Med | Mobile-first with Tailwind breakpoints. Test on iPhone Safari since target audience is iOS users. Touch targets 44px minimum |
| Fast page load (Lighthouse 90+) | Slow pages kill conversions and SEO. Premium perception requires snappy performance | Med | Next.js static generation, self-hosted DM Sans/DM Mono (subset), minimal JS on initial load. Defer animation code with LazyMotion or dynamic imports |
| SEO fundamentals | Discoverability for "iOS dictation app", "offline voice keyboard", "clavier dictation iOS" queries | Low | Meta tags, Open Graph, SoftwareApplication JSON-LD schema, semantic HTML headings, hreflang tags for FR/EN |
| Open Graph / social sharing meta | Links shared on Telegram, Twitter, Reddit need proper previews with app branding | Low | og:image with waveform icon + wordmark on #0A1628 background. Critical for community sharing and Telegram group promotion |
| Navigation header with logo | Brand presence and wayfinding. Even single-page sites need a sticky header | Low | Waveform icon + "dictus" wordmark left, language toggle + CTA button right. Collapse to burger on mobile. Use backdrop-filter for glassmorphism header on scroll |
| Footer with credits and links | Professional credibility. Missing footer = unfinished feel | Low | PIVI Solutions credit, GitHub repo link, Telegram community link, privacy statement. DM Mono for technical labels |
| Language toggle (FR/EN) | Open source project targeting international audience. French-first but English essential | Med | next-intl with URL-based routing (/en, /fr) for SEO. Default to browser locale detection. Must be set up early as all content depends on it |
| Privacy-first messaging | The app's entire value prop is privacy. The site must embody this with zero tracking, zero cookies | Low | No analytics, no cookies, no third-party scripts. Explicit callout: "This site collects zero data, just like the app." The absence of a cookie banner IS the trust signal |
| Favicon and browser meta | Basic brand presence in browser tabs, bookmarks, PWA prompts | Low | Squircle waveform icon from brand kit. Apple touch icon, manifest.json for PWA metadata |

## Differentiators

Features that set the landing page apart. Not expected, but create a premium impression and competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Animated hero transcription demo | Show the product working: sinusoidal waveform animating while text appears word-by-word. Demonstrates the core experience without downloading. This is the single biggest "wow" moment | High | CSS/canvas animation matching the app's sine wave (not a standard waveform). Text reveal with stagger timing. Must not block LCP — lazy load animation code. Consider reduced-motion media query fallback |
| Glassmorphism card effects | Aligned with iOS 26 Liquid Glass aesthetic. Creates visual cohesion between landing page and app. Positions the brand as modern and polished | Med | backdrop-filter: blur(10-20px) with semi-transparent surfaces (10-40% opacity) on dark gradients. Use brand kit glow tokens (--glow, --glow-soft). Pure CSS, no library needed |
| State-driven micro-animation sequence | Show the five dictation states (idle, recording, transcribing, smart mode, inserted) cycling through. Teaches the product flow visually without words | High | Framer Motion or CSS keyframes cycling through brand kit state colors with pulse effects. Intersection observer trigger on scroll-into-view. 5-state loop: idle(white-30) > recording(red+pulse) > transcribing(blue+pulse) > smart(purple+pulse) > inserted(green) |
| Open source section with live GitHub stats | Not just a link — show real repo data (stars, last commit, license). Builds credibility and invites contribution. Reference: Signal emphasizes their open-source protocol prominently | Med | GitHub API call at build time via ISR. Display star count + "MIT License" badge + "View Source" CTA. Links to github.com/Pivii/dictus |
| Telegram community CTA | Direct community channel aligned with privacy ethos. More trustworthy than Discord (requires account/tracking) for a privacy-focused project | Low | Secondary CTA after features section. Frame as "Join the community" not "Subscribe". Group link with member count if available |
| Scroll-triggered section reveals | Sections fade/slide in as user scrolls. Creates narrative flow: problem > solution > features > community > download | Med | Intersection Observer + CSS transitions. Subtle: 200-300ms ease-out, 20px translate. No scroll-jacking. Respect prefers-reduced-motion |
| "How it works" step sequence | 3-step visual: 1) Tap the mic 2) Speak naturally 3) Text appears instantly. Demystifies the keyboard extension concept for non-technical users | Med | Numbered steps with semantic colors (recording red, transcribing blue, success green). Possibly animated on scroll |
| Comparison strip vs Apple Dictation | Factual side-by-side: offline vs cloud, privacy vs data sent, smart rewrite vs basic, open source vs proprietary. Shows differentiation without being aggressive | Med | Two-column checkmark grid. Keep it factual and restrained. Only appropriate once app is publicly available |
| "No data leaves your device" visual proof | A dedicated section that visually shows the data flow: voice > on-device model > text. No arrows going to a cloud. Makes the privacy claim tangible | Med | Simple diagram/illustration with brand colors. More powerful than text claims alone. Reference: Signal's "No ads. No trackers. No kidding." section |
| Dark-only design (intentional) | Bold design choice that reinforces premium dark aesthetic and eliminates dual-theme complexity. The absence of light mode IS a design statement | Low | Single dark theme using brand kit tokens. Frame as intentional in the design system. Use sufficient contrast (WCAG AA): off-white (#FFFFFF at 70% opacity) on dark backgrounds (#0A1628) |

## Anti-Features

Features to explicitly NOT build. These would harm the project's positioning or waste effort.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Email capture / newsletter signup | Directly contradicts privacy-first positioning. Collecting emails while promoting "we collect nothing" is hypocritical | Telegram group for updates. Community over mailing list. Signal does not collect emails either |
| Analytics / tracking scripts | Google Analytics, Mixpanel, Hotjar would undermine trust. The site itself should be proof of the privacy philosophy | Zero analytics is the strongest stance. If metrics are truly needed, Vercel Analytics (first-party, cookieless) is the least-bad option |
| Cookie consent banner | No cookies = no banner. The absence of a cookie banner IS a trust signal. Adding one implies you have something to consent to | Self-host Google Fonts (DM Sans, DM Mono) to avoid even font-loading cookies. Zero third-party requests |
| Light mode toggle | Doubles the design surface, dilutes the premium dark brand identity. The brand kit is dark-only by design | Commit to dark. Ensure WCAG AA contrast. Use dark grays (#0A1628) not pure black, and off-white text not pure white, per 2026 dark mode best practices |
| Pricing page / monetization section | App is free and open source. A pricing section creates confusion about the project's nature | Emphasize "Free and open source" clearly. If donations needed later, a simple "Support the project" link to GitHub Sponsors suffices |
| Blog / CMS | Scope creep. Landing page does not need content management. Adds maintenance burden and attack surface | GitHub Releases for changelogs, GitHub Discussions for community updates. Keep landing page static |
| App Store screenshots carousel | App is in TestFlight phase, not App Store. Placeholder screenshots hurt credibility more than they help | Use the animated transcription demo as the product showcase. Real interaction > static screenshots |
| Chat widget / support system (Intercom, Crisp) | Over-engineering for a single-page landing. Introduces third-party scripts and tracking | GitHub Issues for bugs, Telegram for community support. Both are transparent and public |
| Video background / autoplay video | Heavy (MB not KB), hurts LCP, mobile data concern, accessibility nightmare. Contradicts the fast/clean aesthetic | Lightweight CSS/SVG animations matching brand waveform. Canvas-based sine wave over video every time |
| Complex multi-page navigation | This is a single landing page, not a marketing site. Multiple pages fragment attention and add routing complexity | Single page with smooth scroll to anchored sections. One page, one flow, one CTA repeated |
| Social media feed embeds | Third-party scripts, tracking cookies, slow loading. Contradicts privacy positioning entirely | Static social/community links in footer. No embedded feeds, no iframes |
| Parallax scrolling effects | Often janky on mobile Safari, causes paint thrashing, hurts performance. Feels dated in 2026 | Simple fade/translate scroll reveals with Intersection Observer. Performant and modern |

## Feature Dependencies

```
Brand Kit CSS Tokens (Tailwind config) --> ALL visual features
  |
  +-- i18n Setup (next-intl) --> ALL text content (must be first)
  |
  +-- Responsive Layout System --> ALL sections (mobile-first)
  |
  +-- Navigation Header --> Language Toggle
  |                     --> Primary CTA Button
  |
  +-- Hero Section --> Animated Waveform Demo (Phase 2)
  |               --> Word-by-word Text Reveal (Phase 2)
  |
  +-- Feature Showcase --> Glassmorphism Card Effects
  |                   --> State Micro-Animations (Phase 2)
  |
  +-- Open Source Section --> GitHub API Integration (Phase 2)
  |
  +-- Community Section --> Telegram CTA
  |
  +-- Footer --> Legal Links, Credits
  |
  +-- SEO Meta --> Open Graph Images (need brand assets rendered)
  |
  +-- Animation Foundation (Framer Motion / CSS)
       --> Hero Animation
       --> Scroll Reveals
       --> State Animations
```

**Critical path:** Brand kit tokens > i18n setup > layout system > content sections > CTA integration > SEO meta

## MVP Recommendation

**Prioritize (Phase 1 — launch-ready):**
1. Brand kit CSS variables in Tailwind config (foundation for everything)
2. i18n setup with next-intl (FR/EN, URL routing, all content translatable)
3. Hero section with static waveform icon + value prop headline + CTA
4. Feature showcase: four glassmorphism cards (privacy, smart mode, keyboard, open source)
5. Open source section with GitHub link (static, no API)
6. Community section with Telegram link
7. Footer with PIVI Solutions credit, GitHub, Telegram, privacy statement
8. Responsive mobile-first layout
9. SEO meta + OG tags + JSON-LD
10. Self-hosted fonts (zero third-party requests)
11. Navigation header with logo, language toggle, CTA

**Phase 2 — polish and differentiation:**
1. Animated hero: sinusoidal waveform + word-by-word text reveal
2. Scroll-triggered section fade/slide animations
3. State micro-animation sequence (idle > recording > transcribing > smart > inserted)
4. GitHub stats integration (star count, last commit via build-time API)
5. "How it works" 3-step visual
6. "No data leaves your device" data flow diagram

**Defer (post-launch, when app is public):**
- Comparison strip vs Apple Dictation (needs careful messaging, more appropriate when app is in App Store)
- Device-detection CTA (TestFlight > App Store transition)

**Rationale:** Phase 1 gets the page live with all table stakes features. The i18n must be baked in from day one — retrofitting translations is painful. Phase 2 adds the premium "wow" that differentiates. The animated hero is the single most impactful differentiator but also the most complex — shipping without it first ensures no launch delays. Phase 2 features can be added incrementally without restructuring.

## Sources

- [Build an iOS Landing Page - 2026 Guide](https://unicornplatform.com/blog/build-an-ios-landing-page-with-no-code-in-2026/) — MEDIUM confidence
- [15 Best App Landing Page Examples 2026 - DesignRush](https://www.designrush.com/best-designs/apps/trends/app-landing-pages) — MEDIUM confidence
- [Dark Glassmorphism UI in 2026 - Medium](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f) — MEDIUM confidence
- [2026 Web Design Trends: Glassmorphism, Micro-Animations](https://www.digitalupward.com/blog/2026-web-design-trends-glassmorphism-micro-animations-ai-magic/) — MEDIUM confidence
- [Dark Mode Web Design: SEO & UX Trends 2026](https://grewdev.com/dark-mode-web-design-seo-ux-trends-for-2026/) — MEDIUM confidence
- [Best Practices for Dark Mode in Web Design 2026](https://natebal.com/best-practices-for-dark-mode/) — MEDIUM confidence
- [Signal Messenger](https://signal.org/) — HIGH confidence, direct reference for privacy-first app landing page patterns
- [Landing Page Best Practices 2026 - Lovable](https://lovable.dev/guides/landing-page-best-practices-convert) — MEDIUM confidence
- [Glassmorphism: How to Use It in 2026](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026) — MEDIUM confidence
- [App Landing Page Design Tips 2026 - Bitly](https://bitly.com/blog/best-app-landing-page-design/) — MEDIUM confidence
- [Dark Mode Design Best Practices 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/) — MEDIUM confidence
- Project requirements from .planning/PROJECT.md and CLAUDE.md brand kit — HIGH confidence

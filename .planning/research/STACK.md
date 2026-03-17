# Technology Stack — v1.2 Additions

**Project:** dictus Landing Page v1.2 (Video & Compliance)
**Researched:** 2026-03-17
**Scope:** NEW stack additions only. See v1.0/v1.1 research for base stack (Next.js 16, Tailwind v4, Motion v12, next-intl v4, next-themes, qrcode.react).

## Recommended Stack

### Remotion — Programmatic Video Creation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| remotion | ^4.0.436 | Core framework — Composition, useCurrentFrame, interpolate, spring, Sequence, Series | React-based video creation using the same component model as the existing site. Write video scenes as React components with frame-based animation. The only serious React video creation framework — no real alternatives exist in this space. | MEDIUM |
| @remotion/cli | ^4.0.436 | CLI for `remotion studio` (preview) and `remotion render` (export to mp4) | Renders compositions to mp4/webm via headless Chromium + ffmpeg. Required for the dev preview and final video export. | MEDIUM |
| @remotion/player | ^4.0.436 | Embeddable React player component | Enables interactive preview during development. NOT needed in production — the final output is a pre-rendered mp4 file served statically. Install as devDependency only if embedding a live player; otherwise the CLI preview suffices. | MEDIUM |

**Version note:** Remotion 4.x is the current major. Version 4.0.436 was the latest at time of research. Pin to `^4.0` — Remotion follows semver within the 4.x line.

**Confidence is MEDIUM** because web search was unavailable and version was confirmed via npm registry only. Core API documentation was verified via remotion.dev.

### No New Production Dependencies Needed

The compliance pages (Privacy Policy, Support URL) require zero new libraries:

| Feature | Approach | New Dependency? |
|---------|----------|-----------------|
| Privacy Policy page (`/privacy`) | Static Next.js page with existing i18n (next-intl) | NO |
| Support URL | mailto: link — no page needed, just a URL for App Store Connect | NO |
| Video embed on landing page | Native `<video>` element with pre-rendered mp4 | NO |
| Waveform animation in video | Port existing Canvas waveform logic into Remotion component | NO |
| iOS-style animations in video | Remotion `spring()` + `interpolate()` — built into core `remotion` package | NO |

## Remotion Architecture Decision: Separate Subfolder

**Decision:** Remotion lives in a `/remotion` subfolder at project root, NOT mixed into the Next.js app.

**Why separate:**
- Remotion has its own bundler (Webpack-based), entry point (`Root.tsx`), and rendering pipeline. Mixing it into the Next.js App Router creates config conflicts.
- Remotion's `remotion.config.ts` is project-root scoped and only affects CLI commands — it does not integrate with `next.config.ts`.
- The video is rendered offline to a static mp4, then placed in `/public` for the site to serve. There is no runtime dependency between Next.js and Remotion.
- Remotion requires React but does NOT need Next.js — it renders in its own headless Chromium context.
- Official Remotion docs mention Next.js App Router templates, but these are for apps that dynamically generate videos (SaaS). For a single pre-rendered demo video, a standalone subfolder is simpler and avoids all integration complexity.

**Folder structure:**
```
/remotion/
  remotion.config.ts    # Remotion CLI config
  src/
    Root.tsx            # Composition registry
    DemoVideo.tsx       # Main composition
    scenes/             # Individual scenes (Sequence components)
    components/         # Shared (waveform, phone mockup, etc.)
  package.json          # Separate deps (remotion, @remotion/cli)
```

**Workflow:**
1. `cd remotion && npx remotion studio` — preview in browser
2. `cd remotion && npx remotion render src/Root.tsx DemoVideo out/demo.mp4` — render final
3. Copy `out/demo.mp4` to `public/videos/demo.mp4`
4. Reference in Next.js via `<video src="/videos/demo.mp4">`

### Remotion Key APIs for This Project

| API | Package | Purpose in Dictus Demo |
|-----|---------|----------------------|
| `useCurrentFrame()` | remotion | Drive all frame-based animation |
| `useVideoConfig()` | remotion | Access fps, width, height, duration |
| `interpolate()` | remotion | Map frame ranges to opacity, position, scale values |
| `spring()` | remotion | iOS-feel bouncy transitions (stiffness/damping tunable) |
| `<Sequence>` | remotion | Time-shift scenes — each scene starts at frame 0 internally |
| `<Series>` | remotion | Auto-sequential scenes without manual frame math |
| `<AbsoluteFill>` | remotion | Full-frame positioning (like absolute + inset-0) |
| `<Img>` | remotion | Image loading with render-blocking (waits for load before frame capture) |

### Waveform Reuse Strategy

The existing site has a Canvas-based waveform (`BrandWaveform` pattern ported from iOS `BrandWaveform.swift`). For the Remotion video:

- **Reuse the waveform drawing logic** — extract the bar-height calculation and drawing into a shared utility
- **Render on Canvas inside Remotion** — Remotion supports `<canvas>` elements; use `useCurrentFrame()` to drive the animation phase (idle -> recording -> transcribing -> inserted)
- **Match the 3-phase choreography** from v1.1 (flat/active/calm) by mapping frame ranges to waveform states via `interpolate()`

### spring() for iOS-Native Feel

Remotion's `spring()` is physics-based (mass, stiffness, damping) — identical conceptually to iOS `UIView.animate(withSpring:)`. Configure to match iOS defaults:
- `stiffness: 100, damping: 15, mass: 1` approximates iOS default spring
- `overshootClamping: false` for natural bounce on element entrances
- Use `durationInFrames` to constrain spring to specific scene lengths

## What NOT to Add

| Temptation | Why Not |
|------------|---------|
| @remotion/player in production | The demo video is pre-rendered. Ship a static mp4, not a client-side player. Zero JS overhead. |
| @remotion/lambda | Cloud rendering is for SaaS video generation. We render once locally. |
| @remotion/tailwind | Remotion has its own Webpack config. Tailwind in Remotion adds config complexity for a single video. Use inline styles in Remotion components. |
| ffmpeg manual install | Remotion bundles its own ffmpeg. Do not install separately. |
| react-player or video.js | Native `<video>` with `controls` attribute is sufficient for a single mp4. No wrapper needed. |
| MDX or markdown renderer for privacy policy | Static JSX with i18n strings is simpler. The privacy policy is short and rarely changes. |
| Cookie consent library | Dictus collects zero data. No cookies. No consent needed. |
| Legal template generator | Privacy policy content is project-specific. Use Apple's requirements as checklist, write manually. |

## Installation

### Remotion (in `/remotion` subfolder)

```bash
# Create remotion subfolder with its own package.json
mkdir -p remotion/src/scenes remotion/src/components

cd remotion
npm init -y
npm install remotion @remotion/cli
```

### Main project — no changes needed

No new production dependencies. The pre-rendered mp4 goes in `public/videos/`.

## System Requirements for Rendering

| Requirement | Details |
|-------------|---------|
| Node.js | >=18 (already satisfied — Next.js 16 requires it) |
| Chromium | Remotion downloads its own Chromium on first run |
| ffmpeg | Bundled with @remotion/cli — no manual install |
| Disk space | ~500MB for Chromium + ffmpeg cache |
| RAM for render | ~2GB recommended for 1080p render |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Video creation | Remotion | Motion Canvas | Less mature, smaller ecosystem, no React integration |
| Video creation | Remotion | After Effects + Lottie export | Requires Adobe license, non-programmatic, can't reuse React components |
| Video creation | Remotion | FFmpeg scripting | No visual preview, painful for complex animations, no React component reuse |
| Video creation | Remotion | CSS animation recorded with screen capture | Inconsistent quality, no frame-perfect control, manual process |
| Video hosting | Static mp4 in /public | YouTube/Vimeo embed | Third-party scripts violate zero-tracking policy |
| Video hosting | Static mp4 in /public | Cloudinary video | Unnecessary for a single static asset, adds external dependency |
| Privacy page | Static Next.js page | Notion/Google Docs embed | Third-party iframe, inconsistent styling, tracking scripts |
| Privacy page | Static Next.js page | iubenda / Termly | External service, adds scripts, overkill for a no-data-collection app |

## Sources

- Remotion npm registry: https://registry.npmjs.org/remotion/latest — version 4.0.436 confirmed
- Remotion official docs (renderer): https://www.remotion.dev/docs/renderer — server-side rendering APIs
- Remotion official docs (CLI render): https://www.remotion.dev/docs/cli/render — render command options
- Remotion official docs (spring): https://www.remotion.dev/docs/spring — physics-based animation
- Remotion official docs (interpolate): https://www.remotion.dev/docs/interpolate — value mapping
- Remotion official docs (Sequence): https://www.remotion.dev/docs/sequence — scene composition
- Remotion official docs (Player): https://www.remotion.dev/docs/player — embeddable player
- Remotion official docs (fundamentals): https://www.remotion.dev/docs/the-fundamentals — core concepts
- Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/ — privacy policy and support URL requirements

# Domain Pitfalls

**Domain:** Adding Remotion demo video production and App Store compliance pages (Privacy Policy, Support URL) to an existing Next.js 16 landing page
**Researched:** 2026-03-17
**Project:** Dictus Website v1.2

## Critical Pitfalls

Mistakes that cause rewrites, major regressions, or blocked App Store submission.

### Pitfall 1: Remotion Webpack Config Conflicts with Next.js Webpack Build

**What goes wrong:** Remotion uses its own Webpack configuration internally. The Dictus project already forces Webpack over Turbopack (`next build --webpack`) due to a PNG processing bug in Next.js 16.1.6. Adding Remotion packages to the project can cause Webpack resolution conflicts -- Remotion's bundler includes Webpack itself, and bundling Webpack with Webpack fails. Remotion and the Next.js app use different Webpack configs, and overriding one does not override the other.

**Why it happens:** Remotion's `@remotion/bundler` embeds Webpack internally. When Next.js also uses Webpack for its build, the two Webpack instances can conflict on module resolution, loader configurations, and binary dependencies. The official Remotion docs explicitly state: "it's not possible to bundle Webpack with Webpack."

**Consequences:** Build failures, cryptic Webpack resolution errors, or silently broken rendering pipeline. Can block the entire v1.2 milestone if not understood upfront.

**Prevention:**
- **Do NOT use `@remotion/bundler` or `@remotion/renderer` inside Next.js API routes or the Next.js build.** These packages are for CLI/server-side video rendering outside of Next.js.
- **Separate the video production pipeline from the website build entirely.** Use Remotion CLI (`npx remotion render`) as a standalone step to produce MP4/WebM files. Then embed the pre-rendered video as a static asset on the site.
- If embedding the Remotion `<Player>` component for interactive preview, use only `@remotion/player` (which is a lightweight React component) -- not `@remotion/bundler` or `@remotion/renderer`.
- Create a dedicated `remotion/` folder at the project root with its own entry point (`index.ts`, `Root.tsx`, `Composition.tsx`). Keep Remotion composition code isolated from Next.js page code.
- Watch out for `tsconfig.json` path aliases: if you have `paths: { "remotion/*": [...] }`, it will conflict with the `remotion` npm package. Use a prefix like `@remotion-video/*` for your composition files.

**Detection:** `npm run build` fails with Webpack-related errors after adding Remotion packages. Or: `npx remotion render` fails because it picks up Next.js Webpack config.

**Phase:** Video production setup -- must be the first thing validated before any composition work.

**Confidence:** HIGH -- Remotion official docs explicitly document this limitation at remotion.dev/docs/miscellaneous/nextjs.

---

### Pitfall 2: Embedding Remotion Player Bloats Client Bundle and Breaks SSR

**What goes wrong:** Using `@remotion/player` as an interactive component in the landing page adds significant client-side JavaScript. The Player requires `"use client"` and cannot be server-rendered. If imported at the page level rather than lazily loaded, it inflates the initial bundle and potentially drops Lighthouse Performance from the current 97-98 below the 90 threshold.

**Why it happens:** Remotion Player is a React component that manages a timeline, frame rendering, and playback controls entirely on the client. It has no SSR path. Importing it eagerly pulls in the entire Remotion runtime.

**Consequences:** Lighthouse Performance regression (violating the 90+ constraint). Slower TTI on mobile. Potential hydration issues if not properly wrapped in `"use client"` boundary.

**Prevention:**
- **Preferred approach: Do NOT embed the Player.** Render the video to MP4 with Remotion CLI, then use a standard `<video>` tag on the site. This adds zero JavaScript overhead and keeps the existing performance profile. The video is the deliverable, not the interactive player.
- If an interactive Player is truly needed (e.g., for a future "customize your demo" feature), use `next/dynamic` with `ssr: false` and wrap the import with the Player's `lazyComponent` prop + `useCallback` to defer loading.
- Memoize `inputProps` with `useMemo()` to prevent unnecessary re-renders.
- Keep Player state (current time, play/pause) in a sibling component, not a parent -- the Player re-renders on every state change otherwise.
- Isolate the Player in a leaf `"use client"` component. Do not let the client boundary propagate up to the page layout.

**Detection:** Run `npx next build` and check the route bundle sizes in the build output. Any route over 150kb JS is suspicious. Run Lighthouse before and after adding the Player.

**Phase:** Video integration phase. Decision point: Player vs static video must be made before implementation begins.

**Confidence:** HIGH -- Remotion Player best practices docs confirm re-render and performance concerns. Standard Next.js bundle size principles apply.

---

### Pitfall 3: Privacy Policy Missing Required Content Causes App Store Rejection

**What goes wrong:** The privacy policy page is created as a simple "we collect no data" statement. Apple rejects the app submission because the policy does not include all required sections per Guideline 5.1.1(i), even for apps that collect zero data.

**Why it happens:** Developers building privacy-first apps assume that "we don't collect data" is sufficient. Apple's guidelines require specific structural elements regardless of whether data is collected.

**Consequences:** App Store rejection. Rejection loop if the issue is not understood -- resubmitting the same policy with minor tweaks without addressing the structural requirements.

**Prevention:**
The privacy policy at `/privacy` must include ALL of the following sections, even for a zero-data-collection app:

1. **What data is collected** -- Explicitly state: "Dictus does not collect, store, or transmit any personal data. All voice processing occurs entirely on your device."
2. **How data is collected** -- State the mechanism: "No data collection mechanism exists. No network requests are made during voice transcription."
3. **Uses of data** -- "Not applicable. No data is collected."
4. **Third-party sharing** -- "Dictus does not share any data with third parties. No analytics SDKs, advertising networks, or third-party services are integrated."
5. **Data retention and deletion** -- "No user data is retained. Transcription results exist only in the app where you paste them."
6. **User rights** -- "As no data is collected, there is no data to access, modify, or delete. Users in the EU, California, and other jurisdictions retain all rights under applicable data protection laws."
7. **Contact information** -- Valid email or support URL for privacy inquiries.
8. **Effective date and updates** -- "Effective: [date]. Changes will be posted on this page."
9. **Children's privacy** -- Statement about COPPA compliance if applicable.

Additional requirements:
- The policy must be accessible at a **publicly reachable URL** (not behind auth or paywall).
- The URL must be entered in App Store Connect metadata.
- The policy must also be accessible **from within the app itself**.
- Apple began actively scanning privacy labels against actual behavior in 2024 -- claims must match reality.

**Detection:** Before submission, verify: (1) the URL loads without auth, (2) all 8+ sections are present, (3) the language matches actual app behavior. Use Apple's App Review Guidelines checklist.

**Phase:** Compliance pages -- can be implemented early and independently. Should be reviewed before App Store submission.

**Confidence:** HIGH -- Apple App Store Review Guidelines 5.1.1(i) explicitly lists these requirements. 12% rejection rate for privacy violations in Q1 2025.

---

### Pitfall 4: Support URL Does Not Meet App Store Requirements

**What goes wrong:** A `mailto:` link is provided as the support URL in App Store Connect, but Apple rejects because the support URL must be a web page, not just an email address. Or: the support page exists but has no actual contact mechanism visible to reviewers.

**Why it happens:** App Store Connect has a "Support URL" field that expects a web URL. Guideline 1.5 requires "an easy way to contact the developer" with "valid contact information." A bare mailto: in the URL field may not be accepted. Even if accepted, reviewers test the URL in a browser and expect to see a functional page.

**Consequences:** App Store rejection or review delay. Minor issue but creates a loop if not anticipated.

**Prevention:**
- Create a dedicated support section or page on the website (can be as simple as a section on `/privacy` or a dedicated `/support` route).
- Include at minimum: email address, expected response time, and optionally a link to GitHub Issues and Telegram community.
- The URL entered in App Store Connect must be an HTTPS web page that loads in Safari. A mailto: link alone is insufficient for the URL field.
- Test the URL in Safari (not just Chrome) before submission -- reviewers use Safari.

**Detection:** Open the support URL in Safari. If it does not display a web page with visible contact information, it will likely fail review.

**Phase:** Compliance pages -- implement alongside privacy policy.

**Confidence:** MEDIUM -- Apple's guidelines state "Support URL must include valid contact information." Whether a pure mailto: is accepted varies by reviewer, but a web page is always safe.

---

### Pitfall 5: Lighthouse Score Regression from Video Embed

**What goes wrong:** Adding the rendered demo video to the landing page tanks Lighthouse Performance from 97-98 to 60-70. The video poster becomes the LCP element, video preloading consumes bandwidth, and CLS occurs from unreserved video dimensions.

**Why it happens:** Video `<poster>` images are LCP candidates per web vitals specification. Without `preload="none"`, browsers fetch video metadata (and sometimes the full file) on page load. This was already identified in the v1.1 PITFALLS.md (#5) but is now the primary concern since video is the core v1.2 deliverable.

**Consequences:** Loss of Lighthouse 90+ scores. Slow mobile experience on the iOS app's target audience.

**Prevention:**
- Set `preload="none"` on the video element. Load only when user scrolls to the video section or interacts.
- Provide explicit `width` and `height` or CSS `aspect-ratio` to prevent CLS.
- Optimize poster image: WebP, < 50kb, correct aspect ratio.
- Place video below the fold -- NOT in the hero section.
- Compress video aggressively: target 1-3MB for MP4. Provide dual sources: H.264/MP4 (iOS Safari) + WebM/VP9 (Chromium, smaller file).
- Use `IntersectionObserver` for lazy loading the video source.
- Include `playsinline` (required for inline playback on iOS Safari).
- Include `muted` if auto-playing (iOS requires muted for autoplay).
- Respect `prefers-reduced-motion`: disable autoplay, show static poster instead.

**Detection:** Run Lighthouse before and after adding the video. Track LCP, TBT, Speed Index. Any regression > 5 points needs investigation.

**Phase:** Video integration on the site -- after Remotion render is complete.

**Confidence:** HIGH -- LCP specification explicitly includes video poster images. Current scores documented at 97-98.

---

### Pitfall 6: Remotion Composition Does Not Match iOS App Visual Fidelity

**What goes wrong:** The Remotion video aims for "iOS-native feel" but the rendered output looks like a web mockup, not an actual iOS screen recording. Pixel-perfect iOS UI details (status bar, keyboard appearance, safe area insets, SF Pro font rendering, system animations) are extremely difficult to replicate in React/HTML/CSS.

**Why it happens:** iOS uses SF Pro (not available on the web), system-level blur effects, hardware-accelerated animations, and sub-pixel rendering that cannot be exactly reproduced in a Remotion composition. The gap between "looks close" and "looks native" is large and time-consuming to close.

**Consequences:** The demo video feels fake, undermining the premium brand positioning. Visitors who use iPhones daily will immediately notice the uncanny valley effect.

**Prevention:**
- **Define the visual scope explicitly before starting:** Decide whether this is a "stylized product demo" (abstract, motion-graphics style) or a "realistic screen recording simulation" (pixel-accurate iOS chrome). The former is achievable; the latter is a rabbit hole.
- Use iOS-accurate elements only where they matter most: the keyboard area with the waveform, the text output. Abstract or blur the surrounding iOS chrome.
- Use the existing brand waveform animation (from `Waveform.tsx`) as the centerpiece -- this is already visually accurate to the iOS app since it was ported from `BrandWaveform.swift`.
- Consider recording actual iOS Simulator footage for the UI chrome and compositing the animated waveform on top in Remotion.
- Set a time box: if pixel-perfect iOS fidelity takes more than 2 days of iteration, switch to the stylized approach.

**Detection:** Show the rendered video to someone who uses an iPhone daily. If they say "that's not a real iPhone," the fidelity needs work.

**Phase:** Remotion composition design -- before the rendering pipeline.

**Confidence:** MEDIUM -- based on the practical difficulty of replicating native iOS UI in web technologies. No specific source, but consistent with iOS development experience.

## Moderate Pitfalls

### Pitfall 7: i18n Routing Not Applied to New Pages

**What goes wrong:** The privacy policy page is created at `/privacy` but the site uses next-intl v4 with `[locale]` route segments. The page should be at `/fr/privacy` and `/en/privacy` with translated content. Creating a plain `/privacy` route breaks the i18n routing pattern and may produce 404s or missing translations.

**Why it happens:** The existing pages live under `src/app/[locale]/`. New pages must follow the same pattern. Developers unfamiliar with the existing routing structure create pages at the root level.

**Prevention:**
- Create the privacy page at `src/app/[locale]/privacy/page.tsx` to match the existing i18n pattern.
- Add translation keys for all privacy policy content in both FR and EN message files.
- The privacy policy content differs by language -- French requires specific CNIL/GDPR language, English needs different legal phrasing. Do not just machine-translate.
- Update `sitemap.ts` to include the new `/privacy` route with hreflang alternates.
- Ensure the URL submitted to App Store Connect works for both locales (use the default locale URL or a locale-neutral redirect).

**Detection:** Navigate to `/fr/privacy` and `/en/privacy`. Both should load with correct translations. Check `sitemap.xml` for the new route.

**Phase:** Compliance pages.

**Confidence:** HIGH -- verified from the existing `src/app/[locale]/` structure.

---

### Pitfall 8: Video Files Bloating Git Repository

**What goes wrong:** Rendered MP4/WebM files (5-50MB each) are committed to the Git repository, permanently inflating clone sizes and slowing CI/CD on Vercel. The current repo is lean (~2,770 LOC across ~50 files).

**Why it happens:** The natural impulse is to put rendered videos in `/public/videos/` and commit them. Git stores binary blobs forever -- even after deletion from HEAD, they remain in history.

**Prevention:**
- **Option A (recommended for simplicity):** Keep videos in `/public/videos/` but only if total size < 5MB. Compress aggressively. Remotion can render at lower resolution/bitrate for web use.
- **Option B (recommended for quality):** Host on Vercel Blob Storage or an external CDN. Reference by URL. Add a build step or script to fetch/verify video assets.
- **Option C (if Option A size limit is exceeded):** Use Git LFS for video files. Configure `.gitattributes` with `*.mp4 filter=lfs diff=lfs merge=lfs -text`.
- Decide the hosting strategy BEFORE rendering videos. Do not render at full quality and then try to fit into Git.
- Add `*.mp4` and `*.webm` to `.gitignore` if using external hosting.

**Detection:** `git ls-files --others --exclude-standard | xargs du -sh` after adding videos. If total > 5MB, reconsider strategy.

**Phase:** Video production setup -- decide before rendering.

**Confidence:** HIGH -- standard Git best practice.

---

### Pitfall 9: iOS Safari Video Playback Quirks

**What goes wrong:** The demo video does not play inline on iOS Safari -- instead it opens in fullscreen. Or autoplay does not work. Or the video shows a black frame before the poster loads.

**Why it happens:** iOS Safari has unique video playback rules: `playsinline` attribute is required for inline playback, `muted` is required for autoplay, and video elements need specific handling for poster image display.

**Prevention:**
```html
<video
  playsinline
  muted
  preload="none"
  poster="/videos/demo-poster.webp"
  width="390"
  height="844"
>
  <source src="/videos/demo.webm" type="video/webm" />
  <source src="/videos/demo.mp4" type="video/mp4" />
</video>
```
- `playsinline` is mandatory for inline playback on iOS.
- `muted` is mandatory for autoplay on iOS.
- MP4/H.264 must be the fallback source -- WebM/VP9 is not supported on iOS Safari.
- Test on a real iPhone, not Chrome DevTools device emulation. Safari on macOS is closer but not identical.

**Detection:** Open the page on an iPhone. Tap play. Does it play inline? Does autoplay work if enabled?

**Phase:** Video integration on the site.

**Confidence:** HIGH -- well-documented iOS Safari behavior.

---

### Pitfall 10: Remotion tsconfig Path Alias Collision

**What goes wrong:** The Remotion documentation warns that `tsconfig.json` path aliases can resolve imports `from "remotion"` (the npm package) to the local `remotion/` folder instead. This causes cryptic "module not found" or "X is not a function" errors.

**Why it happens:** If `tsconfig.json` has `"paths": { "*": ["./src/*"] }` or similar wildcard paths, TypeScript resolves `import { useCurrentFrame } from "remotion"` to the local `./remotion/` directory instead of `node_modules/remotion`.

**Prevention:**
- Name the local Remotion composition folder something other than `remotion/` -- use `video/` or `remotion-video/`.
- Or ensure `tsconfig.json` paths do not have wildcard patterns that match the `remotion` package name.
- Verify with `tsc --traceResolution` if you encounter mysterious import failures.

**Detection:** `npx remotion studio` or `npx remotion render` fails with "cannot find module" errors for Remotion APIs.

**Phase:** Video production setup.

**Confidence:** HIGH -- Remotion official docs explicitly warn about this at remotion.dev/docs/brownfield.

---

### Pitfall 11: Privacy Policy Page Not Crawlable or Accessible Without JavaScript

**What goes wrong:** The privacy policy page is built as a client-rendered component (e.g., heavy use of `"use client"` or dynamic imports). Apple reviewers or crawlers that disable JavaScript see a blank page, causing the privacy URL to fail validation.

**Why it happens:** Over-reliance on client-side rendering for what is essentially a static content page.

**Prevention:**
- The privacy policy page should be a **Server Component** with zero client-side JavaScript. It is static text content -- there is no reason for it to be interactive.
- Use Next.js static generation (default for Server Components in App Router) so the page is pre-rendered at build time.
- Do not wrap legal text in client components, animation wrappers, or lazy-loaded containers.
- Verify by viewing the page with JavaScript disabled (`chrome://settings/content/javascript`). All content should be visible.

**Detection:** `curl https://getdictus.com/en/privacy` should return full HTML with all policy content in the response body.

**Phase:** Compliance pages.

**Confidence:** HIGH -- standard SSR/static rendering principle.

## Minor Pitfalls

### Pitfall 12: Remotion Render Requires FFmpeg and Headless Chromium

**What goes wrong:** Running `npx remotion render` on a dev machine works, but fails in CI or on a teammate's machine because FFmpeg or Chromium are not installed. The render step is not documented as having system-level dependencies.

**Why it happens:** Remotion's renderer uses Puppeteer (headless Chromium) to render frames and FFmpeg to encode them into video. These are system-level dependencies, not npm packages.

**Prevention:**
- Document the system requirements: Node.js, FFmpeg, and Chromium.
- For local development: `brew install ffmpeg` on macOS. Remotion auto-downloads Chromium on first run.
- For CI: this is only needed if you automate video rendering in CI. For v1.2, rendering locally and committing/uploading the result is simpler.
- Do NOT attempt to run Remotion rendering in Vercel serverless functions -- they have execution time limits, no FFmpeg, and no headless browser.

**Detection:** `npx remotion render` fails with "FFmpeg not found" or "Chrome/Chromium not found."

**Phase:** Video production setup.

**Confidence:** HIGH -- Remotion docs list these as requirements.

---

### Pitfall 13: Privacy Policy Legal Language Inadequate for Target Markets

**What goes wrong:** The privacy policy is written in casual developer language ("we don't collect your data, promise") rather than legally adequate phrasing. For EU users (GDPR) and California users (CCPA), specific legal terminology and disclosures are expected.

**Why it happens:** Developers write privacy policies as technical documents rather than legal ones.

**Prevention:**
- For GDPR compliance: identify the data controller (PIVI Solutions), state the legal basis for processing (legitimate interest or consent), mention the right to lodge a complaint with a supervisory authority.
- For CCPA: state that no personal information is sold, and provide a way for California residents to make data requests (even if the answer is "we have no data").
- For a zero-data app like Dictus, the policy is simpler than most, but the required sections still need to exist.
- Consider using a privacy policy generator as a starting template, then customize for the actual zero-data scenario.
- Have the policy reviewed by someone familiar with GDPR/CCPA if targeting EU/US markets.
- Provide the policy in both French and English -- French version should reference CNIL and RGPD (French GDPR terminology).

**Detection:** Review against Apple's checklist and GDPR Article 13/14 required disclosures.

**Phase:** Compliance pages.

**Confidence:** MEDIUM -- legal requirements depend on target markets and business entity location. The general pattern is well-documented but specifics vary.

---

### Pitfall 14: Waveform Animation in Remotion Does Not Match Website Waveform

**What goes wrong:** The waveform animation in the Remotion video looks different from the website's canvas waveform, creating visual inconsistency between the landing page hero and the demo video.

**Why it happens:** The website waveform uses HTML5 Canvas with `requestAnimationFrame` and specific energy functions from `Waveform.tsx`. Remotion uses React components with `useCurrentFrame()` for animation. Reimplementing the same animation in a different paradigm produces subtle differences in timing, bar heights, and color blending.

**Prevention:**
- Extract the waveform rendering logic into a shared utility that both the website Canvas and the Remotion composition can use. The math (bar heights, energy functions, color resolution) should be identical.
- In Remotion, use `useCurrentFrame()` and `fps` to derive the same time value that `requestAnimationFrame` provides on the website. Map frame number to elapsed milliseconds.
- Match the exact constants: bar count, bar width, gap, corner radius, amplitude multipliers.
- Render a side-by-side comparison: screenshot of the website waveform at a specific state vs the same moment in the Remotion composition.

**Detection:** Visual comparison of website waveform and Remotion waveform at equivalent moments.

**Phase:** Remotion composition development.

**Confidence:** MEDIUM -- based on the code architecture of `Waveform.tsx` and how Remotion's frame-based animation differs from requestAnimationFrame.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Remotion Setup | Webpack conflict (#1), tsconfig alias (#10), FFmpeg deps (#12) | Keep Remotion rendering completely separate from Next.js build. Use CLI rendering, not API routes. Name local folder `video/` not `remotion/`. |
| Remotion Composition | iOS fidelity (#6), waveform mismatch (#14) | Define visual scope upfront (stylized vs realistic). Share waveform math between website and composition. Time-box pixel-perfect iOS chrome at 2 days. |
| Video Integration | Bundle bloat (#2), Lighthouse regression (#5), iOS playback (#9), Git bloat (#8) | Pre-render to MP4, embed with `<video>` tag (no Player component). preload="none" + IntersectionObserver. playsinline + muted. Decide hosting strategy first. |
| Privacy Policy | Missing required sections (#3), not crawlable (#11), legal language (#13), i18n routing (#7) | Include all 8+ Apple-required sections even for zero-data app. Build as Server Component. Translate properly for FR/EN. Reference GDPR/CNIL in French version. |
| Support URL | Insufficient contact info (#4) | Create a web page (not just mailto:). Include email, response time, GitHub Issues link. Test in Safari. |

## Implementation Order Rationale (Based on Pitfall Dependencies)

1. **Remotion setup and composition first** -- The video production pipeline is completely independent of the website. Setting up the `video/` folder, validating FFmpeg/Chromium deps, and building the composition can happen without touching any existing site code. Pitfalls #1, #10, #12 are resolved here.

2. **Privacy policy and support pages second** -- These are static content pages with no dependencies on video. They follow the existing i18n pattern. Can be built, reviewed, and deployed while video rendering is in progress. Pitfalls #3, #4, #7, #11, #13 are resolved here.

3. **Video rendering third** -- Once the composition is finalized, render to MP4/WebM. Compress and decide on hosting. Pitfall #8 resolved here.

4. **Video integration on site last** -- Embed the pre-rendered video on the landing page. This is the only step that touches existing site code and risks Lighthouse regression. Pitfalls #2, #5, #9 are resolved here. Must run Lighthouse before and after.

## Sources

- [Using @remotion/renderer in Next.js -- Remotion Docs](https://www.remotion.dev/docs/miscellaneous/nextjs) -- Webpack bundling limitations, API route constraints
- [Installing Remotion in an existing project -- Remotion Docs](https://www.remotion.dev/docs/brownfield) -- tsconfig path alias warning, folder structure
- [Code sharing / Player integration -- Remotion Docs](https://www.remotion.dev/docs/player/integration) -- Component vs registry import mistake, Webpack override requirement
- [Player best practices -- Remotion Docs](https://www.remotion.dev/docs/player/best-practices) -- Memoization, re-render prevention, event handling
- [Player examples: lazyComponent -- Remotion Docs](https://www.remotion.dev/docs/player/examples) -- Dynamic import pattern with useCallback
- [App Review Guidelines -- Apple Developer](https://developer.apple.com/app-store/review/guidelines/) -- Guidelines 1.5 (Support URL), 5.1.1(i) (Privacy Policy requirements)
- [User Privacy and Data Use -- Apple Developer](https://developer.apple.com/app-store/user-privacy-and-data-use/) -- Privacy label requirements
- [App Store Privacy Policy Requirements 2025 -- iOS Submission Guide](https://iossubmissionguide.com/app-store-privacy-policy-requirements) -- Required sections checklist
- [App Store Review Guidelines 2026 -- The App Launchpad](https://theapplaunchpad.com/blog/app-store-review-guidelines) -- 2026 privacy rule tightening, rejection rates
- [Custom Webpack config -- Remotion Docs](https://www.remotion.dev/docs/webpack) -- Separate Webpack config management

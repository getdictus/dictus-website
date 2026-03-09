# Domain Pitfalls

**Domain:** Animated dark glassmorphism Next.js landing page with i18n (dictus)
**Researched:** 2026-03-09

## Critical Pitfalls

Mistakes that cause rewrites, failed Lighthouse targets, or accessibility violations.

### Pitfall 1: `backdrop-filter: blur()` Destroys Mobile Performance

**What goes wrong:** Glassmorphism relies on `backdrop-filter: blur()` which is extremely GPU-intensive. Each blurred element requires the browser to sample surrounding pixels per frame. Stacking multiple glassmorphic cards (features section, hero overlay, navbar) compounds the cost exponentially. On mid-range iPhones and older Safari, this causes visible jank during scroll, dropped frames, and battery drain. Firefox historically had bugs with `backdrop-filter` causing lag with many rendered elements.

**Why it happens:** Designers test on high-end devices with hardware acceleration. The blur radius directly correlates with GPU workload -- a `blur(20px)` is drastically more expensive than `blur(8px)`. When combined with scroll-triggered animations (sinusoidal waveform, word-by-word text reveal), the compositing budget overflows.

**Consequences:** Lighthouse Performance drops below 90 on mobile. Users on iPhone SE / iPhone 12 experience stuttering. TBT (Total Blocking Time) spikes during scroll. Battery drain discourages engagement.

**Prevention:**
- Keep blur radius under 12px (8px is the sweet spot for glassmorphism without GPU strain)
- Limit `backdrop-filter` to maximum 3 visible elements at any time
- Use `will-change: backdrop-filter` on glassmorphic elements to force GPU layer creation ahead of time
- Test on a throttled device (Chrome DevTools, 4x CPU slowdown) throughout development
- Consider a static semi-transparent background (`rgba()` with no blur) as fallback for `prefers-reduced-transparency` users

**Detection:** Run Lighthouse on mobile emulation with CPU throttling. Check "Avoid non-composited animations" audit. Profile with Chrome DevTools Performance tab -- look for long "Paint" and "Composite Layers" tasks.

**Phase:** Must be addressed in the initial design/component phase. Retrofitting blur optimizations after building all sections is painful.

---

### Pitfall 2: Animation Library Bloats Bundle and Kills LCP

**What goes wrong:** Importing Framer Motion's `motion` component naively adds ~25kb to the client bundle. For a landing page targeting Lighthouse 90+, this is a significant chunk of the JS budget. Combined with the `"use client"` boundary requirement (Motion uses browser APIs), it prevents the animated sections from benefiting from SSR, increasing LCP.

**Why it happens:** The default `motion` import includes all animation features (layout animations, gestures, drag, SVG path). A landing page typically uses only `animate`, `transition`, and `whileInView` -- a fraction of the full bundle.

**Consequences:** LCP regresses 200-500ms on mobile. First Load JS exceeds the "good" threshold. Lighthouse Performance score drops 5-15 points from JS payload alone.

**Prevention:**
- Use `LazyMotion` with `domAnimation` features and the `m` component instead of `motion` -- reduces bundle from ~25kb to ~5kb
- Code-split animation features: `const loadFeatures = () => import("framer-motion").then(res => res.domAnimation)`
- For simple animations (fade in, slide up), prefer CSS animations/transitions over JS animation libraries entirely -- zero bundle cost
- The sinusoidal waveform animation in the hero should use CSS `@keyframes` or `<canvas>` rather than Motion components
- Reserve Framer Motion for scroll-triggered orchestrated sequences where CSS alone is insufficient

**Detection:** Run `next build` and check the "First Load JS" column. Any route above 100kb total is a red flag. Use `@next/bundle-analyzer` to identify animation library contribution.

**Phase:** Architecture decision needed before building any components. Choosing CSS-first vs JS animation library shapes the entire component structure.

---

### Pitfall 3: DM Sans Font Loading Causes Layout Shift (CLS)

**What goes wrong:** DM Sans uses 6 weights (200, 300, 400, 500, 600) plus DM Mono (300, 400) -- that is 8 font files. If loaded via Google Fonts CDN (`<link>` or `@import`), this causes FOUT (flash of unstyled text) where the system fallback font renders first, then swaps to DM Sans with different metrics, triggering CLS. The ultra-light weight 200 (used for the "dictus" wordmark with tight letter-spacing) is especially prone to visible reflow because thin fonts have very different metrics from system fallbacks.

**Why it happens:** External font loading is render-blocking or swap-causing by nature. The `letter-spacing: -0.03em` on the wordmark amplifies the shift because fallback fonts with different character widths produce visible jumps. Additionally, `next/font/google` font data can become outdated -- DM Sans has been reported as having stale data in the Next.js font module.

**Consequences:** CLS exceeds 0.1 threshold (Lighthouse "poor"). The "dictus" wordmark visibly jumps on load. Lighthouse CLS penalty drops Performance score below 90.

**Prevention:**
- Use `next/font/google` with `DM_Sans` and `DM_Mono` -- this self-hosts fonts and calculates `size-adjust` for fallbacks automatically
- Subset to `latin` only (sufficient for FR/EN) to reduce file size
- Load only the weights actually used: DM Sans 200, 300, 400 and DM Mono 400. Drop 500 and 600 unless actually referenced in components
- Use `display: 'swap'` (default in next/font) but verify the size-adjust produces minimal CLS
- If DM Sans data is stale in `next/font`, download the font files manually and use `next/font/local` instead -- this is the most reliable path
- Set explicit `font-size` and `line-height` on the wordmark container to reserve space

**Detection:** Lighthouse CLS audit. Also: slow 3G throttle in DevTools and visually watch for text reflow on page load. The wordmark "dictus" should not visibly shift.

**Phase:** Must be configured in the initial project setup (layout.tsx). Font strategy is foundational -- every component depends on it.

---

### Pitfall 4: i18n Routing Breaks SEO Without Proper hreflang and Metadata

**What goes wrong:** Next.js App Router removed built-in i18n routing. Using `next-intl` with middleware, developers often forget to: (1) add `hreflang` alternate links in metadata, (2) generate a multilingual sitemap with alternates, (3) set the `<html lang>` attribute dynamically, (4) include `x-default` in hreflang. Google then indexes only one language version, or worse, treats FR and EN pages as duplicate content.

**Why it happens:** `next-intl` middleware generates `Link` response headers with hreflang automatically, but these are HTTP headers -- not `<link>` tags in the HTML `<head>`. Many developers assume the middleware handles everything and skip the metadata configuration. Additionally, Next.js does not natively support hreflang in `sitemap.xml` -- you must write a custom route handler.

**Consequences:** Google indexes only FR or only EN. French users land on English pages (or vice versa). Duplicate content penalties. The site effectively has no multilingual SEO despite supporting two languages.

**Prevention:**
- In `generateMetadata`, explicitly set `alternates.languages` with URLs for each locale
- Set `<html lang={locale}>` in the root layout dynamically from the route parameter
- Build a custom `sitemap.ts` route handler that outputs all pages with `<xhtml:link rel="alternate" hreflang="x">` entries for both FR and EN plus `x-default`
- Always include `x-default` pointing to the default locale (FR, since it is the primary language)
- Use URL-based routing (`/fr/...`, `/en/...`), not cookie-based locale detection -- cookie-based breaks alternate links
- Validate with Google Search Console's URL Inspection tool after deployment

**Detection:** After deployment, use `hreflang.org` validator or Google Search Console. Pre-deployment: inspect the rendered HTML `<head>` for `<link rel="alternate">` tags and verify the sitemap XML output.

**Phase:** Must be designed in the i18n setup phase. Retrofitting hreflang after building all pages means touching every `generateMetadata` call.

---

### Pitfall 5: Glassmorphism Text Fails WCAG Contrast on Dark Backgrounds

**What goes wrong:** The brand kit uses `rgba(255,255,255,0.70)` for body text and `rgba(255,255,255,0.40)` for secondary labels on dark backgrounds (#0A1628, #0B0F1A). When placed on glassmorphic cards with `backdrop-filter` and semi-transparent backgrounds, the actual rendered contrast depends on what is behind the card. Text over a blurred dark area might pass WCAG, but text over a blurred lighter element (another card, a glow effect, an animation) can fail the 4.5:1 minimum contrast ratio.

**Why it happens:** Glassmorphism is inherently variable-contrast -- the blur merges background colors unpredictably. The `rgba(255,255,255,0.40)` secondary text is already borderline on a pure dark background (contrast ratio ~3.2:1 against #0A1628), and fails outright on lighter blurred surfaces. Designers verify contrast against a static background, not against the actual composited result with blur.

**Consequences:** WCAG AA failure. Lighthouse Accessibility score drops below 90. Text becomes genuinely unreadable for low-vision users. Legal accessibility risk in some jurisdictions.

**Prevention:**
- Never use `rgba(255,255,255,0.40)` for text that conveys information -- minimum `rgba(255,255,255,0.60)` for secondary text
- Add a solid or near-solid background layer behind text within glassmorphic cards: `background: rgba(10, 22, 40, 0.85)` under the blur layer
- Test contrast with the Lighthouse Accessibility audit and axe DevTools -- they measure the rendered contrast, not the design spec
- For the "dictus" wordmark (DM Sans 200, ultra-light), ensure it sits on a predictable solid dark background, never on a glassmorphic surface -- thin fonts need higher contrast
- Implement `prefers-reduced-transparency` media query: when active, replace glassmorphic backgrounds with solid `Surface` (#161C2C) color

**Detection:** Lighthouse Accessibility audit > "Background and foreground colors do not have a sufficient contrast ratio." Also: manually toggle `prefers-reduced-transparency` in DevTools and verify the site is still readable.

**Phase:** Must be enforced during component design. Each glassmorphic card component should have contrast validation built into the design review process.

---

## Moderate Pitfalls

### Pitfall 6: Sinusoidal Waveform Animation Causes CLS in Hero

**What goes wrong:** The hero section features a sinusoidal waveform animation with text appearing word-by-word. If the animation container does not have a fixed height, the word-by-word reveal shifts content below it as each word appears. Similarly, if the waveform SVG/canvas element loads after initial paint, it pushes content down.

**Prevention:**
- Reserve exact dimensions for the waveform container with CSS (`min-height`, `aspect-ratio`)
- Use `position: absolute` or `position: fixed` for the waveform so it does not participate in document flow
- For the word-by-word text, pre-render the full text invisibly (`visibility: hidden`) to reserve space, then reveal words with `opacity` transitions (not `display: none` to `display: block`)
- Alternatively, use a fixed-height container for the text area sized to fit the longest translation (EN/FR)

**Detection:** Lighthouse CLS audit. Record a slow-motion page load and watch for content jumping below the hero.

**Phase:** Hero component build phase. Must be designed with CLS prevention from the start.

---

### Pitfall 7: `"use client"` Boundary Creep Defeats SSR Benefits

**What goes wrong:** Framer Motion and any interactive animation requires `"use client"`. Developers place `"use client"` at the page or section level, which forces the entire component tree below that boundary to be client-rendered. For a landing page, this means the hero, features, and CTA sections all ship as client JS -- defeating Next.js SSR and inflating Time to Interactive.

**Prevention:**
- Push `"use client"` boundaries as deep as possible in the component tree
- Create thin animation wrapper components (`<FadeIn>`, `<SlideUp>`) that are `"use client"` and wrap server-rendered content
- The content itself (headings, paragraphs, feature descriptions) should remain Server Components
- Structure: `ServerSection > ClientAnimationWrapper > ServerContent`
- Never put `"use client"` on layout.tsx or page.tsx

**Detection:** Check `next build` output for "First Load JS" per route. Compare with and without animation wrappers. If removing animations dramatically reduces JS, the boundary is too high.

**Phase:** Architecture decision. Must be established as a pattern before building any section components.

---

### Pitfall 8: Missing `prefers-reduced-motion` Breaks Accessibility

**What goes wrong:** The site has heavy animations (sinusoidal waveform, word-by-word text reveal, glassmorphic transitions, scroll-triggered fade-ins). Users with vestibular disorders who enable "Reduce motion" in their OS settings expect these animations to stop. Ignoring `prefers-reduced-motion` is a WCAG 2.1 Level AAA failure and causes real physical discomfort (nausea, dizziness) for affected users.

**Prevention:**
- Implement a global CSS rule: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`
- For Framer Motion, check the `useReducedMotion()` hook and conditionally disable or simplify animations
- The sinusoidal waveform should display as a static image/SVG when reduced motion is active
- Word-by-word text reveal should show the complete text immediately
- Also implement `prefers-reduced-transparency`: replace blur/glass effects with solid backgrounds

**Detection:** Toggle "Reduce motion" in macOS System Settings > Accessibility > Display, or in Chrome DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion`. Verify all animations stop.

**Phase:** Must be implemented alongside each animation component, not as an afterthought. Build the reduced-motion variant first, then add animations on top.

---

### Pitfall 9: Responsive Animations Break on Mobile Viewports

**What goes wrong:** Animations designed for desktop (wide sinusoidal waveform, horizontal word reveal, multi-column glassmorphic cards with staggered entrance) are tested at 1440px. On 375px mobile screens, the waveform overflows, text animations stack awkwardly, and staggered card animations look chaotic because cards are stacked vertically instead of in a grid.

**Prevention:**
- Design animations mobile-first: start with the 375px behavior, then enhance for larger screens
- Use CSS container queries or viewport-aware animation parameters
- The sinusoidal waveform should reduce in amplitude and complexity on mobile (fewer cycles, smaller canvas)
- Disable staggered entrance animations on mobile when items are stacked -- use a simple fade-in instead
- Test at 375px, 390px (iPhone 14/15), and 428px (iPhone Pro Max) throughout development, not just at the end

**Detection:** Chrome DevTools device emulation at various iPhone sizes. Check for horizontal overflow, animation clipping, and visual chaos on small screens.

**Phase:** Must be considered during each component build, not as a post-development responsive pass.

---

## Minor Pitfalls

### Pitfall 10: Google Fonts Download Failure at Build Time

**What goes wrong:** `next/font/google` downloads fonts from Google Fonts API at build time. If the build environment has network restrictions (CI/CD behind a proxy, Vercel cold start), the download can fail with `ENETUNREACH`, causing the build to fail or falling back to system fonts in production.

**Prevention:**
- Download DM Sans and DM Mono font files manually and use `next/font/local` instead -- this eliminates the network dependency entirely and is the most reliable approach
- If using `next/font/google`, verify font loading works in Vercel's build environment by checking build logs

**Detection:** Build log warnings about font download failures. Production site rendering in system font instead of DM Sans.

**Phase:** Project setup phase.

---

### Pitfall 11: Glow Effects Compound with Blur to Create Visual Noise

**What goes wrong:** The brand kit includes glow effects (`rgba(61,126,255,0.35)` and `rgba(61,126,255,0.12)`). When glow elements overlap with glassmorphic blurred cards, the blur picks up the glow color and amplifies it, creating an unintended bright haze that reduces text readability and looks messy.

**Prevention:**
- Place glow elements on a separate z-index layer below the blur source
- Use `isolation: isolate` on glassmorphic cards to create a new stacking context that excludes glow elements from the blur calculation
- Test glow + glass combinations visually across all sections, not in isolation

**Detection:** Visual review with all sections visible. Scroll slowly and watch for areas where glow bleeds through glassmorphic cards.

**Phase:** Component design phase.

---

### Pitfall 12: i18n Text Length Differences Break Layouts

**What goes wrong:** French text is typically 15-30% longer than English for the same content. A hero headline that fits beautifully in English ("Your voice, your privacy.") may overflow or wrap awkwardly in French ("Votre voix, votre vie privee."). Fixed-width containers, truncated text, or single-line constraints break when switching languages.

**Prevention:**
- Design layouts with the longer language (French) as the default
- Never use fixed pixel widths for text containers -- use `max-width` with flexible height
- Test every section in both languages during development, not just at the end
- For the hero word-by-word animation, ensure the container can accommodate the longer French text without layout shift

**Detection:** Switch between FR and EN and verify no text truncation, overflow, or awkward wrapping occurs.

**Phase:** Every component build phase. Each section should be tested in both languages before being considered complete.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project setup / Scaffolding | Font loading CLS (#3), Google Fonts build failure (#10) | Use `next/font/local` with downloaded DM Sans/Mono files, configure font variables in layout.tsx from day one |
| i18n configuration | Missing hreflang (#4), text length differences (#12) | Set up next-intl with URL-based routing, custom sitemap route handler, and alternates in generateMetadata before building any page content |
| Design system / Components | Glassmorphism contrast (#5), blur performance (#1), glow noise (#11) | Build a `<GlassCard>` component with built-in contrast-safe background layer, blur radius cap at 8-12px, and `prefers-reduced-transparency` fallback |
| Hero section | Waveform CLS (#6), animation bundle bloat (#2), responsive breakpoints (#9) | Use CSS/Canvas for waveform (not Framer Motion), fixed-height container, mobile-first design |
| Animation system | `"use client"` creep (#7), reduced motion (#8), bundle size (#2) | Establish thin client wrapper pattern, implement `prefers-reduced-motion` from the start, use LazyMotion + `m` components |
| Features / Content sections | Responsive animations (#9), contrast on glass (#5) | Test each section at 375px in both languages with Lighthouse accessibility audit |
| Pre-launch audit | All pitfalls compound | Run Lighthouse on mobile with CPU throttling, validate hreflang with external tool, toggle reduced-motion/reduced-transparency in OS settings |

## Sources

- [Axess Lab: Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [shadcn/ui: backdrop-filter performance issues](https://github.com/shadcn-ui/ui/issues/327)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [MDN: prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency)
- [Motion.dev: Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size)
- [Next.js: Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [next-intl: Metadata and Route Handlers](https://next-intl.dev/docs/environments/actions-metadata-route-handlers)
- [next-intl: Routing configuration](https://next-intl.dev/docs/routing/configuration)
- [QED42: Next.js Lighthouse Performance Tuning](https://www.qed42.com/insights/next-js-performance-tuning-practical-fixes-for-better-lighthouse-scores)
- [App Router pitfalls (imidef.com)](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [GitHub: next-intl sitemap discussion](https://github.com/amannn/next-intl/discussions/888)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- [New Target: Glassmorphism with Accessibility](https://www.newtarget.com/web-insights-blog/glassmorphism/)

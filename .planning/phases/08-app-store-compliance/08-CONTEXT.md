# Phase 8: App Store Compliance - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Bilingual privacy policy page, support page, and footer links to unblock App Store submission. Three requirements: COMP-01 (privacy policy), COMP-02 (support page), COMP-03 (footer links). No new features, no new sections on the landing page.

</domain>

<decisions>
## Implementation Decisions

### Privacy policy content
- Proudly minimal tone — lead with "Dictus ne collecte aucune donnee" upfront, turn the legal page into a brand differentiator
- Based on existing `PRIVACY.md` from the dictus iOS repo (github.com/Pivii/dictus/blob/main/PRIVACY.md) — adapt and expand for web
- Covers both iOS app and website in a single combined policy
- One-liner per Apple-required section (Data Collection, Third-Party Sharing, Children's Privacy, etc.) — clear, scannable, honest
- Last-updated date at the bottom, no version number
- Contact email: pierre@pivi.solutions

### Page design & layout
- Minimal dark pages — same dark background (ink/ink-deep), shared Nav + Footer, clean typography
- No glassmorphism, no animations — just well-structured text content
- Navigation via existing Nav logo only — no breadcrumb or back link
- Narrow prose width (max-w-3xl / ~768px) for optimal reading line length

### Footer integration
- Add a text links row (Privacy Policy · Support) between the copyright line and the existing inline privacy statement
- Keep the existing inline privacy text ("Ce site et Dictus ne collectent aucune donnee personnelle...")
- Links use locale-aware routing: `/{locale}/privacy` and `/{locale}/support`
- Consistent with existing i18n pattern (next-intl, localePrefix: "always")

### Support page scope
- Minimal: contact email (pierre@pivi.solutions) + GitHub Issues link + Telegram community link
- Brief compatibility mention: "Dictus requires iOS 18+ and an iPhone with Apple Neural Engine"
- No FAQ section — keep it lean for App Store requirements

### Claude's Discretion
- Exact section ordering in the privacy policy
- Heading hierarchy and spacing
- How to handle the Apple-required sections that don't apply (e.g., "Data Retention" for a zero-data app)
- i18n message key naming conventions (follow existing patterns in fr.json/en.json)
- Sitemap entry structure for new pages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Privacy policy source
- `https://github.com/Pivii/dictus/blob/main/PRIVACY.md` — Existing privacy policy draft for the iOS app. Use as content base, adapt sections for web format and Apple compliance.

### Project context
- `.planning/REQUIREMENTS.md` — COMP-01, COMP-02, COMP-03 requirement definitions
- `.planning/PROJECT.md` — Brand kit, design tokens, constraints (zero tracking, bilingual FR/EN)
- `CLAUDE.md` — Color tokens, typography, logo usage rules

### Existing patterns to follow
- `src/app/[locale]/layout.tsx` — Shared layout with Nav, ThemeProvider, MotionProvider
- `src/app/[locale]/page.tsx` — Existing page structure for reference
- `src/components/Footer/Footer.tsx` — Current footer to modify with new links
- `src/messages/fr.json` and `src/messages/en.json` — i18n translation files
- `src/i18n/routing.ts` — Routing config (locales: ["fr", "en"], localePrefix: "always")
- `src/app/sitemap.ts` — Sitemap to extend with new page entries

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Footer.tsx`: Current footer component — needs modification to add privacy/support links
- `useTranslations` from next-intl: Used across all components for i18n
- Tailwind design tokens in `globals.css`: `text-white-40`, `border-border`, `bg-ink-deep`, etc.
- `Nav` component: Already shared via layout, will appear on new pages automatically

### Established Patterns
- i18n: All text via `useTranslations("Namespace")` with keys in `fr.json`/`en.json`
- Routing: `src/app/[locale]/[page]/page.tsx` pattern for locale-aware pages
- Layout: Pages wrapped in `LocaleLayout` which provides Nav, ThemeProvider, MotionProvider
- Typography: DM Sans (weights 200-600), DM Mono for technical labels

### Integration Points
- New routes: `src/app/[locale]/privacy/page.tsx` and `src/app/[locale]/support/page.tsx`
- Footer modification: Add locale-aware links using `useLocale()` or `Link` from next-intl
- Sitemap: Add entries for `/fr/privacy`, `/en/privacy`, `/fr/support`, `/en/support`
- i18n messages: New namespaces "Privacy" and "Support" in both `fr.json` and `en.json`

</code_context>

<specifics>
## Specific Ideas

- User already has a PRIVACY.md in the dictus iOS repo — use it as the content foundation and adapt for Apple's 8+ required sections
- Privacy policy should feel like a differentiator, not just compliance — "we collect nothing" is the message
- Support page should be App Store-ready but not over-engineered — just enough to pass review

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-app-store-compliance*
*Context gathered: 2026-03-19*

# Phase 8: App Store Compliance - Research

**Researched:** 2026-03-19
**Domain:** Next.js App Router pages, next-intl i18n, Apple App Store privacy requirements
**Confidence:** HIGH

## Summary

Phase 8 is a content-focused phase requiring two new bilingual pages (privacy policy, support) and a footer modification. The project already has all necessary infrastructure: next-intl for i18n, App Router with `[locale]` dynamic segment, shared layout with Nav, and a sitemap generator. No new dependencies are needed.

The privacy policy content already exists in the dictus iOS repo PRIVACY.md and covers the core messaging. It needs to be expanded into Apple's required sections (Data Collection, Data Usage, Third-Party Sharing, Data Retention, User Rights, Contact Information) while maintaining the "we collect nothing" differentiator tone. For a zero-data app, each section can be a one-liner confirming no collection.

**Primary recommendation:** Create two server components (`privacy/page.tsx`, `support/page.tsx`) following the existing `[locale]` routing pattern, add i18n namespaces "Privacy" and "Support" to both language files, modify Footer.tsx to add locale-aware links using the existing `Link` from `@/i18n/navigation`, and extend `sitemap.ts` with four new entries.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Privacy policy content based on existing PRIVACY.md from dictus iOS repo, adapted and expanded for web
- Covers both iOS app and website in a single combined policy
- Proudly minimal tone -- lead with "Dictus ne collecte aucune donnee" upfront
- One-liner per Apple-required section, clear, scannable, honest
- Last-updated date at bottom, no version number
- Contact email: pierre@pivi.solutions
- Minimal dark pages -- same dark background (ink/ink-deep), shared Nav + Footer, clean typography
- No glassmorphism, no animations -- just well-structured text content
- Navigation via existing Nav logo only -- no breadcrumb or back link
- Narrow prose width (max-w-3xl / ~768px) for optimal reading line length
- Footer: add text links row (Privacy Policy . Support) between copyright line and existing inline privacy statement
- Keep existing inline privacy text in footer
- Links use locale-aware routing: /{locale}/privacy and /{locale}/support
- Support page: contact email + GitHub Issues link + Telegram community link
- Brief compatibility mention on support: "Dictus requires iOS 18+ and an iPhone with Apple Neural Engine"
- No FAQ section on support page

### Claude's Discretion
- Exact section ordering in the privacy policy
- Heading hierarchy and spacing
- How to handle Apple-required sections that don't apply (e.g., "Data Retention" for a zero-data app)
- i18n message key naming conventions (follow existing patterns in fr.json/en.json)
- Sitemap entry structure for new pages

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | Page Privacy Policy bilingue FR/EN avec les 8+ sections exigees par Apple (accessible publiquement) | Apple requires: Data Collection, Data Usage, Third-Party Sharing, Data Retention, User Rights, Contact Info. Existing PRIVACY.md provides content base. next-intl i18n pattern handles bilingual. |
| COMP-02 | Page Support bilingue FR/EN avec email de contact pierre@pivi.solutions | Simple server component page with i18n. Contact email, GitHub Issues link, Telegram link, compatibility note. |
| COMP-03 | Liens Privacy Policy et Support ajoutes dans le footer du site | Footer.tsx modification using `Link` from `@/i18n/navigation` for locale-aware routing. New i18n keys in Footer namespace. |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App Router, page routing | Already in project |
| next-intl | ^4.8.3 | i18n translations, locale-aware routing | Already in project |
| tailwindcss | ^4 | Styling | Already in project |
| react | 19.2.3 | UI rendering | Already in project |

### Supporting
No additional libraries needed. This phase is pure content pages using existing infrastructure.

### Alternatives Considered
None -- the stack is already established. No new dependencies required.

**Installation:**
```bash
# No installation needed -- all dependencies already present
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    [locale]/
      privacy/
        page.tsx           # Privacy policy page (server component)
      support/
        page.tsx           # Support page (server component)
  components/
    Footer/
      Footer.tsx           # Modified to add privacy/support links
  messages/
    fr.json                # Add "Privacy" and "Support" namespaces
    en.json                # Add "Privacy" and "Support" namespaces
  i18n/
    navigation.ts          # Already exports Link (no changes needed)
    routing.ts             # Already configured (no changes needed)
  app/
    sitemap.ts             # Add 4 new entries
```

### Pattern 1: Locale-Aware Page with Server Translations
**What:** New page under `[locale]` directory using `setRequestLocale` and `getTranslations`
**When to use:** Every new page in this project
**Example:**
```typescript
// Source: Existing pattern from src/app/[locale]/page.tsx
import { setRequestLocale, getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-light tracking-tight">{t("title")}</h1>
      {/* Content sections */}
    </article>
  );
}
```

### Pattern 2: Locale-Aware Link in Client Component
**What:** Using the project's `Link` export from `@/i18n/navigation` for automatic locale prefixing
**When to use:** Any internal link in a client component
**Example:**
```typescript
// Source: Existing pattern from src/components/Nav/Logo.tsx
import { Link } from "@/i18n/navigation";

// Link automatically prepends the current locale
<Link href="/privacy">Privacy Policy</Link>
// Renders as /fr/privacy or /en/privacy depending on current locale
```

### Pattern 3: i18n Message Namespace
**What:** Adding new translation namespaces to fr.json and en.json
**When to use:** Any new page or component with translatable text
**Example:**
```json
{
  "Privacy": {
    "title": "Politique de confidentialite",
    "last_updated": "Derniere mise a jour : 17 mars 2026",
    "intro": "Dictus ne collecte aucune donnee.",
    "data_collection_title": "Collecte de donnees",
    "data_collection_text": "..."
  }
}
```

### Pattern 4: Page Metadata for New Pages
**What:** Each new page should export metadata or use `generateMetadata` for SEO
**When to use:** Every new page
**Example:**
```typescript
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { fr: "/fr/privacy", en: "/en/privacy", "x-default": "/fr/privacy" },
    },
  };
}
```

### Pattern 5: Static Params Generation
**What:** `generateStaticParams` for static generation of locale pages
**When to use:** Every new page under `[locale]`
**Example:**
```typescript
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

### Anti-Patterns to Avoid
- **Using `<a>` tags for internal links:** Always use `Link` from `@/i18n/navigation` for locale-aware routing
- **Hardcoding locale in URLs:** Never write `/fr/privacy` directly; let next-intl handle locale prefixing
- **Client components for static content:** Privacy and support pages are pure content -- use server components (no `"use client"`)
- **Putting Footer inside page components:** Footer is already rendered by the homepage page.tsx, but new pages need to include it too since it is not in layout.tsx

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale-aware links | Manual locale detection + string concatenation | `Link` from `@/i18n/navigation` | Already handles locale detection, prefixing, active state |
| Translation loading | Manual JSON imports | `getTranslations` / `useTranslations` from next-intl | Handles SSR, client hydration, fallbacks |
| Sitemap XML generation | Manual XML string building | `MetadataRoute.Sitemap` return type in `sitemap.ts` | Next.js handles XML serialization |

## Common Pitfalls

### Pitfall 1: Footer Not Appearing on New Pages
**What goes wrong:** New pages under `[locale]/privacy/page.tsx` won't have the Footer because Footer is rendered in `[locale]/page.tsx`, not in `layout.tsx`.
**Why it happens:** The current architecture includes Footer inside the homepage component, not the shared layout.
**How to avoid:** Each new page must explicitly import and render `<Footer />` at the bottom of its content.
**Warning signs:** Pages render without footer on first build.

### Pitfall 2: Missing `generateStaticParams` on New Pages
**What goes wrong:** Build fails or pages are not statically generated.
**Why it happens:** Next.js App Router with next-intl requires `generateStaticParams` on every page under `[locale]` for static export.
**How to avoid:** Always add `generateStaticParams` returning `routing.locales.map(...)`.

### Pitfall 3: Privacy Policy Not Matching App Store Nutrition Labels
**What goes wrong:** Apple rejects app because policy content doesn't match the "Data Not Collected" privacy label.
**Why it happens:** Policy mentions data types that aren't declared, or vice versa.
**How to avoid:** Policy must explicitly state "Data Not Collected" / zero collection in alignment with App Store Connect privacy labels. Since Dictus collects no data, every section should confirm this.

### Pitfall 4: Forgetting `setRequestLocale` in Server Components
**What goes wrong:** Translations fail or default locale is used regardless of URL.
**Why it happens:** next-intl requires `setRequestLocale(locale)` to be called in every server component page.
**How to avoid:** Always call `setRequestLocale(locale)` as the first line after extracting locale from params.

### Pitfall 5: Broken Footer Links on Homepage
**What goes wrong:** Adding `Link` from `@/i18n/navigation` in Footer but Footer is a client component using `useTranslations` -- mixing server/client imports.
**Why it happens:** Footer currently uses `useTranslations` (client-side hook). Adding `Link` from `@/i18n/navigation` is fine since it's also a client-side export.
**How to avoid:** Use `Link` from `@/i18n/navigation` in Footer (both are client-compatible). No issue here as long as you don't try to use server-only imports.

## Code Examples

### Privacy Policy Page Structure
```typescript
// src/app/[locale]/privacy/page.tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Footer from "@/components/Footer/Footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { fr: "/fr/privacy", en: "/en/privacy", "x-default": "/fr/privacy" },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extralight tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm text-white-40">{t("last_updated")}</p>
        <p className="mt-8 text-lg text-white-70">{t("intro")}</p>
        {/* Sections rendered as h2 + p pairs */}
      </article>
      <Footer />
    </>
  );
}
```

### Footer Modification with Links
```typescript
// Addition to Footer.tsx
import { Link } from "@/i18n/navigation";

// Inside the footer JSX, between copyright and privacy text:
<div className="flex gap-4 text-sm">
  <Link href="/privacy" className="text-white-40 transition-colors hover:text-white-70">
    {t("privacy_link")}
  </Link>
  <span className="text-white-40">·</span>
  <Link href="/support" className="text-white-40 transition-colors hover:text-white-70">
    {t("support_link")}
  </Link>
</div>
```

### Sitemap Extension
```typescript
// Add to sitemap.ts return array
{
  url: `${BASE_URL}/fr/privacy`,
  lastModified: new Date(),
  changeFrequency: "yearly",
  priority: 0.3,
  alternates: {
    languages: { fr: `${BASE_URL}/fr/privacy`, en: `${BASE_URL}/en/privacy` },
  },
},
{
  url: `${BASE_URL}/en/privacy`,
  lastModified: new Date(),
  changeFrequency: "yearly",
  priority: 0.3,
  alternates: {
    languages: { fr: `${BASE_URL}/fr/privacy`, en: `${BASE_URL}/en/privacy` },
  },
},
// Same pattern for /support with priority 0.3
```

## Apple Privacy Policy Required Sections

For a zero-data app like Dictus, the following sections satisfy Apple's requirements. Each can be a brief one-liner confirming no collection:

| # | Section | Required By Apple | Dictus Content Gist |
|---|---------|-------------------|---------------------|
| 1 | Data Collection | Yes | No personal data collected. Voice processed on-device only. |
| 2 | Data Usage | Yes | No data usage -- nothing is collected. |
| 3 | Third-Party Sharing | Yes | No third-party SDKs, analytics, or ad networks. |
| 4 | Data Retention | Yes | Preferences and model files stored locally only. Never leaves device. |
| 5 | User Rights | Yes | No data to access/delete. Uninstall removes all local data. |
| 6 | Children's Privacy | Recommended | No data collected from any user including children. |
| 7 | Security | Recommended | All processing on-device. No network transmission. |
| 8 | Contact Information | Yes | pierre@pivi.solutions |
| 9 | Changes to Policy | Recommended | Updates posted on this page with revised date. |
| 10 | Full Access Permission | App-specific | Explains keyboard Full Access is for microphone only. |

**Recommended section order (Claude's discretion):** Lead with the strong differentiator (intro: "Dictus collects no data"), then Data Collection, Full Access Permission (iOS-specific explanation), Data Usage, Third-Party Sharing, Data Retention, User Rights, Children's Privacy, Security, Changes to Policy, Contact.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-intl pages router | next-intl App Router with `createNavigation` | next-intl v3+ | Use `createNavigation` for Link, useRouter |
| `useRouter` from next/navigation | `useRouter` from `@/i18n/navigation` | next-intl v3+ | Locale-aware routing automatically |
| Manual `generateMetadata` without alternates | `alternates.languages` in metadata | Next.js 14+ | Proper hreflang for SEO |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no test framework in devDependencies) |
| Config file | None |
| Quick run command | `npm run build` (build validation) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Privacy page renders at /fr/privacy and /en/privacy | smoke | `npm run build` (confirms pages compile) | N/A -- build test |
| COMP-02 | Support page renders at /fr/support and /en/support | smoke | `npm run build` (confirms pages compile) | N/A -- build test |
| COMP-03 | Footer contains links to privacy and support | manual | Visual inspection after build | N/A |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Build succeeds, all 4 URLs render correctly, footer links work

### Wave 0 Gaps
None -- no test framework exists in the project, and the phase requirements are best validated by build success and manual URL verification. Adding a test framework is out of scope for this phase.

## Open Questions

1. **Footer placement in new pages**
   - What we know: Footer is currently rendered inside `page.tsx` (homepage), not in `layout.tsx`
   - What's unclear: Whether to move Footer to layout.tsx (affecting all pages) or duplicate it in each new page
   - Recommendation: Import and render Footer in each new page to avoid layout-level changes that could affect the homepage. This is the lower-risk approach for a 2-page addition.

## Sources

### Primary (HIGH confidence)
- Project codebase inspection: layout.tsx, Footer.tsx, sitemap.ts, routing.ts, navigation.ts, fr.json, en.json, page.tsx
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) - Privacy policy requirements
- [App Privacy Details - Apple Developer](https://developer.apple.com/app-store/app-privacy-details/) - Privacy nutrition label requirements

### Secondary (MEDIUM confidence)
- [App Store Privacy Policy Requirements 2025 Guide](https://iossubmissionguide.com/app-store-privacy-policy-requirements) - Required sections breakdown
- [GitHub Pivii/dictus PRIVACY.md](https://github.com/Pivii/dictus/blob/main/PRIVACY.md) - Existing privacy policy content base

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed, patterns established in codebase
- Architecture: HIGH - Follows exact existing patterns (locale routing, i18n namespaces, server components)
- Pitfalls: HIGH - Identified from direct codebase inspection (Footer placement, generateStaticParams requirement)
- Apple requirements: MEDIUM - Based on Apple developer docs and third-party guide, cross-referenced

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- content pages, no fast-moving dependencies)

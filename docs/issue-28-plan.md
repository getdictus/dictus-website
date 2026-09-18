# Pricing preview — issue #28

Written before implementation on 18 September 2026. The updated issue body is the contract; its older founder-price and navigation comments are superseded.

## Context and boundaries

- Continue `t3code/develop-issue-29` in `/Users/pierreviviere/.t3/worktrees/dictus-website/t3code-18cd9f6f`; update existing draft PR #32 against `main`. No new branch, production deployment or merge.
- Repo instructions: `AGENTS.md`, `CLAUDE.md`, `docs/issue-29-handoff.md`, `docs/agents/domain.md` and `docs/agents/issue-tracker.md`. No context or ADR files exist. Atomic English commits reference #28; maintainer recap is French.
- Consumers mapped: preview Pricing route and metadata; locale messages; shared GlassSurface / GlassSelectorLens / useGlassSelector; homepage Comparison table and cards; Terms; Support compatibility; Privacy; preview gate, navigation, robots and sitemap.
- App Store France lookup verified by the coordinating agent: app 6761262378, version 1.8.2, release 14 September 2026, minimum iOS 17.0. This resolves the stale iOS 18 claim. The Pro matrix comes from the referenced develop snapshot and is described as a forthcoming offering, not a released purchase.
- Catalogue is a preview reference. Final amounts, territories and paid availability still need product confirmation before publication.

## Design plan

- Palette: existing light background `#F2F2F7`, secondary `#EFF1F5`, white surface `#FFFFFF`, primary black `#000000`, blue `#2563EB`, muted text `#555862`.
- Type: existing DM Sans; light display/section headings, regular small labels, readable body line lengths below 80 characters.
- Layout: left-aligned short introduction; a horizontal free Desktop section; two iPhone panels with a larger Pro panel; full-width semantic comparison; native disclosure FAQ; distinct support-project footer.
- The shared three-position glass selector is the visual focus. Pro uses one feature list and three billing modes. Avoid generic promotional badges, decorative stats, arbitrary animations and invented imagery.

```text
Start free. / Desktop free forever + iPhone free foundation
Desktop free ───────── local transcription / download link
iPhone free       | Dictus Pro (iPhone only)
features         | monthly [annual] lifetime / total price
                 | availability / same Pro features
Feature details  | free | Pro
Questions (native disclosures)
Support the free project / terms / privacy / help
```

Review against brief: equal subscription cards would imply different Pro features and underplay Desktop. Use one restrained Pro panel and an explicit free Desktop section instead; retain the approved navigation and blue Soutenir button.

## Ordered implementation

1. Add a typed catalogue with one source for EUR amounts, trial duration, history retention, plan order and feature keys. Centralize localized plan labels and lifetime scope for cards, comparison, FAQ and Terms.
2. Replace the placeholder with localized semantic content, accessible native radio billing selector using the existing glass primitives, annual default, accurate renewal/trial/lifetime details and unavailable purchase status. Add page-specific social metadata; preserve noindex and route gate.
3. Align homepage preview comparison and support compatibility; correct related Terms product wording without changing payment obligations; link current free app neutrally and keep Desktop download links. Preserve production link gating and donation separation.
4. Add focused headless checks for FR/EN, prices, keyboard/touch/hover selection, no-JavaScript reading, responsive layout, comparison/FAQ, metadata, route links and preview protection. Reuse existing homepage regression checks.
5. Update handoff and source evidence, run checks, make atomic commits, push only the current branch and update draft PR #32 while retaining its #29 description.

## Verification and risks

- `npm run lint` (baseline: 8 existing warnings), `DICTUS_SITE_PREVIEW=1 npm run build`, existing `VERIFY_SCREENSHOTS=0 VERIFY_ENGINES=chromium,webkit npm run test:e2e -- http://localhost:4329`, focused pricing script.
- Portly only. Status inspected first; checkout servers initially stopped. Coordinate with parent before stopping/building, then restart managed preview on 4329. Leave preview available for desktop testing.
- Explicitly attempt Firefox; report launch failure if environment still prevents execution. No screenshots/videos as delivery artifacts.
- Each acceptance criterion gets recorded in the final handoff. Verify production gate with a production build or equivalent isolated checks, then restore the preview build.
- Hardware is not an entitlement: iOS 26 + enabled Apple Intelligence + supported device/language/region for smart modes and intelligent correction; history/vocabulary do not require Apple Intelligence. Keep plain dictation and model compatibility separate.
- Avoid inference from beta/develop code to commercial availability. Final catalogue/territory confirmation and physical iPhone Safari remain manual publication gates.

## Concurrent work

A separate #33 blog task is editing this same worktree. Preserve its files and namespaces, stage only #28 changes, and coordinate builds, pushes and PR updates. Shared JSON is read immediately before each targeted update.

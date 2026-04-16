---
phase: 13-desktop-preparation
plan: 02
type: execute
wave: 2
depends_on:
  - "13-01"
files_modified:
  - src/messages/en.json
  - src/messages/fr.json
autonomous: false
requirements:
  - DESK-04

must_haves:
  truths:
    - "Every copy string on the site that used to assert mobile-only availability (iOS & Android) now acknowledges Desktop (macOS, Windows, Linux coming soon), in both FR and EN"
    - "The new Platforms section renders real localized copy (no next-intl missing-key warnings in console) on /fr and /en"
    - "The Comparison table row for Dictus reads 'Mobile & Desktop' (or FR equivalent) instead of 'iOS & Android'"
    - "The Support page compatibility paragraph reflects iOS beta + Android beta + Mac/Win/Linux coming soon"
    - "The Metadata title stays within the ~70-character Open Graph budget in both locales"
  artifacts:
    - path: "src/messages/en.json"
      provides: "English i18n messages with new Platforms namespace + updated Metadata.title, Comparison.dictus_platforms, Support.compatibility_text"
      contains: "Platforms"
    - path: "src/messages/fr.json"
      provides: "French i18n messages with new Platforms namespace + updated Metadata.title, Comparison.dictus_platforms, Support.compatibility_text"
      contains: "Platforms"
  key_links:
    - from: "src/components/Platforms/Platforms.tsx"
      to: "src/messages/en.json"
      via: "useTranslations(\"Platforms\") key lookups"
      pattern: "\"Platforms\":\\s*\\{"
    - from: "src/components/Platforms/Platforms.tsx"
      to: "src/messages/fr.json"
      via: "useTranslations(\"Platforms\") key lookups (FR locale fallback/primary)"
      pattern: "\"Platforms\":\\s*\\{"
    - from: "src/components/Comparison/Comparison.tsx (+ ComparisonTable, ComparisonCards)"
      to: "src/messages/*.json Comparison.dictus_platforms"
      via: "next-intl key lookup at render time"
      pattern: "dictus_platforms"
    - from: "src/app/[locale]/support/page.tsx"
      to: "src/messages/*.json Support.compatibility_text"
      via: "next-intl key lookup at render time"
      pattern: "compatibility_text"
---

<objective>
Finalize DESK-04: (a) add the new `Platforms` namespace in both `src/messages/en.json` and `src/messages/fr.json` so the Plan 01 component renders real copy, and (b) rewrite the four existing "mobile-only" strings across Metadata title, Comparison.dictus_platforms, and Support.compatibility_text to acknowledge Desktop.

Purpose: Close the copy surface so search engines, the Comparison section, and the Support page no longer describe Dictus as mobile-only. Keep OG/meta titles under the 70-char budget.

Output:
- `src/messages/en.json` — new `Platforms` namespace (15 keys) + 3 edited strings
- `src/messages/fr.json` — mirror of the same edits, localized
- Manual QA confirming no next-intl missing-key warnings, Metadata title length check, and visual verification in `/fr` and `/en`
</objective>

<execution_context>
@/Users/pierreviviere/.claude/get-shit-done/workflows/execute-plan.md
@/Users/pierreviviere/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/13-desktop-preparation/13-CONTEXT.md
@.planning/phases/13-desktop-preparation/13-RESEARCH.md
@.planning/phases/13-desktop-preparation/13-VALIDATION.md
@.planning/phases/13-desktop-preparation/13-01-SUMMARY.md
@CLAUDE.md

<interfaces>
<!-- Key references the executor needs. Use these directly, no codebase exploration required. -->

Current EN values (verified in src/messages/en.json):
  Line 9:   "title": "dictus -- 100% Offline Voice Dictation for iOS & Android"
  Line 79:  "dictus_platforms": "iOS & Android"
  Line 145: "compatibility_text": "Dictus requires iOS 18+ (iPhone) — Android support coming soon."

Current FR values (verified in src/messages/fr.json):
  Line 9:   "title": "dictus -- Dictation vocale 100% offline pour iOS & Android"
  Line 79:  "dictus_platforms": "iOS & Android"
  Line 145: "compatibility_text": "Dictus nécessite iOS 18+ (iPhone) — support Android bientôt disponible."

JSON structure (both files):
```
{
  "Nav": { ... },
  "Metadata": { "title": "...", "description": "...", "jsonld_description": "..." },
  "Hero": { ... },
  ...
  "Comparison": { ..., "dictus_platforms": "...", ... },
  ...
  "Support": { ..., "compatibility_text": "..." },
  ...
  "Donate": { ... }
}
```

Consumers of the 15 new `Platforms.*` keys (already shipped in Plan 01):
  Platforms.heading, Platforms.subheading, Platforms.tablist_label,
  Platforms.tab_mac, Platforms.tab_win, Platforms.tab_linux,
  Platforms.panel_mac_title, Platforms.panel_mac_desc,
  Platforms.panel_win_title, Platforms.panel_win_desc,
  Platforms.panel_linux_title, Platforms.panel_linux_desc,
  Platforms.coming_soon_label, Platforms.select_prompt, Platforms.star_on_github

Recommended final strings (copied verbatim from RESEARCH §Example 5 + §Pitfall 5):

EN:
  Metadata.title → "dictus -- 100% Offline Voice Dictation for Mobile & Desktop"  (60 chars — under 70)
  Comparison.dictus_platforms → "Mobile & Desktop"
  Support.compatibility_text → "Dictus runs on iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon)."
  Platforms namespace:
    heading: "Also coming to Desktop"
    subheading: "Dictus is expanding to macOS, Windows, and Linux. Same 100% offline guarantee."
    tablist_label: "Desktop platforms"
    tab_mac: "macOS"
    tab_win: "Windows"
    tab_linux: "Linux"
    panel_mac_title: "macOS"
    panel_mac_desc: "Apple Silicon (arm64) and Intel (x64). Native app, no login, no telemetry."
    panel_win_title: "Windows"
    panel_win_desc: "Windows 10/11, x64 and ARM. Installer and MSI."
    panel_linux_title: "Linux"
    panel_linux_desc: "AppImage (universal), .deb (Ubuntu/Debian), .rpm (Fedora/openSUSE)."
    coming_soon_label: "Coming Soon"
    select_prompt: "Pick a platform to see details."
    star_on_github: "Star on GitHub to follow progress"

FR:
  Metadata.title → "dictus -- Dictation vocale 100% offline Mobile & Desktop"  (60 chars — under 70)
  Comparison.dictus_platforms → "Mobile & Desktop"
  Support.compatibility_text → "Dictus fonctionne sur iOS 18+ (beta), Android (beta), et macOS, Windows, Linux (bientôt disponibles)."
  Platforms namespace:
    heading: "Aussi sur Desktop"
    subheading: "Dictus arrive sur macOS, Windows et Linux. La même garantie 100% offline."
    tablist_label: "Plateformes Desktop"
    tab_mac: "macOS"
    tab_win: "Windows"
    tab_linux: "Linux"
    panel_mac_title: "macOS"
    panel_mac_desc: "Apple Silicon (arm64) et Intel (x64). App native, sans compte, sans télémétrie."
    panel_win_title: "Windows"
    panel_win_desc: "Windows 10/11, x64 et ARM. Installeur et MSI."
    panel_linux_title: "Linux"
    panel_linux_desc: "AppImage (universel), .deb (Ubuntu/Debian), .rpm (Fedora/openSUSE)."
    coming_soon_label: "Bientôt disponible"
    select_prompt: "Sélectionnez une plateforme pour voir les détails."
    star_on_github: "Star sur GitHub pour suivre l'avancée"
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Update src/messages/en.json — add Platforms namespace + rewrite Metadata.title, Comparison.dictus_platforms, Support.compatibility_text</name>
  <files>src/messages/en.json</files>
  <read_first>
    - src/messages/en.json (CURRENT state — verify the three values at lines 9, 79, 145 before editing; also confirm there is NO existing "Platforms" top-level key)
    - src/components/Platforms/Platforms.tsx (from Plan 01 — lists the 15 keys the component consumes; namespace MUST match exactly)
    - .planning/phases/13-desktop-preparation/13-RESEARCH.md §Example 5 (exhaustive copy-sweep inventory) + §Pitfall 5 (OG title ≤ 70 chars)
  </read_first>
  <action>
Edit `src/messages/en.json` to make THREE edits + ONE addition. Preserve all other keys and the JSON order of existing top-level namespaces.

**Edit 1 — Metadata.title** (currently line 9):
Replace:
```json
"title": "dictus -- 100% Offline Voice Dictation for iOS & Android",
```
With:
```json
"title": "dictus -- 100% Offline Voice Dictation for Mobile & Desktop",
```
Character count: 60 (within the 70-char OG budget).

**Edit 2 — Comparison.dictus_platforms** (currently line 79):
Replace:
```json
"dictus_platforms": "iOS & Android",
```
With:
```json
"dictus_platforms": "Mobile & Desktop",
```
Do NOT touch the competitor platform strings (`apple_platforms`, `wisprflow_platforms`, `superwhisper_platforms`, `google_platforms`, etc.) — RESEARCH confirmed they describe competitors and are out of scope.

**Edit 3 — Support.compatibility_text** (currently line 145):
Replace:
```json
"compatibility_text": "Dictus requires iOS 18+ (iPhone) — Android support coming soon."
```
With:
```json
"compatibility_text": "Dictus runs on iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon)."
```
Note: the existing file uses a Unicode em-dash escape (`\u2014`); the new string has no em-dash, so no escape is needed. Keep the trailing-comma convention of whatever sibling key follows (there is no sibling after `compatibility_text` inside `Support` in the current file — it is the last key of the `Support` namespace — so NO trailing comma).

**Addition — new `Platforms` top-level namespace.** Insert it AFTER the `Support` namespace and BEFORE `Donate` (alphabetical ordering is NOT a project convention; we place it grouped with the landing-page sections for reviewer convenience). Add this block exactly:

```json
  "Platforms": {
    "heading": "Also coming to Desktop",
    "subheading": "Dictus is expanding to macOS, Windows, and Linux. Same 100% offline guarantee.",
    "tablist_label": "Desktop platforms",
    "tab_mac": "macOS",
    "tab_win": "Windows",
    "tab_linux": "Linux",
    "panel_mac_title": "macOS",
    "panel_mac_desc": "Apple Silicon (arm64) and Intel (x64). Native app, no login, no telemetry.",
    "panel_win_title": "Windows",
    "panel_win_desc": "Windows 10/11, x64 and ARM. Installer and MSI.",
    "panel_linux_title": "Linux",
    "panel_linux_desc": "AppImage (universal), .deb (Ubuntu/Debian), .rpm (Fedora/openSUSE).",
    "coming_soon_label": "Coming Soon",
    "select_prompt": "Pick a platform to see details.",
    "star_on_github": "Star on GitHub to follow progress"
  },
```

Do NOT reorder any other keys. Do NOT modify Hero.badge_*, AdaptiveCTA-related keys, Metadata.description, Metadata.jsonld_description, Features.*, Privacy.*, Donate.*, Footer.*, Nav.* — all confirmed platform-agnostic by RESEARCH §Example 5. Preserve the file's existing Unicode escape style (`\u2014`, `\u2019`) for strings that already use them; the new Platforms keys use plain ASCII and need no escapes.

The final file MUST be valid JSON (parseable by `node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json','utf8'))"`). Trailing commas are NOT allowed in JSON — watch the last key of the new Platforms namespace.
  </action>
  <verify>
    <automated>node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json','utf8'))" && grep -c "\"Platforms\":" src/messages/en.json && grep -c "Mobile & Desktop" src/messages/en.json</automated>
  </verify>
  <acceptance_criteria>
    - `node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json','utf8'))"` exits 0 (valid JSON)
    - `grep -c "\"Platforms\":" src/messages/en.json` returns 1 (new namespace exists)
    - `grep -c "100% Offline Voice Dictation for Mobile & Desktop" src/messages/en.json` returns 1
    - `grep -c "100% Offline Voice Dictation for iOS & Android" src/messages/en.json` returns 0 (stale string removed)
    - `grep -c "\"dictus_platforms\": \"Mobile & Desktop\"" src/messages/en.json` returns 1
    - `grep -c "\"dictus_platforms\": \"iOS & Android\"" src/messages/en.json` returns 0
    - `grep -c "iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon)" src/messages/en.json` returns 1
    - `grep -c "Android support coming soon" src/messages/en.json` returns 0 (stale string removed)
    - The new Platforms namespace contains EXACTLY these 15 keys (grep each): heading, subheading, tablist_label, tab_mac, tab_win, tab_linux, panel_mac_title, panel_mac_desc, panel_win_title, panel_win_desc, panel_linux_title, panel_linux_desc, coming_soon_label, select_prompt, star_on_github. Verify with: `node -e "const m=require('./src/messages/en.json'); const keys=Object.keys(m.Platforms).sort(); console.log(keys.join(','))"` and confirm 15 keys are listed and include all of the above.
    - Metadata.title length ≤ 70 chars: `node -e "const m=require('./src/messages/en.json'); console.log(m.Metadata.title.length)"` prints a number ≤ 70 (expected 60)
    - Competitor platform rows untouched: `grep -c "\"apple_platforms\":" src/messages/en.json` returns 1 and `grep -c "iOS, macOS\|macOS, Windows" src/messages/en.json` still returns its original competitor matches
    - Validation map: this task contributes to `13-02-01` (DESK-04) and `13-02-02` (DESK-04 stale-string purge)
  </acceptance_criteria>
  <done>en.json valid JSON; three target strings replaced; new Platforms namespace with 15 keys inserted between Support and Donate; Metadata.title within OG budget.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Update src/messages/fr.json — mirror Task 1 edits with French localization</name>
  <files>src/messages/fr.json</files>
  <read_first>
    - src/messages/fr.json (CURRENT state — verify existing values at lines 9, 79, 145 match the English structure; also confirm no existing "Platforms" top-level key)
    - src/messages/en.json (AFTER Task 1 — must mirror its structure key-for-key; FR is not a strict subset but must have exact parity on keys inside `Platforms`, `Metadata`, `Comparison`, `Support`)
    - .planning/phases/13-desktop-preparation/13-RESEARCH.md §Example 5 + §Pitfall 5 (FR wording recommendations)
  </read_first>
  <action>
Edit `src/messages/fr.json` to mirror the three edits + one namespace addition from Task 1, with French translations.

**Edit 1 — Metadata.title** (currently line 9):
Replace:
```json
"title": "dictus -- Dictation vocale 100% offline pour iOS & Android",
```
With:
```json
"title": "dictus -- Dictation vocale 100% offline Mobile & Desktop",
```
Character count: 60 (within the 70-char OG budget). Keep the English word `Desktop` — it is a widely used loanword in French tech and the brand voice accepts it (RESEARCH Open Question 3 resolution).

**Edit 2 — Comparison.dictus_platforms** (currently line 79):
Replace:
```json
"dictus_platforms": "iOS & Android",
```
With:
```json
"dictus_platforms": "Mobile & Desktop",
```
Rationale: same terse form as EN — the Comparison row is a short label, not a sentence, and "Mobile et Desktop" would look awkward next to competitor rows like "iOS, macOS, Windows, Android".

**Edit 3 — Support.compatibility_text** (currently line 145):
Replace:
```json
"compatibility_text": "Dictus n\u00e9cessite iOS 18+ (iPhone) \u2014 support Android bient\u00f4t disponible."
```
With:
```json
"compatibility_text": "Dictus fonctionne sur iOS 18+ (beta), Android (beta), et macOS, Windows, Linux (bient\u00f4t disponibles)."
```
Keep the `\u00f4` escape for `bientôt` to match the file's existing Unicode-escape convention (line 145 already uses `\u00e9` for `nécessite` and `\u00f4` for `bientôt`). No em-dash needed — the new sentence uses a comma structure instead.

**Addition — new `Platforms` top-level namespace.** Insert AFTER the `Support` namespace and BEFORE `Donate` (matches EN ordering). Add this block exactly — note the Unicode escapes where needed (`\u00e0` for `à`, `\u00e9` for `é`, `\u00ea` for `ê`, `\u00f4` for `ô`, `\u2019` for typographic apostrophe):

```json
  "Platforms": {
    "heading": "Aussi sur Desktop",
    "subheading": "Dictus arrive sur macOS, Windows et Linux. La m\u00eame garantie 100% offline.",
    "tablist_label": "Plateformes Desktop",
    "tab_mac": "macOS",
    "tab_win": "Windows",
    "tab_linux": "Linux",
    "panel_mac_title": "macOS",
    "panel_mac_desc": "Apple Silicon (arm64) et Intel (x64). App native, sans compte, sans t\u00e9l\u00e9m\u00e9trie.",
    "panel_win_title": "Windows",
    "panel_win_desc": "Windows 10/11, x64 et ARM. Installeur et MSI.",
    "panel_linux_title": "Linux",
    "panel_linux_desc": "AppImage (universel), .deb (Ubuntu/Debian), .rpm (Fedora/openSUSE).",
    "coming_soon_label": "Bient\u00f4t disponible",
    "select_prompt": "S\u00e9lectionnez une plateforme pour voir les d\u00e9tails.",
    "star_on_github": "Star sur GitHub pour suivre l\u2019avanc\u00e9e"
  },
```

Do NOT translate `macOS`, `Windows`, `Linux`, `Apple Silicon`, `Intel`, `arm64`, `x64`, `ARM`, `AppImage`, `MSI`, `AppImage`, `.deb`, `.rpm`, `Ubuntu`, `Debian`, `Fedora`, `openSUSE`, `GitHub`, `Star`, `Desktop` — these are product names / technical identifiers and should remain exactly as in the EN version (project convention — see how `Apple Pay`, `Visa`, `Mastercard` stay in English in Donate.*).

Do NOT reorder any other keys. Do NOT modify Hero.badge_*, AdaptiveCTA-related keys, Metadata.description, Metadata.jsonld_description, Features.*, Privacy.*, Donate.*, Footer.*, Nav.* — all platform-agnostic.

Final file MUST be valid JSON.
  </action>
  <verify>
    <automated>node -e "JSON.parse(require('fs').readFileSync('src/messages/fr.json','utf8'))" && grep -c "\"Platforms\":" src/messages/fr.json && grep -c "Mobile & Desktop" src/messages/fr.json</automated>
  </verify>
  <acceptance_criteria>
    - `node -e "JSON.parse(require('fs').readFileSync('src/messages/fr.json','utf8'))"` exits 0 (valid JSON)
    - `grep -c "\"Platforms\":" src/messages/fr.json` returns 1
    - `grep -c "Dictation vocale 100% offline Mobile & Desktop" src/messages/fr.json` returns 1
    - `grep -c "Dictation vocale 100% offline pour iOS & Android" src/messages/fr.json` returns 0 (stale removed)
    - `grep -c "\"dictus_platforms\": \"Mobile & Desktop\"" src/messages/fr.json` returns 1
    - `grep -c "\"dictus_platforms\": \"iOS & Android\"" src/messages/fr.json` returns 0
    - `grep -c "iOS 18+ (beta), Android (beta), et macOS, Windows, Linux" src/messages/fr.json` returns 1
    - `grep -c "support Android bient" src/messages/fr.json` returns 0 (stale removed)
    - `node -e "const m=require('./src/messages/fr.json'); const keys=Object.keys(m.Platforms).sort(); console.log(keys.join(','))"` prints 15 keys matching the EN set exactly
    - Metadata.title length ≤ 70 chars: `node -e "const m=require('./src/messages/fr.json'); console.log(m.Metadata.title.length)"` prints ≤ 70 (expected ~60)
    - Key parity EN vs FR in `Platforms`: `node -e "const en=require('./src/messages/en.json'),fr=require('./src/messages/fr.json'); const a=Object.keys(en.Platforms).sort(),b=Object.keys(fr.Platforms).sort(); console.log(JSON.stringify(a)===JSON.stringify(b))"` prints `true`
    - Validation map: this task closes `13-02-01` (DESK-04) and `13-02-02` (DESK-04 stale-string purge)
  </acceptance_criteria>
  <done>fr.json valid JSON; three target strings replaced with French translations; Platforms namespace present with 15 keys matching EN parity; Metadata.title within OG budget.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Full build gate — prove no next-intl missing keys + no stale strings anywhere under src/</name>
  <files></files>
  <read_first>
    - src/messages/en.json (AFTER Task 1)
    - src/messages/fr.json (AFTER Task 2)
    - .planning/phases/13-desktop-preparation/13-VALIDATION.md §Per-Task map (row 13-02-03)
  </read_first>
  <action>
This is a pure verification task — no file edits. Run the full validation suite and the stale-string sweep.

1. Run `npx tsc --noEmit` — must exit 0
2. Run `npx eslint .` — must exit 0 (warnings are acceptable; errors are not)
3. Run `npm run build` — must exit 0. In the build output, verify there are NO warnings of the form `MISSING_MESSAGE` for any `Platforms.*` key (next-intl logs those to stdout during static page generation)
4. Run the stale-string sweep across `src/`:
   - `grep -rn "iOS & Android" src/` — only allowed matches are competitor rows inside `src/messages/*.json` such as `apple_platforms`, `wisprflow_platforms`, `superwhisper_platforms`, `google_platforms`, etc. The Dictus row (`dictus_platforms`) MUST NOT appear. The Metadata.title MUST NOT appear.
   - `grep -rn "iOS 18+, Android\"" src/app/\[locale\]/page.tsx` — MUST return zero matches (verifies Plan 01 Task 3 survived).
   - `grep -rn "Android support coming soon" src/messages/` — MUST return zero matches.
   - `grep -rn "support Android bient" src/messages/` — MUST return zero matches.

If any of steps 1–3 fail, stop and surface the failure back to the task that caused it (Task 1 or Task 2). If step 4 finds residual strings, fix them in the owning file and re-run step 4.

Do NOT run `npm run dev` in the background. Do NOT install any new tooling. Do NOT edit any file in this task.
  </action>
  <verify>
    <automated>npx tsc --noEmit && npx eslint . && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `npx tsc --noEmit` exits 0
    - `npx eslint .` exits 0
    - `npm run build` exits 0 and its stdout does NOT contain the substring `MISSING_MESSAGE` (verify with `npm run build 2>&1 | grep -c MISSING_MESSAGE` returning 0 — any non-zero count is a failure)
    - `grep -rn "iOS 18+, Android\"" src/app/\[locale\]/page.tsx` returns zero matches
    - `grep -rn "Android support coming soon" src/messages/` returns zero matches
    - `grep -rn "support Android bient" src/messages/` returns zero matches
    - `grep -rn "\"dictus_platforms\": \"iOS & Android\"" src/messages/` returns zero matches (Dictus row fully rewritten in both locales)
    - Existing competitor rows preserved: `grep -c "\"apple_platforms\":" src/messages/en.json` and same for fr.json each return 1
    - Validation map: this task closes `13-02-03` (DESK-01, DESK-02) via build
  </acceptance_criteria>
  <done>Full validation suite green; no next-intl missing-message warnings for `Platforms.*`; zero residual mobile-only strings anywhere under `src/` except legitimate competitor-platform rows.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Manual QA — verify copy renders in both locales and OG title length stays under budget</name>
  <files>N/A — verification task, no file edits</files>
  <action>Pause execution and present the verification checklist below to the user. Start `npm run dev` if not already running. Walk the user through the 7 numbered verification blocks in `<how-to-verify>` for both `/fr` and `/en`. If any step fails, route the failure back to Task 1 (en.json edits) or Task 2 (fr.json edits) as appropriate. Watch DevTools console for `MISSING_MESSAGE: Platforms.*` warnings — any such warning is a blocker and routes back to the owning messages file.</action>
  <verify>
    <automated>echo "Manual checkpoint — awaiting user sign-off via resume-signal"; exit 0</automated>
  </verify>
  <done>User types "approved" OR all 7 verification blocks pass with zero missing-message warnings and Metadata titles measured ≤ 70 chars in both locales.</done>
  <what-built>
    - `src/messages/en.json` and `src/messages/fr.json` now contain the `Platforms` namespace (15 keys each)
    - Metadata title, Comparison row, and Support compatibility text all acknowledge Desktop
    - Combined with Plan 01's component, the Platforms section now renders real localized copy
  </what-built>
  <how-to-verify>
**Pre-requisites:** `npm run dev` and open DevTools console.

**1. Hard reload `/fr`**
- Open http://localhost:3000/fr — Platforms section displays heading **"Aussi sur Desktop"** and three tab buttons
- Tap each tab → card shows French titles/descriptions (e.g. "Apple Silicon (arm64) et Intel (x64). App native, sans compte, sans télémétrie.")
- Coming Soon pulse-pill reads **"Bientôt disponible"**
- "Star sur GitHub pour suivre l'avancée" link still points to github.com/Pivii/dictus
- Console: NO `MISSING_MESSAGE` warnings for any `Platforms.*` key

**2. Hard reload `/en`**
- Platforms section heading reads **"Also coming to Desktop"**
- Each tab's panel text is the EN translation
- Pulse-pill reads **"Coming Soon"**
- Console: no missing-message warnings

**3. Comparison section (both locales)**
- Scroll to the Comparison table — Dictus row now says **"Mobile & Desktop"** under the Platforms feature row, in both FR and EN
- Verify competitor rows still read their original platform lists (Apple, WisprFlow, SuperWhisper, Google) — unchanged
- Sanity: at 375px viewport, "Mobile & Desktop" fits without awkward wrapping

**4. Support page**
- Navigate to `/en/support` → Compatibility section reads: *"Dictus runs on iOS 18+ (beta), Android (beta), and macOS, Windows, Linux (coming soon)."*
- Navigate to `/fr/support` → Compatibility section reads: *"Dictus fonctionne sur iOS 18+ (beta), Android (beta), et macOS, Windows, Linux (bientôt disponibles)."*

**5. Metadata title budget**
- Open DevTools → Elements → `<head>` → inspect `<title>` on `/en` and `/fr`
- `/en` title MUST equal `"dictus -- 100% Offline Voice Dictation for Mobile & Desktop"` (60 chars)
- `/fr` title MUST equal `"dictus -- Dictation vocale 100% offline Mobile & Desktop"` (60 chars)
- Optional but recommended: open https://www.opengraph.xyz and paste `http://localhost:3000/en` (or public URL if one exists) — verify no mid-title ellipsis in the preview card

**6. JSON-LD still enumerates all platforms**
- View-source on `/en` → find the JSON-LD `<script type="application/ld+json">` block → `operatingSystem` STILL equals `"iOS 18+, Android, macOS, Windows, Linux"` (carried over from Plan 01 Task 3)

**7. No regressions in the rest of the site**
- Hero AdaptiveCTA badges/CTAs unchanged
- Features, HowItWorks, OpenSource, Community, Footer all render normally in both locales
- Donate page `/fr/donate` and `/en/donate` render unchanged (scope-locked out of this phase)
- Privacy page unchanged

Report any missing-message warnings, stale "iOS & Android" strings, or over-budget titles as blockers.
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues found (missing-key warnings, layout breaks, title-budget overflow, or wording concerns).</resume-signal>
</task>

</tasks>

<verification>
Phase-level checks before marking Plan 02 (and Phase 13) complete:
- `npx tsc --noEmit && npx eslint . && npm run build` exits 0
- `node -e "const en=require('./src/messages/en.json'),fr=require('./src/messages/fr.json'); console.log(JSON.stringify(Object.keys(en.Platforms).sort())===JSON.stringify(Object.keys(fr.Platforms).sort()))"` prints `true`
- `grep -rn "iOS & Android" src/messages/` matches only competitor rows (apple_platforms / wisprflow_platforms / etc.) — zero matches on `dictus_platforms` and zero matches on Metadata.title
- `grep -rn "iOS 18+, Android\"" src/app/` returns zero matches
- Build logs contain zero `MISSING_MESSAGE` entries for `Platforms.*`
- Manual QA (Task 4) confirms real localized copy renders in `/fr` and `/en`

Validation-map coverage (from 13-VALIDATION.md):
- 13-02-01 (DESK-04) — closed by Task 1 + Task 2 grep gates and Task 3 build gate
- 13-02-02 (DESK-04 stale-string purge) — closed by Task 3 grep sweep
- 13-02-03 (DESK-01, DESK-02 — missing i18n key catch) — closed by Task 3 `npm run build`
</verification>

<success_criteria>
- All 7 copy strings from RESEARCH §Example 5 are updated (4 in messages, 1 JSON-LD already done in Plan 01, 2 unused — i.e. the target three EN + three FR)
- New `Platforms` namespace is present in both en.json and fr.json with key parity (15 keys each, identical key names)
- `npm run build` is clean with zero `MISSING_MESSAGE` warnings for `Platforms.*`
- Metadata titles in both locales are ≤ 70 chars
- No stale "iOS & Android" or "mobile-only" phrasing survives anywhere under `src/` (except legitimate competitor-row strings)
- Phase 13 requirement DESK-04 is fully closed
</success_criteria>

<output>
After completion, create `.planning/phases/13-desktop-preparation/13-02-SUMMARY.md` following the standard SUMMARY template. Capture:
- Files touched (2: en.json, fr.json)
- Final wording chosen for Metadata.title, Comparison.dictus_platforms, Support.compatibility_text, Platforms.heading (both locales)
- OG title lengths measured (EN / FR)
- Manual QA outcome (per-locale rendering confirmation + missing-key warning count = 0)
- Any FR wording refinements made during review (e.g. if "Desktop" was swapped for "Ordinateur")
- Phase 13 completion note (DESK-01 + DESK-02 + DESK-03 + DESK-04 all closed)
</output>

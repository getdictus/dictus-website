---
status: complete
phase: 08-app-store-compliance
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md]
started: 2026-03-19T15:00:00Z
updated: 2026-03-19T15:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Privacy Policy Page (French)
expected: Navigate to /fr/privacy. Page displays a French privacy policy with a clear title, 10 distinct sections covering Apple-required topics. Page has a Footer at the bottom.
result: pass

### 2. Privacy Policy Page (English)
expected: Navigate to /en/privacy. Page displays the same privacy policy fully translated in English. All 10 sections present.
result: pass

### 3. Support Page (French)
expected: Navigate to /fr/support. Page shows support info with email contact, GitHub Issues link, Telegram community link, and iOS compatibility note. All in French.
result: pass

### 4. Support Page (English)
expected: Navigate to /en/support. Same support page fully translated in English.
result: pass

### 5. Support Email Link
expected: On the support page, the email address is a clickable mailto: link styled in accent blue. Clicking it opens the default email client.
result: pass

### 6. Footer Navigation Links
expected: On the homepage (or any page), the Footer shows "Privacy Policy" and "Support" links (or French equivalents) between the copyright row and the inline privacy statement, separated by a middle dot.
result: pass

### 7. Footer Links Navigate Correctly
expected: Clicking the Privacy Policy link in the footer navigates to /[current-locale]/privacy. Clicking Support navigates to /[current-locale]/support. Links are locale-aware.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps

[none]

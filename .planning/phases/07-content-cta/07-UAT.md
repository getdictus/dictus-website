---
status: complete
phase: 07-content-cta
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md]
started: 2026-03-17T10:20:00Z
updated: 2026-03-17T10:26:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Comparison Table on Desktop
expected: A comparison section is visible between Features and HowItWorks. On desktop, it shows a table with 5 products (Dictus + 4 competitors) across 6 dimensions. The Dictus column is visually highlighted with an accent border/glow. The table header is sticky below the nav when scrolling. Rows animate in with a stagger effect on scroll.
result: pass

### 2. Comparison Cards on Mobile
expected: On mobile viewport, the table is replaced by a card stack. The Dictus card is always expanded showing all features. Competitor cards are collapsed and can be tapped to expand/collapse with a smooth height animation.
result: pass

### 3. Comparison Bilingual Content
expected: Switch between /fr and /en routes. All comparison text (product names, prices, platform labels) appears correctly in both French and English.
result: pass

### 4. Adaptive CTA — Coming Soon Fallback
expected: Without a TestFlight URL configured, the hero displays a "Coming Soon" badge (same as before the CTA was added). No broken links or empty states.
result: pass

### 5. Adaptive CTA — Desktop QR Code
expected: If NEXT_PUBLIC_TESTFLIGHT_URL is set, on desktop the hero shows a QR code (dark ink on white) with a TestFlight link below it. The QR code is scannable and leads to the TestFlight URL.
result: skipped

### 6. Adaptive CTA — iPhone Direct Button
expected: If NEXT_PUBLIC_TESTFLIGHT_URL is set, on an iPhone the hero shows a direct "Join TestFlight" button instead of a QR code. Tapping it opens the TestFlight link.
result: skipped

## Summary

total: 6
passed: 4
issues: 0
pending: 0
skipped: 2

## Gaps

[none yet]

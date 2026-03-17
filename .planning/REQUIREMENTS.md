# Requirements: dictus Landing Page

**Defined:** 2026-03-17
**Core Value:** Convaincre un visiteur en quelques secondes que dictus est l'alternative privacy-first a la dictation vocale, et lui donner envie de tester l'app.

## v1.2 Requirements

Requirements for milestone v1.2 Video & Compliance. Each maps to roadmap phases.

### App Store Compliance

- [ ] **COMP-01**: Page Privacy Policy bilingue FR/EN avec les 8+ sections exigees par Apple (accessible publiquement)
- [ ] **COMP-02**: Page Support bilingue FR/EN avec email de contact pierre@pivi.solutions
- [ ] **COMP-03**: Liens Privacy Policy et Support ajoutes dans le footer du site

### Remotion Demo Video

- [ ] **VID-01**: Workspace Remotion separe (subfolder `/remotion`) avec toolchain isolee du projet Next.js
- [ ] **VID-02**: Port fidele de la waveform canvas vers Remotion (30 barres, gradient center-weighted, 5 etats)
- [ ] **VID-03**: Mockup iPhone avec les scenes de demo (idle -> recording -> transcription -> smart mode -> insertion)
- [ ] **VID-04**: Animations iOS-native (spring animations, transitions fluides, feel iOS coherent avec l'app)
- [ ] **VID-05**: Rendu MP4 final optimise pour le web (h264, taille raisonnable)
- [ ] **VID-06**: Integration de la video sur le site via `<video>` natif avec lazy loading, sans regression Lighthouse

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Video Enhancements

- **VID-F01**: Video de presentation/lancement (differente de la demo)
- **VID-F02**: Versions localisees de la video (voix off / texte FR vs EN)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Remotion Player en production | Bundle +150-250kb, regression Lighthouse, video statique suffit |
| Video avec voix off | Complexite audio, pas necessaire pour une demo visuelle |
| Support portal / ticketing | mailto: + page simple suffit pour App Store |
| GDPR cookie banner | Zero cookies, zero tracking = pas de banner necessaire |
| Terms of Service page | Non exige par Apple pour v1, a considerer plus tard |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01 | — | Pending |
| COMP-02 | — | Pending |
| COMP-03 | — | Pending |
| VID-01 | — | Pending |
| VID-02 | — | Pending |
| VID-03 | — | Pending |
| VID-04 | — | Pending |
| VID-05 | — | Pending |
| VID-06 | — | Pending |

**Coverage:**
- v1.2 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9 ⚠️

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after initial definition*

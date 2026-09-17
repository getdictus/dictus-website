# Product captures for the issue #29 preview

These are authentic application screenshots. Their content has not been recreated,
retouched, translated, or composited with invented dictation text. Next.js Image
serves responsive, optimized derivatives; the checked-in sources remain unchanged.
The iPhone enclosure is CSS framing outside the screenshot.

## Desktop

- Files: `public/images/products/desktop-general-fr.jpg` and
  `public/images/products/desktop-general-en.jpg` (680 × 570, JPEG).
- Captured on **17 September 2026** from the installed **Dictus Desktop 0.3.0**
  macOS application with the native computer-use screenshot API.
- View: **Général / General**, with the genuine French and English interfaces,
  selected to match the website locale, showing the transcription shortcut,
  push-to-talk control, local Whisper Turbo model, and sound controls.
- The app window was raised for capture. Only the application's interface language
  was temporarily changed to English and then restored to French. No private
  history, documents, or microphone audio were captured.
- The screenshot API returned JPEG data. The `.jpg` extension reflects its actual
  format; it was not re-encoded. This is a macOS capture, not a claim that Windows
  and Linux have identical window chrome.
- French SHA-256: `b98139748c23a32a20c4f13ec5893642120f8c0c1603205649645c96b189f505`.
- English SHA-256: `1bcfc5b4bb3ff7b6879295b5187bbe82226a7315089f159320d842feb59a762b`.
- The previous `desktop-general.jpg` is retained as an unused source capture.

Version 0.3.0 was also the latest public release when checked:
<https://github.com/getdictus/dictus-desktop/releases/tag/v0.3.0>.
The screenshot version is provenance, not the source of truth for download links:
those continue to use the existing live release resolver.

The animated pill below the screenshot is a **web demonstration**, not a video
capture or a real microphone session. It ports the 300 × 84 pill, 84 × 84 cancel
control, 30 bars, native colours, speech envelope and transcription sine wave from
`src/overlay/RecordingOverlay.tsx`, `RecordingOverlay.css`, `src/tokens.css` and
`src/components/icons/CancelIcon.tsx` in the local Dictus Desktop worktree `46`
(HEAD `0a4cf549e136608f83a68f2b5700eb1579b00529`, inspected 17 September 2026).
The native geometry is uniformly scaled only when necessary to fit a narrow page.
The showcase supplies synthetic levels and cycles through listening,
transcribing and rest; it neither acquires microphone access nor promises a
transcription result. Its accessible label identifies the demonstration, with a
pause control, a static reduced-motion rendering and automatic suspension when
off-screen or in a hidden tab.

## iPhone

The approved prototype's three native captures are retained for this preview.
The current repository tree was checked on 17 September 2026 and contained no
newer corresponding source captures. These files were copied byte for byte from
`getdictus/dictus-ios`, commit
[`91a74a6e763b070f51063c6374eacc69cbaed150`](https://github.com/getdictus/dictus-ios/commit/91a74a6e763b070f51063c6374eacc69cbaed150),
committed on **12 June 2026**. Each source is 1290 × 2796 PNG. The commit date is
known; the precise date when the screenshots were taken is not recorded.

| Website asset | Repository source | SHA-256 |
| --- | --- | --- |
| `ios-notes-keyboard.png` | `assets/appstore/source/screen5-keyboard-qwerty.png` | `bae1ba7b985302faf45b59626a8127f5898072a9b7f81c6b06b6068ea2424dd8` |
| `ios-notes-dictation.png` | `assets/appstore/source/screen1-keyboard-dictating.png` | `afc8201874330491c060ad3223b2b23dc847e26db5308895b9dc42fdd82fdc7d` |
| `ios-home.png` | `assets/appstore/source/screen3-home.png` | `923ef4def57e16a3152f2f1e4b5d4442dbd059413d5ee3b94ddcc202ecdc26ee` |

These show the keyboard and recording state in Apple Notes and the Dictus home
screen. The note in the source captures is empty. They do **not** demonstrate a
completed dictation or establish that this is the latest iOS interface. Both locales
preserve the real English iOS interface; the French alt text identifies that
language. Desktop uses separate genuine French and English captures.

## Final capture gate

**The current iPhone assets are preview assets, not final production approval.**
Before issue #29 is approved for production, capture a fresh sequence on a current
Dictus iOS build: the native keyboard in a real app, a real recording, and the
resulting text actually inserted by Dictus. Use a non-sensitive example spoken for
this purpose; do not simulate the result by typing text onto a screenshot. Include
a recent Dictus home screen and record the app build, device, locale, capture date,
source filenames, and hashes here. Replace these June assets after visual review.

The current Desktop scene combines genuine localized settings screenshots with
the explicitly illustrative native pill animation documented above. It is not
an end-to-end dictation recording.

# Product captures for the issue #29 preview

These are authentic application screenshots. Their content has not been recreated,
retouched, translated, or composited with invented dictation text. Next.js Image
serves responsive, optimized derivatives; the checked-in sources remain unchanged.
The iPhone enclosure is CSS framing outside the screenshot.

## Desktop

- File: `public/images/products/desktop-general.jpg` (680 × 570, JPEG).
- Captured on **17 September 2026** from the installed **Dictus Desktop 0.3.0**
  macOS application with the native computer-use screenshot API.
- View: **Général**, French interface, showing the transcription shortcut,
  push-to-talk control, local Whisper Turbo model, and sound controls.
- The app window was raised for capture. No settings were changed and no private
  history, documents, or microphone audio were captured.
- The screenshot API returned JPEG data. The `.jpg` extension reflects its actual
  format; it was not re-encoded. This is a macOS capture, not a claim that Windows
  and Linux have identical window chrome.
- SHA-256: `d315d54f5fcb64cd6edcca94d148ec2319a2cc9a768d822e9da5092e1374026b`.

Version 0.3.0 was also the latest public release when checked:
<https://github.com/getdictus/dictus-desktop/releases/tag/v0.3.0>.
The screenshot version is provenance, not the source of truth for download links:
those continue to use the existing live release resolver.

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
language. The Desktop capture is a French interface.

## Final capture gate

**The current iPhone assets are preview assets, not final production approval.**
Before issue #29 is approved for production, capture a fresh sequence on a current
Dictus iOS build: the native keyboard in a real app, a real recording, and the
resulting text actually inserted by Dictus. Use a non-sensitive example spoken for
this purpose; do not simulate the result by typing text onto a screenshot. Include
a recent Dictus home screen and record the app build, device, locale, capture date,
source filenames, and hashes here. Replace these June assets after visual review.

The current Desktop scene demonstrates the genuine settings interface. It is not
an animated recording or an end-to-end dictation demonstration. A recorded Desktop
sequence may improve a later iteration, but no such recording is claimed here.

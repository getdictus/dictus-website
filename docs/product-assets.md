# Product captures for the issue #29 preview

These are authentic application captures. Their content has not been recreated,
retouched, translated, or composited with invented dictation text. Next.js Image
serves responsive, optimized screenshot derivatives. The iPhone recording is
resized and its opening is accelerated as documented below; the enclosure is CSS
framing outside the native recording.

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
static reduced-motion rendering and automatic suspension when off-screen or in a
hidden tab.

## iPhone

The preview now uses the user's **18 September 2026** iPhone screen recording,
supplied as `ScreenRecording_09-18-2026 09-01-14_1.mp4`. Its metadata records
`2026-09-18T07:01:14Z` (09:01:14 in Europe/Paris). The recording contains the native
keyboard in Apple Notes, typing, a real dictation and its inserted result, then
the transition to Dictus and a visit to its screens. The English interface and
all recorded text are preserved in both website locales; surrounding descriptions
and playback controls are localized.

- Original: HEVC, 1290 × 2796, 37.775 seconds, variable frame rate near 60 fps,
  with an AAC audio track; 11,365,756 bytes. The original remains in the supplied
  attachment, outside the website's public assets.
- Original SHA-256:
  `fb718689cb745c3ea4b604c0b3478dbf1190dc403928505e8f8db4e3f6a8c593`.
- App version/build: **not provided**; device model: **not provided**. Neither is
  established by the recording metadata. Interface language: English.
- Website video: `public/videos/products/ios-demo.mp4`, H.264, yuv420p,
  860 × 1864, constant 60 fps, 31.450000 seconds, 1,354,844 bytes, **no audio track**.
  The MP4's `moov` atom precedes its media data for progressive playback.
- Video SHA-256:
  `4d210402ba2ed7c6e70e7141d8e08d0618cee05003896da1e614b439d9d637f8`.
- Only timing, resolution, codec and audio availability change: source 0–19 s
  runs at 1.5× speed, then source 19–37.775 s runs at its original speed. No frames
  are composited, interfaces translated, or native transitions replaced. Frame
  rate conversion rounds the expected 31.441667 s duration to 31.450000 s.
- Chapter cues in the edited video are **0 s (keyboard)**, **12.666667 s (dictation)**
  and **22.166667 s (app)**; keyframes are forced at all three cues. The original native
  opening animation remains at the start of the video.

The continuous recording loops while its section is visible, with the three
chapter tabs following the playback position, including the return to the keyboard.
On large screens, the iPhone frame enters and docks as the page scrolls; playback
starts after that arrangement settles. Scrolling never seeks the recording.
The MP4 stays unloaded on the initial Hero view and becomes eligible for preload
as the visitor enters the iPhone section. Direct `#iphone` links and keyboard
focus skip the introduction; smaller screens use the regular document flow.
Hidden and offscreen playback stops, preserving its position for the return.
There is no visible Pause control or playback note. Reduced-motion users see the
posters until they explicitly start playback; a Play-only fallback also appears
if the browser refuses autoplay. It disappears once playback is allowed.

The three fallback posters are authentic frames extracted from the same source,
resized to 860 × 1864 JPEG. The keyboard poster uses 2 s because the source's
first frame is an empty Notes page before the keyboard appears. Poster timestamps
identify representative stills, not chapter seek targets.

| Website asset | Original timestamp | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `ios-demo-keyboard.jpg` | 2 s | 88,492 | `e3233f9eb4ca0bd6b8391791d0b5bb1b1813d8ba87916d3650a8a9ff26ebbdd9` |
| `ios-demo-dictation.jpg` | 22.5 s | 85,475 | `5d05229c297d67d5c6cdfbecf247c94fa2528142db6024400e2e22e39b34697d` |
| `ios-demo-app.jpg` | 36.5 s | 76,419 | `3a92b53986ef79c6849cf437ff5283958567c16077b60932d641009c391bbcc9` |

### Reproducing the derivatives

With FFmpeg installed, run these commands from the repository root, placing the
original recording at the path assigned to `dictus_recording`. FFmpeg is an asset
preparation tool, not a runtime or npm dependency. Use a fresh destination or
confirm replacement of existing derivatives when prompted.

```sh
dictus_recording="/path/to/ScreenRecording_09-18-2026 09-01-14_1.mp4"
mkdir -p public/videos/products
ffmpeg -i "$dictus_recording" -map 0:v:0 \
  -vf "setpts=PTS-STARTPTS,setpts='if(lt(PTS*TB,19),PTS/1.5,PTS-(19-19/1.5)/TB)',fps=60,scale=860:1864:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset medium -crf 23 -force_key_frames '0,12.6666667,22.1666667' \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -an -sn -dn -map_metadata -1 -movflags +faststart \
  public/videos/products/ios-demo.mp4

for dictus_poster in keyboard:2 dictation:22.5 app:36.5; do
  ffmpeg -ss "${dictus_poster#*:}" -i "$dictus_recording" -map 0:v:0 \
    -frames:v 1 -vf 'scale=860:1864:flags=lanczos' -q:v 2 -update 1 \
    "public/images/products/ios-demo-${dictus_poster%%:*}.jpg"
done
```

### Retained prototype captures

The previous three native PNGs are retained as unused source assets. They were
copied byte for byte from
`getdictus/dictus-ios`, commit
[`91a74a6e763b070f51063c6374eacc69cbaed150`](https://github.com/getdictus/dictus-ios/commit/91a74a6e763b070f51063c6374eacc69cbaed150),
committed on **12 June 2026**. Each source is 1290 × 2796 PNG. The commit date is
known; the precise date when the screenshots were taken is not recorded.

| Website asset | Repository source | SHA-256 |
| --- | --- | --- |
| `ios-notes-keyboard.png` | `assets/appstore/source/screen5-keyboard-qwerty.png` | `bae1ba7b985302faf45b59626a8127f5898072a9b7f81c6b06b6068ea2424dd8` |
| `ios-notes-dictation.png` | `assets/appstore/source/screen1-keyboard-dictating.png` | `afc8201874330491c060ad3223b2b23dc847e26db5308895b9dc42fdd82fdc7d` |
| `ios-home.png` | `assets/appstore/source/screen3-home.png` | `923ef4def57e16a3152f2f1e4b5d4442dbd059413d5ee3b94ddcc202ecdc26ee` |

These older captures show the keyboard and recording state in Apple Notes and
the Dictus home screen. Their empty note does not demonstrate completed dictation.
They are superseded in the preview by the September recording and its posters.

## Final capture gate

The fresh iPhone sequence requested for issue #29 has been supplied and replaces
the June preview captures. Its recording, genuine dictation result, native
transitions and extracted posters are ready for visual review in the website
preview. The app build and exact device model remain explicitly unrecorded above;
do not infer them from screen dimensions. This integration does not itself approve
production deployment.

The current Desktop scene combines genuine localized settings screenshots with
the explicitly illustrative native pill animation documented above. It is not
an end-to-end dictation recording.

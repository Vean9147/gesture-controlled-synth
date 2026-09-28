# ✋🎹 Gesture Synth

A VS Code extension that turns your webcam into a chord instrument. Hold up fingers, and the number you show picks the chord. Play progressions like I – V – vi – IV with nothing but your hands.

Hand tracking is done in the browser with [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker), and the sound is generated live with the Web Audio API. There are no samples and no build step, and the extension has no npm dependencies.

## Features

- **Finger-count chords.** The total number of fingers up (both hands, thumbs included) selects a chord from the current major key.
- **Roman-numeral display.** The active numeral (I, ii, iii, IV, V, vi, vii°) is highlighted on screen and shown large in the corner.
- **Live waveform.** A glowing line at the bottom of the screen shows the output waveform.
- **Key selector.** Play in C, G, F, D, A or E major.
- **Synth pad sound.** Layered detuned sawtooth waves plus a sine bass note, with a lowpass filter, reverb and smooth fades between chords.
- **Debounced detection.** A chord only changes after the finger count has been stable for a few frames, so flickers don't cause wrong chords.

## How it works

```
VS Code extension  ──starts──▶  local HTTP server (localhost:5757)
                                        │
                                        ▼  opens in your browser
                      media/index.html (webcam + MediaPipe + Web Audio)
```

VS Code webviews don't allow camera access, so the extension serves the page from a small local server and opens it in your default browser. `localhost` counts as a secure context, so the browser will let the page use your camera. Nothing is uploaded, and the video stays on your machine.

## Requirements

- [VS Code](https://code.visualstudio.com/) 1.80 or newer
- A webcam
- A modern browser (Chrome or Edge recommended)
- An internet connection. MediaPipe is loaded from the jsDelivr CDN.

## Quick start

1. Clone or download this repo and open the folder in VS Code.
2. Press **F5** to open an Extension Development Host window.
3. In the new window, click **Gesture Synth** in the status bar (bottom right), or run **Gesture Synth: Start** from the Command Palette (`Ctrl/Cmd+Shift+P`).
4. Your browser opens at `http://localhost:5757`. Click **Start camera & sound** and allow camera access.
5. Hold up fingers and play.

To stop, run **Gesture Synth: Stop** from the Command Palette or close the Extension Development Host window.

### Install permanently (optional)

```bash
npx @vscode/vsce package
```

Then in VS Code open **Extensions → ⋯ → Install from VSIX…** and select the generated `.vsix` file.

## Controls

Count the fingers you hold up on both hands. The thumb counts, and the total picks the chord.

| Fingers | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Chord | I | ii | iii | IV | V | vi | vii° | I ↑ | ii ↑ | iii ↑ |

`↑` means the same chord one octave higher. Lower your hands (0 fingers) to silence the sound.

In C major, that gives: I = C, ii = Dm, iii = Em, IV = F, V = G, vi = Am, vii° = B°.

## Example progressions

Set the key with the dropdown, then play the numbers.

| Progression | Fingers | In C major |
|---|---|---|
| I – V – vi – IV | 1 – 5 – 6 – 4 | C – G – Am – F |
| I – V – IV – I | 1 – 5 – 4 – 1 | C – G – F – C |
| vi – V – IV – I | 6 – 5 – 4 – 1 | Am – G – F – C |
| I – IV – V | 1 – 4 – 5 | C – F – G |

Tip: use one hand for the main shape and the other only for the extra finger, so going from 5 to 6 is a single finger moving.

## Project structure

```
gesture-synth/
├── package.json        # extension manifest and commands
├── extension.js        # status bar item, commands, local server
├── media/
│   └── index.html      # webcam, hand tracking, finger counting, audio, UI
└── .vscode/
    └── launch.json     # F5 launch config
```

## Configuration and tuning

All tuning lives in `media/index.html`.

| What | Where | Notes |
|---|---|---|
| Chord change speed | `stable >= 4` in `onResults` | Lower is more responsive, higher is steadier |
| Finger sensitivity | `* 1.05` in `fingersUp()` | Raise if folded fingers are counted as up |
| Sound | `playChord()` | Oscillator types, detune, filter cutoff, volumes |
| Reverb and master volume | `initAudio()` | |
| Available keys | `<select id="key">` | Add options with a semitone offset from C |
| Server port | `extension.js` | Defaults to `5757`, with a random-port fallback |

## Troubleshooting

- **Status bar item is missing.** It appears in the Extension Development Host window, not in your original one.
- **F5 does nothing.** Make sure you opened the `gesture-synth` folder itself, not its parent.
- **No sound.** Browsers only allow audio after a click, so click **Start camera & sound**. Also check your system volume.
- **Camera blocked.** Click the camera icon in the address bar and allow access, and make sure no other app is using the webcam.
- **Wrong finger count.** Improve the lighting, keep your whole hand in frame, and try holding your hands a little further back. Thumbs are the hardest to detect.
- **Port in use.** The extension automatically falls back to a random free port and opens that one.

## Limitations

- Only diatonic major-key triads are supported, so there are no 7ths, no borrowed chords such as bVII, and no minor keys.
- Detection works best with an upright hand facing the camera.
- MediaPipe is loaded from a CDN, so the page needs internet access on first load.

## Roadmap ideas

- A modifier gesture (for example a fist) to add 7ths or borrowed chords
- A melody mode where finger count plays single notes
- Minor keys and more scales
- MIDI output so you can drive your DAW
- Looping and recording

## Tech stack

- [VS Code Extension API](https://code.visualstudio.com/api)
- [MediaPipe Hands](https://developers.google.com/mediapipe) for hand landmark tracking
- Web Audio API for synthesis, effects and the waveform visualiser
- Node's built-in `http` module for the local server

## Contributing

Issues and pull requests are welcome. If you're fixing gesture detection, please describe the hand pose and lighting conditions in the issue.



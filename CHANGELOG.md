# Changelog

## 0.4.1 — feedback in plain English

- New automatic Thai-to-romanization (`src/lib/romanize.ts`): syllables, clusters, pre-posed vowels, finals and tones via the tone-rule engine. Tested on all app vocabulary (`npm run test:roman`).
- Word check no longer shows raw Thai. "I heard something like “hát-dtôei”", then up to 3 plain-English tips per syllable (start sound, vowel, ending, tone), most important first. "Close!" gives one fix; a match says "Correct! That sounded like “phàt-thai”."
- Any Thai in notes, hints, particle notes, letter quiz and review is followed by its romanization.
- Smoke test fails on any Thai in feedback that has no romanization next to it.

## 0.4.0 — 2026-10-08

Collin's real iPhone results on 0.3.1 (Chrome for iOS, then Safari):
- The word check said "didn't hear any words" every time, even with Dictation on and the Thai keyboard added.
- In Chrome, the tone check drew a perfectly flat high line on syllable 1 and a spike on syllable 2.
- In Safari, the tone check drew no line and the mic bar stayed empty.

**Causes**
- **Word check:** the Grok version Collin used first did **not** use the browser's speech recognition. It sent the recording to a server for transcription, which is why Say it "worked before". Our static copy uses iOS WebKit's `webkitSpeechRecognition` for Thai. On his iPhone it ends without ever returning a result, in Safari and in Chrome alike (all iPhone browsers are WebKit). The recognition settings were the same in 0.2.0 and 0.3.1, so no settings change broke it.
- **Flat line:** the pitch tracker read steady background sound (hum or noise) as a voice, once the recording was normalized and the thresholds loosened. The syllable splitter also put a short noise run in as syllable 1, and the chart stretched whatever few frames it had across the whole syllable. A handful of identical values showed up as a long, perfectly flat line.
- **No audio in Safari:** 0.3.1 asked for the mic with echo cancellation, noise suppression and auto-gain off. On iPhone that can give very quiet or empty input. It also relied on the Web Audio tap first, with MediaRecorder only as a fallback.

**What changed**
- **On iPhone, Say it records you once and checks both words and tones from that one recording.** Speech recognition is never used on iPhone or iPad.
  - The word check is on-device Whisper base (Transformers.js in a Web Worker, single-threaded WASM, ~80 MB). It asks once before the download and is cached afterwards. There is no server and no key, and the audio stays on the phone.
  - If Whisper answers in Latin letters ("Pang!"), the answer is compared with the romanization and can be judged "Close" at most.
- **On desktop, Say it still uses the browser's speech recognition.**
  - `interimResults` is now on, and the last interim result counts if no final one arrives.
  - After two empty results in a row it switches to the record-and-transcribe path for the session.
- **Recorder**
  - The mic is opened with the browser defaults (`audio: true`).
  - MediaRecorder (audio/mp4 on iOS, recorded as one blob) is the main source. The Web Audio tap is the fallback.
  - The live meter reads from an AnalyserNode. Diagnostics now show the meter peak, the transcriber and the transcript.
- **Pitch**
  - **Voicing gate:** a frame counts only if it is above 12% of the loud part **and** above 3× the noise floor, so hum is no longer read as voice. YIN uses 0.15, or 0.25 on loud frames only.
  - **Spikes:** values more than 4 semitones from the local median are dropped, and so are jumps over 5 semitones between frames.
  - **Syllables** are split by energy peaks and voicing gaps, not equal time slices.
  - **Shape** is judged on the 10–30% vs 75–95% parts of each syllable, so the normal drop at the end of a word isn't read as a falling tone.
  - **Leniency:** a gentle fall that doesn't start high counts as low on short dead syllables (phàt, phèt), and a rise with no dip counts as high.
- **Chart:** only voiced frames are drawn, at their real position, with gaps left as gaps. With fewer than 5 voiced frames (50 ms) it says, for example, "I couldn't hear a clear pitch on syllable 1 (phàt). Say it a bit louder and longer." instead of judging.
- **Tests**
  - `scripts/fetch-thai-audio.sh` makes real Thai speech for local tests (Google TTS plus pink noise and hum; not committed).
  - `mic-test.mjs` covers the iPhone record-once flow, the download consent, Latin transcripts, interim-only results, the switch after two empty results, and real "phàt thai" with hum. `REAL_ASR=1` runs the real Whisper model.
  - `webkit-test.mjs` covers the iPhone flow in WebKit, including real Thai speech.

## 0.3.1 — 2026-10-08

**Fixes a regression from 0.3.0: Say it stopped hearing Collin on his phone.** In 0.2.0 Say it worked, and his mic is fine.

**Cause:** in 0.3.0 one tap started speech recognition and, in the same moment, opened a second recording through `getUserMedia` and an AudioContext for the tone check. On iPhone Safari the recording takes over the mic and recognition gets silence. It then ends with no result, so nothing he said registered. 0.3.0's auto-stop also stopped recognition after a short pause.

**What changed**
- **Say it is the 0.2.0 word check again.** Speech recognition (th-TH) runs alone. No `getUserMedia` and no AudioContext are opened. Tap Say it, speak, tap Stop.
  - The 0.3.0 English messages for every ending are kept: no result, no speech, not allowed (with the Dictation hint), network, and Thai unsupported.
  - A 15-second safety timeout ends the attempt if the browser never ends the session.
- **The tone check is its own step: Check my tones.** It has a fixed-size button in the Tone check section.
  - The two can never hold the mic together. Check my tones is disabled while Say it listens, and Say it is disabled while recording. Starting one aborts the other.
  - If the browser has no speech recognition, Say it runs the tone check instead.
- Tone recorder hardening:
  - The AudioContext is created and resumed inside the tap, with a silent-buffer unlock for iOS.
  - A MediaRecorder (audio/mp4 on iOS) records in parallel. If the Web Audio feed comes back all zeros (suspended context, sample-rate mismatch), the recorded file is decoded and used instead.
  - Echo cancellation and noise suppression are off, so the pitch isn't filtered.
- **Silent mic** gets its own English message with steps: "I got no sound from your mic…".
- **Live Mic level meter** while recording. It uses a log scale so quiet phone mics still move it, and has a fixed size.
- **Quiet and short speech:**
  - The voicing gate is now relative to the loud part of the recording, so one click can't silence the voice.
  - The recording is normalized before analysis, and the YIN thresholds are looser.
  - A 0.15 s word and a −46 dB recording now both get a verdict.
- **Diagnostics:** a small "Mic trouble?" link opens a panel to screenshot or copy. It shows the browser, speech recognition, word-check mode, AudioContext state at tap / after mic / at stop, sample rates, capture path, peak and average level, recording length, voice found, pitch, and the last mic and word-check errors.
- Tests:
  - `npm run test:mic` (headless Chrome with a fake mic, iPhone user agent). It checks that recognition never starts during recording, that Say it runs recognition alone, the MediaRecorder fallback, an all-zero mic, a quiet mic, a very short word, and the diagnostics.
  - `npm run test:webkit` is new: Playwright WebKit with an iPhone 13 profile and a synthetic mic stream. It checks that Say it never calls `getUserMedia`, and that the falling, rising and level tones, the ScriptProcessor path and the silent-mic message all work.

## 0.3.0 — 2026-10-08

Collin reported that on his phone Say it was "not giving feedback on how I pronounce words".

**Why it went quiet**
- Say it was **hidden completely** when the browser had no speech recognition.
- When recognition ended with no result and no error, the app **reset without a word**. iPhone Safari does this often: you stop too soon, Dictation is off, or Thai isn't available.
- `network`, `aborted` and `audio-capture` errors gave a generic message or none at all.
- The only check was speech-to-text, which checks the **words** and not the **tones**. Even when it worked it couldn't tell you how you pronounced something.

**What's new**
- **Tone check (REVIEW.md Prompt 7).** Say it now records you with the microphone and analyses your pitch on the phone itself. No speech service is needed.
  - Pitch is estimated with YIN (75–400 Hz, 10 ms steps) and cleaned up. Your voice is split into the target's syllables.
  - Each syllable is classified as falling, rising or level. Once the app has heard your normal voice three times, it also tells mid, low and high apart. Lines of three or more syllables use their own average as the reference.
  - Your curve is drawn in green over the grey target tone shapes for each syllable.
  - Feedback is in English, for example: "Syllable 2 (níi) should stay high, with only a small dip at the very end. Yours rose by about 8 semitones."
  - Recording uses AudioWorklet, with a ScriptProcessor fallback for older Safari. It stops on its own after a pause, or when you tap Stop.
  - Your recent pitch medians are saved in `baan.v1` as `pitchMedians`.
- **Word check (speech recognition) never fails silently.** Every outcome ends in an English message: no recognition in this browser, no result, no speech, not allowed (with the iPhone Dictation setting), network, Thai not supported, mic busy, and timeout.
  - What was heard is shown as Thai, plus romanization and English when the app knows the word, next to the target.
  - Microphone problems (blocked, missing, busy, not https) get their own English message, with the iPhone Safari steps.
- Layout: there is still one fixed-size Say it / Stop button. The status line, word check, chart and tone feedback all have fixed heights, so nothing moves while recording or when results arrive.
- Tests:
  - `npm run test:pitch` runs unit tests on synthetic voices.
  - `npm run test:mic` makes WAVs with numpy and runs headless Chrome with a fake microphone at 360 px. It checks falling, rising and level, mid and low with a baseline, two syllables, the ScriptProcessor fallback, no recognition, network error, iOS-style empty end, mic denied, silence, and wrong words. It also checks that nothing shifts.
  - The smoke test now runs at 375 px with a fake mic.

## 0.2.0 — 2026-10-08

Changes Collin asked for after using the Grok version:

- **"Say it" no longer jumps around.** It's one button with a fixed size that switches between *Say it* and *Stop*. The old version added a second button and a full-screen overlay. The result area below it has a fixed height, so nothing on the page moves when recording starts or the result comes in. The headless test measures this; the button and the content below it stay in the same place.
- **English is always shown.**
  - Scene lines always show their English. The *Meaning* button and the *English* toggle are gone.
  - Review cards show the English in both directions. In From English mode the Thai is still the hidden answer until you tap Show.
  - Every option in the tone trainer has its English, and the phrase quiz shows the English for the line and the marked word.
  - Onboarding, the Path header and the letter names now have romanization and English.
- **Every correction is in English and shows the full answer.** The answer always includes Thai, romanization and English meaning.
  - Drills say "Correct." or "Not quite.", show what you chose (with its meaning if it was Thai), then "The right answer is:" with Thai, romanization and English.
  - Say it says "Not quite. I heard: …" and then "The line is:" with Thai, romanization and English.
  - The tone trainer, phrase quiz, Ear quiz and letter-class quiz all give English sentences. Examples: "You picked คา (khaa, "stuck", mid tone). The word was ข่า (khàa, "galangal", low tone)." and "Not quite. You picked high; ข is a high-class letter. Its name: ขอ ไข่ khǎw khài, ข as in "egg"."
  - The old "That stayed." / "Not this time." wording is gone.
- New data: `src/data/glossary.ts` holds English for every drill option, so wrong picks can be explained. Every consonant now has a romanized name and its English (`chantRoman`, `chantEn`).
- ไก่ is now romanized `gài`, matching the app's g-for-ก convention.
- `scripts/smoke.mjs` checks all three requirements in headless Chrome, using a fake speech recognizer.

## 0.1.0 — 2026-10-08

First version of our own copy, replacing the Grok-hosted app. It's a static site with no server.

- **Port.** Vite + React 19 + TypeScript + Tailwind 4. All scenes, vocab, lines, drills, tone and letter data were extracted unchanged from the deployed bundle into `src/data/*.ts`. Same look: Noto Sans Thai / Noto Serif Thai and the same colors. Same progress format in localStorage (`baan.v1`), so saved progress has the same shape. The only additions are the new fields `toneStats` and `pairBest`.
- **Audio** still uses the browser voice (`speechSynthesis`, th-TH), at normal speed 0.9 and slow 0.68.
- **Say it** uses the browser's own speech recognition (th-TH) instead of the Grok server. It's hidden in browsers that don't have it, such as Firefox. Matching uses the same fuzzy word match as before.
- **Thai content fixes** (REVIEW.md Prompt 1):
  - ขึ้น is falling (khûen).
  - เผ็ด is low (phèt), including in the Ear quiz pool. ม้า was added to the pool.
  - ที่นี่ is falling, falling.
  - The customer says คนเดียว, not ท่านเดียว.
  - ป่า is romanized bpàa.
  - The example for ห is now ห้า, with a note on silent ห.
  - Notes added for ลาก่อน and นะคะ, and hints that ไหม and ฉัน are usually said high.
  - The market seller's opener is now ดูอะไรครับ.
- **Minimal-pair tone trainer** (Prompt 2):
  - 11 sets of words that differ only in tone, covering all 10 tone pairs.
  - Two drills: "Which word?" (2–3 options) and "Same or different?".
  - The voice speed changes between plays, and the voice switches when more than one Thai voice is installed.
  - It keeps a score for each tone pair, gives 60% of trials to your two weakest pairs, shows your weakest pair and a 5×5 grid, and runs 20 trials per session.
- **Tones inside phrases.** Hear a scene line and name the tone of the highlighted word. Words are split with `Intl.Segmenter`, and the quiz is hidden where that isn't supported.
- **Review fix.** In From English mode, the Hear button and the Say it prompt no longer give the Thai answer away before Show.
- **Housekeeping**:
  - URLs use `#/path`, `#/scene/<id>`, `#/tones`, `#/letters`, `#/review` and `#/settings`, so reload and the Back button work.
  - A scene in progress survives a reload (saved in sessionStorage).
  - Drill options and build tiles are shuffled every time.
  - The web app manifest is named "Baan".
- `npm run check:data` checks the Thai data. `npm run smoke` runs a headless test of every screen.

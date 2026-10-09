# Roadmap

Spec: `/workspace/baan/REVIEW.md` (sections 2–4). Status as of 2026-10-08.

| # | Item | Status |
|---|------|--------|
| 1 | Thai content fixes (Prompt 1) | ✅ Done in 0.1.0 |
| 2 | Minimal-pair tone ear trainer with confusion tracking (Prompt 2) | ✅ Done in 0.1.0, including tones inside phrases |
| — | Review answer leak in From English mode | ✅ Done in 0.1.0 |
| — | Hash routes, random option order, manifest named "Baan", scene progress survives reload | ✅ Done in 0.1.0 |
| — | Collin's requests: stable Say it button, English always shown, English feedback with the full answer | ✅ Done in 0.2.0 |
| 3 | Review as a real SRS: listen, read and produce cards for words **and** sentences; drill misses feed Review; Hard button; ±10% interval fuzz; relearning step; mixed order; "N due · M new today · X learned" | ⏳ Next |
| 4 | Numbers and prices trainer (hear a price → type it; say a price; Thai digits ๑–๙) | ⏳ Planned |
| 5 | Reliable audio: pre-generated or server text-to-speech with a cache and male/female voices, falling back to speechSynthesis | ⏳ Planned. Needs a TTS source: either recordings committed to `public/audio` at build time, or a small server. The static build can't make speech on its own. |
| 6 | "Today" daily session (~12 min mix), daily goal, streak only counts when the goal is met, 7-day dots | ⏳ Planned |
| 7 | Tone production feedback: your pitch curve against the target tone shape (YIN pitch tracking + AudioWorklet) | ✅ Done in 0.3.0. Since 0.3.1 it is a separate "Check my tones" step that never shares the mic with Say it. Tested with synthetic voices only; still needs tuning against real recordings of Collin and a native speaker. |
| 8 | Reading: sound-out-the-word quiz, vowel quiz, romanization fades once a word is learned. Content: 4 new scenes (7-Eleven, BTS/MRT, Lost, Massage/pharmacy) plus short listening stories | ⏳ Planned |
| — | Stable public hosting | ✅ GitHub Pages: https://kaskel87-a11y.github.io/baan/ (`./deploy.sh`) |
| — | Word check without the browser's speech recognition (Firefox, and iPhones with Dictation off): server or WASM speech-to-text. Say it still shows there; the tone check works and the word check explains why it is off. | 💤 Later |
| — | Tone check tuning on real voices: high tone often rises in modern Bangkok speech, creaky low tones, and syllable splitting on fast speech | ⏳ Next, needs recordings from a real phone |
| — | Move progress to IndexedDB and add export/import, so progress isn't tied to one browser | 💤 Later |

Content to re-check with a native speaker: the new minimal sets in `src/data/toneSets.ts`, the letter-name romanizations (`chantRoman`), and the glosses in `src/data/glossary.ts`.

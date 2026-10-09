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
| 7 | Tone production feedback: your pitch curve against the target tone shape (YIN pitch tracking + AudioWorklet) | ⏳ Planned |
| 8 | Reading: sound-out-the-word quiz, vowel quiz, romanization fades once a word is learned. Content: 4 new scenes (7-Eleven, BTS/MRT, Lost, Massage/pharmacy) plus short listening stories | ⏳ Planned |
| — | Stable public hosting: a permanent URL instead of a quick tunnel, e.g. GitHub Pages or Cloudflare Pages (`dist/` is plain static files) | ⏳ Needs a decision. See "Hosting" in README. |
| — | Say it on Firefox: it has no SpeechRecognition, so Say it is hidden there. A server or WASM speech-to-text would fix that. | 💤 Later |
| — | Move progress to IndexedDB and add export/import, so progress isn't tied to one browser | 💤 Later |

Content to re-check with a native speaker: the new minimal sets in `src/data/toneSets.ts`, the letter-name romanizations (`chantRoman`), and the glosses in `src/data/glossary.ts`.

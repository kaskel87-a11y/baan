# Roadmap

Spec: `/workspace/baan/REVIEW.md` (sections 2–4). Status as of 2026-10-20 (0.27.0). Babbel research: `docs/BABBEL-NOTES.md`.

**Priority (Collin, 2026-10-15): speaking and listening first. No reading/writing quizzes. Letters stays as optional reference only. Romanization stays prominent and never fades.**

| # | Item | Status |
|---|------|--------|
| 1 | Thai content fixes (Prompt 1) | ✅ Done in 0.1.0 |
| 2 | Minimal-pair tone ear trainer with confusion tracking (Prompt 2) | ✅ Done in 0.1.0, including tones inside phrases |
| — | Review answer leak in From English mode | ✅ Done in 0.1.0 |
| — | Hash routes, random option order, manifest named "Baan", scene progress survives reload | ✅ Done in 0.1.0 |
| — | Collin's requests: stable Say it button, English always shown, English feedback with the full answer | ✅ Done in 0.2.0 |
| 3 | Review as a real SRS: listen, read and produce cards for words **and** sentences; drill misses feed Review; Hard button; ±10% interval fuzz; relearning step; mixed order; "N due · M new today · X learned" | ✅ Done in 0.5.0 |
| 4 | Numbers and prices trainer (hear a price → type it; say a price; Thai digits ๑–๙) | ✅ Done in 0.6.0 |
| 5 | Reliable audio: pre-generated or server text-to-speech with a cache and male/female voices, falling back to speechSynthesis | ⏳ Planned. Needs a TTS source: either recordings committed to `public/audio` at build time, or a small server. The static build can't make speech on its own. |
| 6 | "Today" daily session (~12 min mix), daily goal, streak only counts when the goal is met, 7-day dots | ✅ Done in 0.7.0. Resume is per step (a half-done review or tone round restarts that step). |
| 7 | Tone production feedback: your pitch curve against the target tone shape (YIN pitch tracking + AudioWorklet) | ✅ Done in 0.3.0. Since 0.3.1 it is a separate "Check my tones" step that never shares the mic with Say it. Tested with synthetic voices only; still needs tuning against real recordings of Collin and a native speaker. |
| 8 | Content: new scenes (7-Eleven, BTS/MRT, Lost, Massage/pharmacy, Small talk, Hotel check-in, Clothes shop, Street food stall, Laundry, Haircut, Phone shop) | ✅ 0.8.0–0.11.0, Small talk in 0.19.0, Hotel check-in in 0.20.0, Clothes shop in 0.21.0, Street food stall in 0.23.0, Laundry in 0.24.0, Haircut in 0.26.0, Phone shop in 0.27.0. Reading quizzes and romanization fading **dropped** (Collin doesn't want script). |
| — | Stable public hosting | ✅ GitHub Pages: https://kaskel87-a11y.github.io/baan/ (`./deploy.sh`) |
| — | Word check without the browser's speech recognition | ✅ 0.4.0: on-device Whisper base on iPhone, and as a fallback elsewhere. Thai accuracy on single words is only fair. **Decision pending:** a cloud speech-to-text service (needs an API key and a small proxy, e.g. a Cloudflare Worker, since keys can't ship in a static site) would be much more accurate. |
| — | Tone check tuning on real voices: high tone often rises in modern Bangkok speech, creaky low tones, and syllable splitting on fast speech | ⏳ Next, needs recordings from a real phone |
| — | Export/import so progress isn't tied to one browser | ✅ 0.18.0 (backup code, share, file; restore from Settings or the welcome screen). IndexedDB still later. |

Content to re-check with a native speaker: the tip cards in `src/data/tips.ts`, the new minimal sets in `src/data/toneSets.ts`, the letter-name romanizations (`chantRoman`), and the glosses in `src/data/glossary.ts`.

## Next, speaking & listening first (Babbel-inspired, merged)

| Priority | Item | Status |
|---|---|---|
| 1 | Role-play: speak your own lines in each scene, partner lines played aloud | ✅ 0.12.0 |
| — | Slow playback clearly slower on iPhone (rate 0.42, word by word) | ✅ 0.12.0 |
| 2 | Listen-and-respond: hear the partner's line (audio only), say or pick your reply; English shown after | ✅ Done in 0.13.0 |
| 3 | Listening stories: 30–60 s audio stories from scene words, English comprehension questions | ✅ 0.14.0 (4 stories), 5th story for Small talk/Hotel/Clothes shop in 0.22.0, 6th for Street food stall/Laundry in 0.25.0 |
| 4 | Shadowing / repeat-after-me mode: play a line, pause, you echo, with tone check | ✅ 0.15.0 (Check me + Hands-free) |
| 5 | Speaking-weighted Review: more say/listen cards, fewer read cards | ✅ 0.16.0 (3:2 say/listen mix, reading cards off by default, say-it-back on listen cards) |
| 6 | Tip cards (1–2 per scene): grammar-in-use and culture, all romanized with English | ✅ 0.17.0 (20 tips, shown under the line they explain, Say it on every example) |
| 7 | Reliable audio / real voices (old #5) | ⏳ needs a TTS source |
| 8 | Cloud speech-to-text for better word checks | ⏳ decision pending (cost, API key) |
| 9 | Tone check tuning on real voices | ⏳ needs recordings |
| 10 | Learning path by goal | 💤 Later (progress export/import ✅ 0.18.0) |

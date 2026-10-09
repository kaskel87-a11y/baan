# Changelog

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

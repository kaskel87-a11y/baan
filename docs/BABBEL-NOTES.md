# Babbel as a reference for Baan

Researched 2026-10-15. Collin's priority: **speaking and listening first**. He does not want to learn to read or write Thai script, so Babbel's writing/spelling exercises are deliberately left out. Romanization stays prominent and does not fade.

Sources:
- The Babbel Method: https://www.babbel.com/the-babbel-method
- Babbel's Mix of Pedagogical Approaches (white paper, PDF): https://assets.ctfassets.net/zuzqvf4m2o58/4wlnEeWseYvJ96Ax12pKw7/68ec739fd98c7e9e5f14d1880c2c4b7f/Babbels-Mix-of-Pedagogical-Approaches-for-Digital-Language-Learning.pdf
- How Babbel Gets You Speaking (PDF): https://assets.ctfassets.net/zuzqvf4m2o58/76xSiQpdcJfcuOsSgWcW43/06d2ffe7f03a8810c7840c25597e3a09/How-Babbel-gets-you-speaking.pdf
- Help Center, Babbel courses: https://support.babbel.com/hc/en-us/articles/205600448-Babbel-courses
- Help Center, Vocab workout (Review): https://support.babbel.com/hc/en-us/articles/205600228-Vocab-workout-Review

## What Babbel does, why it works, and where Baan stands

| Babbel idea | Why it works | Baan today | Gap / plan |
|---|---|---|---|
| **Real-life dialogues from lesson one.** Lessons are built around situations (ordering, directions) and you practice phrases inside a conversation. | You learn what to say in a situation, not lists of words. Recall is cued by context. | ✅ Every scene is a conversation (café, market, taxi, 7-Eleven, BTS…). | ✅ 0.12.0 adds **role-play**: you speak your own lines in order, with the partner's lines played to you. |
| **Short lessons, 10–15 min**, with ~7 new items at most. | Short, frequent study beats long, rare sessions. Working memory holds about 7 new items. | ✅ Scenes have 6–9 words; Today is ~12 min. | Keep new words per scene ≤ 7. |
| **Chunks, not single words.** "Could I have…" taught as a phrase. | You can use it immediately without learning the full grammar. | 🟡 Lines are chunks, but Preview introduces single words. | Preview could add 1–2 key chunks per scene. |
| **Grammar implicit first, then a short tip.** Structure appears in the dialogue, then a practical explanation. | Rules make sense after you've seen them in use. | 🟡 Per-line notes exist (tones, particles). | Add 1–2 **tip cards** per scene (e.g. "ไหม makes a yes/no question", "ครับ/ค่ะ politeness"). Speaking-focused, all romanized. |
| **Culture notes** (what's polite, natural). | Knowing what's natural builds confidence. | 🟡 Scattered in notes (ลาก่อน vs ไปก่อนนะ). | Short culture cards: wai, nicknames, เกรงใจ, bargaining etiquette. |
| **Varied exercises**: listening, speaking, matching, fill-in-the-gap, sentence building. | Meeting an item in several ways strengthens memory. | ✅ listen, pick, build, particle, Say it, tone check. | ✅ 0.13.0 adds **listen-and-respond**. Dialogue gap still open. Writing/spelling skipped by design. |
| **Review Manager with spaced repetition** (1, 4, 7, 14, 60 days, 6 months), four modes: flashcards, writing, speaking, listening. Mistakes from a lesson come back. | Moves items to long-term memory. | ✅ SRS with listen/read/say cards, misses due same day. | Make Review **speaking/listening-weighted** (fewer read cards). |
| **Speech recognition** in exercises. | Makes you open your mouth. | ✅ Say it (on-device Whisper) + Check my tones. | Accuracy is only fair; cloud speech-to-text is a pending decision. |
| **Unit recaps / end-of-lesson mistake review.** | Corrects errors while they are fresh. | ✅ "Hear these again" after drills. | Role-play summary now lists your lines with Hear. |
| **Babbel Live, podcasts, stories.** | Lots of comprehensible listening input, real voices. | ❌ | **Listening stories**: short audio-first stories from scene vocabulary, with comprehension questions in English. |
| **Learning paths by goal** (travel, work…). | Motivation stays tied to a reason. | 🟡 One Bangkok-day path. | Later: goal picker (travel, dating/friends, living there). |
| **Progress & motivation**: clear next step, streaks, goals. | No guessing what to do next. | ✅ Today session, daily goal, streak dots. | — |

## Takeaways for Baan
1. Teach inside real conversations, then make the learner **say their part** (shipped as role-play in 0.12.0).
2. Keep lessons short and new items few; recycle everything through spaced review.
3. Show a structure in use first, then give a one-line tip in plain English.
4. Lots of listening input with real-sounding audio; comprehension questions in English.
5. Vary the exercise, but for Collin every exercise should be audio or speech, never script-only.

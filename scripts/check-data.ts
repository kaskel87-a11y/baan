// Sanity checks for the Thai data: run with `npm run check:data`.
import { VOCAB, VOCAB_BY_ID } from "../src/data/vocab";
import { SCENES } from "../src/data/scenes";
import { STORIES } from "../src/data/stories";
import { TIPS } from "../src/data/tips";
import { EAR_POOL, MAI_SET, TONE_ANCHORS } from "../src/data/tones";
import { TONE_SETS } from "../src/data/toneSets";
import { toneFromRoman } from "../src/lib/thai";
import { AVAILABLE_PAIRS, makeTrial } from "../src/lib/toneTrainer";

let fail = 0;
const err = (m: string) => {
  fail++;
  console.error("✗", m);
};

for (const w of [...EAR_POOL, ...MAI_SET, ...TONE_ANCHORS, ...TONE_SETS.flatMap((s) => s.words)])
  if (toneFromRoman(w.roman) !== w.tone) err(`${w.thai} ${w.roman}: tone field ${w.tone} but roman says ${toneFromRoman(w.roman)}`);

for (const s of SCENES) for (const v of s.vocab) if (!VOCAB_BY_ID.has(v)) err(`scene ${s.id} missing vocab ${v}`);

const words = new Map<string, string>();
for (const v of VOCAB) words.set(v.thai, v.roman);
const must: [string, string][] = [["ขึ้น", "khûen"], ["เผ็ด", "phèt"], ["ที่นี่", "thîi-nîi"], ["ใกล้", "glâi"], ["เข้าใจ", "khâo-jai"]];
for (const [t, r] of must) if (words.get(t) !== r) err(`${t} should be ${r}, is ${words.get(t)}`);
if (JSON.stringify(SCENES).includes("ท่านเดียว")) err("ท่านเดียว still present");

const sceneIds = new Set(SCENES.map((s) => s.id));
if (JSON.stringify(SCENES).includes("sà-yaam")) err("สยาม should be sà-yǎam");
for (const st of STORIES) {
  for (const id of st.scenes) if (!sceneIds.has(id)) err(`story ${st.id} names unknown scene ${id}`);
  for (const x of st.sentences) if (!x.thai || !x.roman || !x.en) err(`story ${st.id} sentence missing thai/roman/en`);
  for (const q of st.questions) if (q.options.length < 3 || new Set(q.options).size !== q.options.length) err(`story ${st.id} question "${q.q}" needs 3+ distinct options`);
}

// Tip cards: every scene has 1–2 (culture/grammar), each anchored to a real line, every example has Thai, romanization, English.
const tipIds = new Set<string>();
for (const t of TIPS) {
  if (tipIds.has(t.id)) err(`duplicate tip id ${t.id}`);
  tipIds.add(t.id);
  const sc = SCENES.find((s) => s.id === t.sceneId);
  if (!sc) err(`tip ${t.id} names unknown scene ${t.sceneId}`);
  else if (!sc.lines.some((l) => l.id === t.afterLine)) err(`tip ${t.id} anchors to missing line ${t.afterLine}`);
  if (/[\u0E00-\u0E7F]/.test(t.title)) err(`tip ${t.id} title has Thai script; keep titles romanized`);
  if (!t.examples.length) err(`tip ${t.id} has no examples`);
  for (const ex of t.examples) {
    const both = (g: unknown) => (typeof g === "string" ? [g] : [(g as { male: string }).male, (g as { female: string }).female]);
    if (!ex.en || both(ex.thai).some((x) => !x) || both(ex.roman).some((x) => !x)) err(`tip ${t.id} example missing thai/roman/en`);
    if (both(ex.roman).some((x) => /[\u0E00-\u0E7F]/.test(x))) err(`tip ${t.id} romanization contains Thai script`);
  }
}
for (const s of SCENES) {
  const n = TIPS.filter((t) => t.sceneId === s.id).length;
  if (n < 1 || n > 2) err(`scene ${s.id} has ${n} tips (want 1–2)`);
}

if (AVAILABLE_PAIRS.length !== 10) err(`expected 10 tone pairs, got ${AVAILABLE_PAIRS.length}`);
for (let i = 0; i < 500; i++) {
  const t = makeTrial(i % 2 ? "which" : "same", {}, i);
  if (t.kind === "which") {
    const tones = t.options.map((o) => o.tone);
    if (new Set(tones).size !== tones.length) err(`which-trial offers two words with the same tone: ${t.options.map((o) => o.thai)}`);
    if (!t.options.includes(t.target)) err("target missing from options");
  } else if (t.same !== (t.first === t.second)) err("same flag mismatch");
}

console.log(fail ? `${fail} problem(s)` : `data OK: ${VOCAB.length} vocab, ${SCENES.length} scenes, ${TONE_SETS.length} minimal sets, ${EAR_POOL.length} ear words, ${TIPS.length} tips`);
process.exit(fail ? 1 : 0);

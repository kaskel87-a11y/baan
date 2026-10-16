// Sanity checks for the Thai data: run with `npm run check:data`.
import { VOCAB, VOCAB_BY_ID } from "../src/data/vocab";
import { SCENES } from "../src/data/scenes";
import { STORIES } from "../src/data/stories";
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

if (AVAILABLE_PAIRS.length !== 10) err(`expected 10 tone pairs, got ${AVAILABLE_PAIRS.length}`);
for (let i = 0; i < 500; i++) {
  const t = makeTrial(i % 2 ? "which" : "same", {}, i);
  if (t.kind === "which") {
    const tones = t.options.map((o) => o.tone);
    if (new Set(tones).size !== tones.length) err(`which-trial offers two words with the same tone: ${t.options.map((o) => o.thai)}`);
    if (!t.options.includes(t.target)) err("target missing from options");
  } else if (t.same !== (t.first === t.second)) err("same flag mismatch");
}

console.log(fail ? `${fail} problem(s)` : `data OK: ${VOCAB.length} vocab, ${SCENES.length} scenes, ${TONE_SETS.length} minimal sets, ${EAR_POOL.length} ear words`);
process.exit(fail ? 1 : 0);

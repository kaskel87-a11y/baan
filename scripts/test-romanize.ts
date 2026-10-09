// Romanizer vs. the app's hand-written romanization. `npm run test:roman`
import { VOCAB } from "../src/data/vocab";
import { EAR_POOL } from "../src/data/tones";
import { TONE_SETS } from "../src/data/toneSets";
import { romanize, thaiSyllables } from "../src/lib/romanize";
import { toneFromRoman } from "../src/lib/thai";

const rows = new Map<string, string>();
for (const v of VOCAB) rows.set(v.thai, v.roman);
for (const v of EAR_POOL) rows.set(v.thai, v.roman);
for (const s of TONE_SETS) for (const w of s.words) rows.set(w.thai, w.roman);

// spelling variants that are equally valid in the app's style
const norm = (s: string) =>
  s.normalize("NFC").toLowerCase().replace(/[\s-]+/g, "-").replace(/aaw$/g, "aw").replace(/(?<=[^a])aaw/g, "aw");
let exact = 0;
let toneOk = 0;
let sylCountOk = 0;
let total = 0;
const misses: string[] = [];
for (const [thai, roman] of rows) {
  total++;
  const got = romanize(thai);
  const tgt = roman.split(/[\s-]+/).filter(Boolean);
  const syl = thaiSyllables(thai);
  if (syl.length === tgt.length) sylCountOk++;
  const tonesMatch = syl.length === tgt.length && syl.every((s, i) => s.tone === toneFromRoman(tgt[i]!));
  if (tonesMatch) toneOk++;
  if (norm(got) === norm(roman)) exact++;
  else misses.push(`${thai}: ${got}  (app: ${roman})${tonesMatch ? "" : "  ← tone/syllables differ"}`);
}
console.log(misses.join("\n"));
console.log(`\n${total} words: ${exact} exact, ${sylCountOk} same syllable count, ${toneOk} same tones`);
const heard = romanize("ฮัดเต้ย");
console.log(`ฮัดเต้ย → ${heard}`);
const extra: [string, string][] = [["ฮัดเต้ย", "hát-dtôei"], ["ไม่เป็นไรครับ", "mâi bpen-rai khráp"], ["ขอบคุณครับ", "khàwp-khun khráp"], ["ผัดไทย", "phàt-thai"], ["เปล่า", "bplào"], ["ตรงไป", "dtrong bpai"]];
let fail = 0;
for (const [t, want] of extra) {
  const got = romanize(t);
  const ok = norm(got).replace(/ /g, "-") === norm(want).replace(/ /g, "-");
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${t} → ${got} (want ${want})`);
}
const pass = exact / total >= 0.8 && toneOk / total >= 0.9 && !fail;
console.log(pass ? "romanize OK" : "romanize below target");
process.exit(pass ? 0 : 1);

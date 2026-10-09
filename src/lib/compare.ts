/**
 * Plain-English pronunciation feedback: compare what was heard with the target, syllable by syllable.
 * Everything is described with romanization and English words, so it needs no Thai reading.
 */
import type { Tone } from "../data/types";
import { thaiSyllables, romanize, type ThaiSyllable } from "./romanize";

const ONSET: Record<string, string> = {
  ph: 'a puffed p sound (ph), like the p in "pie"',
  bp: 'an unpuffed p (bp), like the p in "spin"',
  b: 'b, as in "bee"',
  th: 'a puffed t sound (th), like the t in "top"',
  dt: 'an unpuffed t (dt), like the t in "stop"',
  d: 'd, as in "dog"',
  kh: 'a puffed k sound (kh), like the k in "kite"',
  g: 'an unpuffed k (g), like the k in "skip"',
  ch: 'ch, as in "chop"',
  j: 'an unpuffed ch (j), like a soft j in "jam"',
  s: 's, as in "sun"',
  f: 'f, as in "fun"',
  h: 'h, as in "hat"',
  m: 'm, as in "me"',
  n: 'n, as in "no"',
  ng: 'ng, like the end of "sing", but at the start',
  l: 'l, as in "low"',
  r: 'a light, tapped r',
  w: 'w, as in "we"',
  y: 'y, as in "yes"',
  "": "no consonant: start straight on the vowel",
};
const ONSET_SHORT: Record<string, string> = {
  ph: "a puffed p (ph)", bp: "an unpuffed p (bp)", th: "a puffed t (th)", dt: "an unpuffed t (dt)", kh: "a puffed k (kh)",
  g: "an unpuffed k (g)", j: "a j", ch: "a ch", ng: "an ng", "": "no consonant",
};
const onsetShort = (o: string) => ONSET_SHORT[o] ?? (/^[aeiou]/.test(o) ? `an ${o}` : `a ${o}`).replace(/^a ([hlmnrsf])\b/, "an $1").replace(/^an h$/, "an h");
const VOWEL: Record<string, string> = {
  a: 'a short a, like the u in "cut"',
  aa: 'a long aa, like the a in "father"',
  i: 'a short i, like in "bit"',
  ii: 'a long ii, like in "see"',
  u: 'a short u, like in "put"',
  uu: 'a long uu, like in "food"',
  ue: 'a short ue: say "oo" with your lips spread, not rounded',
  uue: 'a long uue: a long "oo" with your lips spread, not rounded',
  e: 'a short e, like in "bed"',
  ee: 'a long ee, like the a in "day" without the glide',
  ae: 'a short ae, like in "cat"',
  aae: 'a long aae, like a stretched "cat"',
  o: 'a short o, like in "go" but clipped',
  oo: 'a long oo, like in "go" without the glide',
  aw: 'aw, like in "saw"',
  er: 'er, like in "her" (no r sound)',
  ia: 'ia, like "Mia"',
  uea: 'uea: a spread-lip "oo" sliding into "a"',
  ua: 'ua, like in "tour"',
  ai: 'ai, like in "Thai"',
  ao: 'ao, like in "now"',
  am: 'am, like in "hum"',
  oei: 'oei: "er" sliding into "ee"',
};
const base = (v: string) => ({ aa: "a", ii: "i", uu: "u", uue: "ue", ee: "e", aae: "ae", oo: "o" })[v] ?? v;
const FINAL: Record<string, string> = {
  k: "a clipped k (close your throat, don't release it)",
  t: "a clipped t (stop the air with your tongue, don't release it)",
  p: "a clipped p (close your lips, don't release it)",
  n: "an n",
  m: "an m",
  ng: 'ng, as in "sing"',
  y: 'a light "ee" glide',
  w: 'a light "oo" glide',
};
const TONE_WORD: Record<Tone, string> = { mid: "mid (level)", low: "low", falling: "falling", high: "high", rising: "rising" };

export interface Comparison {
  heardRoman: string;
  tips: string[];
}

interface Tip {
  w: number;
  text: string;
}

function syllableTips(t: ThaiSyllable, h: ThaiSyllable, label: string): Tip[] {
  const tips: Tip[] = [];
  const q = `"${label}"`;
  if (t.onset !== h.onset) tips.push({ w: 3, text: `Start ${q} with ${ONSET[t.onset] ?? t.onset}, not ${onsetShort(h.onset)}.` });
  if (t.vowel !== h.vowel) {
    if (base(t.vowel) === base(h.vowel)) tips.push({ w: 2, text: t.long ? `Use ${VOWEL[t.vowel]} in ${q}: hold it longer.` : `Keep the vowel in ${q} short: ${VOWEL[t.vowel]}.` });
    else tips.push({ w: 2.5, text: `The vowel in ${q} is ${VOWEL[t.vowel] ?? t.vowel}, not "${h.vowel}".` });
  }
  if (t.final !== h.final) {
    if (t.final) tips.push({ w: 2, text: `End ${q} with ${FINAL[t.final] ?? t.final}${h.final ? `, not "${h.final}"` : ""}.` });
    else tips.push({ w: 1.5, text: `Don't add a final "${h.final}" sound to ${q}: it ends on the vowel.` });
  }
  if (t.tone !== h.tone) tips.push({ w: 1, text: `${q} should be ${TONE_WORD[t.tone]}; yours sounded ${TONE_WORD[h.tone]}.` });
  return tips;
}

function cost(a: ThaiSyllable, b: ThaiSyllable) {
  return (a.onset === b.onset ? 0 : 1) + (a.vowel === b.vowel ? 0 : base(a.vowel) === base(b.vowel) ? 0.4 : 1) + (a.final === b.final ? 0 : 0.5) + (a.tone === b.tone ? 0 : 0.3);
}

/**
 * Compare heard Thai with the target. `targetRoman` (the app's own spelling) labels the target syllables
 * when its syllable count matches. Returns the heard text romanized and up to `max` tips, most important first.
 */
export function compareSpoken(heard: string, target: string, targetRoman?: string, max = 3): Comparison {
  const isThai = /[\u0E00-\u0E7F]/.test(heard);
  if (!isThai) return { heardRoman: heard.trim(), tips: [] };
  const H = thaiSyllables(heard);
  const T = thaiSyllables(target.replace(/[ก-ฮ]*…/g, ""));
  const appLabels = (targetRoman ?? "").replace(/[.,!?…]/g, " ").split(/[\s-]+/).filter(Boolean);
  const label = (i: number) => (appLabels.length === T.length ? appLabels[i]! : T[i]!.roman);
  // Needleman–Wunsch alignment
  const GAP = 1.6;
  const n = T.length;
  const m = H.length;
  const D = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j * GAP : j === 0 ? i * GAP : 0)));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i]![j] = Math.min(D[i - 1]![j - 1]! + cost(T[i - 1]!, H[j - 1]!), D[i - 1]![j]! + GAP, D[i]![j - 1]! + GAP);
  const tips: Tip[] = [];
  let i = n;
  let j = m;
  let far = 0; // syllables missing, extra, or with both the start and the vowel wrong
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && D[i]![j] === D[i - 1]![j - 1]! + cost(T[i - 1]!, H[j - 1]!)) {
      if (cost(T[i - 1]!, H[j - 1]!) >= 2) far++;
      tips.push(...syllableTips(T[i - 1]!, H[j - 1]!, label(i - 1)));
      i--;
      j--;
    } else if (i > 0 && D[i]![j] === D[i - 1]![j]! + GAP) {
      far++;
      tips.push({ w: 5, text: `I didn't hear "${label(i - 1)}". Say every syllable.` });
      i--;
    } else {
      far++;
      tips.push({ w: 4, text: `There was an extra syllable ("${H[j - 1]!.roman}"). Say only what's written.` });
      j--;
    }
  }
  // most important first; keep sentence order among equals
  tips.reverse();
  const ordered = tips.map((t, k) => ({ ...t, k })).sort((a, b) => b.w - a.w || a.k - b.k);
  const heardRoman = heard
    .trim()
    .split(/\s+/)
    .map((chunk) => thaiSyllables(chunk).map((x) => x.roman).join("-"))
    .filter(Boolean)
    .join(" ");
  // A different word altogether: syllable tips would be noise.
  if (n && far > Math.max(n, m) / 2)
    return { heardRoman, tips: [`That sounded like a different word. Tap Slow, listen to "${appLabels.length ? targetRoman : romanize(target)}" again, and copy it syllable by syllable.`] };
  return { heardRoman, tips: ordered.slice(0, max).map((t) => t.text) };
}

/**
 * Automatic Thai → romanization for arbitrary text (e.g. whatever the speech recognizer heard),
 * in the app's style: bp/dt for ป/ต, ph/th/kh for aspirated, aa/ii/uu for long vowels, aw for ออ,
 * ue/uue for ึ/ือ, er for เ-อ, tone marks à â á ǎ (mid unmarked).
 * Rule-based syllabifier: pre-posed vowels เ แ โ ใ ไ, leading ห/อ, true clusters, implicit a/o vowels,
 * finals mapped to k/t/p/n/m/ng/y/w, tone from consonant class + live/dead + tone mark.
 * Good for everyday words; not a dictionary, so rare spellings can come out approximate.
 */
import type { ConsonantClass, SyllableKind, Tone, ToneMark } from "../data/types";
import { consonantClass, toneFromRule } from "./thai";

export interface ThaiSyllable {
  thai: string;
  onset: string; // romanized initial (cluster), "" for silent อ
  vowel: string; // romanized vowel nucleus
  long: boolean;
  final: string; // romanized final, "" if none
  tone: Tone;
  roman: string; // with tone mark
}

const INITIAL: Record<string, string> = {
  ก: "g", ข: "kh", ฃ: "kh", ค: "kh", ฅ: "kh", ฆ: "kh", ง: "ng", จ: "j", ฉ: "ch", ช: "ch", ซ: "s", ฌ: "ch", ญ: "y",
  ฎ: "d", ฏ: "dt", ฐ: "th", ฑ: "th", ฒ: "th", ณ: "n", ด: "d", ต: "dt", ถ: "th", ท: "th", ธ: "th", น: "n", บ: "b",
  ป: "bp", ผ: "ph", ฝ: "f", พ: "ph", ฟ: "f", ภ: "ph", ม: "m", ย: "y", ร: "r", ล: "l", ว: "w", ศ: "s", ษ: "s",
  ส: "s", ห: "h", ฬ: "l", อ: "", ฮ: "h",
};
const FINAL: Record<string, string> = {};
for (const c of "กขคฆ") FINAL[c] = "k";
for (const c of "จชซฌฎฏฐฑฒดตถทธศษส") FINAL[c] = "t";
for (const c of "บปพฟภ") FINAL[c] = "p";
for (const c of "ญณนรลฬ") FINAL[c] = "n";
FINAL["ม"] = "m";
FINAL["ง"] = "ng";
FINAL["ย"] = "y";
FINAL["ว"] = "w";

const CLUSTERS = new Set(["กร", "กล", "กว", "ขร", "ขล", "ขว", "คร", "คล", "คว", "ปร", "ปล", "พร", "พล", "ผล", "ตร", "บร", "บล", "ดร", "ฟร", "ฟล", "ทร"]);
const LEADABLE = "งญนมยรลว";
const PRE = "เแโใไ";
const ABOVE_BELOW = "ัิีึืุู็"; // vowel signs written on a consonant
const TONES = "่้๊๋";
const isCons = (c?: string) => !!c && c >= "ก" && c <= "ฮ";
/** Does the consonant at w[k] start a syllable (it carries a vowel sign / tone / following vowel)? */
function startsSyllable(w: string, k: number) {
  const n = w[k + 1];
  if (!n) return false;
  return ABOVE_BELOW.includes(n) || TONES.includes(n) || "ะาำ".includes(n) || (n === "อ" && !isCons(w[k + 2]) ? false : false);
}

const MARK: Record<string, ToneMark> = { "่": "ek", "้": "tho", "๊": "tri", "๋": "jattawa" };
const DIA: Record<Tone, string> = { mid: "", low: "\u0300", falling: "\u0302", high: "\u0301", rising: "\u030C" };

function withTone(roman: string, tone: Tone) {
  const i = roman.search(/[aeiou]/);
  if (i < 0 || !DIA[tone]) return roman;
  return (roman.slice(0, i + 1) + DIA[tone] + roman.slice(i + 1)).normalize("NFC");
}

/** Parse one syllable starting at w[i]. */
function parseOne(w: string, i: number): { syl: ThaiSyllable; next: number } | null {
  const start = i;
  let pre = "";
  if (PRE.includes(w[i] ?? "")) pre = w[i++]!;
  if (!isCons(w[i])) return null;
  let classLetter = w[i]!;
  let onset = INITIAL[w[i]!] ?? "";
  let j = i + 1;
  const after = (k: number) => w[k];
  // leading ห (หม, หน, หว…) and อย: silent leader sets the class
  if (w[i] === "ห" && LEADABLE.includes(after(j) ?? "") && (pre || !isCons(after(j + 1)) || ABOVE_BELOW.includes(after(j + 1) ?? "") || TONES.includes(after(j + 1) ?? "") || "าอะ".includes(after(j + 1) ?? "") || !after(j + 1))) {
    onset = INITIAL[w[j]!]!;
    j++;
  } else if (w[i] === "อ" && after(j) === "ย" && after(j + 1) && !isCons(after(j + 1))) {
    onset = "y";
    j++;
  } else if (isCons(after(j)) && CLUSTERS.has(w[i]! + after(j)!)) {
    const n2 = after(j + 1);
    const vowelNext = !!n2 && (ABOVE_BELOW.includes(n2) || TONES.includes(n2) || "าะำอ".includes(n2));
    const implicitO = after(j) !== "ว" && isCons(n2) && !startsSyllable(w, j + 1) && !pre;
    if (vowelNext || (pre && !isCons(n2)) || (pre && isCons(n2) && !startsSyllable(w, j + 1)) || implicitO) {
      onset = w[i] + after(j)! === "ทร" ? "s" : onset + INITIAL[after(j)!]!;
      j++;
    }
  }
  // signs on the onset (vowel sign and/or tone mark, either order)
  let sign = "";
  let mark: ToneMark = "none";
  while (after(j) && (ABOVE_BELOW.includes(after(j)!) || TONES.includes(after(j)!))) {
    if (TONES.includes(after(j)!)) mark = MARK[after(j)!]!;
    else sign = after(j)!;
    j++;
  }
  let vowel = "a";
  let long = false;
  let finalOk = true;
  const r0 = after(j);
  const r1 = after(j + 1);
  const notVowelAfter = (k: number) => !after(k) || isCons(after(k)) || PRE.includes(after(k)!);
  if (pre === "เ") {
    if (sign === "ี" && r0 === "ย") [vowel, long, j] = ["ia", true, j + 1];
    else if (sign === "ื" && r0 === "อ") [vowel, long, j] = ["uea", true, j + 1];
    else if (r0 === "า" && r1 === "ะ") [vowel, long, j, finalOk] = ["aw", false, j + 2, false];
    else if (r0 === "า") [vowel, long, j, finalOk] = ["ao", true, j + 1, false];
    else if (r0 === "อ" && r1 === "ะ") [vowel, long, j, finalOk] = ["er", false, j + 2, false];
    else if (r0 === "อ") [vowel, long, j] = ["er", true, j + 1];
    else if (sign === "ิ") [vowel, long] = ["er", true];
    else if (sign === "็") [vowel, long] = ["e", false];
    else if (r0 === "ะ") [vowel, long, j, finalOk] = ["e", false, j + 1, false];
    else if (r0 === "ย" && notVowelAfter(j + 1)) [vowel, long, j, finalOk] = ["oei", true, j + 1, false];
    else [vowel, long] = ["ee", true];
  } else if (pre === "แ") {
    if (sign === "็") [vowel, long] = ["ae", false];
    else if (r0 === "ะ") [vowel, long, j, finalOk] = ["ae", false, j + 1, false];
    else [vowel, long] = ["aae", true];
  } else if (pre === "โ") {
    if (r0 === "ะ") [vowel, long, j, finalOk] = ["o", false, j + 1, false];
    else [vowel, long] = ["oo", true];
  } else if (pre === "ใ" || pre === "ไ") {
    [vowel, long, finalOk] = ["ai", true, false];
    if (r0 === "ย" && notVowelAfter(j + 1)) j++; // ไทย
  } else if (sign === "ั") {
    if (r0 === "ว") [vowel, long, j] = ["ua", true, j + 1];
    else [vowel, long] = ["a", false];
  } else if (sign === "ิ") [vowel, long] = ["i", false];
  else if (sign === "ี") [vowel, long] = ["ii", true];
  else if (sign === "ึ") [vowel, long] = ["ue", false];
  else if (sign === "ื") {
    [vowel, long] = ["uue", true];
    if (r0 === "อ") j++;
  } else if (sign === "ุ") [vowel, long] = ["u", false];
  else if (sign === "ู") [vowel, long] = ["uu", true];
  else if (sign === "็") [vowel, long, finalOk] = ["aw", false, false]; // ก็
  else if (r0 === "ะ") [vowel, long, j, finalOk] = ["a", false, j + 1, false];
  else if (r0 === "า") [vowel, long, j] = ["aa", true, j + 1];
  else if (r0 === "ำ") [vowel, long, j, finalOk] = ["am", true, j + 1, false];
  else if (r0 === "อ" && !startsSyllable(w, j)) [vowel, long, j] = ["aw", true, j + 1];
  else if (r0 === "ว" && isCons(r1) && !startsSyllable(w, j + 1) && !PRE.includes(r1 ?? "")) [vowel, long, j] = ["ua", true, j + 1];
  else if (isCons(r0) && !startsSyllable(w, j) && !(isCons(r1) && CLUSTERS.has(r0! + r1!) && startsSyllable(w, j + 1))) [vowel, long] = ["o", false];
  else [vowel, long, finalOk] = ["a", false, false];
  // final consonant
  let fin = "";
  if (finalOk && isCons(after(j)) && !startsSyllable(w, j) && !(after(j) === "อ" && !isCons(after(j + 1)) && after(j + 1))) {
    // a consonant directly followed by a pre-vowel or another free consonant is our final
    fin = FINAL[after(j)!] ?? "";
    j++;
  }
  if (vowel === "o" && !fin) vowel = "a"; // safety
  // ai/ao/am are live; short open vowels are dead
  const stop = fin === "k" || fin === "t" || fin === "p";
  const liveVowel = long || ["ai", "ao", "am"].includes(vowel);
  const kind: SyllableKind = stop ? (long ? "dead-long" : "dead-short") : fin || liveVowel ? "live" : "dead-short";
  const cls: ConsonantClass = consonantClass(classLetter === "อ" && onset === "y" ? "อ" : classLetter);
  const tone = toneFromRule(cls, kind, mark) ?? "mid";
  // app style: long aa + final y is written "aai" (sáai), not "aay"
  const plain = onset + vowel + (vowel === "aa" && fin === "y" ? "i" : fin);
  return { syl: { thai: w.slice(start, j), onset, vowel, long, final: fin, tone, roman: withTone(plain, tone) }, next: j };
}

const SPECIAL: Record<string, ThaiSyllable[]> = {};
function special(thai: string, parts: [string, string, boolean, string, Tone][]) {
  SPECIAL[thai] = parts.map(([onset, vowel, long, final, tone]) => ({ thai, onset, vowel, long, final, tone, roman: withTone(onset + vowel + final, tone) }));
}
// very common irregular words
special("ก็", [["g", "aw", false, "", "falling"]]);
special("สวัสดี", [["s", "a", false, "", "low"], ["w", "a", false, "t", "low"], ["d", "ii", true, "", "mid"]]);
special("อร่อย", [["", "a", false, "", "low"], ["r", "o", false, "i", "low"]]);
special("น้ำ", [["n", "aa", true, "m", "high"]]);
special("แล้ว", [["l", "ae", false, "w", "high"]]);
special("เขา", [["kh", "ao", true, "", "rising"]]);
special("ไหน", [["n", "ai", true, "", "rising"]]);

/** Split one Thai word into syllables. */
export function syllabify(word: string): ThaiSyllable[] {
  const w = word.replace(/[ก-ฮ][ิุ]?์/g, "").replace(/ๆ/g, "");
  if (SPECIAL[w]) return SPECIAL[w]!;
  const out: ThaiSyllable[] = [];
  let i = 0;
  while (i < w.length) {
    const p = parseOne(w, i);
    if (!p || p.next <= i) {
      i++;
      continue;
    }
    out.push(p.syl);
    i = p.next;
  }
  return out;
}

/** All syllables of a Thai text, word by word. */
export function thaiSyllables(text: string): ThaiSyllable[] {
  return thaiWords(text).flatMap((w) => (/[ก-๛]/.test(w) ? syllabify(w) : []));
}

function thaiWords(text: string): string[] {
  const clean = text.replace(/[!?.,"“”'()]/g, " ").trim();
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter("th", { granularity: "word" }).segment(clean)].map((s) => s.segment).filter((s) => s.trim());
  }
  return clean.split(/\s+/);
}

/** "ฮัดเต้ย" → "hát-dtôei". Non-Thai text passes through unchanged. */
export function romanize(text: string): string {
  return thaiWords(text)
    .map((w) => (/[ก-๛]/.test(w) ? syllabify(w).map((s) => s.roman).join("-") : w))
    .join(" ");
}

const stripMarks = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Loose key so "kìi" (app) and "gìi" (auto) count as the same spelling. */
export const romanKey = (x: string) =>
  stripMarks(x).replace(/bp/g, "p").replace(/dt/g, "t").replace(/ph/g, "p").replace(/th/g, "t").replace(/kh/g, "k").replace(/g/g, "k").replace(/[^a-z]/g, "");

/**
 * Make any explanatory sentence readable without Thai: each Thai word gets its romanization in
 * brackets right after it, unless the romanization is already there.
 * "ครับ is high." → "ครับ (khráp) is high."
 */
export function annotateThai(text: string): string {
  return text.replace(/[\u0E00-\u0E7F]+/g, (run, offset: number, all: string) => {
    const roman = romanize(run);
    const first = thaiSyllables(run)[0];
    if (!first) return run;
    const key = romanKey(first.onset + first.vowel).slice(0, 2);
    const after = all.slice(offset + run.length, offset + run.length + 24);
    const before = all.slice(Math.max(0, offset - 24), offset);
    const near = (s: string) => s.split(/[^A-Za-z\u00C0-\u024F\u0300-\u036f]+/).some((t) => t && romanKey(t).startsWith(key));
    if (near(after.split(/[.;]/)[0] ?? "") || near(before.split(/[.;:]/).pop() ?? "")) return run;
    return `${run} (${roman})`;
  });
}

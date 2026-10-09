import { TONE_SETS } from "../data/toneSets";
import { SCENES } from "../data/scenes";
import { VOCAB } from "../data/vocab";
import { EAR_POOL } from "../data/tones";
import type { Tone, ToneWord, Voice } from "../data/types";
import type { PairStat } from "./store";
import { gloss } from "../data/glossary";
import { particle, pick, sample, shuffle, TONES, toneFromRoman } from "./thai";

export type Pair = [Tone, Tone];

export const pairKey = (a: Tone, b: Tone) => [a, b].sort((x, y) => TONES.indexOf(x) - TONES.indexOf(y)).join("|");

/** All tone pairs that at least one minimal set can test. */
export const AVAILABLE_PAIRS: Pair[] = (() => {
  const seen = new Map<string, Pair>();
  for (const set of TONE_SETS)
    for (const a of set.words)
      for (const b of set.words)
        if (a.tone !== b.tone) {
          const k = pairKey(a.tone, b.tone);
          if (!seen.has(k)) seen.set(k, k.split("|") as Pair);
        }
  return [...seen.values()];
})();

/** Smoothed accuracy so unseen pairs sit at 50%. */
export const accuracy = (p?: PairStat) => ((p?.right ?? 0) + 1) / ((p?.right ?? 0) + (p?.wrong ?? 0) + 2);
export const attempts = (p?: PairStat) => (p?.right ?? 0) + (p?.wrong ?? 0);

export function weakestPairs(stats: Record<string, PairStat>, n = 2): Pair[] {
  return [...AVAILABLE_PAIRS]
    .sort((a, b) => {
      const sa = stats[pairKey(...a)];
      const sb = stats[pairKey(...b)];
      return accuracy(sa) - accuracy(sb) || attempts(sa) - attempts(sb);
    })
    .slice(0, n);
}

/** 60% of trials come from the two weakest pairs, the rest from any pair. */
export function choosePair(stats: Record<string, PairStat>): Pair {
  return Math.random() < 0.6 ? sample(weakestPairs(stats, 2)) : sample(AVAILABLE_PAIRS);
}

export interface WhichTrial {
  kind: "which";
  target: ToneWord;
  options: ToneWord[];
  rate: number;
  voiceIndex: number;
}
export interface SameTrial {
  kind: "same";
  first: ToneWord;
  second: ToneWord;
  same: boolean;
  rates: [number, number];
  voices: [number, number];
}
export type Trial = WhichTrial | SameTrial;

function wordsFor(pair: Pair) {
  const sets = TONE_SETS.filter((s) => s.words.some((w) => w.tone === pair[0]) && s.words.some((w) => w.tone === pair[1]));
  const set = sample(sets);
  const a = sample(set.words.filter((w) => w.tone === pair[0]));
  const b = sample(set.words.filter((w) => w.tone === pair[1]));
  return { set, a, b };
}

export function makeTrial(kind: "which" | "same", stats: Record<string, PairStat>, n: number): Trial {
  const pair = choosePair(stats);
  const { set, a, b } = wordsFor(pair);
  const rate = n % 2 === 0 ? 1.0 : 0.8;
  if (kind === "which") {
    const [target, other] = Math.random() < 0.5 ? [a, b] : [b, a];
    const options = [target, other];
    // Sometimes add a third option from the same set with a distinct tone.
    const extra = set.words.filter((w) => !options.some((o) => o.tone === w.tone));
    if (extra.length && Math.random() < 0.5) options.push(sample(extra));
    return { kind, target, options: shuffle(options), rate, voiceIndex: n };
  }
  const same = Math.random() < 0.5;
  const [first, second] = same ? (Math.random() < 0.5 ? [a, a] : [b, b]) : Math.random() < 0.5 ? [a, b] : [b, a];
  return { kind, first, second, same, rates: [rate, rate === 1 ? 0.8 : 1], voices: [n, n + 1] };
}

/**
 * Score a trial and return the pair results to record.
 * which: right → every (target, distractor) pair shown is credited; wrong → (target, picked) is debited.
 * same: the pair that was tested (for "same" trials, the partner tone from the set it was drawn against).
 */
export function pairsOf(trial: Trial): string[] {
  if (trial.kind === "which") return trial.options.filter((o) => o.tone !== trial.target.tone).map((o) => pairKey(trial.target.tone, o.tone));
  return trial.first.tone === trial.second.tone ? [] : [pairKey(trial.first.tone, trial.second.tone)];
}

// ---- Tones inside phrases ----

export interface PhraseItem {
  lineId: string;
  segments: string[];
  focus: number;
  word: string;
  roman: string;
  tone: Tone;
  /** English for the focus word. */
  wordEn?: string;
  /** English for the whole line. */
  en: string;
  lineRoman: string;
}

const extraEn: Record<string, string> = {
  ได้: "can; to get", รับ: "to receive, to take (an order)", ดี: "good", นะ: "softening particle", ร้อย: "hundred",
  ห้า: "five", สิบ: "ten", ดู: "to look", มา: "to come", จอด: "to stop, to park", ตรง: "straight", กี่: "how many",
  แล้ว: "already; then", เลย: "right away", ชา: "tea", เจอ: "to meet", กัน: "each other", คน: "person",
};

function toneDictionary(voice: Voice) {
  const dict = new Map<string, { roman: string; tone: Tone; en?: string }>();
  const add = (thai: string, roman: string) => {
    if (/[\s-]/.test(roman.trim())) return; // single syllables only
    if (!dict.has(thai)) dict.set(thai, { roman, tone: toneFromRoman(roman), en: gloss(thai)?.en ?? extraEn[thai] });
  };
  for (const v of VOCAB) add(v.thai, v.roman);
  for (const w of EAR_POOL) add(w.thai, w.roman);
  for (const s of TONE_SETS) for (const w of s.words) add(w.thai, w.roman);
  for (const k of ["statement", "question"] as const) {
    const p = particle(voice, k);
    add(p.thai, p.roman);
  }
  // Common words in the scene lines that aren't vocab entries.
  const extras: [string, string][] = [
    ["ได้", "dâai"], ["รับ", "ráp"], ["ดี", "dii"], ["นะ", "ná"], ["ร้อย", "ráwy"], ["ห้า", "hâa"], ["สิบ", "sìp"],
    ["ดู", "duu"], ["มา", "maa"], ["จอด", "jàwt"], ["ตรง", "dtrong"], ["กี่", "kìi"], ["แล้ว", "láew"], ["เลย", "loei"],
    ["เอา", "ao"], ["ชา", "chaa"], ["เจอ", "jer"], ["กัน", "gan"], ["ไม่", "mâi"], ["มาก", "mâak"], ["คน", "khon"],
  ];
  for (const [t, r] of extras) add(t, r);
  return dict;
}

function segment(text: string): string[] | null {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => { segment(s: string): Iterable<{ segment: string; isWordLike?: boolean }> } }).Segmenter;
  if (!Seg) return null;
  const seg = new Seg("th", { granularity: "word" });
  return Array.from(seg.segment(text), (s) => s.segment);
}

export function phraseItems(voice: Voice, name: string): PhraseItem[] {
  const dict = toneDictionary(voice);
  const items: PhraseItem[] = [];
  const nm = name.trim() || "…";
  for (const scene of SCENES) {
    for (const line of scene.lines) {
      const thai = pick(line.thai, voice).replaceAll("{name}", nm);
      const segs = segment(thai);
      if (!segs) return [];
      segs.forEach((s, i) => {
        const hit = dict.get(s);
        if (hit) items.push({ lineId: line.id, segments: segs, focus: i, word: s, roman: hit.roman, tone: hit.tone, wordEn: hit.en, en: line.en, lineRoman: pick(line.roman, voice).replaceAll("{name}", nm) });
      });
    }
  }
  return items;
}

export const phraseQuizSupported = () => segment("ทดสอบ") !== null;

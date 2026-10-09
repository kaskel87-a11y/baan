import type { ConsonantClass, Gendered, SyllableKind, Tone, ToneMark, Voice } from "../data/types";

export const TONE_LABEL: Record<Tone, string> = {
  mid: "Mid",
  low: "Low",
  falling: "Falling",
  high: "High",
  rising: "Rising",
};
export const TONES: Tone[] = ["mid", "low", "falling", "high", "rising"];

export function pick<T>(v: Gendered<T>, voice: Voice): T {
  if (v && typeof v === "object" && !Array.isArray(v) && "male" in (v as object)) {
    return (v as { male: T; female: T })[voice];
  }
  return v as T;
}

export function particle(voice: Voice, kind: "statement" | "question") {
  if (voice === "male") return { thai: "ครับ", roman: "khráp", tone: "high" as Tone };
  return kind === "question"
    ? { thai: "คะ", roman: "khá", tone: "high" as Tone }
    : { thai: "ค่ะ", roman: "khâ", tone: "falling" as Tone };
}

export function particleNote(voice: Voice, kind: "statement" | "question") {
  if (voice === "male") return "ครับ is high. Male speakers use it on statements and questions.";
  return kind === "question"
    ? "คะ is high. Female speakers use it on questions. Statements take ค่ะ, falling."
    : "ค่ะ is falling. Female speakers use it on statements. Questions take คะ, high.";
}

/** Tone from consonant class, syllable type, and tone mark. Same rules as the original. */
export function toneFromRule(cls: ConsonantClass, syl: SyllableKind, mark: ToneMark): Tone | null {
  if (mark === "tri" || mark === "jattawa") return cls === "mid" ? (mark === "tri" ? "high" : "rising") : null;
  if (mark === "ek") return cls === "low" ? "falling" : "low";
  if (mark === "tho") return cls === "low" ? "high" : "falling";
  if (syl === "live") return cls === "high" ? "rising" : "mid";
  if (syl === "dead-short") return cls === "low" ? "high" : "low";
  return cls === "low" ? "falling" : "low";
}

const MID = new Set(["ก", "จ", "ฎ", "ฏ", "ด", "ต", "บ", "ป", "อ"]);
const HIGH = new Set(["ข", "ฃ", "ฉ", "ฐ", "ถ", "ผ", "ฝ", "ศ", "ษ", "ส", "ห"]);
export function consonantClass(letter: string): ConsonantClass {
  return MID.has(letter) ? "mid" : HIGH.has(letter) ? "high" : "low";
}

/** Tone of a single romanized syllable from its diacritic (à low, â falling, á high, ǎ rising, none mid). */
export function toneFromRoman(syllable: string): Tone {
  const d = syllable.normalize("NFD");
  if (d.includes("\u0300")) return "low";
  if (d.includes("\u0302")) return "falling";
  if (d.includes("\u0301")) return "high";
  if (d.includes("\u030C")) return "rising";
  return "mid";
}

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic shuffle (kept for quiz word selection). */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let r = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    r = (Math.imul(r, 48271) + 1) >>> 0;
    const j = r % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ---- Spoken-answer matching (ported from the original fuzzy matcher) ----

function normalize(s: string) {
  return s.replace(/\s+/g, "").replace(/[ๆฯ.,!?…"'“”‘’]/g, "");
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let cur = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length]!;
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

const TRAILING_PARTICLE = /(นะคะ|นะครับ|ครับ|ค่ะ|คะ|นะ|จ้า|จ้ะ|สิ)$/;

export type Verdict = "yes" | "close" | "no";

export function matchSpoken(heard: string, target: string): Verdict {
  const h = normalize(heard);
  const t = normalize(target);
  if (!h || !t) return "no";
  if (h === t || h.includes(t) || similarity(h, t) >= 0.84) return "yes";
  const hs = h.replace(TRAILING_PARTICLE, "");
  const ts = t.replace(TRAILING_PARTICLE, "");
  const core = similarity(hs, ts);
  return (hs && ts && core >= 0.9 && hs.length >= Math.min(2, ts.length)) ||
    similarity(h, t) >= 0.62 ||
    core >= 0.62 ||
    (ts.includes(hs) && hs.length >= 2 && hs.length / ts.length >= 0.45)
    ? "close"
    : "no";
}

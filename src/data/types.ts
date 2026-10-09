export type Voice = "male" | "female";
export type Tone = "mid" | "low" | "falling" | "high" | "rising";
export type ConsonantClass = "mid" | "high" | "low";
export type SyllableKind = "live" | "dead-short" | "dead-long";
export type ToneMark = "none" | "ek" | "tho" | "tri" | "jattawa";
export type RuleKey = `${ConsonantClass}|${SyllableKind}|${ToneMark}`;

/** A string, or a male/female pair chosen by the learner's particle. */
export type Gendered<T = string> = T | { male: T; female: T };

export interface Vocab {
  id: string;
  thai: string;
  roman: string;
  en: string;
  hint?: string;
}

export type Speaker = "you" | "nid" | "lung" | "wit" | "pla";

export interface Line {
  id: string;
  who: Speaker;
  en: string;
  thai: Gendered;
  roman: Gendered;
  note?: string;
}

export type Drill =
  | { id: string; kind: "listen" | "read"; thai: Gendered; roman: Gendered; en: string; options: string[] }
  | { id: string; kind: "pick"; en: string; options: string[]; answer: Gendered; roman: Gendered }
  | { id: string; kind: "build"; en: string; tiles: string[]; answer: Gendered<string[]>; roman: Gendered }
  | { id: string; kind: "particle"; en: string; stem: string; stemRoman: string; particleKind: "statement" | "question" };

export interface Scene {
  id: string;
  title: string;
  titleTh: string;
  blurb: string;
  vocab: string[];
  lines: Line[];
  drills: Drill[];
}

export interface ToneWord {
  thai: string;
  roman: string;
  en: string;
  tone: Tone;
}

export interface Consonant {
  letter: string;
  chant: string;
  obsolete?: boolean;
  example?: { thai: string; roman: string; en: string };
  note?: string;
}

export interface VowelCard {
  sign: string;
  roman: string;
  thai: string;
  en: string;
  note: string;
}

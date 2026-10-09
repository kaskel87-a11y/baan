// Ported from the Grok-hosted Baan build (routes-BILTYoNg.js); later content fixes are listed in CHANGELOG.md.
import type { RuleKey, ToneWord } from "./types";

/** The five tone anchors. */
export const TONE_ANCHORS: (ToneWord & { hint: string })[] = [
  {
    "tone": "mid",
    "thai": "มา",
    "roman": "maa",
    "en": "come",
    "hint": "Level, in your ordinary voice."
  },
  {
    "tone": "low",
    "thai": "ป่า",
    "roman": "bpàa",
    "en": "forest",
    "hint": "Lower than ordinary, and it stays there."
  },
  {
    "tone": "falling",
    "thai": "บ้าน",
    "roman": "bâan",
    "en": "house",
    "hint": "Starts high and drops."
  },
  {
    "tone": "high",
    "thai": "น้ำ",
    "roman": "náam",
    "en": "water",
    "hint": "High, with a small dip at the very end."
  },
  {
    "tone": "rising",
    "thai": "หมา",
    "roman": "mǎa",
    "en": "dog",
    "hint": "Starts low and climbs."
  }
];

/** Pool for the single-word Ear quiz. */
export const EAR_POOL: ToneWord[] = [
  {
    "thai": "มา",
    "roman": "maa",
    "en": "come",
    "tone": "mid"
  },
  {
    "thai": "กา",
    "roman": "gaa",
    "en": "crow",
    "tone": "mid"
  },
  {
    "thai": "กิน",
    "roman": "gin",
    "en": "eat",
    "tone": "mid"
  },
  {
    "thai": "คน",
    "roman": "khon",
    "en": "person",
    "tone": "mid"
  },
  {
    "thai": "ป่า",
    "roman": "bpàa",
    "en": "forest",
    "tone": "low"
  },
  {
    "thai": "ใหม่",
    "roman": "mài",
    "en": "new",
    "tone": "low"
  },
  {
    "thai": "ถูก",
    "roman": "thùuk",
    "en": "cheap, or correct",
    "tone": "low"
  },
  {
    "thai": "ไข่",
    "roman": "khài",
    "en": "egg",
    "tone": "low"
  },
  {
    "thai": "บ้าน",
    "roman": "bâan",
    "en": "house",
    "tone": "falling"
  },
  {
    "thai": "ไม่",
    "roman": "mâi",
    "en": "not",
    "tone": "falling"
  },
  {
    "thai": "พ่อ",
    "roman": "phâaw",
    "en": "father",
    "tone": "falling"
  },
  {
    "thai": "ห้า",
    "roman": "hâa",
    "en": "five",
    "tone": "falling"
  },
  {
    "thai": "น้ำ",
    "roman": "náam",
    "en": "water",
    "tone": "high"
  },
  {
    "thai": "ช้าง",
    "roman": "cháang",
    "en": "elephant",
    "tone": "high"
  },
  {
    "thai": "เผ็ด",
    "roman": "phèt",
    "en": "spicy",
    "tone": "low"
  },
  {
    "thai": "ครับ",
    "roman": "khráp",
    "en": "polite particle",
    "tone": "high"
  },
  {
    "thai": "ม้า",
    "roman": "máa",
    "en": "horse",
    "tone": "high"
  },
  {
    "thai": "หมา",
    "roman": "mǎa",
    "en": "dog",
    "tone": "rising"
  },
  {
    "thai": "ไหม",
    "roman": "mǎi",
    "en": "…right?",
    "tone": "rising"
  },
  {
    "thai": "เสือ",
    "roman": "sǔea",
    "en": "tiger",
    "tone": "rising"
  },
  {
    "thai": "ขา",
    "roman": "khǎa",
    "en": "leg",
    "tone": "rising"
  }
];

/** ไม่ ใหม่ ไหม ไหม้ */
export const MAI_SET: ToneWord[] = [
  {
    "thai": "ไม่",
    "roman": "mâi",
    "en": "not",
    "tone": "falling"
  },
  {
    "thai": "ใหม่",
    "roman": "mài",
    "en": "new",
    "tone": "low"
  },
  {
    "thai": "ไหม",
    "roman": "mǎi",
    "en": "…right?",
    "tone": "rising"
  },
  {
    "thai": "ไหม้",
    "roman": "mâi",
    "en": "to burn",
    "tone": "falling"
  }
];

/** Example word per class|syllable|mark combination. */
export const RULE_EXAMPLES: Partial<Record<RuleKey, { thai: string; roman: string; en: string }>> = {
  "mid|live|none": {
    "thai": "มา",
    "roman": "maa",
    "en": "come"
  },
  "mid|live|ek": {
    "thai": "ป่า",
    "roman": "bpàa",
    "en": "forest"
  },
  "mid|live|tho": {
    "thai": "บ้าน",
    "roman": "bâan",
    "en": "house"
  },
  "mid|live|tri": {
    "thai": "เจ๊",
    "roman": "jé",
    "en": "older sister, informal"
  },
  "mid|dead-short|jattawa": {
    "thai": "โต๊ะ",
    "roman": "dtó",
    "en": "table"
  },
  "mid|dead-short|none": {
    "thai": "เด็ก",
    "roman": "dèk",
    "en": "child"
  },
  "mid|dead-long|none": {
    "thai": "แปด",
    "roman": "bpàaet",
    "en": "eight"
  },
  "high|live|none": {
    "thai": "ขา",
    "roman": "khǎa",
    "en": "leg"
  },
  "high|live|ek": {
    "thai": "ไข่",
    "roman": "khài",
    "en": "egg"
  },
  "high|live|tho": {
    "thai": "ห้า",
    "roman": "hâa",
    "en": "five"
  },
  "high|dead-short|none": {
    "thai": "สิบ",
    "roman": "sìp",
    "en": "ten"
  },
  "high|dead-long|none": {
    "thai": "ฉาก",
    "roman": "chàak",
    "en": "scene, screen"
  },
  "low|live|none": {
    "thai": "คน",
    "roman": "khon",
    "en": "person"
  },
  "low|live|ek": {
    "thai": "พ่อ",
    "roman": "phâaw",
    "en": "father"
  },
  "low|live|tho": {
    "thai": "น้ำ",
    "roman": "náam",
    "en": "water"
  },
  "low|dead-short|none": {
    "thai": "รถ",
    "roman": "rót",
    "en": "car"
  },
  "low|dead-long|none": {
    "thai": "มาก",
    "roman": "mâak",
    "en": "very, much"
  }
};

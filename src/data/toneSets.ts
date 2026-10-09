import type { ToneWord } from "./types";

/**
 * Minimal sets: same syllable, different tone (REVIEW.md Prompt 2).
 * Words in one set that share a tone (ไม่ / ไหม้) are homophones and are never offered against each other.
 */
export interface ToneSet {
  id: string;
  words: ToneWord[];
}

export const TONE_SETS: ToneSet[] = [
  {
    id: "maa",
    words: [
      { thai: "มา", roman: "maa", en: "come", tone: "mid" },
      { thai: "ม้า", roman: "máa", en: "horse", tone: "high" },
      { thai: "หมา", roman: "mǎa", en: "dog", tone: "rising" },
    ],
  },
  {
    id: "bpaa",
    words: [
      { thai: "ปา", roman: "bpaa", en: "to throw", tone: "mid" },
      { thai: "ป่า", roman: "bpàa", en: "forest", tone: "low" },
      { thai: "ป้า", roman: "bpâa", en: "aunt (older)", tone: "falling" },
    ],
  },
  {
    id: "khaaw",
    words: [
      { thai: "ขาว", roman: "khǎaw", en: "white", tone: "rising" },
      { thai: "ข่าว", roman: "khàaw", en: "news", tone: "low" },
      { thai: "ข้าว", roman: "khâaw", en: "rice", tone: "falling" },
    ],
  },
  {
    id: "mai",
    words: [
      { thai: "ไม่", roman: "mâi", en: "not", tone: "falling" },
      { thai: "ใหม่", roman: "mài", en: "new", tone: "low" },
      { thai: "ไหม", roman: "mǎi", en: "…right? (question)", tone: "rising" },
      { thai: "ไหม้", roman: "mâi", en: "to burn", tone: "falling" },
    ],
  },
  {
    id: "suea",
    words: [
      { thai: "เสือ", roman: "sǔea", en: "tiger", tone: "rising" },
      { thai: "เสื่อ", roman: "sùea", en: "mat", tone: "low" },
      { thai: "เสื้อ", roman: "sûea", en: "shirt", tone: "falling" },
    ],
  },
  {
    id: "glai",
    words: [
      { thai: "ไกล", roman: "glai", en: "far", tone: "mid" },
      { thai: "ใกล้", roman: "glâi", en: "near", tone: "falling" },
    ],
  },
  {
    id: "khaa",
    words: [
      { thai: "คา", roman: "khaa", en: "stuck", tone: "mid" },
      { thai: "ข่า", roman: "khàa", en: "galangal", tone: "low" },
      { thai: "ค่า", roman: "khâa", en: "value, fee", tone: "falling" },
      { thai: "ค้า", roman: "kháa", en: "to trade", tone: "high" },
      { thai: "ขา", roman: "khǎa", en: "leg", tone: "rising" },
    ],
  },
  {
    id: "naa",
    words: [
      { thai: "นา", roman: "naa", en: "rice field", tone: "mid" },
      { thai: "หน้า", roman: "nâa", en: "face", tone: "falling" },
      { thai: "น้า", roman: "náa", en: "aunt/uncle (younger)", tone: "high" },
    ],
  },
  {
    id: "suay",
    words: [
      { thai: "สวย", roman: "sǔay", en: "beautiful", tone: "rising" },
      { thai: "ซวย", roman: "suay", en: "unlucky", tone: "mid" },
    ],
  },
  {
    id: "khao",
    words: [
      { thai: "เขา", roman: "khǎo", en: "he, she, they", tone: "rising" },
      { thai: "เข่า", roman: "khào", en: "knee", tone: "low" },
      { thai: "เข้า", roman: "khâo", en: "to enter", tone: "falling" },
    ],
  },
  {
    id: "bpuu",
    words: [
      { thai: "ปู", roman: "bpuu", en: "crab", tone: "mid" },
      { thai: "ปู่", roman: "bpùu", en: "grandfather", tone: "low" },
    ],
  },
];

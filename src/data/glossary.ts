import { VOCAB } from "./vocab";
import { SCENES } from "./scenes";

/** Phrases that appear as drill options but aren't vocab items, so every Thai option can be glossed in English. */
const EXTRA: { thai: string; roman: string; en: string }[] = [
  { thai: "คุณ", roman: "khun", en: "you" },
  { thai: "ขอกาแฟเย็น", roman: "khǎw gaa-faae yen", en: "An iced coffee, please." },
  { thai: "ขอชาเย็น", roman: "khǎw chaa yen", en: "An iced tea, please." },
  { thai: "กาแฟเย็น", roman: "gaa-faae yen", en: "iced coffee" },
  { thai: "แพงไป", roman: "phaaeng bpai", en: "too expensive" },
  { thai: "ถูกไป", roman: "thùuk bpai", en: "too cheap" },
  { thai: "ลดหน่อย", roman: "lót nàwy", en: "a little discount, please" },
  { thai: "เลี้ยวซ้าย", roman: "líaw sáai", en: "turn left" },
  { thai: "เลี้ยวขวา", roman: "líaw khwǎa", en: "turn right" },
  { thai: "ตรงไป", roman: "dtrong bpai", en: "go straight" },
  { thai: "จอดที่นี่", roman: "jàwt thîi-nîi", en: "stop here" },
  { thai: "จอด", roman: "jàwt", en: "to park, to stop (a vehicle)" },
  { thai: "สบาย", roman: "sà-baai", en: "comfortable, well" },
  { thai: "ดี", roman: "dii", en: "good" },
  { thai: "แล้ว", roman: "láew", en: "already; then" },
  { thai: "เจอ", roman: "jer", en: "to meet" },
  { thai: "กัน", roman: "gan", en: "each other, together" },
  { thai: "น้ำ", roman: "náam", en: "water" },
];

export interface Gloss {
  thai: string;
  roman: string;
  en: string;
}

const MAP = new Map<string, Gloss>();
for (const v of VOCAB) MAP.set(v.thai, { thai: v.thai, roman: v.roman, en: v.en });
for (const e of EXTRA) if (!MAP.has(e.thai)) MAP.set(e.thai, e);
// Whole scene lines (both particle versions), so any full sentence can be glossed too.
for (const s of SCENES)
  for (const l of s.lines)
    for (const voice of ["male", "female"] as const) {
      const thai = typeof l.thai === "string" ? l.thai : l.thai[voice];
      const roman = typeof l.roman === "string" ? l.roman : l.roman[voice];
      if (!thai.includes("{name}") && !MAP.has(thai)) MAP.set(thai, { thai, roman, en: l.en });
    }

export function gloss(thai: string): Gloss | undefined {
  return MAP.get(thai);
}

/** English for a Thai sentence: exact match, or the scene line that contains it. */
export function meaningOf(thai: string): string | undefined {
  const g = MAP.get(thai);
  if (g) return g.en;
  for (const s of SCENES)
    for (const l of s.lines)
      for (const voice of ["male", "female"] as const) {
        const t = typeof l.thai === "string" ? l.thai : l.thai[voice];
        if (t.includes(thai)) return l.en;
      }
  return undefined;
}

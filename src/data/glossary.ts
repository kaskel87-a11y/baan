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
  { thai: "ไม่รับ", roman: "mâi ráp", en: "no thanks (I won't take it)" },
  { thai: "รับถุง", roman: "ráp thǔng", en: "take a bag" },
  { thai: "ต่อรถ", roman: "dtàw rót", en: "transfer trains" },
  { thai: "ลงสถานี", roman: "long sà-thǎa-nii", en: "get off at the station" },
  { thai: "ไม่เข้าใจ", roman: "mâi khâo-jai", en: "I don’t understand" },
  { thai: "พูดช้าๆหน่อย", roman: "phûut cháa-cháa nàwy", en: "please speak a little slower" },
  { thai: "เดินไปได้", roman: "dern bpai dâai", en: "can walk there" },
  { thai: "อยู่ที่ไหน", roman: "yùu thîi nǎi", en: "where is it?" },
  { thai: "ใกล้ไหม", roman: "glâi mǎi", en: "is it close?" },
  { thai: "เบาๆหน่อย", roman: "bao-bao nàwy", en: "a little softer, please" },
  { thai: "ไม่แรง", roman: "mâi raeng", en: "not so hard" },
  { thai: "ปวดหัว", roman: "bpùat hǔa", en: "headache; my head hurts" },
  { thai: "มียาไหม", roman: "mii yaa mǎi", en: "do you have medicine?" },
  { thai: "เจ็บตรงไหน", roman: "jèp dtrong nǎi", en: "where does it hurt?" },
  { thai: "แรงไป", roman: "raeng bpai", en: "too hard" },
  { thai: "มาจาก", roman: "maa jàak", en: "come from" },
  { thai: "มาจากไหน", roman: "maa jàak nǎi", en: "where are you from?" },
  { thai: "พูดไทย", roman: "phûut thai", en: "speak Thai" },
  { thai: "พูดได้", roman: "phûut dâai", en: "can speak" },
  { thai: "อาทิตย์", roman: "aa-thít", en: "week" },
  { thai: "อาทิตย์เดียว", roman: "aa-thít diaw", en: "just one week" },
  { thai: "อเมริกา", roman: "à-mee-rí-gaa", en: "America" },
  { thai: "ไม่นาน", roman: "mâi naan", en: "not long" },
  { thai: "เช็คอิน", roman: "chék-in", en: "check in" },
  { thai: "จองไว้แล้ว", roman: "jawng wái láew", en: "I have a booking" },
  { thai: "ไว้", roman: "wái", en: "(done) ahead, kept" },
  { thai: "กี่คืน", roman: "gìi khuen", en: "how many nights?" },
  { thai: "สามคืน", roman: "sǎam khuen", en: "three nights" },
  { thai: "กี่โมง", roman: "gìi moong", en: "what time?" },
  { thai: "เช้า", roman: "cháo", en: "morning" },
  { thai: "ศูนย์", roman: "sǔun", en: "zero" },
  { thai: "ถึง", roman: "thǔeng", en: "until; to reach" },
  { thai: "ไวไฟ", roman: "wai-fai", en: "Wi-Fi" },
  { thai: "เขียน", roman: "khǐan", en: "to write" },
  { thai: "ตรงนี้", roman: "dtrong níi", en: "right here" },
  { thai: "บ่าย", roman: "bàai", en: "afternoon" },
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

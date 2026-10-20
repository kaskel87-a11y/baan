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
  { thai: "ลองเสื้อ", roman: "lawng sûea", en: "try on clothes" },
  { thai: "เสื้อผ้า", roman: "sûea-phâa", en: "clothes" },
  { thai: "ห้องลองเสื้อ", roman: "hâwng lawng sûea", en: "fitting room" },
  { thai: "ตรงนั้น", roman: "dtrong nán", en: "over there" },
  { thai: "ใส่", roman: "sài", en: "to wear" },
  { thai: "ไซซ์", roman: "sai", en: "size" },
  { thai: "เล็กกว่า", roman: "lék gwàa", en: "smaller" },
  { thai: "ใหญ่ไป", roman: "yài bpai", en: "too big" },
  { thai: "อื่น", roman: "ùuen", en: "other" },
  { thai: "สีอื่น", roman: "sǐi ùuen", en: "another color" },
  { thai: "ดำ", roman: "dam", en: "black" },
  { thai: "ขาว", roman: "khǎaw", en: "white" },
  { thai: "กับ", roman: "gàp", en: "and, with" },
  { thai: "ตัวนี้", roman: "dtua níi", en: "this one (clothes)" },
  { thai: "เลือก", roman: "lûeak", en: "to choose" },
  { thai: "ดู", roman: "duu", en: "to look, watch" },
  { thai: "ข้าวผัด", roman: "khâaw phàt", en: "fried rice" },
  { thai: "ข้าวผัดหมู", roman: "khâaw phàt mǔu", en: "pork fried rice" },
  { thai: "หมู", roman: "mǔu", en: "pork" },
  { thai: "หนึ่ง", roman: "nùeng", en: "one" },
  { thai: "หรือ", roman: "rǔue", en: "or" },
  { thai: "ด้วย", roman: "dûay", en: "too, as well" },
  { thai: "รอ", roman: "raw", en: "to wait" },
  { thai: "นาที", roman: "naa-thii", en: "minute" },
  { thai: "ห้า", roman: "hâa", en: "five" },
  { thai: "น้ำแข็ง", roman: "náam-khǎeng", en: "ice" },
  { thai: "พริก", roman: "phrík", en: "chili" },
  { thai: "ไม่ใส่ผักชี", roman: "mâi sài phàk-chii", en: "no cilantro" },
  { thai: "กินที่นี่", roman: "gin thîi-nîi", en: "eat here" },
  { thai: "ใส่ถุง", roman: "sài thǔng", en: "put it in a bag" },
  { thai: "นะ", roman: "ná", en: "softener for a friendly request" },
  { thai: "ละ", roman: "lá", en: "per, each" },
  { thai: "กิโลละ", roman: "gì-loo lá", en: "per kilo" },
  { thai: "เพิ่ม", roman: "phêrm", en: "extra, more" },
  { thai: "ยี่สิบ", roman: "yîi-sìp", en: "twenty" },
  { thai: "สี่สิบ", roman: "sìi-sìp", en: "forty" },
  { thai: "งั้น", roman: "ngán", en: "then, in that case" },
  { thai: "ไม่ต้อง", roman: "mâi dtâwng", en: "no need to" },
  { thai: "ไม่ต้องรีด", roman: "mâi dtâwng rîit", en: "no need to iron" },
  { thai: "จะ", roman: "jà", en: "will (future)" },
  { thai: "มารับ", roman: "maa ráp", en: "come and pick up" },
  { thai: "ใบรับผ้า", roman: "bai ráp phâa", en: "laundry ticket" },
  { thai: "ผ้า", roman: "phâa", en: "cloth" },
  { thai: "ไม่ต้องทอน", roman: "mâi dtâwng thawn", en: "keep the change" },
  { thai: "ชั่วโมง", roman: "chûa-moong", en: "hour" },
  { thai: "เสร็จแล้ว", roman: "sèt láew", en: "it's done" },
  { thai: "ตัด", roman: "dtàt", en: "to cut" },
  { thai: "สองร้อย", roman: "sǎawng-ráwy", en: "two hundred" },
  { thai: "อย่างเดียว", roman: "yàang diaw", en: "only, just that" },
  { thai: "ตัดอย่างเดียว", roman: "dtàt yàang diaw", en: "just the cut" },
  { thai: "แบบไหน", roman: "bàaep nǎi", en: "what kind, which style" },
  { thai: "ข้างๆ", roman: "khâang-khâang", en: "the sides, beside" },
  { thai: "ข้างบน", roman: "khâang bon", en: "on top, upstairs" },
  { thai: "บน", roman: "bon", en: "on, above" },
  { thai: "ประมาณนี้", roman: "bprà-maan níi", en: "about like this" },
  { thai: "ประมาณ", roman: "bprà-maan", en: "about, roughly" },
  { thai: "พอแล้ว", roman: "phaw láew", en: "that's enough" },
  { thai: "พอดี", roman: "phaw-dii", en: "just right, fits well" },
  { thai: "อิ่มแล้ว", roman: "ìm láew", en: "I'm full" },
  { thai: "ผม", roman: "phǒm", en: "I (male speaker); hair" },
  { thai: "อยาก", roman: "yàak", en: "to want to" },
  { thai: "อยากได้", roman: "yàak dâai", en: "I'd like, want to get" },
  { thai: "รับอะไรดี", roman: "ráp à-rai dii", en: "what can I get you" },
  { thai: "เจ็ดวัน", roman: "jèt wan", en: "seven days" },
  { thai: "สามสิบวัน", roman: "sǎam-sìp wan", en: "thirty days" },
  { thai: "สามสิบ", roman: "sǎam-sìp", en: "thirty" },
  { thai: "ห้าร้อย", roman: "hâa-ráwy", en: "five hundred" },
  { thai: "จำกัด", roman: "jam-gàt", en: "to limit" },
  { thai: "ช่วย", roman: "chûay", en: "to help; please (do this)" },
  { thai: "ให้", roman: "hâi", en: "for (someone); to give" },
  { thai: "ใช้ได้", roman: "chái dâai", en: "it works, usable" },
  { thai: "ใช้ไม่ได้", roman: "chái mâi dâai", en: "it doesn't work" },
  { thai: "หมด", roman: "mòt", en: "to run out, all gone" },
  { thai: "เติม", roman: "dterm", en: "to add, refill" },
  { thai: "เงิน", roman: "ngern", en: "money" },
  { thai: "ที่ไหน", roman: "thîi nǎi", en: "where" },
  { thai: "เซเว่น", roman: "se-wên", en: "7-Eleven" },
  { thai: "ว่าง", roman: "wâang", en: "free, not busy" },
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

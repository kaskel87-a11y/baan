// Ported verbatim from the Grok-hosted Baan build (routes-BILTYoNg.js).
import type { Consonant, VowelCard } from "./types";

export const CONSONANTS: Consonant[] = [
  {
    "letter": "ก",
    "chant": "กอ ไก่",
    "example": {
      "thai": "ไก่",
      "roman": "kài",
      "en": "chicken"
    }
  },
  {
    "letter": "ข",
    "chant": "ขอ ไข่",
    "example": {
      "thai": "ไข่",
      "roman": "khài",
      "en": "egg"
    }
  },
  {
    "letter": "ฃ",
    "chant": "ขอ ขวด",
    "obsolete": true
  },
  {
    "letter": "ค",
    "chant": "คอ ควาย",
    "example": {
      "thai": "คน",
      "roman": "khon",
      "en": "person"
    }
  },
  {
    "letter": "ฅ",
    "chant": "คอ คน",
    "obsolete": true
  },
  {
    "letter": "ฆ",
    "chant": "คอ ระฆัง"
  },
  {
    "letter": "ง",
    "chant": "งอ งู",
    "example": {
      "thai": "งู",
      "roman": "nguu",
      "en": "snake"
    }
  },
  {
    "letter": "จ",
    "chant": "จอ จาน",
    "example": {
      "thai": "จาน",
      "roman": "jaan",
      "en": "plate"
    }
  },
  {
    "letter": "ฉ",
    "chant": "ฉอ ฉิ่ง",
    "example": {
      "thai": "ฉัน",
      "roman": "chǎn",
      "en": "I"
    }
  },
  {
    "letter": "ช",
    "chant": "ชอ ช้าง",
    "example": {
      "thai": "ช้าง",
      "roman": "cháang",
      "en": "elephant"
    }
  },
  {
    "letter": "ซ",
    "chant": "ซอ โซ่",
    "example": {
      "thai": "โซ่",
      "roman": "sôo",
      "en": "chain"
    }
  },
  {
    "letter": "ฌ",
    "chant": "ชอ เฌอ"
  },
  {
    "letter": "ญ",
    "chant": "ยอ หญิง"
  },
  {
    "letter": "ฎ",
    "chant": "ดอ ชฎา"
  },
  {
    "letter": "ฏ",
    "chant": "ตอ ปฏัก"
  },
  {
    "letter": "ฐ",
    "chant": "ถอ ฐาน"
  },
  {
    "letter": "ฑ",
    "chant": "ทอ มณโฑ"
  },
  {
    "letter": "ฒ",
    "chant": "ทอ ผู้เฒ่า"
  },
  {
    "letter": "ณ",
    "chant": "นอ เณร"
  },
  {
    "letter": "ด",
    "chant": "ดอ เด็ก",
    "example": {
      "thai": "เด็ก",
      "roman": "dèk",
      "en": "child"
    }
  },
  {
    "letter": "ต",
    "chant": "ตอ เต่า",
    "example": {
      "thai": "ตา",
      "roman": "dtaa",
      "en": "eye"
    }
  },
  {
    "letter": "ถ",
    "chant": "ถอ ถุง",
    "example": {
      "thai": "ถุง",
      "roman": "thǔng",
      "en": "bag"
    }
  },
  {
    "letter": "ท",
    "chant": "ทอ ทหาร",
    "example": {
      "thai": "ทอง",
      "roman": "thaawng",
      "en": "gold"
    }
  },
  {
    "letter": "ธ",
    "chant": "ทอ ธง"
  },
  {
    "letter": "น",
    "chant": "นอ หนู",
    "example": {
      "thai": "น้ำ",
      "roman": "náam",
      "en": "water"
    }
  },
  {
    "letter": "บ",
    "chant": "บอ ใบไม้",
    "example": {
      "thai": "บ้าน",
      "roman": "bâan",
      "en": "house"
    }
  },
  {
    "letter": "ป",
    "chant": "ปอ ปลา",
    "example": {
      "thai": "ปลา",
      "roman": "bplaa",
      "en": "fish"
    }
  },
  {
    "letter": "ผ",
    "chant": "ผอ ผึ้ง",
    "example": {
      "thai": "ผึ้ง",
      "roman": "phûeng",
      "en": "bee"
    }
  },
  {
    "letter": "ฝ",
    "chant": "ฝอ ฝา",
    "example": {
      "thai": "ฝน",
      "roman": "fǒn",
      "en": "rain"
    }
  },
  {
    "letter": "พ",
    "chant": "พอ พาน",
    "example": {
      "thai": "พ่อ",
      "roman": "phâaw",
      "en": "father"
    }
  },
  {
    "letter": "ฟ",
    "chant": "ฟอ ฟัน",
    "example": {
      "thai": "ไฟ",
      "roman": "fai",
      "en": "fire"
    }
  },
  {
    "letter": "ภ",
    "chant": "พอ สำเภา"
  },
  {
    "letter": "ม",
    "chant": "มอ ม้า",
    "example": {
      "thai": "มา",
      "roman": "maa",
      "en": "come"
    }
  },
  {
    "letter": "ย",
    "chant": "ยอ ยักษ์",
    "example": {
      "thai": "ยา",
      "roman": "yaa",
      "en": "medicine"
    }
  },
  {
    "letter": "ร",
    "chant": "รอ เรือ",
    "example": {
      "thai": "เรือ",
      "roman": "ruea",
      "en": "boat"
    }
  },
  {
    "letter": "ล",
    "chant": "ลอ ลิง",
    "example": {
      "thai": "ลิง",
      "roman": "ling",
      "en": "monkey"
    }
  },
  {
    "letter": "ว",
    "chant": "วอ แหวน",
    "example": {
      "thai": "วัน",
      "roman": "wan",
      "en": "day"
    }
  },
  {
    "letter": "ศ",
    "chant": "สอ ศาลา"
  },
  {
    "letter": "ษ",
    "chant": "สอ ฤๅษี"
  },
  {
    "letter": "ส",
    "chant": "สอ เสือ",
    "example": {
      "thai": "เสือ",
      "roman": "sǔea",
      "en": "tiger"
    }
  },
  {
    "letter": "ห",
    "chant": "หอ หีบ",
    "example": {
      "thai": "หมา",
      "roman": "mǎa",
      "en": "dog"
    }
  },
  {
    "letter": "ฬ",
    "chant": "ลอ จุฬา"
  },
  {
    "letter": "อ",
    "chant": "ออ อ่าง",
    "example": {
      "thai": "อ่าง",
      "roman": "àang",
      "en": "basin"
    }
  },
  {
    "letter": "ฮ",
    "chant": "ฮอ นกฮูก"
  }
];

export const VOWELS: VowelCard[] = [
  {
    "sign": "–า",
    "roman": "aa",
    "thai": "มา",
    "en": "come",
    "note": "Long a."
  },
  {
    "sign": "–ิ",
    "roman": "i",
    "thai": "กิน",
    "en": "eat",
    "note": "Short i. ก is unaspirated: gin, not kin."
  },
  {
    "sign": "–ี",
    "roman": "ii",
    "thai": "มี",
    "en": "to have",
    "note": "Long i."
  },
  {
    "sign": "–ู",
    "roman": "uu",
    "thai": "งู",
    "en": "snake",
    "note": "Long u."
  },
  {
    "sign": "–ือ",
    "roman": "ue",
    "thai": "ชื่อ",
    "en": "name",
    "note": "Like ee, with unrounded lips. The mark makes this one falling."
  },
  {
    "sign": "เ–",
    "roman": "e",
    "thai": "เล่น",
    "en": "to play",
    "note": "The mark makes lên falling."
  },
  {
    "sign": "แ–",
    "roman": "ae",
    "thai": "แปด",
    "en": "eight",
    "note": "Long ae. Dead ending, so แปด is low."
  },
  {
    "sign": "โ–",
    "roman": "o",
    "thai": "โต",
    "en": "to grow",
    "note": "Long o. ต is unaspirated: dtoo."
  },
  {
    "sign": "–อ",
    "roman": "aw",
    "thai": "พ่อ",
    "en": "father",
    "note": "Long aw. Falling here because of the mark on a low-class letter."
  },
  {
    "sign": "ไ–",
    "roman": "ai",
    "thai": "ไป",
    "en": "to go",
    "note": "ป is unaspirated: bpai."
  },
  {
    "sign": "เ–า",
    "roman": "ao",
    "thai": "เรา",
    "en": "we",
    "note": "Mid tone."
  },
  {
    "sign": "–ำ",
    "roman": "am",
    "thai": "ทำ",
    "en": "to do",
    "note": "Mid tone."
  }
];

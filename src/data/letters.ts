// Ported from the Grok-hosted Baan build (routes-BILTYoNg.js); later content fixes are listed in CHANGELOG.md.
import type { Consonant, VowelCard } from "./types";

export const CONSONANTS: Consonant[] = [
  {
    "letter": "ก",
    "chant": "กอ ไก่",
    "chantRoman": "gaw gài",
    "chantEn": "chicken",
    "example": {
      "thai": "ไก่",
      "roman": "gài",
      "en": "chicken"
    }
  },
  {
    "letter": "ข",
    "chant": "ขอ ไข่",
    "chantRoman": "khǎw khài",
    "chantEn": "egg",
    "example": {
      "thai": "ไข่",
      "roman": "khài",
      "en": "egg"
    }
  },
  {
    "letter": "ฃ",
    "chant": "ขอ ขวด",
    "chantRoman": "khǎw khùat",
    "chantEn": "bottle",
    "obsolete": true
  },
  {
    "letter": "ค",
    "chant": "คอ ควาย",
    "chantRoman": "khaw khwaai",
    "chantEn": "water buffalo",
    "example": {
      "thai": "คน",
      "roman": "khon",
      "en": "person"
    }
  },
  {
    "letter": "ฅ",
    "chant": "คอ คน",
    "chantRoman": "khaw khon",
    "chantEn": "person",
    "obsolete": true
  },
  {
    "letter": "ฆ",
    "chant": "คอ ระฆัง",
    "chantRoman": "khaw rá-khang",
    "chantEn": "bell"
  },
  {
    "letter": "ง",
    "chant": "งอ งู",
    "chantRoman": "ngaw nguu",
    "chantEn": "snake",
    "example": {
      "thai": "งู",
      "roman": "nguu",
      "en": "snake"
    }
  },
  {
    "letter": "จ",
    "chant": "จอ จาน",
    "chantRoman": "jaw jaan",
    "chantEn": "plate",
    "example": {
      "thai": "จาน",
      "roman": "jaan",
      "en": "plate"
    }
  },
  {
    "letter": "ฉ",
    "chant": "ฉอ ฉิ่ง",
    "chantRoman": "chǎw chìng",
    "chantEn": "small cymbals",
    "example": {
      "thai": "ฉัน",
      "roman": "chǎn",
      "en": "I"
    }
  },
  {
    "letter": "ช",
    "chant": "ชอ ช้าง",
    "chantRoman": "chaw cháang",
    "chantEn": "elephant",
    "example": {
      "thai": "ช้าง",
      "roman": "cháang",
      "en": "elephant"
    }
  },
  {
    "letter": "ซ",
    "chant": "ซอ โซ่",
    "chantRoman": "saw sôo",
    "chantEn": "chain",
    "example": {
      "thai": "โซ่",
      "roman": "sôo",
      "en": "chain"
    }
  },
  {
    "letter": "ฌ",
    "chant": "ชอ เฌอ",
    "chantRoman": "chaw cher",
    "chantEn": "tree"
  },
  {
    "letter": "ญ",
    "chant": "ยอ หญิง",
    "chantRoman": "yaw yǐng",
    "chantEn": "woman"
  },
  {
    "letter": "ฎ",
    "chant": "ดอ ชฎา",
    "chantRoman": "daw chá-daa",
    "chantEn": "dancer's headdress"
  },
  {
    "letter": "ฏ",
    "chant": "ตอ ปฏัก",
    "chantRoman": "dtaw bpà-dtàk",
    "chantEn": "goad"
  },
  {
    "letter": "ฐ",
    "chant": "ถอ ฐาน",
    "chantRoman": "thǎw thǎan",
    "chantEn": "pedestal"
  },
  {
    "letter": "ฑ",
    "chant": "ทอ มณโฑ",
    "chantRoman": "thaw mon-thoo",
    "chantEn": "Montho (a queen in the Ramakien)"
  },
  {
    "letter": "ฒ",
    "chant": "ทอ ผู้เฒ่า",
    "chantRoman": "thaw phûu-thâo",
    "chantEn": "elder"
  },
  {
    "letter": "ณ",
    "chant": "นอ เณร",
    "chantRoman": "naw neen",
    "chantEn": "novice monk"
  },
  {
    "letter": "ด",
    "chant": "ดอ เด็ก",
    "chantRoman": "daw dèk",
    "chantEn": "child",
    "example": {
      "thai": "เด็ก",
      "roman": "dèk",
      "en": "child"
    }
  },
  {
    "letter": "ต",
    "chant": "ตอ เต่า",
    "chantRoman": "dtaw dtào",
    "chantEn": "turtle",
    "example": {
      "thai": "ตา",
      "roman": "dtaa",
      "en": "eye"
    }
  },
  {
    "letter": "ถ",
    "chant": "ถอ ถุง",
    "chantRoman": "thǎw thǔng",
    "chantEn": "bag",
    "example": {
      "thai": "ถุง",
      "roman": "thǔng",
      "en": "bag"
    }
  },
  {
    "letter": "ท",
    "chant": "ทอ ทหาร",
    "chantRoman": "thaw thá-hǎan",
    "chantEn": "soldier",
    "example": {
      "thai": "ทอง",
      "roman": "thaawng",
      "en": "gold"
    }
  },
  {
    "letter": "ธ",
    "chant": "ทอ ธง",
    "chantRoman": "thaw thong",
    "chantEn": "flag"
  },
  {
    "letter": "น",
    "chant": "นอ หนู",
    "chantRoman": "naw nǔu",
    "chantEn": "mouse",
    "example": {
      "thai": "น้ำ",
      "roman": "náam",
      "en": "water"
    }
  },
  {
    "letter": "บ",
    "chant": "บอ ใบไม้",
    "chantRoman": "baw bai-máai",
    "chantEn": "leaf",
    "example": {
      "thai": "บ้าน",
      "roman": "bâan",
      "en": "house"
    }
  },
  {
    "letter": "ป",
    "chant": "ปอ ปลา",
    "chantRoman": "bpaw bplaa",
    "chantEn": "fish",
    "example": {
      "thai": "ปลา",
      "roman": "bplaa",
      "en": "fish"
    }
  },
  {
    "letter": "ผ",
    "chant": "ผอ ผึ้ง",
    "chantRoman": "phǎw phûeng",
    "chantEn": "bee",
    "example": {
      "thai": "ผึ้ง",
      "roman": "phûeng",
      "en": "bee"
    }
  },
  {
    "letter": "ฝ",
    "chant": "ฝอ ฝา",
    "chantRoman": "fǎw fǎa",
    "chantEn": "lid",
    "example": {
      "thai": "ฝน",
      "roman": "fǒn",
      "en": "rain"
    }
  },
  {
    "letter": "พ",
    "chant": "พอ พาน",
    "chantRoman": "phaw phaan",
    "chantEn": "offering tray",
    "example": {
      "thai": "พ่อ",
      "roman": "phâaw",
      "en": "father"
    }
  },
  {
    "letter": "ฟ",
    "chant": "ฟอ ฟัน",
    "chantRoman": "faw fan",
    "chantEn": "tooth",
    "example": {
      "thai": "ไฟ",
      "roman": "fai",
      "en": "fire"
    }
  },
  {
    "letter": "ภ",
    "chant": "พอ สำเภา",
    "chantRoman": "phaw sǎm-phao",
    "chantEn": "sailing junk"
  },
  {
    "letter": "ม",
    "chant": "มอ ม้า",
    "chantRoman": "maw máa",
    "chantEn": "horse",
    "example": {
      "thai": "มา",
      "roman": "maa",
      "en": "come"
    }
  },
  {
    "letter": "ย",
    "chant": "ยอ ยักษ์",
    "chantRoman": "yaw yák",
    "chantEn": "giant",
    "example": {
      "thai": "ยา",
      "roman": "yaa",
      "en": "medicine"
    }
  },
  {
    "letter": "ร",
    "chant": "รอ เรือ",
    "chantRoman": "raw ruea",
    "chantEn": "boat",
    "example": {
      "thai": "เรือ",
      "roman": "ruea",
      "en": "boat"
    }
  },
  {
    "letter": "ล",
    "chant": "ลอ ลิง",
    "chantRoman": "law ling",
    "chantEn": "monkey",
    "example": {
      "thai": "ลิง",
      "roman": "ling",
      "en": "monkey"
    }
  },
  {
    "letter": "ว",
    "chant": "วอ แหวน",
    "chantRoman": "waw wǎaen",
    "chantEn": "ring",
    "example": {
      "thai": "วัน",
      "roman": "wan",
      "en": "day"
    }
  },
  {
    "letter": "ศ",
    "chant": "สอ ศาลา",
    "chantRoman": "sǎw sǎa-laa",
    "chantEn": "pavilion"
  },
  {
    "letter": "ษ",
    "chant": "สอ ฤๅษี",
    "chantRoman": "sǎw rue-sǐi",
    "chantEn": "hermit"
  },
  {
    "letter": "ส",
    "chant": "สอ เสือ",
    "chantRoman": "sǎw sǔea",
    "chantEn": "tiger",
    "example": {
      "thai": "เสือ",
      "roman": "sǔea",
      "en": "tiger"
    }
  },
  {
    "letter": "ห",
    "chant": "หอ หีบ",
    "chantRoman": "hǎw hìip",
    "chantEn": "chest, box",
    "example": {
      "thai": "ห้า",
      "roman": "hâa",
      "en": "five"
    },
    "note": "Silent in หมา, หนู, หมอ: it only raises the tone."
  },
  {
    "letter": "ฬ",
    "chant": "ลอ จุฬา",
    "chantRoman": "law jù-laa",
    "chantEn": "star-shaped kite"
  },
  {
    "letter": "อ",
    "chant": "ออ อ่าง",
    "chantRoman": "aw àang",
    "chantEn": "basin",
    "example": {
      "thai": "อ่าง",
      "roman": "àang",
      "en": "basin"
    }
  },
  {
    "letter": "ฮ",
    "chant": "ฮอ นกฮูก",
    "chantRoman": "haw nók-hûuk",
    "chantEn": "owl"
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

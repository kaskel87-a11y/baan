// Ported from the Grok-hosted Baan build (routes-BILTYoNg.js); later content fixes are listed in CHANGELOG.md.
import type { Scene } from "./types";

export const SCENES: Scene[] = [
  {
    "id": "cafe",
    "title": "The café door",
    "titleTh": "ที่ร้านกาแฟ",
    "blurb": "Hello, how you are, and your name — with the particle you will actually use.",
    "vocab": [
      "sawatdii",
      "khrap",
      "kha",
      "khaq",
      "sabaai",
      "mai-q",
      "chue",
      "phom",
      "chan"
    ],
    "lines": [
      {
        "id": "c1",
        "who": "nid",
        "en": "Hello.",
        "thai": "สวัสดีค่ะ",
        "roman": "sà-wàt-dii khâ",
        "note": "สวัสดี is low, low, mid. Her ค่ะ is falling."
      },
      {
        "id": "c2",
        "who": "you",
        "en": "Hello.",
        "thai": {
          "male": "สวัสดีครับ",
          "female": "สวัสดีค่ะ"
        },
        "roman": {
          "male": "sà-wàt-dii khráp",
          "female": "sà-wàt-dii khâ"
        },
        "note": "Male speakers close with ครับ, high. Female speakers close a statement with ค่ะ, falling."
      },
      {
        "id": "c3",
        "who": "nid",
        "en": "How are you?",
        "thai": "สบายดีไหมคะ",
        "roman": "sà-baai dii mǎi khá",
        "note": "ไหม rises and makes it a question. Her question particle is คะ, high — not ค่ะ."
      },
      {
        "id": "c4",
        "who": "you",
        "en": "I'm well.",
        "thai": {
          "male": "สบายดีครับ",
          "female": "สบายดีค่ะ"
        },
        "roman": {
          "male": "sà-baai dii khráp",
          "female": "sà-baai dii khâ"
        }
      },
      {
        "id": "c5",
        "who": "nid",
        "en": "What's your name?",
        "thai": "ชื่ออะไรคะ",
        "roman": "chûue à-rai khá"
      },
      {
        "id": "c6",
        "who": "you",
        "en": "My name is…",
        "thai": {
          "male": "ผมชื่อ{name}ครับ",
          "female": "ฉันชื่อ{name}ค่ะ"
        },
        "roman": {
          "male": "phǒm chûue {name} khráp",
          "female": "chǎn chûue {name} khâ"
        },
        "note": "ผม and ฉัน are both rising. ผม is for a male speaker. ฉัน is the everyday word, often from a woman."
      },
      {
        "id": "c7",
        "who": "nid",
        "en": "Nice to meet you.",
        "thai": "ยินดีที่ได้รู้จักค่ะ",
        "roman": "yin-dii thîi dâai rúu-jàk khâ",
        "note": "รู้ is high. จัก is low."
      },
      {
        "id": "c8",
        "who": "you",
        "en": "Nice to meet you too.",
        "thai": {
          "male": "ยินดีที่ได้รู้จักครับ",
          "female": "ยินดีที่ได้รู้จักค่ะ"
        },
        "roman": {
          "male": "yin-dii thîi dâai rúu-jàk khráp",
          "female": "yin-dii thîi dâai rúu-jàk khâ"
        }
      }
    ],
    "drills": [
      {
        "id": "c-l",
        "kind": "listen",
        "thai": "สวัสดีค่ะ",
        "roman": "sà-wàt-dii khâ",
        "en": "Hello.",
        "options": [
          "Hello.",
          "Thank you.",
          "How much?",
          "Goodbye."
        ]
      },
      {
        "id": "c-r",
        "kind": "read",
        "thai": "สบายดีไหมคะ",
        "roman": "sà-baai dii mǎi khá",
        "en": "How are you?",
        "options": [
          "How are you?",
          "What's your name?",
          "I'm well.",
          "Nice to meet you."
        ]
      },
      {
        "id": "c-p",
        "kind": "pick",
        "en": "How do you say “I” in your voice?",
        "options": [
          "ผม",
          "ฉัน",
          "คุณ",
          "ชื่อ"
        ],
        "answer": {
          "male": "ผม",
          "female": "ฉัน"
        },
        "roman": {
          "male": "phǒm",
          "female": "chǎn"
        }
      },
      {
        "id": "c-b",
        "kind": "build",
        "en": "How are you?",
        "tiles": [
          "สบาย",
          "ดี",
          "ไหม",
          "ครับ",
          "คะ",
          "ไม่"
        ],
        "answer": {
          "male": [
            "สบาย",
            "ดี",
            "ไหม",
            "ครับ"
          ],
          "female": [
            "สบาย",
            "ดี",
            "ไหม",
            "คะ"
          ]
        },
        "roman": {
          "male": "sà-baai dii mǎi khráp",
          "female": "sà-baai dii mǎi khá"
        }
      },
      {
        "id": "c-part",
        "kind": "particle",
        "en": "You're telling her you're well.",
        "stem": "สบายดี",
        "stemRoman": "sà-baai dii",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "order",
    "title": "Ordering",
    "titleTh": "สั่งกาแฟ",
    "blurb": "Ask for an iced coffee, how sweet, and what it costs.",
    "vocab": [
      "kho",
      "coffee",
      "yen",
      "waan",
      "noi",
      "thao-rai",
      "baat",
      "khop"
    ],
    "lines": [
      {
        "id": "o1",
        "who": "nid",
        "en": "What can I get you?",
        "thai": "รับอะไรดีคะ",
        "roman": "ráp à-rai dii khá",
        "note": "รับ is high. This is the line every café opens with."
      },
      {
        "id": "o2",
        "who": "you",
        "en": "An iced coffee, please.",
        "thai": {
          "male": "ขอกาแฟเย็นครับ",
          "female": "ขอกาแฟเย็นค่ะ"
        },
        "roman": {
          "male": "khǎw gaa-faae yen khráp",
          "female": "khǎw gaa-faae yen khâ"
        },
        "note": "ขอ rises. It is the polite way to ask for something."
      },
      {
        "id": "o3",
        "who": "nid",
        "en": "A little sweet?",
        "thai": "หวานน้อยไหมคะ",
        "roman": "wǎan náwy mǎi khá",
        "note": "หวาน rises. น้อย is high — “a little”."
      },
      {
        "id": "o4",
        "who": "you",
        "en": "Just a little sweet.",
        "thai": {
          "male": "หวานน้อยครับ",
          "female": "หวานน้อยค่ะ"
        },
        "roman": {
          "male": "wǎan náwy khráp",
          "female": "wǎan náwy khâ"
        }
      },
      {
        "id": "o5",
        "who": "you",
        "en": "How much is that?",
        "thai": {
          "male": "เท่าไหร่ครับ",
          "female": "เท่าไหร่คะ"
        },
        "roman": {
          "male": "thâo-rài khráp",
          "female": "thâo-rài khá"
        },
        "note": "A question. Female speakers switch to คะ here."
      },
      {
        "id": "o6",
        "who": "nid",
        "en": "Fifty-five baht.",
        "thai": "ห้าสิบห้าบาทค่ะ",
        "roman": "hâa-sìp-hâa bàat khâ"
      },
      {
        "id": "o7",
        "who": "you",
        "en": "Thank you.",
        "thai": {
          "male": "ขอบคุณครับ",
          "female": "ขอบคุณค่ะ"
        },
        "roman": {
          "male": "khàwp-khun khráp",
          "female": "khàwp-khun khâ"
        },
        "note": "ขอบคุณ is low, then mid."
      }
    ],
    "drills": [
      {
        "id": "o-l",
        "kind": "listen",
        "thai": "รับอะไรดีคะ",
        "roman": "ráp à-rai dii khá",
        "en": "What can I get you?",
        "options": [
          "What can I get you?",
          "How much is that?",
          "A little sweet?",
          "Thank you."
        ]
      },
      {
        "id": "o-r",
        "kind": "read",
        "thai": "หวานน้อยไหมคะ",
        "roman": "wǎan náwy mǎi khá",
        "en": "A little sweet?",
        "options": [
          "A little sweet?",
          "An iced coffee, please.",
          "Fifty-five baht.",
          "How much is that?"
        ]
      },
      {
        "id": "o-p",
        "kind": "pick",
        "en": "“An iced coffee, please.”",
        "options": [
          "ขอกาแฟเย็น",
          "ขอชาเย็น",
          "น้ำเปล่า",
          "ขอบคุณ"
        ],
        "answer": "ขอกาแฟเย็น",
        "roman": "khǎw gaa-faae yen"
      },
      {
        "id": "o-b",
        "kind": "build",
        "en": "How much is that?",
        "tiles": [
          "เท่าไหร่",
          "ครับ",
          "ค่ะ",
          "คะ",
          "บาท"
        ],
        "answer": {
          "male": [
            "เท่าไหร่",
            "ครับ"
          ],
          "female": [
            "เท่าไหร่",
            "คะ"
          ]
        },
        "roman": {
          "male": "thâo-rài khráp",
          "female": "thâo-rài khá"
        }
      },
      {
        "id": "o-part",
        "kind": "particle",
        "en": "You're asking the price.",
        "stem": "เท่าไหร่",
        "stemRoman": "thâo-rài",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "market",
    "title": "The market",
    "titleTh": "ที่ตลาด",
    "blurb": "A price, a pushback, and the yes that closes it.",
    "vocab": [
      "an-nii",
      "phaeng",
      "thuuk",
      "lot",
      "noi-req",
      "ao",
      "bpai"
    ],
    "lines": [
      {
        "id": "m1",
        "who": "lung",
        "en": "Hello. What are you looking for?",
        "thai": "สวัสดีครับ ดูอะไรครับ",
        "roman": "sà-wàt-dii khráp duu à-rai khráp"
      },
      {
        "id": "m2",
        "who": "you",
        "en": "How much is this one?",
        "thai": {
          "male": "อันนี้เท่าไหร่ครับ",
          "female": "อันนี้เท่าไหร่คะ"
        },
        "roman": {
          "male": "an-níi thâo-rài khráp",
          "female": "an-níi thâo-rài khá"
        },
        "note": "นี้ is high."
      },
      {
        "id": "m3",
        "who": "lung",
        "en": "One hundred twenty baht.",
        "thai": "ร้อยยี่สิบบาทครับ",
        "roman": "ráwy yîi-sìp bàat khráp",
        "note": "Twenty is ยี่สิบ, not สองสิบ. ร้อย is high. ยี่ is falling. สิบ is low."
      },
      {
        "id": "m4",
        "who": "you",
        "en": "That's too expensive.",
        "thai": {
          "male": "แพงไปครับ",
          "female": "แพงไปค่ะ"
        },
        "roman": {
          "male": "phaaeng bpai khráp",
          "female": "phaaeng bpai khâ"
        },
        "note": "ไป here means “too”, not “go”. ถูก, low, would mean cheap."
      },
      {
        "id": "m5",
        "who": "you",
        "en": "Can you come down a little?",
        "thai": {
          "male": "ลดหน่อยได้ไหมครับ",
          "female": "ลดหน่อยได้ไหมคะ"
        },
        "roman": {
          "male": "lót nàwy dâai mǎi khráp",
          "female": "lót nàwy dâai mǎi khá"
        },
        "note": "หน่อย is low. It softens the ask. น้อย is a different word, and high."
      },
      {
        "id": "m6",
        "who": "lung",
        "en": "One hundred baht, sure.",
        "thai": "ร้อยบาทได้ครับ",
        "roman": "ráwy bàat dâai khráp"
      },
      {
        "id": "m7",
        "who": "you",
        "en": "I'll take this one.",
        "thai": {
          "male": "เอาอันนี้ครับ",
          "female": "เอาอันนี้ค่ะ"
        },
        "roman": {
          "male": "ao an-níi khráp",
          "female": "ao an-níi khâ"
        }
      }
    ],
    "drills": [
      {
        "id": "m-l",
        "kind": "listen",
        "thai": {
          "male": "อันนี้เท่าไหร่ครับ",
          "female": "อันนี้เท่าไหร่คะ"
        },
        "roman": {
          "male": "an-níi thâo-rài khráp",
          "female": "an-níi thâo-rài khá"
        },
        "en": "How much is this one?",
        "options": [
          "How much is this one?",
          "That's too expensive.",
          "I'll take this one.",
          "One hundred baht, sure."
        ]
      },
      {
        "id": "m-r",
        "kind": "read",
        "thai": "ร้อยบาทได้ครับ",
        "roman": "ráwy bàat dâai khráp",
        "en": "One hundred baht, sure.",
        "options": [
          "One hundred baht, sure.",
          "One hundred twenty baht.",
          "That's too expensive.",
          "How much is this one?"
        ]
      },
      {
        "id": "m-p",
        "kind": "pick",
        "en": "“That's too expensive.”",
        "options": [
          "แพงไป",
          "ถูกไป",
          "ลดหน่อย",
          "อร่อย"
        ],
        "answer": "แพงไป",
        "roman": "phaaeng bpai"
      },
      {
        "id": "m-b",
        "kind": "build",
        "en": "I'll take this one.",
        "tiles": [
          "เอา",
          "อันนี้",
          "ครับ",
          "ค่ะ",
          "ไม่"
        ],
        "answer": {
          "male": [
            "เอา",
            "อันนี้",
            "ครับ"
          ],
          "female": [
            "เอา",
            "อันนี้",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "ao an-níi khráp",
          "female": "ao an-níi khâ"
        }
      },
      {
        "id": "m-part",
        "kind": "particle",
        "en": "You're asking for a little discount.",
        "stem": "ลดหน่อยได้ไหม",
        "stemRoman": "lót nàwy dâai mǎi",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "street",
    "title": "In the car",
    "titleTh": "บนรถ",
    "blurb": "Where you're going, left and right, and where to stop.",
    "vocab": [
      "khuen",
      "rot",
      "liao",
      "sai",
      "khwaa",
      "thii-nii",
      "chai"
    ],
    "lines": [
      {
        "id": "s1",
        "who": "you",
        "en": "Can you go to Siam?",
        "thai": {
          "male": "ไปสยามได้ไหมครับ",
          "female": "ไปสยามได้ไหมคะ"
        },
        "roman": {
          "male": "bpai sà-yaam dâai mǎi khráp",
          "female": "bpai sà-yaam dâai mǎi khá"
        }
      },
      {
        "id": "s2",
        "who": "wit",
        "en": "Sure. Get in.",
        "thai": "ได้ครับ ขึ้นได้เลยครับ",
        "roman": "dâai khráp khûen dâai loei khráp",
        "note": "ขึ้น falls: high-class ข plus ้ gives a falling tone."
      },
      {
        "id": "s3",
        "who": "you",
        "en": "Turn left.",
        "thai": {
          "male": "เลี้ยวซ้ายครับ",
          "female": "เลี้ยวซ้ายค่ะ"
        },
        "roman": {
          "male": "líaw sáai khráp",
          "female": "líaw sáai khâ"
        },
        "note": "Both words are high. Right is ขวา, rising."
      },
      {
        "id": "s4",
        "who": "wit",
        "en": "Then straight ahead, yes?",
        "thai": "แล้วตรงไปใช่ไหมครับ",
        "roman": "láew dtrong bpai châi mǎi khráp"
      },
      {
        "id": "s5",
        "who": "you",
        "en": "Yes. Stop here.",
        "thai": {
          "male": "ใช่ จอดที่นี่ครับ",
          "female": "ใช่ จอดที่นี่ค่ะ"
        },
        "roman": {
          "male": "châi jàwt thîi-nîi khráp",
          "female": "châi jàwt thîi-nîi khâ"
        },
        "note": "ใช่ falls. ที่นี่ is falling, falling."
      },
      {
        "id": "s6",
        "who": "you",
        "en": "How much?",
        "thai": {
          "male": "เท่าไหร่ครับ",
          "female": "เท่าไหร่คะ"
        },
        "roman": {
          "male": "thâo-rài khráp",
          "female": "thâo-rài khá"
        }
      },
      {
        "id": "s7",
        "who": "wit",
        "en": "Eighty baht.",
        "thai": "แปดสิบบาทครับ",
        "roman": "bpàaet-sìp bàat khráp"
      },
      {
        "id": "s8",
        "who": "you",
        "en": "Thank you.",
        "thai": {
          "male": "ขอบคุณครับ",
          "female": "ขอบคุณค่ะ"
        },
        "roman": {
          "male": "khàwp-khun khráp",
          "female": "khàwp-khun khâ"
        }
      }
    ],
    "drills": [
      {
        "id": "s-l",
        "kind": "listen",
        "thai": {
          "male": "ไปสยามได้ไหมครับ",
          "female": "ไปสยามได้ไหมคะ"
        },
        "roman": {
          "male": "bpai sà-yaam dâai mǎi khráp",
          "female": "bpai sà-yaam dâai mǎi khá"
        },
        "en": "Can you go to Siam?",
        "options": [
          "Can you go to Siam?",
          "Turn left.",
          "Stop here.",
          "How much?"
        ]
      },
      {
        "id": "s-r",
        "kind": "read",
        "thai": "แปดสิบบาทครับ",
        "roman": "bpàaet-sìp bàat khráp",
        "en": "Eighty baht.",
        "options": [
          "Eighty baht.",
          "Fifty-five baht.",
          "Turn left.",
          "Get in."
        ]
      },
      {
        "id": "s-p",
        "kind": "pick",
        "en": "“Turn left.”",
        "options": [
          "เลี้ยวซ้าย",
          "เลี้ยวขวา",
          "ตรงไป",
          "จอดที่นี่"
        ],
        "answer": "เลี้ยวซ้าย",
        "roman": "líaw sáai"
      },
      {
        "id": "s-b",
        "kind": "build",
        "en": "Stop here.",
        "tiles": [
          "จอด",
          "ที่นี่",
          "ครับ",
          "ค่ะ",
          "ไป"
        ],
        "answer": {
          "male": [
            "จอด",
            "ที่นี่",
            "ครับ"
          ],
          "female": [
            "จอด",
            "ที่นี่",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "jàwt thîi-nîi khráp",
          "female": "jàwt thîi-nîi khâ"
        }
      },
      {
        "id": "s-part",
        "kind": "particle",
        "en": "You're telling him to stop here.",
        "stem": "จอดที่นี่",
        "stemRoman": "jàwt thîi-nîi",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "seven",
    "title": "7-Eleven",
    "titleTh": "ที่เซเว่น",
    "blurb": "Water from the fridge, a toastie heated up, and no bag, thanks.",
    "vocab": [
      "mii",
      "nam",
      "yuu",
      "tuu-yen",
      "un",
      "rap",
      "thung"
    ],
    "lines": [
      {
        "id": "x1",
        "who": "fon",
        "en": "Hello.",
        "thai": "สวัสดีค่ะ",
        "roman": "sà-wàt-dii khâ",
        "note": "Staff greet you as you walk in. A smile or a nod is enough back."
      },
      {
        "id": "x2",
        "who": "you",
        "en": "Do you have water?",
        "thai": {
          "male": "มีน้ำเปล่าไหมครับ",
          "female": "มีน้ำเปล่าไหมคะ"
        },
        "roman": {
          "male": "mii náam bplào mǎi khráp",
          "female": "mii náam bplào mǎi khá"
        },
        "note": "มี (mii, mid) means “to have” or “there is”. Add ไหม (mǎi, rising) to make it a question."
      },
      {
        "id": "x3",
        "who": "fon",
        "en": "Yes, it's in the fridge.",
        "thai": "มีค่ะ อยู่ในตู้เย็นค่ะ",
        "roman": "mii khâ, yùu nai dtûu yen khâ",
        "note": "Thai answers yes by repeating the verb: มี (mii), “have”. อยู่ (yùu, low) means “is located”."
      },
      {
        "id": "x4",
        "who": "fon",
        "en": "Shall I heat it up?",
        "thai": "อุ่นไหมคะ",
        "roman": "ùn mǎi khá",
        "note": "You'll hear this for every toastie or frozen meal. อุ่น (ùn) is low."
      },
      {
        "id": "x5",
        "who": "you",
        "en": "Yes, heat it up, please.",
        "thai": {
          "male": "อุ่นครับ",
          "female": "อุ่นค่ะ"
        },
        "roman": {
          "male": "ùn khráp",
          "female": "ùn khâ"
        },
        "note": "Say yes by repeating the verb, อุ่น (ùn), “heat”."
      },
      {
        "id": "x6",
        "who": "fon",
        "en": "Do you want a bag?",
        "thai": "รับถุงไหมคะ",
        "roman": "ráp thǔng mǎi khá",
        "note": "รับ (ráp, high) means “to take, accept”. ถุง (thǔng, rising) is a bag."
      },
      {
        "id": "x7",
        "who": "you",
        "en": "No bag, thanks.",
        "thai": {
          "male": "ไม่รับครับ",
          "female": "ไม่รับค่ะ"
        },
        "roman": {
          "male": "mâi ráp khráp",
          "female": "mâi ráp khâ"
        },
        "note": "Literally “not take”. ไม่ (mâi) is falling, รับ (ráp) is high."
      }
    ],
    "drills": [
      {
        "id": "x-l",
        "kind": "listen",
        "thai": {
          "male": "มีน้ำเปล่าไหมครับ",
          "female": "มีน้ำเปล่าไหมคะ"
        },
        "roman": {
          "male": "mii náam bplào mǎi khráp",
          "female": "mii náam bplào mǎi khá"
        },
        "en": "Do you have water?",
        "options": [
          "Do you have water?",
          "Shall I heat it up?",
          "Do you want a bag?",
          "No bag, thanks."
        ]
      },
      {
        "id": "x-r",
        "kind": "read",
        "thai": "อุ่นไหมคะ",
        "roman": "ùn mǎi khá",
        "en": "Shall I heat it up?",
        "options": [
          "Shall I heat it up?",
          "Do you want a bag?",
          "Yes, it's in the fridge.",
          "Do you have water?"
        ]
      },
      {
        "id": "x-p",
        "kind": "pick",
        "en": "“No bag, thanks.”",
        "options": [
          "ไม่รับ",
          "รับถุง",
          "อุ่น",
          "มี"
        ],
        "answer": "ไม่รับ",
        "roman": "mâi ráp"
      },
      {
        "id": "x-b",
        "kind": "build",
        "en": "Do you have water?",
        "tiles": [
          "มี",
          "น้ำเปล่า",
          "ไหม",
          "ครับ",
          "คะ",
          "อุ่น"
        ],
        "answer": {
          "male": [
            "มี",
            "น้ำเปล่า",
            "ไหม",
            "ครับ"
          ],
          "female": [
            "มี",
            "น้ำเปล่า",
            "ไหม",
            "คะ"
          ]
        },
        "roman": {
          "male": "mii náam bplào mǎi khráp",
          "female": "mii náam bplào mǎi khá"
        }
      },
      {
        "id": "x-part",
        "kind": "particle",
        "en": "You're asking if they have water.",
        "stem": "มีน้ำเปล่าไหม",
        "stemRoman": "mii náam bplào mǎi",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "bts",
    "title": "BTS / MRT",
    "titleTh": "รถไฟฟ้า",
    "blurb": "Ask where to get off, buy a one-way ticket, and say if you transfer.",
    "vocab": [
      "bpai",
      "nai",
      "sathaanii",
      "long",
      "thiao-diaw",
      "dtaw",
      "bat"
    ],
    "lines": [
      {
        "id": "b1",
        "who": "bee",
        "en": "Where are you going?",
        "thai": "ไปไหนคะ",
        "roman": "bpai nǎi khá",
        "note": "ไป (bpai, mid) + ไหน (nǎi, rising). A helpful stranger or staff will start here."
      },
      {
        "id": "b2",
        "who": "you",
        "en": "I'm going to Siam.",
        "thai": {
          "male": "ไปสยามครับ",
          "female": "ไปสยามค่ะ"
        },
        "roman": {
          "male": "bpai sà-yǎam khráp",
          "female": "bpai sà-yǎam khâ"
        },
        "note": "Name the place right after ไป. สยาม is a station name; say it as one word."
      },
      {
        "id": "b3",
        "who": "bee",
        "en": "Get off at Siam station.",
        "thai": "ลงสถานีสยามค่ะ",
        "roman": "long sà-thǎa-nii sà-yǎam khâ",
        "note": "ลง (long, mid) means get off. สถานี (sà-thǎa-nii) is station. Pair with ขึ้น (khûen) to get on."
      },
      {
        "id": "b4",
        "who": "you",
        "en": "One-way, please.",
        "thai": {
          "male": "เที่ยวเดียวครับ",
          "female": "เที่ยวเดียวค่ะ"
        },
        "roman": {
          "male": "thîao diaw khráp",
          "female": "thîao diaw khâ"
        },
        "note": "เที่ยวเดียว (thîao diaw) is a single trip. Say it at the machine or the window."
      },
      {
        "id": "b5",
        "who": "bee",
        "en": "Here's your ticket.",
        "thai": "บัตรค่ะ",
        "roman": "bàt khâ",
        "note": "บัตร (bàt, low) is a ticket or card. Your rabbit card is บัตรกระต่าย."
      },
      {
        "id": "b6",
        "who": "bee",
        "en": "Do you transfer?",
        "thai": "ต่อรถไหมคะ",
        "roman": "dtàw rót mǎi khá",
        "note": "ต่อ (dtàw, low) means transfer or continue. รถ here is the train."
      },
      {
        "id": "b7",
        "who": "you",
        "en": "Yes, I transfer.",
        "thai": {
          "male": "ต่อครับ",
          "female": "ต่อค่ะ"
        },
        "roman": {
          "male": "dtàw khráp",
          "female": "dtàw khâ"
        },
        "note": "Answer yes by repeating the verb: ต่อ (dtàw). For no, say ไม่ต่อ (mâi dtàw)."
      }
    ],
    "drills": [
      {
        "id": "b-l",
        "kind": "listen",
        "thai": "ไปไหนคะ",
        "roman": "bpai nǎi khá",
        "en": "Where are you going?",
        "options": [
          "Where are you going?",
          "Get off at Siam station.",
          "One-way, please.",
          "Do you transfer?"
        ]
      },
      {
        "id": "b-r",
        "kind": "read",
        "thai": "ลงสถานีสยามค่ะ",
        "roman": "long sà-thǎa-nii sà-yǎam khâ",
        "en": "Get off at Siam station.",
        "options": [
          "Get off at Siam station.",
          "Where are you going?",
          "Here's your ticket.",
          "Yes, I transfer."
        ]
      },
      {
        "id": "b-p",
        "kind": "pick",
        "en": "“One-way, please.”",
        "options": [
          "เที่ยวเดียว",
          "ต่อรถ",
          "ลงสถานี",
          "บัตร"
        ],
        "answer": "เที่ยวเดียว",
        "roman": "thîao diaw"
      },
      {
        "id": "b-b",
        "kind": "build",
        "en": "Do you transfer?",
        "tiles": [
          "ต่อ",
          "รถ",
          "ไหม",
          "ครับ",
          "คะ",
          "บัตร"
        ],
        "answer": {
          "male": [
            "ต่อ",
            "รถ",
            "ไหม",
            "ครับ"
          ],
          "female": [
            "ต่อ",
            "รถ",
            "ไหม",
            "คะ"
          ]
        },
        "roman": {
          "male": "dtàw rót mǎi khráp",
          "female": "dtàw rót mǎi khá"
        }
      },
      {
        "id": "b-part",
        "kind": "particle",
        "en": "You're saying one-way.",
        "stem": "เที่ยวเดียว",
        "stemRoman": "thîao diaw",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "lost",
    "title": "Lost",
    "titleTh": "หลงทาง",
    "blurb": "Ask where something is, if it’s close, whether you can walk, and get someone to slow down.",
    "vocab": [
      "yuu",
      "nai",
      "glai",
      "dern",
      "dai",
      "khao-jai",
      "phuut",
      "chaa"
    ],
    "lines": [
      {
        "id": "l1",
        "who": "you",
        "en": "Where is Wat Pho?",
        "thai": {
          "male": "วัดโพธิ์อยู่ที่ไหนครับ",
          "female": "วัดโพธิ์อยู่ที่ไหนคะ"
        },
        "roman": {
          "male": "wát pho yùu thîi nǎi khráp",
          "female": "wát pho yùu thîi nǎi khá"
        },
        "note": "อยู่ที่ไหน (yùu thîi nǎi) = where is …? Put the place name first."
      },
      {
        "id": "l2",
        "who": "joy",
        "en": "It’s that way.",
        "thai": "ทางนั้นค่ะ",
        "roman": "thaang nán khâ",
        "note": "ทาง (thaang, mid) is a way or path. นั้น (nán, falling) means that."
      },
      {
        "id": "l3",
        "who": "you",
        "en": "Is it close?",
        "thai": {
          "male": "ใกล้ไหมครับ",
          "female": "ใกล้ไหมคะ"
        },
        "roman": {
          "male": "glai mǎi khráp",
          "female": "glai mǎi khá"
        },
        "note": "ใกล้ (glai, mid) + ไหม (mǎi, rising) makes the yes/no question."
      },
      {
        "id": "l4",
        "who": "joy",
        "en": "Yes. You can walk there.",
        "thai": "ใกล้ค่ะ เดินไปได้ค่ะ",
        "roman": "glai khâ dern bpai dâai khâ",
        "note": "Answer yes by repeating ใกล้. เดินไปได้ (dern bpai dâai) = you can walk (there)."
      },
      {
        "id": "l5",
        "who": "you",
        "en": "I don’t understand.",
        "thai": {
          "male": "ไม่เข้าใจครับ",
          "female": "ไม่เข้าใจค่ะ"
        },
        "roman": {
          "male": "mâi kâo-jai khráp",
          "female": "mâi kâo-jai khâ"
        },
        "note": "ไม่ falls. เข้าใจ (kâo-jai) is falling then mid."
      },
      {
        "id": "l6",
        "who": "you",
        "en": "Please speak a little slower.",
        "thai": {
          "male": "พูดช้าๆหน่อยครับ",
          "female": "พูดช้าๆหน่อยค่ะ"
        },
        "roman": {
          "male": "phûut châa-châa nàwy khráp",
          "female": "phûut châa-châa nàwy khâ"
        },
        "note": "ๆ repeats ช้า. หน่อย (nàwy, low) softens the request."
      },
      {
        "id": "l7",
        "who": "joy",
        "en": "Walk straight ahead.",
        "thai": "ตรงไปค่ะ",
        "roman": "dtrong bpai khâ",
        "note": "ตรงไป (dtrong bpai) = go straight. Same phrase you heard in the car scene."
      }
    ],
    "drills": [
      {
        "id": "l-l",
        "kind": "listen",
        "thai": "ใกล้ไหมครับ",
        "roman": "glai mǎi khráp",
        "en": "Is it close?",
        "options": [
          "Is it close?",
          "Where is Wat Pho?",
          "I don’t understand.",
          "Please speak a little slower."
        ]
      },
      {
        "id": "l-r",
        "kind": "read",
        "thai": "เดินไปได้ค่ะ",
        "roman": "dern bpai dâai khâ",
        "en": "You can walk there.",
        "options": [
          "You can walk there.",
          "It’s that way.",
          "Walk straight ahead.",
          "Is it close?"
        ]
      },
      {
        "id": "l-p",
        "kind": "pick",
        "en": "“I don’t understand.”",
        "options": [
          "ไม่เข้าใจ",
          "ใกล้ไหม",
          "อยู่ที่ไหน",
          "พูดช้าๆหน่อย"
        ],
        "answer": "ไม่เข้าใจ",
        "roman": "mâi kâo-jai"
      },
      {
        "id": "l-b",
        "kind": "build",
        "en": "Can I walk there?",
        "tiles": [
          "เดิน",
          "ไป",
          "ได้",
          "ไหม",
          "ครับ",
          "คะ",
          "ใกล้"
        ],
        "answer": {
          "male": [
            "เดิน",
            "ไป",
            "ได้",
            "ไหม",
            "ครับ"
          ],
          "female": [
            "เดิน",
            "ไป",
            "ได้",
            "ไหม",
            "คะ"
          ]
        },
        "roman": {
          "male": "dern bpai dâai mǎi khráp",
          "female": "dern bpai dâai mǎi khá"
        }
      },
      {
        "id": "l-part",
        "kind": "particle",
        "en": "You’re asking someone to speak slower.",
        "stem": "พูดช้าๆหน่อย",
        "stemRoman": "phûut châa-châa nàwy",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "massage",
    "title": "Massage / pharmacy",
    "titleTh": "นวดและร้านยา",
    "blurb": "Say where it hurts, ask for a softer massage, and check if they have medicine for a headache.",
    "vocab": [
      "jep",
      "buat",
      "hua",
      "bao",
      "raeng",
      "nuat",
      "yaa",
      "noi-req"
    ],
    "lines": [
      {
        "id": "ms1",
        "who": "ning",
        "en": "Hello. Where does it hurt?",
        "thai": "สวัสดีค่ะ เจ็บตรงไหนคะ",
        "roman": "sà-wàt-dii khâ jèp dtrong nǎi khá",
        "note": "เจ็บ (jèp, low) = hurt. ตรงไหน (dtrong nǎi) = which spot?"
      },
      {
        "id": "ms2",
        "who": "you",
        "en": "My head hurts.",
        "thai": {
          "male": "ปวดหัวครับ",
          "female": "ปวดหัวค่ะ"
        },
        "roman": {
          "male": "bpùat hǔa khráp",
          "female": "bpùat hǔa khâ"
        },
        "note": "ปวด (bpùat, low) + หัว (hǔa, rising) = headache. A very common combo."
      },
      {
        "id": "ms3",
        "who": "ning",
        "en": "I’ll massage gently.",
        "thai": "นวดเบาๆนะคะ",
        "roman": "nûat bao-bao ná khá",
        "note": "นวด (nûat, falling) = to massage. เบาๆ (bao-bao) = gently. นะ softens it."
      },
      {
        "id": "ms4",
        "who": "you",
        "en": "A little softer, please.",
        "thai": {
          "male": "เบาๆหน่อยครับ",
          "female": "เบาๆหน่อยค่ะ"
        },
        "roman": {
          "male": "bao-bao nàwy khráp",
          "female": "bao-bao nàwy khâ"
        },
        "note": "เบา (bao, mid) repeated with ๆ. หน่อย (nàwy, low) softens the ask, same as in the market."
      },
      {
        "id": "ms5",
        "who": "ning",
        "en": "Like this?",
        "thai": "แบบนี้ไหมคะ",
        "roman": "bàaep níi mǎi khá",
        "note": "แบบนี้ (bàaep níi) = like this. ไหม turns it into a check-in."
      },
      {
        "id": "ms6",
        "who": "you",
        "en": "Not so hard.",
        "thai": {
          "male": "ไม่แรงครับ",
          "female": "ไม่แรงค่ะ"
        },
        "roman": {
          "male": "mâi raeng khráp",
          "female": "mâi raeng khâ"
        },
        "note": "แรง (raeng, mid) = strong or hard pressure. ไม่แรง = not hard. แรงไป = too hard."
      },
      {
        "id": "ms7",
        "who": "you",
        "en": "Do you have medicine for a headache?",
        "thai": {
          "male": "มียาแก้ปวดหัวไหมครับ",
          "female": "มียาแก้ปวดหัวไหมคะ"
        },
        "roman": {
          "male": "mii yaa gâae bpùat hǔa mǎi khráp",
          "female": "mii yaa gâae bpùat hǔa mǎi khá"
        },
        "note": "ยา (yaa, mid) = medicine. แก้ (gâae) = to relieve. Same มี…ไหม pattern as at 7-Eleven."
      },
      {
        "id": "ms8",
        "who": "ning",
        "en": "Yes. Take one after food.",
        "thai": "มีค่ะ กินหลังอาหารหนึ่งเม็ดค่ะ",
        "roman": "mii khâ gin lǎng aa-hǎan nùeng mét khâ",
        "note": "Answer yes by repeating มี. หลังอาหาร (lǎng aa-hǎan) = after food. เม็ด (mét) = a pill."
      }
    ],
    "drills": [
      {
        "id": "ms-l",
        "kind": "listen",
        "thai": "ปวดหัวครับ",
        "roman": "bpùat hǔa khráp",
        "en": "My head hurts.",
        "options": [
          "My head hurts.",
          "A little softer, please.",
          "Not so hard.",
          "Do you have medicine for a headache?"
        ]
      },
      {
        "id": "ms-r",
        "kind": "read",
        "thai": "นวดเบาๆนะคะ",
        "roman": "nûat bao-bao ná khá",
        "en": "I’ll massage gently.",
        "options": [
          "I’ll massage gently.",
          "Like this?",
          "Where does it hurt?",
          "Take one after food."
        ]
      },
      {
        "id": "ms-p",
        "kind": "pick",
        "en": "“A little softer, please.”",
        "options": [
          "เบาๆหน่อย",
          "ไม่แรง",
          "ปวดหัว",
          "มียาไหม"
        ],
        "answer": "เบาๆหน่อย",
        "roman": "bao-bao nàwy"
      },
      {
        "id": "ms-b",
        "kind": "build",
        "en": "Not so hard.",
        "tiles": [
          "ไม่",
          "แรง",
          "ครับ",
          "ค่ะ",
          "เบา",
          "หน่อย"
        ],
        "answer": {
          "male": [
            "ไม่",
            "แรง",
            "ครับ"
          ],
          "female": [
            "ไม่",
            "แรง",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "mâi raeng khráp",
          "female": "mâi raeng khâ"
        }
      },
      {
        "id": "ms-part",
        "kind": "particle",
        "en": "You’re asking if they have medicine for a headache.",
        "stem": "มียาแก้ปวดหัวไหม",
        "stemRoman": "mii yaa gâae bpùat hǔa mǎi",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "meal",
    "title": "A meal",
    "titleTh": "ที่ร้านอาหาร",
    "blurb": "One person, not spicy, water, and the bill.",
    "vocab": [
      "padthai",
      "phet",
      "mai",
      "nam",
      "aroi",
      "maak",
      "check"
    ],
    "lines": [
      {
        "id": "f1",
        "who": "pla",
        "en": "Hello. How many people?",
        "thai": "สวัสดีค่ะ กี่ท่านคะ",
        "roman": "sà-wàt-dii khâ kìi thâan khá",
        "note": "กี่ is low, “how many”. ท่าน is the polite word for a person, and it falls."
      },
      {
        "id": "f2",
        "who": "you",
        "en": "Just one.",
        "thai": {
          "male": "คนเดียวครับ",
          "female": "คนเดียวค่ะ"
        },
        "roman": {
          "male": "khon diaw khráp",
          "female": "khon diaw khâ"
        },
        "note": "Staff say ท่าน to be polite about you; you say คน about yourself."
      },
      {
        "id": "f3",
        "who": "pla",
        "en": "What can I get you?",
        "thai": "รับอะไรดีคะ",
        "roman": "ráp à-rai dii khá"
      },
      {
        "id": "f4",
        "who": "you",
        "en": "Pad thai, not spicy.",
        "thai": {
          "male": "เอาผัดไทยไม่เผ็ดครับ",
          "female": "เอาผัดไทยไม่เผ็ดค่ะ"
        },
        "roman": {
          "male": "ao phàt-thai mâi phèt khráp",
          "female": "ao phàt-thai mâi phèt khâ"
        },
        "note": "ไม่ falls. เผ็ด is low."
      },
      {
        "id": "f5",
        "who": "pla",
        "en": "Sure. And to drink?",
        "thai": "ได้ค่ะ น้ำอะไรดีคะ",
        "roman": "dâai khâ náam à-rai dii khá"
      },
      {
        "id": "f6",
        "who": "you",
        "en": "Plain water.",
        "thai": {
          "male": "น้ำเปล่าครับ",
          "female": "น้ำเปล่าค่ะ"
        },
        "roman": {
          "male": "náam bplào khráp",
          "female": "náam bplào khâ"
        },
        "note": "น้ำ is high."
      },
      {
        "id": "f7",
        "who": "you",
        "en": "Delicious.",
        "thai": {
          "male": "อร่อยมากครับ",
          "female": "อร่อยมากค่ะ"
        },
        "roman": {
          "male": "à-ròi mâak khráp",
          "female": "à-ròi mâak khâ"
        },
        "note": "Say this when the plate lands. อร่อย is low, low. มาก falls."
      },
      {
        "id": "f8",
        "who": "you",
        "en": "The bill, please.",
        "thai": {
          "male": "เช็คบิลครับ",
          "female": "เช็คบิลค่ะ"
        },
        "roman": {
          "male": "chék bin khráp",
          "female": "chék bin khâ"
        },
        "note": "Borrowed from English “check bill”. Every shop understands it."
      }
    ],
    "drills": [
      {
        "id": "f-l",
        "kind": "listen",
        "thai": "กี่ท่านคะ",
        "roman": "kìi thâan khá",
        "en": "How many people?",
        "options": [
          "How many people?",
          "And to drink?",
          "The bill, please.",
          "Delicious."
        ]
      },
      {
        "id": "f-r",
        "kind": "read",
        "thai": "เอาผัดไทยไม่เผ็ด",
        "roman": "ao phàt-thai mâi phèt",
        "en": "Pad thai, not spicy.",
        "options": [
          "Pad thai, not spicy.",
          "Plain water.",
          "Just one.",
          "Delicious."
        ]
      },
      {
        "id": "f-p",
        "kind": "pick",
        "en": "“Plain water.”",
        "options": [
          "น้ำเปล่า",
          "กาแฟเย็น",
          "ผัดไทย",
          "เช็คบิล"
        ],
        "answer": "น้ำเปล่า",
        "roman": "náam bplào"
      },
      {
        "id": "f-b",
        "kind": "build",
        "en": "The bill, please.",
        "tiles": [
          "เช็คบิล",
          "ครับ",
          "ค่ะ",
          "ไม่",
          "น้ำ"
        ],
        "answer": {
          "male": [
            "เช็คบิล",
            "ครับ"
          ],
          "female": [
            "เช็คบิล",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "chék bin khráp",
          "female": "chék bin khâ"
        }
      },
      {
        "id": "f-part",
        "kind": "particle",
        "en": "You're asking for the bill.",
        "stem": "เช็คบิล",
        "stemRoman": "chék bin",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "leave",
    "title": "Goodbye",
    "titleTh": "ลาก่อน",
    "blurb": "Sorry, it's nothing, thank you for today, and how you leave.",
    "vocab": [
      "sorry",
      "mai-pen-rai",
      "today",
      "see-you",
      "laa"
    ],
    "lines": [
      {
        "id": "l1",
        "who": "you",
        "en": "Excuse me.",
        "thai": {
          "male": "ขอโทษครับ",
          "female": "ขอโทษค่ะ"
        },
        "roman": {
          "male": "khǎw-thôot khráp",
          "female": "khǎw-thôot khâ"
        },
        "note": "ขอ rises, โทษ falls. Use it to get someone's attention, not only to apologize."
      },
      {
        "id": "l2",
        "who": "pla",
        "en": "That's all right.",
        "thai": "ไม่เป็นไรค่ะ",
        "roman": "mâi bpen rai khâ"
      },
      {
        "id": "l3",
        "who": "you",
        "en": "Thank you for today.",
        "thai": {
          "male": "ขอบคุณสำหรับวันนี้ครับ",
          "female": "ขอบคุณสำหรับวันนี้ค่ะ"
        },
        "roman": {
          "male": "khàwp-khun sǎm-ràp wan-níi khráp",
          "female": "khàwp-khun sǎm-ràp wan-níi khâ"
        },
        "note": "สำหรับ is rising, then low. นี้ is high."
      },
      {
        "id": "l4",
        "who": "pla",
        "en": "See you again.",
        "thai": "แล้วเจอกันนะคะ",
        "roman": "láew jer gan ná khá",
        "note": "นะ softens it. After นะ, women use คะ (high): นะคะ."
      },
      {
        "id": "l5",
        "who": "you",
        "en": "See you.",
        "thai": {
          "male": "แล้วเจอกันครับ",
          "female": "แล้วเจอกันค่ะ"
        },
        "roman": {
          "male": "láew jer gan khráp",
          "female": "láew jer gan khâ"
        }
      },
      {
        "id": "l6",
        "who": "you",
        "en": "Goodbye.",
        "thai": {
          "male": "ลาก่อนครับ",
          "female": "ลาก่อนค่ะ"
        },
        "roman": {
          "male": "laa-kàwn khráp",
          "female": "laa-kàwn khâ"
        },
        "note": "Final-sounding, like \"farewell\". Day to day, Thais say ไปก่อนนะครับ/คะ or บ๊ายบาย."
      },
      {
        "id": "l7",
        "who": "you",
        "en": "Good night.",
        "thai": {
          "male": "ราตรีสวัสดิ์ครับ",
          "female": "ราตรีสวัสดิ์ค่ะ"
        },
        "roman": {
          "male": "raa-dtrii sà-wàt khráp",
          "female": "raa-dtrii sà-wàt khâ"
        },
        "note": "Formal. Right for a hotel desk or someone older. Friends hear แล้วเจอกัน. The sà-wàt is the same low-low as the start of สวัสดี."
      }
    ],
    "drills": [
      {
        "id": "l-l",
        "kind": "listen",
        "thai": "ไม่เป็นไรค่ะ",
        "roman": "mâi bpen rai khâ",
        "en": "That's all right.",
        "options": [
          "That's all right.",
          "Excuse me.",
          "Goodbye.",
          "See you again."
        ]
      },
      {
        "id": "l-r",
        "kind": "read",
        "thai": "ลาก่อน",
        "roman": "laa-kàwn",
        "en": "Goodbye.",
        "options": [
          "Goodbye.",
          "Excuse me.",
          "Thank you for today.",
          "Good night."
        ]
      },
      {
        "id": "l-p",
        "kind": "pick",
        "en": "“Excuse me.”",
        "options": [
          "ขอโทษ",
          "ขอบคุณ",
          "ลาก่อน",
          "ไม่เป็นไร"
        ],
        "answer": "ขอโทษ",
        "roman": "khǎw-thôot"
      },
      {
        "id": "l-b",
        "kind": "build",
        "en": "See you.",
        "tiles": [
          "แล้ว",
          "เจอ",
          "กัน",
          "ครับ",
          "ค่ะ",
          "ไม่"
        ],
        "answer": {
          "male": [
            "แล้ว",
            "เจอ",
            "กัน",
            "ครับ"
          ],
          "female": [
            "แล้ว",
            "เจอ",
            "กัน",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "láew jer gan khráp",
          "female": "láew jer gan khâ"
        }
      },
      {
        "id": "l-part",
        "kind": "particle",
        "en": "You're saying goodbye.",
        "stem": "ลาก่อน",
        "stemRoman": "laa-kàwn",
        "particleKind": "statement"
      }
    ]
  }
];

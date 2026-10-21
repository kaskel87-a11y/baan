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
          "male": "bpai sà-yǎam dâai mǎi khráp",
          "female": "bpai sà-yǎam dâai mǎi khá"
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
          "male": "bpai sà-yǎam dâai mǎi khráp",
          "female": "bpai sà-yǎam dâai mǎi khá"
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
          "male": "glâi mǎi khráp",
          "female": "glâi mǎi khá"
        },
        "note": "ใกล้ (glâi, falling) + ไหม (mǎi, rising) makes the yes/no question."
      },
      {
        "id": "l4",
        "who": "joy",
        "en": "Yes. You can walk there.",
        "thai": "ใกล้ค่ะ เดินไปได้ค่ะ",
        "roman": "glâi khâ dern bpai dâai khâ",
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
          "male": "mâi khâo-jai khráp",
          "female": "mâi khâo-jai khâ"
        },
        "note": "ไม่ falls. เข้าใจ (khâo-jai) is falling then mid."
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
          "male": "phûut cháa-cháa nàwy khráp",
          "female": "phûut cháa-cháa nàwy khâ"
        },
        "note": "ๆ repeats ช้า (cháa, high). หน่อย (nàwy, low) softens the request."
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
        "roman": "glâi mǎi khráp",
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
        "roman": "mâi khâo-jai"
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
        "stemRoman": "phûut cháa-cháa nàwy",
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
    "id": "chat",
    "title": "Small talk",
    "titleTh": "คุยเล่น",
    "blurb": "Where you're from, how long you've been here, a modest reply to “your Thai is good”, and that you like it here.",
    "vocab": [
      "khun",
      "jaak",
      "geng",
      "nit-noi",
      "naan",
      "chawp",
      "mueang-thai",
      "phuut"
    ],
    "lines": [
      {
        "id": "k1",
        "who": "ploy",
        "en": "Where are you from?",
        "thai": "คุณมาจากไหนคะ",
        "roman": "khun maa jàak nǎi khá",
        "note": "คุณ (khun, mid) = you. มาจาก (maa jàak) = come from. ไหน (nǎi, rising) = where."
      },
      {
        "id": "k2",
        "who": "you",
        "en": "I'm from America.",
        "thai": {
          "male": "ผมมาจากอเมริกาครับ",
          "female": "ฉันมาจากอเมริกาค่ะ"
        },
        "roman": {
          "male": "phǒm maa jàak à-mee-rí-gaa khráp",
          "female": "chǎn maa jàak à-mee-rí-gaa khâ"
        },
        "note": "จาก (jàak) is low. Swap in your country: อังกฤษ (ang-grìt, England), แคนาดา (khaae-naa-daa, Canada), ออสเตรเลีย (áws-dtree-lia, Australia)."
      },
      {
        "id": "k3",
        "who": "ploy",
        "en": "You speak Thai well!",
        "thai": "พูดไทยเก่งนะคะ",
        "roman": "phûut thai gèng ná khá",
        "note": "เก่ง (gèng, low) = good at, skilled. นะ (ná) makes it warm."
      },
      {
        "id": "k4",
        "who": "you",
        "en": "I can speak a little.",
        "thai": {
          "male": "พูดได้นิดหน่อยครับ",
          "female": "พูดได้นิดหน่อยค่ะ"
        },
        "roman": {
          "male": "phûut dâai nít-nàwy khráp",
          "female": "phûut dâai nít-nàwy khâ"
        },
        "note": "นิดหน่อย (nít-nàwy) = a little: high, then low. No “I” needed; Thai drops it when it's obvious."
      },
      {
        "id": "k5",
        "who": "ploy",
        "en": "Have you been in Thailand long?",
        "thai": "อยู่เมืองไทยนานไหมคะ",
        "roman": "yùu mueang thai naan mǎi khá",
        "note": "เมืองไทย (mueang thai) is the everyday way to say Thailand. นาน (naan, mid) = a long time."
      },
      {
        "id": "k6",
        "who": "you",
        "en": "Not long. Just one week.",
        "thai": {
          "male": "ไม่นาน อาทิตย์เดียวครับ",
          "female": "ไม่นาน อาทิตย์เดียวค่ะ"
        },
        "roman": {
          "male": "mâi naan, aa-thít diaw khráp",
          "female": "mâi naan, aa-thít diaw khâ"
        },
        "note": "อาทิตย์ (aa-thít) = week: mid, then high. เดียว (diaw) = just one, as in the one-way ticket."
      },
      {
        "id": "k7",
        "who": "ploy",
        "en": "Do you like Thailand?",
        "thai": "ชอบเมืองไทยไหมคะ",
        "roman": "châwp mueang thai mǎi khá",
        "note": "ชอบ (châwp, falling) = to like."
      },
      {
        "id": "k8",
        "who": "you",
        "en": "I like it a lot.",
        "thai": {
          "male": "ชอบมากครับ",
          "female": "ชอบมากค่ะ"
        },
        "roman": {
          "male": "châwp mâak khráp",
          "female": "châwp mâak khâ"
        },
        "note": "Answer yes by repeating the verb: ชอบ (châwp). มาก (mâak) = a lot."
      }
    ],
    "drills": [
      {
        "id": "k-l",
        "kind": "listen",
        "thai": "คุณมาจากไหนคะ",
        "roman": "khun maa jàak nǎi khá",
        "en": "Where are you from?",
        "options": [
          "Where are you from?",
          "Do you like Thailand?",
          "Have you been in Thailand long?",
          "Where is it?"
        ]
      },
      {
        "id": "k-r",
        "kind": "read",
        "thai": "พูดไทยเก่งนะคะ",
        "roman": "phûut thai gèng ná khá",
        "en": "You speak Thai well!",
        "options": [
          "You speak Thai well!",
          "I can speak a little.",
          "I like it a lot.",
          "Please speak a little slower."
        ]
      },
      {
        "id": "k-p",
        "kind": "pick",
        "en": "“a little”",
        "options": [
          "นิดหน่อย",
          "นาน",
          "เก่ง",
          "ชอบ"
        ],
        "answer": "นิดหน่อย",
        "roman": "nít-nàwy"
      },
      {
        "id": "k-b",
        "kind": "build",
        "en": "I like Thailand a lot.",
        "tiles": [
          "ชอบ",
          "เมือง",
          "ไทย",
          "มาก",
          "ครับ",
          "ค่ะ",
          "นาน"
        ],
        "answer": {
          "male": [
            "ชอบ",
            "เมือง",
            "ไทย",
            "มาก",
            "ครับ"
          ],
          "female": [
            "ชอบ",
            "เมือง",
            "ไทย",
            "มาก",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "châwp mueang thai mâak khráp",
          "female": "châwp mueang thai mâak khâ"
        }
      },
      {
        "id": "k-part",
        "kind": "particle",
        "en": "You're telling someone you can speak a little.",
        "stem": "พูดได้นิดหน่อย",
        "stemRoman": "phûut dâai nít-nàwy",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "hotel",
    "title": "Hotel check-in",
    "titleTh": "เช็คอินโรงแรม",
    "blurb": "You have a booking, how many nights, your room number, what time breakfast is, and the Wi-Fi password.",
    "vocab": [
      "jawng",
      "khuen-night",
      "gii",
      "hawng",
      "aa-haan-chao",
      "moong",
      "rahat"
    ],
    "lines": [
      {
        "id": "h1",
        "who": "dao",
        "en": "Hello. Checking in?",
        "thai": "สวัสดีค่ะ เช็คอินไหมคะ",
        "roman": "sà-wàt-dii khâ, chék-in mǎi khá",
        "note": "เช็คอิน (chék-in) is the English word, said the Thai way. ไหม (mǎi, rising) makes it a question."
      },
      {
        "id": "h2",
        "who": "you",
        "en": "Yes. I have a booking.",
        "thai": {
          "male": "ครับ จองไว้แล้วครับ",
          "female": "ค่ะ จองไว้แล้วค่ะ"
        },
        "roman": {
          "male": "khráp, jawng wái láew khráp",
          "female": "khâ, jawng wái láew khâ"
        },
        "note": "จอง (jawng, mid) = to book. ไว้แล้ว (wái láew, high, high) = already, ahead of time. A particle alone (khráp or khâ) is a polite yes."
      },
      {
        "id": "h3",
        "who": "dao",
        "en": "What name is the booking under?",
        "thai": "จองชื่ออะไรคะ",
        "roman": "jawng chûue à-rai khá",
        "note": "Same chûue à-rai (what name) as at the café, with jawng in front."
      },
      {
        "id": "h4",
        "who": "you",
        "en": "Under the name …",
        "thai": {
          "male": "ชื่อ{name}ครับ",
          "female": "ชื่อ{name}ค่ะ"
        },
        "roman": {
          "male": "chûue {name} khráp",
          "female": "chûue {name} khâ"
        },
        "note": "Just chûue plus your name. No “I” needed."
      },
      {
        "id": "h5",
        "who": "dao",
        "en": "How many nights?",
        "thai": "กี่คืนคะ",
        "roman": "gìi khuen khá",
        "note": "กี่ (gìi, low) = how many. คืน (khuen, mid) = night."
      },
      {
        "id": "h6",
        "who": "you",
        "en": "Three nights.",
        "thai": {
          "male": "สามคืนครับ",
          "female": "สามคืนค่ะ"
        },
        "roman": {
          "male": "sǎam khuen khráp",
          "female": "sǎam khuen khâ"
        },
        "note": "Number first, then คืน. สาม (sǎam) is rising."
      },
      {
        "id": "h7",
        "who": "dao",
        "en": "Room 305.",
        "thai": "ห้องสามศูนย์ห้าค่ะ",
        "roman": "hâwng sǎam sǔun hâa khâ",
        "note": "ห้อง (hâwng, falling) = room. Room numbers are read digit by digit: sǎam, sǔun (zero), hâa."
      },
      {
        "id": "h8",
        "who": "you",
        "en": "What time is breakfast?",
        "thai": {
          "male": "อาหารเช้ากี่โมงครับ",
          "female": "อาหารเช้ากี่โมงค่ะ"
        },
        "roman": {
          "male": "aa-hǎan cháo gìi moong khráp",
          "female": "aa-hǎan cháo gìi moong khâ"
        },
        "note": "อาหารเช้า (aa-hǎan cháo) = breakfast, literally morning food. เช้า is high. กี่โมง (gìi moong) = what time."
      },
      {
        "id": "h9",
        "who": "dao",
        "en": "From six to ten in the morning.",
        "thai": "หกโมงเช้าถึงสิบโมงค่ะ",
        "roman": "hòk moong cháo thǔeng sìp moong khâ",
        "note": "โมง (moong, mid) = o'clock for daytime hours. ถึง (thǔeng, rising) = until."
      },
      {
        "id": "h10",
        "who": "you",
        "en": "What's the Wi-Fi password?",
        "thai": {
          "male": "รหัสไวไฟอะไรครับ",
          "female": "รหัสไวไฟอะไรค่ะ"
        },
        "roman": {
          "male": "rá-hàt wai-fai à-rai khráp",
          "female": "rá-hàt wai-fai à-rai khâ"
        },
        "note": "รหัส (rá-hàt) = code or password: high, then low. ไวไฟ (wai-fai) is mid, mid."
      },
      {
        "id": "h11",
        "who": "dao",
        "en": "It's written right here.",
        "thai": "เขียนไว้ตรงนี้ค่ะ",
        "roman": "khǐan wái dtrong níi khâ",
        "note": "เขียน (khǐan, rising) = write. ตรงนี้ (dtrong níi) = right here."
      }
    ],
    "drills": [
      {
        "id": "h-l",
        "kind": "listen",
        "thai": "กี่คืนคะ",
        "roman": "gìi khuen khá",
        "en": "How many nights?",
        "options": [
          "How many nights?",
          "What time is breakfast?",
          "What name is the booking under?",
          "How much is it?"
        ]
      },
      {
        "id": "h-r",
        "kind": "read",
        "thai": "จองไว้แล้ว",
        "roman": "jawng wái láew",
        "en": "I have a booking.",
        "options": [
          "I have a booking.",
          "Three nights.",
          "It's written right here.",
          "Checking in?"
        ]
      },
      {
        "id": "h-p",
        "kind": "pick",
        "en": "“room”",
        "options": [
          "ห้อง",
          "คืน",
          "จอง",
          "รหัส"
        ],
        "answer": "ห้อง",
        "roman": "hâwng"
      },
      {
        "id": "h-b",
        "kind": "build",
        "en": "Three nights.",
        "tiles": [
          "สาม",
          "คืน",
          "ครับ",
          "ค่ะ",
          "กี่",
          "ห้อง"
        ],
        "answer": {
          "male": [
            "สาม",
            "คืน",
            "ครับ"
          ],
          "female": [
            "สาม",
            "คืน",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "sǎam khuen khráp",
          "female": "sǎam khuen khâ"
        }
      },
      {
        "id": "h-part",
        "kind": "particle",
        "en": "You're telling the front desk you have a booking.",
        "stem": "จองไว้แล้ว",
        "stemRoman": "jawng wái láew",
        "particleKind": "statement"
      }
    ]
  },
  {
    "id": "shop",
    "title": "Clothes shop",
    "titleTh": "ร้านเสื้อผ้า",
    "blurb": "Ask to try it on, say it's too big, ask for a smaller one and another color, and pick the one you'll take.",
    "vocab": [
      "lawng",
      "suea",
      "yai",
      "lek",
      "gwaa",
      "sii",
      "dtua"
    ],
    "lines": [
      {
        "id": "sh1",
        "who": "kaew",
        "en": "Feel free to look around.",
        "thai": "เลือกดูได้เลยค่ะ",
        "roman": "lûeak duu dâai loei khâ",
        "note": "เลือก (lûeak, falling) = choose. ดู (duu) = look. ได้เลย (dâai loei) = go right ahead."
      },
      {
        "id": "sh2",
        "who": "you",
        "en": "Can I try this shirt on?",
        "thai": {
          "male": "ขอลองเสื้อตัวนี้ได้ไหมครับ",
          "female": "ขอลองเสื้อตัวนี้ได้ไหมคะ"
        },
        "roman": {
          "male": "khǎw lawng sûea dtua níi dâai mǎi khráp",
          "female": "khǎw lawng sûea dtua níi dâai mǎi khá"
        },
        "note": "ขอลอง (khǎw lawng) = may I try. ตัวนี้ (dtua níi) = this one, for clothes. ได้ไหม (dâai mǎi) = can I?"
      },
      {
        "id": "sh3",
        "who": "kaew",
        "en": "Sure. The fitting room is over there.",
        "thai": "ได้ค่ะ ห้องลองเสื้ออยู่ตรงนั้นค่ะ",
        "roman": "dâai khâ, hâwng lawng sûea yùu dtrong nán khâ",
        "note": "ห้องลองเสื้อ (hâwng lawng sûea) = fitting room, literally try-shirt room. ตรงนั้น (dtrong nán) = over there."
      },
      {
        "id": "sh4",
        "who": "you",
        "en": "It's a little too big.",
        "thai": {
          "male": "ใหญ่ไปหน่อยครับ",
          "female": "ใหญ่ไปหน่อยค่ะ"
        },
        "roman": {
          "male": "yài bpai nàwy khráp",
          "female": "yài bpai nàwy khâ"
        },
        "note": "ใหญ่ (yài, low) = big. ไป after it means too, and หน่อย softens it."
      },
      {
        "id": "sh5",
        "who": "kaew",
        "en": "What size do you wear?",
        "thai": "ใส่ไซซ์อะไรคะ",
        "roman": "sài sai à-rai khá",
        "note": "ใส่ (sài, low) = wear. ไซซ์ (sai) is the English word size."
      },
      {
        "id": "sh6",
        "who": "you",
        "en": "Do you have a smaller one?",
        "thai": {
          "male": "มีตัวเล็กกว่านี้ไหมครับ",
          "female": "มีตัวเล็กกว่านี้ไหมคะ"
        },
        "roman": {
          "male": "mii dtua lék gwàa níi mǎi khráp",
          "female": "mii dtua lék gwàa níi mǎi khá"
        },
        "note": "เล็ก (lék, high) = small. กว่า (gwàa, low) = more, so เล็กกว่านี้ = smaller than this."
      },
      {
        "id": "sh7",
        "who": "kaew",
        "en": "Yes. A medium.",
        "thai": "มีค่ะ ไซซ์เอ็มค่ะ",
        "roman": "mii khâ, sai em khâ",
        "note": "Sizes use the English letters after ไซซ์ (sai)."
      },
      {
        "id": "sh8",
        "who": "you",
        "en": "Is there another color?",
        "thai": {
          "male": "มีสีอื่นไหมครับ",
          "female": "มีสีอื่นไหมคะ"
        },
        "roman": {
          "male": "mii sǐi ùuen mǎi khráp",
          "female": "mii sǐi ùuen mǎi khá"
        },
        "note": "สี (sǐi, rising) = color. อื่น (ùuen, low) = other."
      },
      {
        "id": "sh9",
        "who": "kaew",
        "en": "There's black and white.",
        "thai": "มีสีดำกับสีขาวค่ะ",
        "roman": "mii sǐi dam gàp sǐi khǎaw khâ",
        "note": "ดำ (dam) = black. ขาว (khǎaw, rising) = white. กับ (gàp, low) = and."
      },
      {
        "id": "sh10",
        "who": "you",
        "en": "I'll take the black one.",
        "thai": {
          "male": "เอาตัวสีดำครับ",
          "female": "เอาตัวสีดำค่ะ"
        },
        "roman": {
          "male": "ao dtua sǐi dam khráp",
          "female": "ao dtua sǐi dam khâ"
        },
        "note": "เอา (ao) = I'll take. Same ตัว (dtua) for one piece of clothing."
      }
    ],
    "drills": [
      {
        "id": "sh-l",
        "kind": "listen",
        "thai": "ใส่ไซซ์อะไรคะ",
        "roman": "sài sai à-rai khá",
        "en": "What size do you wear?",
        "options": [
          "What size do you wear?",
          "Is there another color?",
          "It's a little too big.",
          "The fitting room is over there."
        ]
      },
      {
        "id": "sh-r",
        "kind": "read",
        "thai": "ใหญ่ไป",
        "roman": "yài bpai",
        "en": "Too big.",
        "options": [
          "Too big.",
          "Too expensive.",
          "Another color.",
          "This one."
        ]
      },
      {
        "id": "sh-p",
        "kind": "pick",
        "en": "“color”",
        "options": [
          "สี",
          "ตัว",
          "เสื้อ",
          "ลอง"
        ],
        "answer": "สี",
        "roman": "sǐi"
      },
      {
        "id": "sh-b",
        "kind": "build",
        "en": "Is there another color?",
        "tiles": [
          "มี",
          "สี",
          "อื่น",
          "ไหม",
          "ครับ",
          "คะ",
          "เล็ก"
        ],
        "answer": {
          "male": [
            "มี",
            "สี",
            "อื่น",
            "ไหม",
            "ครับ"
          ],
          "female": [
            "มี",
            "สี",
            "อื่น",
            "ไหม",
            "คะ"
          ]
        },
        "roman": {
          "male": "mii sǐi ùuen mǎi khráp",
          "female": "mii sǐi ùuen mǎi khá"
        }
      },
      {
        "id": "sh-part",
        "kind": "particle",
        "en": "You're asking if you can try it on.",
        "stem": "ขอลองได้ไหม",
        "stemRoman": "khǎw lawng dâai mǎi",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "food",
    "title": "Street food stall",
    "titleTh": "ร้านข้าวริมทาง",
    "blurb": "Order fried rice, say to go, add a fried egg, skip the cilantro, and ask how much altogether.",
    "vocab": [
      "gin",
      "glap-baan",
      "sai-put",
      "khai-daaw",
      "phak-chii",
      "tang-mot",
      "jaan"
    ],
    "lines": [
      {
        "id": "sf1",
        "who": "pim",
        "en": "What can I get you?",
        "thai": "รับอะไรดีคะ",
        "roman": "ráp à-rai dii khá",
        "note": "รับ (ráp, high) = take. รับอะไรดี is how vendors ask what you'd like."
      },
      {
        "id": "sf2",
        "who": "you",
        "en": "Pork fried rice, one plate.",
        "thai": {
          "male": "เอาข้าวผัดหมูหนึ่งจานครับ",
          "female": "เอาข้าวผัดหมูหนึ่งจานค่ะ"
        },
        "roman": {
          "male": "ao khâaw phàt mǔu nùeng jaan khráp",
          "female": "ao khâaw phàt mǔu nùeng jaan khâ"
        },
        "note": "ข้าวผัด (khâaw phàt) = fried rice, หมู (mǔu, rising) = pork. หนึ่งจาน (nùeng jaan) = one plate, so จาน counts plates of food."
      },
      {
        "id": "sf3",
        "who": "pim",
        "en": "Eat here or take it home?",
        "thai": "กินที่นี่หรือกลับบ้านคะ",
        "roman": "gin thîi-nîi rǔue glàp bâan khá",
        "note": "กิน (gin) = eat. หรือ (rǔue, rising) = or. กลับบ้าน (glàp bâan) = go back home, which is how Thai says to go."
      },
      {
        "id": "sf4",
        "who": "you",
        "en": "To go, please.",
        "thai": {
          "male": "กลับบ้านครับ",
          "female": "กลับบ้านค่ะ"
        },
        "roman": {
          "male": "glàp bâan khráp",
          "female": "glàp bâan khâ"
        },
        "note": "Just repeat the choice you want. กลับ (glàp) is low, บ้าน (bâan) is falling."
      },
      {
        "id": "sf5",
        "who": "pim",
        "en": "Do you want a fried egg on it?",
        "thai": "ใส่ไข่ดาวไหมคะ",
        "roman": "sài khài daaw mǎi khá",
        "note": "ใส่ (sài, low) = put in, add. ไข่ดาว (khài daaw) = fried egg, literally star egg."
      },
      {
        "id": "sf6",
        "who": "you",
        "en": "Yes, add a fried egg too.",
        "thai": {
          "male": "ใส่ไข่ดาวด้วยครับ",
          "female": "ใส่ไข่ดาวด้วยค่ะ"
        },
        "roman": {
          "male": "sài khài daaw dûay khráp",
          "female": "sài khài daaw dûay khâ"
        },
        "note": "Say yes by repeating the verb ใส่ (sài). ด้วย (dûay, falling) = too, as well."
      },
      {
        "id": "sf7",
        "who": "you",
        "en": "No cilantro, please.",
        "thai": {
          "male": "ไม่ใส่ผักชีนะครับ",
          "female": "ไม่ใส่ผักชีนะคะ"
        },
        "roman": {
          "male": "mâi sài phàk-chii ná khráp",
          "female": "mâi sài phàk-chii ná khá"
        },
        "note": "ไม่ใส่ (mâi sài) = don't put in. ผักชี (phàk-chii) = cilantro. นะ (ná) makes it a friendly request."
      },
      {
        "id": "sf8",
        "who": "pim",
        "en": "Okay. Wait about five minutes.",
        "thai": "ได้ค่ะ รอห้านาทีนะคะ",
        "roman": "dâai khâ, raw hâa naa-thii ná khá",
        "note": "รอ (raw) = wait. ห้า (hâa, falling) = five. นาที (naa-thii) = minute."
      },
      {
        "id": "sf9",
        "who": "you",
        "en": "How much altogether?",
        "thai": {
          "male": "ทั้งหมดเท่าไหร่ครับ",
          "female": "ทั้งหมดเท่าไหร่คะ"
        },
        "roman": {
          "male": "tháng-mòt thâo-rài khráp",
          "female": "tháng-mòt thâo-rài khá"
        },
        "note": "ทั้งหมด (tháng-mòt) = altogether, high then low. เท่าไหร่ (thâo-rài) = how much."
      },
      {
        "id": "sf10",
        "who": "pim",
        "en": "Fifty-five baht.",
        "thai": "ห้าสิบห้าบาทค่ะ",
        "roman": "hâa-sìp-hâa bàat khâ",
        "note": "ห้าสิบ (hâa-sìp) = fifty, then ห้า (hâa) = five. บาท (bàat, low) = baht."
      }
    ],
    "drills": [
      {
        "id": "sf-l",
        "kind": "listen",
        "thai": "กินที่นี่หรือกลับบ้านคะ",
        "roman": "gin thîi-nîi rǔue glàp bâan khá",
        "en": "Eat here or take it home?",
        "options": [
          "Eat here or take it home?",
          "Do you want a fried egg on it?",
          "How much altogether?",
          "Wait about five minutes."
        ]
      },
      {
        "id": "sf-r",
        "kind": "read",
        "thai": "ไม่ใส่ผักชี",
        "roman": "mâi sài phàk-chii",
        "en": "No cilantro.",
        "options": [
          "No cilantro.",
          "No ice.",
          "Not spicy.",
          "To go."
        ]
      },
      {
        "id": "sf-p",
        "kind": "pick",
        "en": "“altogether”",
        "options": [
          "ทั้งหมด",
          "จาน",
          "ไข่ดาว",
          "กิน"
        ],
        "answer": "ทั้งหมด",
        "roman": "tháng-mòt"
      },
      {
        "id": "sf-b",
        "kind": "build",
        "en": "No cilantro, please.",
        "tiles": [
          "ไม่",
          "ใส่",
          "ผักชี",
          "นะ",
          "ครับ",
          "คะ",
          "ไข่"
        ],
        "answer": {
          "male": [
            "ไม่",
            "ใส่",
            "ผักชี",
            "นะ",
            "ครับ"
          ],
          "female": [
            "ไม่",
            "ใส่",
            "ผักชี",
            "นะ",
            "คะ"
          ]
        },
        "roman": {
          "male": "mâi sài phàk-chii ná khráp",
          "female": "mâi sài phàk-chii ná khá"
        }
      },
      {
        "id": "sf-part",
        "kind": "particle",
        "en": "You're asking how much it is altogether.",
        "stem": "ทั้งหมดเท่าไหร่",
        "stemRoman": "tháng-mòt thâo-rài",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "laundry",
    "title": "Laundry",
    "titleTh": "ร้านซักผ้า",
    "blurb": "Ask the price per kilo, when it's ready, whether they iron, and say you'll pick it up tomorrow.",
    "vocab": [
      "sak-phaa",
      "gi-loo",
      "set",
      "muea-rai",
      "phrung-nii",
      "riit",
      "dtawng"
    ],
    "lines": [
      {
        "id": "la1",
        "who": "nok",
        "en": "Hello. Laundry?",
        "thai": "สวัสดีค่ะ ซักผ้าไหมคะ",
        "roman": "sà-wàt-dii khâ, sák phâa mǎi khá",
        "note": "ซักผ้า (sák phâa) = wash clothes, the everyday word for doing laundry."
      },
      {
        "id": "la2",
        "who": "you",
        "en": "How much per kilo to wash?",
        "thai": {
          "male": "ซักผ้ากิโลละเท่าไหร่ครับ",
          "female": "ซักผ้ากิโลละเท่าไหร่คะ"
        },
        "roman": {
          "male": "sák phâa gì-loo lá thâo-rài khráp",
          "female": "sák phâa gì-loo lá thâo-rài khá"
        },
        "note": "กิโล (gì-loo) = kilo. ละ (lá, high) = per, so กิโลละ = per kilo. Most laundry shops charge by weight."
      },
      {
        "id": "la3",
        "who": "nok",
        "en": "Forty baht a kilo.",
        "thai": "กิโลละสี่สิบบาทค่ะ",
        "roman": "gì-loo lá sìi-sìp bàat khâ",
        "note": "สี่สิบ (sìi-sìp) = forty, both low. บาท (bàat) = baht."
      },
      {
        "id": "la4",
        "who": "you",
        "en": "When will it be done?",
        "thai": {
          "male": "เสร็จเมื่อไหร่ครับ",
          "female": "เสร็จเมื่อไหร่คะ"
        },
        "roman": {
          "male": "sèt mûea-rài khráp",
          "female": "sèt mûea-rài khá"
        },
        "note": "เสร็จ (sèt, low) = finished, done. เมื่อไหร่ (mûea-rài) = when, falling then low."
      },
      {
        "id": "la5",
        "who": "nok",
        "en": "Tomorrow evening.",
        "thai": "พรุ่งนี้เย็นค่ะ",
        "roman": "phrûng-níi yen khâ",
        "note": "พรุ่งนี้ (phrûng-níi) = tomorrow. เย็น (yen) = evening, the same word as cold."
      },
      {
        "id": "la6",
        "who": "you",
        "en": "Can you iron them too?",
        "thai": {
          "male": "รีดด้วยได้ไหมครับ",
          "female": "รีดด้วยได้ไหมคะ"
        },
        "roman": {
          "male": "rîit dûay dâai mǎi khráp",
          "female": "rîit dûay dâai mǎi khá"
        },
        "note": "รีด (rîit, falling) = to iron. ด้วย (dûay) = too. ได้ไหม (dâai mǎi) = can you?"
      },
      {
        "id": "la7",
        "who": "nok",
        "en": "Sure. Ironing is twenty baht extra.",
        "thai": "ได้ค่ะ รีดเพิ่มยี่สิบบาทค่ะ",
        "roman": "dâai khâ, rîit phêrm yîi-sìp bàat khâ",
        "note": "เพิ่ม (phêrm, falling) = extra, more. ยี่สิบ (yîi-sìp) = twenty, a special word, not sǎawng-sìp."
      },
      {
        "id": "la8",
        "who": "you",
        "en": "Then no need to iron.",
        "thai": {
          "male": "งั้นไม่ต้องรีดครับ",
          "female": "งั้นไม่ต้องรีดค่ะ"
        },
        "roman": {
          "male": "ngán mâi dtâwng rîit khráp",
          "female": "ngán mâi dtâwng rîit khâ"
        },
        "note": "งั้น (ngán, high) = then, in that case. ไม่ต้อง (mâi dtâwng) = no need to, both falling."
      },
      {
        "id": "la9",
        "who": "you",
        "en": "I'll come pick it up tomorrow.",
        "thai": {
          "male": "พรุ่งนี้จะมารับครับ",
          "female": "พรุ่งนี้จะมารับค่ะ"
        },
        "roman": {
          "male": "phrûng-níi jà maa ráp khráp",
          "female": "phrûng-níi jà maa ráp khâ"
        },
        "note": "จะ (jà, low) marks the future. มารับ (maa ráp) = come and pick up."
      },
      {
        "id": "la10",
        "who": "nok",
        "en": "Okay. Here's your laundry ticket.",
        "thai": "ได้ค่ะ นี่ใบรับผ้านะคะ",
        "roman": "dâai khâ, nîi bai ráp phâa ná khá",
        "note": "นี่ (nîi, falling) = here's. ใบรับผ้า (bai ráp phâa) = the slip you show to collect your clothes."
      }
    ],
    "drills": [
      {
        "id": "la-l",
        "kind": "listen",
        "thai": "พรุ่งนี้เย็นค่ะ",
        "roman": "phrûng-níi yen khâ",
        "en": "Tomorrow evening.",
        "options": [
          "Tomorrow evening.",
          "Forty baht a kilo.",
          "Ironing is twenty baht extra.",
          "Here's your laundry ticket."
        ]
      },
      {
        "id": "la-r",
        "kind": "read",
        "thai": "ไม่ต้องรีด",
        "roman": "mâi dtâwng rîit",
        "en": "No need to iron.",
        "options": [
          "No need to iron.",
          "Iron it too.",
          "When will it be done?",
          "Tomorrow evening."
        ]
      },
      {
        "id": "la-p",
        "kind": "pick",
        "en": "“tomorrow”",
        "options": [
          "พรุ่งนี้",
          "วันนี้",
          "เมื่อไหร่",
          "กิโล"
        ],
        "answer": "พรุ่งนี้",
        "roman": "phrûng-níi"
      },
      {
        "id": "la-b",
        "kind": "build",
        "en": "When will it be done?",
        "tiles": [
          "เสร็จ",
          "เมื่อไหร่",
          "ครับ",
          "คะ",
          "พรุ่งนี้"
        ],
        "answer": {
          "male": [
            "เสร็จ",
            "เมื่อไหร่",
            "ครับ"
          ],
          "female": [
            "เสร็จ",
            "เมื่อไหร่",
            "คะ"
          ]
        },
        "roman": {
          "male": "sèt mûea-rài khráp",
          "female": "sèt mûea-rài khá"
        }
      },
      {
        "id": "la-part",
        "kind": "particle",
        "en": "You're asking how much it is per kilo.",
        "stem": "กิโลละเท่าไหร่",
        "stemRoman": "gì-loo lá thâo-rài",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "haircut",
    "title": "Haircut",
    "titleTh": "ร้านตัดผม",
    "blurb": "Ask the price, skip the wash, say how short you want it, and say when it's enough.",
    "vocab": [
      "dtat-phom",
      "sa-phom",
      "baaep",
      "san",
      "yaaw",
      "khaang",
      "phaw"
    ],
    "lines": [
      {
        "id": "hc1",
        "who": "som",
        "en": "Hello. Haircut?",
        "thai": "สวัสดีค่ะ ตัดผมไหมคะ",
        "roman": "sà-wàt-dii khâ, dtàt phǒm mǎi khá",
        "note": "ตัดผม (dtàt phǒm) = to cut hair, get a haircut. ตัด (dtàt, low) = cut, ผม (phǒm, rising) = hair."
      },
      {
        "id": "hc2",
        "who": "you",
        "en": "How much is a haircut?",
        "thai": {
          "male": "ตัดผมเท่าไหร่ครับ",
          "female": "ตัดผมเท่าไหร่คะ"
        },
        "roman": {
          "male": "dtàt phǒm thâo-rài khráp",
          "female": "dtàt phǒm thâo-rài khá"
        },
        "note": "เท่าไหร่ (thâo-rài) = how much, the same as at the market."
      },
      {
        "id": "hc3",
        "who": "som",
        "en": "Two hundred baht. A wash too?",
        "thai": "สองร้อยบาทค่ะ สระผมด้วยไหมคะ",
        "roman": "sǎawng-ráwy bàat khâ, sà phǒm dûay mǎi khá",
        "note": "สองร้อย (sǎawng-ráwy) = two hundred. สระผม (sà phǒm) = wash hair. The ร in สระ is silent, so it's one syllable, sà (low)."
      },
      {
        "id": "hc4",
        "who": "you",
        "en": "No need, just the cut.",
        "thai": {
          "male": "ไม่ต้องครับ ตัดอย่างเดียว",
          "female": "ไม่ต้องค่ะ ตัดอย่างเดียว"
        },
        "roman": {
          "male": "mâi dtâwng khráp, dtàt yàang diaw",
          "female": "mâi dtâwng khâ, dtàt yàang diaw"
        },
        "note": "ไม่ต้อง (mâi dtâwng) = no need, from the laundry. อย่างเดียว (yàang diaw) = only, just this one thing."
      },
      {
        "id": "hc5",
        "who": "som",
        "en": "How would you like it cut?",
        "thai": "จะตัดแบบไหนคะ",
        "roman": "jà dtàt bàaep nǎi khá",
        "note": "แบบ (bàaep, low) = style, kind. แบบไหน (bàaep nǎi) = which style, what kind."
      },
      {
        "id": "hc6",
        "who": "you",
        "en": "A little shorter, please.",
        "thai": {
          "male": "ตัดสั้นนิดหน่อยครับ",
          "female": "ตัดสั้นนิดหน่อยค่ะ"
        },
        "roman": {
          "male": "dtàt sân nít-nàwy khráp",
          "female": "dtàt sân nít-nàwy khâ"
        },
        "note": "สั้น (sân, falling) = short. นิดหน่อย (nít-nàwy) = a little, as in small talk."
      },
      {
        "id": "hc7",
        "who": "you",
        "en": "Short on the sides, a bit longer on top.",
        "thai": {
          "male": "ข้างๆ สั้น ข้างบนยาวหน่อยครับ",
          "female": "ข้างๆ สั้น ข้างบนยาวหน่อยค่ะ"
        },
        "roman": {
          "male": "khâang-khâang sân, khâang bon yaaw nàwy khráp",
          "female": "khâang-khâang sân, khâang bon yaaw nàwy khâ"
        },
        "note": "ข้าง (khâang, falling) = side. ข้างๆ (khâang-khâang) = the sides. ข้างบน (khâang bon) = on top. ยาว (yaaw, mid) = long."
      },
      {
        "id": "hc8",
        "who": "som",
        "en": "About like this, okay?",
        "thai": "ประมาณนี้ได้ไหมคะ",
        "roman": "bprà-maan níi dâai mǎi khá",
        "note": "ประมาณนี้ (bprà-maan níi) = about like this. She'll hold up a mirror."
      },
      {
        "id": "hc9",
        "who": "you",
        "en": "Yes, that's enough. It's good.",
        "thai": {
          "male": "ได้ครับ พอแล้วครับ",
          "female": "ได้ค่ะ พอแล้วค่ะ"
        },
        "roman": {
          "male": "dâai khráp, phaw láew khráp",
          "female": "dâai khâ, phaw láew khâ"
        },
        "note": "พอ (phaw, mid) = enough. พอแล้ว (phaw láew) = that's enough, you can stop."
      },
      {
        "id": "hc10",
        "who": "som",
        "en": "Two hundred baht altogether.",
        "thai": "ทั้งหมดสองร้อยบาทค่ะ",
        "roman": "tháng-mòt sǎawng-ráwy bàat khâ",
        "note": "ทั้งหมด (tháng-mòt) = altogether, from the street food stall."
      }
    ],
    "drills": [
      {
        "id": "hc-l",
        "kind": "listen",
        "thai": "จะตัดแบบไหนคะ",
        "roman": "jà dtàt bàaep nǎi khá",
        "en": "How would you like it cut?",
        "options": [
          "How would you like it cut?",
          "A wash too?",
          "About like this, okay?",
          "Two hundred baht altogether."
        ]
      },
      {
        "id": "hc-r",
        "kind": "read",
        "thai": "พอแล้ว",
        "roman": "phaw láew",
        "en": "That's enough.",
        "options": [
          "That's enough.",
          "A little shorter.",
          "Just the cut.",
          "Longer on top."
        ]
      },
      {
        "id": "hc-p",
        "kind": "pick",
        "en": "“short”",
        "options": [
          "สั้น",
          "ยาว",
          "ข้าง",
          "พอ"
        ],
        "answer": "สั้น",
        "roman": "sân"
      },
      {
        "id": "hc-b",
        "kind": "build",
        "en": "How much is a haircut?",
        "tiles": [
          "ตัดผม",
          "เท่าไหร่",
          "ครับ",
          "คะ",
          "สั้น"
        ],
        "answer": {
          "male": [
            "ตัดผม",
            "เท่าไหร่",
            "ครับ"
          ],
          "female": [
            "ตัดผม",
            "เท่าไหร่",
            "คะ"
          ]
        },
        "roman": {
          "male": "dtàt phǒm thâo-rài khráp",
          "female": "dtàt phǒm thâo-rài khá"
        }
      },
      {
        "id": "hc-part",
        "kind": "particle",
        "en": "You're asking how much a haircut costs.",
        "stem": "ตัดผมเท่าไหร่",
        "stemRoman": "dtàt phǒm thâo-rài",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "phone",
    "title": "Phone shop",
    "titleTh": "ร้านโทรศัพท์",
    "blurb": "Get a SIM card: ask the price, pick the days, ask them to put it in, and find out where to top up.",
    "vocab": [
      "sim",
      "net",
      "wan",
      "chai-use",
      "dterm-ngern",
      "thaa",
      "mai-jam-gat"
    ],
    "lines": [
      {
        "id": "ph1",
        "who": "fah",
        "en": "Hello. What can I get you?",
        "thai": "สวัสดีค่ะ รับอะไรดีคะ",
        "roman": "sà-wàt-dii khâ, ráp à-rai dii khá",
        "note": "รับอะไรดี (ráp à-rai dii) = what would you like, what can I get you. You hear it in every shop."
      },
      {
        "id": "ph2",
        "who": "you",
        "en": "I'd like a SIM.",
        "thai": {
          "male": "อยากได้ซิมครับ",
          "female": "อยากได้ซิมค่ะ"
        },
        "roman": {
          "male": "yàak dâai sim khráp",
          "female": "yàak dâai sim khâ"
        },
        "note": "อยากได้ (yàak dâai) = I'd like, I want to get. ซิม (sim, mid) is the SIM card."
      },
      {
        "id": "ph3",
        "who": "fah",
        "en": "We have seven days or thirty days.",
        "thai": "มีเจ็ดวันกับสามสิบวันค่ะ",
        "roman": "mii jèt wan gàp sǎam-sìp wan khâ",
        "note": "วัน (wan, mid) = day. เจ็ดวัน (jèt wan) = seven days, สามสิบวัน (sǎam-sìp wan) = thirty days. กับ (gàp) = and."
      },
      {
        "id": "ph4",
        "who": "you",
        "en": "How much for thirty days?",
        "thai": {
          "male": "สามสิบวันเท่าไหร่ครับ",
          "female": "สามสิบวันเท่าไหร่คะ"
        },
        "roman": {
          "male": "sǎam-sìp wan thâo-rài khráp",
          "female": "sǎam-sìp wan thâo-rài khá"
        },
        "note": "Say the thing first, then เท่าไหร่ (thâo-rài), the same as at the market."
      },
      {
        "id": "ph5",
        "who": "fah",
        "en": "Five hundred baht, unlimited data.",
        "thai": "ห้าร้อยบาท เน็ตไม่จำกัดค่ะ",
        "roman": "hâa-ráwy bàat, nét mâi jam-gàt khâ",
        "note": "เน็ต (nét, high) = mobile data, internet. ไม่จำกัด (mâi jam-gàt) = no limit, unlimited."
      },
      {
        "id": "ph6",
        "who": "you",
        "en": "I'll take thirty days.",
        "thai": {
          "male": "เอาสามสิบวันครับ",
          "female": "เอาสามสิบวันค่ะ"
        },
        "roman": {
          "male": "ao sǎam-sìp wan khráp",
          "female": "ao sǎam-sìp wan khâ"
        },
        "note": "เอา (ao) = I'll take, the same word you order food with."
      },
      {
        "id": "ph7",
        "who": "you",
        "en": "Could you put the SIM in for me?",
        "thai": {
          "male": "ช่วยใส่ซิมให้หน่อยได้ไหมครับ",
          "female": "ช่วยใส่ซิมให้หน่อยได้ไหมคะ"
        },
        "roman": {
          "male": "chûay sài sim hâi nàwy dâai mǎi khráp",
          "female": "chûay sài sim hâi nàwy dâai mǎi khá"
        },
        "note": "ช่วย ... ให้หน่อย (chûay ... hâi nàwy) = please do ... for me. ใส่ (sài) = put in, from the street food stall."
      },
      {
        "id": "ph8",
        "who": "fah",
        "en": "Sure. There, it works now.",
        "thai": "ได้ค่ะ ใช้ได้แล้วค่ะ",
        "roman": "dâai khâ, chái dâai láew khâ",
        "note": "ใช้ (chái, high) = to use. ใช้ได้ (chái dâai) = it works. แล้ว (láew) = now, already."
      },
      {
        "id": "ph9",
        "who": "you",
        "en": "If the data runs out, where do I top up?",
        "thai": {
          "male": "ถ้าเน็ตหมด เติมเงินที่ไหนครับ",
          "female": "ถ้าเน็ตหมด เติมเงินที่ไหนคะ"
        },
        "roman": {
          "male": "thâa nét mòt, dterm ngern thîi nǎi khráp",
          "female": "thâa nét mòt, dterm ngern thîi nǎi khá"
        },
        "note": "ถ้า (thâa, falling) = if. หมด (mòt) = run out, all gone. เติมเงิน (dterm ngern) = top up, literally add money."
      },
      {
        "id": "ph10",
        "who": "fah",
        "en": "You can top up at 7-Eleven.",
        "thai": "เติมที่เซเว่นได้ค่ะ",
        "roman": "dterm thîi se-wên dâai khâ",
        "note": "เซเว่น (se-wên) is what everyone calls 7-Eleven. ได้ (dâai) at the end = you can."
      }
    ],
    "drills": [
      {
        "id": "ph-l",
        "kind": "listen",
        "thai": "ใช้ได้แล้วค่ะ",
        "roman": "chái dâai láew khâ",
        "en": "It works now.",
        "options": [
          "It works now.",
          "Five hundred baht.",
          "What can I get you?",
          "You can top up at 7-Eleven."
        ]
      },
      {
        "id": "ph-r",
        "kind": "read",
        "thai": "เติมเงิน",
        "roman": "dterm ngern",
        "en": "to top up",
        "options": [
          "to top up",
          "unlimited",
          "to use",
          "if"
        ]
      },
      {
        "id": "ph-p",
        "kind": "pick",
        "en": "“if”",
        "options": [
          "ถ้า",
          "ใช้",
          "วัน",
          "เน็ต"
        ],
        "answer": "ถ้า",
        "roman": "thâa"
      },
      {
        "id": "ph-b",
        "kind": "build",
        "en": "I'd like a SIM.",
        "tiles": [
          "อยาก",
          "ได้",
          "ซิม",
          "ครับ",
          "ค่ะ",
          "เน็ต"
        ],
        "answer": {
          "male": [
            "อยาก",
            "ได้",
            "ซิม",
            "ครับ"
          ],
          "female": [
            "อยาก",
            "ได้",
            "ซิม",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "yàak dâai sim khráp",
          "female": "yàak dâai sim khâ"
        }
      },
      {
        "id": "ph-part",
        "kind": "particle",
        "en": "You're asking where to top up.",
        "stem": "เติมเงินที่ไหน",
        "stemRoman": "dterm ngern thîi nǎi",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "exchange",
    "title": "Money exchange",
    "titleTh": "ร้านแลกเงิน",
    "blurb": "Change dollars into baht: ask the rate, hand over your passport, count your money, and ask for smaller notes.",
    "vocab": [
      "laek",
      "ngern",
      "phan",
      "nap",
      "gawn",
      "bai",
      "nang-sue-dern-thaang"
    ],
    "lines": [
      {
        "id": "ex1",
        "who": "kai",
        "en": "Hello. How can I help?",
        "thai": "สวัสดีค่ะ รับอะไรดีคะ",
        "roman": "sà-wàt-dii khâ, ráp à-rai dii khá",
        "note": "รับอะไรดี (ráp à-rai dii) again, the same as at the phone shop."
      },
      {
        "id": "ex2",
        "who": "you",
        "en": "I'd like to change money.",
        "thai": {
          "male": "อยากแลกเงินครับ",
          "female": "อยากแลกเงินค่ะ"
        },
        "roman": {
          "male": "yàak lâaek ngern khráp",
          "female": "yàak lâaek ngern khâ"
        },
        "note": "แลก (lâaek, falling) = to exchange. เงิน (ngern, mid) = money. แลกเงิน = change money."
      },
      {
        "id": "ex3",
        "who": "kai",
        "en": "What money are you changing?",
        "thai": "แลกเงินอะไรคะ",
        "roman": "lâaek ngern à-rai khá",
        "note": "อะไร (à-rai) = what. Here she means which currency."
      },
      {
        "id": "ex4",
        "who": "you",
        "en": "Dollars. How many baht for one dollar today?",
        "thai": {
          "male": "ดอลลาร์ครับ วันนี้หนึ่งดอลลาร์ได้กี่บาทครับ",
          "female": "ดอลลาร์ค่ะ วันนี้หนึ่งดอลลาร์ได้กี่บาทคะ"
        },
        "roman": {
          "male": "dawn-lâa khráp, wan-níi nùeng dawn-lâa dâai gìi bàat khráp",
          "female": "dawn-lâa khâ, wan-níi nùeng dawn-lâa dâai gìi bàat khá"
        },
        "note": "ดอลลาร์ (dawn-lâa) = dollar. ได้กี่บาท (dâai gìi bàat) = get how many baht. This is how you ask the rate."
      },
      {
        "id": "ex5",
        "who": "kai",
        "en": "Thirty-three baht forty satang.",
        "thai": "สามสิบสามบาทสี่สิบสตางค์ค่ะ",
        "roman": "sǎam-sìp-sǎam bàat sìi-sìp sà-dtaang khâ",
        "note": "สตางค์ (sà-dtaang) = satang, 100 satang make one baht. You only hear satang at banks and exchange counters."
      },
      {
        "id": "ex6",
        "who": "you",
        "en": "I'll change one hundred dollars.",
        "thai": {
          "male": "แลกหนึ่งร้อยดอลลาร์ครับ",
          "female": "แลกหนึ่งร้อยดอลลาร์ค่ะ"
        },
        "roman": {
          "male": "lâaek nùeng-ráwy dawn-lâa khráp",
          "female": "lâaek nùeng-ráwy dawn-lâa khâ"
        },
        "note": "Thai puts the number before the money word, like English: หนึ่งร้อยดอลลาร์ (nùeng-ráwy dawn-lâa) = one hundred dollars."
      },
      {
        "id": "ex7",
        "who": "kai",
        "en": "May I see your passport, please?",
        "thai": "ขอดูหนังสือเดินทางหน่อยค่ะ",
        "roman": "khǎw duu nǎng-sǔe dern-thaang nàwy khâ",
        "note": "หนังสือเดินทาง (nǎng-sǔe dern-thaang) = passport, literally travel book. Many people also just say passport in English."
      },
      {
        "id": "ex8",
        "who": "you",
        "en": "Here you go.",
        "thai": {
          "male": "นี่ครับ",
          "female": "นี่ค่ะ"
        },
        "roman": {
          "male": "nîi khráp",
          "female": "nîi khâ"
        },
        "note": "นี่ (nîi, falling) = here, this. Say it as you hand something over."
      },
      {
        "id": "ex9",
        "who": "kai",
        "en": "Three thousand three hundred forty baht. Please count it first.",
        "thai": "สามพันสามร้อยสี่สิบบาทค่ะ นับดูก่อนนะคะ",
        "roman": "sǎam-phan sǎam-ráwy sìi-sìp bàat khâ, náp duu gàwn ná khá",
        "note": "พัน (phan) = thousand. นับ (náp, high) = to count. นับดู (náp duu) = count and check. ก่อน (gàwn) = first."
      },
      {
        "id": "ex10",
        "who": "you",
        "en": "Could I have some smaller notes too?",
        "thai": {
          "male": "ขอเงินย่อยด้วยได้ไหมครับ",
          "female": "ขอเงินย่อยด้วยได้ไหมคะ"
        },
        "roman": {
          "male": "khǎw ngern yâwy dûay dâai mǎi khráp",
          "female": "khǎw ngern yâwy dûay dâai mǎi khá"
        },
        "note": "เงินย่อย (ngern yâwy) = small money, smaller notes. ด้วย (dûay) = too, as well."
      },
      {
        "id": "ex11",
        "who": "kai",
        "en": "Sure. Here are five hundred-baht notes.",
        "thai": "ได้ค่ะ ใบละร้อยห้าใบค่ะ",
        "roman": "dâai khâ, bai lá ráwy hâa bai khâ",
        "note": "ใบ (bai) counts notes, tickets and sheets. ใบละร้อย (bai lá ráwy) = a hundred each. ห้าใบ (hâa bai) = five notes."
      }
    ],
    "drills": [
      {
        "id": "ex-l",
        "kind": "listen",
        "thai": "นับดูก่อนนะคะ",
        "roman": "náp duu gàwn ná khá",
        "en": "Please count it first.",
        "options": [
          "Please count it first.",
          "May I see your passport?",
          "How can I help?",
          "Thirty-three baht forty satang."
        ]
      },
      {
        "id": "ex-r",
        "kind": "read",
        "thai": "แลกเงิน",
        "roman": "lâaek ngern",
        "en": "to change money",
        "options": [
          "to change money",
          "to top up",
          "to count",
          "small notes"
        ]
      },
      {
        "id": "ex-p",
        "kind": "pick",
        "en": "“thousand”",
        "options": [
          "พัน",
          "ร้อย",
          "สิบ",
          "ใบ"
        ],
        "answer": "พัน",
        "roman": "phan"
      },
      {
        "id": "ex-b",
        "kind": "build",
        "en": "I'd like to change money.",
        "tiles": [
          "อยาก",
          "แลก",
          "เงิน",
          "ครับ",
          "ค่ะ",
          "นับ"
        ],
        "answer": {
          "male": [
            "อยาก",
            "แลก",
            "เงิน",
            "ครับ"
          ],
          "female": [
            "อยาก",
            "แลก",
            "เงิน",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "yàak lâaek ngern khráp",
          "female": "yàak lâaek ngern khâ"
        }
      },
      {
        "id": "ex-part",
        "kind": "particle",
        "en": "You're asking for smaller notes.",
        "stem": "ขอเงินย่อยด้วยได้ไหม",
        "stemRoman": "khǎw ngern yâwy dûay dâai mǎi",
        "particleKind": "question"
      }
    ]
  },
  {
    "id": "tuktuk",
    "title": "Tuk-tuk",
    "titleTh": "รถตุ๊กตุ๊ก",
    "blurb": "Agree a price before you get in, haggle it down, say no shop stops, ask if it's far, and tell the driver where to stop.",
    "vocab": [
      "wat",
      "raan",
      "wae",
      "dtaae",
      "glai-far",
      "naa-thii",
      "jawt"
    ],
    "lines": [
      {
        "id": "tk1",
        "who": "ton",
        "en": "Hello. Where to?",
        "thai": "สวัสดีครับ ไปไหนครับ",
        "roman": "sà-wàt-dii khráp, bpai nǎi khráp",
        "note": "ไปไหน (bpai nǎi) = go where. Drivers open with this."
      },
      {
        "id": "tk2",
        "who": "you",
        "en": "Wat Pho. How much?",
        "thai": {
          "male": "ไปวัดโพธิ์ เท่าไหร่ครับ",
          "female": "ไปวัดโพธิ์ เท่าไหร่คะ"
        },
        "roman": {
          "male": "bpai wát phoo, thâo-rài khráp",
          "female": "bpai wát phoo, thâo-rài khá"
        },
        "note": "วัด (wát, high) = temple. Ask the price before you get in; tuk-tuks have no meter."
      },
      {
        "id": "tk3",
        "who": "ton",
        "en": "Three hundred baht.",
        "thai": "สามร้อยบาทครับ",
        "roman": "sǎam-ráwy bàat khráp",
        "note": "สามร้อย (sǎam-ráwy) = three hundred."
      },
      {
        "id": "tk4",
        "who": "you",
        "en": "That's too expensive. Can you do a hundred fifty?",
        "thai": {
          "male": "แพงไป ร้อยห้าสิบได้ไหมครับ",
          "female": "แพงไป ร้อยห้าสิบได้ไหมคะ"
        },
        "roman": {
          "male": "phaaeng bpai, ráwy-hâa-sìp dâai mǎi khráp",
          "female": "phaaeng bpai, ráwy-hâa-sìp dâai mǎi khá"
        },
        "note": "แพงไป (phaaeng bpai) = too expensive. ร้อยห้าสิบ (ráwy-hâa-sìp) = a hundred fifty; people drop the หนึ่ง."
      },
      {
        "id": "tk5",
        "who": "ton",
        "en": "I can't do a hundred fifty. Two hundred.",
        "thai": "ร้อยห้าสิบไม่ได้ครับ สองร้อยครับ",
        "roman": "ráwy-hâa-sìp mâi dâai khráp, sǎwng-ráwy khráp",
        "note": "ไม่ได้ (mâi dâai) = can't, no can do. สองร้อย (sǎwng-ráwy) = two hundred."
      },
      {
        "id": "tk6",
        "who": "you",
        "en": "Okay, two hundred, but no stopping at shops.",
        "thai": {
          "male": "โอเค สองร้อย แต่ไม่แวะร้านนะครับ",
          "female": "โอเค สองร้อย แต่ไม่แวะร้านนะค่ะ"
        },
        "roman": {
          "male": "oo-khee, sǎwng-ráwy, dtàae mâi wáe ráan ná khráp",
          "female": "oo-khee, sǎwng-ráwy, dtàae mâi wáe ráan ná khâ"
        },
        "note": "แต่ (dtàae, low) = but. แวะ (wáe, high) = to stop off. ร้าน (ráan, high) = shop. Cheap fares often come with a stop at a gem or suit shop."
      },
      {
        "id": "tk7",
        "who": "ton",
        "en": "Sure, no stops. Hop in.",
        "thai": "ได้ครับ ไม่แวะ ขึ้นมาเลยครับ",
        "roman": "dâai khráp, mâi wáe, khûen maa loei khráp",
        "note": "ขึ้นมาเลย (khûen maa loei) = come on up, go ahead and get in."
      },
      {
        "id": "tk8",
        "who": "you",
        "en": "Is it far?",
        "thai": {
          "male": "ไกลไหมครับ",
          "female": "ไกลไหมคะ"
        },
        "roman": {
          "male": "glai mǎi khráp",
          "female": "glai mǎi khá"
        },
        "note": "ไกล (glai, mid) = far. Careful: ใกล้ (glâi, falling) = close."
      },
      {
        "id": "tk9",
        "who": "ton",
        "en": "Not far. About fifteen minutes.",
        "thai": "ไม่ไกลครับ ประมาณสิบห้านาทีครับ",
        "roman": "mâi glai khráp, bprà-maan sìp-hâa naa-thii khráp",
        "note": "ประมาณ (bprà-maan) = about. นาที (naa-thii) = minute."
      },
      {
        "id": "tk10",
        "who": "you",
        "en": "You can stop right here.",
        "thai": {
          "male": "จอดตรงนี้ได้เลยครับ",
          "female": "จอดตรงนี้ได้เลยค่ะ"
        },
        "roman": {
          "male": "jàwt dtrong-níi dâai loei khráp",
          "female": "jàwt dtrong-níi dâai loei khâ"
        },
        "note": "จอด (jàwt, low) = to park, pull over. ตรงนี้ (dtrong-níi) = right here."
      },
      {
        "id": "tk11",
        "who": "ton",
        "en": "Okay. Two hundred baht.",
        "thai": "ได้ครับ สองร้อยบาทครับ",
        "roman": "dâai khráp, sǎwng-ráwy bàat khráp",
        "note": "Pay the price you agreed. นี่ครับ (nîi khráp) as you hand it over."
      }
    ],
    "drills": [
      {
        "id": "tk-l",
        "kind": "listen",
        "thai": "ไม่ไกลครับ ประมาณสิบห้านาทีครับ",
        "roman": "mâi glai khráp, bprà-maan sìp-hâa naa-thii khráp",
        "en": "Not far. About fifteen minutes.",
        "options": [
          "Not far. About fifteen minutes.",
          "Very close. About five minutes.",
          "Three hundred baht.",
          "Hop in."
        ]
      },
      {
        "id": "tk-r",
        "kind": "read",
        "thai": "แพงไป",
        "roman": "phaaeng bpai",
        "en": "too expensive",
        "options": [
          "too expensive",
          "too far",
          "not far",
          "stop here"
        ]
      },
      {
        "id": "tk-p",
        "kind": "pick",
        "en": "“far”",
        "options": [
          "ไกล",
          "ใกล้",
          "ไป",
          "ได้"
        ],
        "answer": "ไกล",
        "roman": "glai"
      },
      {
        "id": "tk-b",
        "kind": "build",
        "en": "You can stop right here.",
        "tiles": [
          "จอด",
          "ตรงนี้",
          "ได้",
          "เลย",
          "ครับ",
          "ค่ะ",
          "แวะ"
        ],
        "answer": {
          "male": [
            "จอด",
            "ตรงนี้",
            "ได้",
            "เลย",
            "ครับ"
          ],
          "female": [
            "จอด",
            "ตรงนี้",
            "ได้",
            "เลย",
            "ค่ะ"
          ]
        },
        "roman": {
          "male": "jàwt dtrong-níi dâai loei khráp",
          "female": "jàwt dtrong-níi dâai loei khâ"
        }
      },
      {
        "id": "tk-part",
        "kind": "particle",
        "en": "You're asking if it's far.",
        "stem": "ไกลไหม",
        "stemRoman": "glai mǎi",
        "particleKind": "question"
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

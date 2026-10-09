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

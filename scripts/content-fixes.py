"""Applies REVIEW.md Prompt 1 Thai content fixes to src/data. Each replacement must match exactly once."""
import json, re, pathlib
D = pathlib.Path("src/data")

def sub(path, old, new, count=1):
    p = D / path
    s = p.read_text()
    n = s.count(old)
    assert n == count, f"{path}: expected {count} of {old!r}, found {n}"
    p.write_text(s.replace(old, new))

# 1. ขึ้น is falling
sub("vocab.ts", '"roman": "khúen",\n    "en": "to get on, to go up",\n    "hint": "High, not falling."',
    '"roman": "khûen",\n    "en": "to get on, to go up",\n    "hint": "Falling. High-class ข with mai tho is falling."')
sub("scenes.ts", '"roman": "dâai khráp khúen dâai loei khráp",\n        "note": "ขึ้น is high. The high tone dips at the end — that dip is still the high tone, not falling."',
    '"roman": "dâai khráp khûen dâai loei khráp",\n        "note": "ขึ้น falls: high-class ข plus ้ gives a falling tone."')

# 2. เผ็ด is low
sub("vocab.ts", '"roman": "phét",\n    "en": "spicy",\n    "hint": "High."', '"roman": "phèt",\n    "en": "spicy",\n    "hint": "Low. High-class ผ on a short dead syllable is low."')
sub("scenes.ts", "mâi phét", "mâi phèt", count=3)
sub("scenes.ts", '"note": "ไม่ falls. เผ็ด is high."', '"note": "ไม่ falls. เผ็ด is low."')
sub("tones.ts", '"thai": "เผ็ด",\n    "roman": "phét",\n    "en": "spicy",\n    "tone": "high"', '"thai": "เผ็ด",\n    "roman": "phèt",\n    "en": "spicy",\n    "tone": "low"')
sub("tones.ts", '"thai": "ครับ",\n    "roman": "khráp",\n    "en": "polite particle",\n    "tone": "high"\n  },',
    '"thai": "ครับ",\n    "roman": "khráp",\n    "en": "polite particle",\n    "tone": "high"\n  },\n  {\n    "thai": "ม้า",\n    "roman": "máa",\n    "en": "horse",\n    "tone": "high"\n  },')

# 3. ที่นี่ is falling, falling
sub("vocab.ts", '"hint": "Falling, then high."', '"hint": "Falling, falling. นี่ (here/this) is falling; นี้ in อันนี้ and วันนี้ is high."')
sub("scenes.ts", '"note": "ใช่ falls. ที่นี่ is falling, then high."', '"note": "ใช่ falls. ที่นี่ is falling, falling."')

# 4. คนเดียว, not ท่านเดียว
sub("scenes.ts", '"male": "ท่านเดียวครับ",\n          "female": "ท่านเดียวค่ะ"', '"male": "คนเดียวครับ",\n          "female": "คนเดียวค่ะ"')
sub("scenes.ts", '"male": "thâan diao khráp",\n          "female": "thâan diao khâ"\n        }\n      },',
    '"male": "khon diaw khráp",\n          "female": "khon diaw khâ"\n        },\n        "note": "Staff say ท่าน to be polite about you; you say คน about yourself."\n      },')

# 5. ป่า -> bpàa
sub("tones.ts", '"roman": "pàa"', '"roman": "bpàa"', count=3)

# 6. ห example + note
sub("letters.ts", '"letter": "ห",\n    "chant": "หอ หีบ",\n    "example": {\n      "thai": "หมา",\n      "roman": "mǎa",\n      "en": "dog"\n    }',
    '"letter": "ห",\n    "chant": "หอ หีบ",\n    "example": {\n      "thai": "ห้า",\n      "roman": "hâa",\n      "en": "five"\n    },\n    "note": "Silent in หมา, หนู, หมอ: it only raises the tone."')

# 7. ลาก่อน note; 8. l4 note
sub("vocab.ts", '"roman": "laa-kàwn",\n    "en": "goodbye"', '"roman": "laa-kàwn",\n    "en": "goodbye",\n    "hint": "Final-sounding, like \\"farewell\\". Day to day, Thais say ไปก่อนนะครับ/คะ or บ๊ายบาย."')
sub("scenes.ts", '"male": "laa-kàwn khráp",\n          "female": "laa-kàwn khâ"\n        }\n      },',
    '"male": "laa-kàwn khráp",\n          "female": "laa-kàwn khâ"\n        },\n        "note": "Final-sounding, like \\"farewell\\". Day to day, Thais say ไปก่อนนะครับ/คะ or บ๊ายบาย."\n      },')
sub("scenes.ts", '"note": "นะ softens it. Her คะ is the question-side particle, and here it keeps the goodbye light."',
    '"note": "นะ softens it. After นะ, women use คะ (high): นะคะ."')

# 8b. ไหม / ฉัน spoken high
sub("vocab.ts", '"hint": "Rising. Turns a statement into a yes-no question."', '"hint": "Rising. Turns a statement into a yes-no question. Written rising; in everyday speech usually said high (mái)."')
sub("vocab.ts", '"roman": "chǎn",\n    "en": "I, often female",\n    "hint": "Rising."', '"roman": "chǎn",\n    "en": "I, often female",\n    "hint": "Rising. Written rising; in everyday speech usually said high (chán)."')

# 9. market opener
sub("scenes.ts", '"thai": "สวัสดีครับ มาดูอะไรดีครับ",\n        "roman": "sà-wàt-dii khráp maa duu à-rai dii khráp"',
    '"thai": "สวัสดีครับ ดูอะไรครับ",\n        "roman": "sà-wàt-dii khráp duu à-rai khráp"')
print("all content fixes applied")

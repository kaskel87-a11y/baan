"""7-day streak congratulations (Pim, then you). Voices: python make_voices.py streak_7_reel, then
python render.py streak_7_voiced"""
from streak_milestone import Reel

L = [
    (1.4, 3.5, {"id": "s7a", "thai": "เจ็ดวันติดกันแล้วค่ะ", "roman": "jèt wan dtìt gan láew khâ", "en": "Seven days in a row now."}, "pim"),
    (3.7, 5.7, {"id": "s7b", "thai": "เก่งมากเลยค่ะ", "roman": "gèng mâak loei khâ", "en": "Really well done."}, "pim"),
    (5.9, 7.9, {"id": "s7c", "thai": "พรุ่งนี้เจอกันครับ", "roman": "phrûng-níi jer gan khráp", "en": "See you tomorrow."}, "you"),
]
reel = Reel("streak7", "เจ็ดวัน", "7-day streak", "7", L, 8.1, 9.6, extra="week")
NAME, DURATION, END = reel.NAME, reel.DURATION, reel.END
draw, events = reel.draw, reel.events

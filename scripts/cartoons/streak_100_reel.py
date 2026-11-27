"""100-day streak congratulations (Pim, then you). Voices: python make_voices.py streak_100_reel, then
python render.py streak_100_voiced"""
from streak_milestone import Reel

L = [
    (1.4, 3.5, {"id": "s100a", "thai": "หนึ่งร้อยวันแล้วค่ะ", "roman": "nùeng-ráwy wan láew khâ", "en": "One hundred days already!"}, "pim"),
    (3.7, 5.7, {"id": "s100b", "thai": "สุดยอดมากค่ะ", "roman": "sùt yâwt mâak khâ", "en": "Truly amazing."}, "pim"),
    (5.9, 7.9, {"id": "s100c", "thai": "ขอบคุณมากครับ", "roman": "khàwp-khun mâak khráp", "en": "Thank you very much."}, "you"),
]
reel = Reel("streak100", "หนึ่งร้อยวัน", "100-day streak", "100", L, 8.1, 9.6, extra="trophy")
NAME, DURATION, END = reel.NAME, reel.DURATION, reel.END
draw, events = reel.draw, reel.events

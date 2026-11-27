"""Short congratulations cartoon for a 30-day streak, in Baan's flat style."""
import math, skia
from baan_toon import *

NAME = "streak30"
DURATION = 12.0
CX, CY, CW, CH = 40, 440, 1000, 1120
GY = 980
S = 6.4
HEAD_TOP = lambda feet, sc: feet - 60 * sc

L = [
    (1.4, 3.9, {"id": "st1", "thai": "ยินดีด้วยค่ะ", "roman": "yin-dii dûay khâ", "en": "Congratulations!"}, "pim"),
    (4.1, 8.0, {"id": "st2", "thai": "สามสิบวันติดกันเลยค่ะ เก่งมากค่ะ", "roman": "sǎam-sìp wan dtìt gan loei khâ gèng mâak khâ", "en": "Thirty days in a row. Well done."}, "pim"),
    (8.2, 10.4, {"id": "st3", "thai": "ขอบคุณครับ", "roman": "khàwp-khun khráp", "en": "Thank you."}, "you"),
]
END = 10.5
PIM_X, YOU_X = 300, 720

def blink(t, off):
    return ((t + off) % 3.3) < 0.13

def talking(t, who):
    for s, e, ln, sp in L:
        if sp == who and s + 0.15 < t < min(e, s + 0.15 + 0.32 * len(ln["roman"].split()) + 0.4):
            return abs(math.sin((t - s) * 15))
    return 0.0

def events():
    ev = [(0.4, "sparkle"), (1.0, "chime")]
    ev += [(s, "pop") for s, e, ln, w in L]
    ev += [(END + 0.1, "sparkle"), (END + 0.25, "chime")]
    return ev

def draw_scene(cv, t):
    cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM))
    cv.drawRect(skia.Rect.MakeXYWH(0, GY, CW, CH - GY), fill(SAND))
    circle(cv, 860, 140, 48, GOLD)
    tree(cv, 120, GY + 4, 4.6, math.sin(t * 1.2) * 0.7)
    # big 30 badge
    circle(cv, 500, 280, 118, TEAL)
    draw_text(cv, "30", 500, 214, "serif_b", 150, ACCENT_INK, anchor="tc")
    wave = ease(prog(t, 0.6, 1.3)) * (0.7 + 0.3 * abs(math.sin(t * 6)))
    person(cv, PIM_X, GY, S, shirt=TEAL, bun=True, look=1, wave=wave, talk=talking(t, "pim"), blink=blink(t, 0.2), happy=True)
    person(cv, YOU_X, GY, S, shirt=CLAY, look=-1, talk=talking(t, "you"), blink=blink(t, 1.1), happy=True)

def draw_end(cv, t):
    a = ease(prog(t, END, END + 0.45))
    cv.drawRect(skia.Rect.MakeWH(W, H), fill(PAPER, a))
    if a <= 0:
        return
    k = back(prog(t, END + 0.1, END + 0.55))
    cv.save(); cv.translate(W / 2, 700); cv.scale(k, k); house_logo(cv, -110, -110, 220); cv.restore()
    draw_text(cv, "สามสิบวัน", W / 2, 880, "serif_b", 96, INK, a, anchor="tc")
    draw_text(cv, "30-day streak", W / 2, 1020, "serif", 64, INK, a, anchor="tc")
    for i, (sx, sy) in enumerate(((180, 520), (900, 500), (240, 860), (860, 900))):
        sparkle(cv, sx, sy, 22 + 8 * math.sin(t * 4 + i), GOLD, a * (0.6 + 0.4 * math.sin(t * 3 + i * 2)))

def draw(cv, t):
    cv.clear(col(PAPER))
    top_bar(cv)
    if t >= END:
        draw_end(cv, t)
        return
    lesson_title(cv, "สามสิบวัน", "30-day streak")
    cv.save(); cv.translate(CX, CY); card_clip(cv, 0, 0, CW, CH)
    draw_scene(cv, t)
    fade = max(1 - prog(t, 0, 0.3), prog(t, END - 0.25, END))
    if fade > 0:
        cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM, ease(clamp(fade))))
    cv.restore()
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(CX, CY, CW, CH), 56, 56), stroke(LINE, 3))
    pim_tip = (CX + PIM_X, CY + HEAD_TOP(GY, S) - 16)
    you_tip = (CX + YOU_X, CY + HEAD_TOP(GY, S) - 16)
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else END - 0.15
        end_t = min(e, nxt - 0.12)
        if who == "you":
            bubble(cv, ln, you_tip[0], you_tip[1], "left", s, t, end_t, mine=True, x_min=CX + 30, x_max=CX + CW - 30)
        else:
            bubble(cv, ln, pim_tip[0], pim_tip[1], "right", s, t, end_t, mine=False, x_min=CX + 30, x_max=CX + CW - 30)

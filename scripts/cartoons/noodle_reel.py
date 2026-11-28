"""Scene reel: the jars on a noodle table, using Baan's own lines from the chim scene
(tf1–tf6 in src/data/scenes.ts). Pim (vendor, female voice) and Ton (diner, male voice);
the customer uses the ครับ forms. Flat Baan art only — pacing borrowed, look not copied."""
import math, skia
from baan_toon import *
from lesson_data import line

NAME = "noodle"
DURATION = 44.0
CX, CY, CW, CH = 40, 440, 1000, 1120
GY = 900
S = 5.4
VOICES = {"you": "male", "ton": "male", "pim": "female"}
# generous bubble windows; voices must end before the window does
L = [
    (4.0, 7.2, line("chim", "tf1"), "pim"),
    (7.4, 11.0, line("chim", "tf2", "male"), "you"),
    (11.2, 14.2, line("chim", "tf3"), "ton"),
    (14.6, 22.4, line("chim", "tf4"), "pim"),
    (22.8, 27.0, line("chim", "tf5", "male"), "you"),
    (27.3, 33.0, line("chim", "tf6"), "pim"),
]
BOWL_T = 3.6
SUGAR_T = 8.2
END = 38.0

def blink(t, off): return ((t + off) % 3.3) < 0.13
def talking(t, who):
    for s, e, ln, sp in L:
        if sp == who and s + 0.15 < t < min(e, s + 0.15 + 0.32 * len(ln["roman"].split()) + 0.4):
            return abs(math.sin((t - s) * 15))
    return 0.0

def jar(cv, x, y, w, h, body, lid, a=1.0, pulse=0.0):
    """A flat condiment jar. x,y is the bottom-center."""
    sc = 1 + 0.08 * pulse
    cv.save(); cv.translate(x, y); cv.scale(sc, sc)
    rrect(cv, -w / 2, -h, w, h, 8, body, a)
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2, -h, w, h), 8, 8), stroke(INK, 3, a))
    rrect(cv, -w / 2 - 3, -h - 10, w + 6, 12, 5, lid, a)
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2 - 3, -h - 10, w + 6, 12), 5, 5), stroke(INK, 3, a))
    cv.drawPath(poly([(2, -h - 10), (2, -h - 38)], False), stroke(MUTED, 4, a))
    circle(cv, 2, -h - 42, 6, SAND, a)
    cv.restore()

def bowl(cv, x, y, s, t, landed=1.0):
    """A flat noodle bowl. x,y is the bowl's center on the table."""
    if landed <= 0.02:
        return
    lift = (1 - landed) * 90
    a = landed
    cv.save(); cv.translate(x, y - lift)
    cv.drawOval(skia.Rect.MakeXYWH(-72 * s, 18 * s, 144 * s, 28 * s), fill(INK, 0.16 * a))
    # body
    cv.drawOval(skia.Rect.MakeXYWH(-68 * s, -8 * s, 136 * s, 44 * s), fill(CREAM, a))
    cv.drawOval(skia.Rect.MakeXYWH(-68 * s, -8 * s, 136 * s, 44 * s), stroke(INK, 3, a))
    # rim and broth
    cv.drawOval(skia.Rect.MakeXYWH(-68 * s, -36 * s, 136 * s, 48 * s), fill(CREAM, a))
    cv.drawOval(skia.Rect.MakeXYWH(-68 * s, -36 * s, 136 * s, 48 * s), stroke(INK, 3, a))
    cv.drawOval(skia.Rect.MakeXYWH(-56 * s, -28 * s, 112 * s, 32 * s), fill(GOLD, a))
    circle(cv, -16 * s, -12 * s, 7 * s, CLAY, a)
    circle(cv, 18 * s, -10 * s, 6 * s, LEAF, a)
    circle(cv, 4 * s, -4 * s, 5 * s, CLAY, a)
    if landed > 0.7:
        steam(cv, 0, -40 * s, 2.2 * s, t, 3, MUTED)
    cv.save(); cv.translate(-52 * s, -16 * s); cv.rotate(-22)
    cv.drawRect(skia.Rect.MakeXYWH(0, 0, 4 * s, 78 * s), fill(HAIR, a))
    cv.restore()
    cv.restore()

def draw_stall(cv, t):
    # wall + simple tile band (flat Baan colors, not a 3D shop)
    cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(SAND))
    cv.drawRect(skia.Rect.MakeXYWH(0, 0, CW, 360), fill(TEAL))
    rrect(cv, 300, 50, 400, 90, 20, CREAM)
    draw_text(cv, "ก๋วยเตี๋ยว", 500, 66, "serif_b", 64, INK, anchor="tc")
    # tile band above the counter
    for i in range(10):
        x = i * 100
        cv.drawRect(skia.Rect.MakeXYWH(x, 360, 98, 70), fill(CREAM if i % 2 == 0 else SAND))
        cv.drawRect(skia.Rect.MakeXYWH(x, 430, 98, 70), fill(SAND if i % 2 == 0 else CREAM))
    # counter body; lip and table are drawn after Pim so she stands behind them
    cv.drawRect(skia.Rect.MakeXYWH(0, 500, CW, 220), fill(TEAL))
    # floor
    cv.drawRect(skia.Rect.MakeXYWH(0, 980, CW, CH - 980), fill(SAND))

    person(cv, 220, 730, 4.0, shirt=TEAL2, bun=True, apron=CREAM, blink=blink(t, 0.2),
           look=1, talk=talking(t, "pim"), happy=t > 27)
    rrect(cv, 20, 688, 960, 28, 8, TEAL2)
    rrect(cv, 50, 730, 900, 230, 18, CREAM)
    person(cv, 150, 1040, 5.0, shirt=TEAL, blink=blink(t, 0.8), look=1,
           talk=talking(t, "you"), happy=t > 32)
    person(cv, 900, 1040, 5.0, shirt=CLAY, blink=blink(t, 1.4), look=-1,
           talk=talking(t, "ton"), happy=t > 11.2, wave=0.7 if 11.2 < t < 14 else 0.0)

    landed = ease(prog(t, BOWL_T, BOWL_T + 0.45))
    bowl(cv, 300, 830, 1.15, t, landed)

    # four jars in a clear row on the table, drawn last so nobody covers them
    jars = [
        (480, 880, 52, 84, SAND, CREAM, "น้ำตาล"),
        (590, 880, 52, 84, GOLD, CLAY, "น้ำปลา"),
        (700, 880, 52, 84, CLAY, HAIR, "พริกป่น"),
        (810, 880, 52, 84, LEAF, TEAL, "พริกดอง"),
    ]
    t4s, t4e = L[3][0], L[3][1]
    for i, (x, y, w, h, body, lid, label) in enumerate(jars):
        pulse = 0.0
        if t4s <= t <= t4e:
            slot = (t4e - t4s) / 4
            u = (t - t4s) / slot
            if i <= u < i + 1:
                pulse = math.sin((u - i) * math.pi)
        jar(cv, x, y, w, h, body, lid, 1.0, pulse)
        draw_text(cv, label, x, y + 10, "sans_b", 24, INK, anchor="tc")

def draw(cv, t):
    cv.clear(col(PAPER))
    top_bar(cv)
    if t >= END:
        end_card(cv, t, END)
        return
    lesson_title(cv, "ชิมก่อน", "Taste it first")
    cv.save(); cv.translate(CX, CY); card_clip(cv, 0, 0, CW, CH)
    draw_stall(cv, t)
    f = max(1 - prog(t, 0, 0.3), prog(t, END - 0.3, END))
    if f > 0:
        cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM, ease(clamp(f))))
    cv.restore()
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(CX, CY, CW, CH), 56, 56), stroke(LINE, 3))
    # Pim stands high behind the counter, so her bubble is pinned lower in the card
    heads = {
        "pim": (CX + 260, CY + 780, "left", False),
        "you": (CX + 150, CY + 1040 - 60 * 5.0 - 8, "right", True),
        "ton": (CX + 900, CY + 1040 - 60 * 5.0 - 8, "left", False),
    }
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else END - 0.4
        end_t = min(e, nxt - 0.12)
        hx, hy, side, mine = heads[who]
        bubble(cv, ln, hx, hy, side, s, t, end_t, mine=mine, maxw=780, x_min=CX + 24, x_max=CX + CW - 24)
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else END - 0.4
        a = ease(prog(t, s + 0.25, s + 0.55)) * (1 - ease(prog(t, nxt - 0.2, nxt)))
        if ln["note"]:
            tip_card(cv, "TIP", ln["note"], CY + CH + 32, a)

def events():
    ev = [(BOWL_T, "clink"), (SUGAR_T, "clink"), (END + 0.15, "chime"), (33.2, "sparkle")]
    ev += [(s, "pop") for s, e, ln, w in L]
    return ev

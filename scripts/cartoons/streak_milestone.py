"""Congratulations reel for a streak milestone, in Baan's flat style. streak_30_reel.py is the first of this
family; this one is parametric so the 7- and 100-day cartoons share the picture. The count sits in the title row,
so speech bubbles can never cover it."""
import math, skia
from baan_toon import *

CX, CY, CW, CH = 40, 440, 1000, 1120
GY = 980
S = 6.4
HEAD_TOP = lambda feet, sc: feet - 60 * sc
PIM_X, YOU_X = 300, 720
BADGE_X, BADGE_Y, BADGE_R = 908, 302, 108
CONFETTI = [GOLD, CLAY, TEAL, LEAF, BLUE, BLUSH]


def trophy(cv, x, gy, t):
    k = back(prog(t, 0.7, 1.3))
    cv.save(); cv.translate(x, gy); cv.scale(k, k); cv.translate(-x, -gy)
    rrect(cv, x - 54, gy - 18, 108, 18, 6, TEAL)
    rrect(cv, x - 12, gy - 70, 24, 54, 6, GOLD)
    cup = skia.Path(); cup.moveTo(x - 56, gy - 200); cup.lineTo(x + 56, gy - 200); cup.lineTo(x + 40, gy - 112)
    cup.quadTo(x, gy - 70, x - 40, gy - 112); cup.close()
    for sgn in (-1, 1):
        h = skia.Path(); h.moveTo(x + sgn * 54, gy - 184); h.cubicTo(x + sgn * 100, gy - 186, x + sgn * 96, gy - 124, x + sgn * 38, gy - 120)
        cv.drawPath(h, stroke(GOLD, 11))
    cv.drawPath(cup, fill(GOLD))
    sparkle(cv, x, gy - 150, 26, CREAM)
    cv.restore()


class Reel:
    def __init__(self, name, th_title, en_title, badge, L, end, duration, extra=None):
        self.NAME, self.th_title, self.en_title, self.badge = name, th_title, en_title, badge
        self.L, self.END, self.DURATION, self.extra = L, end, duration, extra
        self.talking = self._talking

    def _talking(self, t, who):
        for s, e, ln, sp in self.L:
            if sp == who and s + 0.15 < t < min(e, s + 0.15 + 0.32 * len(ln["roman"].split()) + 0.4):
                return abs(math.sin((t - s) * 15))
        return 0.0

    def events(self):
        ev = [(0.4, "sparkle"), (1.0, "chime")]
        ev += [(s, "pop") for s, e, ln, w in self.L]
        ev += [(self.END + 0.1, "sparkle"), (self.END + 0.25, "chime")]
        return ev

    @staticmethod
    def blink(t, off):
        return ((t + off) % 3.3) < 0.13

    def draw_badge(self, cv):
        size = int(BADGE_R * (1.27 if len(self.badge) <= 2 else 0.95))
        circle(cv, BADGE_X, BADGE_Y, BADGE_R, TEAL)
        draw_text(cv, self.badge, BADGE_X, BADGE_Y - int(size * 0.44), "serif_b", size, ACCENT_INK, anchor="tc")

    def draw_scene(self, cv, t):
        cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM))
        cv.drawRect(skia.Rect.MakeXYWH(0, GY, CW, CH - GY), fill(SAND))
        circle(cv, 860, 140, 48, GOLD)
        tree(cv, 120, GY + 4, 4.6, math.sin(t * 1.2) * 0.7)
        if self.extra == "week":                      # seven dots fill in, one per day
            for i in range(7):
                k = back(prog(t, 0.5 + 0.16 * i, 0.9 + 0.16 * i))
                circle(cv, 230 + 90 * i, GY + 76, 20 * max(k, 0), TEAL)
        if self.extra == "trophy":                    # a gold cup and falling confetti
            trophy(cv, 510, GY, t)
            for i in range(16):
                x = (i * 137 + 60) % (CW - 80) + 40
                y = ((t * 150 + i * 173) % (CH - 200)) + 40
                cv.save(); cv.translate(x, y); cv.rotate((t * 90 + i * 40) % 360)
                rrect(cv, -9, -5, 18, 10, 3, CONFETTI[i % len(CONFETTI)], 0.9); cv.restore()
        wave = ease(prog(t, 0.6, 1.3)) * (0.7 + 0.3 * abs(math.sin(t * 6)))
        person(cv, PIM_X, GY, S, shirt=TEAL, bun=True, look=1, wave=wave, talk=self.talking(t, "pim"), blink=self.blink(t, 0.2), happy=True)
        person(cv, YOU_X, GY, S, shirt=CLAY, look=-1, talk=self.talking(t, "you"), blink=self.blink(t, 1.1), happy=True)

    def draw_end(self, cv, t):
        a = ease(prog(t, self.END, self.END + 0.45))
        cv.drawRect(skia.Rect.MakeWH(W, H), fill(PAPER, a))
        if a <= 0:
            return
        k = back(prog(t, self.END + 0.1, self.END + 0.55))
        cv.save(); cv.translate(W / 2, 700); cv.scale(k, k); house_logo(cv, -110, -110, 220); cv.restore()
        draw_text(cv, self.th_title, W / 2, 880, "serif_b", 96, INK, a, anchor="tc")
        draw_text(cv, self.en_title, W / 2, 1020, "serif", 64, INK, a, anchor="tc")
        for i, (sx, sy) in enumerate(((180, 520), (900, 500), (240, 860), (860, 900))):
            sparkle(cv, sx, sy, 22 + 8 * math.sin(t * 4 + i), GOLD, a * (0.6 + 0.4 * math.sin(t * 3 + i * 2)))

    def draw(self, cv, t):
        cv.clear(col(PAPER))
        top_bar(cv)
        if t >= self.END:
            self.draw_end(cv, t)
            return
        lesson_title(cv, self.th_title, self.en_title)
        cv.save(); cv.translate(CX, CY); card_clip(cv, 0, 0, CW, CH)
        self.draw_scene(cv, t)
        fade = max(1 - prog(t, 0, 0.3), prog(t, self.END - 0.25, self.END))
        if fade > 0:
            cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM, ease(clamp(fade))))
        cv.restore()
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(CX, CY, CW, CH), 56, 56), stroke(LINE, 3))
        pim_tip = (CX + PIM_X, CY + HEAD_TOP(GY, S) - 16)
        you_tip = (CX + YOU_X, CY + HEAD_TOP(GY, S) - 16)
        for i, (s, e, ln, who) in enumerate(self.L):
            nxt = self.L[i + 1][0] if i + 1 < len(self.L) else self.END - 0.15
            end_t = min(e, nxt - 0.12)
            if who == "you":
                bubble(cv, ln, you_tip[0], you_tip[1], "left", s, t, end_t, mine=True, x_min=CX + 30, x_max=CX + CW - 30)
            else:
                bubble(cv, ln, pim_tip[0], pim_tip[1], "right", s, t, end_t, mine=False, x_min=CX + 30, x_max=CX + CW - 30)
        self.draw_badge(cv)   # last, so nothing can hide the count

"""Scene reel: walking into a café and ordering an iced coffee, using Baan's own lines
(cafe/c1, cafe/c2, order/o1, order/o2, order/o6, order/o7 from src/data/scenes.ts, male speaker forms)."""
import math, skia
from baan_toon import *
from lesson_data import line

NAME = "cafe"
DURATION = 33.0
CX, CY, CW, CH = 40, 440, 1000, 1120      # scene card on screen
GY = 880                                    # ground line inside the card
S_YOU = 6.2
HEAD_TOP = lambda feet, sc: feet - 60 * sc
# --- dialogue: (start, end, line, speaker)
L = [(6.7, 9.0, line("cafe", "c1"), "nid"), (9.1, 11.4, line("cafe", "c2"), "you"),
     (11.6, 14.1, line("order", "o1"), "nid"), (14.2, 16.9, line("order", "o2"), "you"),
     (18.1, 20.6, line("order", "o6"), "nid"), (20.7, 23.3, line("order", "o7"), "you")]
CUP_T = 17.5           # iced coffee lands on the counter
TAKE_T = 21.2          # you pick it up
# shots
A0, A1 = 0.0, 6.3      # outside, walk in
B0, B1 = 6.3, 23.8     # inside
C0, C1 = 23.8, 28.6    # outside, walk out
END = 28.6
WALK_IN = (0.35, 3.5, -130, 805)
WALK_OUT = (26.0, 28.4, 805, 1180)
STRIDE = 70.0

def walk_x(t, w):
    t0, t1, x0, x1 = w; return lerp(x0, x1, prog(t, t0, t1))
def walk_phase(t, w):
    t0, t1, x0, x1 = w
    if t < t0 or t > t1: return None
    return (walk_x(t, w) - x0) / STRIDE * math.pi
def blink(t, off): return ((t + off) % 3.3) < 0.13
def talking(t, who):
    for s, e, ln, sp in L:
        if sp == who and s + 0.15 < t < min(e, s + 0.15 + 0.32 * len(ln["roman"].split()) + 0.4):
            return abs(math.sin((t - s) * 15))
    return 0.0

# ---------------- outside
def cafe_front(cv, t, door_open):
    circle(cv, 900, 150, 50, GOLD)
    tree(cv, 150, GY + 4, 5.2, math.sin(t * 1.3) * 0.8)
    # A-frame board with the café card's line-art mug and live steam
    cv.drawPath(poly([(262, 860), (250, GY + 6)], False), stroke(TEAL, 10)); cv.drawPath(poly([(428, 860), (440, GY + 6)], False), stroke(TEAL, 10))
    rrect(cv, 245, 650, 195, 215, 22, TEAL); rrect(cv, 259, 664, 167, 187, 14, CREAM)
    mug_lineart(cv, 278, 742, 2.75); steam(cv, 278 + 18 * 2.75, 742 - 32, 2.75, t)
    # building
    rrect(cv, 480, 320, 460, GY - 320 + 14, 22, TEAL)
    rrect(cv, 555, 345, 310, 80, 18, CREAM); draw_text(cv, "กาแฟ", 710, 345, "serif_b", 52, INK, anchor="tc")
    # awning (gold and cream scallops)
    cv.save(); cv.clipRect(skia.Rect.MakeLTRB(480, 0, 940, 2000))
    for i in range(8):
        x = 480 + i * 57.5; c = GOLD if i % 2 == 0 else CREAM
        cv.drawRect(skia.Rect.MakeXYWH(x, 448, 57.5, 38), fill(c)); circle(cv, x + 28.75, 486, 28.75, c)
    cv.restore()
    rrect(cv, 520, 560, 160, 210, 10, SKY)
    cv.drawRect(skia.Rect.MakeXYWH(597, 560, 6, 210), fill(TEAL)); cv.drawRect(skia.Rect.MakeXYWH(520, 662, 160, 6), fill(TEAL))
    mug_lineart(cv, 548, 708, 1.1)
    # door: warm gold inside, panel swings on its left hinge
    dx, dy, dw, dh = 720, 560, 170, GY - 560
    rrect(cv, dx, dy, dw, dh + 2, 10, GOLD)
    k = 1 - 0.78 * door_open
    rx = dx + dw * k; lift = 22 * door_open
    panel = poly([(dx, dy), (rx, dy - lift), (rx, dy + dh + lift * 0.5), (dx, dy + dh)])
    cv.drawPath(panel, fill(DOOR)); cv.drawPath(panel, stroke(TEAL, 3))
    if door_open < 0.6: circle(cv, dx + dw * k - 26 * k, dy + dh * 0.52, 9, GOLD)
    rrect(cv, 690, GY - 4, 230, 18, 6, SAND)
    cv.drawRect(skia.Rect.MakeXYWH(0, GY + 10, CW, CH - GY), fill(SAND))

def draw_outside(cv, t, leaving):
    cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM))
    cv.drawRect(skia.Rect.MakeXYWH(0, GY, CW, CH - GY), fill(SAND))
    if not leaving:
        door = ease(prog(t, 3.55, 4.15)) * (1 - ease(prog(t, 5.45, 5.95)))
        enter = ease(prog(t, 4.2, 5.35))
    else:
        door = ease(prog(t, 24.25, 24.75)) * (1 - ease(prog(t, 25.8, 26.3)))
        enter = 1 - ease(prog(t, 24.6, 25.7))
    cafe_front(cv, t, door)
    # hook pill in the sky
    if not leaving:
        a = ease(prog(t, 0.2, 0.6)) * (1 - ease(prog(t, 3.4, 3.8)))
        if a > 0:
            rrect(cv, 90, 60, 700, 120, 60, TEAL, a)
            draw_text(cv, "Order a coffee in Thai", 440, 88, "serif_b", 50, ACCENT_INK, a, anchor="tc")
    else:
        a = ease(prog(t, 26.3, 26.7))
        if a > 0:
            o2 = line("order", "o2")
            rrect(cv, 90, 50, 700, 300, 50, CARD, a, LINE, 3)
            draw_text(cv, "Now you try:", 440, 70, "sans_b", 40, MUTED, a, anchor="tc")
            draw_text(cv, o2["thai"], 440, 122, "serif_b", 64, INK, a, anchor="tc")
            draw_text(cv, o2["roman"], 440, 222, "sans", 40, MUTED, a, anchor="tc")
            draw_text(cv, o2["en"], 440, 278, "sans_b", 40, INK, a, anchor="tc")
    # the walker
    if not leaving:
        x = walk_x(t, WALK_IN); ph = walk_phase(t, WALK_IN); fy = lerp(990, 886, enter); s = lerp(S_YOU, 5.0, enter)
        alpha = 1 - prog(t, 4.75, 5.4); hold = None; happy = False; look = 1
        wave = 0.0
    else:
        moving = t >= WALK_OUT[0]
        x = walk_x(t, WALK_OUT) if moving else 805; ph = walk_phase(t, WALK_OUT)
        fy = lerp(990, 886, enter); s = lerp(S_YOU, 5.0, enter); alpha = prog(t, 24.55, 25.1)
        hop = abs(math.sin((t - 25.7) * 7)) * 22 if 25.7 < t < 26.1 else 0
        fy -= hop; hold = lambda c: iced_coffee(c, 0, 8, 0.4); happy = True; look = 1
        wave = 0.0
    if alpha > 0:
        cv.saveLayerAlpha(None, int(alpha * 255))
        if not leaving and enter > 0:      # stepping into the doorway: hide what the door frame would cover
            cv.clipRect(skia.Rect.MakeLTRB(0, 0, CW, CH)); cv.clipRect(skia.Rect.MakeLTRB(722, 0, 888, CH))
        person(cv, x, fy, s, TEAL, walk=ph, blink=blink(t, 0.4), look=look, hold=hold, happy=happy and not blink(t, 0.4), back=(not leaving and enter > 0.12))
        cv.restore()
    if leaving:
        for i in range(4):
            p = prog(t, 25.6 + i * 0.55, 26.9 + i * 0.55)
            if 0 < p < 1:
                heart(cv, x + 60 + 30 * math.sin(i * 2 + p * 6), 600 - p * 260, 20 + 6 * i % 2, CLAY if i % 2 == 0 else GOLD, math.sin(p * math.pi))

# ---------------- inside
def draw_inside(cv, t):
    cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM))
    cv.drawRect(skia.Rect.MakeXYWH(0, GY, CW, CH - GY), fill(SAND))
    for lx in (260, 640):
        cv.drawPath(poly([(lx, 0), (lx, 120)], False), stroke(INK, 3))
        p = skia.Path(); p.addArc(skia.Rect.MakeXYWH(lx - 46, 110, 92, 80), 180, 180); p.close(); cv.drawPath(p, fill(GOLD))
    rrect(cv, 100, 360, 330, 16, 6, SAND)
    for i, mx in enumerate((118, 218, 318)):
        mug_lineart(cv, mx, 318, 1.05)
    # plant
    rrect(cv, 70, 800, 90, 90, 14, CLAY); circle(cv, 115, 760, 60, LEAF); circle(cv, 75, 790, 34, LEAF); circle(cv, 158, 795, 30, LEAF)
    # barista Nid behind the counter
    nid_look = 1 if (17.0 < t < 17.5) else -1
    person(cv, 742, 822, S_YOU, CLAY, talk=talking(t, "nid"), blink=blink(t, 1.7), look=nid_look, bun=True, apron=GOLD,
           wave=ease(prog(t, 6.8, 7.1)) * (1 - ease(prog(t, 8.1, 8.4))), legs=False, happy=(t > 20.7 and not blink(t, 1.7)))
    # espresso machine with a steaming cup
    rrect(cv, 845, 520, 130, 185, 16, SKY, sc=TEAL, sw=6); rrect(cv, 870, 600, 80, 18, 6, TEAL)
    rrect(cv, 888, 650, 44, 48, 8, CREAM, sc=INK, sw=3); steam(cv, 910, 640, 1.8, t)
    # counter
    rrect(cv, 470, 700, 540, 34, 10, DOOR); cv.drawRect(skia.Rect.MakeXYWH(490, 734, 520, GY - 734 + 12), fill(TEAL))
    for i in range(4): cv.drawRect(skia.Rect.MakeXYWH(530 + i * 125, 760, 80, 100), fill(TEAL2))
    # iced coffee
    if CUP_T <= t < TAKE_T:
        k = back(prog(t, CUP_T, CUP_T + 0.3)); slide = 1 - ease(prog(t, CUP_T, CUP_T + 0.45))
        cv.save(); cv.translate(600 + 140 * slide, 702); cv.scale(k, k); iced_coffee(cv, 0, 0, 3.4); cv.restore()
    # you
    take = ease(prog(t, TAKE_T, TAKE_T + 0.4))
    hold = (lambda c: iced_coffee(c, 0, 8, 0.4)) if t >= TAKE_T + 0.1 else None
    walk_in = prog(t, B0, B0 + 0.5); ph = (walk_in * 2.5 * math.pi) if walk_in < 1 else None
    x = lerp(170, 300, ease(walk_in)) + 60 * take * 0
    yhappy = t > TAKE_T + 0.2
    person(cv, x, 990, S_YOU, TEAL, walk=ph, talk=talking(t, "you"), blink=blink(t, 0.4), look=1, hold=hold,
           wave=ease(prog(t, 9.2, 9.5)) * (1 - ease(prog(t, 10.6, 10.9))), happy=yhappy and not blink(t, 0.4))
    if TAKE_T < t < TAKE_T + 0.12:
        pass
    for i in range(3):
        p = prog(t, 21.6 + i * 0.4, 23.0 + i * 0.4)
        if 0 < p < 1: heart(cv, x + 90 + i * 25, 640 - p * 200, 18, CLAY, math.sin(p * math.pi))

def draw(cv, t):
    cv.clear(col(PAPER))
    counter, th, en = ("01 / 29", "ที่ร้านกาแฟ", "The café door")
    ka = ease(prog(t, 11.3, 11.7))
    top_bar(cv)
    if t >= END:
        end_card(cv, t, END); return
    lesson_title(cv, "ที่ร้านกาแฟ", "The café door", 1 - ka)
    if ka > 0: lesson_title(cv, "สั่งกาแฟ", "Ordering", ka)
    draw_text(cv, "01 / 29" if ka < 0.5 else "02 / 29", 1016, 70, "sans", 38, MUTED, anchor="tr")
    # scene card
    cv.save(); cv.translate(CX, CY); card_clip(cv, 0, 0, CW, CH)
    if t < B0: draw_outside(cv, t, False)
    elif t < C0: draw_inside(cv, t)
    else: draw_outside(cv, t, True)
    # fades between shots
    f = max(prog(t, A1 - 0.35, A1) if t < A1 else 1 - prog(t, A1, A1 + 0.35),
            prog(t, B1 - 0.35, B1) if t < B1 else 1 - prog(t, B1, B1 + 0.35), 1 - prog(t, 0, 0.3), prog(t, END - 0.3, END))
    if f > 0: cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM, ease(clamp(f))))
    cv.restore()
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(CX, CY, CW, CH), 56, 56), stroke(LINE, 3))
    # speech bubbles (screen coords) — tails point at the speaker's head
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else B1 - 0.4
        end_t = min(e, nxt - 0.12)
        if who == "nid": bubble(cv, ln, CX + 712, CY + HEAD_TOP(822, S_YOU) - 16, "left", s, t, end_t, mine=False, x_min=CX + 30, x_max=CX + CW - 30)
        else: bubble(cv, ln, CX + 330, CY + HEAD_TOP(990, S_YOU) - 16, "right", s, t, end_t, mine=True, x_min=CX + 30, x_max=CX + 652)
    if t >= C0:
        f2 = line("order", "o2", "female"); a = ease(prog(t, 26.5, 26.9)) * (1 - ease(prog(t, END - 0.3, END)))
        tip_card(cv, "TIP", f"Women end with ค่ะ:\n{f2['thai']}  ·  {f2['roman']}", CY + CH + 32, a)
    # tip card: the lesson's own note for the current line
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else B1 - 0.4
        a = ease(prog(t, s + 0.25, s + 0.55)) * (1 - ease(prog(t, nxt - 0.2, nxt)))
        if ln["note"]: tip_card(cv, "TIP", ln["note"], CY + CH + 32, a)

def events():
    """(time, sound) cues for the audio track."""
    ev = []
    for w in (WALK_IN, WALK_OUT):
        t0, t1, x0, x1 = w; n = int((x1 - x0) / STRIDE)
        for k in range(1, n + 1): ev.append((t0 + (t1 - t0) * k * STRIDE / (x1 - x0), "step"))
    ev += [(3.6, "bell"), (5.6, "door"), (24.3, "bell"), (26.0, "door")]
    ev += [(s, "pop") for s, e, ln, w in L]
    ev += [(CUP_T, "clink"), (TAKE_T + 0.1, "sparkle"), (25.8, "sparkle"), (END + 0.15, "chime")]
    return ev

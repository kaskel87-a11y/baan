"""Scene reel: taking a taxi to Siam, using Baan's own lines from the taxi scene
(tx1, tx2, tx3, tx4, tx8, tx9, tx10 in src/data/scenes.ts). The rider is a woman (ค่ะ forms, female voice),
the driver is a man (ครับ, male voice)."""
import math, skia
from baan_toon import *
from lesson_data import line

NAME = "taxi"
DURATION = 40.0
CX, CY, CW, CH = 40, 440, 1000, 1120
GY = 880
S = 5.0
VOICES = {"you": "female", "mek": "male"}
L = [(5.6, 8.6, line("taxi", "tx1", "female"), "you"), (8.7, 11.7, line("taxi", "tx2"), "mek"),
     (11.9, 14.9, line("taxi", "tx3", "female"), "you"), (15.0, 18.0, line("taxi", "tx4"), "mek"),
     (22.5, 25.5, line("taxi", "tx8"), "mek"), (25.7, 28.7, line("taxi", "tx9", "female"), "you"),
     (28.9, 31.9, line("taxi", "tx10"), "mek")]
OX = 60                    # car offset when parked
ARRIVE = (0.3, 2.6)        # taxi rolls in
BOARD = (3.0, 4.6)         # rider walks to the car
GO0, GO1 = 5.0, 5.6        # car starts
STOP0, STOP1 = 21.0, 22.4  # car brakes at Siam
EXIT_T = 29.4              # rider gets out
LEAVE = (31.6, 33.6)       # car drives off
END = 34.6
METER = (11.9 + 0.6, 22.2, 35, 180)   # meter turned on after tx3, fare at arrival

def blink(t, off): return ((t + off) % 3.3) < 0.13
def talking(t, who):
    for s, e, ln, sp in L:
        if sp == who and s + 0.15 < t < min(e, s + 0.15 + 0.32 * len(ln["roman"].split()) + 0.4):
            return abs(math.sin((t - s) * 15))
    return 0.0

def speed(t):
    """0..1 how fast the world scrolls."""
    up = ease(prog(t, GO0, GO1 + 1.2)); down = 1 - ease(prog(t, STOP0, STOP1))
    return min(up, down) if t < 29 else 0.0
_dist = [0.0, 0.0]
def scroll(t):
    # integrate speed numerically (cheap: 0.05 s steps) so frames are deterministic
    d = 0.0; k = 0.0
    while k < t:
        h = min(0.05, t - k); d += speed(k + h / 2) * h; k += h
    return d * 700

def car_x(t):
    if t < ARRIVE[1]: return lerp(-900, OX, ease_out(prog(t, *ARRIVE)))
    if t < LEAVE[0]: return OX
    return lerp(OX, 1250, ease(prog(t, *LEAVE)))

def wheel(cv, x, y, r, ang):
    circle(cv, x, y, r, INK); circle(cv, x, y, r * 0.5, SAND)
    for i in range(4):
        a = ang + i * math.pi / 2
        cv.drawPath(poly([(x, y), (x + math.cos(a) * r * 0.5, y + math.sin(a) * r * 0.5)], False), stroke(INK, 5))
    circle(cv, x, y, r * 0.14, INK)

def taxi(cv, t, ox, riders):
    bob = math.sin(t * 22) * 2.0 * speed(t)
    cv.save(); cv.translate(ox, bob + 120)
    # people sit inside (drawn first, body covers the lower half)
    if riders:
        person(cv, 640, 700, S, CLAY, talk=talking(t, "mek"), blink=blink(t, 1.2), look=1, legs=False, happy=(t > 30.6 and not blink(t, 1.2)))
        if t < EXIT_T + 0.15:
            person(cv, 330, 700, S, TEAL, talk=talking(t, "you"), blink=blink(t, 0.4), look=1, legs=False, bun=True,
                   happy=(t > 28.2 and not blink(t, 0.4)), wave=ease(prog(t, 5.9, 6.2)) * (1 - ease(prog(t, 7.1, 7.4))) * 0)
    # greenhouse
    cab = poly([(215, 600), (265, 395), (700, 395), (790, 600)])
    # window glass is the see-through part: redraw frame around a cutout
    glass = poly([(235, 596), (278, 412), (690, 412), (768, 596)])
    frame = skia.Op(cab, glass, skia.PathOp.kDifference_PathOp)
    cv.drawPath(frame, fill("#f0c56e"))
    # glass glare + pillar
    cv.drawPath(poly([(480, 412), (500, 412), (500, 596), (480, 596)]), fill("#f0c56e"))
    # roof sign
    rrect(cv, 420, 330, 150, 68, 12, TEAL); draw_text(cv, "แท็กซี่", 495, 338, "serif_b", 36, ACCENT_INK, anchor="tc")
    # body
    rrect(cv, 140, 596, 780, 205, 40, GOLD)
    rrect(cv, 140, 700, 780, 22, 0, "#f0c56e")
    rrect(cv, 140, 596, 780, 22, 10, "#f0c56e")
    cv.drawPath(poly([(480, 618), (480, 740)], False), stroke(TEAL2, 5))      # door seam
    rrect(cv, 440, 650, 34, 12, 6, TEAL)                                        # handle
    rrect(cv, 892, 640, 44, 60, 14, CREAM)                                      # headlight
    rrect(cv, 126, 650, 22, 52, 8, CLAY)                                        # tail light
    # checker stripe
    for i in range(18):
        rrect(cv, 160 + i * 38, 756, 19, 19, 0, INK if i % 2 == 0 else CREAM)
        rrect(cv, 179 + i * 38, 775, 19, 19, 0, INK if i % 2 == 1 else CREAM) if i < 17 else None
    ang = scroll(t) / 70.0 * 1.0
    for wx in (270, 760):
        circle(cv, wx, 800, 92, GOLD)      # arch
        wheel(cv, wx, 806, 74, ang)
    # meter on the dash
    if t >= METER[0]:
        m0, m1, f0, f1 = METER
        fare = int(round(lerp(f0, f1, ease(prog(t, m0 + 0.8, m1)))))
        a = ease(prog(t, m0, m0 + 0.25))
        rrect(cv, 720, 548, 170, 78, 14, INK, a)
        draw_text(cv, f"฿ {fare}", 805, 556, "sans_b", 54, GOLD, a, anchor="tc")
    cv.restore()

def sky_and_street(cv, t):
    d = scroll(t)
    cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM))
    circle(cv, 860, 150, 55, GOLD)
    # far buildings (slow parallax), repeat every 1600 px
    def tile(period, par, fn):
        off = (d * par) % period
        for k in (-1, 0, 1, 2): fn(k * period - off)
    def bld(x):
        for (bx, bw, bh, c) in ((0, 150, 330, SKY), (190, 120, 240, "#c9e1db"), (360, 170, 400, SKY), (570, 130, 280, "#c9e1db"), (740, 160, 360, SKY), (940, 120, 260, "#c9e1db"), (1090, 150, 300, SKY), (1280, 140, 380, "#c9e1db")):
            rrect(cv, x + bx, GY - bh, bw, bh + 10, 10, c)
            for wy in range(int(GY - bh + 30), int(GY - 40), 60):
                for wx in range(int(x + bx + 20), int(x + bx + bw - 30), 44): rrect(cv, wx, wy, 22, 28, 5, TEAL, 0.25)
    tile(1500, 0.18, bld)
    def trees(x):
        for tx in (100, 520, 900, 1260): tree(cv, x + tx, GY + 6, 4.6, math.sin(t * 1.3 + tx) * 0.8)
    tile(1500, 0.5, trees)
    # Siam sign when we arrive (static, scrolls in with the brakes)
    sx = lerp(1500, 600, ease(prog(t, 17.8, STOP1 - 0.2))) if t < LEAVE[0] + 2 else 600
    if t >= 17.8 and t < END:
        rrect(cv, sx, 80, 330, 170, 22, TEAL); rrect(cv, sx + 14, 94, 302, 142, 14, CREAM)
        draw_text(cv, "สยาม", sx + 165, 96, "serif_b", 78, INK, anchor="tc")
        draw_text(cv, "Siam", sx + 165, 188, "sans_b", 34, MUTED, anchor="tc")
        cv.drawPath(poly([(sx + 60, 250), (sx + 60, GY)], False), stroke(TEAL, 12)); cv.drawPath(poly([(sx + 270, 250), (sx + 270, GY)], False), stroke(TEAL, 12))
    # road
    cv.drawRect(skia.Rect.MakeXYWH(0, GY, CW, CH - GY), fill(SAND))
    cv.drawRect(skia.Rect.MakeXYWH(0, GY + 150, CW, 150), fill("#d9c9ae"))
    off = d % 240
    for k in range(-1, 6): rrect(cv, k * 240 - off, GY + 215, 130, 16, 8, CREAM)

def draw_scene(cv, t):
    sky_and_street(cv, t)
    ox = car_x(t)
    riders = t >= BOARD[1] - 0.4 and t < LEAVE[1] + 1
    # opening hook
    a = ease(prog(t, 0.2, 0.6)) * (1 - ease(prog(t, 2.9, 3.3)))
    taxi(cv, t, ox, riders)
    # waiting rider at the curb
    if t < BOARD[1]:
        w = prog(t, *BOARD); x = lerp(120, 360, ease(w)); ph = (w * 3.2 * math.pi) if 0 < w < 1 else None
        alpha = 1 - prog(t, BOARD[1] - 0.45, BOARD[1] - 0.05)
        wave = ease(prog(t, 2.6, 2.9)) * (1 - ease(prog(t, 2.95, 3.0))) if t < BOARD[0] else 0
        if alpha > 0:
            cv.saveLayerAlpha(None, int(alpha * 255))
            person(cv, x, 990, 6.0, TEAL, walk=ph, blink=blink(t, 0.4), look=1, bun=True, wave=wave if t < BOARD[0] else 0)
            cv.restore()
    elif t >= EXIT_T + 0.15 and t < LEAVE[1] + 0.5:
        p = prog(t, EXIT_T + 0.15, EXIT_T + 0.6)
        hop = abs(math.sin((t - 30.0) * 7)) * 22 if 30.0 < t < 30.4 else 0
        cv.saveLayerAlpha(None, int(p * 255))
        person(cv, 120, 990 - hop, 6.0, TEAL, blink=blink(t, 0.4), look=1, bun=True, happy=not blink(t, 0.4), wave=0.0 if t < 31 else ease(prog(t, 31.0, 31.3)) * 0.55 * (0.7 + 0.3 * math.sin(t * 10)))
        cv.restore()
    if a > 0:
        rrect(cv, 90, 60, 760, 120, 60, TEAL, a)
        draw_text(cv, "Take a taxi in Thai", 470, 88, "serif_b", 50, ACCENT_INK, a, anchor="tc")
    if EXIT_T < t < EXIT_T + 3:
        for i in range(3):
            p = prog(t, EXIT_T + 0.8 + i * 0.4, EXIT_T + 2.2 + i * 0.4)
            if 0 < p < 1: heart(cv, 180 + i * 30, 640 - p * 250, 18, CLAY, math.sin(p * math.pi))

def draw(cv, t):
    cv.clear(col(PAPER))
    top_bar(cv)
    if t >= END:
        end_card(cv, t, END); return
    lesson_title(cv, "แท็กซี่", "Taxi")
    draw_text(cv, "25 / 36", 1016, 70, "sans", 38, MUTED, anchor="tr")
    cv.save(); cv.translate(CX, CY); card_clip(cv, 0, 0, CW, CH)
    draw_scene(cv, t)
    f = max(1 - prog(t, 0, 0.3), prog(t, END - 0.3, END))
    if f > 0: cv.drawRect(skia.Rect.MakeWH(CW, CH), fill(CREAM, ease(clamp(f))))
    cv.restore()
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(CX, CY, CW, CH), 56, 56), stroke(LINE, 3))
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else END - 0.4
        end_t = min(e, nxt - 0.12)
        if who == "mek": bubble(cv, ln, CX + 640 + OX, CY + 820 - 60 * S - 16, "left", s, t, end_t, mine=False, maxw=880, x_min=CX + 30, x_max=CX + CW - 30)
        else: bubble(cv, ln, CX + 330 + OX, CY + 820 - 60 * S - 16, "right", s, t, end_t, mine=True, maxw=880, x_min=CX + 30, x_max=CX + 900)
    for i, (s, e, ln, who) in enumerate(L):
        nxt = L[i + 1][0] if i + 1 < len(L) else END - 0.4
        a = ease(prog(t, s + 0.25, s + 0.55)) * (1 - ease(prog(t, nxt - 0.2, nxt)))
        if ln["note"]: tip_card(cv, "TIP", ln["note"], CY + CH + 32, a)

def events():
    ev = [(0.5, "whoosh"), (ARRIVE[1] - 0.2, "honk"), (BOARD[1] - 0.2, "door"), (GO0, "honk"), (METER[0], "beep"), (METER[1], "beep"),
          (STOP1, "door"), (EXIT_T + 0.15, "door"), (EXIT_T + 0.5, "sparkle"), (LEAVE[0] + 0.1, "honk"), (LEAVE[0] + 0.3, "whoosh"), (END + 0.15, "chime")]
    ev += [(s, "pop") for s, e, ln, w in L]
    return ev

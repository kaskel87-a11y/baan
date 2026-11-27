"""Baan cartoon kit: palette, fonts, text, characters, props, bubbles and cards, drawn with skia
in the same flat vocabulary as baan-repo/src/components/SceneArt.tsx (rounded rects, circles, no gradients).
Every scene reel (café, taxi, market...) imports this and only writes its own timeline."""
import math, functools
import numpy as np, skia
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
# ---- palette: SceneArt.tsx constants + index.css tokens
INK = "#1c1917"; TEAL = "#1f6f64"; CREAM = "#f7f1e6"; SAND = "#eadcc8"; CLAY = "#d4785a"; GOLD = "#e2b15a"
SKY = "#d7ebe6"; LEAF = "#6f9a72"; BLUE = "#6f93b8"; BLUSH = "#f3c7a6"; HAIR = "#3a2a22"; DOOR = "#f3e2c4"
COFFEE = "#c98a55"; TEAL2 = "#2f8f82"
PAPER = "#f3f0ea"; CARD = "#faf8f5"; MUTED = "#78716c"; LINE = "#e4dfd6"; ACCENT_INK = "#f7f6f3"

def col(h, a=1.0):
    h = h.lstrip("#"); r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return skia.Color(r, g, b, int(max(0, min(1, a)) * 255))
def rgba(h, a=1.0):
    h = h.lstrip("#"); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), int(a * 255))

def fill(c, a=1.0): return skia.Paint(Color=col(c, a), AntiAlias=True)
def stroke(c, w, a=1.0, cap=skia.Paint.kRound_Cap):
    return skia.Paint(Color=col(c, a), AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=w, StrokeCap=cap, StrokeJoin=skia.Paint.kRound_Join)

def rrect(cv, x, y, w, h, r, color, a=1.0, sc=None, sw=0):
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r)
    cv.drawRRect(rr, fill(color, a))
    if sc: cv.drawRRect(rr, stroke(sc, sw, a))
def circle(cv, x, y, r, color, a=1.0): cv.drawCircle(x, y, r, fill(color, a))
def poly(pts, close=True):
    p = skia.Path(); p.moveTo(*pts[0])
    for q in pts[1:]: p.lineTo(*q)
    if close: p.close()
    return p

# ---- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, t0, t1): return clamp((t - t0) / (t1 - t0)) if t1 > t0 else float(t >= t0)
def ease(x): return x * x * (3 - 2 * x)
def ease_out(x): return 1 - (1 - x) ** 3
def back(x, s=1.9):
    x -= 1; return 1 + x * x * ((s + 1) * x + s)
def lerp(a, b, x): return a + (b - a) * x

# ---- fonts (the app uses Noto Serif Thai for display/Thai and Noto Sans Thai for UI; Latin falls back to Noto Serif / Noto Sans)
FD = "/usr/share/sand-box-stock-fonts/truetype/noto/"
FONTS = dict(serif=("NotoSerif-Regular.ttf", "NotoSerifThai-Regular.ttf"), serif_b=("NotoSerif-Bold.ttf", "NotoSerifThai-Bold.ttf"),
             sans=("NotoSans-Regular.ttf", "NotoSansThai-Regular.ttf"), sans_b=("NotoSans-Bold.ttf", "NotoSansThai-Bold.ttf"))
@functools.lru_cache(None)
def font(path, size): return ImageFont.truetype(FD + path, size, layout_engine=ImageFont.Layout.RAQM)
def is_thai(ch): return "\u0e00" <= ch <= "\u0e7f"
def runs(text):
    out = []
    for ch in text:
        th = is_thai(ch) or (ch == " " and out and out[-1][0] and False)
        if out and out[-1][0] == th: out[-1][1] += ch
        else: out.append([th, ch])
    return out
def thai_size(text, size):
    """Thai glyphs sit smaller than Latin at the same point size; nudge Thai up inside mixed lines."""
    mixed = any(c.isascii() and c.isalpha() for c in text) and any(is_thai(c) for c in text)
    return int(round(size * 1.12)) if mixed else size
def text_width(text, style, size):
    lat, tha = FONTS[style]; ts = thai_size(text, size)
    return sum(font(tha, ts).getlength(s, language="th") if th else font(lat, size).getlength(s, language="en") for th, s in runs(text))
def wrap(text, style, size, maxw):
    words, lines, cur = text.split(" "), [], ""
    for w_ in words:
        trial = (cur + " " + w_).strip()
        if cur and text_width(trial, style, size) > maxw: lines.append(cur); cur = w_
        else: cur = trial
    if cur: lines.append(cur)
    return lines
@functools.lru_cache(None)
def text_image(text, style, size, color, maxw=None, lh=1.45, align="left"):
    """Render (possibly multi-line, mixed Thai/Latin) text to a skia Image. Returns (img, w, h)."""
    lat, tha = FONTS[style]
    lines = [l for para in text.split("\n") for l in (wrap(para, style, size, maxw) if maxw else [para])]
    lh_px = int(size * lh); pad = int(size * 0.5)
    widths = [text_width(l, style, size) for l in lines]
    w = int(math.ceil(max(widths))) + 4; h = lh_px * len(lines) + pad
    im = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        x = pad + (0 if align == "left" else (w - widths[i]) / 2); base = pad + int(lh_px * (i + 0.5) + size * 0.36)
        ts = thai_size(l, size)
        for th, s in runs(l):
            f = font(tha, ts) if th else font(lat, size)
            d.text((x, base), s, font=f, fill=rgba(color), anchor="ls", language="th" if th else "en")
            x += f.getlength(s, language="th" if th else "en")
    arr = np.asarray(im).copy()
    return skia.Image.fromarray(arr, colorType=skia.kRGBA_8888_ColorType), w, lh_px * len(lines), pad
def draw_text(cv, text, x, y, style, size, color, a=1.0, maxw=None, lh=1.45, anchor="tl", align="left"):
    """Draw text with its top-left (anchor tl), top-centre (tc) or top-right (tr) at x,y. Returns block height."""
    img, w, h, pad = text_image(text, style, size, color, maxw, lh, align)
    if anchor == "tc": x -= w / 2
    elif anchor == "tr": x -= w
    p = skia.Paint(AntiAlias=True); p.setAlphaf(clamp(a))
    cv.drawImage(img, x - pad, y - pad, skia.SamplingOptions(skia.FilterMode.kLinear), p)
    return h, w

# ---- characters (Face from SceneArt.tsx, given legs and arms)
def person(cv, x, feet_y, s, shirt=TEAL, walk=None, talk=0.0, blink=False, look=1, wave=0.0, hold=None, bun=False, apron=None,
           happy=False, legs=True, back=False):
    """x, feet_y: screen position of the feet. s: pixels per SceneArt unit. walk: phase (radians) or None.
    talk: 0..1 mouth open. look: -1 left / 1 right. wave: 0..1 raises the front arm. hold: callable(cv) drawn in the front hand."""
    cv.save()
    bob = -abs(math.sin(walk)) * 2.2 if walk is not None else 0.0
    cv.translate(x, feet_y + bob * s); cv.scale(s, s); cv.translate(0, -47)
    sw = math.sin(walk) if walk is not None else 0.0
    if legs:
        for i, (lx, ph) in enumerate(((-6.5, 1), (2.5, -1))):
            cv.save(); cv.translate(lx + 2, 36); cv.rotate(ph * sw * 24)
            rrect(cv, -3.4, -2, 6.8, 13, 3.4, HAIR); rrect(cv, -4.2 + (1.4 if look > 0 else -1.4), 8.6, 8.4, 3.6, 1.8, INK)
            cv.restore()
    # back arm
    cv.save(); cv.translate(-11 * look, 21); cv.rotate(-sw * 22 * look)
    cv.drawPath(poly([(0, 0), (-2.2 * look, 12)], close=False), stroke(BLUSH, 5.2)); cv.restore()
    rrect(cv, -13, 16, 26, 22, 7, shirt)
    if apron: rrect(cv, -9, 22, 18, 16, 4, apron); cv.drawPath(poly([(-6, 22), (-4, 16)], False), stroke(apron, 1.6)); cv.drawPath(poly([(6, 22), (4, 16)], False), stroke(apron, 1.6))
    # head
    circle(cv, 0, 0, 13, BLUSH)
    if back:                       # seen from behind: all hair, no face
        circle(cv, 0, -0.5, 13.3, HAIR); cv.restore(); return
    if bun: circle(cv, 0, -14.5, 5.2, HAIR)
    hp = skia.Path(); hp.moveTo(-12, -1); hp.quadTo(0, -16, 12, -1); hp.lineTo(12, 2); hp.quadTo(0, -8, -12, 2); hp.close()
    cv.drawPath(hp, fill(HAIR))
    ex = 1.3 * look
    circle(cv, -6.8 + ex, 5.2, 2.0, CLAY, 0.35); circle(cv, 6.8 + ex, 5.2, 2.0, CLAY, 0.35)
    if blink or happy:
        for cx in (-4.5 + ex, 4.5 + ex):
            ap = skia.Path(); ap.moveTo(cx - 1.8, 1.4); ap.quadTo(cx, -0.6 if happy else 1.6, cx + 1.8, 1.4); cv.drawPath(ap, stroke(INK, 1.1))
    else:
        circle(cv, -4.5 + ex, 1, 1.4, INK); circle(cv, 4.5 + ex, 1, 1.4, INK)
    if talk > 0.15:
        cv.drawOval(skia.Rect.MakeXYWH(-2.4 + ex, 5.4, 4.8, 1.6 + 2.6 * talk), fill(INK))
    else:
        mp = skia.Path(); mp.moveTo(-4 + ex, 6.5); mp.quadTo(ex, 10 if happy else 9.5, 4 + ex, 6.5); cv.drawPath(mp, stroke(INK, 1.2))
    # front arm (waves, swings or holds)
    cv.save(); cv.translate(11 * look, 21)
    if hold is not None:
        cv.rotate(-70 * look); cv.drawPath(poly([(0, 0), (0, 11)], False), stroke(BLUSH, 5.2)); cv.translate(0, 13); cv.rotate(70 * look); hold(cv)
    else:
        ang = sw * 22 * look - wave * (150 + 18 * math.sin(wave * 0 + 0)) * look
        cv.rotate(ang); cv.drawPath(poly([(0, 0), (2.2 * look, 12)], close=False), stroke(BLUSH, 5.2))
    cv.restore()
    cv.restore()

# ---- props (SceneArt vocabulary)
def mug_lineart(cv, x, y, s, steam_t=None):
    """The café card's coffee mug: cream body, ink outline, sand froth. x,y = top-left of body, s = px per unit."""
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(0, 0, 36, 28), 4, 4)
    cv.drawRRect(rr, fill(CREAM)); cv.drawRRect(rr, stroke(INK, 2))
    hp = skia.Path(); hp.moveTo(36, 8); hp.lineTo(46, 8); hp.arcTo(8, 7, 0, skia.Path.ArcSize.kSmall_ArcSize, skia.PathDirection.kCW, 46, 22); hp.lineTo(36, 22)
    cv.drawPath(hp, stroke(INK, 2))
    cv.drawOval(skia.Rect.MakeXYWH(2, -10, 32, 12), fill(SAND))
    if steam_t is not None: steam(cv, 18, -12, 1.0, steam_t)
    cv.restore()
def steam(cv, x, y, s, t, n=3, color=MUTED):
    for i in range(n):
        ph = (t * 0.55 + i / n) % 1.0
        a = math.sin(ph * math.pi) * 0.75
        ox = x + (i - (n - 1) / 2) * 9 * s; oy = y - ph * 26 * s
        p = skia.Path(); p.moveTo(ox, oy)
        for k in range(1, 5):
            p.lineTo(ox + math.sin(k * 1.4 + t * 3 + i) * 2.6 * s, oy - k * 4.2 * s)
        cv.drawPath(p, stroke(color, 2.2 * s, a))
def tree(cv, x, ground_y, s, sway=0.0):
    rrect(cv, x - 4 * s, ground_y - 40 * s, 8 * s, 40 * s, 1.5 * s, LEAF)
    circle(cv, x + sway * s, ground_y - 44 * s, 12 * s, LEAF)
def iced_coffee(cv, x, y, s, fill_level=1.0):
    """The Ordering card's iced coffee (sky glass, teal outline, coffee, teal straw). x = centre, y = bottom."""
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    rrect(cv, 2, -46, 4, 22, 1.5, TEAL)                     # straw
    cup = poly([(-11, -30), (11, -30), (8.5, 0), (-8.5, 0)])
    cv.drawPath(cup, fill(SKY)); cv.save(); cv.clipPath(cup, doAntiAlias=True)
    cv.drawRect(skia.Rect.MakeLTRB(-12, -30 + 22 * (1 - fill_level) + 6, 12, 1), fill(COFFEE))
    rrect(cv, -7, -24, 6, 6, 1.5, CREAM, 0.85); rrect(cv, 1, -21, 6, 6, 1.5, CREAM, 0.85)
    cv.restore(); cv.drawPath(cup, stroke(TEAL, 1.6))
    rrect(cv, -12.5, -32, 25, 3.2, 1.6, TEAL)
    cv.restore()
def heart(cv, x, y, r, color=CLAY, a=1.0):
    p = skia.Path(); p.moveTo(x, y + r * 0.9)
    p.cubicTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.45)
    p.cubicTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); cv.drawPath(p, fill(color, a))
def sparkle(cv, x, y, r, color=GOLD, a=1.0):
    p = poly([(x, y - r), (x + r * 0.28, y - r * 0.28), (x + r, y), (x + r * 0.28, y + r * 0.28), (x, y + r), (x - r * 0.28, y + r * 0.28), (x - r, y), (x - r * 0.28, y - r * 0.28)])
    cv.drawPath(p, fill(color, a))
def house_logo(cv, x, y, size):
    """public/favicon.svg: ink rounded square with the teal house."""
    k = size / 32; cv.save(); cv.translate(x, y); cv.scale(k, k)
    rrect(cv, 0, 0, 32, 32, 7, INK)
    cv.drawPath(poly([(16, 6.8), (6.2, 15.4), (9.4, 15.4), (9.4, 25.6), (22.6, 25.6), (22.6, 15.4), (25.8, 15.4)]), fill(TEAL))
    cv.restore()

# ---- speech bubble: Thai (Noto Serif Thai bold) + romanization + English
def bubble(cv, line, tip_x, tip_y, side, t_in, t, t_out=None, mine=False, maxw=820, x_min=70, x_max=1010):
    """Pop-in bubble whose tail points at (tip_x, tip_y). side: 'left' puts the box left of the tip."""
    a_in = prog(t, t_in, t_in + 0.32)
    if a_in <= 0: return
    a_out = 1 - prog(t, t_out, t_out + 0.18) if t_out is not None else 1.0
    if a_out <= 0: return
    sc = back(a_in) * (0.85 + 0.15 * a_out)
    bg, fg, sub, edge = (TEAL, ACCENT_INK, "#bfe0d8", None) if mine else (CARD, INK, MUTED, LINE)
    th_img = text_image(line["thai"], "serif_b", 74, fg, maxw, 1.6)
    ro_img = text_image(line["roman"], "sans", 42, sub, maxw, 1.35)
    en_img = text_image(line["en"], "sans_b", 44, fg, maxw, 1.35)
    pad_x, pad_y = 48, 30
    bw = max(th_img[1], ro_img[1], en_img[1]) + 2 * pad_x; bh = th_img[2] + ro_img[2] + en_img[2] + 2 * pad_y + 8
    gap = 46
    bx = tip_x - bw + 120 if side == "left" else tip_x - 120
    bx = max(x_min, min(x_max - bw, bx)); by = tip_y - gap - bh
    cv.save(); cv.translate(tip_x, tip_y); cv.scale(sc, sc); cv.translate(-tip_x, -tip_y)
    body = skia.Path(); body.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(bx, by, bw, bh), 44, 44))
    tx = clamp(tip_x, bx + 60, bx + bw - 60); base_x = clamp(tx + (-40 if side == "right" else 40) * 0, bx + 50, bx + bw - 50)
    tail = poly([(base_x - 26, by + bh - 2), (base_x + 26, by + bh - 2), (tip_x, tip_y)])
    shape = skia.Op(body, tail, skia.PathOp.kUnion_PathOp)
    a = a_out
    cv.drawPath(shape, fill(bg, a))
    if edge: cv.drawPath(shape, stroke(edge, 3, a))
    y = by + pad_y
    for img, extra in ((th_img, 0), (ro_img, 2), (en_img, 6)):
        im, w, h, pad = img; p = skia.Paint(AntiAlias=True); p.setAlphaf(a)
        cv.drawImage(im, bx + pad_x - pad, y + extra - pad, skia.SamplingOptions(skia.FilterMode.kLinear), p); y += h + extra
    cv.restore()

# ---- frame chrome (top bar + lesson title, like the Path lesson card)
def top_bar(cv, counter=None, a=1.0):
    draw_text(cv, "บ้าน", 64, 52, "serif_b", 64, INK, a)
    draw_text(cv, "Baan", 64 + text_width("บ้าน", "serif_b", 64) + 18, 74, "sans_b", 38, MUTED, a)
    if counter: draw_text(cv, counter, 1016, 70, "sans", 38, MUTED, a, anchor="tr")
    cv.drawRect(skia.Rect.MakeXYWH(0, 176, W, 2), fill(LINE, a))
def lesson_title(cv, th, en, a=1.0, y=214):
    draw_text(cv, th, 64, y, "serif_b", 78, INK, a)
    draw_text(cv, en, 64, y + 116, "serif", 60, INK, a)
def card_clip(cv, x, y, w, h, r=56):
    cv.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r), doAntiAlias=True)
def tip_card(cv, label, text, y, a=1.0):
    if a <= 0 or not text: return
    img = text_image(text, "sans", 38, INK, 860, 1.45)
    h = img[2] + 110
    rrect(cv, 64, y, W - 128, h, 40, CARD, a, LINE, 3)
    draw_text(cv, label, 110, y + 30, "sans_b", 28, MUTED, a)
    draw_text(cv, text, 110, y + 74, "sans", 38, INK, a, maxw=860)

def end_card(cv, t, t0, scene_titles=()):
    a = ease(prog(t, t0, t0 + 0.45))
    cv.drawRect(skia.Rect.MakeWH(W, H), fill(PAPER, a))
    if a <= 0: return
    k = back(prog(t, t0 + 0.1, t0 + 0.6))
    cv.save(); cv.translate(W / 2, 640); cv.scale(k, k); house_logo(cv, -110, -110, 220); cv.restore()
    draw_text(cv, "บ้าน", W / 2, 800, "serif_b", 150, INK, a, anchor="tc")
    draw_text(cv, "Baan", W / 2, 1040, "serif", 84, INK, a, anchor="tc")
    draw_text(cv, "Learn Thai, one scene at a time", W / 2, 1170, "sans", 44, MUTED, a, anchor="tc")
    a2 = ease(prog(t, t0 + 0.5, t0 + 0.9))
    pill_w = 960; rrect(cv, (W - pill_w) / 2, 1290, pill_w, 230, 60, TEAL, a2)
    draw_text(cv, "100% free · zero ads", W / 2, 1322, "sans_b", 58, ACCENT_INK, a2, anchor="tc")
    draw_text(cv, "in your browser · link in bio", W / 2, 1420, "sans", 50, ACCENT_INK, a2, anchor="tc")
    for i, (sx, sy) in enumerate(((180, 560), (900, 520), (240, 900), (860, 960))):
        sparkle(cv, sx, sy, 22 + 8 * math.sin(t * 4 + i), GOLD, a * (0.6 + 0.4 * math.sin(t * 3 + i * 2)))

"""Voiced café reel: same picture as cafe_reel, plus a Thai voice on every bubble
(Nid = th-TH-PremwadeeNeural, you = th-TH-NiwatNeural, made with free edge-tts into voices/).
Mouths move while each voice clip plays. Render: .venv/bin/python render.py cafe_voiced"""
import os, math, subprocess
import cafe_reel as base
from cafe_reel import *          # noqa: F401,F403  (draw, DURATION, L, ...)
NAME = "cafe_voiced"
OUT = "baan-cafe-reel-voiced.mp4"
HERE = os.path.dirname(os.path.abspath(__file__))
LEAD = 0.3                        # voice starts just after the bubble pops in
def _dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
CLIPS = [(s + LEAD, os.path.join(HERE, "voices", f"{ln['id']}.wav"), who) for s, e, ln, who in base.L]
DURS = [_dur(f) for _, f, _ in CLIPS]
for (t0, f, who), d, (s, e, ln, _) in zip(CLIPS, DURS, base.L):
    assert t0 + d < e, f"{ln['id']} voice ({d:.2f}s) runs past its bubble"
def _talking(t, who):
    for (t0, f, w), d in zip(CLIPS, DURS):
        if w == who and t0 - 0.03 < t < t0 + d:
            return abs(math.sin((t - t0) * 15))
    return 0.0
base.talking = _talking
def voices():
    return [(t0, f) for t0, f, _ in CLIPS]

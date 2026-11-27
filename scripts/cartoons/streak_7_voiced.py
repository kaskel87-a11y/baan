"""Voiced 7-day streak congratulations: same picture as streak_7_reel plus Thai voices
(Pim = th-TH-PremwadeeNeural, you = th-TH-NiwatNeural). Render: python render.py streak_7_voiced"""
import os, math, subprocess
import streak_7_reel as base
from streak_7_reel import *  # noqa: F401,F403
NAME = "streak7_voiced"
OUT = "baan-streak-7-reel-voiced.mp4"
HERE = os.path.dirname(os.path.abspath(__file__))
LEAD = 0.3

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

base.reel.talking = _talking

def voices():
    return [(t0, f) for t0, f, _ in CLIPS]

"""Synthetic 'voices' for the fake-mic tests: 0.7 s silence, a voiced vowel with a known pitch contour, 2.3 s silence.
Chrome loops the file, so each loop is one utterance followed by a pause (which triggers auto-stop)."""
import numpy as np, wave, sys, os
R = 48000
out = sys.argv[1] if len(sys.argv) > 1 else "scripts/wav"
os.makedirs(out, exist_ok=True)

def voice(f0, dur=0.55):
    n = int(dur * R); u = np.arange(n) / n
    f = f0(u); ph = 2 * np.pi * np.cumsum(f) / R
    s = sum(np.sin(k * ph) / k * (1.0 if k < 4 else 0.6) for k in range(1, 16))
    # crude vowel colouring: emphasise ~700 Hz and ~1200 Hz bands via extra harmonics weighting
    env = np.minimum(1, np.minimum(u * 12, (1 - u) * 12))
    jitter = 1 + 0.01 * np.sin(2 * np.pi * 5.5 * u * dur)  # slight vibrato
    return 0.22 * s * env * jitter

def utter(*parts, gap=0.12):
    sil = lambda t: np.zeros(int(t * R))
    sig = [sil(0.7)]
    for i, p in enumerate(parts):
        if i: sig.append(sil(gap))
        sig.append(p)
    sig.append(sil(2.3))
    x = np.concatenate(sig)
    x += np.random.default_rng(1).normal(0, 0.002, x.size)
    return x

def save(name, x):
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    print(name, f"{x.size / R:.2f}s")

lin = lambda a, b: (lambda u: a + (b - a) * u)
save("falling", utter(voice(lambda u: np.where(u < 0.25, 220 + 40 * u, 230 - 130 * (u - 0.25) / 0.75))))
save("rising", utter(voice(lambda u: np.where(u < 0.35, 150 - 57 * u, 130 + 90 * (u - 0.35) / 0.65))))
save("flat", utter(voice(lambda u: 160 + 0 * u)))
save("fall-rise-2syl", utter(voice(lin(230, 120), 0.4), voice(lambda u: np.where(u < 0.3, 140 - 30 * u, 131 + 100 * (u - 0.3) / 0.7), 0.45)))
save("zeros", np.zeros(int(4 * R)))
save("quiet-falling", utter(voice(lambda u: np.where(u < 0.25, 220 + 40 * u, 230 - 130 * (u - 0.25) / 0.75))) * 0.01)
save("short-rising", utter(voice(lambda u: 140 + 90 * u, 0.18)))
save("silence", np.random.default_rng(2).normal(0, 0.001, int(4 * R)))

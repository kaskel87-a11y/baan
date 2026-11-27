"""Original, synthesized-from-scratch soundtrack (no samples, no licences): a soft plucked
ukulele-ish loop (Karplus-Strong) plus cartoon SFX (steps, door bell, bubble pops, clink, sparkle)."""
import numpy as np, soundfile as sf
SR = 44100
rng = np.random.default_rng(7)
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def pluck(freq, dur=1.2, bright=0.5, gain=1.0):
    n = int(SR * dur); p = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, p)
    buf = np.convolve(buf, np.ones(3) / 3, "same") * (0.6 + 0.4 * bright)
    out = np.zeros(n); b = buf.copy()
    for i in range(n):
        out[i] = b[i % p]
        b[i % p] = 0.996 * 0.5 * (b[i % p] + b[(i + 1) % p])
    env = np.minimum(1, np.arange(n) / (0.004 * SR))
    return out * env * gain
_cache = {}
def pl(note, dur=1.2, gain=1.0):
    k = (note, dur)
    if k not in _cache: _cache[k] = pluck(midi(note), dur)
    return _cache[k] * gain
def sine(f, dur, decay=6.0, gain=1.0, f_end=None):
    t = np.arange(int(SR * dur)) / SR
    ff = f if f_end is None else f * (f_end / f) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(ff) / SR
    return np.sin(ph) * np.exp(-decay * t) * np.minimum(1, t / 0.003) * gain
def add(track, t, clip):
    i = int(t * SR); j = min(len(track), i + len(clip))
    if 0 <= i < len(track): track[i:j] += clip[:j - i]
def sfx(kind):
    if kind == "step":
        n = int(0.07 * SR); x = rng.uniform(-1, 1, n); x = np.convolve(x, np.ones(18) / 18, "same")
        return x * np.exp(-np.arange(n) / (0.012 * SR)) * 0.9 + sine(150, 0.07, 40, 0.35)
    if kind == "bell":
        return sum(sine(f, 1.6, 3.2, g) for f, g in ((1568, .25), (2093, .18), (3136, .06))) + np.pad(sum(sine(f, 1.6, 3.4, g) for f, g in ((1319, .22), (2637, .07))), (int(.13 * SR), 0))[:int(1.6 * SR)]
    if kind == "door":
        n = int(0.18 * SR); x = np.convolve(rng.uniform(-1, 1, n), np.ones(60) / 60, "same")
        return x * np.exp(-np.arange(n) / (0.03 * SR)) * 1.6 + sine(90, 0.18, 22, 0.5)
    if kind == "pop":
        return sine(420, 0.12, 30, 0.55, f_end=980)
    if kind == "clink":
        return sine(2637, 0.6, 9, 0.22) + sine(3951, 0.6, 12, 0.12)
    if kind == "sparkle":
        out = np.zeros(int(0.9 * SR))
        for k, n in enumerate((84, 88, 91, 96)):
            c = sine(midi(n), 0.5, 9, 0.12); add(out, k * 0.07, c)
        return out
    if kind == "chime":
        out = np.zeros(int(2.5 * SR))
        for k, n in enumerate((72, 76, 79, 84)): add(out, k * 0.09, pl(n, 2.2, 0.5) + sine(midi(n), 2.2, 2.5, 0.1))
        return out
    raise KeyError(kind)
def music(duration, bpm=100):
    beat = 60 / bpm; out = np.zeros(int(SR * (duration + 3)))
    chords = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]       # C  Am  F  G
    pattern = [0, 1, 2, 1, 0, 2, 1, 2]
    bars = int(duration / (4 * beat)) + 1
    for b in range(bars):
        ch = chords[b % 4]; t0 = b * 4 * beat
        add(out, t0, pl(ch[0] - 12, 2.0, 0.55))
        add(out, t0 + 2 * beat, pl(ch[0] - 12, 1.5, 0.35))
        for k, idx in enumerate(pattern):
            add(out, t0 + k * beat / 2, pl(ch[idx] + 12, 0.9, 0.28 if k % 2 == 0 else 0.2))
        if b % 2 == 1:   # little bell motif
            for k, n in enumerate((ch[2] + 24, ch[1] + 24)): add(out, t0 + (2.5 + k * 0.5) * beat, sine(midi(n), 0.7, 6, 0.05))
    return out[:int(SR * duration)]
def load_voice(path):
    import subprocess
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32).astype(np.float64)
    return v / (np.max(np.abs(v)) + 1e-9)
def render(events, duration, path, voices=None):
    m = music(duration - 0.3)
    track = np.zeros(int(SR * duration))
    fade = np.ones(len(m)); f = int(2.5 * SR); fade[-f:] = np.linspace(1, 0, f)
    track[:len(m)] += m * fade * 0.35
    for t, kind in events: add(track, t, sfx(kind) * {"step": 0.55, "bell": 0.5}.get(kind, 0.8))
    from scipy.signal import butter, sosfilt
    track = sosfilt(butter(2, 40, 'highpass', fs=SR, output='sos'), track)
    pk = np.max(np.abs(track)) + 1e-9; track = np.tanh(track / pk * 1.2) * 0.85
    if voices:   # (start_s, file): music+SFX bed sits low and ducks further under each line
        duck = np.ones(len(track)); r = int(0.18 * SR)
        vt = np.zeros(len(track))
        for t0, f in voices:
            v = load_voice(f); add(vt, t0, v * 0.92)
            i, j = int((t0 - 0.12) * SR), int((t0 + len(v) / SR + 0.15) * SR); duck[max(0, i):j] = 0.0
        from scipy.ndimage import uniform_filter1d
        duck = uniform_filter1d(duck, r)
        track = track * 0.55 * (0.45 + 0.55 * duck) + vt
        track = np.clip(track, -0.98, 0.98)
    fi = int(0.05 * SR); track[:fi] *= np.linspace(0, 1, fi); track[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
    sf.write(path, np.stack([track, track], 1).astype(np.float32), SR)

"""Render a scene reel module to MP4: python render.py cafe_reel [--frames 1,5.5,12] (stills only)."""
import sys, os, importlib, subprocess, numpy as np, skia
import baan_toon as bt, audio
HERE = os.path.dirname(os.path.abspath(__file__))
def frame(mod, t):
    surf = skia.Surface(bt.W, bt.H); cv = surf.getCanvas(); mod.draw(cv, t)
    return surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)
def main():
    mod = importlib.import_module(sys.argv[1]); out = os.path.join(HERE, "out_" + mod.NAME); os.makedirs(out, exist_ok=True)
    if "--frames" in sys.argv:
        from PIL import Image
        for ts in sys.argv[sys.argv.index("--frames") + 1].split(","):
            Image.fromarray(frame(mod, float(ts))[:, :, :3]).save(f"{out}/f_{float(ts):05.2f}.png")
        return
    raw = f"{out}/{mod.NAME}_raw.wav"; audio.render(mod.events(), mod.DURATION, raw, getattr(mod, "voices", lambda: None)()); wav = f"{out}/{mod.NAME}.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", wav], check=True)
    mp4 = os.path.join(HERE, getattr(mod, "OUT", f"baan-{mod.NAME}-reel.mp4"))
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{bt.W}x{bt.H}", "-r", str(bt.FPS), "-i", "-",
                           "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
                           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)
    n = int(mod.DURATION * bt.FPS)
    for i in range(n):
        ff.stdin.write(frame(mod, i / bt.FPS).tobytes())
        if i % 150 == 0: print(f"frame {i}/{n}", flush=True)
    ff.stdin.close(); ff.wait(); print("wrote", mp4)
if __name__ == "__main__": main()

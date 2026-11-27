"""Thai voices for a reel's bubbles with free Microsoft Edge neural TTS (pip install edge-tts).
Female staff = th-TH-PremwadeeNeural, male customer = th-TH-NiwatNeural, 10% slower than default.
Writes voices/<line id>.wav with the silence trimmed.  Usage: python make_voices.py cafe_reel"""
import sys, os, time, subprocess, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = {"female": "th-TH-PremwadeeNeural", "male": "th-TH-NiwatNeural"}
EDGE = os.path.join(HERE, ".venv/bin/edge-tts")
def tts(text, voice, mp3):
    # The service sometimes refuses a phrase (ห้าสิบห้าบาทค่ะ); spaces between words read the same and get through.
    for attempt, t in enumerate([text, text, " ".join(text.replace("บาท", " บาท ").replace("ค่ะ", " ค่ะ").split())] * 2):
        if subprocess.run([EDGE, "--voice", voice, "--rate=-10%", "--text", t, "--write-media", mp3], capture_output=True).returncode == 0:
            return t
        time.sleep(2)
    raise RuntimeError(f"edge-tts failed for {text}")
def main():
    mod = importlib.import_module(sys.argv[1]); os.makedirs(os.path.join(HERE, "voices"), exist_ok=True)
    for s, e, ln, who in mod.L:
        mp3 = os.path.join(HERE, "voices", f"{ln['id']}.mp3"); wav = mp3[:-4] + ".wav"
        used = tts(ln["thai"], VOICE["male" if who == "you" else "female"], mp3)
        trim = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", trim, "-ar", "44100", "-ac", "1", wav], check=True)
        print(ln["id"], who, used)
if __name__ == "__main__": main()

# Baan cartoons ("Watch the scene")

Short vertical cartoons in Baan's flat style that act out real lesson lines, with a Thai voice on every bubble.
They are shown on lesson screens by `src/components/WatchScene.tsx`, listed in `src/data/cartoons.ts`.
Everything here is free and local except the voices, which use the free Edge neural TTS (`edge-tts`).

- `baan_toon.py`: the kit (palette from `SceneArt.tsx`/`index.css`, Noto Serif/Sans Thai, `person()`, props, `bubble()`, `tip_card()`, `end_card()`).
  `FD` points at the Noto fonts on the build box; change it if yours live elsewhere.
- `lesson_data.py`: `line(scene_id, line_id, voice)` reads Thai/romanization/English/notes from `src/data/scenes.ts`, so no Thai is typed by hand.
- `audio.py`: original synthesized music and SFX. `render(..., voices=[(t, wav)])` lays voices on top and ducks the music under each line.
- `cafe_reel.py`: the café timeline (cafe/c1, c2, order/o1, o2, o6, o7; customer uses the male ครับ forms).
- `cafe_voiced.py`: the same picture plus voices; mouths move while each clip plays, and it asserts every clip ends before its bubble.
- `make_voices.py`: writes `voices/<line>.wav`. Staff (Nid) = `th-TH-PremwadeeNeural`, customer = `th-TH-NiwatNeural`, rate -10%.

## Render the café cartoon
```
python3 -m venv .venv && .venv/bin/pip install skia-python pillow numpy scipy soundfile edge-tts
.venv/bin/python make_voices.py cafe_reel          # voices/*.wav
.venv/bin/python render.py cafe_voiced             # baan-cafe-reel-voiced.mp4 (1080x1920, for social)
.venv/bin/python render.py cafe_reel --frames 5,12.5,20   # stills for checking
# web copy for the app (about 1.2 MB) and its poster:
ffmpeg -i baan-cafe-reel-voiced.mp4 -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -g 60 -c:a aac -b:a 96k -movflags +faststart ../../src/assets/cartoons/cafe.mp4
ffmpeg -ss 12.6 -i baan-cafe-reel-voiced.mp4 -frames:v 1 -vf scale=540:960 -q:v 80 ../../src/assets/cartoons/cafe-poster.webp
```

## Add another scene (taxi, market, ...)
1. Copy `cafe_reel.py` to `taxi_reel.py`, set `NAME`, pick lines with `line("taxi", "tx1")` into `L` as `(start, end, line, "you" | "<staff>")`,
   and swap the backdrops for that scene's drawing in `SceneArt.tsx`. Copy `cafe_voiced.py` to `taxi_voiced.py` and import the new module.
2. `make_voices.py taxi_reel`, then `render.py taxi_voiced`. If the assert fires, lengthen that bubble.
3. Make the 720×1280 web copy and poster as above (`src/assets/cartoons/taxi.mp4`, `taxi-poster.webp`).
4. Add an entry to `CARTOONS` in `src/data/cartoons.ts`: the lesson ids it shows on, and each line's start time (bubble start + 0.3 s).
   Vite hashes the file names, so a re-rendered video is never served stale.

## Streak cartoons (7, 30, 100 days)
`streak_30_reel.py` is the first; `streak_milestone.py` is the parametric version that `streak_7_reel.py` and `streak_100_reel.py` use (the count sits in the title row so bubbles never cover it).
```
.venv/bin/python make_voices.py streak_7_reel            # voices/s7a.wav ...
.venv/bin/python render.py streak_7_voiced --frames 0.9,2.4,4.6   # stills for checking
.venv/bin/python render.py streak_7_voiced               # baan-streak-7-reel-voiced.mp4
ffmpeg -i baan-streak-7-reel-voiced.mp4 -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -g 60 -c:a aac -b:a 96k -movflags +faststart ../../src/assets/cartoons/streak-7.mp4
ffmpeg -ss 2.4 -i baan-streak-7-reel-voiced.mp4 -frames:v 1 -vf scale=540:960 -q:v 80 ../../src/assets/cartoons/streak-7-poster.webp
```
They are listed in `src/data/streakCartoons.ts` (each line's start time is its bubble start + 0.3 s), not in `cartoons.ts`.

## Taxi reel (Baan 0.49.0)
`taxi_reel.py` / `taxi_voiced.py` (rider = female voice, ค่ะ forms; driver = male voice). `noodle_reel.py` / `noodle_voiced.py` is the *Taste it first* stall (Pim female, you and Ton male, ครับ forms). `make_voices.py` reads an optional `VOICES` map from the reel module. Render: `.venv/bin/python make_voices.py taxi_reel && .venv/bin/python render.py taxi_voiced`.

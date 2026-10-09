#!/usr/bin/env bash
# Real Thai speech for local testing (Google Translate TTS). Not committed. Writes scripts/wav/thai-*.wav
set -e
cd "$(dirname "$0")/wav"
for w in ผัดไทย แพง ข้าว ขาว ขอบคุณครับ ไม่เผ็ด; do
  q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$w")
  curl -s -A "Mozilla/5.0" -o "/tmp/thai-$w.mp3" "https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=$q"
  # 0.7 s lead-in, 2.3 s tail, light room noise + a 120 Hz hum (the kind of background that used to be read as a flat "voice")
  ffmpeg -loglevel error -y -i "/tmp/thai-$w.mp3" -f lavfi -t 4 -i "anoisesrc=color=pink:amplitude=0.004" -f lavfi -t 4 -i "sine=frequency=120:sample_rate=48000" \
    -filter_complex "[0]aresample=48000,adelay=700,apad=pad_dur=2.3[v];[2]volume=0.006[h];[v][1][h]amix=inputs=3:normalize=0:duration=first" -ac 1 -ar 48000 "thai-$w.wav"
done
ls thai-*.wav
# quiet voice (−22 dB) with a louder 180 Hz hum: the phone-like case that used to draw a flat line
ffmpeg -loglevel error -y -i "/tmp/thai-ผัดไทย.mp3" -f lavfi -t 4 -i "anoisesrc=color=pink:amplitude=0.003" -f lavfi -t 4 -i "sine=frequency=180:sample_rate=48000" \
  -filter_complex "[0]aresample=48000,volume=0.08,adelay=700,apad=pad_dur=2.3[v];[2]volume=0.004[h];[v][1][h]amix=inputs=3:normalize=0:duration=first" -ac 1 -ar 48000 phone-phatthai.wav

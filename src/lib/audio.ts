import { useEffect, useState } from "react";

let token = 0;

export function thaiVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("th"));
}

function utterance(text: string, rate: number, voiceIndex = 0) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "th-TH";
  u.rate = rate;
  const voices = thaiVoices();
  if (voices.length) u.voice = voices[voiceIndex % voices.length];
  return u;
}

export function stopSpeech() {
  token++;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Speak one Thai string. `voiceIndex` picks among installed Thai voices (for variation drills). */
export function speak(text: string, rate = 0.9, voiceIndex = 0) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
  const synth = window.speechSynthesis;
  const t = ++token;
  const u = utterance(text, rate, voiceIndex);
  synth.cancel();
  window.setTimeout(() => {
    if (t === token) synth.speak(u);
  }, 60);
}

/** Speak several strings back to back, with an optional pause between them (ms). */
export function speakSequence(texts: string[], rate = 0.9, opts: { gapMs?: number; voices?: number[] } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const t = ++token;
  synth.cancel();
  const step = (i: number) => {
    if (t !== token || i >= texts.length) return;
    const u = utterance(texts[i] ?? "", rate, opts.voices?.[i] ?? 0);
    u.onend = () => window.setTimeout(() => step(i + 1), opts.gapMs ?? 0);
    synth.speak(u);
  };
  window.setTimeout(() => step(0), 60);
}

export function useThaiVoice(): "unknown" | "yes" | "no" {
  const [v, setV] = useState<"unknown" | "yes" | "no">("unknown");
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setV("no");
      return;
    }
    const check = () => {
      const all = synth.getVoices();
      if (all.length !== 0) setV(thaiVoices().length ? "yes" : "no");
    };
    check();
    synth.addEventListener("voiceschanged", check);
    return () => synth.removeEventListener("voiceschanged", check);
  }, []);
  return v;
}

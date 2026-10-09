/* Mic diagnostics shown in the "Mic trouble?" panel, so Collin can screenshot what his phone did. */
import { useSyncExternalStore } from "react";

export interface Diag {
  userAgent: string;
  speechRecognition: string;
  wordCheckMode: string;
  getUserMedia: string;
  audioWorklet: string;
  mediaRecorder: string;
  ctxStateAtTap: string;
  ctxStateAfterMic: string;
  ctxStateAtStop: string;
  ctxSampleRate: string;
  micSampleRate: string;
  micLabel: string;
  capturePath: string;
  recordingType: string;
  durationMs: string;
  peakLevel: string;
  meterPeak: string;
  transcriber: string;
  transcript: string;
  rmsLevel: string;
  voicedMs: string;
  pitchMedianHz: string;
  lastError: string;
  lastWordError: string;
  updated: string;
}

const blank = (): Diag => ({
  userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  speechRecognition: "",
  wordCheckMode: "",
  getUserMedia: "",
  audioWorklet: "",
  mediaRecorder: "",
  ctxStateAtTap: "—",
  ctxStateAfterMic: "—",
  ctxStateAtStop: "—",
  ctxSampleRate: "—",
  micSampleRate: "—",
  micLabel: "—",
  capturePath: "—",
  recordingType: "—",
  durationMs: "—",
  peakLevel: "—",
  meterPeak: "—",
  transcriber: "—",
  transcript: "—",
  rmsLevel: "—",
  voicedMs: "—",
  pitchMedianHz: "—",
  lastError: "none",
  lastWordError: "none",
  updated: "never",
});

let state: Diag = blank();
const subs = new Set<() => void>();

export function setDiag(patch: Partial<Diag>) {
  state = { ...state, ...patch, updated: new Date().toLocaleTimeString() };
  subs.forEach((f) => f());
}

export const getDiag = () => state;

export function useDiag() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => state,
    () => state,
  );
}

export function errorName(e: unknown): string {
  if (e instanceof DOMException || e instanceof Error) return `${e.name}: ${e.message}`.slice(0, 160);
  return String(e).slice(0, 160);
}

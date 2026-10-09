/**
 * On-device Thai speech-to-text for the word check, used where the browser's own speech recognition
 * doesn't work (iPhone). Whisper base (multilingual, ~80 MB, downloaded once and cached by the browser)
 * via Transformers.js, run in a Web Worker so the page stays responsive. No server, no API key;
 * the audio never leaves the phone.
 */
import { resample } from "./pitch";
import { setDiag } from "./diag";

export const MODEL = "onnx-community/whisper-base";
const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5";

const WORKER = `
let asr = null;
async function load(model, lib) {
  if (asr) return asr;
  const { pipeline, env } = await import(lib);
  env.backends.onnx.wasm.numThreads = 1; // iOS: no cross-origin isolation, and threads cost memory
  asr = await pipeline("automatic-speech-recognition", model, {
    dtype: "q8",
    device: "wasm",
    progress_callback: (p) => {
      if (p.status === "progress" && p.total) postMessage({ type: "progress", file: p.file, loaded: p.loaded, total: p.total });
    },
  });
  return asr;
}
onmessage = async (e) => {
  const { id, model, lib, audio } = e.data;
  try {
    const run = await load(model, lib);
    postMessage({ type: "ready" });
    if (!audio) return postMessage({ id, type: "done", text: "" });
    const r = await run(audio, { language: "thai", task: "transcribe" });
    postMessage({ id, type: "done", text: (r.text || "").trim() });
  } catch (err) {
    postMessage({ id, type: "error", error: String(err && err.message || err) });
  }
};
`;

let worker: Worker | null = null;
let seq = 0;
let loaded = false;
const progress = new Map<string, { loaded: number; total: number }>();

export const transcriberLoaded = () => loaded;

function getWorker() {
  if (!worker) {
    const url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
    worker = new Worker(url, { type: "module" });
  }
  return worker;
}

/** Transcribe mono samples. `onProgress(0..1)` reports the one-time model download. */
export function transcribe(samples: Float32Array, rate: number, onProgress?: (fraction: number) => void): Promise<string> {
  // Test hook: headless tests can't download the model every run.
  const fake = (window as unknown as { __fakeTranscribe?: (n: number) => Promise<string> | string }).__fakeTranscribe;
  if (fake) return Promise.resolve(fake(samples.length));
  const audio = new Float32Array(resample(samples, rate, 16000)); // copy: the buffer is transferred to the worker
  const id = ++seq;
  const w = getWorker();
  setDiag({ transcriber: loaded ? `${MODEL} (cached)` : `${MODEL} (loading…)` });
  return new Promise((resolve, reject) => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data;
      if (m.type === "progress") {
        progress.set(m.file, { loaded: m.loaded, total: m.total });
        let l = 0;
        let t = 0;
        for (const v of progress.values()) {
          l += v.loaded;
          t += v.total;
        }
        onProgress?.(t ? l / t : 0);
        return;
      }
      if (m.type === "ready") {
        loaded = true;
        setDiag({ transcriber: `${MODEL} (ready)` });
        return;
      }
      if (m.id !== id) return;
      w.removeEventListener("message", onMsg);
      if (m.type === "done") resolve(m.text);
      else reject(new Error(m.error));
    };
    w.addEventListener("message", onMsg);
    w.onerror = (ev) => {
      w.removeEventListener("message", onMsg);
      reject(new Error(ev.message || "worker failed"));
    };
    w.postMessage({ id, model: MODEL, lib: LIB, audio }, [audio.buffer]);
  });
}

/** Rough romanization match for when Whisper answers in Latin letters ("Pang!" for แพง). */
export function latinMatches(text: string, roman: string): number {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/([ptk])h/g, "$1")
      .replace(/bp/g, "p")
      .replace(/dt/g, "t")
      .replace(/(.)\1+/g, "$1")
      .replace(/ae|ea/g, "a")
      .replace(/aw/g, "o");
  const a = norm(text);
  const b = norm(roman);
  if (!a || !b) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - dp[a.length]![b.length]! / Math.max(a.length, b.length);
}

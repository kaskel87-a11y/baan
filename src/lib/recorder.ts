/**
 * Microphone capture for the tone check.
 *
 * iOS Safari rules this follows:
 *  - The AudioContext is created AND resumed synchronously inside the tap (`createCapture()` is sync);
 *    otherwise it stays "suspended" and records zeros. A silent 1-sample buffer is also played to unlock it.
 *  - Samples come from an AudioWorklet (ScriptProcessor on older Safari). A MediaRecorder (audio/mp4 on iOS,
 *    webm/opus elsewhere) records the same stream in parallel. If the Web Audio tap comes back empty or
 *    all zeros (suspended context, sample-rate mismatch after the mic opens), the MediaRecorder file is
 *    decoded instead.
 *  - Nothing else uses the mic at the same time (no speech recognition during recording on phones).
 */
import { errorName, setDiag } from "./diag";
import { levelStats } from "./pitch";

export type MicError = "unsupported" | "denied" | "no-device" | "busy" | "insecure" | "unknown";

export interface Recording {
  samples: Float32Array;
  rate: number;
  path: string;
  peak: number;
}

export interface Capture {
  start(opts: { onAutoStop: () => void; maxMs?: number }): Promise<void>;
  stop(): Promise<Recording>;
  /** Live input level 0..1 */
  level(): number;
  cancel(): void;
}

const WORKLET = `
class BaanTap extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor("baan-tap", BaanTap);
`;

type AC = typeof AudioContext;

export function micSupported() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T) =>
  Promise.race([p, new Promise<T>((r) => window.setTimeout(() => r(fallback), ms))]);

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return undefined;
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((t) => MediaRecorder.isTypeSupported(t));
}

/** Call this synchronously inside the click/tap handler. */
export function createCapture(): Capture {
  const Ctx: AC | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
  setDiag({
    getUserMedia: micSupported() ? "yes" : "no",
    audioWorklet: typeof AudioWorkletNode !== "undefined" ? "yes" : "no",
    mediaRecorder: typeof MediaRecorder !== "undefined" ? `yes (${pickMime() ?? "default type"})` : "no",
  });
  if (!Ctx) throw "unsupported" as MicError;
  const ctx = new Ctx();
  // Synchronous, inside the gesture: resume + play one silent sample (classic iOS unlock).
  void ctx.resume().catch(() => undefined);
  try {
    const b = ctx.createBuffer(1, 1, ctx.sampleRate);
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.connect(ctx.destination);
    s.start(0);
  } catch {
    /* ignore */
  }
  setDiag({ ctxStateAtTap: ctx.state, ctxSampleRate: String(ctx.sampleRate) });

  const chunks: Float32Array[] = [];
  let stream: MediaStream | null = null;
  let src: MediaStreamAudioSourceNode | null = null;
  let node: AudioNode | null = null;
  let sink: GainNode | null = null;
  let mr: MediaRecorder | null = null;
  const mrChunks: Blob[] = [];
  let mrDone: Promise<void> = Promise.resolve();
  let path = "none";
  let lastLevel = 0;
  let stopped = false;
  let timers: number[] = [];
  let startedAt = 0;

  // Voice activity: once speech has been heard, stop after ~0.9 s of quiet.
  let noise = 0.002;
  let heard = false;
  let quietSince = 0;
  let onAuto: () => void = () => undefined;

  function onSamples(ch: Float32Array) {
    if (stopped) return;
    chunks.push(ch);
    let e = 0;
    for (let i = 0; i < ch.length; i++) e += ch[i]! * ch[i]!;
    const rms = Math.sqrt(e / ch.length);
    // meter: log scale so quiet phone mics still move it (−60 dB → 0, −10 dB → 1)
    lastLevel = rms > 0 ? Math.max(0, Math.min(1, (20 * Math.log10(rms) + 60) / 50)) : 0;
    const now = performance.now();
    if (now - startedAt < 250) noise = Math.max(noise, rms * 1.2);
    const speaking = rms > Math.max(0.004, noise * 3);
    if (speaking) {
      heard = true;
      quietSince = 0;
    } else if (heard) {
      if (!quietSince) quietSince = now;
      else if (now - quietSince > 900) onAuto();
    }
  }

  function teardown() {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    try {
      node?.disconnect();
      src?.disconnect();
      sink?.disconnect();
    } catch {
      /* already gone */
    }
    stream?.getTracks().forEach((t) => t.stop());
    void ctx.close().catch(() => undefined);
  }

  async function decodeBlob(): Promise<Float32Array | null> {
    if (!mrChunks.length) return null;
    const blob = new Blob(mrChunks, { type: mr?.mimeType || mrChunks[0]!.type });
    setDiag({ recordingType: `${blob.type || "unknown"} · ${blob.size} bytes` });
    if (!blob.size) return null;
    const buf = await blob.arrayBuffer();
    try {
      const audio = await new Promise<AudioBuffer>((res, rej) => {
        const p = ctx.decodeAudioData(buf, res, rej);
        if (p && typeof p.then === "function") p.then(res, rej);
      });
      return audio.getChannelData(0);
    } catch (e) {
      setDiag({ lastError: `decode: ${errorName(e)}` });
      return null;
    }
  }

  return {
    async start({ onAutoStop, maxMs = 6000 }) {
      onAuto = () => {
        if (!stopped) onAutoStop();
      };
      if (!micSupported()) throw (window.isSecureContext ? "unsupported" : "insecure") as MicError;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true },
        });
      } catch (e) {
        setDiag({ lastError: `getUserMedia: ${errorName(e)}` });
        teardown();
        const name = e instanceof DOMException ? e.name : "";
        throw (name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "no-device"
            : name === "NotReadableError" || name === "AbortError"
              ? "busy"
              : "unknown") as MicError;
      }
      if (stopped) return;
      const track = stream.getAudioTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      setDiag({ micSampleRate: settings.sampleRate ? String(settings.sampleRate) : "not reported", micLabel: track?.label || "—" });
      if (ctx.state !== "running") await withTimeout(ctx.resume().then(() => true), 800, false).catch(() => false);
      setDiag({ ctxStateAfterMic: ctx.state, ctxSampleRate: String(ctx.sampleRate) });
      startedAt = performance.now();

      // Parallel MediaRecorder: the safety net if Web Audio delivers silence.
      if (typeof MediaRecorder !== "undefined") {
        try {
          const mime = pickMime();
          mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
          mrDone = new Promise((res) => {
            mr!.onstop = () => res();
            mr!.onerror = () => res();
          });
          mr.ondataavailable = (ev) => ev.data.size && mrChunks.push(ev.data);
          mr.start(250);
        } catch (e) {
          mr = null;
          setDiag({ lastError: `MediaRecorder: ${errorName(e)}` });
        }
      }

      src = ctx.createMediaStreamSource(stream);
      sink = ctx.createGain();
      sink.gain.value = 0;
      let usedWorklet = false;
      if (ctx.audioWorklet && typeof AudioWorkletNode !== "undefined") {
        try {
          const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
          const added = await withTimeout(ctx.audioWorklet.addModule(url).then(() => true), 1500, false);
          URL.revokeObjectURL(url);
          if (added) {
            const w = new AudioWorkletNode(ctx, "baan-tap");
            w.port.onmessage = (ev: MessageEvent<Float32Array>) => onSamples(ev.data);
            node = w;
            usedWorklet = true;
          }
        } catch (e) {
          setDiag({ lastError: `AudioWorklet: ${errorName(e)}` });
        }
      }
      if (!usedWorklet) {
        const sp = ctx.createScriptProcessor(2048, 1, 1);
        sp.onaudioprocess = (ev) => onSamples(new Float32Array(ev.inputBuffer.getChannelData(0)));
        node = sp;
      }
      path = usedWorklet ? "AudioWorklet" : "ScriptProcessor";
      src.connect(node!);
      node!.connect(sink);
      sink.connect(ctx.destination);
      timers.push(window.setTimeout(onAuto, maxMs));
    },

    async stop() {
      stopped = true;
      const durationMs = startedAt ? performance.now() - startedAt : 0;
      setDiag({ ctxStateAtStop: ctx.state });
      await new Promise((r) => window.setTimeout(r, 60)); // last worklet messages
      if (mr && mr.state !== "inactive") {
        try {
          mr.stop();
        } catch {
          /* ignore */
        }
        await withTimeout(mrDone, 1500, undefined);
      }
      const len = chunks.reduce((s, c) => s + c.length, 0);
      let samples = new Float32Array(len);
      let o = 0;
      for (const c of chunks) {
        samples.set(c, o);
        o += c.length;
      }
      let rate = ctx.sampleRate;
      let stats = levelStats(samples);
      let used = path;
      // Web Audio gave nothing usable → decode the MediaRecorder file instead.
      if (stats.peak < 1e-4 && mr) {
        const decoded = await decodeBlob();
        if (decoded && decoded.length) {
          samples = new Float32Array(decoded);
          rate = ctx.sampleRate; // decodeAudioData resamples to the context rate
          stats = levelStats(samples);
          used = `MediaRecorder fallback (${path} was silent)`;
        }
      } else if (mr) {
        setDiag({ recordingType: `${mr.mimeType || "default"} (backup, not needed)` });
      }
      teardown();
      setDiag({
        capturePath: used,
        durationMs: String(Math.round(durationMs || (samples.length / rate) * 1000)),
        peakLevel: stats.peak.toFixed(4),
        rmsLevel: stats.rms.toFixed(5),
      });
      return { samples, rate, path: used, peak: stats.peak };
    },
    level: () => lastLevel,
    cancel() {
      stopped = true;
      try {
        if (mr && mr.state !== "inactive") mr.stop();
      } catch {
        /* ignore */
      }
      teardown();
    },
  };
}

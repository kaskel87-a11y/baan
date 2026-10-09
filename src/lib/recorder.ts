/**
 * Microphone capture for the tone check. AudioWorklet where available, ScriptProcessor fallback
 * (older Safari). The AudioContext must be created inside the tap handler (iOS user-gesture rule),
 * so `createCapture()` is synchronous and `start()` does the async getUserMedia.
 */

export type MicError = "unsupported" | "denied" | "no-device" | "busy" | "insecure" | "unknown";

export interface Capture {
  /** Begin recording. Resolves once the mic is live; rejects with a MicError. */
  start(opts: { onAutoStop: () => void; maxMs?: number }): Promise<void>;
  /** Stop and return mono samples at `rate`. */
  stop(): Promise<{ samples: Float32Array; rate: number }>;
  /** Live input level 0..1 (for a meter). */
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

export function createCapture(): Capture {
  const Ctx: AC | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
  if (!Ctx) throw "unsupported" as MicError;
  // Created synchronously in the gesture so iOS lets it run.
  const ctx = new Ctx();
  void ctx.resume();
  const chunks: Float32Array[] = [];
  let stream: MediaStream | null = null;
  let src: MediaStreamAudioSourceNode | null = null;
  let node: AudioNode | null = null;
  let sink: GainNode | null = null;
  let lastLevel = 0;
  let stopped = false;
  let timers: number[] = [];

  function onSamples(ch: Float32Array, onAutoStop: () => void, startedAt: number) {
    chunks.push(ch);
    let e = 0;
    for (let i = 0; i < ch.length; i++) e += ch[i]! * ch[i]!;
    const rms = Math.sqrt(e / ch.length);
    lastLevel = Math.min(1, rms * 8);
    vad(rms, onAutoStop, startedAt);
  }

  // Voice activity: once speech has been heard, stop after ~0.9 s of quiet.
  let noise = 0.003;
  let heard = false;
  let quietSince = 0;
  function vad(rms: number, onAutoStop: () => void, startedAt: number) {
    const now = performance.now();
    if (now - startedAt < 250) noise = Math.max(noise, rms * 1.2);
    const speaking = rms > Math.max(0.012, noise * 3);
    if (speaking) {
      heard = true;
      quietSince = 0;
    } else if (heard) {
      if (!quietSince) quietSince = now;
      else if (now - quietSince > 900 && !stopped) onAutoStop();
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

  return {
    async start({ onAutoStop, maxMs = 6000 }) {
      if (!micSupported()) throw (window.isSecureContext ? "unsupported" : "insecure") as MicError;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
        });
      } catch (e) {
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
      await ctx.resume();
      src = ctx.createMediaStreamSource(stream);
      sink = ctx.createGain();
      sink.gain.value = 0;
      const startedAt = performance.now();
      let usedWorklet = false;
      if (ctx.audioWorklet && typeof AudioWorkletNode !== "undefined") {
        try {
          const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
          await ctx.audioWorklet.addModule(url);
          URL.revokeObjectURL(url);
          const w = new AudioWorkletNode(ctx, "baan-tap");
          w.port.onmessage = (ev: MessageEvent<Float32Array>) => onSamples(ev.data, onAutoStop, startedAt);
          node = w;
          usedWorklet = true;
        } catch {
          usedWorklet = false;
        }
      }
      if (!usedWorklet) {
        const sp = ctx.createScriptProcessor(2048, 1, 1);
        sp.onaudioprocess = (ev) => onSamples(new Float32Array(ev.inputBuffer.getChannelData(0)), onAutoStop, startedAt);
        node = sp;
      }
      src.connect(node!);
      node!.connect(sink);
      sink.connect(ctx.destination);
      timers.push(window.setTimeout(() => !stopped && onAutoStop(), maxMs));
    },
    async stop() {
      stopped = true;
      const rate = ctx.sampleRate;
      // let the last worklet messages arrive
      await new Promise((r) => window.setTimeout(r, 60));
      teardown();
      const len = chunks.reduce((s, c) => s + c.length, 0);
      const samples = new Float32Array(len);
      let o = 0;
      for (const c of chunks) {
        samples.set(c, o);
        o += c.length;
      }
      return { samples, rate };
    },
    level: () => lastLevel,
    cancel() {
      stopped = true;
      teardown();
    },
  };
}

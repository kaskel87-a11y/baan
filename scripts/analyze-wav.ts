// Debug: run the pitch pipeline on a WAV and print frames/segments. tsx scripts/analyze-wav.ts file.wav syllables
import { readFileSync } from "node:fs";
import { analyze, describe, classify, movement } from "../src/lib/pitch";
export function readWav(p: string) {
  const b = readFileSync(p);
  let o = 12, rate = 48000, data: Buffer | null = null, bits = 16;
  while (o < b.length) {
    const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4);
    if (id === "fmt ") { rate = b.readUInt32LE(o + 12); bits = b.readUInt16LE(o + 22); }
    if (id === "data") data = b.subarray(o + 8, o + 8 + sz);
    o += 8 + sz + (sz & 1);
  }
  const n = data!.length / 2, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = data!.readInt16LE(i * 2) / 32768;
  return { x, rate, bits };
}
if (process.argv[2]) {
  const { x, rate } = readWav(process.argv[2]);
  const n = Number(process.argv[3] ?? 1);
  const a = analyze(x, rate, n);
  console.log("ok", a.ok, a.reason, "voicedMs", a.voicedMs, "median", a.medianHz?.toFixed(0));
  const v = a.frames.map((f, i) => (f.f0 ? `${i}:${f.f0.toFixed(0)}` : null)).filter(Boolean);
  console.log("voiced frames:", v.join(" "));
  for (const sg of a.segments) {
    const s = describe(a.frames, sg, a.refHz);
    console.log("seg", sg, s ? `${classify(s, false)} ${movement(s)} st=[${s.st.map((q) => q.toFixed(1)).join(",")}]` : "null");
  }
}

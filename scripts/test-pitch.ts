// Unit test for the pitch tracker + tone classifier on synthetic voices. `npm run test:pitch`
import { analyze, classify, describe, movement } from "../src/lib/pitch";

const RATE = 48000;

/** Glottal-ish buzz: sum of harmonics with 1/k rolloff, F0 following `f0(t)` (t in 0..1), plus noise. */
function voice(f0: (t: number) => number, dur = 0.55, opts: { noise?: number; pad?: number } = {}) {
  const pad = opts.pad ?? 0.25;
  const n = Math.round((dur + 2 * pad) * RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE - pad;
    let s = 0;
    if (t >= 0 && t < dur) {
      const u = t / dur;
      phase += (2 * Math.PI * f0(u)) / RATE;
      const env = Math.min(1, u * 12, (1 - u) * 12);
      for (let k = 1; k <= 12; k++) s += Math.sin(k * phase) / k;
      s *= 0.25 * env;
    }
    out[i] = s + (Math.random() * 2 - 1) * (opts.noise ?? 0.003);
  }
  return out;
}

const lerp = (a: number, b: number) => (u: number) => a + (b - a) * u;
const cases: { name: string; f0: (u: number) => number; expect: string[]; base?: number }[] = [
  { name: "falling 230→130 Hz", f0: (u) => (u < 0.25 ? 220 + 40 * u : 230 - 130 * ((u - 0.25) / 0.75)), expect: ["falling"] },
  { name: "rising (dip then climb) 150→130→220", f0: (u) => (u < 0.35 ? 150 - 57 * u : 130 + 90 * ((u - 0.35) / 0.65)), expect: ["rising"] },
  { name: "level 160 Hz, no baseline", f0: () => 160, expect: ["level"] },
  { name: "level 160 Hz, baseline 160 → mid", f0: () => 160, expect: ["mid"], base: 160 },
  { name: "level 125 Hz, baseline 160 → low", f0: () => 125, expect: ["low"], base: 160 },
  { name: "level 200 Hz, baseline 160 → high", f0: () => 200, expect: ["high"], base: 160 },
  { name: "male falling 150→85 Hz", f0: lerp(150, 85), expect: ["falling"] },
  { name: "female rising 200→300 Hz", f0: (u) => (u < 0.3 ? 200 - 30 * u : 191 + 109 * ((u - 0.3) / 0.7)), expect: ["rising"] },
  { name: "short 0.25 s falling", f0: lerp(220, 150), expect: ["falling"] },
];

let fail = 0;
for (const c of cases) {
  const a = analyze(voice(c.f0, c.name.startsWith("short") ? 0.25 : 0.55), RATE, 1, c.base);
  const s = a.ok && a.segments[0] ? describe(a.frames, a.segments[0], a.refHz) : null;
  const got = s ? classify(s, !!c.base) : `no analysis (${a.reason})`;
  const ok = c.expect.includes(got as string);
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${c.name}: ${got}${s ? ` (${movement(s)}, slope ${s.slope.toFixed(1)} st, mean ${s.mean.toFixed(1)}, median ${a.medianHz.toFixed(0)} Hz)` : ""}`);
}

// Two syllables: falling then rising (e.g. "ข้าว ขาว"), with a short gap
{
  const a1 = voice((u) => 230 - 110 * u, 0.4, { pad: 0.2 });
  const a2 = voice((u) => (u < 0.3 ? 140 - 30 * u : 131 + 100 * ((u - 0.3) / 0.7)), 0.45, { pad: 0.2 });
  const both = new Float32Array(a1.length + a2.length);
  both.set(a1);
  both.set(a2, a1.length);
  const a = analyze(both, RATE, 2);
  const tones = a.segments.map((sg) => {
    const s = describe(a.frames, sg, a.refHz);
    return s ? classify(s, false) : "?";
  });
  const ok = tones.join(",") === "falling,rising";
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} two syllables falling+rising: ${tones.join(", ")}`);
}

// Quiet phone mic: same falling voice at -46 dB with a loud click at the start; very short word (0.15 s)
{
  const v = voice((u) => 230 - 110 * u, 0.5).map((x) => x * 0.005);
  v[200] = 0.9; // click
  const a = analyze(v, RATE, 1);
  const s = a.ok && a.segments[0] ? describe(a.frames, a.segments[0], a.refHz) : null;
  const got = s ? classify(s, false) : `no analysis (${a.reason})`;
  const ok = got === "falling";
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} quiet mic (peak 0.005) + click: ${got}`);
  const b = analyze(voice((u) => 140 + 90 * u, 0.15), RATE, 1);
  const s2 = b.ok && b.segments[0] ? describe(b.frames, b.segments[0], b.refHz) : null;
  const got2 = s2 ? classify(s2, false) : `no analysis (${b.reason})`;
  const ok2 = got2 === "rising";
  if (!ok2) fail++;
  console.log(`${ok2 ? "✓" : "✗"} very short 0.15 s rising word: ${got2}`);
}

// Silence → no-voice
{
  const a = analyze(new Float32Array(RATE).map(() => (Math.random() * 2 - 1) * 0.001), RATE, 1);
  const ok = !a.ok;
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} silence reports no voice: ${a.reason}`);
}

console.log(fail ? `${fail} failed` : "pitch OK");
process.exit(fail ? 1 : 0);

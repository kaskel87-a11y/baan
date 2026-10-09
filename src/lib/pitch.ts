/**
 * Pitch (F0) tracking and Thai tone classification, all in the browser.
 * Pure functions: no DOM, so they run in tests under Node too.
 */
import type { Tone } from "../data/types";

export const TARGET_RATE = 16000;
const HOP = 0.01; // 10 ms frames
const WIN = 0.04; // 40 ms analysis window
const FMIN = 75;
const FMAX = 400;

/** Box-filter + linear-interpolation resample to 16 kHz (enough for 75–400 Hz F0). */
export function resample(input: Float32Array, rate: number, target = TARGET_RATE): Float32Array {
  if (rate === target) return input;
  const ratio = rate / target;
  const out = new Float32Array(Math.floor(input.length / ratio));
  const half = Math.max(1, Math.floor(ratio / 2));
  for (let i = 0; i < out.length; i++) {
    const c = i * ratio;
    const lo = Math.max(0, Math.floor(c) - half);
    const hi = Math.min(input.length - 1, Math.floor(c) + half);
    let s = 0;
    for (let j = lo; j <= hi; j++) s += input[j]!;
    out[i] = s / (hi - lo + 1);
  }
  return out;
}

export interface Frame {
  t: number; // seconds
  rms: number;
  f0: number | null; // Hz, null when unvoiced
}

/** YIN pitch tracker (de Cheveigné & Kawahara 2002), 10 ms hop. */
export function trackPitch(x: Float32Array, rate = TARGET_RATE): Frame[] {
  const win = Math.round(WIN * rate);
  const hop = Math.round(HOP * rate);
  const tauMin = Math.floor(rate / FMAX);
  const tauMax = Math.ceil(rate / FMIN);
  const d = new Float32Array(tauMax + 1);
  const frames: Frame[] = [];
  // Energy gate relative to the loud part of the recording (90th-percentile frame level), not the single
  // loudest sample, so a click or tap on a quiet phone mic doesn't silence the voice.
  const levels: number[] = [];
  for (let start = 0; start + win + tauMax < x.length; start += hop) {
    let e = 0;
    for (let j = 0; j < win; j++) e += x[start + j]! * x[start + j]!;
    levels.push(Math.sqrt(e / win));
  }
  const sorted = [...levels].sort((a, b) => a - b);
  const loud = sorted[Math.floor(sorted.length * 0.9)] ?? 0;
  let fi = 0;
  for (let start = 0; start + win + tauMax < x.length; start += hop) {
    const rms = levels[fi++]!;
    const frame: Frame = { t: (start + win / 2) / rate, rms, f0: null };
    frames.push(frame);
    if (rms < 0.05 * loud || rms < 2e-5) continue;
    // Difference function
    for (let tau = 1; tau <= tauMax; tau++) {
      let s = 0;
      for (let j = 0; j < win; j++) {
        const diff = x[start + j]! - x[start + j + tau]!;
        s += diff * diff;
      }
      d[tau] = s;
    }
    // Cumulative mean normalized difference
    let run = 0;
    d[0] = 1;
    for (let tau = 1; tau <= tauMax; tau++) {
      run += d[tau]!;
      d[tau] = run === 0 ? 1 : (d[tau]! * tau) / run;
    }
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (d[t]! < 0.2) {
        while (t + 1 <= tauMax && d[t + 1]! < d[t]!) t++;
        tau = t;
        break;
      }
    }
    if (tau < 0) {
      // fall back to the global minimum if it is reasonably periodic
      let best = tauMin;
      for (let t = tauMin; t <= tauMax; t++) if (d[t]! < d[best]!) best = t;
      if (d[best]! < 0.35) tau = best;
    }
    if (tau < 0) continue;
    // Parabolic interpolation
    const a = d[tau - 1] ?? d[tau]!;
    const b = d[tau]!;
    const c = d[tau + 1] ?? d[tau]!;
    const denom = a - 2 * b + c;
    const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
    const f0 = rate / (tau + Math.max(-1, Math.min(1, shift)));
    if (f0 >= FMIN && f0 <= FMAX) frame.f0 = f0;
  }
  return frames;
}

export const toSemitones = (hz: number, refHz: number) => 12 * Math.log2(hz / refHz);

function median(v: number[]) {
  if (!v.length) return NaN;
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

/** Remove octave errors and isolated blips; returns cleaned copy. */
export function cleanContour(frames: Frame[]): Frame[] {
  const voiced = frames.filter((f) => f.f0 !== null).map((f) => f.f0!);
  const med = median(voiced);
  const out = frames.map((f) => {
    if (f.f0 === null) return { ...f };
    let f0 = f.f0;
    if (f0 > med * 1.8) f0 /= 2;
    else if (f0 < med * 0.56) f0 *= 2;
    return { ...f, f0 };
  });
  // Drop voiced runs shorter than 30 ms (clicks, breath)
  let i = 0;
  while (i < out.length) {
    if (out[i]!.f0 === null) {
      i++;
      continue;
    }
    let j = i;
    while (j < out.length && out[j]!.f0 !== null) j++;
    if (j - i < 3) for (let k = i; k < j; k++) out[k]!.f0 = null;
    i = j;
  }
  // 5-point median smoothing inside voiced runs
  const sm = out.map((f) => ({ ...f }));
  for (let k = 0; k < out.length; k++) {
    if (out[k]!.f0 === null) continue;
    const w: number[] = [];
    for (let m = k - 2; m <= k + 2; m++) if (out[m]?.f0 != null) w.push(out[m]!.f0!);
    sm[k]!.f0 = median(w);
  }
  return sm;
}

export interface Segment {
  start: number; // frame index (inclusive)
  end: number; // frame index (exclusive)
}

/**
 * Split the voiced part into `n` syllables: use unvoiced gaps first,
 * merge the closest neighbours if there are too many, split the longest if too few.
 */
export function segmentSyllables(frames: Frame[], n: number): Segment[] {
  const runs: Segment[] = [];
  let i = 0;
  while (i < frames.length) {
    if (frames[i]!.f0 === null) {
      i++;
      continue;
    }
    let j = i;
    while (j < frames.length && frames[j]!.f0 !== null) j++;
    runs.push({ start: i, end: j });
    i = j;
  }
  if (!runs.length || n < 1) return [];
  // Drop leading/trailing tiny runs that are far from the rest (noise)
  while (runs.length > n) {
    // merge the pair with the smallest gap
    let bi = 0;
    let bg = Infinity;
    for (let k = 0; k < runs.length - 1; k++) {
      const g = runs[k + 1]!.start - runs[k]!.end;
      if (g < bg) {
        bg = g;
        bi = k;
      }
    }
    runs.splice(bi, 2, { start: runs[bi]!.start, end: runs[bi + 1]!.end });
  }
  while (runs.length < n) {
    let li = 0;
    for (let k = 1; k < runs.length; k++) if (runs[k]!.end - runs[k]!.start > runs[li]!.end - runs[li]!.start) li = k;
    const r = runs[li]!;
    const mid = Math.round((r.start + r.end) / 2);
    if (mid - r.start < 2) break;
    runs.splice(li, 1, { start: r.start, end: mid }, { start: mid, end: r.end });
  }
  return runs;
}

export interface SyllableShape {
  /** semitones relative to the reference, sampled per voiced frame */
  st: number[];
  start: number;
  end: number;
  mean: number;
  min: number;
  max: number;
  slope: number; // end - start (st)
  durMs: number;
}

export function describe(frames: Frame[], seg: Segment, refHz: number): SyllableShape | null {
  const st = frames
    .slice(seg.start, seg.end)
    .filter((f) => f.f0 !== null)
    .map((f) => toSemitones(f.f0!, refHz));
  if (st.length < 3) return null;
  const q = Math.max(1, Math.floor(st.length / 4));
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const start = avg(st.slice(0, q));
  const end = avg(st.slice(-q));
  return {
    st,
    start,
    end,
    mean: avg(st),
    min: Math.min(...st),
    max: Math.max(...st),
    slope: end - start,
    durMs: st.length * HOP * 1000,
  };
}

export type Movement = "rose" | "fell" | "flat" | "rise-fall" | "dip-rise";

export function movement(s: SyllableShape): Movement {
  const range = s.max - s.min;
  const peakIdx = s.st.indexOf(s.max);
  const troughIdx = s.st.indexOf(s.min);
  const n = s.st.length;
  if (s.slope <= -1.8) return s.max - s.start > 1.5 && peakIdx > n * 0.15 && peakIdx < n * 0.6 ? "rise-fall" : "fell";
  if (s.slope >= 1.8) return s.start - s.min > 1.0 && troughIdx > n * 0.1 && troughIdx < n * 0.6 ? "dip-rise" : "rose";
  if (range < 2.5) return "flat";
  // big excursion in the middle but ends near the start
  return peakIdx > troughIdx ? "rise-fall" : "dip-rise";
}

/**
 * Classify one syllable. `levelKnown` = we have a calibrated speaker baseline,
 * so absolute height (mid/low/high) is meaningful; otherwise only shapes are judged.
 */
export function classify(s: SyllableShape, levelKnown: boolean): Tone | "level" {
  const m = movement(s);
  if (m === "fell" || m === "rise-fall") return s.start < -2 && levelKnown && m === "fell" && s.slope > -3.5 ? "low" : "falling";
  if (m === "rose" || m === "dip-rise") return levelKnown && s.start > 1.5 ? "high" : "rising";
  if (!levelKnown) return "level";
  if (s.mean >= 1.5) return "high";
  if (s.mean <= -1.5) return "low";
  return "mid";
}

/** Do the observed and target tones agree? Level tones can only be checked by shape without a baseline. */
export function tonesMatch(heard: Tone | "level", target: Tone): boolean {
  if (heard === target) return true;
  if (heard === "level") return target === "mid" || target === "low" || target === "high";
  // modern Bangkok high tone often rises a little: accept a rise for "high"
  if (target === "high" && heard === "rising") return false;
  return false;
}

export const TONE_ADVICE: Record<Tone, string> = {
  mid: "should stay level in your normal voice",
  low: "should stay low and level, below your normal voice",
  falling: "should fall: start high and drop",
  high: "should stay high, with only a small dip at the very end",
  rising: "should rise: start low, dip a little, then climb",
};

export function describeMovement(s: SyllableShape, levelKnown: boolean): string {
  const m = movement(s);
  const height = !levelKnown ? "" : s.mean >= 1.5 ? " and high" : s.mean <= -1.5 ? " and low" : " in your normal range";
  switch (m) {
    case "fell":
      return `Yours fell by about ${Math.round(-s.slope)} semitones`;
    case "rose":
      return `Yours rose by about ${Math.round(s.slope)} semitones`;
    case "rise-fall":
      return "Yours went up, then down";
    case "dip-rise":
      return "Yours dipped, then rose";
    default:
      return `Yours stayed flat${height}`;
  }
}

export interface Analysis {
  ok: boolean;
  reason?: "no-voice" | "too-short";
  voicedMs: number;
  frames: Frame[];
  segments: Segment[];
  refHz: number;
  medianHz: number;
}

/** Full pipeline: raw samples → cleaned pitch track → n syllable segments. */
export function analyze(samples: Float32Array, rate: number, syllables: number, baselineHz?: number): Analysis {
  const x = resample(normalize(samples), rate);
  const frames = cleanContour(trackPitch(x));
  const voiced = frames.filter((f) => f.f0 !== null);
  const medianHz = median(voiced.map((f) => f.f0!));
  const voicedMs = voiced.length * HOP * 1000;
  const refHz = baselineHz && baselineHz > 0 ? baselineHz : medianHz;
  if (voiced.length < 4) return { ok: false, reason: voiced.length ? "too-short" : "no-voice", voicedMs, frames, segments: [], refHz, medianHz };
  return { ok: true, voicedMs, frames, segments: segmentSyllables(frames, syllables), refHz, medianHz };
}

/** Remove DC offset and scale so the loudest part peaks near 0.5 (quiet phone mics, iOS gain differences). */
export function normalize(x: Float32Array): Float32Array {
  let mean = 0;
  for (let i = 0; i < x.length; i++) mean += x[i]!;
  mean /= x.length || 1;
  let peak = 0;
  for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]! - mean));
  const g = peak > 1e-6 ? 0.5 / peak : 1;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = (x[i]! - mean) * g;
  return out;
}

/** Peak and RMS of a raw recording, before any normalization. */
export function levelStats(x: Float32Array) {
  let peak = 0;
  let e = 0;
  for (let i = 0; i < x.length; i++) {
    const v = Math.abs(x[i]!);
    if (v > peak) peak = v;
    e += v * v;
  }
  return { peak, rms: Math.sqrt(e / (x.length || 1)) };
}

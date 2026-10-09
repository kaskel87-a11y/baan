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

const pct = (v: number[], q: number) => {
  if (!v.length) return 0;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * q))]!;
};

/**
 * YIN pitch tracker (de Cheveigné & Kawahara 2002), 10 ms hop.
 * A frame is only analysed if it is clearly louder than the background: above 12% of the loud part
 * (90th percentile) and above 3× the noise floor (20th percentile). That keeps steady background hum
 * (fans, fridges, mains) from being read as a perfectly flat "voice".
 */
export function trackPitch(x: Float32Array, rate = TARGET_RATE): Frame[] {
  const win = Math.round(WIN * rate);
  const hop = Math.round(HOP * rate);
  const tauMin = Math.floor(rate / FMAX);
  const tauMax = Math.ceil(rate / FMIN);
  const d = new Float32Array(tauMax + 1);
  const frames: Frame[] = [];
  const levels: number[] = [];
  for (let start = 0; start + win + tauMax < x.length; start += hop) {
    let e = 0;
    for (let j = 0; j < win; j++) e += x[start + j]! * x[start + j]!;
    levels.push(Math.sqrt(e / win));
  }
  const loud = pct(levels, 0.9);
  const floor = pct(levels, 0.2);
  const gate = Math.max(0.12 * loud, 3 * floor, 2e-5);
  let fi = 0;
  for (let start = 0; start + win + tauMax < x.length; start += hop) {
    const rms = levels[fi++]!;
    const frame: Frame = { t: (start + win / 2) / rate, rms, f0: null };
    frames.push(frame);
    if (rms < gate) continue;
    for (let tau = 1; tau <= tauMax; tau++) {
      let s2 = 0;
      for (let j = 0; j < win; j++) {
        const diff = x[start + j]! - x[start + j + tau]!;
        s2 += diff * diff;
      }
      d[tau] = s2;
    }
    let run = 0;
    d[0] = 1;
    for (let tau = 1; tau <= tauMax; tau++) {
      run += d[tau]!;
      d[tau] = run === 0 ? 1 : (d[tau]! * tau) / run;
    }
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (d[t]! < 0.15) {
        while (t + 1 <= tauMax && d[t + 1]! < d[t]!) t++;
        tau = t;
        break;
      }
    }
    if (tau < 0 && rms > 0.3 * loud) {
      // loud but a bit noisy (phone mic): accept the global minimum if it is still clearly periodic
      let best = tauMin;
      for (let t = tauMin; t <= tauMax; t++) if (d[t]! < d[best]!) best = t;
      if (d[best]! < 0.25) tau = best;
    }
    if (tau < 0) continue;
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

function runsOf(frames: Frame[]): { start: number; end: number }[] {
  const runs: { start: number; end: number }[] = [];
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
  return runs;
}

/**
 * Clean the raw track: fix octave errors against the overall median, drop spikes (> 4 semitones away from
 * the local median of their run), drop voiced runs shorter than 30 ms, then 5-point median smoothing.
 * Unvoiced frames stay unvoiced: nothing is filled in or held.
 */
export function cleanContour(frames: Frame[]): Frame[] {
  const med = median(frames.filter((f) => f.f0 !== null).map((f) => f.f0!));
  const out = frames.map((f) => {
    if (f.f0 === null) return { ...f };
    let f0 = f.f0;
    if (f0 > med * 1.8) f0 /= 2;
    else if (f0 < med * 0.56) f0 *= 2;
    return { ...f, f0 };
  });
  // spikes: compare each frame with the median of up to 7 neighbours in the same run
  for (const r of runsOf(out)) {
    const vals = out.slice(r.start, r.end).map((f) => f.f0!);
    const bad: number[] = [];
    for (let k = 0; k < vals.length; k++) {
      const w = vals.slice(Math.max(0, k - 3), k + 4);
      if (w.length >= 3 && Math.abs(12 * Math.log2(vals[k]! / median(w))) > 4) bad.push(r.start + k);
    }
    for (const b of bad) out[b]!.f0 = null;
  }
  // frame-to-frame jumps > 5 semitones also break the run
  for (let k = 1; k < out.length; k++) {
    const a = out[k - 1]!.f0;
    const b = out[k]!.f0;
    if (a !== null && b !== null && Math.abs(12 * Math.log2(b / a)) > 5) out[k]!.f0 = null;
  }
  for (const r of runsOf(out)) if (r.end - r.start < 3) for (let k = r.start; k < r.end; k++) out[k]!.f0 = null;
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
 * Split the utterance into `n` syllables using energy and voicing, not equal time slices:
 * find the speech region, pick the `n` strongest energy peaks (vowel nuclei, ≥ 80 ms apart), and put each
 * boundary in the longest unvoiced gap between two peaks (a consonant), or at the energy dip if there is none.
 * Unvoiced consonants stay inside their syllable but are never drawn or judged.
 */
export function segmentSyllables(frames: Frame[], n: number): Segment[] {
  if (!frames.length || n < 1) return [];
  const db = frames.map((f) => 20 * Math.log10(f.rms + 1e-9));
  const sm = db.map((_, i) => {
    let s = 0;
    let c = 0;
    for (let k = i - 2; k <= i + 2; k++)
      if (k >= 0 && k < db.length) {
        s += db[k]!;
        c++;
      }
    return s / c;
  });
  const voiced = frames.map((f) => f.f0 !== null);
  const vIdx = voiced.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  if (!vIdx.length) return [];
  // speech region: from the first to the last voiced frame, widened by 60 ms for consonants
  const lo = Math.max(0, vIdx[0]! - 6);
  const hi = Math.min(frames.length, vIdx[vIdx.length - 1]! + 7);
  if (n === 1) return [{ start: lo, end: hi }];
  // candidate peaks: local maxima of smoothed energy on voiced frames
  const cands: number[] = [];
  for (let i = lo; i < hi; i++) if (voiced[i] && sm[i]! >= (sm[i - 1] ?? -Infinity) && sm[i]! >= (sm[i + 1] ?? -Infinity)) cands.push(i);
  cands.sort((a, b) => sm[b]! - sm[a]!);
  const peaks: number[] = [];
  for (const c of cands) {
    if (peaks.every((p) => Math.abs(p - c) >= 8)) peaks.push(c);
    if (peaks.length === n) break;
  }
  if (peaks.length < n) {
    // not enough distinct nuclei: equal split of the speech region (best effort)
    const len = (hi - lo) / n;
    return Array.from({ length: n }, (_, i) => ({ start: Math.round(lo + i * len), end: Math.round(lo + (i + 1) * len) }));
  }
  peaks.sort((a, b) => a - b);
  const bounds: number[] = [];
  for (let k = 0; k < n - 1; k++) {
    const a = peaks[k]!;
    const b = peaks[k + 1]!;
    // longest unvoiced gap between the two peaks
    let best = -1;
    let bestLen = 0;
    let i = a;
    while (i < b) {
      if (voiced[i]) {
        i++;
        continue;
      }
      let j = i;
      while (j < b && !voiced[j]) j++;
      if (j - i > bestLen) {
        bestLen = j - i;
        best = Math.floor((i + j) / 2);
      }
      i = j;
    }
    if (best < 0) {
      // no gap: deepest energy dip between the peaks
      best = a + 1;
      for (let m = a + 1; m < b; m++) if (sm[m]! < sm[best]!) best = m;
    }
    bounds.push(best);
  }
  const edges = [lo, ...bounds, hi];
  return Array.from({ length: n }, (_, i) => ({ start: edges[i]!, end: edges[i + 1]! }));
}

export interface SyllableShape {
  /** semitones relative to the reference, one per voiced frame */
  st: number[];
  /** position of each voiced frame inside the syllable, 0..1 (gaps stay gaps when drawn) */
  pos: number[];
  start: number;
  end: number;
  mid: number;
  mean: number;
  min: number;
  max: number;
  bodyRange: number;
  slope: number; // end - start (st)
  durMs: number;
  voicedFrac: number;
}

/** Minimum voiced frames (10 ms each) before a syllable's pitch is judged. */
export const MIN_VOICED_FRAMES = 5;

/**
 * Pitch shape of one syllable. Start = 10–30% of the voiced part, end = 75–95%, so consonant transitions
 * don't decide the tone; `midChange` (35–60% minus start) tells an early, deliberate fall (falling tone)
 * from the gentle drop at the end of any utterance.
 */
export function describe(frames: Frame[], seg: Segment, refHz: number): SyllableShape | null {
  const st: number[] = [];
  const pos: number[] = [];
  const span = Math.max(1, seg.end - seg.start - 1);
  for (let k = seg.start; k < seg.end; k++) {
    const f = frames[k];
    if (f?.f0 == null) continue;
    st.push(toSemitones(f.f0, refHz));
    pos.push((k - seg.start) / span);
  }
  if (st.length < MIN_VOICED_FRAMES) return null;
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const part = (a: number, b: number) => {
    const i0 = Math.min(st.length - 1, Math.floor(st.length * a));
    const i1 = Math.max(i0 + 1, Math.ceil(st.length * b));
    return avg(st.slice(i0, i1));
  };
  const start = part(0.1, 0.3);
  const end = part(0.75, 0.95);
  const body = st.slice(Math.floor(st.length * 0.1), Math.max(Math.floor(st.length * 0.1) + 1, Math.ceil(st.length * 0.75)));
  const core = st.slice(Math.floor(st.length * 0.1), Math.max(Math.floor(st.length * 0.1) + 1, Math.ceil(st.length * 0.95)));
  return {
    st,
    pos,
    start,
    end,
    mid: part(0.35, 0.6),
    mean: avg(st),
    min: Math.min(...core),
    max: Math.max(...core),
    bodyRange: Math.max(...body) - Math.min(...body),
    slope: end - start,
    durMs: st.length * HOP * 1000,
    voicedFrac: st.length / Math.max(1, seg.end - seg.start),
  };
}

export type Movement = "rose" | "fell" | "flat" | "rise-fall" | "dip-rise";

export function movement(s: SyllableShape): Movement {
  const midChange = s.mid - s.start;
  if (s.max - s.start > 1.5 && s.max - s.end > 2.5 && s.max > s.mid - 0.01 && s.slope < 0) return "rise-fall";
  if (s.slope <= -4 || (s.slope <= -2 && midChange <= -1)) return "fell";
  if (s.start - s.min > 1 && s.end - s.min > 2.5 && s.slope >= 1) return "dip-rise";
  if (s.slope >= 2) return "rose";
  if (s.bodyRange < 3) return "flat";
  return s.slope < 0 ? "fell" : "rose";
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

/**
 * Do the observed and target tones agree? Level tones can only be checked by shape without a baseline.
 * Lenient where real Thai speech is:
 *  - low: a short dead syllable (phàt, phèt) often sags, and a word at the end of a phrase drops;
 *    a fall that doesn't start high still counts as low.
 *  - high: modern Bangkok high tone often rises at the end; a rise without a dip still counts as high.
 */
export function tonesMatch(heard: Tone | "level", target: Tone, s?: SyllableShape, dead = false): boolean {
  if (heard === target) return true;
  if (heard === "level") return target === "mid" || target === "low" || target === "high";
  if (target === "low" && heard === "falling" && s && s.start < 0.5 && (dead || s.slope > -6)) return true;
  if (target === "low" && heard === "mid" && dead) return true;
  if (target === "high" && heard === "rising" && s && movement(s) === "rose") return true;
  return false;
}

/** Dead syllable: ends in a stop (p/t/k) — short, little voicing. */
export const isDead = (roman: string) => /[ptk]$/i.test(roman.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

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
  if (voiced.length < MIN_VOICED_FRAMES) return { ok: false, reason: voiced.length ? "too-short" : "no-voice", voicedMs, frames, segments: [], refHz, medianHz };
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

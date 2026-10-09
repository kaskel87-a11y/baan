import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { Tone } from "../data/types";
import { gloss } from "../data/glossary";
import { stopSpeech } from "../lib/audio";
import { recognitionCtor, type Recognition } from "../lib/speech";
import { matchSpoken, TONE_LABEL, toneFromRoman, type Verdict } from "../lib/thai";
import { createCapture, micSupported, type Capture, type MicError } from "../lib/recorder";
import { analyze, classify, describe, describeMovement, tonesMatch, TONE_ADVICE, type Analysis, type SyllableShape } from "../lib/pitch";
import { getState, pitchBaseline, recordPitchMedian } from "../lib/store";
import { AnswerLine, TONE_PATH } from "./ui";

/* ------------------------------------------------------------------ word check (speech recognition) */

type WordState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "heard"; verdict: Verdict; heard: string }
  | { kind: "message"; text: string };

const IS_IOS = typeof navigator !== "undefined" && /iP(hone|ad|od)/.test(navigator.userAgent + (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent) ? " iPad" : ""));

export const WORD_MSG = {
  unsupported: "Your browser can't check Thai words, but the tone check below still works.",
  noResult: "The word check didn't hear any words. Tap Say it and speak right away, a little louder.",
  noSpeech: "I didn't hear anything. Tap Say it and speak right away.",
  denied: IS_IOS
    ? "The word check isn't allowed. On iPhone, turn on Settings > General > Keyboard > Enable Dictation, and allow the microphone for this site. The tone check below still works."
    : "The word check isn't allowed to use the microphone. Allow it for this site and try again. The tone check below still works.",
  network: "The word check couldn't reach the speech service (it needs an internet connection). The tone check below still works offline.",
  language: "Your browser can't recognize Thai speech. The tone check below still works.",
  audio: "The word check couldn't open the microphone. The tone check below still works if the mic is free.",
  timeout: "The word check didn't answer in time. The tone check below still works.",
  failed: "The word check couldn't start. The tone check below still works.",
} as const;

function errorText(code: string): string {
  switch (code) {
    case "no-speech":
      return WORD_MSG.noSpeech;
    case "not-allowed":
    case "service-not-allowed":
      return WORD_MSG.denied;
    case "network":
      return WORD_MSG.network;
    case "language-not-supported":
    case "bad-grammar":
      return WORD_MSG.language;
    case "audio-capture":
      return WORD_MSG.audio;
    default:
      return `The word check stopped (${code || "unknown error"}). The tone check below still works.`;
  }
}

/** Romanization + English for what the recognizer heard, when we can match it. */
function describeHeard(heard: string, target: string, roman?: string, en?: string): { roman?: string; en?: string } {
  const clean = heard.replace(/[\s.,!?]/g, "");
  if (clean && clean === target.replace(/[\s.,!?…]/g, "")) return { roman, en };
  const g = gloss(heard.trim()) ?? gloss(clean);
  if (g) return { roman: g.roman, en: g.en };
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("th", { granularity: "word" });
    const parts = [...seg.segment(clean)].filter((p) => p.isWordLike).map((p) => gloss(p.segment));
    if (parts.length && parts.every(Boolean)) return { roman: parts.map((p) => p!.roman).join(" "), en: parts.map((p) => p!.en).join(" + ") };
  }
  return {};
}

/* ------------------------------------------------------------------ tone check (pitch) */

interface TargetSyllable {
  roman: string;
  tone: Tone;
  en?: string;
}

/** Target syllables from the romanization ("khâo man gài" → 3 syllables), skipping the learner's name. */
export function targetSyllables(thai: string, roman: string | undefined, en: string | undefined, skip: string[] = []): TargetSyllable[] {
  if (!roman) return [];
  const skipSet = new Set(skip.flatMap((s) => s.toLowerCase().split(/[\s-]+/)).filter(Boolean));
  const tokens = roman
    .replace(/[.,!?…"“”()]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
  // English per syllable: segment the Thai into known words and spread each word's meaning over its syllables.
  const meanings: (string | undefined)[] = [];
  if (tokens.length === 1) meanings.push(en);
  else if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("th", { granularity: "word" });
    for (const p of seg.segment(thai.replace(/[\s.,!?…]/g, ""))) {
      if (!p.isWordLike) continue;
      const g = gloss(p.segment);
      if (!g) {
        meanings.length = 0;
        break;
      }
      for (const _ of g.roman.split(/[\s-]+/).filter(Boolean)) meanings.push(g.en);
    }
    if (meanings.length !== tokens.length) meanings.length = 0;
  }
  return tokens.flatMap((t, i) => (skipSet.has(t.toLowerCase()) ? [] : [{ roman: t, tone: toneFromRoman(t), en: meanings[i] }]));
}

const MAX_SYLLABLES = 8;

interface ToneResult {
  analysis: Analysis;
  shapes: (SyllableShape | null)[];
  levelKnown: boolean;
}

type ToneState = { kind: "idle" } | { kind: "message"; text: string } | { kind: "result"; result: ToneResult };

const MIC_MSG: Record<MicError, string> = {
  unsupported: "This browser can't record audio here, so the tone check is off. The word check still runs if your browser has it.",
  insecure: "The microphone only works on a secure (https) page.",
  denied: IS_IOS
    ? "The microphone is blocked. On iPhone: tap aA in Safari's address bar > Website Settings > Microphone > Allow, then tap Say it again."
    : "The microphone is blocked. Allow it for this site (the icon in the address bar), then tap Say it again.",
  "no-device": "No microphone was found. Plug one in or use your phone, then try again.",
  busy: "The microphone is busy in another app. Close it, then try again.",
  unknown: "The microphone couldn't start. Try again.",
};

/* ------------------------------------------------------------------ component */

/**
 * "Say it": one tap records you once and runs two checks side by side.
 *  1. Word check: browser speech recognition (th-TH), when the browser has it.
 *  2. Tone check: your pitch curve per syllable against the target tone shapes, computed on the phone.
 * One fixed-size button toggles Say it ⇄ Stop; the chart and result area have reserved space, so nothing moves.
 * Every outcome ends with an English message. `hideTarget` keeps the Thai/romanization hidden (Review, From English).
 */
export function SayIt({
  target,
  roman,
  en,
  hideTarget = false,
  skip,
}: {
  target: string;
  roman?: string;
  en?: string;
  hideTarget?: boolean;
  /** romanized tokens to ignore in the tone check (the learner's name) */
  skip?: string[];
}) {
  const [phase, setPhase] = useState<"idle" | "starting" | "live" | "analyzing">("idle");
  const [word, setWord] = useState<WordState>({ kind: "idle" });
  const [tone, setTone] = useState<ToneState>({ kind: "idle" });
  const rec = useRef<Recognition | null>(null);
  const cap = useRef<Capture | null>(null);
  const run = useRef(0);
  const finishing = useRef(false);
  const wordTimer = useRef<number | undefined>(undefined);
  const [level, setLevel] = useState(0);

  const syllables = targetSyllables(target, roman, en, skip);
  const recognizer = recognitionCtor();
  const mic = micSupported();

  function reset() {
    run.current++;
    rec.current?.abort();
    rec.current = null;
    cap.current?.cancel();
    cap.current = null;
    window.clearTimeout(wordTimer.current);
  }

  useEffect(() => {
    setPhase("idle");
    setWord({ kind: "idle" });
    setTone({ kind: "idle" });
    return reset;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // input meter while recording
  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => setLevel(cap.current?.level() ?? 0), 80);
    return () => window.clearInterval(id);
  }, [phase]);

  /** Everything here runs synchronously inside the tap, which iOS requires for mic + recognition. */
  function start() {
    reset();
    const id = run.current;
    finishing.current = false;
    stopSpeech();
    setTone({ kind: "idle" });
    setLevel(0);

    // 1. word check
    if (!recognizer) setWord({ kind: "message", text: WORD_MSG.unsupported });
    else {
      let gotResult = false;
      let gotError = false;
      try {
        const r = new recognizer();
        r.lang = "th-TH";
        r.interimResults = false;
        r.maxAlternatives = 5;
        r.continuous = false;
        r.onresult = (e) => {
          if (id !== run.current) return;
          const alts = Array.from(e.results[0] ?? []).map((a) => a.transcript).filter((t) => t.trim());
          if (!alts.length) return;
          gotResult = true;
          const rank = { yes: 2, close: 1, no: 0 } as const;
          let best: { v: Verdict; t: string } = { v: "no", t: alts[0]! };
          for (const t of alts) {
            const v = matchSpoken(t, target);
            if (rank[v] > rank[best.v]) best = { v, t };
          }
          window.clearTimeout(wordTimer.current);
          setWord({ kind: "heard", verdict: best.v, heard: best.t });
        };
        r.onerror = (e) => {
          if (id !== run.current || gotResult) return;
          if (e.error === "aborted") return; // we aborted it ourselves; onend handles the message
          gotError = true;
          window.clearTimeout(wordTimer.current);
          setWord({ kind: "message", text: errorText(e.error) });
        };
        r.onend = () => {
          if (id !== run.current) return;
          rec.current = null;
          window.clearTimeout(wordTimer.current);
          if (!cap.current && !finishing.current) setPhase((p) => (p === "live" ? "idle" : p));
          // iOS Safari often ends with neither a result nor an error: say so instead of going quiet.
          if (!gotResult && !gotError) setWord({ kind: "message", text: WORD_MSG.noResult });
        };
        rec.current = r;
        r.start();
        setWord({ kind: "pending" });
      } catch {
        rec.current = null;
        setWord({ kind: "message", text: WORD_MSG.failed });
      }
    }

    // 2. tone check (mic capture)
    if (!mic) {
      setTone({ kind: "message", text: MIC_MSG[window.isSecureContext === false ? "insecure" : "unsupported"] });
      if (!recognizer) return;
      setPhase("live");
      return;
    }
    let c: Capture;
    try {
      c = createCapture();
    } catch (e) {
      setTone({ kind: "message", text: MIC_MSG[(typeof e === "string" ? e : "unsupported") as MicError] ?? MIC_MSG.unknown });
      setPhase(recognizer ? "live" : "idle");
      return;
    }
    cap.current = c;
    setPhase("starting");
    c.start({ onAutoStop: () => id === run.current && void finish(), maxMs: Math.min(9000, 3500 + syllables.length * 600) })
      .then(() => id === run.current && setPhase((p) => (p === "starting" ? "live" : p)))
      .catch((err: MicError) => {
        if (id !== run.current) return;
        cap.current = null;
        setTone({ kind: "message", text: MIC_MSG[err] ?? MIC_MSG.unknown });
        if (!rec.current) setPhase("idle");
        else setPhase("live");
      });
  }

  async function finish() {
    if (finishing.current) return;
    finishing.current = true;
    const id = run.current;
    const r = rec.current;
    const c = cap.current;
    cap.current = null;
    setPhase("analyzing");
    // Give the recognizer a moment to return; if it never does, say so.
    if (r) {
      try {
        r.stop();
      } catch {
        /* already stopped */
      }
      wordTimer.current = window.setTimeout(() => {
        if (id !== run.current || rec.current !== r) return;
        r.abort();
        rec.current = null;
        setWord({ kind: "message", text: WORD_MSG.timeout });
      }, 5000);
    }
    if (c) {
      const { samples, rate } = await c.stop();
      if (id !== run.current) return;
      await new Promise((res) => window.setTimeout(res, 0)); // paint "Checking…" first
      setTone(toneCheck(samples, rate));
    }
    if (id === run.current) setPhase("idle");
  }

  function toneCheck(samples: Float32Array, rate: number): ToneState {
    if (samples.length < rate * 0.2) return { kind: "message", text: "The recording was too short. Tap Say it, speak, then pause; it stops by itself." };
    const n = Math.max(1, syllables.length);
    const baseline = pitchBaseline(getState());
    // Lines with 3+ syllables carry their own reference; single words need the learner's usual pitch.
    const useOwn = n >= 3;
    const analysis = analyze(samples, rate, Math.min(n, MAX_SYLLABLES), useOwn ? undefined : baseline);
    if (!analysis.ok)
      return {
        kind: "message",
        text:
          analysis.reason === "no-voice"
            ? "I didn't hear your voice. Tap Say it and speak right away, a little louder or closer to the phone."
            : "I only heard a very short sound. Say the whole word, and hold the vowel a little longer.",
      };
    recordPitchMedian(analysis.medianHz);
    const levelKnown = useOwn || baseline !== undefined;
    const shapes = n > MAX_SYLLABLES ? [] : analysis.segments.map((sg) => describe(analysis.frames, sg, analysis.refHz));
    return { kind: "result", result: { analysis, shapes, levelKnown } };
  }

  const busy = phase === "live" || phase === "starting";
  const label = phase === "starting" ? "Starting…" : busy ? "Stop" : phase === "analyzing" ? "Checking…" : "Say it";

  return (
    <div className="grid gap-2" data-sayit>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-pressed={busy}
          disabled={phase === "analyzing"}
          onClick={busy ? () => void (cap.current ? finish() : (rec.current?.stop(), setPhase("idle"))) : start}
          className={`inline-flex h-11 w-40 shrink-0 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors duration-150 ${busy ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-ink"}`}
        >
          {busy ? <Square aria-hidden="true" size={16} /> : <Mic aria-hidden="true" size={18} />}
          <span>{label}</span>
        </button>
        {/* fixed-size level meter; only its fill changes */}
        <div className="h-2 w-20 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full bg-accent transition-[width] duration-75" style={{ width: `${phase === "live" ? Math.round(level * 100) : 0}%` }} />
        </div>
      </div>

      <div className="grid gap-2 text-sm" aria-live="polite" data-sayit-result>
        <p className="h-10 overflow-hidden text-muted" data-sayit-status>
          {phase === "starting"
            ? "Opening the microphone…"
            : phase === "live"
              ? "Listening… say it in Thai now. It stops when you pause, or tap Stop."
              : phase === "analyzing"
                ? "Checking your words and tones…"
                : word.kind === "idle" && tone.kind === "idle"
                  ? "Tap Say it and speak right away. You'll get a word check and a tone check."
                  : null}
        </p>

        {/* word check: reserved block */}
        <div className="h-[7.5rem] overflow-y-auto" data-word-check>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Word check</p>
          <WordResult
            state={word.kind === "idle" && !recognizer ? { kind: "message", text: WORD_MSG.unsupported } : word}
            toneDown={tone.kind === "message" && /microphone|record audio|secure/.test(tone.text)}
            target={target}
            roman={roman}
            en={en}
            hideTarget={hideTarget}
          />
        </div>

        {/* tone check: chart always drawn at a fixed height */}
        <div data-tone-check>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Tone check</p>
          <ToneChart syllables={syllables.slice(0, MAX_SYLLABLES)} result={tone.kind === "result" ? tone.result : null} hideTarget={hideTarget} />
          <div className="mt-1 h-[9rem] overflow-y-auto" data-tone-feedback>
            <ToneFeedback state={tone} syllables={syllables} hideTarget={hideTarget} phase={phase} />
          </div>
        </div>
      </div>
    </div>
  );
}

function WordResult({
  state,
  toneDown,
  target,
  roman,
  en,
  hideTarget,
}: {
  state: WordState;
  toneDown: boolean;
  target: string;
  roman?: string;
  en?: string;
  hideTarget: boolean;
}) {
  if (state.kind === "idle") return null;
  if (state.kind === "pending") return <p className="text-muted">Listening for words…</p>;
  if (state.kind === "message") {
    // don't promise the tone check when the mic itself failed
    const text = toneDown ? state.text.replace(/,? but the tone check below still works\.?| The tone check below still works( offline| if the mic is free)?\./, ".").replace("..", ".") : state.text;
    return <p className="text-miss" data-word-message>{text}</p>;
  }
  const h = describeHeard(state.heard, target, roman, en);
  const head = state.verdict === "yes" ? "Correct. That matched." : state.verdict === "close" ? "Close, but not exact." : "Not quite.";
  return (
    <div className="grid gap-1">
      <p className={`font-medium ${state.verdict === "yes" ? "text-accent" : state.verdict === "no" ? "text-miss" : ""}`}>{head}</p>
      <p data-heard>
        <span className="text-muted">I heard: </span>
        <span lang="th" className="thai">{state.heard}</span>
        {h.roman ? <span className="text-muted"> · {h.roman}</span> : null}
        {h.en ? <span> · “{h.en}”</span> : !h.roman ? <span className="text-muted"> (not a word I know)</span> : null}
      </p>
      {hideTarget ? (
        <p className="text-muted">Tap Show to see the right answer.</p>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-1">
          <span className="text-muted">Target:</span>
          <AnswerLine thai={target} roman={roman} en={en} />
        </div>
      )}
    </div>
  );
}

/* chart geometry: viewBox 320 × 120; ±8 semitones maps onto y 8..112 */
const W = 320;
const H = 120;
const ySt = (st: number) => H / 2 - (Math.max(-8, Math.min(8, st)) / 8) * (H / 2 - 8);

function ToneChart({ syllables, result, hideTarget }: { syllables: TargetSyllable[]; result: ToneResult | null; hideTarget: boolean }) {
  const n = Math.max(1, syllables.length);
  const slot = W / n;
  const pad = Math.min(10, slot * 0.1);
  const userPaths: string[] = [];
  if (result) {
    const { analysis, shapes } = result;
    if (shapes.length) {
      shapes.forEach((s, i) => {
        if (!s || i >= n) return;
        const x0 = i * slot + pad;
        const w = slot - 2 * pad;
        userPaths.push(s.st.map((v, k) => `${k ? "L" : "M"}${(x0 + (w * k) / Math.max(1, s.st.length - 1)).toFixed(1)} ${ySt(v).toFixed(1)}`).join(" "));
      });
    } else {
      // long line: one continuous curve over the whole width
      const v = analysis.frames.filter((f) => f.f0 !== null);
      userPaths.push(v.map((f, k) => `${k ? "L" : "M"}${((W * k) / Math.max(1, v.length - 1)).toFixed(1)} ${ySt(12 * Math.log2(f.f0! / analysis.refHz)).toFixed(1)}`).join(" "));
    }
  }
  return (
    <div className="mt-1 rounded-xl border border-line bg-card p-2" data-tone-chart>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-24 w-full" role="img" aria-label="Target tone shapes and your pitch curve">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        {syllables.map((s, i) => {
          // TONE_PATH lives in a 64 × 42 box; stretch it into this syllable's slot
          const sx = (slot - 2 * pad) / 52;
          const sy = (H - 16) / 30;
          return (
            <g key={i} transform={`translate(${i * slot + pad - 6 * sx} ${8 - 8 * sy}) scale(${sx} ${sy})`}>
              <path d={TONE_PATH[s.tone]} fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
        {syllables.slice(1).map((_, i) => (
          <line key={i} x1={(i + 1) * slot} x2={(i + 1) * slot} y1="4" y2={H - 4} stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />
        ))}
        {userPaths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" data-user-curve />
        ))}
      </svg>
      <div className="flex text-[11px] leading-tight text-muted" aria-hidden="true">
        {syllables.map((s, i) => (
          <span key={i} className="min-w-0 flex-1 truncate text-center">
            {hideTarget ? TONE_LABEL[s.tone].toLowerCase() : `${s.roman} · ${TONE_LABEL[s.tone].toLowerCase()}`}
          </span>
        ))}
      </div>
      <p className="mt-1 h-4 truncate text-[11px] leading-4 text-muted">Grey: target tone shapes. Green: your voice.</p>
    </div>
  );
}

export interface SyllableVerdict {
  i: number;
  target: Tone;
  heard: Tone | "level" | null;
  ok: boolean;
  text: string;
}

export function syllableVerdicts(syllables: TargetSyllable[], result: ToneResult, hideTarget = false): SyllableVerdict[] {
  const single = syllables.length === 1;
  return syllables.map((t, i) => {
    const s = result.shapes[i] ?? null;
    const name = hideTarget ? (single ? "This word" : `Syllable ${i + 1}`) : single ? `${t.roman}${t.en ? ` (“${t.en}”)` : ""}` : `Syllable ${i + 1} (${t.roman}${t.en ? `, ${t.en}` : ""})`;
    const should = `${name} ${TONE_ADVICE[t.tone]}.`;
    if (!s) return { i, target: t.tone, heard: null, ok: false, text: `${should} I couldn't hear a clear pitch here. Hold the vowel a bit longer.` };
    const heard = classify(s, result.levelKnown);
    const ok = tonesMatch(heard, t.tone);
    const yours = describeMovement(s, result.levelKnown);
    let text = ok ? `${should} ${yours}. Good.` : `${should} ${yours}.`;
    if (ok && heard === "level") text += " (High, mid or low gets checked once I know your normal voice.)";
    return { i, target: t.tone, heard, ok, text };
  });
}

function ToneFeedback({ state, syllables, hideTarget, phase }: { state: ToneState; syllables: TargetSyllable[]; hideTarget: boolean; phase: string }) {
  if (state.kind === "message") return <p className="text-miss" data-tone-message>{state.text}</p>;
  if (state.kind === "idle")
    return phase === "idle" && syllables.length > MAX_SYLLABLES ? (
      <p className="text-muted">This is a long line. The tone check works best on single words and short phrases.</p>
    ) : null;
  if (!syllables.length) return <p className="text-muted">I heard your voice, but there's no tone target for this card.</p>;
  if (syllables.length > MAX_SYLLABLES)
    return (
      <p className="text-muted" data-tone-summary>
        This line is long, so I drew your whole pitch curve instead of checking each syllable. For per-syllable feedback, practise the words one at a time.
      </p>
    );
  const v = syllableVerdicts(syllables, state.result, hideTarget);
  const good = v.filter((x) => x.ok).length;
  // Long-ish lines: list only the misses to keep the reserved area stable.
  const shown = syllables.length > 3 ? v.filter((x) => !x.ok).slice(0, 3) : v;
  return (
    <div className="grid gap-1">
      <p className={`font-medium ${good === v.length ? "text-accent" : ""}`} data-tone-summary>
        {v.length === 1 ? (good ? "Tone: matched." : "Tone: not quite.") : `Tones: ${good} of ${v.length} syllables matched.`}
      </p>
      {shown.map((x) => (
        <p key={x.i} className={x.ok ? "" : "text-miss"} data-tone-line data-heard-tone={x.heard ?? "none"} data-ok={x.ok}>
          {x.text}
        </p>
      ))}
      {syllables.length > 3 && v.length - good > 3 ? <p className="text-muted">…and {v.length - good - 3} more. Try the words one at a time.</p> : null}
    </div>
  );
}

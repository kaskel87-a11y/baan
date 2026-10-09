import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { Tone } from "../data/types";
import { gloss } from "../data/glossary";
import { stopSpeech } from "../lib/audio";
import { recognitionCtor, type Recognition } from "../lib/speech";
import { matchSpoken, TONE_LABEL, toneFromRoman, type Verdict } from "../lib/thai";
import { createCapture, micSupported, type Capture, type MicError, type Recording } from "../lib/recorder";
import { errorName, setDiag, useDiag, type Diag } from "../lib/diag";
import { latinMatches, transcribe, transcriberLoaded } from "../lib/transcribe";
import { compareSpoken } from "../lib/compare";

const ASR_OK_KEY = "baan.asr.ok";
const WORD_MODE_KEY = "baan.wordMode";
/** iPhone/iPad (any browser — all are WebKit): the built-in speech recognition doesn't return Thai reliably. */
function initialRecordMode(hasRecognizer: boolean) {
  if (!hasRecognizer || IS_IOS) return true;
  try {
    return sessionStorage.getItem(WORD_MODE_KEY) === "record";
  } catch {
    return false;
  }
}
import { analyze, classify, describe, describeMovement, isDead, tonesMatch, TONE_ADVICE, type Analysis, type SyllableShape } from "../lib/pitch";
import { getState, pitchBaseline, recordPitchMedian } from "../lib/store";
import { AnswerLine, TONE_PATH } from "./ui";

/* ------------------------------------------------------------------ word check (speech recognition) */

type WordState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "heard"; verdict: Verdict; heard: string }
  | { kind: "message"; text: string }
  | { kind: "note"; text: string }
  | { kind: "progress"; text: string }
  | { kind: "consent" };

const IS_IOS = typeof navigator !== "undefined" && /iP(hone|ad|od)/.test(navigator.userAgent + (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent) ? " iPad" : ""));

export const WORD_MSG = {
  unsupported: "Your browser can't check Thai words, but the tone check below still works.",
  noResult: IS_IOS
    ? "The word check didn't hear any words. On iPhone it needs Dictation on (Settings > General > Keyboard > Enable Dictation). Then tap Say it and speak right away."
    : "The word check didn't hear any words. Tap Say it and speak right away, a little louder.",
  noSpeech: "I didn't hear anything. Tap Say it and speak right away.",
  denied: IS_IOS
    ? "The word check isn't allowed. On iPhone, turn on Settings > General > Keyboard > Enable Dictation, and allow the microphone for this site. The tone check still works."
    : "The word check isn't allowed to use the microphone. Allow it for this site and try again. The tone check still works.",
  network: "The word check couldn't reach the speech service (it needs an internet connection). The tone check still works offline.",
  language: "Your browser can't recognize Thai speech. The tone check still works.",
  audio: "The word check couldn't open the microphone. The tone check still works if the mic is free.",
  timeout: "The word check didn't answer in time. The tone check still works.",
  failed: "The word check couldn't start. The tone check still works.",
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
      return `The word check stopped (${code || "unknown error"}). The tone check still works.`;
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
    ? "The microphone is blocked. On iPhone: tap aA in Safari's address bar > Website Settings > Microphone > Allow, then try again."
    : "The microphone is blocked. Allow it for this site (the icon in the address bar), then try again.",
  "no-device": "No microphone was found. Plug one in or use your phone, then try again.",
  busy: "The microphone is busy in another app. Close it, then try again.",
  unknown: "The microphone couldn't start. Try again.",
};

/* ------------------------------------------------------------------ component */

const SILENT_MSG =
  "I got no sound from your mic. Try: 1) close calls, Voice Memos or other apps using the mic; 2) disconnect Bluetooth headphones; 3) reload this page and allow the microphone; 4) still nothing? Tap “Mic trouble?” below and send a screenshot.";

/**
 * "Say it" — two separate steps that never use the microphone at the same time:
 *  1. Say it = word check. Exactly the 0.2.0 behaviour: the browser's speech recognition (th-TH) alone gets
 *     the mic — no getUserMedia, no AudioContext. (0.3.0 opened a recorder in the same tap, which on
 *     iPhone took the mic away from recognition, so it never heard anything.)
 *  2. Check my tones = tone check. Records with getUserMedia and compares your pitch curve per syllable
 *     with the target tone shapes, on the phone. It can only start while recognition is not running.
 * Where the browser has no speech recognition, Say it runs the tone check instead.
 * Fixed-size buttons and fixed-height result areas: nothing moves. Every outcome ends with an English message.
 * `hideTarget` keeps the Thai/romanization hidden (Review, From English).
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
  const [wordPhase, setWordPhase] = useState<"idle" | "listening">("idle");
  const [word, setWord] = useState<WordState>({ kind: "idle" });
  const [tone, setTone] = useState<ToneState>({ kind: "idle" });
  const [level, setLevel] = useState(0);
  const [peakSeen, setPeakSeen] = useState(0);
  const [showDiag, setShowDiag] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const cap = useRef<Capture | null>(null);
  const run = useRef(0);
  const wordRun = useRef(0);
  const finishing = useRef(false);
  const wordTimer = useRef<number | undefined>(undefined);

  const syllables = targetSyllables(target, roman, en, skip);
  const recognizer = recognitionCtor();
  const [recordMode, setRecordMode] = useState(() => initialRecordMode(!!recognizer));
  const lastRecording = useRef<Recording | null>(null);
  const emptyEnds = useRef(0);

  useEffect(() => {
    setDiag({
      speechRecognition: recognizer ? "available" : "not available",
      wordCheckMode: recordMode
        ? "Say it records once: tone check + on-device transcription (Whisper)"
        : "Say it = browser speech recognition (th-TH); tone check is a separate step",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopWords() {
    wordRun.current++;
    rec.current?.abort();
    rec.current = null;
    window.clearTimeout(wordTimer.current);
    setWordPhase("idle");
  }
  function stopTone() {
    run.current++;
    cap.current?.cancel();
    cap.current = null;
    setPhase("idle");
  }

  useEffect(() => {
    setPhase("idle");
    setWord({ kind: "idle" });
    setTone({ kind: "idle" });
    return () => {
      stopWords();
      run.current++;
      cap.current?.cancel();
      cap.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // live input meter (tone recording only)
  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => {
      const l = cap.current?.level() ?? 0;
      setLevel(l);
      setPeakSeen((p) => Math.max(p, l));
    }, 80);
    return () => window.clearInterval(id);
  }, [phase]);

  /** Word check: speech recognition alone, as in 0.2.0. Runs synchronously in the tap. */
  function startWords() {
    if (!recognizer) return;
    stopTone(); // never share the mic with the recorder
    stopWords();
    stopSpeech();
    const id = wordRun.current;
    let gotResult = false;
    let gotError = false;
    let interim = "";
    const judge = (alts: string[]) => {
      const rank = { yes: 2, close: 1, no: 0 } as const;
      let best: { v: Verdict; t: string } = { v: "no", t: alts[0]! };
      for (const t of alts) {
        const v = matchSpoken(t, target);
        if (rank[v] > rank[best.v]) best = { v, t };
      }
      setWord({ kind: "heard", verdict: best.v, heard: best.t });
    };
    try {
      const r = new recognizer();
      r.lang = "th-TH";
      r.interimResults = true; // iOS often ends without a final result: keep the last interim one
      r.maxAlternatives = 5;
      r.continuous = false;
      r.onresult = (e) => {
        if (id !== wordRun.current) return;
        const res = Array.from(e.results as ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>);
        const last = res[res.length - 1];
        if (!last) return;
        const alts = Array.from(last).map((a) => a.transcript).filter((t) => t.trim());
        if (!alts.length) return;
        if (last.isFinal === false) {
          interim = alts[0]!;
          return;
        }
        gotResult = true;
        emptyEnds.current = 0;
        judge(alts);
      };
      r.onerror = (e) => {
        if (id !== wordRun.current || gotResult) return;
        setDiag({ lastWordError: e.error || "unknown" });
        if (e.error === "aborted") return;
        gotError = true;
        setWord({ kind: "message", text: errorText(e.error) });
      };
      r.onend = () => {
        if (id !== wordRun.current) return;
        rec.current = null;
        window.clearTimeout(wordTimer.current);
        setWordPhase("idle");
        if (!gotResult && interim) {
          // ended before a final result: use the last interim transcript
          gotResult = true;
          emptyEnds.current = 0;
          judge([interim]);
          return;
        }
        // Can end with neither a result nor an error: say so, and after two in a row switch to recording.
        if (!gotResult && !gotError) {
          setDiag({ lastWordError: "ended with no result" });
          emptyEnds.current++;
          if (emptyEnds.current >= 2) {
            try {
              sessionStorage.setItem(WORD_MODE_KEY, "record");
            } catch {
              /* ignore */
            }
            setRecordMode(true);
            setWord({ kind: "message", text: "Your browser's speech recognition isn't returning anything. I've switched Say it to recording you and checking the words on this device. Tap Say it again." });
          } else setWord({ kind: "message", text: WORD_MSG.noResult });
        }
      };
      rec.current = r;
      r.start();
      setWord({ kind: "pending" });
      setWordPhase("listening");
      // Safety net only: if the browser never ends the session, stop waiting after 15 s.
      wordTimer.current = window.setTimeout(() => {
        if (id !== wordRun.current) return;
        r.abort();
        rec.current = null;
        setWordPhase("idle");
        if (!gotResult && !gotError) setWord({ kind: "message", text: WORD_MSG.timeout });
      }, 15000);
    } catch (e) {
      rec.current = null;
      setWordPhase("idle");
      setDiag({ lastWordError: `start: ${errorName(e)}` });
      setWord({ kind: "message", text: WORD_MSG.failed });
    }
  }

  /** Tone check recording. Runs synchronously inside the tap (iOS unlocks audio only in the gesture). */
  const withWords = useRef(false);
  function startTone(words = false) {
    withWords.current = words;
    stopWords(); // recognition must not be running while we hold the mic
    stopTone();
    const id = run.current;
    finishing.current = false;
    stopSpeech();
    setTone({ kind: "idle" });
    setLevel(0);
    setPeakSeen(0);
    if (!micSupported()) {
      setDiag({ lastError: "getUserMedia missing" });
      setTone({ kind: "message", text: MIC_MSG[window.isSecureContext === false ? "insecure" : "unsupported"] });
      return;
    }
    let c: Capture;
    try {
      c = createCapture(); // AudioContext created + resumed right here, in the tap
    } catch (e) {
      setDiag({ lastError: `AudioContext: ${errorName(e)}` });
      setTone({ kind: "message", text: MIC_MSG[(typeof e === "string" ? e : "unsupported") as MicError] ?? MIC_MSG.unknown });
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
        setPhase("idle");
      });
  }

  async function finish() {
    if (finishing.current) return;
    finishing.current = true;
    const id = run.current;
    const c = cap.current;
    cap.current = null;
    if (!c) return setPhase("idle");
    setPhase("analyzing");
    let recording: Recording;
    try {
      recording = await c.stop();
    } catch (e) {
      setDiag({ lastError: `stop: ${errorName(e)}` });
      if (id === run.current) {
        setTone({ kind: "message", text: MIC_MSG.unknown });
        setPhase("idle");
      }
      return;
    }
    if (id !== run.current) return;
    await new Promise((res) => window.setTimeout(res, 0)); // paint "Checking…" first
    setTone(toneCheck(recording));
    lastRecording.current = recording;
    if (withWords.current) void wordsFromRecording(recording);
    setPhase("idle");
  }

  /** Word check from the recording (on-device Whisper). Asks once before the ~80 MB download. */
  async function wordsFromRecording(r: Recording) {
    if (r.peak < 0.002) {
      setWord({ kind: "message", text: "No sound reached the word check either. See the tone check message below." });
      return;
    }
    let ok = false;
    try {
      ok = localStorage.getItem(ASR_OK_KEY) === "1" || !!(window as unknown as { __fakeTranscribe?: unknown }).__fakeTranscribe;
    } catch {
      /* ignore */
    }
    if (!ok) {
      setWord({ kind: "consent" });
      return;
    }
    const id = run.current;
    setWord({ kind: "progress", text: transcriberLoaded() ? "Checking your words…" : "Loading the word checker…" });
    try {
      const text = await transcribe(r.samples, r.rate, (f) => id === run.current && setWord({ kind: "progress", text: `Downloading the word checker (one time): ${Math.round(f * 100)}%` }));
      if (id !== run.current) return;
      setDiag({ transcript: text || "(empty)" });
      const clean = text.replace(/[!?.,"“”]/g, "").trim();
      if (!clean) return setWord({ kind: "message", text: "The word check didn't catch any words. Say it a bit louder and closer to the phone." });
      if (/[\u0E00-\u0E7F]/.test(clean)) return setWord({ kind: "heard", verdict: matchSpoken(clean, target), heard: clean });
      // Whisper sometimes answers in Latin letters for a single word ("Pang" for แพง)
      const sim = roman ? latinMatches(clean, roman) : 0;
      setWord({ kind: "heard", verdict: sim >= 0.7 ? "close" : "no", heard: clean });
    } catch (e) {
      setDiag({ lastWordError: `transcribe: ${errorName(e)}` });
      if (id === run.current)
        setWord({ kind: "message", text: "The on-device word checker couldn't run here (it needs about 80 MB and an internet connection the first time). The tone check still works." });
    }
  }

  function toneCheck({ samples, rate, peak }: Recording): ToneState {
    if (samples.length < rate * 0.2) return { kind: "message", text: "The recording was too short. Tap Check my tones, speak, then pause; it stops by itself." };
    if (peak < 0.002) return { kind: "message", text: SILENT_MSG };
    const n = Math.max(1, syllables.length);
    const baseline = pitchBaseline(getState());
    // Lines with 3+ syllables carry their own reference; single words need the learner's usual pitch.
    const useOwn = n >= 3;
    const analysis = analyze(samples, rate, Math.min(n, MAX_SYLLABLES), useOwn ? undefined : baseline);
    setDiag({ voicedMs: String(Math.round(analysis.voicedMs)), pitchMedianHz: Number.isFinite(analysis.medianHz) ? analysis.medianHz.toFixed(0) : "—" });
    if (!analysis.ok)
      return {
        kind: "message",
        text:
          analysis.reason === "no-voice"
            ? "Your mic works, but I couldn't hear a voice in it. Speak right after tapping, close to the phone, and hold the vowel."
            : "I only heard a very short sound. Say the whole word, and hold the vowel a little longer.",
      };
    recordPitchMedian(analysis.medianHz);
    const levelKnown = useOwn || baseline !== undefined;
    const shapes = n > MAX_SYLLABLES ? [] : analysis.segments.map((sg) => describe(analysis.frames, sg, analysis.refHz));
    return { kind: "result", result: { analysis, shapes, levelKnown } };
  }

  const toneBusy = phase === "live" || phase === "starting";
  const listening = wordPhase === "listening";
  // Say it: word check when the browser has recognition, otherwise it runs the tone check.
  const speechMode = !!recognizer && !recordMode;
  const sayBusy = speechMode ? listening : toneBusy && withWords.current;
  const sayLabel = speechMode
    ? listening
      ? "Stop"
      : "Say it"
    : sayBusy
      ? phase === "starting"
        ? "Starting…"
        : "Stop"
      : phase === "analyzing" && withWords.current
        ? "Checking…"
        : "Say it";
  const toneOwn = !withWords.current;
  const toneLabel = !toneOwn ? "Check my tones" : phase === "starting" ? "Starting…" : toneBusy ? "Stop" : phase === "analyzing" ? "Checking…" : "Check my tones";

  return (
    <div className="grid gap-2" data-sayit>
      <button
        type="button"
        aria-pressed={sayBusy}
        disabled={speechMode ? toneBusy || phase === "analyzing" : phase === "analyzing" || (toneBusy && !withWords.current)}
        onClick={speechMode ? (listening ? () => rec.current?.stop() : startWords) : sayBusy ? () => void finish() : () => startTone(true)}
        className={`inline-flex h-11 w-40 shrink-0 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors duration-150 disabled:opacity-60 ${sayBusy ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-ink"}`}
      >
        {sayBusy ? <Square aria-hidden="true" size={16} /> : <Mic aria-hidden="true" size={18} />}
        <span>{sayLabel}</span>
      </button>

      <div className="grid gap-2 text-sm" aria-live="polite" data-sayit-result>
        <p className="h-10 overflow-hidden text-muted" data-sayit-status>
          {listening
            ? "Listening… say it in Thai, then tap Stop."
            : phase === "starting"
              ? "Opening the microphone…"
              : phase === "live"
                ? peakSeen > 0.15
                  ? "Recording… I can hear you. It stops when you pause, or tap Stop."
                  : "Recording… speak now. The Mic level bar should move when you talk."
                : phase === "analyzing"
                  ? withWords.current
                    ? "Checking your words and tones…"
                    : "Checking your tones…"
                  : word.kind === "idle" && tone.kind === "idle"
                    ? speechMode
                      ? "Tap Say it to check your words. Then tap Check my tones to see your pitch."
                      : "Tap Say it and speak right away. I'll check your words and your tones from one recording."
                    : null}
        </p>

        {/* word check: reserved block, directly under Say it (as in 0.2.0) */}
        <div className="h-[11rem] overflow-y-auto" data-word-check>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Word check</p>
          <WordResult
            state={word}
            onConsent={() => {
              try {
                localStorage.setItem(ASR_OK_KEY, "1");
              } catch {
                /* ignore */
              }
              if (lastRecording.current) void wordsFromRecording(lastRecording.current);
            }}
            toneDown={tone.kind === "message" && /microphone|record audio|secure|no sound/.test(tone.text)}
            target={target}
            roman={roman}
            en={en}
            hideTarget={hideTarget}
          />
        </div>

        {/* tone check: its own button; chart always drawn at a fixed height */}
        <div data-tone-check>
          <div className="flex h-9 items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Tone check</p>
            <button
              type="button"
              data-tone-button
              aria-pressed={toneBusy}
              disabled={listening || phase === "analyzing" || (toneBusy && withWords.current)}
              onClick={toneBusy ? () => void finish() : () => startTone(false)}
              className={`inline-flex h-9 w-36 shrink-0 items-center justify-center rounded-xl border text-xs font-medium disabled:opacity-60 ${toneBusy ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-ink"}`}
            >
              {toneLabel}
            </button>
          </div>
          {/* fixed-size live mic meter; only the fill changes */}
          <div className="mt-1 flex h-4 items-center gap-2" data-meter>
            <span className="text-[11px] leading-none text-muted">Mic level</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" role="meter" aria-label="Microphone level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
              <div className="h-full bg-accent transition-[width] duration-75" style={{ width: `${phase === "live" ? Math.round(level * 100) : 0}%` }} data-meter-fill />
            </div>
          </div>
          <ToneChart syllables={syllables.slice(0, MAX_SYLLABLES)} result={tone.kind === "result" ? tone.result : null} hideTarget={hideTarget} />
          <div className="mt-1 h-[9rem] overflow-y-auto" data-tone-feedback>
            <ToneFeedback state={tone} syllables={syllables} hideTarget={hideTarget} phase={phase} />
          </div>
        </div>
      </div>

      <div className="text-right">
        <button type="button" className="text-[11px] text-muted/70 hover:underline" onClick={() => setShowDiag((v) => !v)} aria-expanded={showDiag} data-diag-toggle>
          Mic trouble?
        </button>
        {showDiag ? <DiagPanel /> : null}
      </div>
    </div>
  );
}

const DIAG_LABELS: [keyof Diag, string][] = [
  ["updated", "Last update"],
  ["userAgent", "Browser"],
  ["speechRecognition", "Speech recognition"],
  ["wordCheckMode", "Word check mode"],
  ["getUserMedia", "Mic API (getUserMedia)"],
  ["audioWorklet", "AudioWorklet"],
  ["mediaRecorder", "MediaRecorder"],
  ["ctxStateAtTap", "Audio state at tap"],
  ["ctxStateAfterMic", "Audio state after mic opened"],
  ["ctxStateAtStop", "Audio state at stop"],
  ["ctxSampleRate", "Audio sample rate"],
  ["micSampleRate", "Mic sample rate"],
  ["micLabel", "Mic"],
  ["capturePath", "Capture path"],
  ["recordingType", "Backup recording"],
  ["durationMs", "Recording length (ms)"],
  ["peakLevel", "Peak level (0–1)"],
  ["rmsLevel", "Average level"],
  ["voicedMs", "Voice found (ms)"],
  ["pitchMedianHz", "Your pitch (Hz)"],
  ["lastError", "Last mic error"],
  ["lastWordError", "Last word-check error"],
];

function DiagPanel() {
  const d = useDiag();
  const [copied, setCopied] = useState(false);
  const text = DIAG_LABELS.map(([k, l]) => `${l}: ${d[k]}`).join("\n");
  return (
    <div className="mt-2 grid gap-2 rounded-xl border border-line bg-card p-3 text-xs" data-diag>
      <p className="text-muted">Take a screenshot of this after trying Say it once, and send it over. Nothing here is sent anywhere.</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {DIAG_LABELS.map(([k, l]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{l}</dt>
            <dd className="break-all" data-diag-key={k}>{d[k] || "—"}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        className="justify-self-start rounded-lg border border-line px-3 py-1"
        onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false))}
      >
        {copied ? "Copied" : "Copy as text"}
      </button>
    </div>
  );
}

function WordResult({
  onConsent,
  state,
  toneDown,
  target,
  roman,
  en,
  hideTarget,
}: {
  state: WordState;
  onConsent: () => void;
  toneDown: boolean;
  target: string;
  roman?: string;
  en?: string;
  hideTarget: boolean;
}) {
  if (state.kind === "idle") return null;
  if (state.kind === "pending") return <p className="text-muted">Listening for words… say it in Thai now.</p>;
  if (state.kind === "note") return <p className="text-muted" data-word-note>{state.text}</p>;
  if (state.kind === "progress") return <p className="text-muted" data-word-progress>{state.text}</p>;
  if (state.kind === "consent")
    return (
      <div className="grid gap-2" data-word-consent>
        <p className="text-muted">
          On iPhone the word check runs on this device. It needs a one-time download of a speech model (about 80 MB, best on Wi-Fi). Your voice never leaves the phone.
        </p>
        <button type="button" onClick={onConsent} className="justify-self-start rounded-xl border border-line bg-card px-3 py-1.5 text-xs font-medium" data-word-consent-ok>
          Download and check my words
        </button>
      </div>
    );
  if (state.kind === "message") {
    // don't promise the tone check when the mic itself failed
    const text = toneDown ? state.text.replace(/,? but the tone check below still works\.?| The tone check still works( offline| if the mic is free)?\./, ".").replace("..", ".") : state.text;
    return <p className="text-miss" data-word-message>{text}</p>;
  }
  const h = describeHeard(state.heard, target, roman, en);
  const cmp = compareSpoken(state.heard, target, roman, state.verdict === "close" ? 1 : 3);
  const heardRoman = cmp.heardRoman || h.roman || state.heard;
  const isThai = /[\u0E00-\u0E7F]/.test(state.heard);
  const meaning = h.en ? <> (that means “{h.en}”)</> : null;
  return (
    <div className="grid gap-1" data-word-feedback>
      {state.verdict === "yes" ? (
        <p className="font-medium text-accent" data-heard>
          Correct! That sounded like {roman ? `“${roman}”` : `“${heardRoman}”`}.
        </p>
      ) : (
        <p className={`font-medium ${state.verdict === "no" ? "text-miss" : ""}`} data-heard>
          {state.verdict === "close" ? "Close!" : "Not quite."} I heard something like “{heardRoman}”
          {isThai ? (
            <span className="font-normal text-muted">
              {" "}(<span lang="th" className="thai">{state.heard}</span>)
            </span>
          ) : null}
          {meaning}.
        </p>
      )}
      {state.verdict !== "yes" && !hideTarget && cmp.tips.length ? (
        <ul className="grid list-disc gap-0.5 pl-5" data-tips>
          {cmp.tips.map((t, k) => (
            <li key={k}>{t}</li>
          ))}
        </ul>
      ) : null}
      {state.verdict !== "yes" && !hideTarget && !cmp.tips.length ? <p>Say it once more, clearly and a little slower.</p> : null}
      {hideTarget ? (
        state.verdict === "yes" ? null : <p className="text-muted">Tap Show to see the right answer.</p>
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
        // only voiced frames, at their real position in the syllable; a gap of > 30 ms starts a new stroke
        let d = "";
        s.st.forEach((v, k) => {
          const span = Math.max(1, s.st.length / Math.max(0.05, s.voicedFrac) - 1);
          const gap = k === 0 || s.pos[k]! - s.pos[k - 1]! > 3.5 / span;
          d += `${gap ? "M" : "L"}${(x0 + w * s.pos[k]!).toFixed(1)} ${ySt(v).toFixed(1)} `;
        });
        userPaths.push(d.trim());
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
    if (!s)
      return {
        i,
        target: t.tone,
        heard: null,
        ok: false,
        text: hideTarget
          ? `I couldn't hear a clear pitch on ${single ? "this word" : `syllable ${i + 1}`}. Say it a bit louder and longer.`
          : `I couldn't hear a clear pitch on ${single ? t.roman : `syllable ${i + 1} (${t.roman})`}. Say it a bit louder and longer.`,
      };
    const heard = classify(s, result.levelKnown);
    const ok = tonesMatch(heard, t.tone, s, isDead(t.roman));
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

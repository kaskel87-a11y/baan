import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import type { Tone } from "../data/types";
import { speak, stopSpeech, useThaiVoice } from "../lib/audio";
import { canRecognize, recognitionCtor, type Recognition } from "../lib/speech";
import { matchSpoken, type Verdict } from "../lib/thai";

const TONE_PATH: Record<Tone, string> = {
  mid: "M6 24 H58",
  low: "M6 34 H58",
  falling: "M6 10 C 22 12, 36 30, 58 36",
  high: "M6 12 H46 C 52 12, 56 16, 58 22",
  rising: "M6 34 C 22 34, 40 14, 58 8",
};

export function ToneShape({ tone, className = "h-10 w-16" }: { tone: Tone; className?: string }) {
  return (
    <svg viewBox="0 0 64 42" className={className} aria-hidden="true">
      <path d="M4 8 V36" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
      <path d={TONE_PATH[tone]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

type Variant = "primary" | "quiet" | "ghost";
export function Button({
  variant = "quiet",
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const v = {
    primary: "bg-accent text-accent-ink",
    quiet: "bg-card text-ink border border-line",
    ghost: "bg-transparent text-ink",
  }[variant];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-medium transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] disabled:opacity-40 ${v} ${className}`}
      {...rest}
    />
  );
}

export function HearButton({ text, slow = false, label }: { text: string; slow?: boolean; label?: string }) {
  return (
    <Button aria-label={label ?? (slow ? "Play slowly" : "Play Thai")} onClick={() => speak(text, slow ? 0.68 : 0.9)}>
      <Volume2 aria-hidden="true" size={18} />
      {slow ? "Slow" : "Hear"}
    </Button>
  );
}

export function NoVoiceNotice() {
  return useThaiVoice() === "no" ? (
    <p className="text-sm text-muted">
      This browser has no Thai voice, so Hear may be silent. Chrome on a computer usually has one. Reading, drills, and
      review still work.
    </p>
  ) : null;
}

export function RomanKey() {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <button type="button" className="min-h-11 text-accent font-medium" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Hide the romanization key" : "How to read the romanization"}
      </button>
      {open ? (
        <div className="mt-2 grid gap-2 text-muted">
          <p>Tone marks sit on the vowel: à low, â falling, á high, ǎ rising. No mark is mid.</p>
          <p>Doubled vowels are long: aa, ii, uu, ee.</p>
          <p>No puff of air on g (ก), bp (ป), dt (ต), or j (จ). kh, ph, and th do have that puff.</p>
          <p>ue, as in ชื่อ, is ee said with unrounded lips. jer, as in เจอ, is the vowel เออ.</p>
        </div>
      ) : null}
    </div>
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="grid gap-2">
      <p className="text-sm font-medium text-muted">{kicker}</p>
      <h1 className="font-display text-3xl text-ink md:text-4xl">{title}</h1>
      {children ? <div className="text-muted max-w-prose">{children}</div> : null}
    </header>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`min-h-11 rounded-xl border px-3 ${value === o.id ? "border-accent bg-accent text-accent-ink" : "border-line bg-card"}`}
          >
            <span lang="th">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Correct Thai + romanization + English, used by every piece of feedback. */
export function AnswerLine({ thai, roman, en }: { thai: string; roman?: string; en?: string }) {
  return (
    <span className="block">
      <span className="thai text-xl" lang="th">{thai}</span>{" "}
      {roman ? <span className="ml-1 text-muted">{roman}</span> : null}
      {en ? <span className="block text-sm">“{en}”</span> : null}
    </span>
  );
}

/**
 * "Say it": browser speech recognition (th-TH), then the same fuzzy word match as the original.
 * One fixed-size button that toggles Say it ⇄ Stop, and a fixed-height result area below it,
 * so nothing moves when recording starts or the result arrives. Hidden where SpeechRecognition is missing.
 * `hideTarget` keeps the Thai answer out of the feedback until the card is revealed (Review, From English).
 */
export function SayIt({ target, roman, en, hideTarget = false }: { target: string; roman?: string; en?: string; hideTarget?: boolean }) {
  const [phase, setPhase] = useState<"idle" | "live">("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState("");
  const rec = useRef<Recognition | null>(null);
  const supported = canRecognize();

  useEffect(() => {
    setPhase("idle");
    setVerdict(null);
    setHeard("");
    setError("");
    return () => {
      rec.current?.abort();
      rec.current = null;
    };
  }, [target]);

  if (!supported) return null;

  function start() {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    stopSpeech();
    setVerdict(null);
    setHeard("");
    setError("");
    const r = new Ctor();
    r.lang = "th-TH";
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    r.onresult = (e) => {
      const alts = Array.from(e.results[0] ?? []).map((a) => a.transcript);
      const rank = { yes: 2, close: 1, no: 0 } as const;
      let best: { v: Verdict; t: string } = { v: "no", t: alts[0] ?? "" };
      for (const t of alts) {
        const v = matchSpoken(t, target);
        if (rank[v] > rank[best.v]) best = { v, t };
      }
      setHeard(best.t);
      setVerdict(best.t ? best.v : "no");
    };
    r.onerror = (e) => {
      setError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "The microphone is blocked. Allow it for this page, then tap Say it again."
          : e.error === "no-speech"
            ? "I didn't catch anything. Hold the phone a little closer and try again."
            : e.error === "language-not-supported"
              ? "This browser can't recognize Thai speech."
              : "I couldn't check that. Try once more.",
      );
    };
    r.onend = () => {
      setPhase("idle");
      rec.current = null;
    };
    rec.current = r;
    try {
      r.start();
      setPhase("live");
    } catch {
      setError("I couldn't start the microphone.");
    }
  }

  const live = phase === "live";
  const showAnswer = !hideTarget;
  return (
    <div className="grid gap-2" data-sayit>
      <button
        type="button"
        aria-pressed={live}
        onClick={live ? () => rec.current?.stop() : start}
        className={`inline-flex h-11 w-40 shrink-0 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors duration-150 ${live ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-ink"}`}
      >
        {live ? <Square aria-hidden="true" size={16} /> : <Mic aria-hidden="true" size={18} />}
        <span>{live ? "Stop" : "Say it"}</span>
      </button>
      {/* Reserved space: same height whether empty, listening, or showing a result. */}
      <div className="min-h-[13rem] text-sm" aria-live="polite" data-sayit-result>
        {live ? <p className="text-muted">Listening… say it in Thai, then tap Stop.</p> : null}
        {!live && error ? <p className="text-miss">{error}</p> : null}
        {!live && verdict === "yes" ? (
          <div className="grid gap-1">
            <p className="font-medium text-accent">Correct. That matched the line.</p>
            {showAnswer ? <AnswerLine thai={target} roman={roman} en={en} /> : null}
          </div>
        ) : null}
        {!live && verdict && verdict !== "yes" ? (
          <div className="grid gap-1">
            <p className={verdict === "close" ? "font-medium" : "font-medium text-miss"}>
              {verdict === "close" ? "Close, but not exact." : "Not quite."} I heard: <span lang="th" className="thai">{heard || "nothing"}</span>
            </p>
            {showAnswer ? (
              <>
                <p className="text-muted">The line is:</p>
                <AnswerLine thai={target} roman={roman} en={en} />
              </>
            ) : (
              <p className="text-muted">Tap Show to see the right answer.</p>
            )}
          </div>
        ) : null}
        {!live && verdict ? <p className="mt-1 text-xs text-muted">This checks the words. A wrong tone can still match the spelling.</p> : null}
      </div>
    </div>
  );
}

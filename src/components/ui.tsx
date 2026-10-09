import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Mic, Volume2 } from "lucide-react";
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

/**
 * "Say it": browser speech recognition (th-TH), then the same fuzzy word match as the original.
 * Hidden entirely when the browser has no SpeechRecognition.
 * `hideTarget` keeps the Thai off screen while listening (used before a review card is revealed).
 */
export function SayIt({ target, hideTarget = false }: { target: string; hideTarget?: boolean }) {
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
      // Take the best verdict across alternatives.
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
            ? "I didn't catch that. Hold the phone a little closer and try again."
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

  function stop() {
    rec.current?.stop();
  }

  return (
    <div className="grid gap-2">
      <Button variant={phase === "live" ? "primary" : "quiet"} aria-pressed={phase === "live"} onClick={phase === "live" ? stop : start} className="justify-self-start">
        <Mic aria-hidden="true" size={18} />
        {phase === "live" ? "Listening… tap when done" : "Say it"}
      </Button>
      {phase === "live" ? (
        <div className="rounded-xl border border-line bg-paper px-4 py-3">
          <p className="text-sm text-muted">{hideTarget ? "Say it in Thai" : "Say this"}</p>
          {hideTarget ? null : (
            <p className="thai text-2xl" lang="th">
              {target}
            </p>
          )}
        </div>
      ) : null}
      {error ? <p className="text-sm text-miss">{error}</p> : null}
      {verdict === "yes" ? <p className="text-sm font-medium text-accent">Correct.</p> : null}
      {verdict === "close" ? (
        <p className="text-sm">
          Close. Heard <span lang="th">{heard}</span>.
        </p>
      ) : null}
      {verdict === "no" ? (
        <p className="text-sm text-miss">
          Not quite. Heard <span lang="th">{heard || "nothing"}</span>.
        </p>
      ) : null}
      {verdict ? <p className="text-sm text-muted">This checks the words. A wrong tone can still match the spelling.</p> : null}
    </div>
  );
}

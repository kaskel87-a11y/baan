import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Volume2 } from "lucide-react";
import type { Tone } from "../data/types";
import { speak, useThaiVoice } from "../lib/audio";

export const TONE_PATH: Record<Tone, string> = {
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


export { SayIt } from "./SayIt";

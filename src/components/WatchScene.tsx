import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Cartoon } from "../data/cartoons";
import { SCENES } from "../data/scenes";
import { pick } from "../lib/thai";
import { stopSpeech } from "../lib/audio";

/** A voiced cartoon the Watch the scene player can show. Lesson cartoons look up lines; others may carry Thai on the cue. */
export type WatchCue = {
  at: number;
  scene?: string;
  line?: string;
  who?: string;
  thai?: string;
  roman?: string;
  en?: string;
};
export type WatchCartoon = Omit<Cartoon, "scenes" | "cues"> & { scenes?: string[]; cues: WatchCue[] };

function cueLines(cartoon: WatchCartoon) {
  return cartoon.cues
    .map((c, i) => {
      if (c.thai && c.roman && c.en) {
        return { at: c.at, who: c.who ?? "you", thai: c.thai, roman: c.roman, en: c.en, line: c.line ?? `cue-${i}` };
      }
      const l = c.scene && c.line ? SCENES.find((s) => s.id === c.scene)?.lines.find((x) => x.id === c.line) : undefined;
      return l ? { at: c.at, who: l.who, thai: pick(l.thai, "male"), roman: pick(l.roman, "male"), en: l.en, line: c.line! } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

function whoLabel(who: string) {
  if (who === "you") return "You";
  return who ? who[0]!.toUpperCase() + who.slice(1) : "";
}

/** "Watch the scene": a voiced cartoon of the lesson. Only the poster loads until it is tapped. */
export function WatchScene({
  cartoon,
  roman,
  autoPlay = false,
  kicker = "Watch the scene",
}: {
  cartoon: WatchCartoon;
  roman: boolean;
  autoPlay?: boolean;
  kicker?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [showLines, setShowLines] = useState(false);
  // Once it opens, bring the whole video on screen.
  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [open]);
  const lines = cueLines(cartoon);

  function start() {
    stopSpeech();
    setOpen(true);
    void ref.current?.play().catch(() => {});
  }
  useEffect(() => {
    if (autoPlay) start();
    // play once when this card first appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);
  function seek(at: number) {
    const v = ref.current;
    if (!v) return;
    stopSpeech();
    setOpen(true);
    v.currentTime = Math.max(0, at - 0.4);
    void v.play().catch(() => {});
  }

  return (
    <section className="rounded-4xl border border-line bg-card p-4 grid gap-3" aria-label={`${kicker}: ${cartoon.title}`}>
      <div className="flex items-center gap-3">
        {open ? null : (
          <button type="button" className="relative shrink-0 overflow-hidden rounded-xl border border-line" onClick={start} aria-label={`Play the cartoon: ${cartoon.title}`}>
            <img className="block h-24 w-[3.375rem] object-cover" src={cartoon.poster} alt="" width={54} height={96} loading="lazy" decoding="async" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-ink shadow">
                <Play aria-hidden="true" size={16} fill="currentColor" />
              </span>
            </span>
          </button>
        )}
        <div className="grid min-w-0 gap-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{kicker}</p>
          <p className="thai text-lg leading-snug" lang="th">{cartoon.titleTh}</p>
          <p className="font-display text-xl leading-snug">{cartoon.title}</p>
          <p className="text-sm text-muted">{cartoon.blurb}</p>
        </div>
      </div>
      {open ? null : (
        <button
          type="button"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink active:scale-[0.98]"
          onClick={start}
        >
          <Play aria-hidden="true" size={16} fill="currentColor" />
          Play with sound
        </button>
      )}
      <div className={open ? "mx-auto w-full max-w-[20rem] overflow-hidden rounded-3xl border border-line bg-paper" : "hidden"}>
        <video
          ref={ref}
          className="block aspect-[9/16] w-full"
          src={cartoon.video}
          poster={cartoon.poster}
          controls
          playsInline
          preload="none"
          onPlay={() => {
            stopSpeech();
            setOpen(true);
          }}
        />
      </div>
      {open ? (
        <button type="button" className="min-h-11 w-fit text-sm font-medium text-accent" aria-expanded={showLines} onClick={() => setShowLines((s) => !s)}>
          {showLines ? "Hide the lines" : `The ${lines.length} lines in it (tap one to jump there)`}
        </button>
      ) : null}
      {open && showLines ? (
        <ol className="grid gap-2">
          {lines.map((l) => (
            <li key={l.line}>
              <button type="button" className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-left" onClick={() => seek(l.at)}>
                <span className="text-xs text-muted">{whoLabel(l.who)} · {Math.floor(l.at / 60)}:{String(Math.floor(l.at % 60)).padStart(2, "0")}</span>
                <span className="thai block text-lg" lang="th">{l.thai}</span>
                {roman ? <span className="block text-sm text-muted">{l.roman}</span> : null}
                <span className="block text-sm">{l.en}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

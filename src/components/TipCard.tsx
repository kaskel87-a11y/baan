import { useState } from "react";
import { Lightbulb } from "lucide-react";
import type { Voice } from "../data/types";
import type { Tip } from "../data/tips";
import { pick } from "../lib/thai";
import { annotateThai } from "../lib/romanize";
import { Button, HearButton } from "./ui";
import { SayIt } from "./SayIt";

/**
 * A short grammar-in-use or culture tip. Romanization and English lead; Thai script is small and secondary.
 * Each example has Hear, Slow, and Say it (one Say it open at a time so the mic is never shared).
 */
export function TipCard({ tip, voice, open: openInit = true }: { tip: Tip; voice: Voice; open?: boolean }) {
  const [open, setOpen] = useState(openInit);
  const [saying, setSaying] = useState<number | null>(null);
  return (
    <aside data-tip={tip.id} className="rounded-4xl border border-accent/40 bg-card p-5 grid gap-3">
      <button
        type="button"
        className="flex min-h-11 items-start gap-2 text-left"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Lightbulb aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-accent" />
        <span className="grid gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">{tip.kind === "culture" ? "Culture tip" : "Tip"}</span>
          <span className="font-medium">{tip.title}</span>
        </span>
      </button>
      {open ? (
        <>
          <p className="text-sm">{annotateThai(tip.body)}</p>
          <ul className="grid gap-2">
            {tip.examples.map((ex, i) => {
              const thai = pick(ex.thai, voice);
              const roman = pick(ex.roman, voice);
              return (
                <li key={i} className="grid gap-2 rounded-xl border border-line px-3 py-2">
                  <div>
                    <p className="text-lg">{roman}</p>
                    <p className="text-sm">“{ex.en}”</p>
                    <p className="thai text-sm text-muted" lang="th">{thai}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <HearButton text={thai} />
                    <HearButton text={thai} slow />
                    <Button variant={saying === i ? "primary" : "quiet"} onClick={() => setSaying(saying === i ? null : i)}>
                      {saying === i ? "Close Say it" : "Say it"}
                    </Button>
                  </div>
                  {saying === i ? <SayIt key={`${tip.id}-${i}`} target={thai} roman={roman} en={ex.en} /> : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </aside>
  );
}

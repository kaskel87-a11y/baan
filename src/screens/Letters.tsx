import { useMemo, useState } from "react";
import { CONSONANTS, VOWELS } from "../data/letters";
import type { Consonant, ConsonantClass } from "../data/types";
import { recordBest, useStore } from "../lib/store";
import { speak } from "../lib/audio";
import { consonantClass, shuffle } from "../lib/thai";
import { Button, NoVoiceNotice, PageHeader } from "../components/ui";

const LIVE = CONSONANTS.filter((c) => !c.obsolete);
const CLASSES: ConsonantClass[] = ["mid", "high", "low"];
const label = (c: ConsonantClass) => (c === "mid" ? "Mid" : c === "high" ? "High" : "Low");
const sayName = (c: Consonant) => speak(c.chant.replace(/\s/g, ""));

export function Letters() {
  const s = useStore();
  const [filter, setFilter] = useState<"all" | ConsonantClass>("all");
  const [sel, setSel] = useState<Consonant>(CONSONANTS[0]!);
  const [round, setRound] = useState(0);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<ConsonantClass | null>(null);
  const [right, setRight] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const quiz = useMemo(() => shuffle(LIVE).slice(0, 10), [round]);
  const shown = filter === "all" ? CONSONANTS : CONSONANTS.filter((c) => consonantClass(c.letter) === filter);
  const cur = round > 0 ? quiz[qi] : undefined;

  function begin() {
    setRound((r) => r + 1);
    setQi(0);
    setPicked(null);
    setRight(0);
  }

  return (
    <div className="enter grid gap-8">
      <PageHeader kicker="Letters" title="Forty-four consonants. Three classes.">
        <p>
          You don’t memorize a tone for every word. You learn the class of the letter, and the tone follows. Start with the
          ones that show up this week — the whole alphabet is here when you want it.
        </p>
      </PageHeader>
      <NoVoiceNotice />
      <div className="flex flex-wrap gap-2">
        {(["all", "mid", "high", "low"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-11 rounded-xl border px-3 ${filter === f ? "border-accent bg-accent text-accent-ink" : "border-line bg-card"}`}
          >
            {f === "all" ? "All" : label(f)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {shown.map((c) => (
          <button
            key={c.letter}
            type="button"
            aria-pressed={sel.letter === c.letter}
            lang="th"
            onClick={() => {
              setSel(c);
              sayName(c);
            }}
            className={`thai min-h-11 rounded-xl border text-xl ${sel.letter === c.letter ? "border-accent bg-accent text-accent-ink" : "border-line bg-card"}`}
          >
            {c.letter}
          </button>
        ))}
      </div>
      <LetterCard item={sel} />
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Vowels you’ll meet immediately</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {VOWELS.map((v) => (
            <button key={v.sign} type="button" onClick={() => speak(v.thai)} className="rounded-xl border border-line bg-card p-3 text-left">
              <span className="text-sm text-muted">{v.sign} · {v.roman}</span>
              <span className="mt-1 block thai text-2xl" lang="th">{v.thai}</span>
              <span className="block text-sm">{v.en}</span>
              <span className="mt-1 block text-sm text-muted">{v.note}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Class quiz</h2>
        {s.letterBest > 0 ? <p className="text-sm text-muted tabular-nums">Best {s.letterBest} of 10</p> : null}
        {!cur ? (
          <Button
            variant="primary"
            className="justify-self-start"
            onClick={() => {
              begin();
            }}
          >
            Ten letters
          </Button>
        ) : (
          <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
            <p className="text-sm text-muted tabular-nums">
              {qi + 1} of {quiz.length}
              {picked ? ` · ${right} held` : ""}
            </p>
            <p className="thai text-4xl" lang="th">{cur.letter}</p>
            <div className="flex flex-wrap gap-2">
              {CLASSES.map((c) => {
                const truth = consonantClass(cur.letter);
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={!!picked}
                    onClick={() => {
                      const r = c === truth ? right + 1 : right;
                      setPicked(c);
                      setRight(r);
                      sayName(cur);
                      if (qi === quiz.length - 1) recordBest("letter", r);
                    }}
                    className={`min-h-11 rounded-xl border bg-paper px-4 ${picked && c === truth ? "border-accent text-accent" : picked === c ? "border-miss text-miss" : "border-line"}`}
                  >
                    {label(c)}
                  </button>
                );
              })}
            </div>
            {picked ? (
              <p className="text-sm text-muted">
                {cur.letter} is {consonantClass(cur.letter)} class. {cur.chant}.
              </p>
            ) : null}
            {picked ? (
              <Button
                variant="primary"
                className="justify-self-start"
                onClick={() => {
                  if (qi >= quiz.length - 1) {
                    setRound(0);
                    setPicked(null);
                    return;
                  }
                  setQi(qi + 1);
                  setPicked(null);
                }}
              >
                {qi >= quiz.length - 1 ? "Done" : "Next letter"}
              </Button>
            ) : null}
          </article>
        )}
      </section>
    </div>
  );
}

function LetterCard({ item }: { item: Consonant }) {
  const cls = consonantClass(item.letter);
  return (
    <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
      <p className="text-sm font-medium text-muted">
        {label(cls)} class{item.obsolete ? " · obsolete, rarely printed" : ""}
      </p>
      <p className="thai text-4xl" lang="th">{item.letter}</p>
      <p className="thai text-xl" lang="th">{item.chant}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => sayName(item)}>Hear the name</Button>
        {item.example ? <Button onClick={() => speak(item.example!.thai)}>Hear {item.example.thai}</Button> : null}
      </div>
      {item.example ? (
        <p className="text-sm text-muted">
          <span lang="th">{item.example.thai}</span> {item.example.roman} — {item.example.en}
        </p>
      ) : (
        <p className="text-sm text-muted">Learn the class from the name. The mnemonic is the traditional one.</p>
      )}
      {item.note ? <p className="text-sm text-muted">{item.note}</p> : null}
    </article>
  );
}

import { useState } from "react";
import { annotateThai } from "../lib/romanize";
import { VOCAB_BY_ID } from "../data/vocab";
import { dueIds, gradeCard, useStore, type Grade } from "../lib/store";
import { Button, HearButton, PageHeader, SayIt } from "../components/ui";

export function Review() {
  const s = useStore();
  const due = dueIds(s);
  const [dir, setDir] = useState<"thai" | "english">("thai");
  const [i, setI] = useState(0);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(0);

  const q = queue ?? [];
  const id = q[i];
  const card = id ? VOCAB_BY_ID.get(id) : undefined;
  const finished = queue !== null && i >= q.length;

  function start(ids: string[]) {
    setQueue(ids);
    setI(0);
    setRevealed(false);
    setGraded(0);
  }
  function grade(g: Grade) {
    if (!id) return;
    gradeCard(id, g);
    setGraded((n) => n + 1);
    setRevealed(false);
    if (g === "again") setQueue((cur) => [...(cur ?? q), id]);
    setI((n) => n + 1);
  }

  // Answer-leak fix: in From English mode, nothing that gives the Thai away until Show.
  const hideAnswer = dir === "english" && !revealed;

  return (
    <div className="enter grid gap-6">
      <PageHeader kicker="Review" title="Back before they fade.">
        <p>
          From Thai: read the word, say it, then Show to check the sound. From English: produce the Thai yourself, then Show.
          Again if it slipped. Good if you had it. Easy if it was instant. The gap grows when you know it.
        </p>
      </PageHeader>
      {s.introduced.length === 0 ? <p className="text-muted">Nothing is waiting. Walk a conversation and the words land here.</p> : null}
      {s.introduced.length > 0 && queue === null ? (
        <div className="grid gap-3">
          <p className="text-muted tabular-nums">
            {due.length > 0 ? `${due.length} due` : "Nothing due today."} · {s.introduced.length} in play
          </p>
          {due.length > 0 ? (
            <Button variant="primary" className="justify-self-start" onClick={() => start(due.slice(0, 20))}>
              Review {Math.min(due.length, 20)}
            </Button>
          ) : (
            <Button
              className="justify-self-start"
              onClick={() => start([...s.introduced].sort((a, b) => (s.srs[a]?.due ?? 0) - (s.srs[b]?.due ?? 0)).slice(0, 10))}
            >
              Study ahead
            </Button>
          )}
        </div>
      ) : null}
      {queue !== null && card && !finished ? (
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-4">
          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            <p className="tabular-nums">{i + 1} of {q.length}</p>
            <div className="flex gap-2">
              <button type="button" className={`min-h-11 px-2 ${dir === "thai" ? "text-ink" : ""}`} aria-pressed={dir === "thai"} onClick={() => { setDir("thai"); setRevealed(false); }}>
                From Thai
              </button>
              <button type="button" className={`min-h-11 px-2 ${dir === "english" ? "text-ink" : ""}`} aria-pressed={dir === "english"} onClick={() => { setDir("english"); setRevealed(false); }}>
                From English
              </button>
            </div>
          </div>
          {dir === "thai" ? (
            <div className="grid gap-1">
              <p className="thai text-4xl" lang="th">{card.thai}</p>
              <p className="text-lg">“{card.en}”</p>
            </div>
          ) : (
            <p className="font-display text-3xl">{card.en}</p>
          )}
          {hideAnswer ? <p className="text-sm text-muted">Say it in Thai, out loud or in your head, then Show.</p> : <HearButton text={card.thai} />}
          <SayIt target={card.thai} roman={card.roman} en={card.en} hideTarget={hideAnswer} />
          {revealed ? (
            <div className="grid gap-1">
              {dir === "thai" ? null : <p className="thai text-3xl" lang="th">{card.thai}</p>}
              <p className="text-muted">{card.roman}</p>
              {dir === "thai" ? null : <p>“{card.en}”</p>}
              {card.hint ? <p className="text-sm text-muted">{annotateThai(card.hint)}</p> : null}
            </div>
          ) : (
            <Button className="justify-self-start" onClick={() => setRevealed(true)}>Show</Button>
          )}
          {revealed ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => grade("again")}>Again</Button>
              <Button variant="primary" onClick={() => grade("good")}>Good</Button>
              <Button onClick={() => grade("easy")}>Easy</Button>
            </div>
          ) : null}
        </article>
      ) : null}
      {finished ? (
        <div className="grid gap-3">
          <p className="font-display text-3xl">Session done.</p>
          <p className="text-muted tabular-nums">{graded} graded.</p>
          <Button className="justify-self-start" onClick={() => setQueue(null)}>Back</Button>
        </div>
      ) : null}
    </div>
  );
}

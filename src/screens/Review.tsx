import { useMemo, useState } from "react";
import { annotateThai } from "../lib/romanize";
import { buildSessionQueue, resolveCard, type CardKind } from "../lib/cards";
import {
  cardAllowed,
  dueCardIds,
  gradeCard,
  learnedCount,
  newCardIds,
  useStore,
  type Grade,
} from "../lib/store";
import { Button, HearButton, PageHeader, SayIt } from "../components/ui";
import type { Verdict } from "../lib/thai";

const KIND_LABEL: Record<CardKind, string> = {
  listen: "Listen",
  read: "Read (Thai script)",
  produce: "Say it",
};

export function Review({ preset, onDone }: { preset?: string[]; onDone?: (graded: number) => void } = {}) {
  const s = useStore();
  const voice = s.voice ?? "female";
  const due = useMemo(() => dueCardIds(s).filter((id) => (s.srs[id]?.reps ?? 0) >= 1 || s.srs[id]?.relearning), [s]);
  const news = useMemo(() => newCardIds(s, 10), [s]);
  const learned = learnedCount(s);
  const [i, setI] = useState(0);
  const [queue, setQueue] = useState<string[] | null>(() =>
    preset ? preset.filter((cid) => cardAllowed(s, cid) && !!resolveCard(cid, s.voice ?? "female", s.name)) : null,
  );
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(0);
  const [suggest, setSuggest] = useState<Grade | null>(null);

  const q = queue ?? [];
  const id = q[i];
  const card = id ? resolveCard(id, voice, s.name) : null;
  const finished = queue !== null && i >= q.length;

  function start(ids: string[]) {
    setQueue(ids);
    setI(0);
    setRevealed(false);
    setGraded(0);
    setSuggest(null);
  }

  function beginReview() {
    const resolve = (cid: string) => resolveCard(cid, voice, s.name);
    // Due reviews first, then fill with new under the daily cap.
    const reviewedDue = dueCardIds(s).filter((cid) => (s.srs[cid]?.reps ?? 0) >= 1 || s.srs[cid]?.relearning);
    const fresh = newCardIds(s, 10);
    start(buildSessionQueue(reviewedDue, fresh, resolve, 20));
  }

  function grade(g: Grade) {
    if (!id) return;
    gradeCard(id, g);
    setGraded((n) => n + 1);
    setRevealed(false);
    setSuggest(null);
    if (g === "again") setQueue((cur) => [...(cur ?? q), id]);
    setI((n) => n + 1);
  }

  function onVerdict(v: Verdict) {
    if (v === "no") setSuggest("again");
    else if (v === "close") setSuggest("hard");
    else if (v === "yes") setSuggest("good");
  }

  const hideThai = card?.kind === "produce" || card?.kind === "listen" ? !revealed : false;
  const hideAll = card?.kind === "listen" && !revealed;

  const cardView = card ? (
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-4">
          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            <p className="tabular-nums">
              {i + 1} of {q.length}
            </p>
            <p>{KIND_LABEL[card.kind]}</p>
          </div>

          {card.kind === "listen" ? (
            hideAll ? (
              <div className="grid gap-2">
                <p className="text-sm text-muted">Listen, then Show.</p>
                <HearButton text={card.thai} label="Play the phrase" />
                <HearButton text={card.thai} slow />
              </div>
            ) : (
              <div className="grid gap-1">
                <p className="thai text-4xl" lang="th">
                  {card.thai}
                </p>
                {s.roman ? <p className="text-lg text-muted">{card.roman}</p> : null}
                <p className="text-lg">“{card.en}”</p>
              </div>
            )
          ) : null}

          {card.kind === "read" ? (
            <div className="grid gap-1">
              <p className="thai text-4xl" lang="th">
                {card.thai}
              </p>
              {revealed ? (
                <>
                  {s.roman ? <p className="text-lg text-muted">{card.roman}</p> : null}
                  <p className="text-lg">“{card.en}”</p>
                </>
              ) : (
                <p className="text-sm text-muted">Read it aloud, then Show.</p>
              )}
            </div>
          ) : null}

          {card.kind === "produce" ? (
            <div className="grid gap-1">
              <p className="font-display text-3xl">{card.en}</p>
              {revealed ? (
                <>
                  <p className="thai text-3xl" lang="th">
                    {card.thai}
                  </p>
                  <p className="text-muted">{card.roman}</p>
                </>
              ) : (
                <p className="text-sm text-muted">Say it in Thai, out loud or in your head, then Show.</p>
              )}
            </div>
          ) : null}

          {!hideAll && card.kind !== "produce" && revealed ? <HearButton text={card.thai} /> : null}
          {card.kind === "produce" && revealed ? (
            <div className="flex flex-wrap gap-2">
              <HearButton text={card.thai} label="Hear it" />
              <HearButton text={card.thai} slow />
            </div>
          ) : null}
          {card.kind === "listen" && revealed ? (
            <div className="grid gap-1">
              <p className="text-sm text-muted">Now say it back.</p>
              <SayIt key={`${card.id}-echo`} target={card.thai} roman={card.roman} en={card.en} />
            </div>
          ) : null}
          {card.kind === "produce" || card.kind === "read" ? (
            <SayIt
              target={card.thai}
              roman={card.roman}
              en={card.en}
              hideTarget={hideThai}
              onWordVerdict={card.kind === "produce" ? onVerdict : undefined}
            />
          ) : null}

          {revealed && card.hint ? <p className="text-sm text-muted">{annotateThai(card.hint)}</p> : null}

          {!revealed ? (
            <Button className="justify-self-start" onClick={() => setRevealed(true)}>
              Show
            </Button>
          ) : (
            <div className="grid gap-2">
              {suggest ? (
                <p className="text-sm text-muted">
                  Mic check suggests {suggest === "again" ? "Again" : suggest === "hard" ? "Hard" : "Good"}. You can still
                  pick any grade.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => grade("again")}>Again</Button>
                <Button onClick={() => grade("hard")} className={suggest === "hard" ? "ring-2 ring-accent" : ""}>
                  Hard
                </Button>
                <Button
                  variant="primary"
                  onClick={() => grade("good")}
                  className={suggest === "good" ? "ring-2 ring-accent" : ""}
                >
                  Good
                </Button>
                <Button onClick={() => grade("easy")}>Easy</Button>
              </div>
            </div>
          )}
        </article>
  ) : null;

  if (preset) {
    return (
      <div className="grid gap-4">
        {!finished ? cardView : (
          <div className="grid gap-3">
            <p className="font-display text-2xl">Review done.</p>
            <p className="text-muted tabular-nums">{graded} graded.</p>
            <Button variant="primary" className="justify-self-start" onClick={() => onDone?.(graded)}>
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="enter grid gap-6">
      <PageHeader kicker="Review" title="Back before they fade.">
        <p>
          Mostly speaking and listening: say it from the English, or hear it and say it back. Again if it slipped. Hard
          if it was slow. Good if you had it. Easy if it was instant. Missed drills come back here the same day.
        </p>
      </PageHeader>
      {Object.keys(s.srs).filter((k) => k.includes(":")).length === 0 ? (
        <p className="text-muted">Nothing is waiting. Walk a conversation and the words land here.</p>
      ) : null}
      {Object.keys(s.srs).some((k) => k.includes(":")) && queue === null ? (
        <div className="grid gap-3">
          <p className="text-muted tabular-nums">
            {due.length} due · {news.length} new today · {learned} learned
          </p>
          {due.length + news.length > 0 ? (
            <Button variant="primary" className="justify-self-start" onClick={beginReview}>
              Review {Math.min(20, due.length + news.length)}
            </Button>
          ) : (
            <Button
              className="justify-self-start"
              onClick={() => {
                const resolve = (cid: string) => resolveCard(cid, voice, s.name);
                const ahead = Object.keys(s.srs)
                  .filter((cid) => cid.includes(":") && cardAllowed(s, cid))
                  .sort((a, b) => (s.srs[a]?.due ?? 0) - (s.srs[b]?.due ?? 0))
                  .slice(0, 10);
                start(buildSessionQueue(ahead, [], resolve, 10));
              }}
            >
              Study ahead
            </Button>
          )}
        </div>
      ) : null}
      {queue !== null && !finished ? cardView : null}
      {finished ? (
        <div className="grid gap-3">
          <p className="font-display text-3xl">Session done.</p>
          <p className="text-muted tabular-nums">{graded} graded.</p>
          <Button className="justify-self-start" onClick={() => setQueue(null)}>
            Back
          </Button>
        </div>
      ) : null}
    </div>
  );
}

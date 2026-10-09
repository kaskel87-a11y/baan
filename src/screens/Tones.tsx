import { useMemo, useState } from "react";
import { EAR_POOL, MAI_SET, RULE_EXAMPLES, TONE_ANCHORS } from "../data/tones";
import type { ConsonantClass, SyllableKind, Tone, ToneMark, ToneWord } from "../data/types";
import { recordBest, recordPair, useStore } from "../lib/store";
import { speak, speakSequence } from "../lib/audio";
import { shuffle, TONE_LABEL, TONES, toneFromRule } from "../lib/thai";
import {
  accuracy,
  attempts,
  makeTrial,
  pairKey,
  pairsOf,
  phraseItems,
  phraseQuizSupported,
  weakestPairs,
  type PhraseItem,
  type Trial,
} from "../lib/toneTrainer";
import { AnswerLine, Button, NoVoiceNotice, PageHeader, Segmented, ToneShape } from "../components/ui";

const CLASS_OPTS: { id: ConsonantClass; label: string }[] = [
  { id: "mid", label: "Mid" },
  { id: "high", label: "High" },
  { id: "low", label: "Low" },
];
const SYL_OPTS: { id: SyllableKind; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "dead-short", label: "Dead, short" },
  { id: "dead-long", label: "Dead, long" },
];
const MARK_OPTS: { id: ToneMark; label: string }[] = [
  { id: "none", label: "No mark" },
  { id: "ek", label: "่" },
  { id: "tho", label: "้" },
  { id: "tri", label: "๊" },
  { id: "jattawa", label: "๋" },
];

export function Tones() {
  return (
    <div className="enter grid gap-8">
      <PageHeader kicker="Tones" title="Five shapes, and nothing else.">
        <p>
          Thai words that look alike can mean different things. Train the ear against five anchors, then see why the
          script already tells you the tone.
        </p>
      </PageHeader>
      <NoVoiceNotice />
      <Anchors />
      <MaiSet />
      <PairTrainer />
      <PhraseQuiz />
      <Ear />
      <RuleExplorer />
    </div>
  );
}

function Anchors() {
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">The five anchors</h2>
      <p className="text-sm text-muted">Hear them back to back until the shapes separate. A phone voice is a model, not a teacher — compare, and replay.</p>
      <div className="grid gap-2">
        {TONE_ANCHORS.map((a) => (
          <button key={a.tone} type="button" onClick={() => speak(a.thai)} className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-4xl border border-line bg-card p-4 text-left">
            <ToneShape tone={a.tone} className="h-12 w-16 text-accent" />
            <span>
              <span className="block text-sm font-medium text-muted">{TONE_LABEL[a.tone]}</span>
              <span className="thai text-2xl" lang="th">{a.thai}</span>
              <span className="ml-2 text-muted">{a.roman}</span>
              <span className="mt-1 block text-sm">{a.en}. {a.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MaiSet() {
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">ไม่ ใหม่ ไหม ไหม้</h2>
      <p className="text-sm text-muted">The set every learner collides with. ไม่ and ไหม้ are both falling. New is low. The question particle rises.</p>
      <div className="grid grid-cols-2 gap-2">
        {MAI_SET.map((w) => (
          <button key={w.thai} type="button" onClick={() => speak(w.thai)} className="rounded-xl border border-line bg-card p-3 text-left">
            <span className="thai text-2xl" lang="th">{w.thai}</span>
            <span className="mt-1 block text-sm text-muted">{w.roman} · {TONE_LABEL[w.tone]}</span>
            <span className="block text-sm">{w.en}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------------- Minimal-pair trainer (new) ----------------

const SESSION = 20;
const SHORT: Record<Tone, string> = { mid: "Mid", low: "Low", falling: "Fall", high: "High", rising: "Rise" };

function playTrial(t: Trial) {
  if (t.kind === "which") speak(t.target.thai, t.rate, t.voiceIndex);
  else speakSequence([t.first.thai, t.second.thai], t.rates[0], { gapMs: 450, voices: t.voices });
}

function WordChip({ w, highlight }: { w: ToneWord; highlight?: "right" | "wrong" }) {
  return (
    <button
      type="button"
      onClick={() => speak(w.thai)}
      className={`grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border bg-paper p-3 text-left ${highlight === "right" ? "border-accent" : highlight === "wrong" ? "border-miss" : "border-line"}`}
    >
      <ToneShape tone={w.tone} className="h-8 w-12 text-accent" />
      <span>
        <span className="thai text-xl" lang="th">{w.thai}</span>
        <span className="ml-2 text-sm text-muted">{w.roman} · {TONE_LABEL[w.tone]}</span>
        <span className="block text-sm">{w.en} · tap to hear</span>
      </span>
    </button>
  );
}

const tw = (w: ToneWord) => `${w.thai} (${w.roman}, “${w.en}”, ${TONE_LABEL[w.tone].toLowerCase()} tone)`;

/** Plain-English feedback that always names the correct Thai, romanization, meaning, and tone. */
function feedbackText(trial: Trial, answer: string, ok: boolean) {
  if (trial.kind === "which") {
    if (ok) return `Correct. You heard ${tw(trial.target)}.`;
    const picked = trial.options.find((o) => o.thai === answer);
    return `Not quite. You picked ${picked ? tw(picked) : answer}. The word was ${tw(trial.target)}.`;
  }
  const what = trial.same ? `the same word twice: ${tw(trial.first)}` : `two different words: ${tw(trial.first)}, then ${tw(trial.second)}`;
  return `${ok ? "Correct" : "Not quite"}. It was ${what}.`;
}

function PairTrainer() {
  const s = useStore();
  const [mode, setMode] = useState<"which" | "same">("which");
  const [n, setN] = useState(-1); // -1 = not started
  const [trial, setTrial] = useState<Trial | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [right, setRight] = useState(0);

  const weak = weakestPairs(s.toneStats, 1)[0];
  const weakStat = weak ? s.toneStats[pairKey(...weak)] : undefined;
  const totalAttempts = Object.values(s.toneStats).reduce((a, p) => a + attempts(p), 0);

  function begin() {
    const t = makeTrial(mode, s.toneStats, 0);
    setN(0);
    setRight(0);
    setAnswer(null);
    setTrial(t);
    playTrial(t);
  }
  function respond(a: string) {
    if (!trial || answer) return;
    const ok = trial.kind === "which" ? a === trial.target.thai : (a === "same") === trial.same;
    setAnswer(a);
    const r = ok ? right + 1 : right;
    setRight(r);
    if (trial.kind === "which") {
      if (ok) pairsOf(trial).forEach((k) => recordPair(k, true));
      else {
        const picked = trial.options.find((o) => o.thai === a);
        if (picked) recordPair(pairKey(trial.target.tone, picked.tone), false);
      }
    } else {
      // "Same" trials don't name a pair on their own; credit/debit only the different ones.
      pairsOf(trial).forEach((k) => recordPair(k, ok));
    }
    if (n === SESSION - 1) recordBest("pair", r);
  }
  function next() {
    if (n >= SESSION - 1) {
      setN(-1);
      setTrial(null);
      return;
    }
    const t = makeTrial(mode, s.toneStats, n + 1);
    setN(n + 1);
    setAnswer(null);
    setTrial(t);
    playTrial(t);
  }

  const ok = trial && answer ? (trial.kind === "which" ? answer === trial.target.thai : (answer === "same") === trial.same) : null;

  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">Minimal pairs</h2>
      <p className="text-sm text-muted">
        Same syllable, different tone. The trainer keeps score per tone pair and serves your weakest pairs more often. The voice speed changes between plays so you learn the tone, not one recording.
      </p>
      {totalAttempts >= 6 && weak ? (
        <p className="text-sm">
          Your weakest pair: <strong>{TONE_LABEL[weak[0]]} vs {TONE_LABEL[weak[1]]}</strong>
          {attempts(weakStat) ? `, ${Math.round(((weakStat?.right ?? 0) / attempts(weakStat)) * 100)}%` : ", not tried yet"}
          {s.pairBest > 0 ? <span className="text-muted"> · best session {s.pairBest} of {SESSION}</span> : null}
        </p>
      ) : null}
      {totalAttempts > 0 ? <HeatGrid /> : null}
      {n < 0 || !trial ? (
        <div className="grid gap-3">
          <Segmented
            label="Drill"
            value={mode}
            options={[
              { id: "which", label: "Which word?" },
              { id: "same", label: "Same or different?" },
            ]}
            onChange={setMode}
          />
          <Button variant="primary" className="justify-self-start" onClick={begin}>
            Start {SESSION} trials
          </Button>
        </div>
      ) : (
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
          <p className="text-sm text-muted tabular-nums">
            {n + 1} of {SESSION}
            {answer ? ` · ${right} held` : ""}
          </p>
          <Button className="justify-self-start" onClick={() => playTrial(trial)}>
            Play again
          </Button>
          {trial.kind === "which" ? (
            <>
              <p className="text-sm font-medium text-muted">Which word did you hear?</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {trial.options.map((o) => (
                  <button
                    key={o.thai}
                    type="button"
                    disabled={!!answer}
                    onClick={() => respond(o.thai)}
                    className={`min-h-11 rounded-xl border bg-paper px-3 py-3 text-left ${answer && o.thai === trial.target.thai ? "border-accent text-accent" : answer === o.thai ? "border-miss text-miss" : "border-line"}`}
                  >
                    <span className="thai text-2xl" lang="th">{o.thai}</span>
                    <span className="ml-2 text-sm text-muted">{o.roman}</span>
                    <span className="block text-sm text-ink">“{o.en}”</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted">Two words. Same tone and word, or different?</p>
              <div className="flex flex-wrap gap-2">
                {(["same", "different"] as const).map((a) => {
                  const correct = (a === "same") === trial.same;
                  return (
                    <button
                      key={a}
                      type="button"
                      disabled={!!answer}
                      onClick={() => respond(a)}
                      className={`min-h-11 rounded-xl border bg-paper px-4 ${answer && correct ? "border-accent text-accent" : answer === a ? "border-miss text-miss" : "border-line"}`}
                    >
                      {a === "same" ? "Same" : "Different"}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {answer ? (
            <div className="grid gap-2">
              <p className={ok ? "text-sm font-medium text-accent" : "text-sm font-medium text-miss"} data-feedback>
                {feedbackText(trial, answer, !!ok)}
              </p>
              <p className="text-sm text-muted">Tap a word to hear it again and compare.</p>
              {trial.kind === "which" ? (
                <div className="grid gap-2">
                  {trial.options.map((o) => (
                    <WordChip key={o.thai} w={o} highlight={o.thai === trial.target.thai ? "right" : o.thai === answer ? "wrong" : undefined} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  <WordChip w={trial.first} />
                  {trial.same ? null : <WordChip w={trial.second} />}
                </div>
              )}
              <Button variant="primary" className="justify-self-start" onClick={next}>
                {n >= SESSION - 1 ? "Done" : "Next"}
              </Button>
            </div>
          ) : null}
        </article>
      )}
    </section>
  );
}

function HeatGrid() {
  const s = useStore();
  return (
    <div className="grid gap-1" aria-label="Accuracy per tone pair">
      <div className="grid grid-cols-6 gap-1 text-xs text-muted">
        <span />
        {TONES.map((t) => (
          <span key={t} className="text-center">{SHORT[t]}</span>
        ))}
      </div>
      {TONES.map((row) => (
        <div key={row} className="grid grid-cols-6 gap-1 text-xs">
          <span className="text-muted">{TONE_LABEL[row]}</span>
          {TONES.map((col) => {
            if (row === col) return <span key={col} className="h-8 rounded-md bg-line/40" />;
            const st = s.toneStats[pairKey(row, col)];
            const n = attempts(st);
            const acc = n ? (st!.right / n) : null;
            const bad = acc === null ? 0 : 1 - acc;
            return (
              <span
                key={col}
                title={n ? `${TONE_LABEL[row]} vs ${TONE_LABEL[col]}: ${Math.round((acc ?? 0) * 100)}% of ${n}` : "Not tried"}
                className="grid h-8 place-items-center rounded-md tabular-nums"
                style={{
                  background: acc === null ? "var(--color-card)" : `color-mix(in oklab, var(--color-miss) ${Math.round(bad * 85)}%, var(--color-card))`,
                  color: bad > 0.5 ? "var(--color-accent-ink)" : "var(--color-ink)",
                  border: "1px solid var(--color-line)",
                }}
              >
                {acc === null ? "–" : `${Math.round(acc * 100)}`}
              </span>
            );
          })}
        </div>
      ))}
      <p className="text-xs text-muted">% right per pair. Darker = more confusion. Weighting uses a smoothed score ({Math.round(accuracy() * 100)}% for untried pairs).</p>
    </div>
  );
}

// ---------------- Tones inside phrases (new) ----------------

function PhraseQuiz() {
  const s = useStore();
  const voice = s.voice ?? "female";
  const supported = useMemo(() => phraseQuizSupported(), []);
  const pool = useMemo(() => (supported ? phraseItems(voice, s.name) : []), [supported, voice, s.name]);
  const [items, setItems] = useState<PhraseItem[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Tone | null>(null);
  const [right, setRight] = useState(0);
  if (!supported || pool.length === 0) return null;
  const cur = items?.[i];
  const play = (it: PhraseItem) => speak(it.segments.join(""));

  function begin() {
    const pickd = shuffle(pool).slice(0, 10);
    setItems(pickd);
    setI(0);
    setPicked(null);
    setRight(0);
    if (pickd[0]) play(pickd[0]);
  }

  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">Tones inside phrases</h2>
      <p className="text-sm text-muted">Words change shape a little in real sentences. Hear a line from the scenes and name the tone of the marked word.</p>
      {!cur ? (
        <Button variant="primary" className="justify-self-start" onClick={begin}>
          Ten phrases
        </Button>
      ) : (
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
          <p className="text-sm text-muted tabular-nums">
            {i + 1} of {items!.length}
            {picked ? ` · ${right} held` : ""}
          </p>
          <p className="thai text-3xl" lang="th">
            {cur.segments.map((seg, k) =>
              k === cur.focus ? (
                <mark key={k} className="rounded-md bg-accent px-1 text-accent-ink">{seg}</mark>
              ) : (
                <span key={k}>{seg}</span>
              ),
            )}
          </p>
          <p className="text-sm">“{cur.en}”{cur.wordEn ? <span className="text-muted"> · marked word: “{cur.wordEn}”</span> : null}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => play(cur)}>Play the line</Button>
            <Button onClick={() => speak(cur.word, 0.8)}>Just the word</Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                disabled={!!picked}
                onClick={() => {
                  setPicked(t);
                  if (t === cur.tone) setRight((r) => r + 1);
                }}
                className={`min-h-11 rounded-xl border bg-paper px-2 py-2 ${picked && t === cur.tone ? "border-accent text-accent" : picked === t ? "border-miss text-miss" : "border-line"}`}
              >
                <ToneShape tone={t} className="mx-auto h-8 w-12" />
                <span className="mt-1 block text-sm">{TONE_LABEL[t]}</span>
              </button>
            ))}
          </div>
          {picked ? (
            <div className="grid gap-1 text-sm" data-feedback>
              <p className={picked === cur.tone ? "font-medium text-accent" : "font-medium text-miss"}>
                {picked === cur.tone
                  ? `Correct. ${cur.word} (${cur.roman}${cur.wordEn ? `, “${cur.wordEn}”` : ""}) is ${TONE_LABEL[cur.tone].toLowerCase()}.`
                  : `Not quite. You picked ${TONE_LABEL[picked].toLowerCase()}; ${cur.word} (${cur.roman}${cur.wordEn ? `, “${cur.wordEn}”` : ""}) is ${TONE_LABEL[cur.tone].toLowerCase()}.`}
              </p>
              <p className="text-muted">The whole line:</p>
              <AnswerLine thai={cur.segments.join("")} roman={cur.lineRoman} en={cur.en} />
              <Button
                variant="primary"
                className="justify-self-start"
                onClick={() => {
                  if (i >= items!.length - 1) {
                    setItems(null);
                    return;
                  }
                  setI(i + 1);
                  setPicked(null);
                  play(items![i + 1]!);
                }}
              >
                {i >= items!.length - 1 ? "Done" : "Next phrase"}
              </Button>
            </div>
          ) : null}
        </article>
      )}
    </section>
  );
}

// ---------------- Original single-word Ear quiz ----------------

function Ear() {
  const s = useStore();
  const [words, setWords] = useState<ToneWord[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Tone | null>(null);
  const [right, setRight] = useState(0);
  const cur = words[i];

  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">Ear</h2>
      <p className="text-sm text-muted">Single words, any tone. Name the shape.</p>
      {s.toneBest > 0 ? <p className="text-sm text-muted tabular-nums">Best {s.toneBest} of 8</p> : null}
      {!cur ? (
        <Button
          variant="primary"
          className="justify-self-start"
          onClick={() => {
            const w = shuffle(EAR_POOL).slice(0, 8);
            setWords(w);
            setI(0);
            setPicked(null);
            setRight(0);
            if (w[0]) speak(w[0].thai);
          }}
        >
          Hear eight words
        </Button>
      ) : (
        <div className="grid gap-3">
          <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
            <p className="text-sm text-muted tabular-nums">
              {i + 1} of {words.length}
              {picked ? ` · ${right} held` : ""}
            </p>
            <Button className="justify-self-start" onClick={() => speak(cur.thai)}>Play again</Button>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {TONE_ANCHORS.map((a) => (
                <button
                  key={a.tone}
                  type="button"
                  disabled={!!picked}
                  onClick={() => {
                    const r = a.tone === cur.tone ? right + 1 : right;
                    setPicked(a.tone);
                    setRight(r);
                    if (i === words.length - 1) recordBest("tone", r);
                  }}
                  className={`min-h-11 rounded-xl border bg-paper px-2 py-2 ${picked && a.tone === cur.tone ? "border-accent text-accent" : picked === a.tone ? "border-miss text-miss" : "border-line"}`}
                >
                  <ToneShape tone={a.tone} className="mx-auto h-8 w-12" />
                  <span className="mt-1 block text-sm">{TONE_LABEL[a.tone]}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {TONE_ANCHORS.map((a) => (
                <button key={`ref-${a.tone}`} type="button" className="min-h-11 text-sm text-muted" onClick={() => speak(a.thai)}>
                  Compare {TONE_LABEL[a.tone]} · <span lang="th">{a.thai}</span>
                </button>
              ))}
            </div>
            {picked ? (
              <div className="grid gap-1 text-sm" data-feedback>
                <p className={picked === cur.tone ? "font-medium text-accent" : "font-medium text-miss"}>
                  {picked === cur.tone
                    ? `Correct. It's ${TONE_LABEL[cur.tone].toLowerCase()}.`
                    : `Not quite. You picked ${TONE_LABEL[picked].toLowerCase()}; this word is ${TONE_LABEL[cur.tone].toLowerCase()}.`}
                </p>
                <AnswerLine thai={cur.thai} roman={cur.roman} en={cur.en} />
              </div>
            ) : null}
          </article>
          {picked ? (
            <Button
              variant="primary"
              className="justify-self-start"
              onClick={() => {
                if (i + 1 >= words.length) {
                  setWords([]);
                  setPicked(null);
                  return;
                }
                setI(i + 1);
                setPicked(null);
                const n = words[i + 1];
                if (n) speak(n.thai);
              }}
            >
              {i === words.length - 1 ? "Done" : "Next word"}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function RuleExplorer() {
  const [cls, setCls] = useState<ConsonantClass>("mid");
  const [syl, setSyl] = useState<SyllableKind>("live");
  const [mark, setMark] = useState<ToneMark>("none");
  const tone = toneFromRule(cls, syl, mark);
  const ex =
    mark === "tri" && cls === "mid"
      ? RULE_EXAMPLES["mid|live|tri"]
      : mark === "jattawa" && cls === "mid"
        ? RULE_EXAMPLES["mid|dead-short|jattawa"]
        : RULE_EXAMPLES[`${cls}|${syl}|${mark}`];
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-2xl">Why the tone is that tone</h2>
      <p className="text-sm text-muted">
        Three things decide it: the class of the first consonant, whether the syllable can ring (live) or stops short
        (dead), and the mark — if there is one. The same mark means different tones on different classes.
      </p>
      <Segmented label="Class" value={cls} options={CLASS_OPTS} onChange={setCls} />
      <Segmented label="Syllable" value={syl} options={SYL_OPTS} onChange={setSyl} />
      <Segmented label="Mark" value={mark} options={MARK_OPTS} onChange={setMark} />
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
        {tone ? (
          <>
            <div className="flex items-center gap-3 text-accent">
              <ToneShape tone={tone} />
              <p className="font-display text-3xl text-ink">{TONE_LABEL[tone]}</p>
            </div>
            {mark === "tri" || mark === "jattawa" ? <p className="text-sm text-muted">These two marks are rare, almost only on mid-class letters, and they force the tone.</p> : null}
            {ex ? (
              <button type="button" className="text-left" onClick={() => speak(ex.thai)}>
                <span className="thai text-2xl" lang="th">{ex.thai}</span>
                <span className="ml-2 text-muted">{ex.roman}</span>
                <span className="mt-1 block text-sm">{ex.en}</span>
              </button>
            ) : (
              <p className="text-sm text-muted">No example packed for this exact combination. The tone above still holds.</p>
            )}
          </>
        ) : (
          <p>Mai tri and mai jattawa aren’t used on {cls} class consonants.</p>
        )}
      </article>
    </section>
  );
}

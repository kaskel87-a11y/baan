import { useEffect, useMemo, useState } from "react";
import {
  DIGIT_EN,
  DIGIT_ROMAN,
  DIGIT_TH,
  EMPTY_NUMBERS,
  numberEn,
  numberToRoman,
  numberToThai,
  pickHearPrice,
  PRICE_KINDS,
  priceEn,
  priceRoman,
  priceSpoken,
  randomPrice,
  TEACH_NUMBERS,
  THAI_DIGITS,
  type PriceKind,
} from "../lib/numbers";
import { recordNumberRange, recordNumbersBest, useStore } from "../lib/store";
import { particle } from "../lib/thai";
import { navigate } from "../lib/router";
import { speak } from "../lib/audio";
import { AnswerLine, Button, HearButton, NoVoiceNotice, PageHeader, SayIt, Segmented } from "../components/ui";

type Mode = "learn" | "hear" | "say" | "digits";

export function Numbers() {
  const [mode, setMode] = useState<Mode>("learn");
  return (
    <div className="enter grid gap-8">
      <button type="button" className="justify-self-start text-sm text-muted min-h-11" onClick={() => navigate({ name: "path" })}>
        ← Path
      </button>
      <PageHeader kicker="Numbers" title="Prices you’ll hear all day.">
        <p>
          Learn 0–10, the tricky teens and twenties, then hear a vendor price and type the digits. English always stays
          with the Thai.
        </p>
      </PageHeader>
      <NoVoiceNotice />
      <Segmented
        label="Practice"
        value={mode}
        options={[
          { id: "learn", label: "Learn" },
          { id: "hear", label: "Hear" },
          { id: "say", label: "Say" },
          { id: "digits", label: "Digits" },
        ]}
        onChange={setMode}
      />
      {mode === "learn" ? <Learn /> : null}
      {mode === "hear" ? <HearDrill /> : null}
      {mode === "say" ? <SayDrill /> : null}
      {mode === "digits" ? <DigitsDrill /> : null}
    </div>
  );
}

function Learn() {
  const [i, setI] = useState(0);
  const n = TEACH_NUMBERS[i]!;
  const thai = numberToThai(n);
  const roman = numberToRoman(n);
  useEffect(() => {
    speak(thai);
  }, [thai]);
  return (
    <section className="grid gap-3">
      <p className="text-sm text-muted tabular-nums">
        {i + 1} of {TEACH_NUMBERS.length}
      </p>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="font-display text-4xl tabular-nums">{n}</p>
        <AnswerLine thai={thai} roman={roman} en={numberEn(n)} />
        <div className="flex flex-wrap gap-2">
          <HearButton text={thai} />
          <HearButton text={thai} slow />
        </div>
      </article>
      <div className="flex flex-wrap gap-2">
        <Button disabled={i === 0} onClick={() => setI((x) => Math.max(0, x - 1))}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => setI((x) => (x + 1) % TEACH_NUMBERS.length)}
        >
          {i + 1 === TEACH_NUMBERS.length ? "Again from zero" : "Next"}
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {TEACH_NUMBERS.map((v, idx) => (
          <button
            key={v}
            type="button"
            aria-pressed={idx === i}
            onClick={() => setI(idx)}
            className={`min-h-11 rounded-xl border tabular-nums text-sm ${idx === i ? "border-accent bg-accent text-accent-ink" : "border-line bg-card"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </section>
  );
}

const HEAR_LEN = 10;

function HearDrill() {
  const s = useStore();
  const stats = s.numbers ?? EMPTY_NUMBERS;
  const [round, setRound] = useState(0);
  const [qi, setQi] = useState(0);
  const [right, setRight] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [missQueue, setMissQueue] = useState<number[]>([]);
  const items = useMemo(() => {
    const out: { n: number; kind: PriceKind }[] = [];
    for (let k = 0; k < HEAR_LEN; k++) out.push(pickHearPrice(stats));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);
  const cur = round > 0 ? (missQueue[0] != null ? { n: missQueue[0], kind: "street" as PriceKind } : items[qi]) : undefined;
  const part = s.voice ? (particle(s.voice, "statement").thai as "ครับ" | "ค่ะ") : null;
  const spoken = cur ? priceSpoken(cur.n, part) : "";

  useEffect(() => {
    if (spoken) speak(spoken);
  }, [spoken, qi, round, missQueue[0]]);

  function begin() {
    setRound((r) => r + 1);
    setQi(0);
    setRight(0);
    setInput("");
    setChecked(null);
    setMissQueue([]);
  }

  function check() {
    if (!cur || checked != null) return;
    const ok = Number(input.replace(/[^\d]/g, "")) === cur.n;
    setChecked(ok);
    recordNumberRange(cur.n, ok);
    const nextRight = ok ? right + 1 : right;
    setRight(nextRight);
    if (!ok) setMissQueue((q) => [...q, cur.n]);
  }

  function next() {
    if (!cur) return;
    setInput("");
    setChecked(null);
    if (missQueue[0] === cur.n) {
      setMissQueue((q) => q.slice(1));
      return;
    }
    if (qi + 1 >= items.length) {
      recordNumbersBest("hear", right);
      setRound(0);
      return;
    }
    setQi((x) => x + 1);
  }

  if (!cur) {
    return (
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Hear the price</h2>
        <p className="text-sm text-muted">
          A vendor says a price. Type the digits. Misses come back once more in this round.
          {stats.bestHear > 0 ? ` Best ${stats.bestHear} of ${HEAR_LEN}.` : ""}
        </p>
        <RangeSummary />
        <Button variant="primary" className="justify-self-start" onClick={begin}>
          Ten prices
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <p className="text-sm text-muted tabular-nums">
        {qi + 1} of {items.length}
        {checked != null ? ` · ${right} held` : ""}
        {missQueue.length && missQueue[0] === cur.n ? " · miss replay" : ""}
      </p>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">{PRICE_KINDS.find((k) => k.id === cur.kind)?.label ?? "Price"}</p>
        <div className="flex flex-wrap gap-2">
          <HearButton text={spoken} label="Replay price" />
          <HearButton text={spoken} slow label="Slow price" />
        </div>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Baht (digits)</span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="min-h-11 rounded-xl border border-line bg-paper px-3 tabular-nums text-lg"
            value={input}
            disabled={checked != null}
            onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            autoFocus
          />
        </label>
        {checked == null ? (
          <Button variant="primary" className="justify-self-start" disabled={!input} onClick={check}>
            Check
          </Button>
        ) : (
          <div className="grid gap-2">
            <p className={checked ? "text-sm font-medium" : "text-sm font-medium text-muted"}>
              {checked ? "Correct." : "Not quite."}
            </p>
            <AnswerLine thai={spoken} roman={priceRoman(cur.n, part)} en={priceEn(cur.n)} />
            <Button variant="primary" className="justify-self-start" onClick={next}>
              {qi + 1 >= items.length && missQueue[0] !== cur.n && missQueue.length <= 1 ? "Done" : "Next"}
            </Button>
          </div>
        )}
      </article>
    </section>
  );
}

function SayDrill() {
  const s = useStore();
  const stats = s.numbers ?? EMPTY_NUMBERS;
  const [round, setRound] = useState(0);
  const [qi, setQi] = useState(0);
  const [right, setRight] = useState(0);
  const [kind, setKind] = useState<PriceKind>("street");
  const items = useMemo(() => {
    return Array.from({ length: 8 }, () => randomPrice(kind));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, kind]);
  const n = round > 0 ? items[qi] : undefined;
  const part = s.voice ? (particle(s.voice, "statement").thai as "ครับ" | "ค่ะ") : null;
  const thai = n != null ? priceSpoken(n, part) : "";

  function begin() {
    setRound((r) => r + 1);
    setQi(0);
    setRight(0);
  }

  function next(ok: boolean) {
    const nextRight = ok ? right + 1 : right;
    setRight(nextRight);
    if (n != null) recordNumberRange(n, ok);
    if (qi + 1 >= items.length) {
      recordNumbersBest("say", nextRight);
      setRound(0);
      return;
    }
    setQi((x) => x + 1);
  }

  if (n == null) {
    return (
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Say the price</h2>
        <p className="text-sm text-muted">
          See ฿85, say it in Thai. Uses the same Say it check as scenes.
          {stats.bestSay > 0 ? ` Best ${stats.bestSay} of 8.` : ""}
        </p>
        <Segmented
          label="Price band"
          value={kind}
          options={PRICE_KINDS.map((k) => ({ id: k.id, label: k.label }))}
          onChange={setKind}
        />
        <Button variant="primary" className="justify-self-start" onClick={begin}>
          Eight prices
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <p className="text-sm text-muted tabular-nums">
        {qi + 1} of {items.length} · {right} held
      </p>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="font-display text-4xl tabular-nums">฿{n}</p>
        <AnswerLine thai={thai} roman={priceRoman(n, part)} en={priceEn(n)} />
        <SayIt
          key={`${round}-${qi}-${n}`}
          target={thai}
          roman={priceRoman(n, part)}
          en={priceEn(n)}
          onWordVerdict={(v) => {
            /* verdict shown inside SayIt; grading buttons below */
            void v;
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => next(false)}>Missed it</Button>
          <Button variant="primary" onClick={() => next(true)}>
            Got it
          </Button>
        </div>
      </article>
    </section>
  );
}

function DigitsDrill() {
  const s = useStore();
  const stats = s.numbers ?? EMPTY_NUMBERS;
  const [round, setRound] = useState(0);
  const [qi, setQi] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const quiz = useMemo(() => {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    return pool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);
  const cur = round > 0 ? quiz[qi] : undefined;

  function begin() {
    setRound((r) => r + 1);
    setQi(0);
    setRight(0);
    setPicked(null);
  }

  if (cur == null) {
    return (
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Thai digits</h2>
        <p className="text-sm text-muted">
          Read ๑–๙ and tap 1–9.
          {stats.bestDigits > 0 ? ` Best ${stats.bestDigits} of 9.` : ""}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {THAI_DIGITS.slice(1).map((d, i) => (
            <div key={d} className="rounded-xl border border-line bg-card p-3 text-center">
              <p className="thai text-2xl" lang="th">
                {d}
              </p>
              <p className="text-sm text-muted tabular-nums">{i + 1}</p>
            </div>
          ))}
        </div>
        <Button variant="primary" className="justify-self-start" onClick={begin}>
          Nine digits
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <p className="text-sm text-muted tabular-nums">
        {qi + 1} of {quiz.length}
        {picked != null ? ` · ${right} held` : ""}
      </p>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="thai text-5xl text-center" lang="th">
          {THAI_DIGITS[cur]}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
            const truth = cur;
            const show = picked != null;
            const isPick = picked === d;
            const ok = d === truth;
            return (
              <button
                key={d}
                type="button"
                disabled={show}
                onClick={() => {
                  const r = d === truth ? right + 1 : right;
                  setPicked(d);
                  setRight(r);
                  recordNumberRange(d, d === truth);
                }}
                className={`min-h-11 rounded-xl border tabular-nums ${
                  show && ok
                    ? "border-accent bg-accent text-accent-ink"
                    : show && isPick
                      ? "border-line bg-paper text-muted"
                      : "border-line bg-card"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
        {picked != null ? (
          <div className="grid gap-2">
            <AnswerLine
              thai={`${THAI_DIGITS[cur]} · ${DIGIT_TH[cur]}`}
              roman={DIGIT_ROMAN[cur]}
              en={DIGIT_EN[cur]}
            />
            <Button
              variant="primary"
              className="justify-self-start"
              onClick={() => {
                if (qi + 1 >= quiz.length) {
                  recordNumbersBest("digits", right);
                  setRound(0);
                  return;
                }
                setPicked(null);
                setQi((x) => x + 1);
              }}
            >
              {qi + 1 >= quiz.length ? "Done" : "Next"}
            </Button>
          </div>
        ) : null}
      </article>
    </section>
  );
}

function RangeSummary() {
  const s = useStore();
  const ranges = (s.numbers ?? EMPTY_NUMBERS).ranges;
  return (
    <ul className="grid gap-1 text-sm text-muted">
      {(Object.keys(ranges) as (keyof typeof ranges)[]).map((k) => {
        const r = ranges[k];
        const total = r.right + r.wrong;
        const pct = total ? Math.round((100 * r.right) / total) : null;
        return (
          <li key={k} className="tabular-nums">
            {k}
            {pct == null ? " · no tries yet" : ` · ${pct}% of ${total}`}
          </li>
        );
      })}
    </ul>
  );
}

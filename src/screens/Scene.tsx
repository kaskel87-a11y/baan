import { useEffect, useMemo, useState } from "react";
import { annotateThai } from "../lib/romanize";
import { ArrowLeft } from "lucide-react";
import { SCENES } from "../data/scenes";
import { VOCAB_BY_ID } from "../data/vocab";
import type { Drill, Line, Scene as SceneT, Speaker, Vocab, Voice } from "../data/types";
import { completeScene, introduce, touchStreak, useStore } from "../lib/store";
import { speak, speakSequence, stopSpeech } from "../lib/audio";
import { particle, particleNote, pick, shuffle } from "../lib/thai";
import { navigate } from "../lib/router";
import { AnswerLine, Button, HearButton, NoVoiceNotice, RomanKey, SayIt } from "../components/ui";
import { gloss, meaningOf } from "../data/glossary";

const SPEAKERS: Record<Speaker, { th: string; en: string }> = {
  you: { th: "คุณ", en: "You" },
  nid: { th: "นิด", en: "Nid" },
  lung: { th: "ลุง", en: "Lung" },
  wit: { th: "วิทย์", en: "Wit" },
  pla: { th: "ปลา", en: "Pla" },
};

type Phase = "preview" | "talk" | "drill" | "done";
interface Miss {
  en: string;
  thai: string;
  roman?: string;
}
interface Session {
  phase: Phase;
  index: number;
  right: number;
  misses: Miss[];
  picked: string | null;
  verdict: "yes" | "no" | null;
  build: string[];
}

const fresh = (done: boolean): Session => ({
  phase: done ? "done" : "preview",
  index: 0,
  right: 0,
  misses: [],
  picked: null,
  verdict: null,
  build: [],
});

const sessionKey = (id: string) => `baan.scene.${id}`;
function loadSession(id: string): Session | null {
  try {
    const raw = sessionStorage.getItem(sessionKey(id));
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function renderLine(line: Line, voice: Voice, name: string) {
  const n = name.trim() || "…";
  return {
    thai: pick(line.thai, voice).replaceAll("{name}", n),
    roman: pick(line.roman, voice).replaceAll("{name}", n),
  };
}

function drillAnswerThai(d: Drill, voice: Voice) {
  switch (d.kind) {
    case "listen":
    case "read":
      return pick(d.thai, voice);
    case "pick":
      return pick(d.answer, voice);
    case "build":
      return pick(d.answer, voice).join("");
    case "particle":
      return d.stem + particle(voice, d.particleKind).thai;
  }
}
/** English meaning of the drill's correct Thai answer (never the prompt wording). */
function drillMeaning(d: Drill, answerThai: string) {
  if (d.kind === "listen" || d.kind === "read" || d.kind === "build") return d.en;
  return meaningOf(answerThai) ?? gloss(answerThai)?.en ?? d.en.replace(/[“”]/g, "");
}
function drillRoman(d: Drill, voice: Voice) {
  return d.kind === "particle" ? `${d.stemRoman} ${particle(voice, d.particleKind).roman}` : pick(d.roman, voice);
}

export function SceneScreen({ id }: { id: string }) {
  const scene = SCENES.find((s) => s.id === id);
  const st = useStore();
  const voice: Voice = st.voice ?? "female";
  const [session, setSession] = useState<Session>(() => loadSession(id) ?? fresh(!!st.scenes[id]?.completed));

  useEffect(() => {
    try {
      sessionStorage.setItem(sessionKey(id), JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }, [id, session]);
  useEffect(() => () => stopSpeech(), [id]);

  if (!scene) {
    return (
      <div className="grid gap-4">
        <p>That scene is missing.</p>
        <Button onClick={() => navigate({ name: "path" })}>Back</Button>
      </div>
    );
  }
  const words = scene.vocab.map((v) => VOCAB_BY_ID.get(v)).filter(Boolean) as Vocab[];
  const rec = st.scenes[scene.id];
  const idx = SCENES.findIndex((s) => s.id === scene.id);
  const set = (s: Session) => setSession(s);

  function enterTalk() {
    introduce(scene!.vocab);
    touchStreak();
    const first = scene!.lines[0];
    set({ ...fresh(false), phase: "talk" });
    if (first) speak(renderLine(first, voice, st.name).thai);
  }
  function goto(phase: Phase) {
    set({ ...fresh(false), phase });
    if (phase === "talk") {
      const first = scene!.lines[0];
      if (first) speak(renderLine(first, voice, st.name).thai);
    }
    if (phase === "drill") {
      const d = scene!.drills[0];
      if (d?.kind === "listen") speak(pick(d.thai, voice));
    }
  }

  return (
    <div className="enter grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium" onClick={() => navigate({ name: "path" })}>
          <ArrowLeft aria-hidden="true" size={18} />
          Path
        </button>
        <p className="text-sm text-muted tabular-nums">
          {String(idx + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
        </p>
      </div>
      <header className="grid gap-1">
        <p className="thai text-2xl" lang="th">{scene.titleTh}</p>
        <h1 className="font-display text-3xl">{scene.title}</h1>
        <p className="text-muted">{scene.blurb}</p>
      </header>
      <NoVoiceNotice />
      {session.phase === "preview" ? (
        <Preview words={words} index={session.index} roman={st.roman} onIndex={(i) => set({ ...session, index: i })} onStart={enterTalk} />
      ) : null}
      {session.phase === "talk" ? (
        <Talk
          scene={scene}
          index={session.index}
          voice={voice}
          name={st.name}
          roman={st.roman}
          onIndex={(i, text) => {
            set({ ...session, index: i });
            if (text) speak(text);
          }}
          onPractice={() => goto("drill")}
        />
      ) : null}
      {session.phase === "drill" ? (
        <Drills
          scene={scene}
          session={session}
          voice={voice}
          onSession={setSession}
          onDone={(right, misses) => {
            const score = Math.round((right / scene.drills.length) * 100);
            introduce(scene.vocab);
            completeScene(scene.id, score);
            set({ ...session, phase: "done", right, misses, picked: null, verdict: null, build: [] });
          }}
        />
      ) : null}
      {session.phase === "done" ? (
        <Done
          scene={scene}
          right={session.right}
          misses={session.misses}
          savedScore={rec?.last}
          onAgain={() => goto("talk")}
          onDrill={() => goto("drill")}
          onReview={() => navigate({ name: "review" })}
          onNext={(nid) => navigate({ name: "scene", id: nid })}
        />
      ) : null}
    </div>
  );
}

function Preview({ words, index, roman, onIndex, onStart }: { words: Vocab[]; index: number; roman: boolean; onIndex: (i: number) => void; onStart: () => void }) {
  const w = words[index] ?? words[0];
  if (!w) return null;
  const last = index >= words.length - 1;
  return (
    <section className="grid gap-4">
      <p className="text-sm text-muted">Meet the words first, then hear them in the conversation.</p>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm text-muted tabular-nums">Word {index + 1} of {words.length}</p>
        <p className="thai text-4xl" lang="th">{w.thai}</p>
        {roman ? <p className="text-lg text-muted">{w.roman}</p> : null}
        <p>{w.en}</p>
        {w.hint ? <p className="text-sm text-muted">{annotateThai(w.hint)}</p> : null}
        <div className="flex flex-wrap gap-2">
          <HearButton text={w.thai} />
          <HearButton text={w.thai} slow />
        </div>
        <SayIt target={w.thai} roman={w.roman} en={w.en} />
      </article>
      <div className="flex flex-wrap gap-2">
        {index > 0 ? <Button onClick={() => onIndex(index - 1)}>Back</Button> : null}
        {last ? (
          <Button variant="primary" onClick={onStart}>Enter the conversation</Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              const n = words[index + 1];
              onIndex(index + 1);
              if (n) speak(n.thai);
            }}
          >
            Next word
          </Button>
        )}
        {last ? null : <Button variant="ghost" onClick={onStart}>Skip ahead</Button>}
      </div>
    </section>
  );
}

function Talk({
  scene,
  index,
  voice,
  name,
  roman,
  onIndex,
  onPractice,
}: {
  scene: SceneT;
  index: number;
  voice: Voice;
  name: string;
  roman: boolean;
  onIndex: (i: number, text?: string) => void;
  onPractice: () => void;
}) {
  const line = scene.lines[index];
  if (!line) return null;
  const r = renderLine(line, voice, name);
  const who = SPEAKERS[line.who];
  const last = index >= scene.lines.length - 1;
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted tabular-nums">Line {index + 1} of {scene.lines.length}</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => speakSequence(scene.lines.map((l) => renderLine(l, voice, name).thai))}>Play all</Button>
        </div>
      </div>
      {roman ? <RomanKey /> : null}
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm font-medium">
          <span lang="th">{who.th}</span>
          <span className="text-muted"> · {who.en}</span>
        </p>
        <p className="thai text-4xl" lang="th">{r.thai}</p>
        {roman ? <p className="text-lg text-muted">{r.roman}</p> : null}
        <p>{line.en}</p>
        {line.note ? <p className="text-sm text-muted">{annotateThai(line.note)}</p> : null}
        {r.thai.includes("…") ? <p className="text-sm text-muted">Add your name in Settings and this line becomes yours.</p> : null}
        <div className="flex flex-wrap gap-2">
          <HearButton text={r.thai} />
          <HearButton text={r.thai} slow />
        </div>
        <SayIt target={r.thai} roman={r.roman} en={line.en} skip={name.trim() ? [name.trim()] : []} />
      </article>
      <div className="flex flex-wrap gap-2">
        {index > 0 ? (
          <Button
            onClick={() => {
              const p = scene.lines[index - 1];
              onIndex(index - 1, p ? renderLine(p, voice, name).thai : undefined);
            }}
          >
            Back
          </Button>
        ) : null}
        {last ? (
          <Button variant="primary" onClick={onPractice}>Practice what you heard</Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              const n = scene.lines[index + 1];
              onIndex(index + 1, n ? renderLine(n, voice, name).thai : undefined);
            }}
          >
            Next line
          </Button>
        )}
      </div>
    </section>
  );
}

function Drills({
  scene,
  session,
  voice,
  onSession,
  onDone,
}: {
  scene: SceneT;
  session: Session;
  voice: Voice;
  onSession: (fn: Session | ((s: Session) => Session)) => void;
  onDone: (right: number, misses: Miss[]) => void;
}) {
  const d = scene.drills[session.index];
  // Fresh random order every time a drill is shown (the original used a fixed seed per drill id).
  const options = useMemo(
    () => (!d || d.kind === "build" || d.kind === "particle" ? [] : shuffle(d.options)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d?.id, session.index],
  );
  if (!d) return null;
  const answerThai = drillAnswerThai(d, voice);
  const roman = drillRoman(d, voice);
  const locked = session.verdict !== null;
  const buildAnswer = d.kind === "build" ? pick(d.answer, voice) : [];
  const meaning = drillMeaning(d, answerThai);

  function judge(ok: boolean, picked: string) {
    onSession((s) => {
      if (s.verdict) return s;
      return {
        ...s,
        picked,
        verdict: ok ? "yes" : "no",
        right: ok ? s.right + 1 : s.right,
        misses: ok ? s.misses : [...s.misses, { en: meaning, thai: answerThai, roman }],
      };
    });
    speak(answerThai);
  }
  function next() {
    if (session.index >= scene.drills.length - 1) {
      onDone(session.right, session.misses);
      return;
    }
    const n = scene.drills[session.index + 1];
    onSession({ ...session, index: session.index + 1, picked: null, verdict: null, build: [] });
    if (n?.kind === "listen") speak(pick(n.thai, voice));
  }

  return (
    <section className="grid gap-4">
      <p className="text-sm text-muted tabular-nums">Recall {session.index + 1} of {scene.drills.length}</p>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-4">
        <p className="text-sm font-medium text-muted">
          {d.kind === "listen" ? "Listen, then choose." : d.kind === "read" ? "Read, then choose." : d.en}
        </p>
        {d.kind === "listen" ? (
          <div className="grid gap-3">
            <HearButton text={answerThai} label="Play the line" />
            {locked ? <p className="thai text-3xl" lang="th">{answerThai}</p> : null}
          </div>
        ) : null}
        {d.kind === "read" ? <p className="thai text-3xl" lang="th">{answerThai}</p> : null}
        {d.kind === "particle" ? (
          <div className="grid gap-1">
            <p className="thai text-3xl" lang="th">{d.stem}</p>
            <p className="text-muted">{d.stemRoman}</p>
            <p className="text-sm">“{meaningOf(d.stem) ?? meaning}”</p>
          </div>
        ) : null}
        {d.kind === "listen" || d.kind === "read" || d.kind === "pick" ? (
          <div className="grid gap-2">
            {options.map((o, i) => {
              const correct = o === (d.kind === "pick" ? pick(d.answer, voice) : d.en);
              const chosen = session.picked === o;
              return (
                <button
                  key={`${o}-${i}`}
                  type="button"
                  disabled={locked}
                  onClick={() => judge(correct, o)}
                  className={`min-h-11 rounded-xl border bg-paper px-4 py-3 text-left ${locked && correct ? "border-accent text-accent" : locked && chosen ? "border-miss text-miss" : "border-line"}`}
                >
                  <span lang={d.kind === "pick" ? "th" : "en"} className={d.kind === "pick" ? "thai text-xl" : ""}>{o}</span>
                  {d.kind === "pick" && locked && gloss(o) ? (
                    <span className="block text-sm text-muted">
                      {gloss(o)!.roman} · “{gloss(o)!.en}”
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
        {d.kind === "build" ? (
          <Build
            tiles={d.tiles}
            chosen={session.build}
            locked={locked}
            onChange={(b) => onSession((s) => ({ ...s, build: b }))}
            onCheck={() =>
              judge(session.build.length === buildAnswer.length && session.build.every((t, i) => t === buildAnswer[i]), session.build.join(""))
            }
          />
        ) : null}
        {d.kind === "particle" ? (
          <div className="grid gap-2">
            {(["ครับ", "ค่ะ", "คะ"] as const).map((p) => {
              const right = particle(voice, d.particleKind).thai;
              const chosen = session.picked === p;
              const r = p === "ครับ" ? "khráp" : p === "ค่ะ" ? "khâ" : "khá";
              return (
                <button
                  key={p}
                  type="button"
                  disabled={locked}
                  onClick={() => judge(p === right, p)}
                  className={`min-h-11 rounded-xl border bg-paper px-4 py-3 text-left ${locked && p === right ? "border-accent text-accent" : locked && chosen ? "border-miss text-miss" : "border-line"}`}
                >
                  <span className="thai text-xl" lang="th">{p}</span>
                  <span className="ml-3 text-sm text-muted">{r}</span>
                  <span className="block text-sm text-muted">
                    {p === "ครับ" ? "polite ending, male speaker" : p === "ค่ะ" ? "polite ending, female, statements" : "polite ending, female, questions"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        {locked ? (
          <div className="grid gap-1 text-sm" data-feedback>
            <p className={session.verdict === "yes" ? "text-accent font-medium" : "text-miss font-medium"}>
              {session.verdict === "yes" ? "Correct." : "Not quite."}
            </p>
            {session.verdict === "no" && session.picked ? (
              <p className="text-muted">
                You chose: <span lang={/[\u0E00-\u0E7F]/.test(session.picked) ? "th" : "en"}>{session.picked}</span>
                {gloss(session.picked) ? ` (${gloss(session.picked)!.roman}, “${gloss(session.picked)!.en}”)` : ""}
              </p>
            ) : null}
            <p className="text-muted">{session.verdict === "yes" ? "You got:" : "The right answer is:"}</p>
            <AnswerLine thai={answerThai} roman={roman} en={meaning} />
            {d.kind === "particle" ? <p className="text-muted">{annotateThai(particleNote(voice, d.particleKind))}</p> : null}
          </div>
        ) : null}
      </article>
      {locked ? (
        <Button variant="primary" className="justify-self-start" onClick={next}>
          {session.index >= scene.drills.length - 1 ? "Finish" : "Next"}
        </Button>
      ) : null}
    </section>
  );
}

function Build({ tiles, chosen, locked, onChange, onCheck }: { tiles: string[]; chosen: string[]; locked: boolean; onChange: (b: string[]) => void; onCheck: () => void }) {
  // Shuffle the tile bank once per drill so position doesn't give the order away.
  const bank = useMemo(() => shuffle(tiles), [tiles]);
  return (
    <div className="grid gap-3">
      <div className="min-h-16 rounded-xl border border-dashed border-line bg-paper p-3 flex flex-wrap gap-2">
        {chosen.length === 0 ? <p className="text-sm text-muted">Tap the pieces in order.</p> : null}
        {chosen.map((t, i) => (
          <button key={`${t}-${i}`} type="button" disabled={locked} lang="th" className="thai min-h-11 rounded-xl border border-line bg-card px-3 text-lg" onClick={() => onChange(chosen.filter((_, j) => j !== i))}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((t, i) => {
          const used = chosen.filter((c) => c === t).length;
          if (bank.slice(0, i).filter((b) => b === t).length < used) return null;
          return (
            <button key={`${t}-bank-${i}`} type="button" disabled={locked} lang="th" className="thai min-h-11 rounded-xl border border-line bg-card px-3 text-lg" onClick={() => onChange([...chosen, t])}>
              {t}
            </button>
          );
        })}
      </div>
      <Button variant="primary" className="justify-self-start" disabled={locked || chosen.length === 0} onClick={onCheck}>
        Check
      </Button>
    </div>
  );
}

function Done({
  scene,
  right,
  misses,
  savedScore,
  onAgain,
  onDrill,
  onReview,
  onNext,
}: {
  scene: SceneT;
  right: number;
  misses: Miss[];
  savedScore?: number;
  onAgain: () => void;
  onDrill: () => void;
  onReview: () => void;
  onNext: (id: string) => void;
}) {
  const complete = right + misses.length === scene.drills.length && scene.drills.length > 0;
  const score = complete ? Math.round((right / scene.drills.length) * 100) : savedScore;
  const next = SCENES[SCENES.findIndex((s) => s.id === scene.id) + 1];
  return (
    <section className="grid gap-4">
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
        <p className="text-sm text-muted">This scene</p>
        {complete ? (
          <p className="font-display text-4xl tabular-nums">
            {right} <span className="text-muted text-2xl">of {scene.drills.length}</span>
          </p>
        ) : (
          <p className="font-display text-3xl">You already walked through this.</p>
        )}
        {typeof score === "number" ? <p className="text-muted tabular-nums">Last score {score}</p> : null}
        <p className="text-muted">The words are in Review. They’ll come back before you forget them.</p>
      </article>
      {misses.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-sm font-medium">Hear these again</p>
          {misses.map((m) => (
            <div key={m.thai + m.en} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-3 py-2">
              <div>
                <p className="thai text-xl" lang="th">{m.thai}</p>
                {m.roman ? <p className="text-sm text-muted">{m.roman}</p> : null}
                <p className="text-sm">“{m.en}”</p>
              </div>
              <HearButton text={m.thai} />
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onReview}>Review</Button>
        {next ? <Button onClick={() => onNext(next.id)}>Next · {next.title}</Button> : null}
        <Button onClick={onAgain}>Hear it again</Button>
        <Button variant="ghost" onClick={onDrill}>Drill again</Button>
      </div>
    </section>
  );
}

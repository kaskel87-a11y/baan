import { useEffect, useMemo, useRef, useState } from "react";
import { annotateThai } from "../lib/romanize";
import { ArrowLeft } from "lucide-react";
import { SCENES } from "../data/scenes";
import { VOCAB_BY_ID } from "../data/vocab";
import type { Verdict } from "../lib/thai";
import type { Drill, Line, Scene as SceneT, Speaker, Vocab, Voice } from "../data/types";
import { completeScene, dayKey, introduce, markDueNow, touchStreak, useStore } from "../lib/store";
import { cardsForMiss } from "../lib/cards";
import { NORMAL_RATE, SLOW_RATE, slowChunks, speak, speakSequence, stopSpeech } from "../lib/audio";
import { particle, particleNote, pick, shuffle } from "../lib/thai";
import { navigate } from "../lib/router";
import { AnswerLine, Button, HearButton, NoVoiceNotice, RomanKey, SayIt } from "../components/ui";
import { gloss, meaningOf } from "../data/glossary";
import { tipAfterLine, tipsForScene } from "../data/tips";
import { TipCard } from "../components/TipCard";

const SPEAKERS: Record<Speaker, { th: string; en: string }> = {
  you: { th: "คุณ", en: "You" },
  nid: { th: "นิด", en: "Nid" },
  lung: { th: "ลุง", en: "Lung" },
  wit: { th: "วิทย์", en: "Wit" },
  pla: { th: "ปลา", en: "Pla" },
  fon: { th: "ฝน", en: "Fon" },
  bee: { th: "บี", en: "Bee" },
  joy: { th: "จอย", en: "Joy" },
  ning: { th: "นิ้ง", en: "Ning" },
};

type Phase = "preview" | "talk" | "drill" | "roleplay" | "listenrespond" | "shadow" | "done";
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

/** Used by Today: a new scene opens at its word preview, a replay opens straight at the conversation. */
export function primeSceneForToday(id: string, replay: boolean) {
  try {
    sessionStorage.setItem(sessionKey(id), JSON.stringify({ ...fresh(false), phase: replay ? "talk" : "preview" }));
  } catch {
    /* ignore */
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
    introduce(scene!.vocab, { sceneId: scene!.id });
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
          onRolePlay={() => goto("roleplay")}
          onListenRespond={() => goto("listenrespond")}
          onShadow={() => goto("shadow")}
        />
      ) : null}
      {session.phase === "shadow" ? <Shadow scene={scene} voice={voice} name={st.name} onExit={(to) => goto(to)} /> : null}
      {session.phase === "roleplay" ? (
        <RolePlay
          scene={scene}
          voice={voice}
          name={st.name}
          onExit={(to) => goto(to)}
        />
      ) : null}
      {session.phase === "listenrespond" ? (
        <ListenRespond
          scene={scene}
          voice={voice}
          name={st.name}
          onExit={(to) => goto(to)}
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
            introduce(scene.vocab, { sceneId: scene.id });
            for (const m of misses) markDueNow(cardsForMiss(m.thai));
            completeScene(scene.id, score, scene.drills.length);
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
          voice={voice}
          onAgain={() => goto("talk")}
          onRolePlay={() => goto("roleplay")}
          onListenRespond={() => goto("listenrespond")}
          onShadow={() => goto("shadow")}
          onDrill={() => goto("drill")}
          onReview={() => navigate({ name: "review" })}
          onNext={(nid) => navigate({ name: "scene", id: nid })}
          onToday={
            st.today && st.today.date === dayKey(new Date()) && st.today.steps.some((x) => x.kind === "scene" && x.id === scene.id)
              ? () => navigate({ name: "today" })
              : undefined
          }
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
  onRolePlay,
  onListenRespond,
  onShadow,
}: {
  onShadow: () => void;
  scene: SceneT;
  index: number;
  voice: Voice;
  name: string;
  roman: boolean;
  onIndex: (i: number, text?: string) => void;
  onPractice: () => void;
  onRolePlay: () => void;
  onListenRespond: () => void;
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
      {tipAfterLine(scene.id, line.id).map((t) => (
        <TipCard key={t.id} tip={t} voice={voice} />
      ))}
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
          <>
            <Button variant="primary" onClick={onRolePlay}>Role-play it: speak your lines</Button>
            <Button onClick={onListenRespond}>Listen & respond</Button>
            <Button onClick={onShadow}>Shadow: repeat after me</Button>
            <Button onClick={onPractice}>Practice what you heard</Button>
          </>
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
  onToday,
  onRolePlay,
  onListenRespond,
  onShadow,
  voice,
}: {
  voice: Voice;
  onRolePlay: () => void;
  onListenRespond: () => void;
  onShadow: () => void;
  onToday?: () => void;
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
      {tipsForScene(scene.id).length > 0 ? (
        <div className="grid gap-2" data-scene-tips>
          <p className="text-sm font-medium">Tips from this scene</p>
          {tipsForScene(scene.id).map((t) => (
            <TipCard key={t.id} tip={t} voice={voice} open={false} />
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {onToday ? <Button variant="primary" onClick={onToday}>Continue today’s session</Button> : null}
        <Button variant={onToday ? "quiet" : "primary"} onClick={onReview}>Review</Button>
        {next ? <Button onClick={() => onNext(next.id)}>Next · {next.title}</Button> : null}
        <Button onClick={onRolePlay}>Role-play: speak your lines</Button>
        <Button onClick={onListenRespond}>Listen & respond</Button>
        <Button onClick={onShadow}>Shadow: repeat after me</Button>
        <Button onClick={onAgain}>Hear it again</Button>
        <Button variant="ghost" onClick={onDrill}>Drill again</Button>
      </div>
    </section>
  );
}

/**
 * Babbel-style dialogue role-play, speaking-first: the partner's lines play aloud (Thai + romanization + English),
 * and on your turns you see the English and the romanization as a cue and say the line out loud.
 * Thai script for your line is optional ("Show Thai"). Layout stays fixed: the action row never moves.
 */
function RolePlay({ scene, voice, name, onExit }: { scene: SceneT; voice: Voice; name: string; onExit: (to: Phase) => void }) {
  const [i, setI] = useState(0);
  const [showThai, setShowThai] = useState(false);
  const [cue, setCue] = useState(true);
  const [results, setResults] = useState<Record<string, Verdict>>({});
  const lines = scene.lines;
  const yours = lines.filter((l) => l.who === "you");
  const line = lines[i];
  useEffect(() => {
    const l = lines[i];
    if (l && l.who !== "you") speak(renderLine(l, voice, name).thai);
    setShowThai(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  if (i >= lines.length || !line) {
    const good = yours.filter((l) => results[l.id] === "yes").length;
    const close = yours.filter((l) => results[l.id] === "close").length;
    return (
      <section className="grid gap-4" data-roleplay-done>
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
          <p className="text-sm text-muted">Role-play finished</p>
          <p className="font-display text-3xl tabular-nums">
            {good} <span className="text-muted text-2xl">of {yours.length} lines clear</span>
          </p>
          {close ? <p className="text-muted">{close} close. Say those once more and they’ll land.</p> : null}
          <p className="text-muted">Speaking your own lines out loud, in order, is the fastest way to make them come out on the street.</p>
        </article>
        <div className="grid gap-2">
          {yours.map((l) => {
            const r = renderLine(l, voice, name);
            const v = results[l.id];
            return (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-3 py-2">
                <div>
                  <p className="text-sm">“{l.en}”</p>
                  <p className="text-sm text-muted">{r.roman} · <span className="thai" lang="th">{r.thai}</span></p>
                  <p className={`text-xs ${v === "yes" ? "text-accent" : v === "close" ? "text-muted" : "text-miss"}`}>
                    {v === "yes" ? "Clear" : v === "close" ? "Close" : v === "no" ? "Not heard right yet" : "Not tried"}
                  </p>
                </div>
                <HearButton text={r.thai} />
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => { setResults({}); setI(0); }}>Role-play again</Button>
          <Button onClick={() => onExit("drill")}>Practice drills</Button>
          <Button variant="ghost" onClick={() => onExit("talk")}>Hear it again</Button>
        </div>
      </section>
    );
  }
  const r = renderLine(line, voice, name);
  const mine = line.who === "you";
  const who = SPEAKERS[line.who];
  const prev = i > 0 ? lines[i - 1] : undefined;
  return (
    <section className="grid gap-4" data-roleplay>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted tabular-nums">Role-play · line {i + 1} of {lines.length}</p>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={cue} onChange={(e) => setCue(e.target.checked)} />
          Show romanization cue
        </label>
      </div>
      {prev && mine && prev.who !== "you" ? (
        <p className="text-sm text-muted">
          {SPEAKERS[prev.who].en} said: {renderLine(prev, voice, name).roman} · “{prev.en}”
        </p>
      ) : null}
      <article className={`rounded-4xl border bg-card p-5 grid gap-3 ${mine ? "border-accent" : "border-line"}`}>
        <p className="text-sm text-muted">{mine ? "Your turn. Say it out loud." : `${who.en} says`}</p>
        <p className="font-display text-2xl">“{line.en}”</p>
        {mine ? (
          <>
            <p className="text-lg text-muted min-h-7">{cue ? r.roman : "Try it from the English first."}</p>
            <div className="min-h-10">
              {showThai ? (
                <p className="thai text-2xl" lang="th">{r.thai} <span className="font-sans text-sm text-muted">{r.roman}</span></p>
              ) : (
                <button type="button" className="min-h-10 text-sm underline text-muted" onClick={() => setShowThai(true)}>Show Thai script (optional)</button>
              )}
            </div>
            <SayIt
              key={line.id}
              target={r.thai}
              roman={r.roman}
              en={line.en}
              hideTarget
              skip={name.trim() ? [name.trim()] : []}
              onWordVerdict={(v) => setResults((x) => ({ ...x, [line.id]: x[line.id] === "yes" ? "yes" : v }))}
            />
          </>
        ) : (
          <>
            <p className="text-lg">{r.roman}</p>
            <p className="thai text-2xl" lang="th">{r.thai}</p>
            <div className="flex flex-wrap gap-2">
              <HearButton text={r.thai} />
              <HearButton text={r.thai} slow />
            </div>
          </>
        )}
      </article>
      <div className="flex flex-wrap gap-2">
        <Button disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <Button variant="primary" onClick={() => setI(i + 1)}>
          {i >= lines.length - 1 ? "Finish" : mine ? "Next line" : "Your turn next"}
        </Button>
        {mine ? <HearButton text={r.thai} /> : null}
      </div>
    </section>
  );
}

/** Partner→you turns only: hear the cue with audio alone, then say or pick your reply. English for both lines appears after you answer. */
function partnerYouExchanges(scene: SceneT): { cue: Line; reply: Line }[] {
  const out: { cue: Line; reply: Line }[] = [];
  for (let i = 0; i < scene.lines.length - 1; i++) {
    const cue = scene.lines[i];
    const reply = scene.lines[i + 1];
    if (cue && reply && cue.who !== "you" && reply.who === "you") out.push({ cue, reply });
  }
  return out;
}

function ListenRespond({ scene, voice, name, onExit }: { scene: SceneT; voice: Voice; name: string; onExit: (to: Phase) => void }) {
  const turns = useMemo(() => partnerYouExchanges(scene), [scene]);
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"say" | "pick">("say");
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [cueOn, setCueOn] = useState(true);
  const [showThai, setShowThai] = useState(false);
  const turn = turns[i];

  useEffect(() => {
    setRevealed(false);
    setPicked(null);
    setOk(null);
    setShowThai(false);
    if (turn) speak(renderLine(turn.cue, voice, name).thai);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const pickOpts = useMemo(() => {
    if (!turn) return [] as string[];
    const yours = scene.lines.filter((l) => l.who === "you");
    const distractors = shuffle(yours.filter((l) => l.id !== turn.reply.id)).slice(0, 2);
    return shuffle([turn.reply, ...distractors].map((l) => l.en));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn?.reply.id, i]);

  if (!turns.length) {
    return (
      <section className="grid gap-4" data-listenrespond-empty>
        <p className="text-muted">This scene has no listen-and-respond turns yet.</p>
        <Button onClick={() => onExit("talk")}>Back to the conversation</Button>
      </section>
    );
  }

  if (i >= turns.length || !turn) {
    const good = Object.values(results).filter(Boolean).length;
    return (
      <section className="grid gap-4" data-listenrespond-done>
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
          <p className="text-sm text-muted">Listen & respond finished</p>
          <p className="font-display text-3xl tabular-nums">
            {good} <span className="text-muted text-2xl">of {turns.length} replies clear</span>
          </p>
          <p className="text-muted">Hearing the other person first, then answering, is how real conversations feel on the street.</p>
        </article>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => { setResults({}); setI(0); }}>Listen & respond again</Button>
          <Button onClick={() => onExit("roleplay")}>Role-play your lines</Button>
          <Button variant="ghost" onClick={() => onExit("talk")}>Hear it again</Button>
        </div>
      </section>
    );
  }

  const cueR = renderLine(turn.cue, voice, name);
  const replyR = renderLine(turn.reply, voice, name);
  const who = SPEAKERS[turn.cue.who];

  function lockPick(choice: string) {
    if (revealed) return;
    const correct = choice === turn!.reply.en;
    setPicked(choice);
    setOk(correct);
    setRevealed(true);
    setResults((x) => ({ ...x, [turn!.reply.id]: correct }));
    speak(replyR.thai);
  }

  function next() {
    setI(i + 1);
  }

  return (
    <section className="grid gap-4" data-listenrespond>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted tabular-nums">Listen & respond · {i + 1} of {turns.length}</p>
        <div className="flex gap-2 text-sm">
          <button type="button" className={`min-h-11 rounded-xl border px-3 ${mode === "say" ? "border-accent text-accent" : "border-line"}`} onClick={() => setMode("say")}>Say it</button>
          <button type="button" className={`min-h-11 rounded-xl border px-3 ${mode === "pick" ? "border-accent text-accent" : "border-line"}`} onClick={() => setMode("pick")}>Pick</button>
        </div>
      </div>

      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">{who.en} is speaking. Listen first.</p>
        {revealed ? (
          <>
            <p className="font-display text-2xl">“{turn.cue.en}”</p>
            <p className="text-lg text-muted">{cueR.roman}</p>
            <p className="thai text-2xl" lang="th">{cueR.thai}</p>
          </>
        ) : (
          <p className="text-muted">You’ll see what they said in English after you answer.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <HearButton text={cueR.thai} label="Play again" />
          <HearButton text={cueR.thai} slow />
        </div>
      </article>

      <article className="rounded-4xl border border-accent bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">Your reply</p>
        {mode === "say" ? (
          <>
            <label className="inline-flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={cueOn} onChange={(e) => setCueOn(e.target.checked)} />
              Show romanization cue
            </label>
            <p className="text-lg text-muted min-h-7">{cueOn ? replyR.roman : "Answer from what you heard."}</p>
            <div className="min-h-10">
              {showThai ? (
                <p className="thai text-2xl" lang="th">{replyR.thai} <span className="font-sans text-sm text-muted">{replyR.roman}</span></p>
              ) : (
                <button type="button" className="min-h-10 text-sm underline text-muted" onClick={() => setShowThai(true)}>Show Thai script (optional)</button>
              )}
            </div>
            <SayIt
              key={turn.reply.id}
              target={replyR.thai}
              roman={replyR.roman}
              en={turn.reply.en}
              hideTarget
              skip={name.trim() ? [name.trim()] : []}
              onWordVerdict={(v) => {
                if (revealed) return;
                const clear = v === "yes";
                setOk(clear);
                setRevealed(true);
                setResults((x) => ({ ...x, [turn.reply.id]: clear || x[turn.reply.id] === true }));
              }}
            />
          </>
        ) : (
          <div className="grid gap-2">
            {pickOpts.map((o, idx) => {
              const correct = o === turn.reply.en;
              const chosen = picked === o;
              return (
                <button
                  key={`${o}-${idx}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => lockPick(o)}
                  className={`min-h-11 rounded-xl border bg-paper px-4 py-3 text-left ${revealed && correct ? "border-accent text-accent" : revealed && chosen ? "border-miss text-miss" : "border-line"}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        )}
        {revealed ? (
          <div className="grid gap-1 text-sm" data-feedback>
            <p className={ok ? "text-accent font-medium" : "text-miss font-medium"}>
              {ok ? "Clear." : mode === "pick" ? "Not quite." : "Keep going. Here’s the reply."}
            </p>
            <p className="text-muted">You say:</p>
            <AnswerLine thai={replyR.thai} roman={replyR.roman} en={turn.reply.en} />
            <div className="flex flex-wrap gap-2 pt-1">
              <HearButton text={replyR.thai} />
              <HearButton text={replyR.thai} slow />
            </div>
          </div>
        ) : mode === "say" ? (
          <Button variant="ghost" className="justify-self-start" onClick={() => { setRevealed(true); setOk(null); }}>Show the reply</Button>
        ) : null}
      </article>

      <div className="flex flex-wrap gap-2">
        <Button disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <Button variant="primary" disabled={!revealed} onClick={next}>
          {i >= turns.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </section>
  );
}

/** How long to leave for your echo: roughly the line's length at speaking pace, plus breathing room. */
function echoMs(roman: string, slow: boolean) {
  const syl = roman.replace(/[.,!?…"“”()]/g, " ").split(/[\s-]+/).filter(Boolean).length;
  return Math.round(Math.max(2500, syl * (slow ? 750 : 550) + 1300));
}

/**
 * Shadowing (repeat after me): every line of the scene plays, then there's a timed pause for you to echo it out loud.
 * "Check me" mode: one line at a time, then Say it and Check my tones on your echo.
 * "Hands-free" mode: plays the whole scene line by line with echo pauses and no taps (no mic, so it never fights the speaker).
 * English and romanization always show; Thai script is optional.
 */
function Shadow({ scene, voice, name, onExit }: { scene: SceneT; voice: Voice; name: string; onExit: (to: Phase) => void }) {
  const lines = scene.lines;
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"check" | "handsfree">("check");
  const [speed, setSpeed] = useState<"normal" | "slow">("normal");
  const [showThai, setShowThai] = useState(false);
  const [stage, setStage] = useState<{ kind: "idle" } | { kind: "playing" } | { kind: "echo"; ms: number; n: number }>({ kind: "idle" });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, Verdict>>({});
  const [echoes, setEchoes] = useState(0);
  const run = useRef(0);
  const timers = useRef<number[]>([]);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const halt = () => {
    run.current++;
    clearTimers();
    stopSpeech();
    setStage({ kind: "idle" });
    setRunning(false);
  };

  function play(idx: number, auto: boolean) {
    const l = lines[idx];
    if (!l) return;
    clearTimers();
    const id = ++run.current;
    const r = renderLine(l, voice, name);
    const slow = speedRef.current === "slow";
    const parts = slow ? slowChunks(r.thai) : [r.thai];
    let ended = false;
    const afterAudio = () => {
      if (ended || id !== run.current) return;
      ended = true;
      clearTimers();
      const ms = echoMs(r.roman, slow);
      setStage({ kind: "echo", ms, n: id });
      timers.current.push(
        window.setTimeout(() => {
          if (id !== run.current) return;
          setStage({ kind: "idle" });
          setEchoes((e) => e + 1);
          if (!auto) return;
          if (idx + 1 < lines.length) {
            setI(idx + 1);
            play(idx + 1, true);
          } else {
            setRunning(false);
            setI(lines.length);
          }
        }, ms),
      );
    };
    setStage({ kind: "playing" });
    speakSequence(parts, slow ? SLOW_RATE() : NORMAL_RATE(), { gapMs: slow ? 280 : 0, onDone: afterAudio });
    // If the browser never reports the end of speech (or has no Thai voice), move on after a generous estimate.
    timers.current.push(window.setTimeout(afterAudio, echoMs(r.roman, slow) * (slow ? 2 : 1.5) + 2500));
  }

  // Check me: each new line plays once by itself.
  useEffect(() => {
    if (mode === "check" && i < lines.length) play(i, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, mode]);
  useEffect(
    () => () => {
      run.current++;
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const go = (to: number) => {
    halt();
    setI(to);
  };

  if (i >= lines.length) {
    const tried = lines.filter((l) => results[l.id]);
    const clear = tried.filter((l) => results[l.id] === "yes").length;
    return (
      <section className="grid gap-4" data-shadow-done>
        <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
          <p className="text-sm text-muted">Shadowing finished</p>
          <p className="font-display text-3xl">You echoed all {lines.length} lines.</p>
          {tried.length ? (
            <p className="text-muted tabular-nums">{clear} of {tried.length} checked lines came through clear.</p>
          ) : (
            <p className="text-muted">Next time, use Check me on a few lines to see how your tones land.</p>
          )}
          <p className="text-muted">Copying the rhythm and melody right after a native speaker trains your mouth and your ear at once. Doing a scene twice in a row helps more than once.</p>
        </article>
        <div className="grid gap-2">
          {lines.map((l) => {
            const r = renderLine(l, voice, name);
            const v = results[l.id];
            return (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-3 py-2">
                <div>
                  <p className="text-sm">“{l.en}”</p>
                  <p className="text-sm text-muted">{r.roman} · <span className="thai" lang="th">{r.thai}</span></p>
                  {v ? (
                    <p className={`text-xs ${v === "yes" ? "text-accent" : v === "close" ? "text-muted" : "text-miss"}`}>
                      {v === "yes" ? "Clear" : v === "close" ? "Close" : "Not heard right yet"}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <HearButton text={r.thai} />
                  <HearButton text={r.thai} slow />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => { setResults({}); setEchoes(0); setI(0); }}>Shadow again</Button>
          <Button onClick={() => onExit("roleplay")}>Role-play your lines</Button>
          <Button variant="ghost" onClick={() => onExit("talk")}>Hear it again</Button>
        </div>
      </section>
    );
  }

  const line = lines[i]!;
  const r = renderLine(line, voice, name);
  const mine = line.who === "you";
  const who = SPEAKERS[line.who];
  return (
    <section className="grid gap-4" data-shadow>
      <div className="grid gap-1">
        <p className="text-sm text-muted tabular-nums">Shadowing · line {i + 1} of {lines.length}</p>
        <p className="text-sm text-muted">Listen, then echo the line out loud right away. Copy the melody, not just the words.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["check", "handsfree"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            className={`min-h-11 rounded-xl border px-3 text-sm ${mode === m ? "border-accent text-accent" : "border-line"}`}
            onClick={() => { if (m !== mode) { halt(); setMode(m); } }}
          >
            {m === "check" ? "Check me" : "Hands-free"}
          </button>
        ))}
        {(["normal", "slow"] as const).map((sp) => (
          <button
            key={sp}
            type="button"
            aria-pressed={speed === sp}
            className={`min-h-11 rounded-xl border px-3 text-sm ${speed === sp ? "border-accent text-accent" : "border-line"}`}
            onClick={() => setSpeed(sp)}
          >
            {sp === "normal" ? "Normal speed" : "Slow"}
          </button>
        ))}
      </div>
      <article className={`rounded-4xl border bg-card p-5 grid gap-3 ${mine ? "border-accent" : "border-line"}`}>
        <p className="text-sm text-muted">{mine ? "Your line" : `${who.en} says`}</p>
        <p className="font-display text-2xl">“{line.en}”</p>
        <p className="text-xl">{r.roman}</p>
        <div className="min-h-10">
          {showThai ? (
            <p className="thai text-2xl" lang="th">{r.thai}</p>
          ) : (
            <button type="button" className="min-h-10 text-sm underline text-muted" onClick={() => setShowThai(true)}>Show Thai script (optional)</button>
          )}
        </div>
        <div className="min-h-12 grid content-center gap-2" aria-live="polite">
          {stage.kind === "playing" ? (
            <p className="text-sm text-muted">Listen…</p>
          ) : stage.kind === "echo" ? (
            <>
              <p className="text-sm font-medium text-accent">Your turn: echo it now.</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <div key={stage.n} className="h-full origin-left bg-accent" style={{ animation: `baan-shrink ${stage.ms}ms linear forwards` }} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              {mode === "handsfree" ? (running ? "…" : "Press Start and keep the phone nearby. No tapping needed.") : "Echo it again, or check your echo below."}
            </p>
          )}
        </div>
        {mode === "check" ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => play(i, false)}>Play and echo again</Button>
            </div>
            <SayIt
              key={line.id}
              target={r.thai}
              roman={r.roman}
              en={line.en}
              skip={name.trim() ? [name.trim()] : []}
              onWordVerdict={(v) => setResults((x) => ({ ...x, [line.id]: x[line.id] === "yes" ? "yes" : v }))}
            />
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {running ? (
              <Button variant="primary" onClick={halt}>Pause</Button>
            ) : (
              <Button variant="primary" onClick={() => { setRunning(true); play(i, true); }}>{i === 0 && echoes === 0 ? "Start" : "Resume"}</Button>
            )}
          </div>
        )}
      </article>
      <div className="flex flex-wrap gap-2">
        <Button disabled={i === 0} onClick={() => go(i - 1)}>Back</Button>
        <Button variant={mode === "check" ? "primary" : "quiet"} onClick={() => go(i + 1)}>
          {i >= lines.length - 1 ? "Finish" : "Next line"}
        </Button>
        <Button variant="ghost" onClick={() => { halt(); onExit("talk"); }}>Leave</Button>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Snail } from "lucide-react";
import { STORIES, type Story } from "../data/stories";
import { SCENES } from "../data/scenes";
import { NORMAL_RATE, SLOW_RATE, speakSequence, stopSpeech } from "../lib/audio";
import { shuffle } from "../lib/thai";
import { logItems, recordStory, useStore } from "../lib/store";
import { navigate } from "../lib/router";
import { Button, HearButton, NoVoiceNotice, PageHeader } from "../components/ui";

const sceneTitle = (id: string) => SCENES.find((s) => s.id === id)?.title ?? id;

export function Stories() {
  const [openId, setOpenId] = useState<string | null>(null);
  const story = STORIES.find((s) => s.id === openId);
  useEffect(() => () => stopSpeech(), []);
  if (story)
    return (
      <StoryPlayer
        key={story.id}
        story={story}
        onBack={() => {
          stopSpeech();
          setOpenId(null);
          window.scrollTo(0, 0);
        }}
        onNext={(id) => {
          stopSpeech();
          setOpenId(id);
          window.scrollTo(0, 0);
        }}
      />
    );
  return <StoryList onOpen={(id) => { setOpenId(id); window.scrollTo(0, 0); }} />;
}

function StoryList({ onOpen }: { onOpen: (id: string) => void }) {
  const s = useStore();
  return (
    <div className="enter grid gap-6" data-stories>
      <PageHeader kicker="Listening stories" title="Hear a short story, then answer in English.">
        Each story is under a minute and uses words from the scenes. Listen first with no text, then answer a few questions.
        After that you get the full story with romanization, English, and Thai.
      </PageHeader>
      <NoVoiceNotice />
      <ol className="grid gap-2">
        {STORIES.map((st, i) => {
          const rec = s.stories?.[st.id];
          const ready = st.scenes.every((id) => s.scenes[id]?.completed);
          return (
            <li key={st.id}>
              <button
                type="button"
                onClick={() => onOpen(st.id)}
                className="grid w-full grid-cols-[auto_1fr] gap-3 rounded-xl border border-line bg-card p-4 text-left"
              >
                <span className="text-sm tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-lg">{st.title}</span>
                  <span className="block text-sm text-muted">
                    <span className="thai" lang="th">{st.titleTh}</span> · {st.titleRoman}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Words from {st.scenes.map(sceneTitle).join(", ")}
                    {ready ? "" : " (fine to try before you finish those scenes)"}
                    {rec ? ` · best ${rec.best} of ${rec.total}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <Button className="justify-self-start" onClick={() => navigate({ name: "path" })}>Back to Path</Button>
    </div>
  );
}

type Phase = "listen" | "questions" | "done";

function StoryPlayer({ story, onBack, onNext }: { story: Story; onBack: () => void; onNext: (id: string) => void }) {
  const [phase, setPhase] = useState<Phase>("listen");
  const [playing, setPlaying] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const [romanOn, setRomanOn] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const texts = story.sentences.map((x) => x.thai);
  const idx = STORIES.findIndex((s) => s.id === story.id);
  const nextStory = STORIES[idx + 1];

  const options = useMemo(() => story.questions.map((q) => shuffle(q.options)), [story]);

  const play = (slow: boolean, from = 0) => {
    setPlays((p) => p + 1);
    speakSequence(texts.slice(from), slow ? SLOW_RATE() : NORMAL_RATE(), {
      gapMs: slow ? 1100 : 700,
      onStep: (i) => setPlaying(from + i),
      onDone: () => setPlaying(null),
    });
  };
  const stop = () => {
    stopSpeech();
    setPlaying(null);
  };
  useEffect(() => () => stopSpeech(), []);

  const controls = (
    <div className="flex flex-wrap gap-2">
      {playing === null ? (
        <>
          <Button variant="primary" onClick={() => play(false)}>
            <Play aria-hidden="true" size={18} />
            {plays ? "Play the story again" : "Play the story"}
          </Button>
          <Button onClick={() => play(true)}>
            <Snail aria-hidden="true" size={18} />
            Slowly
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={stop}>
          <Pause aria-hidden="true" size={18} />
          Stop
        </Button>
      )}
    </div>
  );

  const header = (
    <header className="grid gap-1">
      <p className="text-sm text-muted">Listening story {idx + 1} of {STORIES.length}</p>
      <h1 className="font-display text-3xl">{story.title}</h1>
      <p className="text-muted">
        <span className="thai" lang="th">{story.titleTh}</span> · {story.titleRoman}
      </p>
    </header>
  );

  if (phase === "listen") {
    return (
      <section className="enter grid gap-5" data-story-listen>
        {header}
        <article className="rounded-4xl border border-accent bg-card p-5 grid gap-4">
          <p className="text-muted">
            Listen to the whole story first. Play it as many times as you like, or tap a line number to hear one sentence again.
            English comes after the questions.
          </p>
          {controls}
          <ol className="grid gap-2" aria-label="Sentences">
            {story.sentences.map((x, i) => (
              <li key={i} className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Play sentence ${i + 1}`}
                  onClick={() => play(false, i)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm tabular-nums ${playing === i ? "border-accent bg-accent text-accent-ink" : "border-line bg-paper"}`}
                >
                  {i + 1}
                </button>
                <span className="text-muted">{romanOn ? x.roman : playing === i ? "Playing…" : ""}</span>
              </li>
            ))}
          </ol>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={romanOn} onChange={(e) => setRomanOn(e.target.checked)} />
            Show romanization while I listen
          </label>
        </article>
        <NoVoiceNotice />
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => { stop(); setPhase("questions"); }}>
            Answer the questions
          </Button>
          <Button variant="ghost" onClick={onBack}>All stories</Button>
        </div>
      </section>
    );
  }

  if (phase === "questions") {
    const q = story.questions[qi]!;
    const answer = q.options[0]!;
    const opts = options[qi]!;
    const last = qi === story.questions.length - 1;
    const choose = (o: string) => {
      if (picked) return;
      setPicked(o);
      if (o === answer) setRight((r) => r + 1);
      logItems(1);
    };
    const advance = () => {
      if (last) {
        recordStory(story.id, right, story.questions.length);
        stop();
        setPhase("done");
        window.scrollTo(0, 0);
      } else {
        setQi(qi + 1);
        setPicked(null);
      }
    };
    return (
      <section className="enter grid gap-5" data-story-questions>
        {header}
        <p className="text-sm text-muted tabular-nums">Question {qi + 1} of {story.questions.length}</p>
        <article className="rounded-4xl border border-accent bg-card p-5 grid gap-3">
          <h2 className="font-display text-2xl">{q.q}</h2>
          <div className="grid gap-2">
            {opts.map((o) => {
              const correct = o === answer;
              const chosen = picked === o;
              return (
                <button
                  key={o}
                  type="button"
                  disabled={!!picked}
                  onClick={() => choose(o)}
                  className={`min-h-11 rounded-xl border bg-paper px-4 py-3 text-left ${picked && correct ? "border-accent text-accent" : picked && chosen ? "border-miss text-miss" : "border-line"}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked ? (
            <p className="text-sm" data-story-feedback>
              {picked === answer ? "Right." : `Not quite. The answer is: ${answer}`}
            </p>
          ) : null}
        </article>
        <div className="grid gap-2">
          <p className="text-sm text-muted">Not sure? Hear the story again.</p>
          {controls}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={!picked} onClick={advance}>{last ? "See the story" : "Next"}</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="enter grid gap-5" data-story-done>
      {header}
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-2">
        <p className="text-sm text-muted">Story finished</p>
        <p className="font-display text-3xl tabular-nums">
          {right} <span className="text-muted text-2xl">of {story.questions.length} right</span>
        </p>
        <p className="text-muted">Now read along while it plays, then try saying each line out loud after it.</p>
        {controls}
      </article>
      <ol className="grid gap-2" data-story-transcript>
        {story.sentences.map((x, i) => (
          <li key={i} className={`rounded-xl border bg-card p-4 grid gap-1 ${playing === i ? "border-accent" : "border-line"}`}>
            <p className="font-display text-lg">“{x.en}”</p>
            <p className="text-lg text-muted">{x.roman}</p>
            <p className="thai text-2xl" lang="th">{x.thai} <span className="font-sans text-sm text-muted">{x.roman}</span></p>
            <div className="flex flex-wrap gap-2">
              <HearButton text={x.thai} />
              <HearButton text={x.thai} slow />
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        {nextStory ? <Button variant="primary" onClick={() => onNext(nextStory.id)}>Next story · {nextStory.title}</Button> : null}
        <Button onClick={() => { setPhase("listen"); setQi(0); setPicked(null); setRight(0); }}>Try this story again</Button>
        <Button variant="ghost" onClick={onBack}>All stories</Button>
      </div>
    </section>
  );
}

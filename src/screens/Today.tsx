import { SCENES } from "../data/scenes";
import { advanceToday, dayKey, liveStreak, startToday, useStore } from "../lib/store";
import { navigate } from "../lib/router";
import { activeToday, planToday, stepLabel, stepMinutes } from "../lib/today";
import { Button, NoVoiceNotice, PageHeader } from "../components/ui";
import { Review } from "./Review";
import { PairTrainer } from "./Tones";
import { HearDrill } from "./Numbers";
import { primeSceneForToday } from "./Scene";
import { StreakDots } from "../components/StreakDots";

export function Today() {
  const s = useStore();
  const t = activeToday(s);
  const rec = s.history[dayKey(new Date())] ?? { items: 0, minutes: 0 };

  if (!t || t.step >= t.steps.length) {
    const plan = planToday(s);
    const mins = plan.reduce((a, st) => a + stepMinutes(st), 0);
    const doneToday = !!t && t.step >= t.steps.length;
    return (
      <div className="enter grid gap-6">
        <button type="button" className="justify-self-start text-sm text-muted min-h-11" onClick={() => navigate({ name: "path" })}>
          ← Path
        </button>
        <PageHeader kicker="Today" title={doneToday ? "Today’s session is done." : "One short mixed session."}>
          <p>
            {doneToday
              ? `${rec.items} graded today, about ${Math.round(rec.minutes)} active minute${Math.round(rec.minutes) === 1 ? "" : "s"}. Streak ${liveStreak(s)}.`
              : "Reviews, a tone round, a scene, and a few prices. Finish later any time and pick up at the same step."}
          </p>
        </PageHeader>
        <StreakDots />
        <ol className="grid gap-2">
          {plan.map((st, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
              <span>{stepLabel(st)}</span>
              <span className="text-sm text-muted tabular-nums">~{stepMinutes(st)} min</span>
            </li>
          ))}
        </ol>
        <Button variant="primary" className="justify-self-start" onClick={() => startToday(plan)}>
          {doneToday ? "Another round" : `Start today’s session · ~${mins} min`}
        </Button>
      </div>
    );
  }

  const st = t.steps[t.step]!;
  return (
    <div className="enter grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="text-sm font-medium min-h-11" onClick={() => navigate({ name: "path" })}>
          Finish later
        </button>
        <p className="text-sm text-muted tabular-nums">
          Step {t.step + 1} of {t.steps.length} · {rec.met ? "goal met" : `${rec.items} of ${s.dailyGoal} graded`}
        </p>
      </div>
      <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={t.steps.length} aria-valuenow={t.step} aria-label="Today's session">
        {t.steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < t.step ? "bg-accent" : i === t.step ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
      <p className="font-display text-2xl">{stepLabel(st)}</p>
      <NoVoiceNotice />
      {st.kind === "review" ? <Review key={`r${t.step}`} preset={st.cards} onDone={() => advanceToday()} /> : null}
      {st.kind === "tones" ? <PairTrainer key={`t${t.step}`} length={st.trials} embedded onDone={() => advanceToday()} /> : null}
      {st.kind === "numbers" ? <HearDrill key={`n${t.step}`} length={st.items} onDone={() => advanceToday()} /> : null}
      {st.kind === "scene" ? <SceneStep id={st.id} replay={st.replay} /> : null}
      <Button variant="ghost" className="justify-self-start" onClick={() => advanceToday()}>
        Skip this step
      </Button>
    </div>
  );
}

function SceneStep({ id, replay }: { id: string; replay: boolean }) {
  const sc = SCENES.find((x) => x.id === id);
  if (!sc) return null;
  return (
    <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
      <p className="text-sm text-muted">{replay ? "Your weakest scene, once more" : "Next scene"}</p>
      <h2 className="thai text-3xl" lang="th">{sc.titleTh}</h2>
      <p className="font-display text-xl">{sc.title}</p>
      <p className="text-sm text-muted">{sc.blurb}</p>
      <p className="text-sm text-muted">Finish its drills and you’ll come straight back here.</p>
      <Button
        variant="primary"
        className="justify-self-start"
        onClick={() => {
          primeSceneForToday(id, replay);
          navigate({ name: "scene", id });
        }}
      >
        Open the scene
      </Button>
    </article>
  );
}

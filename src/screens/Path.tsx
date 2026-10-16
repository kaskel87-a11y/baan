import { SCENES } from "../data/scenes";
import { STORIES } from "../data/stories";
import { dayKey, dueIds, liveStreak, useStore } from "../lib/store";
import { activeToday, planToday, stepMinutes } from "../lib/today";
import { StreakDots } from "../components/StreakDots";
import { navigate } from "../lib/router";
import { Button } from "../components/ui";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-2xl tabular-nums">{value}</dd>
    </div>
  );
}

export function Path() {
  const s = useStore();
  const due = dueIds(s).length;
  const done = SCENES.filter((sc) => s.scenes[sc.id]?.completed).length;
  const next = SCENES.find((sc) => !s.scenes[sc.id]?.completed) ?? SCENES[0]!;
  const open = (id: string) => navigate({ name: "scene", id });
  const t = activeToday(s);
  const rec = s.history[dayKey(new Date())] ?? { items: 0, minutes: 0 };
  const inProgress = !!t && t.step < t.steps.length;
  const sessionDone = !!t && t.step >= t.steps.length;
  const mins = planToday(s).reduce((a, st) => a + stepMinutes(st), 0);
  return (
    <div className="enter grid gap-6">
      <header className="grid gap-2">
        <p className="thai text-4xl" lang="th">สวัสดี</p>
        <p className="text-sm text-muted">sà-wàt-dii · “hello”</p>
        <h1 className="font-display text-3xl md:text-4xl">A day in the city, spoken.</h1>
        <p className="max-w-prose text-muted">
          {SCENES.length} conversations, in order. Hear each one, role-play your lines, or listen and respond. Everything comes with English and romanization, and what you meet comes back in Review.
        </p>
      </header>
      <article className="rounded-4xl border border-accent bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">Today</p>
        <h2 className="font-display text-xl">
          {rec.met ? "Goal met for today." : inProgress ? `Step ${t!.step + 1} of ${t!.steps.length} waiting.` : "About " + mins + " minutes, all mixed."}
        </h2>
        <p className="text-sm text-muted tabular-nums">
          {Math.min(rec.items, s.dailyGoal)} of {s.dailyGoal} graded today · the goal is a finished session or {s.dailyGoal} graded items
        </p>
        <StreakDots />
        <Button variant="primary" className="justify-self-start" onClick={() => navigate({ name: "today" })}>
          {inProgress ? "Resume today’s session" : sessionDone ? "Today’s session" : "Start today’s session"}
        </Button>
      </article>
      <div className="flex gap-1" aria-hidden="true">
        {SCENES.map((sc) => {
          const c = !!s.scenes[sc.id]?.completed;
          const cur = sc.id === next.id && !c;
          return <div key={sc.id} className={`h-1 flex-1 rounded-full ${c ? "bg-accent" : cur ? "bg-ink" : "bg-line"}`} />;
        })}
      </div>
      <dl className="grid grid-cols-3 gap-2">
        <Stat label="Streak" value={String(liveStreak(s))} />
        <Stat label="Due" value={String(due)} />
        <Stat label="Scenes" value={`${done}/${SCENES.length}`} />
      </dl>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">Listening stories</p>
        <h2 className="font-display text-xl">Hear a short story, answer in English.</h2>
        <p className="text-sm text-muted">{STORIES.length} stories under a minute each, built from the scene words.</p>
        <Button variant="primary" className="justify-self-start" onClick={() => navigate({ name: "stories" })}>
          Open Stories
        </Button>
      </article>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">Numbers & prices</p>
        <h2 className="font-display text-xl">Hear a price, type the digits.</h2>
        <p className="text-sm text-muted">0–10, teens, tens, then vendor prices with บาท.</p>
        <Button variant="primary" className="justify-self-start" onClick={() => navigate({ name: "numbers" })}>
          Open Numbers
        </Button>
      </article>
      <article className="rounded-4xl border border-line bg-card p-5 grid gap-3">
        <p className="text-sm text-muted">{done === SCENES.length ? "Walk it again" : "Continue"}</p>
        <h2 className="thai text-3xl" lang="th">{next.titleTh}</h2>
        <p className="font-display text-xl">{next.title}</p>
        <p className="text-sm text-muted">{next.blurb}</p>
        <Button variant="primary" className="justify-self-start" onClick={() => open(next.id)}>
          Open the scene
        </Button>
      </article>
      <ol className="grid gap-2">
        {SCENES.map((sc, i) => {
          const rec = s.scenes[sc.id];
          return (
            <li key={sc.id}>
              <button
                type="button"
                onClick={() => open(sc.id)}
                className="grid w-full grid-cols-[auto_1fr] gap-3 rounded-xl border border-line bg-card p-4 text-left"
              >
                <span className="text-sm tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="thai block text-xl" lang="th">{sc.titleTh}</span>
                  <span className="block">{sc.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {sc.blurb}
                    {rec?.completed ? ` · last ${rec.last}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

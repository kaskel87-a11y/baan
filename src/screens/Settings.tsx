import { useState } from "react";
import { clearProgress, setDailyGoal, setName, setReadCards, setRoman, setVoice, useStore } from "../lib/store";
import { Button } from "../components/ui";

export function Settings() {
  const s = useStore();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="enter grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm text-muted">Settings</p>
        <h1 className="font-display text-3xl">Your voice in the lessons</h1>
      </header>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Particle</legend>
        <div className="flex flex-wrap gap-2">
          <Button variant={s.voice === "male" ? "primary" : "quiet"} onClick={() => setVoice("male")}>ครับ · male</Button>
          <Button variant={s.voice === "female" ? "primary" : "quiet"} onClick={() => setVoice("female")}>ค่ะ / คะ · female</Button>
        </div>
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        Name
        <input value={s.name} onChange={(e) => setName(e.target.value)} maxLength={40} className="min-h-11 rounded-xl border border-line bg-card px-3 font-normal" />
      </label>
      <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-card px-3">
        <span className="text-sm font-medium">Show romanization in scenes</span>
        <input type="checkbox" checked={s.roman} onChange={(e) => setRoman(e.target.checked)} className="size-5 accent-accent" />
      </label>
      <div className="grid gap-1">
        <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-card px-3">
          <span className="text-sm font-medium">Thai script reading cards in Review</span>
          <input type="checkbox" checked={!!s.readCards} onChange={(e) => setReadCards(e.target.checked)} className="size-5 accent-accent" />
        </label>
        <p className="text-sm text-muted">Off by default, so Review is all Say it and Listen. Your reading progress is kept if you turn it back on.</p>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Daily goal (graded items, or finish today’s session)</legend>
        <div className="flex flex-wrap gap-2">
          {[10, 15, 25, 40].map((g) => (
            <Button key={g} variant={s.dailyGoal === g ? "primary" : "quiet"} onClick={() => setDailyGoal(g)}>
              {g}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted">The streak only grows on days you meet the goal.</p>
      </fieldset>
      <div className="grid gap-2">
        <Button
          className="justify-self-start"
          onClick={() => {
            if (!confirm) {
              setConfirm(true);
              return;
            }
            clearProgress();
            setConfirm(false);
          }}
        >
          {confirm ? "Tap again to clear progress" : "Clear progress"}
        </Button>
        <p className="text-sm text-muted">Keeps your particle and name. Words, scores, tone stats, and the streak go.</p>
      </div>
    </div>
  );
}

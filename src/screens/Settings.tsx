import { useState } from "react";
import { clearProgress, setName, setRoman, setVoice, useStore } from "../lib/store";
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
          <Button variant={s.voice === "male" ? "primary" : "quiet"} onClick={() => setVoice("male")}>ครับ</Button>
          <Button variant={s.voice === "female" ? "primary" : "quiet"} onClick={() => setVoice("female")}>ค่ะ / คะ</Button>
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

import { useState } from "react";
import type { Voice } from "../data/types";
import { finishOnboarding } from "../lib/store";
import { Button } from "../components/ui";

function Choice({ pressed, onClick, th, particle, copy }: { pressed: boolean; onClick: () => void; th: string; particle: string; copy: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`grid gap-1 rounded-4xl border p-4 text-left ${pressed ? "border-accent bg-card" : "border-line bg-card"}`}
    >
      <span className="thai text-2xl" lang="th">{th}</span>
      <span className="thai text-lg" lang="th">{particle}</span>
      <span className="text-sm text-muted">{copy}</span>
    </button>
  );
}

export function Onboarding() {
  const [voice, setVoice] = useState<Voice | null>(null);
  const [name, setName] = useState("");
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-xl gap-6 px-4 py-10">
      <header className="grid gap-2">
        <p className="thai text-4xl" lang="th">บ้าน</p>
        <p className="text-sm text-muted">bâan · “home”</p>
        <h1 className="font-display text-3xl md:text-4xl">Learn Thai by living a day in it.</h1>
        <p className="text-muted">
          Polite Thai ends with a particle that depends on the speaker. Pick the one you will say. You can change it later.
        </p>
      </header>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (voice) finishOnboarding(voice, name);
        }}
      >
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Your particle</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice pressed={voice === "male"} onClick={() => setVoice("male")} th="ผม" particle="ครับ" copy="ผม phǒm = “I” (male speaker). ครับ khráp = polite ending: high tone, the same on statements and questions." />
            <Choice pressed={voice === "female"} onClick={() => setVoice("female")} th="ฉัน" particle="ค่ะ / คะ" copy="ฉัน chǎn = “I” (often female). Polite ending: statements take ค่ะ khâ (falling), questions take คะ khá (high)." />
          </div>
        </fieldset>
        <label className="grid gap-2 text-sm font-medium">
          Your name, as you’ll say it
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="nickname"
            placeholder="Optional"
            className="min-h-11 rounded-xl border border-line bg-card px-3 font-normal"
          />
          <span className="font-normal text-muted">It drops into the name line. Leave it blank and the line keeps a pause.</span>
        </label>
        <Button variant="primary" type="submit" disabled={!voice} className="justify-self-start">
          Begin the morning
        </Button>
      </form>
      <p className="text-sm text-muted">You’ll hear Thai out loud. Headphones help.</p>
    </main>
  );
}

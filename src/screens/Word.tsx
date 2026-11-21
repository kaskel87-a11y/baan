import { useEffect } from "react";
import { VOCAB_BY_ID } from "../data/vocab";
import { introduce } from "../lib/store";
import { speak } from "../lib/audio";
import { HearButton } from "../components/ui";
import { SayIt } from "../components/SayIt";
import { navigate } from "../lib/router";

/** Opened from a word notification: the word, audio, and a quick say-it review. */
export function WordScreen({ id }: { id: string }) {
  const w = VOCAB_BY_ID.get(id);
  useEffect(() => {
    if (!w) return;
    introduce([w.id]);
    speak(w.thai);
  }, [w]);
  if (!w) {
    return (
      <div className="enter grid gap-3">
        <h1 className="font-display text-3xl">That word isn't in Baan.</h1>
        <button type="button" className="min-h-11 justify-self-start text-sm font-medium underline" onClick={() => navigate({ name: "path" })}>
          Back to the path
        </button>
      </div>
    );
  }
  return (
    <div className="enter grid gap-4">
      <header className="grid gap-1">
        <p className="text-sm text-muted">Word notification</p>
        <h1 className="thai text-4xl" lang="th">{w.thai}</h1>
        <p className="text-lg text-muted">{w.roman}</p>
        <p className="text-xl">{w.en}</p>
      </header>
      <div className="flex flex-wrap gap-2">
        <HearButton text={w.thai} />
        <HearButton text={w.thai} slow />
      </div>
      {w.hint ? <p className="text-sm text-muted">{w.hint}</p> : null}
      <SayIt target={w.thai} roman={w.roman} en={w.en} />
      <p className="text-sm text-muted">It's in Review, so it will come back.</p>
    </div>
  );
}

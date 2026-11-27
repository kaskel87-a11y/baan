import { useState } from "react";
import { MILESTONES, MILESTONE_BY_ID, type Milestone } from "../data/rewards";
import { liveStreak, useStore } from "../lib/store";
import { earnedCount, progressOf, rewardMetrics, rewardsOf } from "../lib/rewards";
import { navigate } from "../lib/router";
import { BadgeArt } from "../components/BadgeArt";
import { BadgeContent } from "../components/BadgeContent";
import { NextBadge } from "../components/NextBadge";
import { Sheet } from "../components/RewardSheet";

const GROUPS: { title: string; blurb: string; kinds: Milestone["kind"][] }[] = [
  { title: "Streaks", blurb: "Meet your daily goal, day after day.", kinds: ["streak"] },
  { title: "Scenes", blurb: "Finish the conversations.", kinds: ["scenes"] },
  { title: "Review", blurb: "Words that have really stuck.", kinds: ["words"] },
  { title: "Firsts", blurb: "Speak it, then hear a story.", kinds: ["rolePlay", "story"] },
  { title: "Tone ears", blurb: "Hear the difference in the Tones trainer.", kinds: ["tones"] },
];

export function Rewards() {
  const s = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const cur = rewardsOf(s);
  const x = rewardMetrics(s, liveStreak(s));
  const n = earnedCount(s);
  const openM = open ? MILESTONE_BY_ID.get(open) : undefined;
  return (
    <div className="enter grid gap-6">
      <button type="button" className="justify-self-start text-sm text-muted min-h-11" onClick={() => navigate({ name: "path" })}>
        ← Path
      </button>
      <header className="grid gap-2">
        <p className="text-sm text-muted">Rewards</p>
        <h1 className="font-display text-3xl">Your badges</h1>
        <p className="text-muted">
          <span className="tabular-nums">{n}</span> of <span className="tabular-nums">{MILESTONES.length}</span> collected. Each one comes with a Thai line to say and something fun to know.
        </p>
      </header>
      <NextBadge link={false} />
      {GROUPS.map((g) => {
        const list = MILESTONES.filter((m) => g.kinds.includes(m.kind));
        const nextId = list.find((m) => !cur.earned[m.id])?.id;
        return (
          <section key={g.title} className="grid gap-3" aria-label={g.title}>
            <div>
              <h2 className="font-display text-xl">{g.title}</h2>
              <p className="text-sm text-muted">{g.blurb}</p>
            </div>
            <ul className="grid grid-cols-3 gap-3">
              {list.map((m) => {
                const got = !!cur.earned[m.id];
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(m.id)}
                      className="grid w-full justify-items-center gap-1 rounded-2xl border border-line bg-card p-2 text-center transition-transform duration-150 active:scale-[0.97]"
                      data-badge={m.id}
                      data-earned={got ? "yes" : "no"}
                    >
                      <BadgeArt m={m} locked={!got} next={!got && m.id === nextId} />
                      <span className={`text-xs leading-tight ${got ? "text-ink font-medium" : "text-muted"}`}>{m.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {openM ? (
        <Sheet label={cur.earned[openM.id] ? `Badge: ${openM.title}` : `Locked badge: ${openM.title}`} onClose={() => setOpen(null)} closeLabel="Done">
          {cur.earned[openM.id] ? (
            <BadgeContent m={openM} />
          ) : (
            <div className="grid justify-items-center gap-3 pb-2 text-center">
              <div className="w-40">
                <BadgeArt m={openM} locked />
              </div>
              <h2 className="font-display text-3xl">{openM.title}</h2>
              <p>{openM.ask}</p>
              <p className="text-sm text-muted">{progressOf(openM, x).text}</p>
              <p className="text-sm text-muted">Earn it to unlock its Thai line{openM.cartoon ? ", a short cartoon," : ""} and a fun fact.</p>
            </div>
          )}
        </Sheet>
      ) : null}
    </div>
  );
}

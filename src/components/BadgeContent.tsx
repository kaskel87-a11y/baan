import { useMemo } from "react";
import { STREAK_CARTOONS } from "../data/streakCartoons";
import { CONGRATS, type Fact, type Milestone } from "../data/rewards";
import { badgeShareContent, streakShareContent, type StreakMilestone } from "../lib/share";
import { useStore } from "../lib/store";
import { BadgeArt } from "./BadgeArt";
import { ShareCardPanel } from "./ShareMoment";
import { HearButton, SayIt } from "./ui";
import { WatchScene } from "./WatchScene";

export function badgeShare(m: Milestone) {
  return m.kind === "streak" ? streakShareContent(m.need as StreakMilestone) : badgeShareContent(m.id, m.title, { thai: m.say.thai, roman: m.say.roman });
}

/** A short "did you know" tied to a badge. Clean and kid-safe. */
export function FactCard({ fact }: { fact: Fact }) {
  const s = useStore();
  return (
    <article className="grid gap-2 rounded-2xl border border-line bg-card p-4" data-fact-card>
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Did you know?</p>
      <h3 className="font-display text-xl">{fact.title}</h3>
      <p className="text-sm">{fact.body}</p>
      {fact.thai ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2">
          <div className="min-w-0">
            <p className="thai text-2xl" lang="th">{fact.thai}</p>
            {s.roman && fact.roman ? <p className="text-sm text-muted">{fact.roman}</p> : null}
            {fact.en ? <p className="text-sm">{fact.en}</p> : null}
          </div>
          <HearButton text={fact.thai} />
        </div>
      ) : null}
    </article>
  );
}

/** Everything a badge shows: the sticker, the Thai line to say, its cartoon, and its fact card. */
export function BadgeContent({ m, celebrate = false }: { m: Milestone; celebrate?: boolean }) {
  const s = useStore();
  const content = useMemo(() => badgeShare(m), [m]);
  const cartoon = m.cartoon ? STREAK_CARTOONS[m.cartoon] : null;
  return (
    <div className="grid gap-4">
      <div className="mx-auto w-44">
        <div className={celebrate ? "badge-pop" : ""}>
          <BadgeArt m={m} />
        </div>
      </div>
      <div className="grid justify-items-center gap-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{celebrate ? "New badge" : "Badge"}</p>
        <h2 className="font-display text-3xl">{m.title}</h2>
        {celebrate ? (
          <div className="mt-2 grid justify-items-center gap-0.5">
            <p className="thai text-2xl" lang="th">{CONGRATS.thai}</p>
            {s.roman ? <p className="text-sm text-muted">{CONGRATS.roman}</p> : null}
            <p className="text-sm">{CONGRATS.en}</p>
          </div>
        ) : null}
      </div>
      <article className="grid gap-2 rounded-2xl border border-line bg-card p-4" data-badge-say>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Say it</p>
        <p className="thai text-3xl" lang="th">{m.say.thai}</p>
        {s.roman ? <p className="text-lg text-muted">{m.say.roman}</p> : null}
        <p>{m.say.en}</p>
        <div className="flex flex-wrap gap-2">
          <HearButton text={m.say.thai} />
          <HearButton text={m.say.thai} slow />
        </div>
        <SayIt target={m.say.thai} roman={m.say.roman} en={m.say.en} />
      </article>
      {cartoon ? <WatchScene cartoon={cartoon} roman={s.roman} autoPlay={celebrate} kicker={celebrate ? "Congratulations" : "Watch the cartoon"} /> : null}
      <FactCard fact={m.fact} />
      <section className="grid gap-2" aria-label="Share this badge">
        <p className="text-sm text-muted">Share this badge</p>
        <ShareCardPanel content={content} />
      </section>
    </div>
  );
}

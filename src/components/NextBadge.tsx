import { liveStreak, useStore } from "../lib/store";
import { earnedCount, nextMilestone } from "../lib/rewards";
import { MILESTONES } from "../data/rewards";
import { navigate } from "../lib/router";
import { BadgeArt } from "./BadgeArt";

/** The closest unearned badge with a progress bar, to pull you back. Links to the Rewards shelf. */
export function NextBadge({ className = "", link = true }: { className?: string; link?: boolean }) {
  const s = useStore();
  const next = nextMilestone(s, liveStreak(s));
  const n = earnedCount(s);
  return (
    <article className={`grid gap-3 rounded-2xl border border-line bg-card p-4 ${className}`} data-next-badge>
      <div className="flex items-center gap-4">
        {next ? (
          <div className="w-16 shrink-0">
            <BadgeArt m={next.m} locked next />
          </div>
        ) : null}
        <div className="grid min-w-0 gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{next ? "Next badge" : "Badges"}</p>
          <p className="font-display text-xl leading-snug">{next ? next.m.title : "Every badge collected"}</p>
          <p className="text-sm text-muted">{next ? next.p.text : `${n} of ${MILESTONES.length} on your shelf.`}</p>
        </div>
      </div>
      {next ? (
        <div
          className="h-2 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(next.p.ratio * 100)}
          aria-label={`Progress to ${next.m.title}`}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, Math.round(next.p.ratio * 100))}%` }} />
        </div>
      ) : null}
      {link ? (
        <button
          type="button"
          onClick={() => navigate({ name: "rewards" })}
          className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-xl bg-ink px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 active:scale-[0.98]"
        >
          {n} of {MILESTONES.length} badges · Open Rewards
        </button>
      ) : null}
    </article>
  );
}

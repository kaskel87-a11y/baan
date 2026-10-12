import { liveStreak, useStore } from "../lib/store";
import { lastSevenDays } from "../lib/today";

/** Streak count plus the last 7 days; a filled dot means that day's goal was met. */
export function StreakDots() {
  const s = useStore();
  const days = lastSevenDays(s);
  const n = liveStreak(s);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
      <p className="text-sm">
        <span className="font-display text-2xl tabular-nums">{n}</span> day streak
      </p>
      <ol className="flex gap-2" aria-label="Last 7 days">
        {days.map((d) => (
          <li key={d.key} className="grid justify-items-center gap-1 text-xs text-muted">
            <span
              aria-label={`${d.key}: ${d.met ? "goal met" : "goal not met"}`}
              className={`size-3 rounded-full border ${d.met ? "border-accent bg-accent" : d.today ? "border-ink" : "border-line"}`}
            />
            {d.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

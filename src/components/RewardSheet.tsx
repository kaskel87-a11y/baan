import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { MILESTONE_BY_ID } from "../data/rewards";
import { useRoute } from "../lib/router";
import { markRewardsCelebrated, markShareShown, useStore } from "../lib/store";
import { pendingRewards } from "../lib/rewards";
import { activeToday } from "../lib/today";
import { BadgeArt } from "./BadgeArt";
import { BadgeContent } from "./BadgeContent";

const closeBtn =
  "inline-flex items-center justify-center gap-2 min-h-12 w-full px-4 rounded-xl text-base font-medium bg-ink text-white transition-[transform,opacity] duration-150 active:scale-[0.98]";

/** A bottom sheet over a dimmed screen. Stays inside the phone's safe area and scrolls on its own. */
export function Sheet({ label, onClose, closeLabel = "Nice", children }: { label: string; onClose: () => void; closeLabel?: string; children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="sheet-up relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-4xl bg-paper md:rounded-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-2 top-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-card/90 text-ink">
          <X aria-hidden="true" size={20} />
        </button>
        <div className="overflow-y-auto overscroll-contain px-5 pb-4 pt-8" data-sheet-scroll>
          {children}
        </div>
        <div className="border-t border-line bg-paper px-5 pt-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button type="button" className={closeBtn} onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The one celebration for new badges. It waits for a calm screen (Path, Today between sessions, Rewards,
 * Settings, Stories) or a finished scene or role-play, shows once per badge, and folds the streak share card in.
 */
export function RewardSheet({ force = false }: { force?: boolean }) {
  const s = useStore();
  const route = useRoute();
  const t = activeToday(s);
  const midSession = route.name === "today" && !!t && t.step < t.steps.length;
  const calm = force || ["path", "rewards", "settings", "stories"].includes(route.name) || (route.name === "today" && !midSession);
  const pending = pendingRewards(s);
  const key = pending.map((m) => m.id).join(",");
  const [shown, setShown] = useState<string[] | null>(null);

  useEffect(() => {
    if (calm && shown === null && pending.length) setShown(pending.map((m) => m.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calm, key, shown]);

  useEffect(() => {
    if (!shown) return;
    markRewardsCelebrated(shown);
    for (const id of shown) {
      const m = MILESTONE_BY_ID.get(id);
      if (m?.kind === "streak") markShareShown("streak", m.need);
    }
  }, [shown]);

  if (!shown) return null;
  const list = shown.map((id) => MILESTONE_BY_ID.get(id)).filter((m): m is NonNullable<typeof m> => !!m);
  // Lead with the biggest moment: a cartoon badge if there is one, else the last one earned.
  const lead = [...list].reverse().find((m) => m.cartoon) ?? list[list.length - 1];
  if (!lead) return null;
  const others = list.filter((m) => m.id !== lead.id);
  return (
    <Sheet label={`New badge: ${lead.title}`} onClose={() => setShown(null)}>
      <div className="grid gap-5" data-reward-celebration>
        <BadgeContent m={lead} celebrate />
        {others.length ? (
          <section className="grid gap-2" aria-label="Other new badges">
            <p className="text-sm text-muted">Also new on your shelf</p>
            <ul className="grid grid-cols-4 gap-2">
              {others.map((m) => (
                <li key={m.id} className="grid justify-items-center gap-1 text-center text-xs">
                  <BadgeArt m={m} className="w-full" />
                  {m.title}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Sheet>
  );
}

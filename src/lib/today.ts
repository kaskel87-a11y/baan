import { SCENES } from "../data/scenes";
import { buildSessionQueue, resolveCard } from "./cards";
import { dayKey, dueIds, newCardIds, type BaanState, type TodayStep } from "./store";

export const TODAY_REVIEW_MAX = 30;
export const TODAY_TONE_TRIALS = 10;
export const TODAY_NUMBER_ITEMS = 5;

/** The scene for today: the next unfinished one, or a replay of the weakest by last score. */
export function todayScene(s: BaanState): { id: string; replay: boolean } | null {
  const next = SCENES.find((sc) => !s.scenes[sc.id]?.completed);
  if (next) return { id: next.id, replay: false };
  let worst: { id: string; last: number } | null = null;
  for (const sc of SCENES) {
    const last = s.scenes[sc.id]?.last ?? 0;
    if (!worst || last < worst.last) worst = { id: sc.id, last };
  }
  return worst ? { id: worst.id, replay: true } : null;
}

/** About 12 minutes: due reviews (max 30, topped up with new cards), 10 tone-pair trials, one scene, 5 prices. */
export function planToday(s: BaanState): TodayStep[] {
  const voice = s.voice ?? "female";
  const resolve = (id: string) => resolveCard(id, voice, s.name);
  const due = dueIds(s).filter((id) => !!resolve(id));
  const fresh = due.length < 10 ? newCardIds(s, 10).slice(0, 10 - due.length) : [];
  const cards = buildSessionQueue(due.slice(0, TODAY_REVIEW_MAX), fresh, resolve, TODAY_REVIEW_MAX);
  const steps: TodayStep[] = [];
  if (cards.length) steps.push({ kind: "review", cards });
  steps.push({ kind: "tones", trials: TODAY_TONE_TRIALS });
  const sc = todayScene(s);
  if (sc) steps.push({ kind: "scene", id: sc.id, replay: sc.replay });
  steps.push({ kind: "numbers", items: TODAY_NUMBER_ITEMS });
  return steps;
}

export function stepMinutes(st: TodayStep) {
  if (st.kind === "review") return Math.max(1, Math.round(st.cards.length * 0.35));
  if (st.kind === "tones") return 3;
  if (st.kind === "scene") return st.replay ? 4 : 6;
  return 2;
}

export function stepLabel(st: TodayStep) {
  if (st.kind === "review") return `Review ${st.cards.length} card${st.cards.length === 1 ? "" : "s"}`;
  if (st.kind === "tones") return `${st.trials} tone pairs`;
  if (st.kind === "scene") {
    const sc = SCENES.find((x) => x.id === st.id);
    return `${st.replay ? "Replay" : "New scene"}: ${sc?.title ?? st.id}`;
  }
  return `${st.items} prices`;
}

/** Last 7 days, oldest first, with whether the goal was met. */
export function lastSevenDays(s: BaanState, now = new Date()) {
  const out: { key: string; label: string; met: boolean; today: boolean }[] = [];
  for (let k = 6; k >= 0; k--) {
    const d = new Date(now);
    d.setDate(d.getDate() - k);
    const key = dayKey(d);
    out.push({ key, label: d.toLocaleDateString("en-US", { weekday: "narrow" }), met: !!s.history[key]?.met, today: k === 0 });
  }
  return out;
}

export function activeToday(s: BaanState) {
  return s.today && s.today.date === dayKey(new Date()) ? s.today : null;
}

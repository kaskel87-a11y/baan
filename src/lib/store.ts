import { useSyncExternalStore } from "react";
import type { Voice } from "../data/types";

/** localStorage key and shape kept identical to the Grok-hosted Baan so progress carries over. */
export const STORE_KEY = "baan.v1";

export interface SrsCard {
  ease: number;
  interval: number;
  due: number;
  reps: number;
}
export interface SceneRecord {
  completed: boolean;
  best: number;
  last: number;
}
export interface PairStat {
  right: number;
  wrong: number;
}
export interface BaanState {
  voice: Voice | null;
  name: string;
  roman: boolean;
  scenes: Record<string, SceneRecord>;
  srs: Record<string, SrsCard>;
  introduced: string[];
  streak: { last: string; count: number };
  toneBest: number;
  letterBest: number;
  /** New in this version (additive): tone-pair confusion stats, key "falling|high" (sorted). */
  toneStats: Record<string, PairStat>;
  /** Best score in a 20-trial minimal-pair session. */
  pairBest: number;
}

const DEFAULTS: BaanState = {
  voice: null,
  name: "",
  roman: true,
  scenes: {},
  srs: {},
  introduced: [],
  streak: { last: "", count: 0 },
  toneBest: 0,
  letterBest: 0,
  toneStats: {},
  pairBest: 0,
};

let state: BaanState = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const t = JSON.parse(raw) as Partial<BaanState>;
    state = {
      ...DEFAULTS,
      ...t,
      scenes: t.scenes ?? {},
      srs: t.srs ?? {},
      introduced: t.introduced ?? [],
      streak: t.streak ?? DEFAULTS.streak,
      roman: t.roman ?? true,
      toneStats: t.toneStats ?? {},
      pairBest: t.pairBest ?? 0,
    };
  } catch {
    state = DEFAULTS;
  }
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

function update(fn: (s: BaanState) => BaanState) {
  load();
  state = fn(state);
  save();
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getState() {
  load();
  return state;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getState, () => DEFAULTS);
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function bumpStreak(s: BaanState["streak"]) {
  const today = dayKey(new Date());
  if (s.last === today) return s;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { last: today, count: s.last === dayKey(y) ? s.count + 1 : 1 };
}

export function finishOnboarding(voice: Voice, name: string) {
  update((s) => ({ ...s, voice, name: name.trim().slice(0, 40) }));
}
export function setRoman(roman: boolean) {
  update((s) => ({ ...s, roman }));
}
export function setVoice(voice: Voice) {
  update((s) => ({ ...s, voice }));
}
export function setName(name: string) {
  update((s) => ({ ...s, name: name.slice(0, 40) }));
}

export function introduce(ids: string[]) {
  update((s) => {
    const srs = { ...s.srs };
    for (const id of ids) srs[id] ||= { ease: 2.5, interval: 0, due: 0, reps: 0 };
    return { ...s, srs, introduced: Array.from(new Set([...s.introduced, ...ids])) };
  });
}

export function touchStreak() {
  update((s) => ({ ...s, streak: bumpStreak(s.streak) }));
}

export function completeScene(id: string, score: number) {
  update((s) => {
    const prev = s.scenes[id];
    return {
      ...s,
      streak: bumpStreak(s.streak),
      scenes: { ...s.scenes, [id]: { completed: true, best: Math.max(prev?.best ?? 0, score), last: score } },
    };
  });
}

export type Grade = "again" | "good" | "easy";

/** Same simplified SM-2 as the original app. */
export function gradeCard(id: string, grade: Grade) {
  update((s) => {
    const c = s.srs[id] ?? { ease: 2.5, interval: 0, due: 0, reps: 0 };
    const now = Date.now();
    let next: SrsCard;
    if (grade === "again") {
      next = { ease: Math.max(1.3, Math.round((c.ease - 0.2) * 100) / 100), interval: 0, due: now + 60_000, reps: 0 };
    } else {
      const reps = c.reps + 1;
      const ease = grade === "easy" ? Math.round((c.ease + 0.15) * 100) / 100 : c.ease;
      const interval =
        grade === "good"
          ? reps === 1
            ? 1
            : Math.max(1, Math.round((c.interval || 1) * c.ease))
          : reps === 1
            ? 3
            : Math.max(1, Math.round((c.interval || 1) * c.ease * 1.4));
      next = { ease, interval, reps, due: now + interval * 86_400_000 };
    }
    return { ...s, streak: bumpStreak(s.streak), srs: { ...s.srs, [id]: next } };
  });
}

export function recordBest(kind: "tone" | "letter" | "pair", score: number) {
  update((s) => {
    const streak = bumpStreak(s.streak);
    if (kind === "tone") return { ...s, toneBest: Math.max(s.toneBest, score), streak };
    if (kind === "letter") return { ...s, letterBest: Math.max(s.letterBest, score), streak };
    return { ...s, pairBest: Math.max(s.pairBest, score), streak };
  });
}

export function recordPair(pairKey: string, right: boolean) {
  update((s) => {
    const p = s.toneStats[pairKey] ?? { right: 0, wrong: 0 };
    return {
      ...s,
      toneStats: { ...s.toneStats, [pairKey]: right ? { ...p, right: p.right + 1 } : { ...p, wrong: p.wrong + 1 } },
    };
  });
}

export function clearProgress() {
  update((s) => ({ ...DEFAULTS, voice: s.voice, name: s.name, roman: s.roman }));
}

export function dueIds(s: BaanState, now = Date.now()) {
  return s.introduced.filter((id) => {
    const c = s.srs[id];
    return !c || c.due <= now;
  });
}

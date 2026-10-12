import { useSyncExternalStore } from "react";
import type { Voice } from "../data/types";
import { EMPTY_NUMBERS, rangeKey, type NumbersStats, type NumberRangeKey } from "./numbers";
import { isLegacySrsKey, migrateSrsKey, sceneYouLineCardIds, vocabCardIds } from "./cards";

/** localStorage key and shape kept identical to the Grok-hosted Baan so progress carries over. */
export const STORE_KEY = "baan.v1";

export interface SrsCard {
  ease: number;
  interval: number;
  due: number;
  reps: number;
  /** After Again past the first review: next pass graduates at 1 day. */
  relearning?: boolean;
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
  /** Vocab ids (and line:<id>) that have entered Review. */
  introduced: string[];
  streak: { last: string; count: number };
  toneBest: number;
  letterBest: number;
  /** New in this version (additive): tone-pair confusion stats, key "falling|high" (sorted). */
  toneStats: Record<string, PairStat>;
  /** Best score in a 20-trial minimal-pair session. */
  pairBest: number;
  /** Median F0 (Hz) of the learner's recent recordings, newest last; used as their normal pitch. */
  pitchMedians: number[];
  /** Day key for the new-card cap. */
  srsNewDay?: string;
  /** How many brand-new cards entered Review today. */
  srsNewCount?: number;
  /** Numbers & prices trainer best scores and per-range accuracy. */
  numbers: NumbersStats;
  /** Daily goal in graded items (Review grades, tone-pair trials, number items, scene drills). */
  dailyGoal: number;
  /** Per-day activity: graded items, active minutes, and whether the goal was met. */
  history: Record<string, DayRecord>;
  /** Last graded item time, for counting active minutes (gaps over 2 min don't count). */
  lastItemAt?: number;
  /** Today's mixed session, so "Finish later" resumes at the same step. */
  today?: TodaySession;
}

export interface DayRecord {
  items: number;
  minutes: number;
  met?: boolean;
}

export type TodayStep =
  | { kind: "review"; cards: string[] }
  | { kind: "tones"; trials: number }
  | { kind: "scene"; id: string; replay: boolean }
  | { kind: "numbers"; items: number };

export interface TodaySession {
  date: string;
  steps: TodayStep[];
  /** Index of the current step; equals steps.length when the session is finished. */
  step: number;
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
  pitchMedians: [],
  srsNewDay: "",
  srsNewCount: 0,
  numbers: EMPTY_NUMBERS,
  dailyGoal: 15,
  history: {},
};

let state: BaanState = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}


function migrateNumbers(n?: Partial<NumbersStats> | null): NumbersStats {
  const base = structuredClone(EMPTY_NUMBERS);
  if (!n) return base;
  base.bestHear = n.bestHear ?? 0;
  base.bestSay = n.bestSay ?? 0;
  base.bestDigits = n.bestDigits ?? 0;
  for (const k of Object.keys(base.ranges) as NumberRangeKey[]) {
    const r = n.ranges?.[k];
    if (r) base.ranges[k] = { right: r.right ?? 0, wrong: r.wrong ?? 0 };
  }
  return base;
}

function migrateLoaded(t: Partial<BaanState>): BaanState {
  const rawSrs = t.srs ?? {};
  const srs: Record<string, SrsCard> = {};
  for (const [k, v] of Object.entries(rawSrs)) {
    const nk = migrateSrsKey(k);
    // Prefer keeping an already-migrated entry if both exist.
    if (!srs[nk] || isLegacySrsKey(k)) srs[nk] = v;
  }
  // Expand legacy introduced vocab ids into card keys present in srs.
  const introduced = Array.from(
    new Set(
      (t.introduced ?? []).flatMap((id) => {
        if (id.startsWith("line:") || id.startsWith("vocab:")) return [id];
        return [id, ...vocabCardIds(id)];
      }),
    ),
  );
  return {
    ...DEFAULTS,
    ...t,
    scenes: t.scenes ?? {},
    srs,
    introduced,
    streak: t.streak ?? DEFAULTS.streak,
    roman: t.roman ?? true,
    toneStats: t.toneStats ?? {},
    pairBest: t.pairBest ?? 0,
    pitchMedians: t.pitchMedians ?? [],
    srsNewDay: t.srsNewDay ?? "",
    srsNewCount: t.srsNewCount ?? 0,
    numbers: migrateNumbers(t.numbers),
    dailyGoal: t.dailyGoal && t.dailyGoal > 0 ? t.dailyGoal : 15,
    history: t.history ?? {},
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    state = migrateLoaded(JSON.parse(raw) as Partial<BaanState>);
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

function bumpStreak(s: BaanState["streak"]) {
  const today = dayKey(new Date());
  if (s.last === today) return s;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { last: today, count: s.last === dayKey(y) ? s.count + 1 : 1 };
}

/** Mark today's goal met (once per day); this is the only thing that moves the streak. */
function meetGoal(s: BaanState): BaanState {
  const today = dayKey(new Date());
  const rec = s.history[today] ?? { items: 0, minutes: 0 };
  if (rec.met) return s;
  return { ...s, streak: bumpStreak(s.streak), history: { ...s.history, [today]: { ...rec, met: true } } };
}

/** Count graded items toward today's goal and active minutes. */
function addItems(s: BaanState, n: number): BaanState {
  if (n <= 0) return s;
  const now = Date.now();
  const today = dayKey(new Date(now));
  const rec = s.history[today] ?? { items: 0, minutes: 0 };
  const gap = s.lastItemAt && dayKey(new Date(s.lastItemAt)) === today ? Math.min(now - s.lastItemAt, 120_000) : 0;
  const minutes = Math.round((rec.minutes + gap / 60_000) * 10) / 10;
  const items = rec.items + n;
  const next: BaanState = { ...s, lastItemAt: now, history: { ...s.history, [today]: { ...rec, items, minutes } } };
  return items >= s.dailyGoal ? meetGoal(next) : next;
}

export function logItems(n = 1) {
  update((s) => addItems(s, n));
}

export function setDailyGoal(goal: number) {
  update((s) => {
    const next = { ...s, dailyGoal: goal };
    const rec = next.history[dayKey(new Date())];
    return rec && rec.items >= goal ? meetGoal(next) : next;
  });
}

export function startToday(steps: TodayStep[]) {
  update((s) => ({ ...s, today: { date: dayKey(new Date()), steps, step: 0 } }));
}

/** Move today's session past the current step. Finishing the last step meets the goal. */
export function advanceToday() {
  update((s) => {
    if (!s.today) return s;
    const step = Math.min(s.today.step + 1, s.today.steps.length);
    const next = { ...s, today: { ...s.today, step } };
    return step >= s.today.steps.length ? meetGoal(next) : next;
  });
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

const blankCard = (): SrsCard => ({ ease: 2.5, interval: 0, due: 0, reps: 0 });

/** Put vocab (and optional scene your-lines) into Review as listen/read/produce cards. */
export function introduce(ids: string[], opts?: { sceneId?: string }) {
  update((s) => {
    const srs = { ...s.srs };
    const introduced = new Set(s.introduced);
    for (const id of ids) {
      introduced.add(id);
      for (const cid of vocabCardIds(id)) {
        srs[cid] ||= blankCard();
        introduced.add(cid);
      }
    }
    if (opts?.sceneId) {
      for (const cid of sceneYouLineCardIds(opts.sceneId)) {
        srs[cid] ||= blankCard();
        introduced.add(cid);
        const lineId = cid.split(":")[1];
        if (lineId) introduced.add(`line:${lineId}`);
      }
    }
    return { ...s, srs, introduced: Array.from(introduced) };
  });
}

/** Push matching cards to the front of the queue (due now). */
export function markDueNow(cardIds: string[]) {
  if (!cardIds.length) return;
  update((s) => {
    const srs = { ...s.srs };
    const introduced = new Set(s.introduced);
    const now = Date.now();
    for (const id of cardIds) {
      const c = srs[id] ?? blankCard();
      srs[id] = { ...c, due: now };
      introduced.add(id);
    }
    return { ...s, srs, introduced: Array.from(introduced) };
  });
}

/** Kept for callers; activity alone no longer moves the streak (only a met daily goal does). */
export function touchStreak() {}

export function completeScene(id: string, score: number, drills = 0) {
  update((s) => {
    const prev = s.scenes[id];
    let next: BaanState = {
      ...s,
      scenes: { ...s.scenes, [id]: { completed: true, best: Math.max(prev?.best ?? 0, score), last: score } },
    };
    next = addItems(next, Math.max(0, drills));
    // A scene finished while it is today's current step moves the session on.
    const cur = next.today?.steps[next.today.step];
    if (next.today && next.today.date === dayKey(new Date()) && cur?.kind === "scene" && cur.id === id) {
      const step = next.today.step + 1;
      next = { ...next, today: { ...next.today, step } };
      if (step >= next.today!.steps.length) next = meetGoal(next);
    }
    return next;
  });
}

export type Grade = "again" | "hard" | "good" | "easy";

function fuzzDays(days: number) {
  const f = 0.9 + Math.random() * 0.2;
  return Math.max(1, Math.round(days * f * 100) / 100);
}

/** SM-2 with Hard, ±10% fuzz, and a 10-minute relearning step after the first pass. */
export function gradeCard(id: string, grade: Grade) {
  update((s) => {
    const c = s.srs[id] ?? blankCard();
    const now = Date.now();
    let next: SrsCard;

    if (grade === "again") {
      const ease = Math.max(1.3, Math.round((c.ease - 0.2) * 100) / 100);
      if (c.reps >= 1) {
        next = { ...c, ease, interval: 0, due: now + 10 * 60_000, reps: c.reps, relearning: true };
      } else {
        next = { ease, interval: 0, due: now + 60_000, reps: 0, relearning: false };
      }
    } else if (c.relearning) {
      const ease =
        grade === "easy"
          ? Math.round((c.ease + 0.15) * 100) / 100
          : grade === "hard"
            ? Math.max(1.3, Math.round((c.ease - 0.15) * 100) / 100)
            : c.ease;
      const interval = grade === "hard" ? fuzzDays(1.2) : grade === "easy" ? fuzzDays(3) : fuzzDays(1);
      next = { ease, interval, reps: Math.max(1, c.reps), due: now + interval * 86_400_000, relearning: false };
    } else {
      const reps = c.reps + 1;
      const ease =
        grade === "easy"
          ? Math.round((c.ease + 0.15) * 100) / 100
          : grade === "hard"
            ? Math.max(1.3, Math.round((c.ease - 0.15) * 100) / 100)
            : c.ease;
      let interval: number;
      if (grade === "hard") {
        interval = reps === 1 ? fuzzDays(1) : fuzzDays(Math.max(1.2, (c.interval || 1) * 1.2));
      } else if (grade === "good") {
        interval = reps === 1 ? fuzzDays(1) : fuzzDays(Math.max(1, (c.interval || 1) * c.ease));
      } else {
        interval = reps === 1 ? fuzzDays(3) : fuzzDays(Math.max(1, (c.interval || 1) * c.ease * 1.4));
      }
      next = { ease, interval, reps, due: now + interval * 86_400_000, relearning: false };
    }

    // Count brand-new cards that just got their first grade today.
    let srsNewDay = s.srsNewDay ?? "";
    let srsNewCount = s.srsNewCount ?? 0;
    const today = dayKey(new Date());
    if (srsNewDay !== today) {
      srsNewDay = today;
      srsNewCount = 0;
    }
    if (c.reps === 0 && grade !== "again") srsNewCount += 1;

    return addItems({ ...s, srs: { ...s.srs, [id]: next }, srsNewDay, srsNewCount }, 1);
  });
}

export function recordBest(kind: "tone" | "letter" | "pair", score: number) {
  update((s) => {
    if (kind === "tone") return { ...s, toneBest: Math.max(s.toneBest, score) };
    if (kind === "letter") return { ...s, letterBest: Math.max(s.letterBest, score) };
    return { ...s, pairBest: Math.max(s.pairBest, score) };
  });
}

/** Current streak, or 0 if the last met goal was before yesterday. */
export function liveStreak(s: BaanState) {
  const t = new Date();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return s.streak.last === dayKey(t) || s.streak.last === dayKey(y) ? s.streak.count : 0;
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


export function recordNumbersBest(kind: "hear" | "say" | "digits", score: number) {
  update((s) => {
    const numbers = structuredClone(s.numbers ?? EMPTY_NUMBERS);
    if (kind === "hear") numbers.bestHear = Math.max(numbers.bestHear, score);
    else if (kind === "say") numbers.bestSay = Math.max(numbers.bestSay, score);
    else numbers.bestDigits = Math.max(numbers.bestDigits, score);
    return { ...s, numbers };
  });
}

export function recordNumberRange(n: number, right: boolean) {
  update((s) => {
    const numbers = structuredClone(s.numbers ?? EMPTY_NUMBERS);
    const key = rangeKey(n);
    const cur = numbers.ranges[key] ?? { right: 0, wrong: 0 };
    numbers.ranges[key] = right ? { ...cur, right: cur.right + 1 } : { ...cur, wrong: cur.wrong + 1 };
    return addItems({ ...s, numbers }, 1);
  });
}

export function clearProgress() {
  update((s) => ({ ...DEFAULTS, voice: s.voice, name: s.name, roman: s.roman, dailyGoal: s.dailyGoal }));
}

/** Card ids that are due now (includes never-reviewed cards already in the deck). */
export function dueCardIds(s: BaanState, now = Date.now()) {
  return Object.keys(s.srs)
    .filter((id) => id.includes(":"))
    .filter((id) => {
      const c = s.srs[id];
      return !c || c.due <= now;
    })
    .sort((a, b) => (s.srs[a]?.due ?? 0) - (s.srs[b]?.due ?? 0));
}

/** Brand-new cards still under today's 10-new cap (reps 0, never graduated). */
export function newCardIds(s: BaanState, cap = 10) {
  const today = dayKey(new Date());
  const used = s.srsNewDay === today ? s.srsNewCount ?? 0 : 0;
  const left = Math.max(0, cap - used);
  return Object.keys(s.srs)
    .filter((id) => id.includes(":"))
    .filter((id) => (s.srs[id]?.reps ?? 0) === 0 && (s.srs[id]?.due ?? 0) <= Date.now())
    .slice(0, left);
}

export function learnedCount(s: BaanState) {
  return Object.values(s.srs).filter((c) => (c.interval ?? 0) >= 21).length;
}

/** Due reviews for Path badge: previously seen cards only (excludes brand-new). */
export function dueIds(s: BaanState, now = Date.now()) {
  return dueCardIds(s, now).filter((id) => (s.srs[id]?.reps ?? 0) >= 1 || s.srs[id]?.relearning);
}

export function recordPitchMedian(hz: number) {
  if (!(hz > 50 && hz < 500)) return;
  update((s) => ({ ...s, pitchMedians: [...s.pitchMedians, Math.round(hz)].slice(-15) }));
}

/** The learner's normal pitch, once we've heard at least 3 recordings. */
export function pitchBaseline(s: BaanState): number | undefined {
  if (s.pitchMedians.length < 3) return undefined;
  const v = [...s.pitchMedians].sort((a, b) => a - b);
  return v[v.length >> 1];
}


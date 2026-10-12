import { useSyncExternalStore } from "react";
import type { Voice } from "../data/types";
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
};

let state: BaanState = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

    return { ...s, streak: bumpStreak(s.streak), srs: { ...s.srs, [id]: next }, srsNewDay, srsNewCount };
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


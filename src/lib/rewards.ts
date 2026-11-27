import { MILESTONES, MILESTONE_BY_ID, type Milestone } from "../data/rewards";
import { SCENES } from "../data/scenes";
import { VOCAB, VOCAB_BY_ID } from "../data/vocab";
import type { BaanState } from "./store";
import { isLegacySrsKey, parseCardId } from "./cards";

/** What is saved in baan.v1 (and in a backup) under `rewards`. */
export interface RewardsState {
  /** Badge id → the day it was earned. */
  earned: Record<string, string>;
  /** Badges whose celebration has already been shown. */
  celebrated: string[];
  /** Role-plays finished (any learnable scene). */
  rolePlays: number;
}

export const EMPTY_REWARDS: RewardsState = { earned: {}, celebrated: [], rolePlays: 0 };

export interface RewardMetrics {
  streak: number;
  scenes: number;
  words: number;
  /** Unique non-18+ vocab words introduced or already in Review, including brand-new cards. */
  started: number;
  rolePlays: number;
  stories: number;
  toneTrials: number;
  toneAcc: number;
}

const ADULT_SOURCES = new Set<string>([
  ...VOCAB.filter((v) => v.adult).map((v) => v.id),
  ...SCENES.filter((s) => s.adult).flatMap((s) => s.lines.map((l) => l.id)),
]);
const ADULT_SCENES = new Set(SCENES.filter((s) => s.adult).map((s) => s.id));

export function rewardsOf(s: BaanState): RewardsState {
  return s.rewards ?? EMPTY_REWARDS;
}

/** Unique learnable vocab the learner has already met or practiced. Not the mature "learned" count. */
export function startedWordCount(s: BaanState): number {
  const ids = new Set<string>();
  const add = (id: string) => {
    if (id && VOCAB_BY_ID.has(id) && !ADULT_SOURCES.has(id)) ids.add(id);
  };
  for (const raw of s.introduced ?? []) {
    const p = parseCardId(raw);
    if (p?.source === "vocab") add(p.sourceId);
    else if (!raw.includes(":")) add(raw);
  }
  for (const raw of Object.keys(s.srs ?? {})) {
    const p = parseCardId(raw);
    if (p?.source === "vocab") add(p.sourceId);
    else if (isLegacySrsKey(raw)) add(raw);
  }
  return ids.size;
}

/** Everything a badge can ask for, in one place. `streak` is the live streak (see liveStreak in the store). */
export function rewardMetrics(s: BaanState, streak: number): RewardMetrics {
  let right = 0;
  let wrong = 0;
  for (const p of Object.values(s.toneStats ?? {})) {
    right += p.right;
    wrong += p.wrong;
  }
  const words = Object.entries(s.srs).filter(([id, c]) => {
    if ((c.interval ?? 0) < 21) return false;
    const p = parseCardId(id);
    return !!p && !ADULT_SOURCES.has(p.sourceId);
  }).length;
  return {
    streak,
    scenes: Object.entries(s.scenes).filter(([id, r]) => r.completed && !ADULT_SCENES.has(id)).length,
    words,
    started: startedWordCount(s),
    rolePlays: rewardsOf(s).rolePlays,
    stories: Object.keys(s.stories ?? {}).length,
    toneTrials: right + wrong,
    toneAcc: right + wrong > 0 ? right / (right + wrong) : 0,
  };
}

export interface Progress {
  have: number;
  need: number;
  met: boolean;
  /** 0–1, for the bar and for picking the nearest badge. */
  ratio: number;
  text: string;
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

export function progressOf(m: Milestone, x: RewardMetrics): Progress {
  switch (m.kind) {
    case "streak": {
      const have = Math.min(x.streak, m.need);
      const left = m.need - have;
      return {
        have,
        need: m.need,
        met: left <= 0,
        ratio: have / m.need,
        text:
          left <= 0
            ? "Earned"
            : have === 0
              ? "Meet your daily goal today to start a streak"
              : `${have} of ${m.need} days · ${left} more ${plural(left, "day", "days")} at your daily goal`,
      };
    }
    case "scenes": {
      const have = Math.min(x.scenes, m.need);
      return { have, need: m.need, met: have >= m.need, ratio: have / m.need, text: `${have} of ${m.need} ${plural(m.need, "scene", "scenes")} finished` };
    }
    case "words": {
      const started = m.count === "started";
      const have = Math.min(started ? x.started : x.words, m.need);
      return {
        have,
        need: m.need,
        met: have >= m.need,
        ratio: have / m.need,
        text: started ? `${have} of ${m.need} words started` : `${have} of ${m.need} learned in Review`,
      };
    }
    case "rolePlay": {
      const have = Math.min(x.rolePlays, 1);
      return { have, need: 1, met: have >= 1, ratio: have, text: "Finish a role-play in any scene" };
    }
    case "story": {
      const have = Math.min(x.stories, 1);
      return { have, need: 1, met: have >= 1, ratio: have, text: "Finish a listening story" };
    }
    case "tones": {
      const goal = m.accuracy ?? 0.7;
      const have = Math.min(x.toneTrials, m.need);
      const pct = Math.round(x.toneAcc * 100);
      const met = x.toneTrials >= m.need && x.toneAcc >= goal;
      const enough = x.toneTrials >= m.need;
      return {
        have,
        need: m.need,
        met,
        ratio: met ? 1 : enough ? Math.min(0.95, (x.toneAcc / goal) * 0.95) : (have / m.need) * 0.95,
        text: enough
          ? `${pct}% right so far · keep it at ${Math.round(goal * 100)}% or more`
          : `${have} of ${m.need} tone rounds${x.toneTrials ? ` · ${pct}% right` : ""}`,
      };
    }
  }
}

/** Add any badge that is now met. Returns the same object when nothing changed, so it is safe inside update(). */
export function awardRewards(s: BaanState, streak: number, today: string): BaanState {
  const cur = rewardsOf(s);
  const x = rewardMetrics(s, streak);
  let earned: Record<string, string> | null = null;
  let celebrated: string[] | null = null;
  for (const m of MILESTONES) {
    if (cur.earned[m.id] || !progressOf(m, x).met) continue;
    earned ??= { ...cur.earned };
    earned[m.id] = today;
    // A streak card that was already shown before badges existed counts as celebrated.
    if (m.kind === "streak" && (s.shareShown?.streaks ?? []).includes(m.need)) {
      celebrated ??= [...cur.celebrated];
      celebrated.push(m.id);
    }
  }
  if (!earned) return s;
  return { ...s, rewards: { ...cur, earned, celebrated: celebrated ?? cur.celebrated } };
}

/** Earned but not celebrated yet, in shelf order. */
export function pendingRewards(s: BaanState): Milestone[] {
  const cur = rewardsOf(s);
  return MILESTONES.filter((m) => cur.earned[m.id] && !cur.celebrated.includes(m.id));
}

export function earnedCount(s: BaanState) {
  const cur = rewardsOf(s);
  return MILESTONES.filter((m) => cur.earned[m.id]).length;
}

/** The unearned badge you are closest to. */
export function nextMilestone(s: BaanState, streak: number): { m: Milestone; p: Progress } | null {
  const cur = rewardsOf(s);
  const x = rewardMetrics(s, streak);
  let best: { m: Milestone; p: Progress } | null = null;
  for (const m of MILESTONES) {
    if (cur.earned[m.id]) continue;
    const p = progressOf(m, x);
    if (!best || p.ratio > best.p.ratio) best = { m, p };
  }
  return best;
}

/** Keep only well-formed saved rewards (used when loading a save or a backup). */
export function cleanRewards(r: unknown): RewardsState {
  const o = (r && typeof r === "object" ? r : {}) as Partial<RewardsState>;
  const earned: Record<string, string> = {};
  for (const [k, v] of Object.entries(o.earned ?? {})) if (MILESTONE_BY_ID.has(k) && typeof v === "string") earned[k] = v;
  const celebrated = (Array.isArray(o.celebrated) ? o.celebrated : []).filter((k): k is string => typeof k === "string" && MILESTONE_BY_ID.has(k));
  return { earned, celebrated: Array.from(new Set(celebrated)), rolePlays: Number.isFinite(o.rolePlays) && (o.rolePlays as number) > 0 ? Math.floor(o.rolePlays as number) : 0 };
}

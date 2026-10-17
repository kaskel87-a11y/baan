import { SCENES } from "../data/scenes";
import { VOCAB_BY_ID } from "../data/vocab";
import type { Voice } from "../data/types";
import { pick } from "./thai";

export type CardKind = "listen" | "read" | "produce";
export type CardSource = "vocab" | "line";

export interface ReviewCard {
  id: string;
  source: CardSource;
  sourceId: string;
  kind: CardKind;
  thai: string;
  roman: string;
  en: string;
  hint?: string;
  /** Used to avoid back-to-back cards from the same dialogue line. */
  group: string;
  sceneId?: string;
}

const KINDS: CardKind[] = ["listen", "read", "produce"];

export function cardId(source: CardSource, sourceId: string, kind: CardKind) {
  return `${source}:${sourceId}:${kind}`;
}

export function parseCardId(id: string): { source: CardSource; sourceId: string; kind: CardKind } | null {
  const m = /^(vocab|line):([^:]+):(listen|read|produce)$/.exec(id);
  if (!m) return null;
  return { source: m[1] as CardSource, sourceId: m[2], kind: m[3] as CardKind };
}

/** Old save keys were bare vocab ids. */
export function isLegacySrsKey(id: string) {
  return !id.includes(":");
}

export function migrateSrsKey(id: string) {
  return isLegacySrsKey(id) ? cardId("vocab", id, "read") : id;
}

function renderYouLine(lineId: string, voice: Voice, name: string): ReviewCard[] | null {
  for (const scene of SCENES) {
    const line = scene.lines.find((l) => l.id === lineId);
    if (!line || line.who !== "you") continue;
    const n = name.trim() || "…";
    const thai = pick(line.thai, voice).replaceAll("{name}", n);
    const roman = pick(line.roman, voice).replaceAll("{name}", n);
    return KINDS.map((kind) => ({
      id: cardId("line", lineId, kind),
      source: "line" as const,
      sourceId: lineId,
      kind,
      thai,
      roman,
      en: line.en.replaceAll("{name}", n),
      hint: line.note,
      group: `line:${lineId}`,
      sceneId: scene.id,
    }));
  }
  return null;
}

export function resolveCard(id: string, voice: Voice, name: string): ReviewCard | null {
  const parsed = parseCardId(migrateSrsKey(id));
  if (!parsed) return null;
  if (parsed.source === "vocab") {
    const v = VOCAB_BY_ID.get(parsed.sourceId);
    if (!v) return null;
    const scene = SCENES.find((s) => s.vocab.includes(v.id));
    return {
      id: cardId("vocab", v.id, parsed.kind),
      source: "vocab",
      sourceId: v.id,
      kind: parsed.kind,
      thai: v.thai,
      roman: v.roman,
      en: v.en,
      hint: v.hint,
      group: `vocab:${v.id}`,
      sceneId: scene?.id,
    };
  }
  const cards = renderYouLine(parsed.sourceId, voice, name);
  return cards?.find((c) => c.kind === parsed.kind) ?? null;
}

/** All card ids that should exist once a vocab item is in play. */
export function vocabCardIds(vocabId: string) {
  return KINDS.map((k) => cardId("vocab", vocabId, k));
}

/** Your-line cards for a scene. */
export function sceneYouLineCardIds(sceneId: string) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return [];
  return scene.lines
    .filter((l) => l.who === "you")
    .flatMap((l) => KINDS.map((k) => cardId("line", l.id, k)));
}

/** Match a missed drill answer to the closest review card ids (listen and say, never script-only). */
export function cardsForMiss(thai: string): string[] {
  const clean = thai.replace(/\s+/g, "");
  for (const v of VOCAB_BY_ID.values()) {
    if (v.thai.replace(/\s+/g, "") === clean) return [cardId("vocab", v.id, "listen"), cardId("vocab", v.id, "produce")];
  }
  for (const scene of SCENES) {
    for (const line of scene.lines) {
      for (const voice of ["male", "female"] as Voice[]) {
        const t = pick(line.thai, voice).replaceAll("{name}", "").replace(/\s+/g, "");
        if (t && (clean === t || clean.includes(t) || t.includes(clean))) {
          if (line.who === "you") return [cardId("line", line.id, "listen"), cardId("line", line.id, "produce")];
          // Map NPC-line misses to vocab in that scene when possible
          for (const vid of scene.vocab) {
            const v = VOCAB_BY_ID.get(vid);
            if (v && clean.includes(v.thai.replace(/\s+/g, ""))) {
              return [cardId("vocab", vid, "listen"), cardId("vocab", vid, "produce")];
            }
          }
        }
      }
    }
  }
  return [];
}

/**
 * Speaking first: each round of the mix is say, listen, say, listen, say, read.
 * Read cards only appear when the learner turned them on (they are filtered out earlier otherwise).
 */
const MIX: CardKind[] = ["produce", "listen", "produce", "listen", "produce", "read"];

/**
 * Build a session queue: due cards first, then up to `newCap` brand-new cards,
 * weighted toward Say it and Listen, mixed so the same group isn't back-to-back.
 */
export function buildSessionQueue(
  due: string[],
  news: string[],
  resolve: (id: string) => ReviewCard | null,
  limit = 20,
): string[] {
  const pool = [...due, ...news].slice(0, limit * 2);
  const cards = pool.map((id) => resolve(id)).filter((c): c is ReviewCard => !!c);
  const buckets: Record<CardKind, ReviewCard[]> = { listen: [], read: [], produce: [] };
  for (const c of cards) buckets[c.kind].push(c);
  for (const k of KINDS) buckets[k].sort(() => Math.random() - 0.5);

  const out: ReviewCard[] = [];
  const total = cards.length;
  let slot = 0;
  let misses = 0;
  while (out.length < Math.min(limit, total) && misses < MIX.length * 2) {
    const k = MIX[slot++ % MIX.length];
    const b = buckets[k];
    if (!b.length) {
      misses++;
      continue;
    }
    const prev = out[out.length - 1];
    const idx = b.findIndex((c) => !prev || c.group !== prev.group);
    if (idx < 0) {
      misses++;
      continue;
    }
    out.push(b.splice(idx, 1)[0]);
    misses = 0;
  }
  // Drain leftovers (group collisions or an exhausted mix), speaking kinds first.
  for (const k of ["produce", "listen", "read"] as CardKind[]) {
    while (buckets[k].length && out.length < limit) out.push(buckets[k].shift()!);
  }
  return out.map((c) => c.id);
}

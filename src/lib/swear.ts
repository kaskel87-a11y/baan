import type { Vocab } from "../data/types";
import { VOCAB_BY_ID } from "../data/vocab";

/** Longest rated swear whose Thai sits inside this line. บ้า must not win over ไอ้บ้า. */
export function swearInThai(thai: string, vocabIds: readonly string[]): Vocab | undefined {
  const clean = thai.replace(/\s+/g, "");
  let best: Vocab | undefined;
  let bestLen = 0;
  for (const id of vocabIds) {
    const v = VOCAB_BY_ID.get(id);
    if (!v?.heat) continue;
    const t = v.thai.replace(/\s+/g, "");
    if (!t || !clean.includes(t) || t.length <= bestLen) continue;
    best = v;
    bestLen = t.length;
  }
  return best;
}

// Speaking-weighted Review: reading cards sleep by default, and the mix favors Say it and Listen.
import { SCENES } from "../src/data/scenes";
import { buildSessionQueue, cardsForMiss, resolveCard } from "../src/lib/cards";
import { dueCardIds, getState, introduce, newCardIds, setReadCards } from "../src/lib/store";
let fails = 0;
const ok = (c: unknown, m: string) => { if (!c) { fails++; console.log("✗", m); } else console.log("✓", m); };

const scene = SCENES[0];
introduce(scene.vocab, { sceneId: scene.id });
const s = getState();
ok(Object.keys(s.srs).some((k) => k.endsWith(":read")), "read cards still exist in the deck");
ok(!dueCardIds(s).some((k) => k.endsWith(":read")), "read cards are not due by default");
ok(!newCardIds(s, 50).some((k) => k.endsWith(":read")), "read cards are not offered as new by default");

const resolve = (id: string) => resolveCard(id, "male", "Collin");
const ids = Object.keys(s.srs).filter((k) => !k.endsWith(":read"));
const q = buildSessionQueue(ids, [], resolve, 20);
const kinds = q.map((id) => id.split(":")[2]);
const say = kinds.filter((k) => k === "produce").length;
const listen = kinds.filter((k) => k === "listen").length;
ok(q.length === Math.min(20, ids.length), `queue filled (${q.length})`);
ok(say >= listen, `Say it at least as common as Listen (${say} vs ${listen})`);
ok(kinds[0] === "produce", "session opens with a Say it card");

setReadCards(true);
const s2 = getState();
ok(newCardIds(s2, 500).some((k) => k.endsWith(":read")), "turning reading on brings read cards back");
const all = Object.keys(s2.srs);
const q2 = buildSessionQueue(all, [], resolve, 30).map((id) => id.split(":")[2]);
const reads = q2.filter((k) => k === "read").length;
ok(reads > 0 && reads <= Math.ceil(q2.length / 6) + 1, `reading stays a small share when on (${reads} of ${q2.length})`);
setReadCards(false);

const v = scene.vocab[0];
const miss = cardsForMiss(resolveCard(`vocab:${v}:listen`, "male", "")!.thai);
ok(miss.length === 2 && miss.every((m) => !m.endsWith(":read")), `drill misses feed listen and say cards (${miss.join(", ")})`);

if (fails) { console.log(`${fails} failed`); process.exit(1); }
console.log("all review checks passed");

// Store-level checks for milestone badges: earning, the 18+ exclusion, celebrations shown once, and backup round-trip.
import { completeScene, dayKey, exportProgress, getState, markRewardsCelebrated, parseBackup, recordPair, recordRolePlay, recordStory, restoreProgress, type BaanState } from "../src/lib/store";
import { MILESTONES, LEARNABLE_SCENES } from "../src/data/rewards";
import { SCENES } from "../src/data/scenes";
import { VOCAB } from "../src/data/vocab";
import { nextMilestone, pendingRewards, rewardsOf } from "../src/lib/rewards";
import { cardId } from "../src/lib/cards";
let fails = 0;
const ok = (c: unknown, m: string) => { if (!c) { fails++; console.log("✗", m); } else console.log("✓", m); };
const earned = () => Object.keys(rewardsOf(getState()).earned);
const today = dayKey(new Date());
const base = (): BaanState => ({ ...getState(), scenes: {}, srs: {}, stories: {}, toneStats: {}, streak: { last: "", count: 0 }, rewards: { earned: {}, celebrated: [], rolePlays: 0 }, shareShown: {} });

ok(earned().length === 0, "fresh state has no badges");
ok(nextMilestone(getState(), 0) !== null, "there is always a next badge to show");

const learnable = SCENES.filter((s) => !s.adult);
const adult = SCENES.find((s) => s.adult);
completeScene(learnable[0]!.id, 100, 5);
ok(earned().includes("scenes-1"), "first scene earns its badge");
ok(pendingRewards(getState()).some((m) => m.id === "scenes-1"), "and it is waiting to be celebrated");
if (adult) {
  restoreProgress(base());
  completeScene(adult.id, 100, 5);
  ok(earned().length === 0, "finishing the 18+ scene earns nothing");
}
for (const s of learnable.slice(0, 5)) completeScene(s.id, 100, 1);
ok(earned().includes("scenes-5") && !earned().includes("scenes-10"), "5 scenes earns 5 but not 10");
for (const s of learnable) completeScene(s.id, 100, 0);
ok(earned().includes("scenes-all"), `all ${LEARNABLE_SCENES} learnable scenes earns Every scene`);

restoreProgress(base());
recordRolePlay(adult?.id ?? "x");
ok(!earned().includes("first-roleplay") || !adult, "an 18+ role-play doesn't count");
recordRolePlay(learnable[0]!.id);
ok(earned().includes("first-roleplay"), "first role-play");
recordStory("s1", 3, 3);
ok(earned().includes("first-story"), "first story");

restoreProgress(base());
for (let i = 0; i < 20; i++) { recordPair("a|b", true); recordPair("a|b", false); }
ok(!earned().includes("tones-1"), "40 rounds at 50% is not Tone ears");
for (let i = 0; i < 60; i++) recordPair("a|b", true);
ok(earned().includes("tones-1") && !earned().includes("tones-2"), "100 rounds at 80% earns Tone ears, not Sharp");

restoreProgress({ ...base(), streak: { last: today, count: 14 }, shareShown: { streaks: [3] } });
ok(["streak-3", "streak-7", "streak-14"].every((id) => earned().includes(id)) && !earned().includes("streak-30"), "a 14-day streak earns 3, 7 and 14");
ok(!pendingRewards(getState()).some((m) => m.id === "streak-3"), "a streak card shown before badges existed isn't celebrated twice");
ok(pendingRewards(getState()).some((m) => m.id === "streak-7"), "the 7-day badge is still to celebrate");
markRewardsCelebrated(["streak-7", "streak-14"]);
ok(pendingRewards(getState()).length === 0, "celebrating clears them");
const before = rewardsOf(getState());
markRewardsCelebrated(["streak-7"]);
ok(rewardsOf(getState()) === before, "celebrating twice changes nothing");

const real = VOCAB.filter((v) => !v.adult).slice(0, 25);
const rude = VOCAB.filter((v) => v.adult).slice(0, 25);
const srsOf = (list: typeof real) => Object.fromEntries(list.map((v) => [cardId("vocab", v.id, "listen"), { ease: 2.5, interval: 30, due: 0, reps: 4 }]));
restoreProgress({ ...base(), srs: srsOf(rude) });
ok(!earned().includes("words-25"), "learned 18+ words don't count");
restoreProgress({ ...base(), srs: srsOf(real) });
ok(earned().includes("words-25") && !earned().includes("words-100"), "25 learned earns 25 words");

const code = exportProgress();
const back = parseBackup(code);
ok(!("error" in back) && Object.keys(back.state.rewards?.earned ?? {}).length === earned().length, "badges survive a backup and restore");
ok("summary" in back && back.summary.badges === earned().length, "backup summary counts badges");
ok(new Set(MILESTONES.map((m) => m.id)).size === MILESTONES.length, "badge ids are unique");

console.log(fails ? `${fails} failed` : "all rewards checks passed");
process.exit(fails ? 1 : 0);

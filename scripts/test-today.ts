// Store-level checks for the Today session, the daily goal, and the streak rule.
import { advanceToday, completeScene, getState, gradeCard, logItems, setDailyGoal, startToday, dayKey } from "../src/lib/store";
import { planToday, todayScene } from "../src/lib/today";
let fails = 0;
const ok = (c: unknown, m: string) => { if (!c) { fails++; console.log("✗", m); } else console.log("✓", m); };
const today = dayKey(new Date());

ok(getState().streak.count === 0, "fresh state has no streak");
gradeCard("vocab:x:read", "good");
ok(getState().streak.count === 0, "one graded item does not move the streak");
ok(getState().history[today]?.items === 1, "graded item counted");

const plan = planToday(getState());
ok(plan.some((s) => s.kind === "tones" && s.trials === 10), "plan has 10 tone trials");
ok(plan.some((s) => s.kind === "numbers" && s.items === 5), "plan has 5 prices");
const sc = todayScene(getState());
ok(sc && !sc.replay, "first scene is new, not a replay");

startToday([{ kind: "scene", id: sc!.id, replay: false }, { kind: "numbers", items: 5 }]);
completeScene("some-other-scene", 100, 3);
ok(getState().today?.step === 0, "finishing a different scene does not advance Today");
completeScene(sc!.id, 80, 5);
ok(getState().today?.step === 1, "finishing today's scene advances Today");
ok(getState().history[today]?.items === 9, "scene drills count as graded items");
ok(getState().streak.count === 0, "goal not met yet");
advanceToday();
ok(getState().today?.step === 2 && getState().history[today]?.met === true, "finishing the session meets the goal");
ok(getState().streak.count === 1, "streak moves once");
logItems(50);
advanceToday();
ok(getState().streak.count === 1, "streak moves at most once a day");

// Goal by item count on a fresh day record
const st = getState();
delete st.history[today];
st.streak = { last: "", count: 4 };
setDailyGoal(10);
logItems(9);
ok(getState().streak.count === 4, "9 of 10 items: no streak yet");
logItems(1);
ok(getState().streak.count === 1 && getState().history[today]?.met, "10 of 10 items meets the goal (stale streak restarts at 1)");

if (fails) { console.log(`${fails} failed`); process.exit(1); }
console.log("today OK");

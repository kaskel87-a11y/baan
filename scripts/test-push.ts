import { hoursFor, nextPushWord, scheduleLine, type PushWord } from "../src/lib/pushPlan.ts";

let fails = 0;
const ok = (c: unknown, m: string) => {
  if (!c) {
    fails += 1;
    console.log("✗", m);
  } else console.log("✓", m);
};

ok(hoursFor(3).join() === "9,13,19", "three a day is 9, 1, and 7");
ok(hoursFor(1).join() === "9", "one a day is 9 AM");
ok(hoursFor(5).join() === "8,11,14,17,20", "five a day has five hours");
ok(hoursFor(9).join() === "9,13,19", "unknown count falls back to three");
ok(scheduleLine(3).includes("9:00 AM") && scheduleLine(3).includes("7:00 PM"), "schedule line names the hours");

const words: PushWord[] = [
  { id: "a", thai: "ก", roman: "gaw", en: "a" },
  { id: "b", thai: "ข", roman: "khaw", en: "b" },
  { id: "c", thai: "ค", roman: "khaw", en: "c", adult: true },
];
const first = nextPushWord(words, []);
ok(first?.word.id === "a", "first word is the first non-adult");
const second = nextPushWord(words, first?.recent ?? []);
ok(second?.word.id === "b", "next word skips the one just sent");
const third = nextPushWord(words, second?.recent ?? []);
ok(third?.word.id === "a" && !third.recent.includes("c"), "cycles without the adult word");

if (fails) {
  console.log(`${fails} failed`);
  process.exit(1);
}
console.log("push plan ok");

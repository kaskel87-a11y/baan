// Backup code round-trips progress, and bad input gives an English error.
import { SCENES } from "../src/data/scenes";
import { completeScene, exportProgress, getState, introduce, parseBackup, restoreProgress, setName, clearProgress } from "../src/lib/store";
let fails = 0;
const ok = (c: unknown, m: string) => { if (!c) { fails++; console.log("✗", m); } else console.log("✓", m); };

setName("Collin ทดสอบ");
introduce(SCENES[0].vocab, { sceneId: SCENES[0].id });
completeScene(SCENES[0].id, 90, 5);
const before = getState();
const code = exportProgress();
ok(code.startsWith("BAAN1:") && !/\s/.test(code), "code is one line starting with BAAN1:");

clearProgress();
ok(Object.keys(getState().srs).length === 0, "progress cleared");
const p = parseBackup("  " + code.slice(0, 40) + "\n" + code.slice(40) + "  ");
ok(!("error" in p), "code with spaces or line breaks still parses");
if (!("error" in p)) {
  ok(p.summary.scenes === 1 && p.summary.cards === Object.keys(before.srs).filter((k) => k.includes(":")).length, `summary counts (${JSON.stringify(p.summary)})`);
  restoreProgress(p.state);
  const after = getState();
  ok(after.name === "Collin ทดสอบ", "non-English name survives");
  ok(JSON.stringify(after.srs) === JSON.stringify(before.srs), "review cards identical after restore");
  ok(after.scenes[SCENES[0].id]?.best === 90, "scene score restored");
}
const raw = parseBackup(JSON.stringify(before));
ok(!("error" in raw), "raw saved-state JSON is accepted too");
const bad = parseBackup("hello");
ok("error" in bad && /BAAN1/.test(bad.error), "junk gives an English error");
const cut = parseBackup(code.slice(0, code.length - 30));
ok("error" in cut, "a cut-off code is rejected");
ok("error" in parseBackup(""), "empty input is rejected");

if (fails) { console.log(`${fails} failed`); process.exit(1); }
console.log("all backup checks passed");

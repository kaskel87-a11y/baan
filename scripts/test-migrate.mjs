// Two-origin test of the move from kaskel87-a11y.github.io/baan/ to learnthaibaan.github.io.
// Usage: node scripts/test-migrate.mjs OLD_DIR STUB_DIR OLD_URL NEW_URL SHOTS_DIR
//   e.g. old live build in /tmp/mig/old/baan served on :5101, dist/ on :5102,
//   ./deploy-legacy.sh --local /tmp/mig/stub http://127.0.0.1:5102/
//   node scripts/test-migrate.mjs /tmp/mig/old/baan /tmp/mig/stub http://127.0.0.1:5101/baan/ http://127.0.0.1:5102/ /tmp/mig/shots
//   OLD_DIR: folder served as OLD_URL (holds the old app first, then the redirect stub is copied in)
import puppeteer from "puppeteer-core";
import { cpSync, rmSync, mkdirSync } from "node:fs";

const [oldDir, stubDir, oldUrl, newUrl, shots] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log(c ? "✓" : "✗", m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const DAY = (i) => new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10);
function bigState(name, cards, days) {
  const srs = {};
  for (let i = 0; i < cards; i++) srs[`vocab:w${i}`] = { ease: 2.5, interval: 3 + (i % 20), due: 1767000000000 + i * 1000, reps: 2 };
  const history = {};
  for (let i = 0; i < days; i++) history[DAY(i)] = { items: 20 + i, minutes: 9, goal: true };
  return { voice: "male", name, roman: true, scenes: { cafe: { completed: true, best: 92, last: 88 }, ordering: { completed: true, best: 80, last: 80 } },
    srs, introduced: Object.keys(srs).map((k) => k.split(":")[1]), streak: { last: DAY(days - 1), count: 7 }, toneBest: 14, letterBest: 9,
    toneStats: {}, pairBest: 11, pitchMedians: [120, 125, 130], numbers: {}, dailyGoal: 15, pushPerDay: 3, history };
}

// 1) Old app with progress, its service worker, and another app's key on the same origin.
await page.goto(oldUrl, { waitUntil: "networkidle0" });
const oldState = JSON.stringify(bigState("Collin Test", 400, 120));
await page.evaluate((s) => {
  localStorage.setItem("baan.v1", s);
  localStorage.setItem("baan.asr.ok", "1");
  localStorage.setItem("baan.pushSub", JSON.stringify({ endpoint: "https://push.example/x", keys: { p256dh: "a", auth: "b" }, schedule: 3 }));
  localStorage.setItem("solar.save", "keep-me");
}, oldState);
await page.reload({ waitUntil: "networkidle0" });
await sleep(800);
const regsBefore = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope));
ok(regsBefore.some((s) => s.endsWith("/baan/")), `old Baan service worker registered (${regsBefore.join(", ")})`);
await page.screenshot({ path: `${shots}/1-old-app.png` });

// 2) Publish the redirect at the old address. A returning visit to a deep link.
rmSync(oldDir, { recursive: true, force: true });
cpSync(stubDir, oldDir, { recursive: true });
await page.goto("about:blank");
await page.goto(oldUrl + "#/scene/cafe", { waitUntil: "domcontentloaded" });
await page.waitForFunction((n) => location.href.startsWith(n) && !location.hash.includes("migrate"), { timeout: 15000 }, newUrl);
await sleep(1500);
ok(page.url() === newUrl + "#/scene/cafe", `landed on the same screen, hash cleaned (${page.url()})`);
const got = await page.evaluate(() => ({ v1: localStorage.getItem("baan.v1"), asr: localStorage.getItem("baan.asr.ok"), push: localStorage.getItem("baan.pushSub"), mig: localStorage.getItem("baan.migratedFrom") }));
ok(got.v1 === oldState, `progress imported byte-for-byte (${oldState.length} chars)`);
ok(got.asr === "1", "other baan.* setting carried over");
ok(got.push === null, "old push subscription not carried over");
ok(!!got.mig, "migration marker written");
await page.screenshot({ path: `${shots}/2-new-scene-cafe.png` });
await page.goto(newUrl + "#/path", { waitUntil: "networkidle0" });
await sleep(800);
await page.screenshot({ path: `${shots}/3-new-path.png` });
await page.goto(newUrl + "#/settings", { waitUntil: "networkidle0" });
await sleep(800);
const settingsText = await page.evaluate(() => document.body.innerText);
await page.screenshot({ path: `${shots}/4-new-settings.png`, fullPage: true });
const nameShown = await page.evaluate(() => [...document.querySelectorAll("input")].some((i) => i.value === "Collin Test") || document.body.innerText.includes("Collin Test"));
ok(nameShown, "app shows the imported name in Settings");
ok(!settingsText.includes("Something went wrong"), "settings render");

// 3) Old origin: Baan worker gone, other app's key untouched, old progress still kept there.
const p2 = await browser.newPage();
await p2.goto(oldUrl.replace(/baan\/$/, "") + "nope-404", { waitUntil: "domcontentloaded" }).catch(() => {});
const oldSide = await p2.evaluate(async () => ({
  regs: (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope),
  solar: localStorage.getItem("solar.save"),
  v1: localStorage.getItem("baan.v1"),
}));
ok(!oldSide.regs.some((s) => s.endsWith("/baan/")), `old Baan worker unregistered (left: ${oldSide.regs.join(", ") || "none"})`);
ok(oldSide.solar === "keep-me", "another app's storage on the old origin untouched");
ok(oldSide.v1 === oldState, "old progress still kept on the old origin (nothing deleted)");
await p2.close();

// 4) New site already has newer progress: a second trip through the old link must not replace it.
const newer = JSON.stringify({ ...bigState("Newer Me", 3, 2) });
await page.evaluate((s) => localStorage.setItem("baan.v1", s), newer);
// The local server sends no Cache-Control, so Chrome may reuse the old app page from step 1 (GitHub Pages caps this at 10 min).
await page.setCacheEnabled(false);
await page.goto("about:blank");
await page.goto(oldUrl, { waitUntil: "domcontentloaded" });
await page.waitForFunction((n) => location.href.startsWith(n) && !location.hash.includes("migrate"), { timeout: 15000 }, newUrl).catch(async (e) => { console.log("stuck at", page.url(), await page.evaluate(() => document.body.innerText.slice(0, 200))); throw e; });
await sleep(1000);
ok(await page.evaluate((s) => localStorage.getItem("baan.v1") === s, newer), "existing progress on the new site kept, not overwritten");
ok(page.url() === newUrl || page.url() === newUrl + "#/path", `plain old link lands on the home page (${page.url()})`);

// 5) Fresh browser with nothing saved: plain redirect, no payload.
const ctx = await browser.createBrowserContext();
const p3 = await ctx.newPage();
await p3.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p3.goto(oldUrl + "#/tones", { waitUntil: "domcontentloaded" });
await p3.waitForFunction((n) => location.href.startsWith(n), { timeout: 15000 }, newUrl);
await sleep(800);
ok(p3.url() === newUrl + "#/tones", `new visitor deep link forwarded (${p3.url()})`);
ok(await p3.evaluate(() => localStorage.getItem("baan.migratedFrom") === null), "nothing imported for a new visitor");
await ctx.close();

ok(errors.length === 0, `no page errors${errors.length ? ": " + errors.join(" | ") : ""}`);
await browser.close();
console.log(fails ? `${fails} failed` : "all passed");
process.exit(fails ? 1 : 0);

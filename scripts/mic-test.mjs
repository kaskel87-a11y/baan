// Fake-microphone tests for Say it. Chrome plays a generated WAV as the mic input
// (--use-file-for-fake-audio-capture), the app records it, tracks pitch and classifies each syllable.
// Usage: python3 scripts/make-wavs.py && node scripts/mic-test.mjs [baseUrl]
import puppeteer from "puppeteer-core";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:4321/";
const wavDir = path.resolve("scripts/wav");
const W = 360; // phone width
let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) failures++;
};

const STATE = {
  v: 1, onboarded: true, roman: true, voice: "male", name: "", streak: 0, lastDay: "", completed: [], cards: {},
  toneBest: 0, letterBest: 0, toneStats: {}, pairBest: 0, pitchMedians: [],
};

/**
 * @param wav file in scripts/wav
 * @param rec "ok" | "none" | "network" | "silent-end" | "denied-mic" — what the speech recognizer / mic does
 */
async function run({ wav, syllables, rec = "ok", transcript = "", noWorklet = false, pitchMedians = [] }) {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${wavDir}/${wav}.wav`,
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 780, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.evaluateOnNewDocument(
    (rec, transcript, noWorklet, state) => {
      localStorage.setItem("baan.v1", JSON.stringify(state));
      if (noWorklet) delete window.AudioWorkletNode; // Safari < 14.1 path → ScriptProcessor
      if (rec === "none") {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
        return;
      }
      if (rec === "denied-mic") {
        navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
      }
      class FakeRec {
        start() {
          window.__recStarted = (window.__recStarted ?? 0) + 1;
          this.t = setTimeout(() => {
            if (rec === "network") this.onerror?.({ error: "network" });
            else if (rec === "denied-mic") this.onerror?.({ error: "not-allowed" });
            else if (rec === "ok") this.onresult?.({ results: [[{ transcript, confidence: 0.9 }]] });
            // "silent-end": iOS-style end with neither result nor error
            this.onend?.();
          }, 500);
        }
        stop() {}
        abort() {}
      }
      window.SpeechRecognition = FakeRec;
    },
    rec, transcript, noWorklet, { ...STATE, pitchMedians },
  );
  await page.goto(base + "#/scene/market", { waitUntil: "networkidle0" });
  await page.reload({ waitUntil: "networkidle0" });
  // walk preview words until one has the wanted syllable count
  let found = null;
  for (let i = 0; i < 15; i++) {
    found = await page.evaluate((n) => {
      const art = document.querySelector("article");
      const roman = art.querySelectorAll("p")[2]?.textContent ?? "";
      const thai = art.querySelector(".thai")?.textContent ?? "";
      const count = roman.split(/[\s-]+/).filter(Boolean).length;
      return count === n ? { thai, roman } : null;
    }, syllables);
    if (found) break;
    const more = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Next word"));
      b?.click();
      return !!b;
    });
    if (!more) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!found) {
    // fall back to the conversation lines
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Skip ahead")?.click());
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 400));
  const below = () =>
    page.evaluate(() => {
      const art = document.querySelector("article");
      const next = art.nextElementSibling;
      return { next: next.getBoundingClientRect().top + scrollY, art: art.getBoundingClientRect().height };
    });
  const before = await below();
  const t0 = Date.now();
  await page.evaluate(() => document.querySelector("[data-sayit] button").click());
  await new Promise((r) => setTimeout(r, 300));
  const during = await below();
  // wait for auto-stop + analysis
  await page.waitForFunction(() => document.querySelector("[data-sayit] button span").textContent === "Say it" && document.querySelector("[data-tone-feedback]").innerText.trim(), { timeout: 15000 }).catch(() => null);
  await new Promise((r) => setTimeout(r, 700)); // let the word check settle too
  const after = await below();
  const res = await page.evaluate(() => ({
    tones: [...document.querySelectorAll("[data-tone-line]")].map((p) => p.dataset.heardTone),
    toneText: document.querySelector("[data-tone-feedback]").innerText,
    wordText: document.querySelector("[data-word-check]").innerText,
    status: document.querySelector("[data-sayit-status]").innerText,
    curve: !!document.querySelector("[data-user-curve]"),
    button: document.querySelector("[data-sayit] button").getBoundingClientRect().toJSON(),
    overflowX: document.documentElement.scrollWidth > innerWidth,
    target: document.querySelector("article .thai")?.textContent,
  }));
  res.ms = Date.now() - t0;
  res.shift = Math.max(Math.abs(during.next - before.next), Math.abs(after.next - before.next));
  res.errors = errors;
  await page.screenshot({ path: `/workspace/mic-${wav}-${rec}${noWorklet ? "-sp" : ""}.png`, fullPage: true });
  await browser.close();
  return res;
}

const show = (r) => console.log(`   target ${r.target} · ${r.ms} ms · shift ${r.shift}px\n   word: ${r.wordText.replace(/\n/g, " | ")}\n   tone: ${r.toneText.replace(/\n/g, " | ")}`);

for (const [wav, want] of [["falling", "falling"], ["rising", "rising"], ["flat", "level"]]) {
  const r = await run({ wav, syllables: 1, transcript: "" });
  show(r);
  ok(r.tones[0] === want, `fake mic "${wav}" → classified ${r.tones[0]} (want ${want}); user curve drawn: ${r.curve}`);
  ok(r.shift < 0.5 && !r.overflowX && !r.errors.length, `  no layout shift / overflow / errors (${r.shift}px, ${r.errors.join("; ")})`);
}

{
  const r = await run({ wav: "flat", syllables: 1, pitchMedians: [160, 160, 160] });
  show(r);
  ok(r.tones[0] === "mid", `flat 160 Hz with a 160 Hz baseline → ${r.tones[0]} (want mid)`);
}
{
  const r = await run({ wav: "flat", syllables: 1, pitchMedians: [200, 200, 200] });
  show(r);
  ok(r.tones[0] === "low", `flat 160 Hz with a 200 Hz baseline → ${r.tones[0]} (want low)`);
}
{
  const r = await run({ wav: "fall-rise-2syl", syllables: 2 });
  show(r);
  ok(r.tones.join(",") === "falling,rising", `two-syllable fall+rise → ${r.tones.join(",")}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, noWorklet: true });
  show(r);
  ok(r.tones[0] === "falling", `ScriptProcessor fallback (no AudioWorklet) → ${r.tones[0]}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "none" });
  show(r);
  ok(r.wordText.includes("Your browser can't check Thai words, but the tone check below still works."), "no SpeechRecognition → English message shown");
  ok(r.tones[0] === "falling", `  …and the tone check still works (${r.tones[0]})`);
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "network" });
  show(r);
  ok(r.wordText.includes("couldn't reach the speech service"), "recognition network error → English message");
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "silent-end" });
  show(r);
  ok(r.wordText.includes("didn't hear any words"), "recognition ends with no result (iOS) → English message");
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "denied-mic" });
  show(r);
  ok(/microphone is blocked/.test(r.toneText) && /isn't allowed/.test(r.wordText), "mic permission denied → English messages for both checks");
}
{
  const r = await run({ wav: "silence", syllables: 1, transcript: "" });
  show(r);
  ok(/didn't hear your voice/.test(r.toneText), "silence → 'I didn't hear your voice…'");
}
{
  const r = await run({ wav: "falling", syllables: 1, transcript: "ไม่รู้" });
  show(r);
  ok(/I heard: ไม่รู้/.test(r.wordText) && /Target:/.test(r.wordText), "wrong words → shows what was heard next to the target");
}

console.log(failures ? `${failures} failed` : "mic tests OK");
process.exit(failures ? 1 : 0);

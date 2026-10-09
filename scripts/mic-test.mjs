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
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

async function run({ wav, syllables, rec = "ok", transcript = "", noWorklet = false, pitchMedians = [], ua, silentTap = false, wordStep = false, diag = false, via = "tone", scene = "market", fakeAsr = undefined, asrOk = false, sayTwiceEmpty = false, want }) {
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
  if (ua) await page.setUserAgent(ua);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.evaluateOnNewDocument(
    (rec, transcript, noWorklet, state, silentTap, fakeAsr, asrOk) => {
      localStorage.setItem("baan.v1", JSON.stringify(state));
      if (asrOk) localStorage.setItem("baan.asr.ok", "1");
      if (fakeAsr !== undefined && fakeAsr !== null) window.__fakeTranscribe = () => new Promise((r) => setTimeout(() => r(fakeAsr), 300));
      if (silentTap) {
        // Simulate the iOS bug: Web Audio hands us zeros while the mic itself works (MediaRecorder still gets audio).
        const orig = AudioContext.prototype.createMediaStreamSource;
        AudioContext.prototype.createMediaStreamSource = function () {
          return orig.call(this, this.createMediaStreamDestination().stream);
        };
      }
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
            else if (rec === "interim-only") {
              const r = [{ transcript, confidence: 0.5 }];
              r.isFinal = false;
              this.onresult?.({ results: [r] });
            }
            // "silent-end": iOS-style end with neither result nor error
            this.onend?.();
          }, 500);
        }
        stop() {}
        abort() {}
      }
      window.SpeechRecognition = FakeRec;
    },
    rec, transcript, noWorklet, { ...STATE, pitchMedians }, silentTap, fakeAsr, asrOk,
  );
  await page.goto(base + `#/scene/${scene}`, { waitUntil: "networkidle0" });
  await page.reload({ waitUntil: "networkidle0" });
  // walk preview words until one has the wanted syllable count
  let found = null;
  for (let i = 0; i < 15; i++) {
    found = await page.evaluate((n, want) => {
      const art = document.querySelector("article");
      const roman = art.querySelectorAll("p")[2]?.textContent ?? "";
      const thai = art.querySelector(".thai")?.textContent ?? "";
      const count = roman.split(/[\s-]+/).filter(Boolean).length;
      return count === n && (!want || thai === want) ? { thai, roman } : null;
    }, syllables, want);
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
  const res0 = {};
  // Tone check: its own button (or Say it, when the browser has no speech recognition)
  if (sayTwiceEmpty) {
    for (let k = 0; k < 2; k++) {
      await page.evaluate(() => document.querySelector("[data-sayit] > button").click());
      await new Promise((r) => setTimeout(r, 800));
    }
    res0.afterTwoEmpty = await page.evaluate(() => document.querySelector("[data-word-check]").innerText);
  }
  await page.evaluate((via) => document.querySelector(via === "say" ? "[data-sayit] > button" : "[data-tone-button]").click(), via);
  let meterMax = 0;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 100));
    meterMax = Math.max(meterMax, await page.evaluate(() => parseFloat(document.querySelector("[data-meter-fill]").style.width) || 0));
  }
  const recDuring = await page.evaluate(() => window.__recStarted ?? 0);
  const during = await below();
  // wait for auto-stop + analysis
  await page.waitForFunction(() => !document.querySelector("[data-tone-button]").disabled && document.querySelector("[data-tone-feedback]").innerText.trim(), { timeout: 15000 }).catch(() => null);
  await new Promise((r) => setTimeout(r, 700)); // let the word check settle too
  if (fakeAsr === null) {
    // real on-device Whisper: wait for the download + transcription
    await page.waitForFunction(() => !/Downloading|Loading|Checking your words/.test(document.querySelector("[data-word-check]").innerText), { timeout: 300000, polling: 1000 }).catch(() => null);
  }
  let wordAfterStep = null;
  if (wordStep) {
    // Word check: Say it = speech recognition alone (0.2.0 behaviour)
    const before = await page.evaluate(() => window.__recStarted ?? 0);
    await page.evaluate(() => document.querySelector("[data-sayit] > button").click());
    await new Promise((r) => setTimeout(r, 150));
    res0.sayLabel = await page.evaluate(() => document.querySelector("[data-sayit] > button").textContent.trim());
    res0.toneDisabledWhileListening = await page.evaluate(() => document.querySelector("[data-tone-button]").disabled);
    await new Promise((r) => setTimeout(r, 900));
    res0.recStartedBySay = (await page.evaluate(() => window.__recStarted ?? 0)) - before;
    wordAfterStep = await page.evaluate(() => document.querySelector("[data-word-check]").innerText);
  }
  let diagText = null;
  if (diag) {
    await page.evaluate(() => document.querySelector("[data-diag-toggle]").click());
    await new Promise((r) => setTimeout(r, 150));
    diagText = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-diag-key]")].map((e) => [e.dataset.diagKey, e.textContent])));
  }
  const after = diag ? before : await below();
  const res = await page.evaluate(() => ({
    tones: [...document.querySelectorAll("[data-tone-line]")].map((p) => p.dataset.heardTone),
    toneText: document.querySelector("[data-tone-feedback]").innerText,
    wordText: document.querySelector("[data-word-check]").innerText,
    status: document.querySelector("[data-sayit-status]").innerText,
    curve: !!document.querySelector("[data-user-curve]"),
    button: document.querySelector("[data-sayit] button").getBoundingClientRect().toJSON(),
    overflowX: document.documentElement.scrollWidth > innerWidth,
    target: document.querySelector("article .thai")?.textContent,
    drawnPoints: [...document.querySelectorAll("[data-user-curve]")].map((p) => (p.getAttribute("d").match(/[ML]/g) || []).length),
    strokes: [...document.querySelectorAll("[data-user-curve]")].map((p) => (p.getAttribute("d").match(/M/g) || []).length),
  }));
  res.ms = Date.now() - t0;
  Object.assign(res, res0, { meterMax, recDuring, wordAfterStep, diagText });
  res.shift = Math.max(Math.abs(during.next - before.next), Math.abs(after.next - before.next));
  res.errors = errors;
  await page.screenshot({ path: `/workspace/mic-${wav}-${rec}${noWorklet ? "-sp" : ""}.png`, fullPage: true });
  await browser.close();
  return res;
}

const show = (r) => console.log(`   target ${r.target} · ${r.ms} ms · shift ${r.shift}px\n   word: ${(r.wordAfterStep ?? r.wordText).replace(/\n/g, " | ")}\n   tone: ${r.toneText.replace(/\n/g, " | ")}`);
const IOS = { ua: IPHONE };

for (const [wav, want] of [["falling", "falling"], ["rising", "rising"], ["flat", "level"]]) {
  const r = await run({ wav, syllables: 1, ...IOS });
  show(r);
  ok(r.tones[0] === want, `fake mic "${wav}" → classified ${r.tones[0]} (want ${want}); user curve drawn: ${r.curve}`);
  ok(r.recDuring === 0, `  speech recognition NOT started during the tone recording (${r.recDuring}×)`);
  ok(r.shift < 0.5 && !r.overflowX && !r.errors.length, `  no layout shift / overflow / errors (${r.shift}px, ${r.errors.join("; ")})`);
}
{
  const r = await run({ wav: "flat", syllables: 1, pitchMedians: [160, 160, 160] });
  ok(r.tones[0] === "mid", `flat 160 Hz with a 160 Hz baseline → ${r.tones[0]} (want mid)`);
}
{
  const r = await run({ wav: "flat", syllables: 1, pitchMedians: [200, 200, 200] });
  ok(r.tones[0] === "low", `flat 160 Hz with a 200 Hz baseline → ${r.tones[0]} (want low)`);
}
{
  const r = await run({ wav: "fall-rise-2syl", syllables: 2 });
  show(r);
  ok(r.tones.join(",") === "falling,rising", `two-syllable fall+rise → ${r.tones.join(",")}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, noWorklet: true });
  ok(r.tones[0] === "falling", `ScriptProcessor fallback (no AudioWorklet) → ${r.tones[0]}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, transcript: "แพง", wordStep: true });
  show(r);
  ok(r.recStartedBySay === 1 && r.sayLabel === "Stop", `Say it starts speech recognition alone (started ${r.recStartedBySay}×, label "${r.sayLabel}")`);
  ok(r.toneDisabledWhileListening === true, "  Check my tones is disabled while recognition listens (no mic sharing)");
  ok(/Correct! That sounded like “phaaeng”\./.test(r.wordAfterStep ?? ""), "  word result: Correct! in English with the romanization");
  ok(r.meterMax > 10, `live mic meter moved while recording (max ${r.meterMax}%)`);
}
{
  const r = await run({ wav: "falling", syllables: 1, transcript: "ไม่รู้", wordStep: true });
  ok(/I heard something like “mâi-rúu” \(ไม่รู้\)/.test(r.wordAfterStep) && /Target:/.test(r.wordAfterStep), `wrong words → heard shown romanized + English tip: ${r.wordAfterStep.replace(/\n+/g, " | ")}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "network", wordStep: true });
  ok(r.wordAfterStep.includes("couldn't reach the speech service"), "recognition network error → English message");
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "silent-end", wordStep: true });
  ok(/didn't hear any words/.test(r.wordAfterStep), "recognition ends with no result → English message");
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "interim-only", transcript: "แพง", wordStep: true });
  ok(/Correct! That sounded like/.test(r.wordAfterStep ?? ""), `recognition ends with only an interim result → still judged: ${(r.wordAfterStep ?? "").replace(/\n/g, " | ")}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "silent-end", sayTwiceEmpty: true });
  ok(/switched Say it to recording you/.test(r.afterTwoEmpty ?? ""), "two empty recognitions in a row → switches to record + on-device check");
}
// ---- iPhone: Say it records once → tone check + on-device word check; no speech recognition at all
{
  const r = await run({ wav: "falling", syllables: 1, ...IOS, via: "say", fakeAsr: "แพง" });
  show(r);
  ok(r.recDuring === 0, `iPhone: Say it never starts speech recognition (${r.recDuring}×)`);
  ok(/Correct! That sounded like “phaaeng”/.test(r.wordText), "iPhone: word check from the recording → Correct! in English");
  ok(r.tones[0] === "falling", `iPhone: same recording gives the tone check → ${r.tones[0]}`);
  ok(r.meterMax > 10, `iPhone: mic meter moved (max ${r.meterMax}%)`);
  ok(r.shift < 0.5 && !r.errors.length, `  no layout shift / errors (${r.shift}px ${r.errors.join("; ")})`);
}
{
  const r = await run({ wav: "falling", syllables: 1, ...IOS, via: "say" });
  ok(/one-time download/.test(r.wordText) && /Download and check my words/.test(r.wordText), "iPhone first use: asks before the ~80 MB model download");
}
{
  const r = await run({ wav: "falling", syllables: 1, ...IOS, via: "say", fakeAsr: "Pang!" });
  ok(/Close! I heard something like “Pang”/.test(r.wordText), `Latin transcript "Pang!" for แพง → ${r.wordText.replace(/\n+/g, " | ")}`);
}
{
  const r = await run({ wav: "thai-ผัดไทย", syllables: 2, scene: "meal", want: "ผัดไทย", ...IOS, via: "say", fakeAsr: "ฮัดเต้ย" });
  console.log("   screenshot case:", r.wordText.replace(/\n+/g, " | "));
  ok(/Not quite\. I heard something like “hát-dtôei” \(ฮัดเต้ย\)/.test(r.wordText), "heard ฮัดเต้ย → romanized “hát-dtôei”");
  ok(/Start "phàt" with a puffed p sound \(ph\)/.test(r.wordText) && /Start "thai" with a puffed t sound \(th\)/.test(r.wordText), "  syllable tips in plain English");
}
// ---- real Thai speech (Google TTS) with room noise + hum, through the fake mic
for (const [wav, label] of [["thai-ผัดไทย", "clean-ish"], ["phone-phatthai", "quiet voice + hum"]]) {
  const r = await run({ wav, syllables: 2, scene: "meal", want: "ผัดไทย", ...IOS, via: "say", fakeAsr: "ผัดไทย" });
  show(r);
  ok(r.target === "ผัดไทย", `  target ${r.target}`);
  ok(r.tones.length === 2 && r.tones.every((t) => t === "level" || t === "low" || t === "mid"), `real "phàt thai" (${label}) → ${r.tones.join(", ")} (low + mid, no false contour)`);
  ok(/2 of 2 syllables matched/.test(r.toneText), `  verdict: ${r.toneText.split("\n")[0]}`);
}
{
  const r = await run({ wav: "falling", syllables: 1, rec: "none", via: "say" });
  show(r);
  ok(r.recDuring === 0 && /one-time download|Download and check/.test(r.wordText), "no SpeechRecognition → Say it records and offers the on-device word check");
  ok(r.tones[0] === "falling", `  …and runs the tone check (${r.tones[0]})`);
}
{
  const r = await run({ wav: "falling", syllables: 1, ...IOS, rec: "denied-mic" });
  ok(/microphone is blocked/.test(r.toneText) && /aA/.test(r.toneText), `mic permission denied → English steps: ${r.toneText}`);
}
{
  const r = await run({ wav: "silence", syllables: 1 });
  ok(/couldn't hear a voice/.test(r.toneText), "near-silence (mic works) → 'Your mic works, but I couldn't hear a voice…'");
}
{
  const r = await run({ wav: "zeros", syllables: 1, ...IOS });
  ok(/I got no sound from your mic/.test(r.toneText), "all-zero mic → 'I got no sound from your mic' with steps");
}
{
  const r = await run({ wav: "falling", syllables: 1, ...IOS, silentTap: true, diag: true });
  ok(r.tones[0] === "falling", `Web Audio returns zeros → MediaRecorder fallback still classifies → ${r.tones[0]}`);
  ok(/MediaRecorder/.test(r.diagText?.capturePath ?? ""), `  diagnostics show the path: ${r.diagText?.capturePath}`);
  console.log("   diagnostics:", JSON.stringify(r.diagText));
  for (const k of ["userAgent", "speechRecognition", "wordCheckMode", "ctxStateAtTap", "ctxSampleRate", "peakLevel", "durationMs", "lastError"])
    ok(r.diagText && r.diagText[k] && r.diagText[k] !== "—", `  diagnostics ${k} = ${r.diagText?.[k]}`);
}
{
  const r = await run({ wav: "quiet-falling", syllables: 1, ...IOS });
  ok(r.tones[0] === "falling", `quiet mic (-40 dB) still gives a verdict → ${r.tones[0]}`);
}
{
  const r = await run({ wav: "short-rising", syllables: 1, ...IOS });
  ok(r.tones[0] === "rising", `very short word (0.18 s) still gives a verdict → ${r.tones[0]}`);
}

// Real on-device Whisper (downloads ~80 MB): REAL_ASR=1 node scripts/mic-test.mjs
if (process.env.REAL_ASR) {
  for (const [wav, scene, want] of [["thai-ผัดไทย", "meal", "ผัดไทย"], ["thai-แพง", "market", "แพง"]]) {
    const r = await run({ wav, syllables: want === "แพง" ? 1 : 2, scene, want, ...IOS, via: "say", fakeAsr: null, asrOk: true });
    show(r);
    ok(/I heard something like|Correct!/.test(r.wordText), `real Whisper on "${want}" → ${r.wordText.split("\n").filter(Boolean).slice(1, 3).join(" | ")}`);
  }
}

console.log(failures ? `${failures} failed` : "mic tests OK");
process.exit(failures ? 1 : 0);

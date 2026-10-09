// WebKit (Safari engine) run via Playwright, iPhone viewport. WebKit headless has no fake mic file option, so
// getUserMedia is replaced by a MediaStream generated with Web Audio (a synthetic voice with a known contour).
// This exercises WebKit's AudioContext, AudioWorklet/ScriptProcessor, MediaRecorder and the pitch code.
// Usage: node scripts/webkit-test.mjs [baseUrl]   (needs `playwright` + `npx playwright install webkit`)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { webkit, devices } = require(process.env.PLAYWRIGHT ?? "playwright");

const base = process.argv[2] ?? "http://localhost:4321/";
let failures = 0;
const ok = (c, m) => {
  console.log(`${c ? "✓" : "✗"} ${m}`);
  if (!c) failures++;
};

const STATE = { v: 1, onboarded: true, roman: true, voice: "male", name: "", streak: 0, lastDay: "", completed: [], cards: {}, toneBest: 0, letterBest: 0, toneStats: {}, pairBest: 0, pitchMedians: [] };

async function run({ contour, rec = "ok", transcript = "", zeros = false, noWorklet = false }) {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(
    ({ contour, rec, transcript, zeros, noWorklet, state }) => {
      localStorage.setItem("baan.v1", JSON.stringify(state));
      if (noWorklet) delete window.AudioWorkletNode;
      window.__gum = 0;
      const md = navigator.mediaDevices ?? (Object.defineProperty(navigator, "mediaDevices", { value: {}, configurable: true }), navigator.mediaDevices);
      const fake = async () => {
        window.__gum++;
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        await ac.resume();
        const R = ac.sampleRate;
        const pad = 0.5, dur = 0.55, tail = 3;
        const buf = ac.createBuffer(1, Math.round((pad + dur + tail) * R), R);
        const d = buf.getChannelData(0);
        let ph = 0;
        for (let i = 0; i < d.length; i++) {
          const t = i / R - pad;
          if (zeros || t < 0 || t >= dur) continue;
          const u = t / dur;
          const f = contour === "falling" ? 230 - 120 * u : contour === "rising" ? (u < 0.3 ? 150 - 60 * u : 132 + 100 * ((u - 0.3) / 0.7)) : 160;
          ph += (2 * Math.PI * f) / R;
          let s = 0;
          for (let k = 1; k <= 12; k++) s += Math.sin(k * ph) / k;
          d[i] = 0.2 * s * Math.min(1, u * 12, (1 - u) * 12);
        }
        const src = ac.createBufferSource();
        src.buffer = buf;
        const dst = ac.createMediaStreamDestination();
        src.connect(dst);
        src.start();
        return dst.stream;
      };
      Object.defineProperty(MediaDevices.prototype, "getUserMedia", { value: fake, configurable: true, writable: true });
      Object.defineProperty(md, "getUserMedia", { value: fake, configurable: true, writable: true });
      if (rec === "none") {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
        return;
      }
      window.__recStarted = 0;
      class FakeRec {
        start() {
          window.__recStarted++;
          setTimeout(() => {
            if (rec === "silent-end") this.onend?.();
            else {
              this.onresult?.({ results: [[{ transcript, confidence: 0.9 }]] });
              this.onend?.();
            }
          }, 500);
        }
        stop() {}
        abort() {}
      }
      window.webkitSpeechRecognition = FakeRec;
    },
    { contour, rec, transcript, zeros, noWorklet, state: STATE },
  );
  await page.goto(base + "#/scene/market");
  await page.waitForSelector("[data-sayit]");
  // move to the first one-syllable word (แพง) so one contour = one syllable
  for (let i = 0; i < 12; i++) {
    const roman = await page.$eval("article", (a) => a.querySelectorAll("p")[2]?.textContent ?? "");
    if (roman.split(/[\s-]+/).filter(Boolean).length === 1) break;
    await page.getByRole("button", { name: /^Next word/ }).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  const out = { errors, ua: await page.evaluate(() => navigator.userAgent) };

  // 1. Say it = recognition alone: must not touch getUserMedia
  if (rec !== "none") {
    await page.click("[data-sayit] > button");
    await page.waitForTimeout(150);
    out.sayLabel = (await page.textContent("[data-sayit] > button")).trim();
    await page.waitForTimeout(900);
    out.gumAfterSay = await page.evaluate(() => window.__gum);
    out.recAfterSay = await page.evaluate(() => window.__recStarted);
    out.word = await page.innerText("[data-word-check]");
  }
  // 2. Check my tones = recorder alone
  const recBefore = await page.evaluate(() => window.__recStarted ?? 0);
  await page.click(rec === "none" ? "[data-sayit] > button" : "[data-tone-button]");
  await page
    .waitForFunction(() => document.querySelector("[data-tone-button]").textContent === "Check my tones" && document.querySelector("[data-tone-feedback]").innerText.trim(), null, { timeout: 15000 })
    .catch(() => null);
  out.recDuringTone = (await page.evaluate(() => window.__recStarted ?? 0)) - recBefore;
  out.tone = await page.innerText("[data-tone-feedback]");
  out.heard = await page.$$eval("[data-tone-line]", (els) => els.map((e) => e.dataset.heardTone));
  await page.click("[data-diag-toggle]");
  out.diag = await page.$$eval("[data-diag-key]", (els) => Object.fromEntries(els.map((e) => [e.dataset.diagKey, e.textContent])));
  await page.screenshot({ path: `/workspace/webkit-${contour}-${rec}${zeros ? "-zeros" : ""}${noWorklet ? "-sp" : ""}.png`, fullPage: true });
  await browser.close();
  return out;
}

const r1 = await run({ contour: "falling", transcript: "แพง" });
console.log("   UA:", r1.ua);
console.log("   word:", r1.word.replace(/\n+/g, " | "));
console.log("   tone:", r1.tone.replace(/\n+/g, " | "));
console.log("   diag:", JSON.stringify(r1.diag));
ok(r1.sayLabel === "Stop" && r1.recAfterSay === 1, `WebKit: Say it starts speech recognition (label "${r1.sayLabel}")`);
ok(r1.gumAfterSay === 0, `WebKit: Say it does NOT open the recorder (getUserMedia calls: ${r1.gumAfterSay})`);
ok(/Correct\. That matched\./.test(r1.word), "WebKit: word check result shown in English");
ok(r1.recDuringTone === 0, `WebKit: Check my tones does not start recognition (${r1.recDuringTone}×)`);
ok(r1.heard[0] === "falling", `WebKit: falling voice → ${r1.heard[0]} (path: ${r1.diag.capturePath})`);
ok(!r1.errors.length, `WebKit: no page errors ${r1.errors.join("; ")}`);

const r2 = await run({ contour: "rising" });
ok(r2.heard[0] === "rising", `WebKit: rising voice → ${r2.heard[0]}`);
const r3 = await run({ contour: "flat" });
ok(r3.heard[0] === "level", `WebKit: level voice → ${r3.heard[0]}`);
const r4 = await run({ contour: "falling", noWorklet: true });
ok(r4.heard[0] === "falling", `WebKit ScriptProcessor path → ${r4.heard[0]} (${r4.diag.capturePath})`);
const r5 = await run({ contour: "falling", zeros: true });
ok(/I got no sound from your mic/.test(r5.tone), "WebKit: silent mic → 'I got no sound from your mic'");
const r6 = await run({ contour: "falling", rec: "silent-end" });
ok(/didn't hear any words/.test(r6.word) && /Dictation/.test(r6.word), `WebKit: recognition ends empty → ${r6.word.replace(/\n+/g, " | ")}`);
const r7 = await run({ contour: "falling", rec: "none" });
ok(r7.heard[0] === "falling", "WebKit without speech recognition: Say it runs the tone check");

console.log(failures ? `${failures} failed` : "webkit OK");
process.exit(failures ? 1 : 0);

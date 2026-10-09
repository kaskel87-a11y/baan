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

async function run({ contour, rec = "ok", transcript = "", zeros = false, noWorklet = false, asr = "แพง", pcm = null, scene = "market", want = null }) {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(
    ({ contour, rec, transcript, zeros, noWorklet, state, asr, pcm }) => {
      localStorage.setItem("baan.v1", JSON.stringify(state));
      if (asr !== null) window.__fakeTranscribe = () => new Promise((r) => setTimeout(() => r(asr), 300));
      if (noWorklet) delete window.AudioWorkletNode;
      window.__gum = 0;
      const md = navigator.mediaDevices ?? (Object.defineProperty(navigator, "mediaDevices", { value: {}, configurable: true }), navigator.mediaDevices);
      const fake = async () => {
        window.__gum++;
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        await ac.resume();
        const R = ac.sampleRate;
        const pad = 0.5, dur = 0.55, tail = pcm ? pcm.x.length / pcm.rate : 3;
        const buf = ac.createBuffer(1, Math.round((pad + dur + tail) * R), R);
        const d = buf.getChannelData(0);
        if (pcm) {
          // real recording, resampled by nearest sample to the context rate
          const r0 = pcm.rate;
          for (let i = 0; i < d.length; i++) d[i] = pcm.x[Math.floor((i * r0) / R)] ?? 0;
        }
        let ph = 0;
        for (let i = 0; i < d.length; i++) {
          const t = i / R - pad;
          if (pcm || zeros || t < 0 || t >= dur) continue;
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
    { contour, rec, transcript, zeros, noWorklet, state: STATE, asr, pcm },
  );
  await page.goto(base + `#/scene/${scene}`);
  await page.waitForSelector("[data-sayit]");
  // move to the first one-syllable word (แพง) so one contour = one syllable
  for (let i = 0; i < 12; i++) {
    const roman = await page.$eval("article", (a) => a.querySelectorAll("p")[2]?.textContent ?? "");
    const thai = await page.$eval("article .thai", (e) => e.textContent);
    if (want ? thai === want : roman.split(/[\s-]+/).filter(Boolean).length === 1) break;
    await page.getByRole("button", { name: /^Next word/ }).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  const out = { errors, ua: await page.evaluate(() => navigator.userAgent) };

  // iPhone: Say it records once (no speech recognition) → tone check + on-device word check
  await page.click("[data-sayit] > button");
  let meterMax = 0;
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    meterMax = Math.max(meterMax, await page.evaluate(() => parseFloat(document.querySelector("[data-meter-fill]").style.width) || 0));
  }
  out.meterMax = meterMax;
  out.sayLabel = (await page.textContent("[data-sayit] > button")).trim();
  await page
    .waitForFunction(() => document.querySelector("[data-sayit] > button").textContent.trim() === "Say it" && document.querySelector("[data-tone-feedback]").innerText.trim(), null, { timeout: 15000 })
    .catch(() => null);
  await page.waitForTimeout(600);
  out.gum = await page.evaluate(() => window.__gum);
  out.recStarted = await page.evaluate(() => window.__recStarted ?? 0);
  out.word = await page.innerText("[data-word-check]");
  out.tone = await page.innerText("[data-tone-feedback]");
  out.heard = await page.$$eval("[data-tone-line]", (els) => els.map((e) => e.dataset.heardTone));
  out.curve = await page.$$eval("[data-user-curve]", (els) => els.length);
  // then Check my tones on its own
  await page.click("[data-tone-button]");
  await page.waitForTimeout(300);
  out.gumAfterTone = await page.evaluate(() => window.__gum);
  out.recAfterTone = await page.evaluate(() => window.__recStarted ?? 0);
  await page.waitForFunction(() => !document.querySelector("[data-tone-button]").disabled && document.querySelector("[data-tone-button]").textContent === "Check my tones", null, { timeout: 15000 }).catch(() => null);
  out.heard2 = await page.$$eval("[data-tone-line]", (els) => els.map((e) => e.dataset.heardTone));
  await page.click("[data-diag-toggle]");
  out.diag = await page.$$eval("[data-diag-key]", (els) => Object.fromEntries(els.map((e) => [e.dataset.diagKey, e.textContent])));
  await page.screenshot({ path: `/workspace/webkit-${contour}-${rec}${zeros ? "-zeros" : ""}${noWorklet ? "-sp" : ""}.png`, fullPage: true });
  await browser.close();
  return out;
}

const r1 = await run({ contour: "falling" });
console.log("   UA:", r1.ua);
console.log("   word:", r1.word.replace(/\n+/g, " | "));
console.log("   tone:", r1.tone.replace(/\n+/g, " | "));
console.log("   diag:", JSON.stringify(r1.diag));
ok(r1.recStarted === 0 && r1.recAfterTone === 0, `WebKit iPhone: speech recognition never started (${r1.recStarted}, ${r1.recAfterTone})`);
ok(r1.gum === 1 && r1.sayLabel === "Stop", `WebKit iPhone: Say it records with the mic (getUserMedia ×${r1.gum}, label "${r1.sayLabel}")`);
ok(r1.meterMax > 10, `WebKit: live mic meter moves (max ${r1.meterMax}%)`);
ok(/Correct! That sounded like “phaaeng”/.test(r1.word), "WebKit: word check from the recording, in English with Thai/roman/meaning");
ok(r1.heard[0] === "falling" && r1.curve > 0, `WebKit: falling voice → ${r1.heard[0]}, curve drawn (path: ${r1.diag.capturePath})`);
ok(r1.gumAfterTone === 2 && r1.heard2[0] === "falling", `WebKit: Check my tones records alone → ${r1.heard2[0]}`);
ok(!r1.errors.length, `WebKit: no page errors ${r1.errors.join("; ")}`);

const r2 = await run({ contour: "rising" });
ok(r2.heard[0] === "rising", `WebKit: rising voice → ${r2.heard[0]}`);
const r3 = await run({ contour: "flat" });
ok(r3.heard[0] === "level", `WebKit: level voice → ${r3.heard[0]}`);
const r4 = await run({ contour: "falling", noWorklet: true });
ok(r4.heard[0] === "falling", `WebKit ScriptProcessor path → ${r4.heard[0]} (${r4.diag.capturePath})`);
const r5 = await run({ contour: "falling", zeros: true });
ok(/I got no sound from your mic/.test(r5.tone), "WebKit: silent mic → 'I got no sound from your mic'");
const r6 = await run({ contour: "falling", asr: null });
ok(/Download and check my words/.test(r6.word), "WebKit: first use asks before downloading the word checker");

{
  const { readFileSync } = await import("node:fs");
  const b = readFileSync("scripts/wav/thai-ผัดไทย.wav");
  const data = b.subarray(b.indexOf("data") + 8);
  const x = Array.from({ length: data.length / 2 }, (_, i) => data.readInt16LE(i * 2) / 32768);
  const r7 = await run({ contour: "real", pcm: { x, rate: 48000 }, scene: "meal", want: "ผัดไทย", asr: "ผัดไทย" });
  console.log("   tone:", r7.tone.replace(/\n+/g, " | "));
  ok(r7.heard.length === 2 && /2 of 2 syllables matched/.test(r7.tone), `WebKit real Thai "phàt thai" (noise + hum) → ${r7.heard.join(", ")}`);
  ok(/Correct! That sounded like “phàt-thai”/.test(r7.word), "WebKit real Thai: word check Correct");
}

console.log(failures ? `${failures} failed` : "webkit OK");
process.exit(failures ? 1 : 0);

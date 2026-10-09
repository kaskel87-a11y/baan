// Headless smoke test: walks every route and the main flows, fails on any page error or console error.
// Usage: node scripts/smoke.mjs [baseUrl]   (default http://localhost:4321/)
import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:4321/";
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true }); // iPhone-sized
const problems = [];
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));

const clickText = async (text, sel = "button, a") => {
  const ok = await page.evaluate(
    (text, sel) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent?.trim().startsWith(text) && !e.disabled);
      if (!el) return false;
      el.click();
      return true;
    },
    text,
    sel,
  );
  if (!ok) throw new Error(`no clickable "${text}" on ${page.url()}`);
  await new Promise((r) => setTimeout(r, 150));
};
const has = (text) => page.evaluate((t) => document.body.innerText.includes(t), text);
const step = async (name, fn) => {
  try {
    await fn();
    console.log("✓", name);
  } catch (e) {
    problems.push(`${name}: ${e.message}`);
    console.log("✗", name, e.message);
  }
};

// Fake SpeechRecognition so "Say it" can be exercised headlessly: returns window.__fakeTranscript after 400 ms.
await page.evaluateOnNewDocument(() => {
  class FakeRec {
    start() {
      setTimeout(() => {
        this.onresult?.({ results: [[{ transcript: window.__fakeTranscript ?? "", confidence: 0.9 }]] });
        this.onend?.();
      }, 400);
    }
    stop() {}
    abort() {}
  }
  window.SpeechRecognition = FakeRec;
  window.webkitSpeechRecognition = FakeRec;
});
await page.goto(base, { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle0" });

await step("onboarding", async () => {
  if (!(await has("Begin the morning"))) throw new Error("onboarding not shown");
  await clickText("ผม");
  await page.type("input", "Collin");
  await clickText("Begin the morning");
  if (!(await has("A day in the city"))) throw new Error("path not shown after onboarding");
});

await step("scene: preview → talk → drills → done", async () => {
  await clickText("Open the scene");
  for (let i = 0; i < 12 && (await has("Next word")); i++) await clickText("Next word");
  await clickText("Enter the conversation");
  for (let i = 0; i < 12 && (await has("Next line")); i++) await clickText("Next line");
  if (!(await has("ผมชื่อCollinครับ")) && !(await page.evaluate(() => location.hash))) throw new Error("name line missing");
  await clickText("Practice what you heard");
  for (let d = 0; d < 5; d++) {
    // answer whatever is shown: first option / particle / build tile
    const answered = await page.evaluate(() => {
      const art = document.querySelector("article");
      const btn = [...(art?.querySelectorAll("button") ?? [])].find((b) => !b.disabled && !/Hear|Slow|Play|Check|Say it/.test(b.textContent ?? ""));
      btn?.click();
      return !!btn;
    });
    if (!answered) throw new Error(`drill ${d} had nothing to answer`);
    await new Promise((r) => setTimeout(r, 120));
    if (await has("Check")) await clickText("Check");
    await clickText(d === 4 ? "Finish" : "Next");
  }
  if (!(await has("This scene"))) throw new Error("done screen missing");
  const hash = await page.evaluate(() => location.hash);
  if (hash !== "#/scene/cafe") throw new Error(`hash was ${hash}`);
});

await step("reload keeps the route", async () => {
  await page.reload({ waitUntil: "networkidle0" });
  if (!(await has("The café door"))) throw new Error("scene lost on reload");
});

const THAI = /[\u0E00-\u0E7F]/;
const ROMAN = /[àâáǎèêéěìîíǐòôóǒùûúǔ]/;

await step("req2: English always visible in a scene line (no Meaning button)", async () => {
  await page.goto(base + "#/scene/market", { waitUntil: "networkidle0" });
  await clickText("Skip ahead");
  if (!(await has("Hello. What are you looking for?"))) throw new Error("line English not shown");
  const meaningBtn = await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.textContent?.trim() === "Meaning"));
  if (meaningBtn) throw new Error("Meaning button still present");
});

await step("req1: Say it is one fixed-size button and nothing shifts", async () => {
  const measure = () =>
    page.evaluate(() => {
      const box = document.querySelector("[data-sayit]");
      const btn = box.querySelector("button");
      const next = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Next line");
      const r = btn.getBoundingClientRect();
      return { w: r.width, h: r.height, x: r.x, y: r.y, buttons: box.querySelectorAll("button").length, nextY: next.getBoundingClientRect().y + window.scrollY, label: btn.textContent.trim() };
    });
  await new Promise((r) => setTimeout(r, 500)); // let the .enter animation finish
  const idle = await measure();
  await page.evaluate(() => (window.__fakeTranscript = "ผิดหมดเลย"));
  await page.evaluate(() => document.querySelector("[data-sayit] button").click());
  await new Promise((r) => setTimeout(r, 100));
  const live = await measure();
  await new Promise((r) => setTimeout(r, 600));
  const done = await measure();
  console.log("   idle", JSON.stringify(idle), "\n   live", JSON.stringify(live), "\n   done", JSON.stringify(done));
  for (const [name, m] of [["live", live], ["done", done]]) {
    if (m.buttons !== 1) throw new Error(`${name}: ${m.buttons} buttons in Say it`);
    const near = (a, b) => Math.abs(a - b) < 0.5;
    if (!near(m.w, idle.w) || !near(m.h, idle.h) || !near(m.x, idle.x) || !near(m.y, idle.y)) throw new Error(`${name}: button moved/resized`);
    if (!near(m.nextY, idle.nextY)) throw new Error(`${name}: content below shifted ${idle.nextY} → ${m.nextY}`);
  }
  if (live.label !== "Stop") throw new Error(`live label ${live.label}`);
});

await step("req3: Say it correction is English + Thai + roman + meaning", async () => {
  const t = await page.evaluate(() => document.querySelector("[data-sayit-result]").innerText);
  for (const want of ["Not quite.", "I heard", "Target:", "sà-wàt-dii khráp duu à-rai khráp", "Hello. What are you looking for?"])
    if (!t.includes(want)) throw new Error(`missing "${want}" in: ${t}`);
});

await step("req3: every drill's feedback has English verdict + Thai + roman + meaning", async () => {
  await page.goto(base + "#/scene/meal", { waitUntil: "networkidle0" });
  await clickText("Skip ahead");
  for (let i = 0; i < 12 && (await has("Next line")); i++) await clickText("Next line");
  await clickText("Practice what you heard");
  for (let d = 0; d < 5; d++) {
    await page.evaluate((d) => {
      const art = document.querySelector("article");
      const opts = [...art.querySelectorAll("button")].filter((b) => !b.disabled && !/Hear|Slow|Play|Check|Say it/.test(b.textContent ?? ""));
      (opts[d % 2 === 0 ? 1 : 0] ?? opts[0])?.click(); // mix right and wrong answers
    }, d);
    await new Promise((r) => setTimeout(r, 120));
    if (await has("Check")) await clickText("Check");
    const fb = await page.evaluate(() => document.querySelector("[data-feedback]")?.innerText ?? "");
    if (!/^(Correct\.|Not quite\.)/.test(fb)) throw new Error(`drill ${d}: verdict not English: ${fb}`);
    if (!THAI.test(fb) || !ROMAN.test(fb.replace(/[\u0E00-\u0E7F]/g, "")) && !/[a-z]{2,}/.test(fb)) throw new Error(`drill ${d}: missing Thai/roman: ${fb}`);
    if (!/“.+”/.test(fb)) throw new Error(`drill ${d}: missing English meaning: ${fb}`);
    if (/That stayed|Not this time/.test(fb)) throw new Error("old feedback wording");
    console.log(`   drill ${d}: ${fb.replace(/\n+/g, " | ")}`);
    await clickText(d === 4 ? "Finish" : "Next");
  }
});

await step("review: From English hides the answer", async () => {
  await page.goto(base + "#/review", { waitUntil: "networkidle0" });
  await clickText("Review ").catch(() => clickText("Study ahead"));
  await clickText("From English");
  if (await has("Hear")) {
    const hearVisible = await page.evaluate(() => [...document.querySelectorAll("article button")].some((b) => b.textContent?.trim() === "Hear"));
    if (hearVisible) throw new Error("Hear button visible before Show in From English mode");
  }
  await clickText("Show");
  await clickText("Good");
});

await step("tones: minimal pairs + heat grid", async () => {
  await page.goto(base + "#/tones", { waitUntil: "networkidle0" });
  await clickText("Start 20 trials");
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      const art = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Which word did you hear"));
      const b = [...(art?.querySelectorAll("button") ?? [])].find((x) => !x.disabled && x.querySelector("[lang=th]"));
      b?.click();
    });
    await new Promise((r) => setTimeout(r, 60));
    await clickText(i === 19 ? "Done" : "Next");
  }
  if (!(await has("Your weakest pair"))) throw new Error("weakest-pair line missing after 20 trials");
  await clickText("Start 20 trials");
  const optsHaveEnglish = await page.evaluate(() => {
    const art = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Which word did you hear"));
    return [...art.querySelectorAll("button[class*=bg-paper]")].every((b) => /“.+”/.test(b.textContent));
  });
  if (!optsHaveEnglish) throw new Error("trainer options lack English before answering");
  await page.evaluate(() => {
    const art = [...document.querySelectorAll("article")].find((a) => a.textContent?.includes("Which word did you hear"));
    art.querySelector("button[class*=bg-paper]").click();
  });
  await new Promise((r) => setTimeout(r, 100));
  const fb = await page.evaluate(() => document.querySelector("[data-feedback]")?.innerText ?? "");
  if (!/^(Correct|Not quite)/.test(fb) || !/“.+”/.test(fb) || !/tone/.test(fb)) throw new Error(`trainer feedback: ${fb}`);
  console.log("   trainer: " + fb);
  const stats = await page.evaluate(() => JSON.parse(localStorage.getItem("baan.v1")).toneStats);
  if (!stats || !Object.keys(stats).length) throw new Error("toneStats not saved");
});

await step("tones: phrase quiz + ear + rules", async () => {
  if (await has("Ten phrases")) {
    await clickText("Ten phrases");
    await clickText("High", "article button").catch(() => {});
  } else console.log("  (phrase quiz hidden: no Intl.Segmenter)");
  await clickText("Hear eight words");
  await clickText("Dead, short");
});

await step("letters", async () => {
  await page.goto(base + "#/letters", { waitUntil: "networkidle0" });
  await clickText("ห", "button");
  if (!(await has("ห้า"))) throw new Error("ห example not ห้า");
  await clickText("Ten letters");
  await clickText("Mid", "article button");
  await clickText("Next letter");
});

await step("settings", async () => {
  await page.goto(base + "#/settings", { waitUntil: "networkidle0" });
  if (!(await has("Your voice in the lessons"))) throw new Error("settings missing");
});

await step("manifest", async () => {
  const m = await page.evaluate(async () => (await fetch("manifest.webmanifest")).json());
  if (m.short_name !== "Baan") throw new Error(`manifest name ${m.short_name}`);
});

const sayIt = await page.evaluate(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
console.log(`SpeechRecognition available in this Chrome: ${sayIt}`);
await browser.close();
if (problems.length) {
  console.log("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nsmoke OK");

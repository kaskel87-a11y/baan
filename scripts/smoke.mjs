// Headless smoke test: walks every route and the main flows, fails on any page error or console error.
// Usage: node scripts/smoke.mjs [baseUrl]   (default http://localhost:4321/)
import puppeteer from "puppeteer-core";
import { thaiSyllables, romanKey } from "../src/lib/romanize.ts";

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
// Standing rule: feedback must be readable without Thai. Watch every feedback area as it changes and record
// any line where Thai appears without romanization (Latin letters) on the same line.
await page.evaluateOnNewDocument(() => {
  window.__thaiOnly = [];
  const check = () => {
    for (const el of document.querySelectorAll("[data-feedback], [data-word-feedback], [data-tone-feedback], [data-word-check]")) {
      for (const line of el.innerText.split("\n")) {
        if (/[\u0E00-\u0E7F]/.test(line)) window.__thaiOnly.push(line.trim());
      }
    }
  };
  new MutationObserver(check).observe(document, { subtree: true, childList: true, characterData: true });
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
      const btn = box.querySelector(":scope > button");
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
    if (m.buttons !== idle.buttons) throw new Error(`${name}: buttons in Say it changed ${idle.buttons} → ${m.buttons}`);
    const near = (a, b) => Math.abs(a - b) < 0.5;
    if (!near(m.w, idle.w) || !near(m.h, idle.h) || !near(m.x, idle.x) || !near(m.y, idle.y)) throw new Error(`${name}: button moved/resized`);
    if (!near(m.nextY, idle.nextY)) throw new Error(`${name}: content below shifted ${idle.nextY} → ${m.nextY}`);
  }
  if (live.label !== "Stop") throw new Error(`live label ${live.label}`);
});

await step("req3: Say it correction is English + Thai + roman + meaning", async () => {
  const t = await page.evaluate(() => document.querySelector("[data-sayit-result]").innerText);
  for (const want of ["Not quite.", "I heard something like", "Target:", "sà-wàt-dii khráp duu à-rai khráp", "Hello. What are you looking for?"])
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

await step("review: SRS cards hide the answer until Show", async () => {
  await page.goto(base + "#/review", { waitUntil: "networkidle0" });
  if (!(await has("due"))) throw new Error("review header missing due/new/learned");
  await clickText("Review ").catch(() => clickText("Study ahead"));
  const kind = await page.evaluate(() => {
    const art = document.querySelector("article");
    const label = art?.querySelector(".text-sm.text-muted:last-child, p.text-sm")?.textContent?.trim() ?? "";
    const ps = [...(art?.querySelectorAll("p") ?? [])].map((p) => p.textContent?.trim() ?? "");
    return { hasShow: [...(art?.querySelectorAll("button") ?? [])].some((b) => b.textContent?.trim() === "Show"), body: ps.join(" | ") };
  });
  if (!kind.hasShow) throw new Error("Show button missing on first card");
  // Before Show, a produce card must not reveal Thai; a listen card must not show Thai text yet.
  const thaiBefore = await page.evaluate(() => {
    const art = document.querySelector("article");
    const thaiEls = [...(art?.querySelectorAll(".thai, [lang=th]") ?? [])];
    return thaiEls.some((el) => el.textContent && /[\u0E00-\u0E7F]/.test(el.textContent) && el.offsetParent !== null && !el.closest("[data-sayit]"));
  });
  const label = await page.evaluate(() => {
    const art = document.querySelector("article");
    return [...(art?.querySelectorAll("p") ?? [])].map((p) => p.textContent?.trim()).find((t) => /Listen|Read|Say it/.test(t ?? "")) ?? "";
  });
  if (/Listen|Say it/.test(label) && thaiBefore) throw new Error(`${label} showed Thai before Show`);
  if (await has("Hear") && /Say it|Listen/.test(label)) {
    const hearVisible = await page.evaluate(() =>
      [...document.querySelectorAll("article button")].some((b) => b.textContent?.trim() === "Hear" && !b.closest("[data-sayit]")),
    );
    // Listen cards may Hear; produce must not.
    if (/Say it/.test(label) && hearVisible) throw new Error("Hear visible on produce before Show");
  }
  await clickText("Show");
  if (!(await has("Hard"))) throw new Error("Hard grade missing after Show");
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

await step("today: mixed session runs end to end, Finish later resumes, goal moves the streak", async () => {
  await page.goto(base + "#/path", { waitUntil: "networkidle0" });
  if (!(await has("Start today’s session"))) throw new Error("Today card missing on Path");
  await clickText("Start today’s session");
  if (!(await has("One short mixed session"))) throw new Error("Today screen missing");
  await clickText("Start today’s session");
  const btn = (t) => page.evaluate((t) => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === t && !b.disabled), t);
  const stepText = () => page.evaluate(() => document.body.innerText.match(/Step (\d+) of (\d+)/)?.slice(1).map(Number) ?? null);
  const first = await stepText();
  if (!first) throw new Error("no step counter");
  // Finish later, then resume at the same step.
  await clickText("Finish later");
  if (!(await has("Resume today’s session"))) throw new Error("no Resume on Path");
  await clickText("Resume today’s session");
  if ((await stepText())?.[0] !== first[0]) throw new Error("did not resume at the same step");
  for (let guard = 0; guard < 200; guard++) {
    if (await has("Today’s session is done")) break;
    const label = await page.evaluate(() => document.querySelector("main p.font-display")?.textContent ?? "");
    if (/^Review/.test(label)) {
      if (await has("Review done")) await clickText("Next");
      else {
        await clickText("Show");
        await clickText("Good");
      }
    } else if (/tone pairs/.test(label)) {
      if (await has("Start 10 trials")) await clickText("Start 10 trials");
      else if (await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => /^(Next|Done)$/.test(b.textContent.trim()))))
        await clickText((await btn("Done")) ? "Done" : "Next");
      else await page.evaluate(() => [...document.querySelectorAll("article button")].find((b) => b.querySelector(".thai") || /^(Same|Different)$/.test(b.textContent.trim()))?.click());
    } else if (/scene/i.test(label)) {
      if (!(await has("Open the scene"))) throw new Error("scene step has no Open button");
      await clickText("Skip this step");
    } else if (/prices/.test(label)) {
      if (await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "5 prices"))) await clickText("5 prices");
      else if (await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Check"))) {
        await page.type("input[inputmode=numeric]", "1");
        await clickText("Check");
      } else await clickText((await btn("Done")) ? "Done" : "Next");
    } else throw new Error(`unknown step "${label}"`);
    await new Promise((r) => setTimeout(r, 60));
  }
  if (!(await has("Today’s session is done")))
    throw new Error("session never finished: " + (await page.evaluate(() => document.querySelector("main").innerText.slice(0, 400).replace(/\n+/g, " | "))));
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem("baan.v1")));
  const d = new Date();
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (!st.history?.[key]?.met) throw new Error("goal not marked met");
  if (!(st.history[key].items >= 10)) throw new Error(`only ${st.history[key].items} items counted`);
  if (st.streak.count !== 1) throw new Error(`streak ${st.streak.count}`);
  await page.goto(base + "#/path", { waitUntil: "networkidle0" });
  if (!(await has("Goal met for today"))) throw new Error("Path does not show goal met");
});

await step("settings", async () => {
  await page.goto(base + "#/settings", { waitUntil: "networkidle0" });
  if (!(await has("Your voice in the lessons"))) throw new Error("settings missing");
});

await step("manifest", async () => {
  const m = await page.evaluate(async () => (await fetch("manifest.webmanifest")).json());
  if (m.short_name !== "Baan") throw new Error(`manifest name ${m.short_name}`);
});

await step("rule: no Thai-only line in any feedback seen during the run", async () => {
  // every Thai run needs its romanization right next to it (within 50 characters)
  const strip = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const bad = [];
  for (const line of new Set(await page.evaluate(() => window.__thaiOnly))) {
    for (const m of line.matchAll(/[\u0E00-\u0E7F]+/g)) {
      const first = thaiSyllables(m[0])[0];
      if (!first) continue;
      const near = strip(line.slice(Math.max(0, m.index - 50), m.index) + " " + line.slice(m.index + m[0].length, m.index + m[0].length + 50));
      const key = romanKey(first.onset + first.vowel).slice(0, 2);
      if (!near.split(/[^a-z]+/).some((t) => romanKey(t).startsWith(key))) bad.push(`${m[0]} in “${line}”`);
    }
  }
  if (bad.length) throw new Error(`Thai without romanization: ${bad.slice(0, 5).join(" | ")}`);
});

const sayIt = await page.evaluate(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
console.log(`SpeechRecognition available in this Chrome: ${sayIt}`);

await step("role-play: speak your lines, stable action row, no Thai-only cue", async () => {
  await page.goto(base + "#/scene/market", { waitUntil: "networkidle0" });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  if (await has("Hear it again")) await clickText("Role-play");
  else {
    if (await has("Skip ahead")) await clickText("Skip ahead");
    else if (await has("Enter the conversation")) await clickText("Enter the conversation");
    for (let i = 0; i < 15 && (await has("Next line")); i++) await clickText("Next line");
    await clickText("Role-play it");
  }
  let sawMine = false;
  for (let i = 0; i < 20 && !(await has("Role-play finished")); i++) {
    const info = await page.evaluate(() => {
      const art = document.querySelector("[data-roleplay] article");
      const row = document.querySelector("[data-roleplay] > div:last-child");
      return { mine: /Your turn/.test(art?.textContent ?? ""), latin: /[a-z]/i.test(art?.textContent ?? ""), y: row?.getBoundingClientRect().height };
    });
    if (!info.latin) throw new Error("role-play line had no English/romanization");
    if (info.mine) {
      sawMine = true;
      if (!(await has("Say it"))) throw new Error("no Say it on your turn");
    }
    const btn = await page.evaluate(() => [...document.querySelectorAll("[data-roleplay] > div:last-child button")].map((b) => b.textContent.trim()).find((t) => /Next line|Your turn next|Finish/.test(t)));
    await clickText(btn);
  }
  if (!sawMine) throw new Error("never got a 'your turn' line");
  if (!(await has("Role-play finished"))) throw new Error("no summary");
});


await step("listen & respond: audio-first cue, pick reveals English", async () => {
  await page.goto(base + "#/scene/market", { waitUntil: "networkidle0" });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  if (await has("Hear it again")) await clickText("Listen & respond");
  else {
    if (await has("Skip ahead")) await clickText("Skip ahead");
    else if (await has("Enter the conversation")) await clickText("Enter the conversation");
    for (let i = 0; i < 15 && (await has("Next line")); i++) await clickText("Next line");
    await clickText("Listen & respond");
  }
  if (!(await has("Listen first"))) throw new Error("no listen cue");
  if (!(await has("You’ll see what they said"))) throw new Error("cue English should stay hidden until after answer");
  const advance = async () => {
    await page.evaluate(() => {
      const pickTab = [...document.querySelectorAll("[data-listenrespond] button")].find((b) => b.textContent?.trim() === "Pick");
      pickTab?.click();
    });
    await new Promise((r) => setTimeout(r, 80));
    const chose = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("[data-listenrespond] article:nth-of-type(2) button")];
      const pick = btns.find((b) => b.textContent && !/Show Thai|Play|Slow|Say it|Pick|Show the reply|Hear/.test(b.textContent) && !b.disabled);
      if (!pick) return null;
      pick.click();
      return pick.textContent.trim();
    });
    if (!chose) throw new Error("no pick option");
    await new Promise((r) => setTimeout(r, 150));
    if (!(await has("You say:"))) throw new Error("no reveal after pick");
    const moved = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("[data-listenrespond] > div:last-child button")].find((b) => /^(Next|Finish)$/.test(b.textContent.trim()) && !b.disabled);
      if (!btn) return false;
      btn.click();
      return true;
    });
    if (!moved) throw new Error("no enabled Next/Finish after reveal");
    await new Promise((r) => setTimeout(r, 150));
  };
  for (let i = 0; i < 8 && !(await has("Listen & respond finished")); i++) await advance();
  if (!(await has("Listen & respond finished"))) throw new Error("no listen-respond summary");
});

await step("shadowing: plays, echo pause, hands-free runs to the end", async () => {
  await page.goto(base + "#/scene/market", { waitUntil: "networkidle0" });
  const savedScene = await page.evaluate(() => sessionStorage.getItem("baan.scene.market"));
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => {
    window.__utts = [];
    speechSynthesis.speak = (u) => { window.__utts.push(u.text); u.onend && setTimeout(() => u.onend(), 30); };
  });
  if (await has("Hear it again")) await clickText("Shadow");
  else {
    if (await has("Skip ahead")) await clickText("Skip ahead");
    else if (await has("Enter the conversation")) await clickText("Enter the conversation");
    for (let i = 0; i < 15 && (await has("Next line")); i++) await clickText("Next line");
    await clickText("Shadow");
  }
  if (!(await page.$("[data-shadow]"))) throw new Error("shadow did not open");
  await new Promise((r) => setTimeout(r, 400));
  if (!(await has("Your turn: echo it now"))) throw new Error("no echo pause after the line played");
  if (!(await has("Say it"))) throw new Error("no Say it in Check me");
  const latin = await page.evaluate(() => /[a-z]/i.test(document.querySelector("[data-shadow] article")?.textContent ?? ""));
  if (!latin) throw new Error("no English/romanization on the line");
  await clickText("Hands-free");
  await clickText("Start");
  const total = await page.evaluate(() => Number(/of (\d+)/.exec(document.querySelector("[data-shadow] p")?.textContent ?? "")?.[1] ?? 0));
  for (let i = 0; i < total * 12 && !(await has("Shadowing finished")); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await has("Shadowing finished"))) throw new Error("hands-free did not reach the summary");
  const played = await page.evaluate(() => window.__utts.length);
  if (played < total) throw new Error(`only ${played} of ${total} lines played`);
  // Leave the scene the way the earlier steps left it, for the steps that follow.
  await page.goto(base + "#/path", { waitUntil: "networkidle0" });
  await page.evaluate((v) => v && sessionStorage.setItem("baan.scene.market", v), savedScene);
});

await step("listening story: listen, answer in English, then full transcript", async () => {
  await page.goto(base + "#/stories", { waitUntil: "networkidle0" });
  if (!(await has("Listening stories"))) throw new Error("no stories list");
  await page.evaluate(() => {
    window.__utts = [];
    speechSynthesis.speak = (u) => { window.__utts.push({ t: u.text, r: u.rate }); u.onend && setTimeout(() => u.onend(), 30); };
  });
  await clickText("01");
  if (!(await has("Morning coffee"))) throw new Error("story did not open");
  if (await has("In the morning, Tom goes")) throw new Error("English shown before questions");
  await clickText("Play the story");
  await new Promise((r) => setTimeout(r, 5500));
  if (!(await has("Play the story again"))) throw new Error("player did not return to idle after the story");
  const n = await page.evaluate(() => window.__utts.length);
  if (n < 7) throw new Error(`expected 7 sentences spoken, got ${n}`);
  await clickText("Answer the questions");
  for (let i = 0; i < 6 && !(await has("Story finished")); i++) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("[data-story-questions] article button")].find((x) => !x.disabled);
      b?.click();
    });
    await new Promise((r) => setTimeout(r, 100));
    if (!(await page.$("[data-story-feedback]"))) throw new Error("no feedback after answer");
    await clickText(i === 3 ? "See the story" : "Next");
  }
  if (!(await has("Story finished"))) throw new Error("no story summary");
  if (!(await has("In the morning, Tom goes to a café."))) throw new Error("no English transcript");
  if (!(await has("dtawn cháo"))) throw new Error("no romanization in transcript");
});

await step("audio: Slow uses a much lower rate and splits words", async () => {
  await page.goto(base + "#/scene/market", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    window.__utts = [];
    const real = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { window.__utts.push({ t: u.text, r: u.rate }); u.onend && setTimeout(() => u.onend(), 50); };
    void real;
  });
  await page.evaluate(() => sessionStorage.clear());
  const hear = async (label) => {
    await page.evaluate(() => (window.__utts = []));
    await clickText(label);
    await new Promise((r) => setTimeout(r, 1500));
    return page.evaluate(() => window.__utts);
  };
  if (await has("Role-play again")) await clickText("Hear it again");
  if (!(await has("Hear"))) await clickText("Hear it again");
  const n = await hear("Hear");
  const s = await hear("Slow");
  if (!n.length || !s.length) throw new Error("no utterances");
  if (!(s[0].r < n[0].r - 0.2)) throw new Error(`slow rate ${s[0].r} vs normal ${n[0].r}`);
  console.log("   normal", JSON.stringify(n), "slow", JSON.stringify(s));
});

await browser.close();
if (problems.length) {
  console.log("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nsmoke OK");

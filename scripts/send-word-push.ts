/**
 * Sends one lock-screen word. Used by the hourly GitHub Action.
 * Skips quietly when the VAPID private key or PUSH_SUBS secret is missing.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { VOCAB } from "../src/data/vocab.ts";
import { VAPID_PUBLIC_KEY } from "../src/lib/push.ts";
import { hoursFor, nextPushWord, nyClock, perDay, slotId, type PerDay } from "../src/lib/pushPlan.ts";

const require = createRequire(import.meta.url);
const webpush = require("web-push") as {
  setVapidDetails: (subject: string, pub: string, priv: string) => void;
  sendNotification: (sub: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string) => Promise<{ statusCode: number }>;
};

const STATE = ".push-state.json";
const subject = process.env.VAPID_SUBJECT || "https://learnthaibaan.github.io";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const test = process.env.PUSH_TEST === "true" || process.env.PUSH_TEST === "1";

interface Sub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  schedule?: PerDay;
}

function loadSubs(): Sub[] {
  const raw = process.env.PUSH_SUBS || "";
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw) as Sub | Sub[];
  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list.filter((s) => s && s.endpoint && s.keys?.p256dh && s.keys?.auth);
}

function loadState(): { recent: string[]; lastSlot: string } {
  if (!existsSync(STATE)) return { recent: [], lastSlot: "" };
  try {
    const j = JSON.parse(readFileSync(STATE, "utf8")) as { recent?: string[]; lastSlot?: string };
    return { recent: Array.isArray(j.recent) ? j.recent : [], lastSlot: j.lastSlot || "" };
  } catch {
    return { recent: [], lastSlot: "" };
  }
}

async function main() {
  if (!privateKey || !process.env.PUSH_SUBS) {
    console.log("Word push skipped: VAPID_PRIVATE_KEY or PUSH_SUBS is not set.");
    return;
  }
  const clock = nyClock();
  const subs = loadSubs().map((s) => ({ ...s, schedule: perDay(s.schedule) }));
  const due = test ? subs : subs.filter((s) => hoursFor(s.schedule).includes(clock.hour));
  if (!due.length) {
    console.log(`No send at New York hour ${clock.hour}.`);
    return;
  }
  const slot = slotId(clock);
  const state = loadState();
  if (!test && state.lastSlot === slot) {
    console.log(`Already sent ${slot}.`);
    return;
  }
  const picked = nextPushWord(VOCAB, state.recent);
  if (!picked) {
    console.log("No vocab to send.");
    return;
  }
  webpush.setVapidDetails(subject, VAPID_PUBLIC_KEY, privateKey);
  const payload = JSON.stringify({
    title: picked.word.thai,
    body: `${picked.word.roman} · ${picked.word.en}`,
    data: { id: picked.word.id },
  });
  let ok = 0;
  for (const sub of due) {
    try {
      const res = await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
      ok += 1;
      console.log("sent", picked.word.id, res.statusCode);
    } catch (err) {
      const status = (err as { statusCode?: number; message?: string }).statusCode;
      console.log("send failed", status || (err as Error).message);
    }
  }
  if (ok) {
    writeFileSync(STATE, JSON.stringify({ recent: picked.recent, lastSlot: test ? state.lastSlot : slot }, null, 2));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

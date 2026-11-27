import type { Gendered, Scene, Voice } from "../data/types";
import { pick } from "./thai";

export const SHARE_URL = "https://learnthaibaan.github.io/";
export const STREAK_MILESTONES = [3, 7, 30] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export type SharePhrase = { thai: string; roman: string };

const FALLBACK: SharePhrase = { thai: "สวัสดี", roman: "sà-wàt-dii" };

function lengthOf(thai: string) {
  return Array.from(thai.replace(/\s+/g, "")).length;
}

function lineText(v: Gendered, voice: Voice) {
  return pick(v, voice);
}

/** A short line from the scene, with romanization. Skips name slots. Adult scenes return nothing. */
export function phraseFromScene(scene: Scene, voice: Voice): SharePhrase | null {
  if (scene.adult) return null;
  const lines = [...scene.lines.filter((l) => l.who === "you"), ...scene.lines];
  const resolved: SharePhrase[] = [];
  for (const line of lines) {
    const thai = lineText(line.thai, voice);
    const roman = lineText(line.roman, voice);
    if (!thai || !roman || thai.includes("{name}") || roman.includes("{name}")) continue;
    resolved.push({ thai, roman });
  }
  const short = resolved.find((p) => lengthOf(p.thai) <= 16);
  return short ?? resolved[0] ?? null;
}

export function sceneShareContent(scene: Scene, voice: Voice) {
  const phrase = phraseFromScene(scene, voice) ?? FALLBACK;
  return {
    kicker: "Baan",
    headline: scene.title,
    phrase,
    caption: `${SHARE_URL.replace(/^https:\/\//, "")} · 100% free, zero ads`,
    title: `Baan — ${scene.title}`,
    text: `I finished ${scene.title} on Baan.\n${phrase.thai}\n${phrase.roman}\nBaan is 100% free with zero ads.`,
    fileName: `baan-${scene.id}.png`,
    alt: `Share card: ${scene.title}, ${phrase.thai} ${phrase.roman}`,
  };
}

const STREAK_PHRASES: Record<StreakMilestone, SharePhrase> = {
  3: { thai: "สามวันติดกัน", roman: "sǎam wan dtìt gan" },
  7: { thai: "เจ็ดวันติดกัน", roman: "jèt wan dtìt gan" },
  30: { thai: "สามสิบวันติดกัน", roman: "sǎam-sìp wan dtìt gan" },
};

export function streakShareContent(days: StreakMilestone) {
  // A phrase that fits the milestone itself (no particle, so it reads the same for every voice).
  const phrase: SharePhrase = STREAK_PHRASES[days];
  const headline = `${days}-day streak`;
  return {
    kicker: "Baan",
    headline,
    phrase,
    caption: `${SHARE_URL.replace(/^https:\/\//, "")} · 100% free, zero ads`,
    title: `Baan — ${headline}`,
    text: `A ${headline} on Baan.\n${phrase.thai}\n${phrase.roman}\nBaan is 100% free with zero ads.`,
    fileName: `baan-streak-${days}.png`,
    alt: `Share card: ${headline}, ${phrase.thai} ${phrase.roman}`,
  };
}

export type ShareCardContent = ReturnType<typeof sceneShareContent>;

export function canShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function canShareFile(file: File): boolean {
  try {
    return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/** Share the card image when the browser allows files; otherwise text plus the URL. */
export async function shareMoment(opts: { file?: File; title: string; text: string; url?: string }): Promise<"shared" | "cancelled" | "unavailable"> {
  const url = opts.url ?? SHARE_URL;
  const textWithUrl = opts.text.includes(url) ? opts.text : `${opts.text}\n${url}`;
  const share = typeof navigator.share === "function" ? navigator.share.bind(navigator) : null;
  if (!share) return "unavailable";
  const tryShare = async (data: ShareData) => {
    await share(data);
    return "shared" as const;
  };
  try {
    if (opts.file && canShareFile(opts.file)) {
      return await tryShare({ title: opts.title, text: textWithUrl, files: [opts.file] });
    }
    return await tryShare({ title: opts.title, text: opts.text, url });
  } catch (err) {
    if ((err as DOMException).name === "AbortError") return "cancelled";
    try {
      return await tryShare({ title: opts.title, text: opts.text, url });
    } catch (err2) {
      if ((err2 as DOMException).name === "AbortError") return "cancelled";
      return "unavailable";
    }
  }
}

export async function copyLink(url = SHARE_URL): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

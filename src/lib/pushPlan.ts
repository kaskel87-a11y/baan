/** Lock-screen word times, America/New_York, and which vocab item goes out next. */

export type PerDay = 1 | 3 | 5;

export const PUSH_HOURS: Record<PerDay, number[]> = {
  1: [9],
  3: [9, 13, 19],
  5: [8, 11, 14, 17, 20],
};

export function perDay(n: unknown): PerDay {
  return n === 1 || n === 5 ? n : 3;
}

export function hoursFor(n: unknown): number[] {
  return PUSH_HOURS[perDay(n)];
}

export function scheduleLine(n: unknown): string {
  const hours = hoursFor(n);
  const labels = hours.map((h) => {
    const suffix = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:00 ${suffix}`;
  });
  if (labels.length === 1) return `${labels[0]} New York time.`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]} New York time.`;
}

export interface NyClock {
  year: string;
  month: string;
  day: string;
  hour: number;
}

/** Wall clock in America/New_York. Hour 24 from some engines is midnight. */
export function nyClock(now = new Date()): NyClock {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  return { year: parts.year ?? "", month: parts.month ?? "", day: parts.day ?? "", hour };
}

export function slotId(clock: NyClock) {
  return `${clock.year}-${clock.month}-${clock.day}T${String(clock.hour).padStart(2, "0")}`;
}

export interface PushWord {
  id: string;
  thai: string;
  roman: string;
  en: string;
  adult?: boolean;
}

/** Next unused word. Recent ids are skipped until the list has been through them. */
export function nextPushWord(words: PushWord[], recent: string[]) {
  const pool = words.filter((w) => !w.adult && w.thai && w.roman && w.en);
  const seen = new Set(recent);
  let choices = pool.filter((w) => !seen.has(w.id));
  let base = recent;
  if (!choices.length) {
    const last = recent[recent.length - 1];
    choices = pool.filter((w) => w.id !== last);
    if (!choices.length) choices = pool;
    base = last ? [last] : [];
  }
  const word = choices[0];
  if (!word) return null;
  return { word, recent: [...base, word.id].slice(-90) };
}

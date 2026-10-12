/** Number → Thai words (and romanization) for the prices trainer. */

export const DIGIT_TH = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"] as const;
export const DIGIT_ROMAN = ["sǔun", "nèung", "sǎawng", "sǎam", "sìi", "hâa", "hòk", "jèt", "bpàet", "gâo"] as const;
export const DIGIT_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"] as const;

/** Thai digits ๐–๙ */
export const THAI_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"] as const;

const ONES_TH = DIGIT_TH;
const ONES_ROMAN = DIGIT_ROMAN;

/** 0–9999 → Thai words (everyday Bangkok style). */
export function numberToThai(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 99_999 || !Number.isInteger(n)) {
    throw new RangeError(`numberToThai expects 0–99999, got ${n}`);
  }
  if (n === 0) return "ศูนย์";

  const parts: string[] = [];
  const muen = Math.floor(n / 10_000);
  const thou = Math.floor((n % 10_000) / 1_000);
  const hun = Math.floor((n % 1_000) / 100);
  const rest = n % 100;

  if (muen) {
    parts.push(muen === 1 ? "หนึ่งหมื่น" : `${ONES_TH[muen]}หมื่น`);
  }
  if (thou) {
    parts.push(thou === 1 ? "หนึ่งพัน" : `${ONES_TH[thou]}พัน`);
  }
  if (hun) {
    parts.push(hun === 1 ? "หนึ่งร้อย" : `${ONES_TH[hun]}ร้อย`);
  }
  if (rest) {
    // After a higher place, bare 1 is เอ็ด (ร้อยเอ็ด, พันเอ็ด), not หนึ่ง.
    if (rest === 1 && parts.length) parts.push("เอ็ด");
    else parts.push(underHundred(rest));
  }
  return parts.join("");
}

function underHundred(n: number): string {
  if (n < 10) return ONES_TH[n]!;
  if (n === 10) return "สิบ";
  if (n === 11) return "สิบเอ็ด";
  if (n < 20) return `สิบ${ONES_TH[n % 10]}`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensWord = tens === 2 ? "ยี่สิบ" : `${ONES_TH[tens]}สิบ`;
  if (!ones) return tensWord;
  if (ones === 1) return `${tensWord}เอ็ด`;
  return `${tensWord}${ONES_TH[ones]}`;
}

/** Matching romanization for numberToThai output (app tone-mark style). */
export function numberToRoman(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 99_999 || !Number.isInteger(n)) {
    throw new RangeError(`numberToRoman expects 0–99999, got ${n}`);
  }
  if (n === 0) return "sǔun";

  const parts: string[] = [];
  const muen = Math.floor(n / 10_000);
  const thou = Math.floor((n % 10_000) / 1_000);
  const hun = Math.floor((n % 1_000) / 100);
  const rest = n % 100;

  if (muen) {
    parts.push(muen === 1 ? "nèung-mèuun" : `${ONES_ROMAN[muen]}-mèuun`);
  }
  if (thou) {
    parts.push(thou === 1 ? "nèung-phan" : `${ONES_ROMAN[thou]}-phan`);
  }
  if (hun) {
    parts.push(hun === 1 ? "nèung-ráawy" : `${ONES_ROMAN[hun]}-ráawy`);
  }
  if (rest) {
    if (rest === 1 && parts.length) parts.push("èt");
    else parts.push(underHundredRoman(rest));
  }
  return parts.join("-");
}

function underHundredRoman(n: number): string {
  if (n < 10) return ONES_ROMAN[n]!;
  if (n === 10) return "sìp";
  if (n === 11) return "sìp-èt";
  if (n < 20) return `sìp-${ONES_ROMAN[n % 10]}`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensWord = tens === 2 ? "yîi-sìp" : `${ONES_ROMAN[tens]}-sìp`;
  if (!ones) return tensWord;
  if (ones === 1) return `${tensWord}-èt`;
  return `${tensWord}-${ONES_ROMAN[ones]}`;
}

export function numberEn(n: number): string {
  return n.toLocaleString("en-US");
}

export type PriceKind = "drinks" | "street" | "taxi" | "market";

export const PRICE_KINDS: { id: PriceKind; label: string; min: number; max: number }[] = [
  { id: "drinks", label: "Drinks", min: 20, max: 100 },
  { id: "street", label: "Street food", min: 40, max: 150 },
  { id: "taxi", label: "Taxi", min: 60, max: 300 },
  { id: "market", label: "Market", min: 100, max: 1_500 },
];

/** Realistic baht amounts (round to 5 under 100, else 10). */
export function randomPrice(kind: PriceKind): number {
  const row = PRICE_KINDS.find((k) => k.id === kind)!;
  const raw = row.min + Math.floor(Math.random() * (row.max - row.min + 1));
  const step = raw < 100 ? 5 : 10;
  return Math.max(row.min, Math.round(raw / step) * step);
}

export function priceSpoken(n: number, particle?: "ครับ" | "ค่ะ" | null): string {
  const base = `${numberToThai(n)}บาท`;
  return particle ? `${base}${particle}` : base;
}

export function priceRoman(n: number, particle?: "ครับ" | "ค่ะ" | null): string {
  const base = `${numberToRoman(n)}-bàat`;
  if (!particle) return base;
  return particle === "ครับ" ? `${base} khráp` : `${base} khâ`;
}

export function priceEn(n: number): string {
  return `${n} baht`;
}

/** Teach ladder: 0–10, 11, 20–21, tens, 100, 1000, 10000, sample compounds. */
export const TEACH_NUMBERS: number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 21, 30, 40, 50, 55, 100, 120, 101, 111, 200, 1_000, 1_250, 10_000,
];

export type NumberRangeKey = "0-10" | "11-99" | "100-999" | "1000+";

export function rangeKey(n: number): NumberRangeKey {
  if (n <= 10) return "0-10";
  if (n < 100) return "11-99";
  if (n < 1000) return "100-999";
  return "1000+";
}

export interface NumbersStats {
  bestHear: number;
  bestSay: number;
  bestDigits: number;
  ranges: Record<NumberRangeKey, { right: number; wrong: number }>;
}

export const EMPTY_NUMBERS: NumbersStats = {
  bestHear: 0,
  bestSay: 0,
  bestDigits: 0,
  ranges: {
    "0-10": { right: 0, wrong: 0 },
    "11-99": { right: 0, wrong: 0 },
    "100-999": { right: 0, wrong: 0 },
    "1000+": { right: 0, wrong: 0 },
  },
};

/** Prefer missed ranges when picking the next hear-drill price. */
export function pickHearPrice(stats: NumbersStats): { n: number; kind: PriceKind } {
  const kinds = [...PRICE_KINDS];
  const weak = kinds
    .map((k) => {
      const mid = Math.round((k.min + k.max) / 2);
      const key = rangeKey(mid);
      const r = stats.ranges[key] ?? { right: 0, wrong: 0 };
      const acc = (r.right + 1) / (r.right + r.wrong + 2);
      return { k, acc };
    })
    .sort((a, b) => a.acc - b.acc);
  // 60% of the time use the weakest band; otherwise random.
  const pick = Math.random() < 0.6 ? weak[0]!.k : kinds[Math.floor(Math.random() * kinds.length)]!;
  return { n: randomPrice(pick.id), kind: pick.id };
}

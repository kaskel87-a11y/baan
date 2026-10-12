import {
  numberToRoman,
  numberToThai,
  priceSpoken,
  THAI_DIGITS,
} from "../src/lib/numbers";

const cases: [number, string][] = [
  [0, "ศูนย์"],
  [1, "หนึ่ง"],
  [10, "สิบ"],
  [11, "สิบเอ็ด"],
  [20, "ยี่สิบ"],
  [21, "ยี่สิบเอ็ด"],
  [22, "ยี่สิบสอง"],
  [55, "ห้าสิบห้า"],
  [100, "หนึ่งร้อย"],
  [101, "หนึ่งร้อยเอ็ด"],
  [111, "หนึ่งร้อยสิบเอ็ด"],
  [120, "หนึ่งร้อยยี่สิบ"],
  [200, "สองร้อย"],
  [1_000, "หนึ่งพัน"],
  [1_250, "หนึ่งพันสองร้อยห้าสิบ"],
  [1_001, "หนึ่งพันเอ็ด"],
  [10_000, "หนึ่งหมื่น"],
];

let fail = 0;
for (const [n, want] of cases) {
  const got = numberToThai(n);
  const ok = got === want;
  if (!ok) {
    fail++;
    console.log(`✗ ${n} → ${got} (want ${want})`);
  } else {
    console.log(`✓ ${n} → ${got} · ${numberToRoman(n)}`);
  }
}

const p = priceSpoken(85, "ครับ");
if (p !== "แปดสิบห้าบาทครับ") {
  fail++;
  console.log(`✗ priceSpoken 85 → ${p}`);
} else console.log(`✓ priceSpoken 85 → ${p}`);

if (THAI_DIGITS.join("") !== "๐๑๒๓๔๕๖๗๘๙") {
  fail++;
  console.log("✗ Thai digits");
} else console.log("✓ Thai digits");

console.log(fail ? `${fail} failures` : "numbers OK");
process.exit(fail ? 1 : 0);

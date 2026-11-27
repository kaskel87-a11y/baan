import type { ShareCardContent } from "./share";

const W = 1200;
const H = 630;
const SCALE = 2;

const paper = "#f3f0ea";
const card = "#faf8f5";
const ink = "#1c1917";
const muted = "#78716c";
const line = "#e4dfd6";
const accent = "#1f6f64";
const sand = "#eadcc8";
const gold = "#e2b15a";
const leaf = "#6f9a72";

async function waitForFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load("700 96px \"Noto Serif Thai\""),
      document.fonts.load("600 64px \"Noto Serif Thai\""),
      document.fonts.load("500 32px \"Noto Sans Thai\""),
    ]);
    await document.fonts.ready;
  } catch {
    /* use fallbacks */
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 3): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1]!;
  let cut = last;
  while (cut && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1).trimEnd();
  kept[maxLines - 1] = `${cut}…`;
  return kept;
}

function fitLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number, min: number) {
  let size = start;
  ctx.font = `600 ${size}px "Noto Serif Thai", serif`;
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `600 ${size}px "Noto Serif Thai", serif`;
  }
  return size;
}

function drawHouse(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.roundRect(0, 0, 32, 32, 7);
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(16, 6.8);
  ctx.lineTo(6.2, 15.4);
  ctx.lineTo(9.4, 15.4);
  ctx.lineTo(9.4, 25.6);
  ctx.lineTo(22.6, 25.6);
  ctx.lineTo(22.6, 15.4);
  ctx.lineTo(25.8, 15.4);
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.restore();
}

function drawDecor(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = sand;
  ctx.fillRect(0, H - 88, W, 88);
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(1088, 92, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = leaf;
  ctx.fillRect(1048, 250, 14, 62);
  ctx.beginPath();
  ctx.arc(1055, 236, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1078, 250, 18, 0, Math.PI * 2);
  ctx.fill();
}

/** Paint a 1200×630 (2×) share card in Baan's flat style and return a PNG blob. */
export async function renderShareCard(content: ShareCardContent): Promise<Blob> {
  await waitForFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  drawDecor(ctx);
  drawHouse(ctx, 80, 72, 64);

  ctx.fillStyle = ink;
  ctx.font = '700 28px "Noto Sans Thai", sans-serif';
  ctx.fillText(content.kicker, 80, 172);

  ctx.fillStyle = ink;
  ctx.font = '700 72px "Noto Serif Thai", serif';
  const headlines = wrap(ctx, content.headline, 720, 2);
  let y = 250;
  const lineH = headlines.length > 1 ? 76 : 80;
  if (headlines.length > 1) {
    ctx.font = '700 58px "Noto Serif Thai", serif';
  }
  for (const line of headlines) {
    ctx.fillText(line, 80, y);
    y += lineH;
  }

  const boxX = 80;
  const boxY = Math.min(y + 8, 390);
  const boxW = 640;
  const boxH = 150;
  ctx.fillStyle = card;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.stroke();

  const thaiSize = fitLine(ctx, content.phrase.thai, boxW - 64, 56, 32);
  ctx.fillStyle = ink;
  ctx.font = `600 ${thaiSize}px "Noto Serif Thai", serif`;
  ctx.fillText(content.phrase.thai, boxX + 32, boxY + 70);
  ctx.fillStyle = accent;
  ctx.font = '500 26px "Noto Sans Thai", sans-serif';
  ctx.fillText(content.phrase.roman, boxX + 32, boxY + 112);

  ctx.fillStyle = muted;
  ctx.font = '500 22px "Noto Sans Thai", sans-serif';
  ctx.fillText(content.caption, 80, H - 40);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG failed"))), "image/png");
  });
}

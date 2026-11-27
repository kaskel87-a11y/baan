/**
 * Baan moved from kaskel87-a11y.github.io/baan/ to learnthaibaan.github.io/.
 * Browsers keep saved progress per site, so the old address is now a small page
 * that packs this browser's Baan keys into the link and sends you here:
 *
 *   https://learnthaibaan.github.io/#migrate=<z|j>.<base64url>&to=<route>
 *
 *   z. = deflate-raw compressed JSON, j. = plain JSON. Payload: { app: "baan", v: 1, at, ls: { key: value } }
 *
 * Imported only when this browser has no Baan progress here yet, so newer progress is never replaced.
 * Then the hash is cleaned and you land on the same screen you asked for (e.g. #/scene/cafe).
 */
import { STORE_KEY } from "./store";

const PREFIX = "#migrate=";
/** Keys never carried over. A push subscription belongs to the old site's service worker, which is gone. */
const SKIP = new Set(["baan.pushSub"]);
export const MIGRATED_KEY = "baan.migratedFrom";

export interface MigratePayload {
  app: "baan";
  v: 1;
  at?: string;
  from?: string;
  ls: Record<string, string>;
}

function b64urlToBytes(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function inflate(bytes: Uint8Array) {
  const ds = new DecompressionStream("deflate-raw");
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(ds);
  return new Response(stream).text();
}

export async function decodePayload(data: string): Promise<MigratePayload | null> {
  const kind = data.slice(0, 2);
  const bytes = b64urlToBytes(data.slice(2));
  const json = kind === "z." ? await inflate(bytes) : kind === "j." ? new TextDecoder().decode(bytes) : "";
  if (!json) return null;
  const p = JSON.parse(json) as MigratePayload;
  if (!p || p.app !== "baan" || !p.ls || typeof p.ls !== "object") return null;
  return p;
}

/** True when saved state holds real learning (finished scenes, review cards, or practice days). */
export function hasProgress(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const s = JSON.parse(raw) as { scenes?: Record<string, { completed?: boolean }>; srs?: Record<string, unknown>; history?: Record<string, unknown>; stories?: Record<string, unknown> };
    const scenes = Object.values(s.scenes ?? {}).some((r) => r && r.completed);
    const cards = Object.keys(s.srs ?? {}).length > 0;
    const days = Object.keys(s.history ?? {}).length > 0;
    const stories = Object.keys(s.stories ?? {}).length > 0;
    return scenes || cards || days || stories;
  } catch {
    return false;
  }
}

export type MigrateResult = "none" | "imported" | "kept-existing" | "bad";

/** Applies a decoded payload to this browser's storage. Never replaces existing progress. */
export function applyPayload(p: MigratePayload, storage: Storage = localStorage): MigrateResult {
  if (hasProgress(storage.getItem(STORE_KEY))) return "kept-existing";
  let wrote = false;
  for (const [k, v] of Object.entries(p.ls)) {
    if (!k.startsWith("baan.") || SKIP.has(k) || typeof v !== "string") continue;
    if (k === STORE_KEY) {
      storage.setItem(k, v);
      wrote = true;
    } else if (storage.getItem(k) === null) {
      storage.setItem(k, v);
    }
  }
  if (wrote) storage.setItem(MIGRATED_KEY, JSON.stringify({ from: p.from ?? "kaskel87-a11y.github.io/baan", at: p.at ?? "", on: new Date().toISOString() }));
  return wrote ? "imported" : "none";
}

/** Run once before the app renders. Always cleans the hash, even if the payload is unreadable. */
export async function migrateFromHash(): Promise<MigrateResult> {
  if (typeof window === "undefined" || !window.location.hash.startsWith(PREFIX)) return "none";
  const params = new URLSearchParams(window.location.hash.slice(1));
  const data = params.get("migrate") || "";
  const to = params.get("to") || "";
  const route = to.startsWith("/") ? `#${to}` : "";
  let result: MigrateResult = "bad";
  try {
    const p = await decodePayload(data);
    result = p ? applyPayload(p) : "bad";
  } catch {
    result = "bad";
  }
  history.replaceState(null, "", window.location.pathname + window.location.search + route);
  return result;
}

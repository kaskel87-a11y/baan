import { hoursFor, perDay, type PerDay } from "./pushPlan";

/** Public half of the VAPID pair. The private half is a GitHub Actions secret, not in the repo. */
export const VAPID_PUBLIC_KEY = "BFePepTw_F1xjZqq8isXIClHwLfS6cQRQy8dPJaBxTwBl0OUaPpWCON5c-0XZ3UAbK31jC80MRBXooOBw386ex0";

export const PUSH_SUB_KEY = "baan.pushSub";

export function isHomeScreen() {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const ios = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || ios;
}

export function urlBase64ToUint8Array(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export interface StoredPushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  schedule: PerDay;
}

export function readStoredSub(): StoredPushSub | null {
  try {
    const raw = localStorage.getItem(PUSH_SUB_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredPushSub;
    if (!v.endpoint || !v.keys?.p256dh || !v.keys?.auth) return null;
    return { ...v, schedule: perDay(v.schedule) };
  } catch {
    return null;
  }
}

export function writeStoredSub(sub: PushSubscription, schedule: PerDay) {
  const json = sub.toJSON();
  const record: StoredPushSub = {
    endpoint: sub.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
    schedule: perDay(schedule),
  };
  localStorage.setItem(PUSH_SUB_KEY, JSON.stringify(record));
  return record;
}

export function clearStoredSub() {
  localStorage.removeItem(PUSH_SUB_KEY);
}

export async function currentSubscription() {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function enablePush(schedule: PerDay) {
  const reg = await navigator.serviceWorker.ready;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false as const, reason: perm };
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  const record = writeStoredSub(sub, schedule);
  return { ok: true as const, record };
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (sub) await sub.unsubscribe();
  clearStoredSub();
}

export function rescheduleStored(schedule: PerDay) {
  const cur = readStoredSub();
  if (!cur) return null;
  const next = { ...cur, schedule: perDay(schedule) };
  localStorage.setItem(PUSH_SUB_KEY, JSON.stringify(next));
  return next;
}

export { hoursFor };

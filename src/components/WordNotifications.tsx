import { useEffect, useState } from "react";
import { setPushPerDay, useStore } from "../lib/store";
import { perDay, scheduleLine, type PerDay } from "../lib/pushPlan";
import { currentSubscription, disablePush, enablePush, isHomeScreen, readStoredSub, rescheduleStored } from "../lib/push";
import { Button } from "./ui";

/**
 * Lock-screen words. iOS only delivers Web Push to an installed Home Screen app,
 * so a normal browser tab gets the note and no toggle.
 */
export function WordNotifications() {
  const s = useStore();
  const installed = isHomeScreen();
  const chosen = perDay(s.pushPerDay);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!installed) return;
    let stop = false;
    currentSubscription().then((sub) => {
      if (!stop) setOn(!!sub);
    }).catch(() => {});
    return () => {
      stop = true;
    };
  }, [installed]);

  if (!installed) {
    return (
      <section className="grid gap-1">
        <h2 className="text-sm font-medium">Word notifications</h2>
        <p className="text-sm text-muted">Open Baan from your Home Screen icon to turn on notifications.</p>
      </section>
    );
  }

  async function toggle(next: boolean) {
    if (busy) return;
    setBusy(true);
    setNote("");
    try {
      if (!next) {
        await disablePush();
        setOn(false);
        return;
      }
      const result = await enablePush(chosen);
      if (!result.ok) {
        setOn(false);
        setNote(result.reason === "denied"
          ? "Notifications are blocked for Baan. Allow them in iPhone Settings, then try again."
          : "Notifications weren't allowed.");
        return;
      }
      setOn(true);
      setNote("On. " + scheduleLine(chosen));
    } catch {
      setOn(false);
      setNote("Couldn't turn notifications on from this phone.");
    } finally {
      setBusy(false);
    }
  }

  function pick(n: PerDay) {
    setPushPerDay(n);
    const saved = rescheduleStored(n);
    if (on && saved) setNote("On. " + scheduleLine(n) + " Copy the subscription again so the sender uses this.");
  }

  async function copySub() {
    const record = readStoredSub();
    if (!record) {
      setNote("Turn notifications on first.");
      return;
    }
    const text = JSON.stringify(record);
    try {
      await navigator.clipboard.writeText(text);
      setNote("Subscription copied. Save it as the PUSH_SUBS secret so the daily words can be sent.");
    } catch {
      setNote(text);
    }
  }

  return (
    <section className="grid gap-2">
      <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-card px-3">
        <span className="text-sm font-medium">Word notifications</span>
        <input
          type="checkbox"
          role="switch"
          checked={on}
          disabled={busy}
          onChange={(e) => void toggle(e.target.checked)}
          className="size-5 accent-accent"
        />
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">How many a day</legend>
        <div className="flex flex-wrap gap-2">
          {([1, 3, 5] as const).map((n) => (
            <Button key={n} variant={chosen === n ? "primary" : "quiet"} onClick={() => pick(n)}>
              {n}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted">{scheduleLine(chosen)} Thai word, pronunciation, and English on the lock screen.</p>
      </fieldset>
      {on ? (
        <Button className="justify-self-start" onClick={() => void copySub()}>Copy subscription</Button>
      ) : null}
      {note ? <p className="text-sm text-muted break-all">{note}</p> : null}
    </section>
  );
}

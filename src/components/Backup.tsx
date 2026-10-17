import { useRef, useState } from "react";
import { exportProgress, parseBackup, restoreProgress, backupSummary, useStore, type BaanState, type BackupSummary } from "../lib/store";
import { Button } from "./ui";

function describe(b: BackupSummary) {
  const parts = [
    `${b.scenes} scene${b.scenes === 1 ? "" : "s"} done`,
    `${b.cards} review card${b.cards === 1 ? "" : "s"}`,
    `${b.learned} learned`,
    `${b.streak}-day streak`,
  ];
  return (b.name ? `${b.name}: ` : "") + parts.join(", ");
}

/** Copy, share, or save a backup code, and restore one in another browser or phone. */
export function Backup({ restoreOnly = false }: { restoreOnly?: boolean }) {
  const s = useStore();
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [paste, setPaste] = useState("");
  const [pending, setPending] = useState<{ state: BaanState; summary: BackupSummary; at?: string } | null>(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    const c = exportProgress();
    setCode(c);
    try {
      await navigator.clipboard.writeText(c);
      setMsg("Backup code copied. Paste it into Baan in the other browser (Settings, Restore from a backup).");
    } catch {
      setMsg("Couldn't copy automatically. Select the code below and copy it.");
    }
  };
  const share = async () => {
    const c = exportProgress();
    try {
      await navigator.share({ title: "Baan backup", text: c });
      setMsg("Shared. Open it in the other browser and paste it into Restore from a backup.");
    } catch {
      /* cancelled */
    }
  };
  const save = () => {
    const blob = new Blob([exportProgress()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `baan-backup-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setMsg("Backup file saved to Downloads (or Files on iPhone).");
  };
  const check = (text: string) => {
    setDone("");
    const r = parseBackup(text);
    if ("error" in r) {
      setErr(r.error);
      setPending(null);
    } else {
      setErr("");
      setPending(r);
    }
  };

  return (
    <section className="grid gap-3 rounded-2xl border border-line bg-card p-4" aria-label="Move your progress">
      {!restoreOnly && (
        <>
      <div className="grid gap-1">
        <h2 className="font-display text-xl">Move your progress</h2>
        <p className="text-sm text-muted">
          Progress is saved in this browser only, so Chrome and Safari keep separate copies. Make a backup code here, then restore
          it in the other browser or on another phone. On this device now: {describe(backupSummary(s))}.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={copy}>Copy backup code</Button>
        {canShare && <Button onClick={share}>Share backup</Button>}
        <Button onClick={save}>Save backup file</Button>
      </div>
      {msg && <p className="text-sm" role="status">{msg}</p>}
      {code && (
        <textarea
          readOnly
          value={code}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Your backup code"
          className="h-20 w-full rounded-xl border border-line bg-paper p-2 font-mono text-xs break-all"
        />
      )}

        </>
      )}
      <div className={`grid gap-2 ${restoreOnly ? "" : "border-t border-line pt-3"}`}>
        <h3 className="text-sm font-medium">Restore from a backup</h3>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="Paste a backup code (starts with BAAN1:)"
          aria-label="Paste a backup code"
          className="h-20 w-full rounded-xl border border-line bg-paper p-2 font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => check(paste)} disabled={!paste.trim()}>Check backup</Button>
          <Button onClick={() => file.current?.click()}>Open a backup file</Button>
          <input
            ref={file}
            type="file"
            accept=".txt,.json,text/plain,application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) check(await f.text());
              e.target.value = "";
            }}
          />
        </div>
        {err && <p className="text-sm text-miss" role="alert">{err}</p>}
        {pending && (
          <div className="grid gap-2 rounded-xl border border-line p-3">
            <p className="text-sm">
              This backup has {describe(pending.summary)}
              {pending.at ? `, made ${new Date(pending.at).toLocaleString()}` : ""}.
            </p>
            <p className="text-sm text-muted">Restoring replaces the progress in this browser. Make a backup here first if you want to keep it.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  restoreProgress(pending.state);
                  setPending(null);
                  setPaste("");
                  setDone("Restored. Your words, scores, and streak are back.");
                }}
              >
                Replace progress here
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
            </div>
          </div>
        )}
        {done && <p className="text-sm" role="status">{done}</p>}
      </div>
    </section>
  );
}

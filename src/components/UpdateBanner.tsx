import { useEffect, useState } from "react";

/** Shown when a freshly fetched index.html points at a different bundle than this tab. */
export function UpdateBanner() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let stop = false;
    async function check() {
      try {
        const res = await fetch(`./index.html?fresh=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const html = await res.text();
        const next = html.match(/assets\/index-[^"']+\.js/)?.[0];
        const current = [...document.querySelectorAll("script")].map((s) => s.src).find((s) => s.includes("/assets/index-"));
        if (next && current && !current.endsWith(next) && !stop) setReady(true);
      } catch {
        /* offline, or the page is still the one being served */
      }
    }
    check();
    const id = window.setInterval(check, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  if (!ready) return null;
  return (
    <button
      type="button"
      className="fixed inset-x-3 bottom-24 z-20 rounded-2xl bg-ink px-4 py-3 text-left text-base font-medium text-paper md:bottom-6"
      onClick={() => window.location.reload()}
    >
      A new Baan is ready. Tap to load it.
    </button>
  );
}

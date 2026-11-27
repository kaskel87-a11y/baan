import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "@fontsource/noto-serif-thai/500.css";
import "@fontsource/noto-serif-thai/600.css";
import "@fontsource/noto-serif-thai/700.css";
import "./index.css";
import App from "./App";
import { migrateFromHash } from "./lib/migrate";

function listenForAppUpdate() {
  if (!("serviceWorker" in navigator)) return;
  const had = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!had || reloading) return;
    reloading = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((reg) => {
        const ask = () => {
          reg.update().catch(() => {});
          if (reg.waiting && navigator.serviceWorker.controller) reg.waiting.postMessage("SKIP_WAITING");
        };
        ask();
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") ask();
        });
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          next?.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) next.postMessage("SKIP_WAITING");
          });
        });
      })
      .catch(() => {});
  });
}
listenForAppUpdate();

// Progress carried over from the old address (kaskel87-a11y.github.io/baan/) lands before the store loads.
migrateFromHash()
  .catch(() => "bad")
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });

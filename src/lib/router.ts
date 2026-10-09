import { useEffect, useState } from "react";

/** Hash routes so the static build works on any host: #/path, #/scene/cafe, #/tones, #/letters, #/review, #/settings */
export type Route =
  | { name: "path" }
  | { name: "scene"; id: string }
  | { name: "tones" }
  | { name: "letters" }
  | { name: "review" }
  | { name: "settings" };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  switch (parts[0]) {
    case "scene":
      return parts[1] ? { name: "scene", id: decodeURIComponent(parts[1]) } : { name: "path" };
    case "tones":
    case "letters":
    case "review":
    case "settings":
      return { name: parts[0] };
    default:
      return { name: "path" };
  }
}

export function href(r: Route) {
  return r.name === "scene" ? `#/scene/${encodeURIComponent(r.id)}` : `#/${r.name}`;
}

export function navigate(r: Route) {
  const h = href(r);
  if (window.location.hash !== h) window.location.hash = h;
  window.scrollTo(0, 0);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

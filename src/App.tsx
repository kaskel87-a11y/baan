import { AudioLines, BookOpen, Languages, RotateCcw, Settings as SettingsIcon, type LucideIcon } from "lucide-react";
import { useStore } from "./lib/store";
import { navigate, useRoute, type Route } from "./lib/router";
import { Onboarding } from "./screens/Onboarding";
import { Path } from "./screens/Path";
import { SceneScreen } from "./screens/Scene";
import { Tones } from "./screens/Tones";
import { Letters } from "./screens/Letters";
import { Review } from "./screens/Review";
import { Settings } from "./screens/Settings";

type Tab = "path" | "tones" | "letters" | "review";
const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "path", label: "Path", icon: BookOpen },
  { id: "tones", label: "Tones", icon: AudioLines },
  { id: "letters", label: "Letters", icon: Languages },
  { id: "review", label: "Review", icon: RotateCcw },
];

export default function App() {
  const s = useStore();
  const route = useRoute();
  if (!s.voice) return <Onboarding />;
  const active: Route["name"] = route.name === "scene" ? "path" : route.name;
  const go = (id: Tab | "settings") => navigate({ name: id } as Route);

  return (
    <div className="app-shell">
      <aside className="hidden border-r border-line md:flex md:flex-col md:gap-6 md:p-5 md:sticky md:top-0 md:h-dvh">
        <div>
          <p className="thai text-3xl" lang="th">บ้าน</p>
          <p className="text-sm text-muted">Baan</p>
        </div>
        <nav className="grid gap-1" aria-label="Main">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#/${t.id}`}
              aria-current={active === t.id ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium ${active === t.id ? "bg-card text-ink" : "text-muted"}`}
            >
              <t.icon aria-hidden="true" size={18} />
              {t.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto grid gap-2">
          <p className="text-sm text-muted">
            Your particle · <span lang="th">{s.voice === "male" ? "ครับ" : "ค่ะ"}</span>
          </p>
          <a href="#/settings" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium">
            <SettingsIcon aria-hidden="true" size={18} />
            Settings
          </a>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-line px-4 md:hidden">
          <p className="thai text-xl" lang="th">
            บ้าน <span className="font-sans text-sm text-muted">Baan</span>
          </p>
          <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center" aria-label="Settings" onClick={() => go("settings")}>
            <SettingsIcon aria-hidden="true" size={20} />
          </button>
        </header>
        <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-10">
          {route.name === "path" ? <Path /> : null}
          {route.name === "scene" ? <SceneScreen key={route.id} id={route.id} /> : null}
          {route.name === "tones" ? <Tones /> : null}
          {route.name === "letters" ? <Letters /> : null}
          {route.name === "review" ? <Review /> : null}
          {route.name === "settings" ? <Settings /> : null}
        </main>
        <nav className="dock fixed inset-x-0 bottom-0 z-10 border-t border-line bg-paper md:hidden" aria-label="Main">
          <ul className="grid grid-cols-4">
            {TABS.map((t) => (
              <li key={t.id}>
                <a
                  href={`#/${t.id}`}
                  aria-current={active === t.id ? "page" : undefined}
                  className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 text-xs ${active === t.id ? "text-accent" : "text-muted"}`}
                >
                  <t.icon aria-hidden="true" size={18} />
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

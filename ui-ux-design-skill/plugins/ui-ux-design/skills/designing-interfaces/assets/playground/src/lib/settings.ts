import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Density = "compact" | "default" | "comfortable";
export type Radius = "sharp" | "default" | "round";

export interface Settings {
  theme: Theme;
  density: Density;
  radius: Radius;
  hue: number;
  reducedMotion: boolean;
}

const KEY = "playground-settings";
const DEFAULTS: Settings = { theme: "system", density: "default", radius: "default", hue: 255, reducedMotion: false };

function read(): Settings {
  const fromUrl = new URLSearchParams(location.search);
  let saved: Partial<Settings> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    /* ignore corrupted storage */
  }
  const s = { ...DEFAULTS, ...saved };
  // URL params win (used by the responsive preview iframes)
  if (fromUrl.get("theme")) s.theme = fromUrl.get("theme") as Theme;
  if (fromUrl.get("density")) s.density = fromUrl.get("density") as Density;
  if (fromUrl.get("radius")) s.radius = fromUrl.get("radius") as Radius;
  if (fromUrl.get("hue")) s.hue = Number(fromUrl.get("hue"));
  if (fromUrl.get("motion") === "reduced") s.reducedMotion = true;
  return s;
}

export function apply(s: Settings) {
  const root = document.documentElement;
  const dark = s.theme === "dark" || (s.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.dataset.density = s.density;
  root.dataset.radius = s.radius;
  root.dataset.motion = s.reducedMotion ? "reduced" : "full";
  root.style.setProperty("--brand-h", String(s.hue));
}

export function toQuery(s: Settings) {
  const dark = s.theme === "dark" || (s.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  return new URLSearchParams({
    theme: dark ? "dark" : "light",
    density: s.density,
    radius: s.radius,
    hue: String(s.hue),
    motion: s.reducedMotion ? "reduced" : "full",
  }).toString();
}

export function useSettings(persist = true) {
  const [settings, setSettings] = useState<Settings>(read);

  useEffect(() => {
    apply(settings);
    if (persist) localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings, persist]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  return [settings, update] as const;
}

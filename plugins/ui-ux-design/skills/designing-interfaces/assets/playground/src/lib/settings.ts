import { useEffect, useState } from "react";
import { PRESETS, presetFonts } from "@/lib/presets";

export type Theme = "light" | "dark" | "system";
export type Density = "compact" | "default" | "comfortable";
export type Radius = "sharp" | "default" | "round";
export type Borders = "none" | "default" | "bold";
export type Shadow = "none" | "subtle" | "default" | "strong";
export type Spacing = "tight" | "default" | "loose";
export type TextSize = "small" | "default" | "large";

export interface Settings {
  theme: Theme;
  density: Density;
  radius: Radius;
  hue: number;
  reducedMotion: boolean;
  borders: Borders;
  shadow: Shadow;
  font: string; // Google Fonts family name, "" = the style's own font
  spacing: Spacing;
  textSize: TextSize;
  preset: string; // "base" or a file name in src/styles/presets
  colors: Record<string, { light?: string; dark?: string }>; // per-token hex overrides, keyed by token name without "--"
}

// Values the toolbar choices write into CSS variables (also what Save writes to the tokens file).
const RADIUS = { sharp: "0.125rem", default: "0.5rem", round: "0.875rem" };
const DENSITY = {
  compact: ["1.75rem", "2rem", "2.5rem", "2rem"],
  default: ["2rem", "2.5rem", "3rem", "2.5rem"],
  comfortable: ["2.5rem", "3rem", "3.5rem", "3rem"],
};
const BORDER_W = { none: "0px", default: "1px", bold: "2px" };
const SHADOW_SCALE = { none: "0", subtle: "0.5", default: "1", strong: "1.6" };
const SPACING = { tight: "0.2rem", default: "0.25rem", loose: "0.3rem" };
const TEXT_SIZE = { small: "87.5%", default: "100%", large: "112.5%" };

/** CSS variables for the controls the user changed. A control left on "default" adds nothing, so the active style preset shows through. */
export function toVars(s: Settings): Record<string, string> {
  const v: Record<string, string> = {};
  if (s.hue !== DEFAULTS.hue) v["--brand-h"] = String(s.hue);
  if (s.radius !== "default") v["--radius"] = RADIUS[s.radius];
  if (s.density !== "default") {
    const [sm, md, lg, row] = DENSITY[s.density];
    Object.assign(v, { "--control-h-sm": sm, "--control-h-md": md, "--control-h-lg": lg, "--row-h": row });
  }
  if (s.borders !== "default") v["--border-w"] = BORDER_W[s.borders];
  if (s.shadow !== "default") v["--shadow-scale"] = SHADOW_SCALE[s.shadow];
  if (s.font) v["--font-sans"] = `"${s.font}", ui-sans-serif, system-ui, sans-serif`;
  if (s.spacing !== "default") v["--spacing"] = SPACING[s.spacing];
  if (s.textSize !== "default") v["--text-size"] = TEXT_SIZE[s.textSize];
  return v;
}
const GOOGLE_FONT = /^[A-Za-z0-9 ]{1,40}$/;
const fontHref = (family: string) => `https://fonts.googleapis.com/css2?family=${family.trim().replace(/ +/g, "+")}:wght@400..700&display=swap`;

/** Google Fonts stylesheets this look needs (the preset's own font and a font picked in the Type group). */
export function fontLinks(s: Settings) {
  return [presetFonts(s.preset), GOOGLE_FONT.test(s.font) ? fontHref(s.font) : undefined].filter((h): h is string => !!h);
}

export const isDark = (s: Settings) => s.theme === "dark" || (s.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);

/** One stylesheet for the whole look: preset, changed controls, per-token colors. Used by the page, the app preview and (rebuilt server-side) Save. */
export function buildCss(s: Settings) {
  const vars = Object.entries(toVars(s)).map(([k, v]) => `  ${k}: ${v};`);
  const colors = (m: "light" | "dark") => Object.entries(s.colors).filter(([, c]) => c[m]).map(([k, c]) => `  --${k}: ${c[m]};`);
  return `${PRESETS[s.preset] ?? ""}\n:root {\n${[...vars, ...colors("light")].join("\n")}\n}\n.dark {\n${colors("dark").join("\n")}\n}\n`;
}

const readEdits = () => { try { return JSON.parse(localStorage.getItem("playground-edits") || "{}"); } catch { return {}; } };
const readDashboard = () => { try { return JSON.parse(localStorage.getItem("playground-dashboard") || "null"); } catch { return null; } };

export async function save(s: Settings) {
  const res = await fetch("/__save-tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preset: s.preset, vars: toVars(s), colors: s.colors, dashboard: readDashboard(), edits: readEdits() }) });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { file: string; files: string[] };
}

const KEY = "playground-settings";
const DEFAULTS: Settings = { theme: "system", density: "default", radius: "default", hue: 255, reducedMotion: false, borders: "default", shadow: "default", font: "system", spacing: "default", textSize: "default", preset: "base", colors: {} };

function read(): Settings {
  const fromUrl = new URLSearchParams(location.search);
  let saved: Partial<Settings> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    /* ignore corrupted storage */
  }
  const s = { ...DEFAULTS, ...saved };
  if (["system", "serif", "mono"].includes(s.font)) s.font = ""; // older saved settings
  // URL params win (used by the responsive preview iframes)
  if (fromUrl.get("theme")) s.theme = fromUrl.get("theme") as Theme;
  if (fromUrl.get("density")) s.density = fromUrl.get("density") as Density;
  if (fromUrl.get("radius")) s.radius = fromUrl.get("radius") as Radius;
  if (fromUrl.get("hue")) s.hue = Number(fromUrl.get("hue"));
  if (fromUrl.get("motion") === "reduced") s.reducedMotion = true;
  return s;
}

function headEl(id: string, make: () => HTMLElement) {
  return document.getElementById(id) ?? document.head.appendChild(Object.assign(make(), { id }));
}

export function apply(s: Settings) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark(s));
  root.dataset.density = s.density;
  root.dataset.radius = s.radius;
  root.dataset.motion = s.reducedMotion ? "reduced" : "full";
  root.dataset.preset = s.preset;
  // Appended last in <head> so it wins the cascade over tokens.css.
  const style = headEl("playground-live", () => document.createElement("style"));
  document.head.appendChild(style);
  const css = buildCss(s);
  if (style.textContent !== css) style.textContent = css;
  fontLinks(s).forEach((href, i) => {
    const link = headEl(`playground-font-${i}`, () => Object.assign(document.createElement("link"), { rel: "stylesheet" })) as HTMLLinkElement;
    if (link.href !== href) link.href = href;
  });
}

export function toQuery(s: Settings) {
  return new URLSearchParams({
    theme: isDark(s) ? "dark" : "light",
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

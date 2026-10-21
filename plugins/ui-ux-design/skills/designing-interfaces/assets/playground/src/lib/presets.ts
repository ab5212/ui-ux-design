// Style presets are copied into src/styles/presets by scaffold-playground.sh (from the skill's assets/styles).
const files = import.meta.glob("../styles/presets/*.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const PRESETS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, css]) => [path.split("/").pop()!.replace(".css", ""), css]),
);

export const PRESET_LABELS: Record<string, string> = {
  flat: "Flat", material: "Material", soft: "Soft and friendly", glass: "Glass", clay: "Clay", skeuomorphic: "Skeuomorphic",
  brutalist: "Bold and raw", editorial: "Editorial", monochrome: "Monochromatic", colorblock: "Color blocking",
  retro: "Retro / vintage", minimalvintage: "Minimal vintage", retrofuturistic: "Retro-futuristic", artdeco: "Art Deco",
};

/** Google Fonts stylesheet named on the preset's "google-fonts:" header line, if any. */
export const presetFonts = (name: string) => /google-fonts:\s*(\S+)/.exec(PRESETS[name] ?? "")?.[1];

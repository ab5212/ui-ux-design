#!/usr/bin/env node
/**
 * check-contrast.mjs — audit semantic color pairs in a token CSS file.
 *
 * Usage:  node check-contrast.mjs tokens.css [style-overlay.css ...] [--json]
 *
 * Reads :root and .dark blocks, resolves var(--x) references, supports
 * oklch(), #hex, rgb() and hsl() values, and checks every pair below against
 * WCAG 2.2 (pass/fail) and APCA Lc (advisory). Exit code 1 if any pair fails.
 * No dependencies.
 */
import { readFileSync } from "node:fs";

const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const asJson = process.argv.includes("--json");
if (!files.length) {
  console.error("Usage: node check-contrast.mjs tokens.css [style-overlay.css ...] [--json]");
  process.exit(2);
}

// [foreground, background, minimum WCAG ratio, label]
const PAIRS = [
  ["foreground", "background", 4.5, "body text"],
  ["foreground", "surface", 4.5, "text on card"],
  ["muted-foreground", "background", 4.5, "secondary text"],
  ["muted-foreground", "muted", 4.5, "secondary text on muted"],
  ["muted-foreground", "surface", 4.5, "secondary text on card"],
  ["primary-foreground", "primary", 4.5, "primary button"],
  ["secondary-foreground", "secondary", 4.5, "secondary button"],
  ["accent-foreground", "accent", 4.5, "selected/hover item"],
  ["destructive-foreground", "destructive", 4.5, "destructive button"],
  ["success-foreground", "success", 4.5, "success fill"],
  ["warning-foreground", "warning", 4.5, "warning fill"],
  ["info-foreground", "info", 4.5, "info fill"],
  ["primary", "background", 3, "primary as link/icon (large)"],
  ["input", "background", 3, "input boundary (SC 1.4.11)"],
  ["input", "surface", 3, "input boundary on card"],
  ["ring", "background", 3, "focus ring (SC 1.4.11)"],
];

// ---------- CSS parsing ----------
// Accepts one or more files. Later files override earlier ones exactly as the cascade would
// (:root and .dark have equal specificity, so source order decides). Example:
//   node check-contrast.mjs tokens.css styles/glass.css
const light = {};
const dark = {};
let hasDark = false;

function topLevelBlocks(css) {
  const out = [];
  const re = /(^|\n)\s*(:root|\.dark)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    const before = css.slice(0, m.index);
    const depth = (before.match(/\{/g) || []).length - (before.match(/\}/g) || []).length;
    if (depth !== 0) continue; // skip :root nested in @media etc.
    const start = css.indexOf("{", m.index) + 1;
    let d = 1, i = start;
    while (d && i < css.length) {
      if (css[i] === "{") d++;
      else if (css[i] === "}") d--;
      i++;
    }
    const vars = {};
    for (const decl of css.slice(start, i - 1).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[decl[1]] = decl[2].trim();
    out.push({ sel: m[2], vars, at: m.index });
  }
  return out.sort((x, y) => x.at - y.at);
}

for (const f of files) {
  const css = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const { sel, vars } of topLevelBlocks(css)) {
    if (sel === ":root") { Object.assign(light, vars); Object.assign(dark, vars); }
    else { Object.assign(dark, vars); hasDark = true; }
  }
}
const themes = { light };
if (hasDark) themes.dark = dark;

function resolve(value, vars, depth = 0) {
  if (depth > 10) return value;
  return value.replace(/var\(--([\w-]+)(?:\s*,\s*([^)]+))?\)/g, (_, name, fallback) =>
    vars[name] !== undefined ? resolve(vars[name], vars, depth + 1) : fallback ?? "0"
  );
}

// ---------- color conversion → linear sRGB [r,g,b], alpha ----------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const num = (s, pct = 1) => (s.trim().endsWith("%") ? parseFloat(s) / 100 * pct : parseFloat(s));

function parseColor(str) {
  str = str.trim().toLowerCase();
  let m;
  if ((m = str.match(/^#([0-9a-f]{3,8})$/))) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { rgb: v.map(toLinear), a };
  }
  if ((m = str.match(/^oklch\(([^)]+)\)$/))) {
    const [main, alpha] = m[1].split("/");
    const [L, C, H] = main.trim().split(/\s+/).map((p, i) => num(p, i === 0 ? 1 : 0.4));
    const hr = (H * Math.PI) / 180;
    const a = C * Math.cos(hr), b = C * Math.sin(hr);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
    ].map(clamp01);
    return { rgb, a: alpha ? num(alpha) : 1 };
  }
  if ((m = str.match(/^rgba?\(([^)]+)\)$/))) {
    const parts = m[1].replace(/\//g, " ").replace(/,/g, " ").trim().split(/\s+/);
    const v = parts.slice(0, 3).map((p) => toLinear(num(p, 255) / 255));
    return { rgb: v, a: parts[3] ? num(parts[3]) : 1 };
  }
  if ((m = str.match(/^hsla?\(([^)]+)\)$/))) {
    const parts = m[1].replace(/\//g, " ").replace(/,/g, " ").trim().split(/\s+/);
    const h = parseFloat(parts[0]) / 360, s = num(parts[1]), l = num(parts[2]);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const hue = (t) => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return { rgb: [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)].map(toLinear), a: parts[3] ? num(parts[3]) : 1 };
  }
  return null;
}

function composite(fg, bg) {
  if (fg.a >= 1) return fg.rgb;
  // composite in gamma space (how browsers blend)
  return fg.rgb.map((c, i) => toLinear(toGamma(c) * fg.a + toGamma(bg.rgb[i]) * (1 - fg.a)));
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const wcag = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// APCA-W3 0.0.98G-4g (advisory; APCA is a draft for WCAG 3)
function apca(txt, bg) {
  const Y = (rgb) => {
    const [r, g, b] = rgb.map(toGamma);
    return 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  };
  const clampY = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const t = clampY(Y(txt)), b = clampY(Y(bg));
  if (Math.abs(b - t) < 0.0005) return 0;
  let out;
  if (b > t) {
    const s = (b ** 0.56 - t ** 0.57) * 1.14;
    out = s < 0.1 ? 0 : s - 0.027;
  } else {
    const s = (b ** 0.65 - t ** 0.62) * 1.14;
    out = s > -0.1 ? 0 : s + 0.027;
  }
  return out * 100;
}

// ---------- run ----------
const results = [];
let failures = 0;
for (const [theme, vars] of Object.entries(themes)) {
  for (const [f, b, min, label] of PAIRS) {
    if (vars[f] === undefined || vars[b] === undefined) continue;
    const fg = parseColor(resolve(vars[f], vars));
    const bg = parseColor(resolve(vars[b], vars));
    if (!fg || !bg) {
      results.push({ theme, pair: `${f} on ${b}`, label, error: "unparsed color" });
      continue;
    }
    const base = parseColor(resolve(vars.background ?? "#fff", vars)) ?? { rgb: [1, 1, 1], a: 1 };
    const bgRgb = composite(bg, base);
    const fgRgb = composite(fg, { rgb: bgRgb, a: 1 });
    const ratio = wcag(fgRgb, bgRgb);
    const lc = apca(fgRgb, bgRgb);
    const pass = ratio >= min;
    if (!pass) failures++;
    results.push({ theme, pair: `--${f} on --${b}`, label, ratio: +ratio.toFixed(2), min, apca: +lc.toFixed(1), pass });
  }
}

if (!results.some((r) => !r.error)) {
  console.error("No semantic color pairs found. Expected --background, --foreground, --primary, etc. defined in :root / .dark.");
  process.exit(2);
}

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const theme of Object.keys(themes)) {
    console.log(`\n${theme.toUpperCase()}`);
    for (const r of results.filter((x) => x.theme === theme)) {
      if (r.error) { console.log(`  ?  ${r.pair.padEnd(42)} ${r.error}`); continue; }
      const mark = r.pass ? "ok  " : "FAIL";
      console.log(
        `  ${mark} ${r.pair.padEnd(42)} ${String(r.ratio).padStart(5)}:1 (min ${r.min})  APCA Lc ${String(Math.abs(r.apca)).padStart(5)}  ${r.label}`
      );
    }
  }
  console.log(failures ? `\n${failures} pair(s) below WCAG 2.2 AA.` : "\nAll pairs meet WCAG 2.2 AA.");
  console.log("APCA Lc is advisory: aim for 75+ on body text, 60+ on large text, 45+ on UI boundaries.");
}
process.exit(failures ? 1 : 0);

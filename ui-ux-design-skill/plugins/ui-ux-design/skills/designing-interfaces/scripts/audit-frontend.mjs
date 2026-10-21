#!/usr/bin/env node
/**
 * audit-frontend.mjs: heuristic front-end audit for any stack. No dependencies.
 *
 * Usage:  node audit-frontend.mjs [dir] [--json] [--max=5]
 *
 * Scans HTML, CSS/Sass/Less, JS/TS/JSX/TSX, Vue, Svelte, Astro, Angular templates and common
 * server templates (PHP, ERB, Handlebars, Nunjucks, Twig, Liquid, MDX). Skips node_modules,
 * build output, minified and very large files.
 *
 * This is a pattern scanner, not a linter with a parser: it finds places worth reading.
 * Expect some false positives ("verify" findings). Read the code before you change it.
 * Exit code is always 0 (an audit informs; it is not a gate).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const maxPer = Number((args.find((a) => a.startsWith("--max=")) || "--max=5").split("=")[1]);
const root = resolve(args.find((a) => !a.startsWith("--")) || ".");

const EXT = new Set([".html", ".htm", ".css", ".scss", ".sass", ".less", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".vue", ".svelte", ".astro", ".php", ".erb", ".hbs", ".njk", ".twig", ".liquid", ".mdx", ".ejs", ".cshtml"]);
const MARKUP = new Set([".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro", ".php", ".erb", ".hbs", ".njk", ".twig", ".liquid", ".mdx", ".ejs", ".cshtml", ".js", ".ts"]);
const PAGES = new Set([".html", ".htm", ".php", ".erb", ".hbs", ".njk", ".twig", ".liquid", ".ejs", ".cshtml"]);
const JSXLIKE = new Set([".jsx", ".tsx", ".js", ".ts", ".mjs", ".vue", ".svelte", ".astro", ".mdx"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".next", ".nuxt", ".svelte-kit", ".git", "vendor", "coverage", ".turbo", "out", ".output", ".cache", ".angular", ".parcel-cache", "storybook-static"]);

// ---------- helpers ----------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(extname(name).toLowerCase()) && !/\.min\./.test(name) && st.size < 500_000) out.push(p);
  }
  return out;
}
const lineStarts = (text) => { const a = [0]; for (let i = 0; i < text.length; i++) if (text[i] === "\n") a.push(i + 1); return a; };
const lineOf = (starts, idx) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; } return lo + 1; };

/** Returns the full opening tag starting at `start` (respects quotes and {braces}). */
function tagAt(text, start) {
  let q = null, brace = 0;
  for (let i = start; i < Math.min(text.length, start + 4000); i++) {
    const c = text[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === "{") brace++;
    else if (c === "}") brace = Math.max(0, brace - 1);
    else if (c === ">" && brace === 0) return text.slice(start, i + 1);
  }
  return text.slice(start, start + 200);
}
function* tags(text, nameRe, ci = true) {
  const re = new RegExp(`<(${nameRe})(?=[\\s>/])`, ci ? "gi" : "g");
  let m;
  while ((m = re.exec(text))) yield { index: m.index, name: m[1].toLowerCase(), tag: tagAt(text, m.index) };
}
function* matches(re, text) { let m; while ((m = re.exec(text))) { yield m; if (m[0].length === 0) re.lastIndex++; } }

// ---------- rules ----------
// group: a11y | responsive | tokens | motion | polish
const RULES = [
  { id: "A11Y-ZOOM", sev: "blocker", group: "a11y", title: "Page zoom is disabled",
    why: "Blocks pinch-zoom and text scaling (WCAG 1.4.4).", fix: "Remove user-scalable=no and maximum-scale from the viewport meta tag.", ref: "accessibility.md",
    run: (t, ext) => [...matches(/user-scalable\s*=\s*(?:no|0)|maximum-scale\s*=\s*1(?:\.0)?(?![\d.])/gi, t)].map((m) => ({ index: m.index })) },
  { id: "A11Y-IMG-ALT", sev: "blocker", group: "a11y", title: "Image without alt text", exts: MARKUP,
    why: "Screen readers get no name for the image (WCAG 1.1.1).", fix: 'Add meaningful alt text, or alt="" if the image is decorative.', ref: "accessibility.md",
    run: (t, ext) => [...tags(t, "img", !JSXLIKE.has(ext))].filter((x) => !/\balt\s*=|\{\s*\.\.\./i.test(x.tag)).map((x) => ({ index: x.index })) },
  { id: "A11Y-FOCUS", sev: "major", group: "a11y", title: "Focus outline removed (verify a replacement exists)",
    why: "Keyboard users lose track of focus (WCAG 2.4.7) unless a visible :focus-visible style replaces it.", fix: "Use :focus-visible with a 2px ring at 3:1 contrast instead of removing the outline.", ref: "accessibility.md",
    run: (t) => [...matches(/outline\s*:\s*(?:none|0)\b|(?<![\w-])(?:focus:|focus-visible:)?outline-none\b/g, t)].filter((m) => {
      const ls = t.lastIndexOf("\n", t.lastIndexOf("\n", m.index) - 1) + 1, le0 = t.indexOf("\n", m.index), le = le0 === -1 ? -1 : t.indexOf("\n", le0 + 1), line = t.slice(ls, le === -1 ? undefined : le);
      return !/(?:focus-visible|focus):(?:after:|before:)?(?:outline-(?!none)|ring|shadow|border)|data-\[(?:highlighted|focus)/.test(line);
    }).map((m) => ({ index: m.index })) },
  { id: "A11Y-CLICK-DIV", sev: "major", group: "a11y", title: "Click handler on a non-interactive element", exts: MARKUP,
    why: "Not reachable or operable by keyboard; no role or name for assistive tech.", fix: "Use <button> (action) or <a href> (navigation).", ref: "components-actions.md",
    run: (t, ext) => [...tags(t, "div|span|li|td|tr|p|section|article|img", !JSXLIKE.has(ext))]
      .filter((x) => /\bonClick\s*=|\bonclick\s*=|@click\b|v-on:click|\(click\)\s*=/.test(x.tag) && !(/\brole\s*=/.test(x.tag) && /tabindex/i.test(x.tag)) && !/overlay|backdrop|scrim|aria-hidden/i.test(x.tag))
      .map((x) => ({ index: x.index })) },
  { id: "A11Y-LINK-HREF", sev: "major", group: "a11y", title: "<a> without href (verify)", exts: MARKUP,
    why: "An anchor with no href is not focusable and not announced as a link.", fix: "Add href for navigation, or use <button> for actions.", ref: "components-actions.md",
    run: (t, ext) => [...tags(t, "a", !JSXLIKE.has(ext))].filter((x) => !/\bhref\s*=|routerLink|\[href\]|:href|v-bind:href|\{\s*\.\.\.|\bname\s*=|\bid\s*=/i.test(x.tag)).map((x) => ({ index: x.index })) },
  { id: "A11Y-TABINDEX", sev: "major", group: "a11y", title: "Positive tabindex",
    why: "Overrides natural focus order and is hard to maintain.", fix: "Remove it; fix the DOM order instead. Use tabindex=\"0\" or \"-1\" only.", ref: "accessibility.md",
    run: (t, ext) => [...matches(/\btabindex\s*=\s*["'{]?\s*[1-9]/gi, t)].map((m) => ({ index: m.index })) },
  { id: "A11Y-LANG", sev: "major", group: "a11y", title: "<html> without lang", exts: PAGES,
    why: "Screen readers guess the language and may mispronounce everything (WCAG 3.1.1).", fix: 'Add lang="en" (or the page language) to <html>.', ref: "accessibility.md",
    run: (t, ext) => [...tags(t, "html", !JSXLIKE.has(ext))].filter((x) => !/\blang\s*=/i.test(x.tag)).map((x) => ({ index: x.index })) },
  { id: "RESP-VIEWPORT", sev: "major", group: "responsive", title: "Page without viewport meta tag", exts: PAGES,
    why: "Mobile browsers render a zoomed-out desktop layout.", fix: '<meta name="viewport" content="width=device-width, initial-scale=1">', ref: "responsive.md",
    run: (t, ext) => (/<head[\s>]/i.test(t) && !/name\s*=\s*["']viewport["']/i.test(t) ? [{ index: t.search(/<head[\s>]/i) }] : []) },
  { id: "A11Y-LABELS", sev: "major", group: "a11y", title: "Form controls but no labels in the file (verify)", exts: MARKUP,
    why: "Inputs without labels have no accessible name (WCAG 1.3.1, 3.3.2).", fix: "Add <label for>, wrap the control, or add aria-label. Placeholders are not labels.", ref: "components-forms.md",
    run: (t, ext) => { const c = [...tags(t, "input|select|textarea", !JSXLIKE.has(ext))].filter((x) => !/type\s*=\s*["'](?:hidden|submit|button|reset|image)["']/i.test(x.tag)); return c.length && !/<label|htmlFor|\bfor\s*=|aria-label|aria-labelledby|<Label|<FormLabel|mat-label|<v-label|<TextField|<Input[A-Z]/.test(t) ? [{ index: c[0].index }] : []; } },
  { id: "A11Y-GRAY-TEXT", sev: "major", group: "a11y", title: "Light gray text utility (likely low contrast, verify)",
    why: "gray-300/400 on white is about 1.5–2.5:1; body text needs 4.5:1.", fix: "Use a muted token that passes 4.5:1 (e.g. --muted-foreground) or step down to 600.", ref: "color.md",
    run: (t, ext) => [...matches(/\btext-(?:gray|slate|zinc|neutral|stone)-(?:300|400)\b/g, t)].map((m) => ({ index: m.index })) },
  { id: "RESP-FIXED-WIDTH", sev: "major", group: "responsive", title: "Fixed width of 600px or more (verify)",
    why: "Overflows phones (320–430px wide) unless inside a min-width media query.", fix: "Use max-width with width:100%, or flexible units; scroll wide tables inside their own container.", ref: "responsive.md",
    run: (t, ext) => [...matches(/(?<![\w(-])(?:min-)?width\s*:\s*(\d{3,4})px|(?<![\w-])w-\[(\d{3,4})px\]/gi, t)].filter((m) => Number(m[1] || m[2]) >= 600).map((m) => ({ index: m.index })) },
  { id: "RESP-FONT-TINY", sev: "major", group: "responsive", title: "Text smaller than 12px",
    why: "Too small to read comfortably; iOS also zooms into inputs below 16px.", fix: "Use 12px only for captions; 14px for dense UI; 16px for body and inputs.", ref: "typography.md",
    run: (t, ext) => [...matches(/font-size\s*:\s*(\d+(?:\.\d+)?)px|\btext-\[(\d+(?:\.\d+)?)px\]/gi, t)].filter((m) => Number(m[1] || m[2]) < 12).map((m) => ({ index: m.index })) },
  { id: "RESP-VH", sev: "minor", group: "responsive", title: "100vh / h-screen (hidden under mobile browser bars)",
    why: "On phones 100vh includes the area under the address bar.", fix: "Use min-height: 100dvh (min-h-dvh).", ref: "responsive.md",
    run: (t, ext) => [...matches(/(?<![\w-])100vh\b|\b(?:min-)?h-screen\b/g, t)].map((m) => ({ index: m.index })) },
  { id: "TOKEN-Z", sev: "minor", group: "tokens", title: "Arbitrary large z-index",
    why: "z-index wars; stacking contexts make big numbers unreliable.", fix: "Use a z-index token scale and the native top layer (<dialog>, popover).", ref: "shape-elevation.md",
    run: (t, ext) => [...matches(/z-index\s*:\s*(\d{4,})|\bz-\[(\d{4,})\]/gi, t)].map((m) => ({ index: m.index })) },
  { id: "MOTION-ALL", sev: "minor", group: "motion", title: "transition: all",
    why: "Animates layout properties and causes jank.", fix: "List the properties (color, background-color, opacity, transform).", ref: "motion.md",
    run: (t, ext) => [...matches(/transition(?:-property)?\s*:\s*all\b|\btransition-all\b/gi, t)].map((m) => ({ index: m.index })) },
  { id: "POLISH-LEGACY", sev: "minor", group: "polish", title: "Obsolete HTML elements", exts: MARKUP,
    why: "<center>, <font>, <marquee>, <blink> are deprecated.", fix: "Use CSS for alignment and typography.", ref: "glossary.md",
    run: (t, ext) => [...tags(t, "center|font|marquee|blink", !JSXLIKE.has(ext))].map((x) => ({ index: x.index })) },
];

// ---------- scan ----------
const files = walk(root);
const findings = new Map();
const add = (rule, file, index, text, starts) => {
  const line = lineOf(starts, index);
  const snippet = text.slice(starts[line - 1], starts[line] ?? text.length).trim().slice(0, 110);
  let f = findings.get(rule.id);
  if (!f) findings.set(rule.id, (f = { ...rule, count: 0, files: new Set(), examples: [] }));
  f.count++; f.files.add(file);
  if (f.examples.length < maxPer) f.examples.push({ file, line, snippet });
};

let colorTotal = 0; const colorFiles = new Map(); const importantFiles = new Map();
let usesMotion = false, honorsReduced = false;
const byExt = {};

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const ext = extname(file).toLowerCase();
  const rel = relative(root, file) || file;
  const starts = lineStarts(text);
  byExt[ext] = (byExt[ext] || 0) + 1;

  for (const rule of RULES) {
    if (rule.exts && !rule.exts.has(ext)) continue;
    let hits = [];
    try { hits = rule.run(text, ext) || []; } catch { /* a rule must never crash the audit */ }
    for (const h of hits) add(rule, rel, h.index, text, starts);
  }

  // Token files define colors by design; don't count them as hardcoding.
  const isTokenFile = /:root\s*\{[^}]*--[\w-]+\s*:/.test(text) || /@theme\b/.test(text) || /tailwind\.config|tokens/i.test(file);
  if (!isTokenFile) {
    let n = 0;
    for (const m of matches(/#[0-9a-fA-F]{3,8}\b(?![-\w])|\b(?:rgba?|hsla?|oklch|oklab)\(/g, text)) {
      const ls = starts[lineOf(starts, m.index) - 1], le = text.indexOf("\n", m.index);
      const line = text.slice(ls, le === -1 ? undefined : le);
      if (/href\s*=\s*["']#|&#|url\(#|id\s*=\s*["']#|\/\/\s*#/.test(line)) continue;
      if (m[0].endsWith("(") && /^[^)]{0,40}var\(--/.test(text.slice(m.index + m[0].length, m.index + m[0].length + 60))) continue;
      n++;
    }
    if (n) { colorTotal += n; colorFiles.set(rel, n); }
  }
  const imp = (text.match(/!important/g) || []).length;
  if (imp >= 5) importantFiles.set(rel, imp);
  if (/@keyframes|animation\s*:|\banimate-|transition\s*:|\btransition-/.test(text)) usesMotion = true;
  if (/prefers-reduced-motion|motion-reduce|motion-safe/.test(text)) honorsReduced = true;
}

const aggregate = (id, sev, group, title, why, fix, ref, count, entries) => {
  if (!count) return;
  const top = [...entries.entries()].sort((a, b) => b[1] - a[1]);
  findings.set(id, { id, sev, group, title, why, fix, ref, count, files: new Set(entries.keys()),
    examples: top.slice(0, maxPer).map(([file, n]) => ({ file, line: 0, snippet: `${n} occurrence${n > 1 ? "s" : ""}` })) });
};
if (colorTotal < 5) { colorTotal = 0; colorFiles.clear(); }
aggregate("TOKEN-COLORS", colorTotal > 60 ? "major" : "minor", "tokens", `Hardcoded colors (${colorTotal} values)`,
  "Colors scattered through components make theming, dark mode and rebranding a search-and-replace job.",
  "Move colors into semantic tokens (CSS variables) and reference them by role.", "tokens.md", colorTotal, colorFiles);
aggregate("TOKEN-IMPORTANT", "minor", "tokens", "Files with many !important", "Signals specificity conflicts.", "Fix the cascade or use cascade layers instead.", "tokens.md",
  importantFiles.size, importantFiles);
if (usesMotion && !honorsReduced) {
  findings.set("MOTION-REDUCED", { id: "MOTION-REDUCED", sev: "major", group: "motion", title: "Animations but no prefers-reduced-motion anywhere",
    why: "People with vestibular disorders can get dizzy or nauseous (WCAG 2.3.3).", fix: "Replace movement with short fades under @media (prefers-reduced-motion: reduce).", ref: "motion.md",
    count: 1, files: new Set(["(whole project)"]), examples: [{ file: "(whole project)", line: 0, snippet: "animations or transitions found, no reduced-motion handling found" }] });
}

const ORDER = { blocker: 0, major: 1, minor: 2 };
const list = [...findings.values()].sort((a, b) => ORDER[a.sev] - ORDER[b.sev] || b.count - a.count);
const GROUPS = { a11y: "Accessibility", responsive: "Responsive behavior", tokens: "Tokens and consistency", motion: "Motion", polish: "Polish" };
const groupSummary = Object.entries(GROUPS).map(([key, name]) => {
  const g = list.filter((f) => f.group === key);
  return { key, name, rules: g.length, issues: g.reduce((s, f) => s + f.count, 0), blockers: g.filter((f) => f.sev === "blocker").length };
}).filter((g) => g.rules);
const sevCount = (s) => list.filter((f) => f.sev === s).reduce((n, f) => n + f.count, 0);

if (asJson) {
  console.log(JSON.stringify({ root, filesScanned: files.length, byExtension: byExt, summary: { blocker: sevCount("blocker"), major: sevCount("major"), minor: sevCount("minor") }, groups: groupSummary,
    findings: list.map((f) => ({ id: f.id, severity: f.sev, group: f.group, title: f.title, count: f.count, files: f.files.size, why: f.why, fix: f.fix, reference: `references/${f.ref}`, examples: f.examples })) }, null, 2));
} else {
  const exts = Object.entries(byExt).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${n} ${e}`).join(", ");
  console.log(`# Front-end audit: ${root}\n`);
  console.log(`Scanned ${files.length} files (${exts || "none"}).`);
  console.log(`Found ${sevCount("blocker")} blocker, ${sevCount("major")} major, ${sevCount("minor")} minor.`);
  console.log(`Heuristic scan: findings marked "verify" may be false positives. Read the code before changing it.\n`);
  if (!list.length) console.log("No issues found by these checks. That does not mean the UI is accessible; test with a keyboard and a screen reader.");
  for (const sev of ["blocker", "major", "minor"]) {
    const group = list.filter((f) => f.sev === sev);
    if (!group.length) continue;
    console.log(`## ${sev[0].toUpperCase() + sev.slice(1)}\n`);
    for (const f of group) {
      console.log(`### ${f.id}: ${f.title} (${f.count} place${f.count > 1 ? "s" : ""} in ${f.files.size} file${f.files.size > 1 ? "s" : ""})`);
      console.log(`Why: ${f.why}\nFix: ${f.fix}\nRead: references/${f.ref}`);
      for (const e of f.examples) console.log(`- ${e.file}${e.line ? ":" + e.line : ""}  ${e.snippet ? "`" + e.snippet.replace(/`/g, "'") + "`" : ""}`);
      if (f.count > f.examples.length) console.log(`- … and ${f.count - f.examples.length} more`);
      console.log();
    }
  }
  if (groupSummary.length) {
    console.log("## Change groups you can offer the user\n");
    groupSummary.forEach((g, i) => console.log(`${i + 1}. ${g.name}: ${g.issues} issue${g.issues > 1 ? "s" : ""} across ${g.rules} check${g.rules > 1 ? "s" : ""}${g.blockers ? ` (${g.blockers} blocker)` : ""}`));
  }
}

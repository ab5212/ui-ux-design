import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import http from "node:http";
import net from "node:net";

const START = "/* playground:start (written by the playground Save button) */";
const END = "/* playground:end */";

// Dev only. Save writes the toolbar choices into the tokens file as a marked :root block.
// Set PLAYGROUND_TOKENS=path/to/your/tokens.css to update your own file instead of src/styles/tokens.css.

// "Your app" preview: a loopback proxy in front of the user's dev server that adds bridge.js to every HTML page,
// so the app needs no edits. Dev only; it listens on 127.0.0.1 and will only forward to a local address.
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);
const proxies = new Map<string, Promise<number>>();

function startProxy(target: URL, playground: string): Promise<number> {
  const host = target.hostname.replace(/^\[|\]$/g, ""), port = Number(target.port || 80);
  const tag = `<script src="${playground}/bridge.js"></script>`;
  const srv = http.createServer((req, res) => {
    const headers = { ...req.headers, host: target.host, "accept-encoding": "identity" } as http.OutgoingHttpHeaders;
    if (headers.origin) headers.origin = target.origin;
    const up = http.request({ host, port, path: req.url, method: req.method, headers }, (ur) => {
      const out = { ...ur.headers };
      delete out["x-frame-options"]; delete out["content-security-policy"]; delete out["content-security-policy-report-only"];
      const self = `http://${req.headers.host}`;
      if (typeof out.location === "string") out.location = out.location.replace(target.origin, self);
      if (!String(out["content-type"] ?? "").includes("text/html")) { res.writeHead(ur.statusCode ?? 502, out); ur.pipe(res); return; }
      const chunks: Buffer[] = [];
      ur.on("data", (c) => chunks.push(c));
      ur.on("end", () => {
        let html = Buffer.concat(chunks).toString("utf8");
        html = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${tag}</head>`) : tag + html;
        delete out["content-length"]; delete out["transfer-encoding"];
        res.writeHead(ur.statusCode ?? 200, { ...out, "content-length": Buffer.byteLength(html) });
        res.end(html);
      });
    });
    up.on("error", () => { res.statusCode = 502; res.end("Could not reach your app. Is it running?"); });
    req.pipe(up);
  });
  // WebSockets (hot reload) pass straight through.
  srv.on("upgrade", (req, socket, head) => {
    const up = net.connect(port, host, () => {
      const lines = Object.entries({ ...req.headers, host: target.host, ...(req.headers.origin ? { origin: target.origin } : {}) }).map(([k, v]) => `${k}: ${v}`);
      up.write(`${req.method} ${req.url} HTTP/1.1\r\n${lines.join("\r\n")}\r\n\r\n`); up.write(head);
      socket.pipe(up); up.pipe(socket);
    });
    up.on("error", () => socket.destroy()); socket.on("error", () => up.destroy());
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok((srv.address() as net.AddressInfo).port)));
}

interface SaveBody {
  preset: string; vars: Record<string, string>; colors: Record<string, { light?: string; dark?: string }>;
  dashboard: { cols: number; kpiStyle: string; widgets: { type: string; span: number }[] } | null;
  edits?: Record<string, Record<string, string>>; ops?: Record<string, unknown>[];
  app?: string; appDir?: string; dry?: boolean; fonts?: string[];
}

const run = (cmd: string, args: string[]) => new Promise<string>((ok) => execFile(cmd, args, (err, out) => ok(err ? "" : String(out))));

/** Where the user's app lives: the working directory of whatever is listening on its port (or a folder they typed). */
async function appFolder(appUrl: string | undefined, manual: string | undefined) {
  let dir = manual ? resolve(manual) : "";
  if (!dir) {
    const port = appUrl ? new URL(appUrl).port : "";
    const pid = port ? (await run("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"])).split("\n")[0] : "";
    const cwd = pid ? (await run("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"])).split("\n").find((l) => l.startsWith("n")) : "";
    dir = cwd ? cwd.slice(1) : "";
  }
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) throw new Error("NEED_APP_DIR");
  if (!existsSync(resolve(dir, "package.json")) && !existsSync(resolve(dir, "index.html"))) throw new Error("NEED_APP_DIR");
  if (resolve(dir) === process.cwd()) throw new Error("That is the playground itself, not your app.");
  return resolve(dir);
}

const JS_ENTRIES = ["src/main.tsx", "src/main.ts", "src/main.jsx", "src/main.js", "src/index.tsx", "src/index.ts", "src/index.jsx", "src/index.js",
  "src/app/layout.tsx", "src/app/layout.jsx", "app/layout.tsx", "app/layout.jsx", "src/pages/_app.tsx", "src/pages/_app.js", "pages/_app.tsx", "pages/_app.jsx", "pages/_app.js"];
const HTML_ENTRIES = ["index.html", "public/index.html", "src/index.html"];

/** Add the playground stylesheets to the app: an import after the last import of its entry file, or <link> tags in its index.html. */
function wireEntry(dir: string, names: string[], write: boolean) {
  const js = JS_ENTRIES.find((f) => existsSync(resolve(dir, f)));
  const html = HTML_ENTRIES.find((f) => existsSync(resolve(dir, f)));
  const entry = js ?? html;
  if (!entry) throw new Error("NEED_APP_DIR");
  const path = resolve(dir, entry);
  let src = readFileSync(path, "utf8");
  const missing = names.filter((n) => !src.includes(n));
  if (!missing.length) return { entry, cssDir: dirname(path), added: [] as string[] };
  if (js) {
    const add = missing.map((n) => `import "./${n}"; // added by the UI playground`);
    const lines = src.split("\n");
    let at = -1;
    lines.forEach((l, i) => { if (/^\s*import\b.*["'];?\s*$/.test(l) || /^\s*\}\s*from\s+["'].*["'];?\s*$/.test(l)) at = i; });
    if (at < 0) at = /^\s*["']use (client|strict)["']/.test(lines[0] ?? "") ? 0 : -1;
    lines.splice(at + 1, 0, ...add);
    src = lines.join("\n");
    if (write) writeFileSync(path, src);
    return { entry, cssDir: dirname(path), added: add };
  }
  const add = missing.map((n) => `<link rel="stylesheet" href="${n}"> <!-- added by the UI playground -->`);
  src = /<\/head>/i.test(src) ? src.replace(/<\/head>/i, `${add.join("\n")}\n</head>`) : add.join("\n") + "\n" + src;
  if (write) writeFileSync(path, src);
  return { entry, cssDir: dirname(path), added: add };
}

async function save(b: SaveBody) {
  const { preset, vars, colors, dashboard, edits, ops } = b;
  const lines = Object.entries(vars).map(([k, v]) => {
    if (!/^--[a-z0-9-]+$/.test(k) || !/^[\w\s.,%()"'-]+$/.test(String(v))) throw new Error(`bad value for ${k}`);
    return `  ${k}: ${v};`;
  });
  const color = (m: "light" | "dark") => Object.entries(colors ?? {}).filter(([, c]) => c[m]).map(([k, c]) => {
    if (!/^[a-z-]+$/.test(k) || !/^#[0-9a-fA-F]{6}$/.test(c[m]!)) throw new Error(`bad color for ${k}`);
    return `  --${k}: ${c[m]};`;
  });
  if (preset !== "base" && !/^[a-z]+$/.test(preset)) throw new Error("bad preset");
  // The chosen style preset goes in first, then the controls the user changed on top of it.
  const presetCss = preset === "base" ? "" : readFileSync(resolve("src/styles/presets", `${preset}.css`), "utf8") + "\n";
  const theme = `${presetCss}:root {\n${[...lines, ...color("light")].join("\n")}\n}\n.dark {\n${color("dark").join("\n")}\n}\n`;

  const entries = Object.entries(edits ?? {}).filter(([, props]) => Object.keys(props).length);
  const OPS = ["move", "insert", "delete", "duplicate", "group", "ungroup", "text", "menu-items"];
  const opList = Array.isArray(ops) ? ops.filter((o) => OPS.includes(String(o.op)) && JSON.stringify(o).length <= 20000) : [];
  const OK_PROP = new Set(["color", "background-color", "font-size", "font-weight", "text-align", "padding", "border-radius", "border-width", "border-style", "border-color", "box-shadow", "margin-top", "margin-bottom", "opacity", "width", "height", "display", "flex-direction", "gap", "align-items", "justify-content", "flex-wrap"]);
  const rules = entries.map(([sel, props]) => {
    if (!/^[\w\s.#>:()\-\[\]="'*,+~\\]+$/.test(sel)) throw new Error("bad selector");
    const decls = Object.entries(props).map(([k, v]) => {
      if (!OK_PROP.has(k) || !/^[#\w\s.,%()\-+]+$/.test(String(v))) throw new Error(`bad edit ${k}`);
      return `  ${k}: ${v} !important;`;
    });
    return `${sel} {\n${decls.join("\n")}\n}`;
  });
  let layout: string | null = null;
  if (dashboard) {
    const TYPES = ["kpi", "line", "area", "bar", "hbar", "stacked", "pie", "donut", "gauge", "radar", "scatter", "heatmap", "funnel", "table", "activity", "progress"];
    const str = (v: unknown) => (typeof v === "string" && v.length <= 80 ? v : undefined);
    const ok = [2, 3, 4, 6].includes(dashboard.cols) && ["plain", "trend", "sparkline", "icon"].includes(dashboard.kpiStyle)
      && Array.isArray(dashboard.widgets) && dashboard.widgets.length <= 60 && dashboard.widgets.every((w) => TYPES.includes(w.type) && [1, 2, 3, 4].includes(w.span));
    if (!ok) throw new Error("bad dashboard");
    const widgets = (dashboard.widgets as { type: string; span: number; title?: unknown; value?: unknown; delta?: unknown; data?: { labels?: unknown[]; values?: unknown[] } }[]).map((w) => {
      const out: Record<string, unknown> = { type: w.type, span: w.span };
      if (str(w.title)) out.title = w.title; if (str(w.value)) out.value = w.value; if (str(w.delta)) out.delta = w.delta;
      if (w.data && Array.isArray(w.data.labels) && Array.isArray(w.data.values) && w.data.labels.length <= 24)
        out.data = { labels: w.data.labels.map((l) => String(l).slice(0, 40)), values: w.data.values.map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0)) };
      return out;
    });
    layout = JSON.stringify({ columns: dashboard.cols, kpiStyle: dashboard.kpiStyle, widgets }, null, 2) + "\n";
  }
  const overridesCss = `/* Written by the UI playground (Your app > Edit elements). */\n${rules.join("\n")}\n`;
  const changes = JSON.stringify({ edits: entries.map(([selector, styles]) => ({ selector, styles })), ops: opList }, null, 2) + "\n";
  const files: string[] = [];

  if (b.app) {
    // Your app: write the theme and element styles into the app itself and import them, so its dev server updates.
    const dir = await appFolder(b.app, b.appDir);
    const names = ["playground-theme.css", ...(entries.length ? ["playground-overrides.css"] : [])];
    const wire = wireEntry(dir, names, !b.dry);
    const plan = { dir, entry: wire.entry, files: [...names.map((n) => relative(dir, resolve(wire.cssDir, n))), ...(opList.length || entries.length ? ["playground-changes.json"] : []), ...(layout ? ["playground-layout.json"] : [])], added: wire.added };
    if (b.dry) return { plan };
    // @import must come first in a stylesheet; it loads the Google Fonts the look needs, so the app needs no extra link.
    const imports = (b.fonts ?? []).filter((h) => /^https:\/\/fonts\.googleapis\.com\/css2\?[\w=+:@.;&-]+$/.test(h)).map((h) => `@import url("${h}");`).join("\n");
    writeFileSync(resolve(wire.cssDir, "playground-theme.css"), `${imports ? imports + "\n" : ""}/* Written by the UI playground. Overwritten on every Save. */\n${theme}`);
    if (entries.length) writeFileSync(resolve(wire.cssDir, "playground-overrides.css"), overridesCss);
    if (opList.length || entries.length) writeFileSync(resolve(dir, "playground-changes.json"), changes);
    if (layout) writeFileSync(resolve(dir, "playground-layout.json"), layout);
    return { file: dir, files: plan.files, plan };
  }

  // No app open: write into the playground's tokens file (or PLAYGROUND_TOKENS), as before.
  const file = resolve(process.env.PLAYGROUND_TOKENS || "src/styles/tokens.css");
  const css = readFileSync(file, "utf8");
  const block = `${START}\n${theme}${END}`;
  const i = css.indexOf(START), j = css.indexOf(END);
  writeFileSync(file, i >= 0 && j > i ? css.slice(0, i) + block + css.slice(j + END.length) : `${css.trimEnd()}\n\n${block}\n`);
  if (layout) writeFileSync(resolve(dirname(file), "playground-layout.json"), layout);
  if (entries.length) { writeFileSync(resolve(dirname(file), "playground-overrides.css"), overridesCss); files.push("playground-overrides.css"); }
  if (opList.length || entries.length) { writeFileSync(resolve(dirname(file), "playground-changes.json"), changes); files.push("playground-changes.json"); }
  return { file, files };
}

function saveTokens(): Plugin {
  return {
    name: "save-tokens",
    configureServer(server) {
      server.middlewares.use("/__proxy", (req, res) => {
        const fail = (code: number, msg: string) => { res.statusCode = code; res.end(msg); };
        if (req.method !== "POST") return fail(405, "POST only");
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host) return fail(403, "bad origin");
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          try {
            const t = new URL(JSON.parse(body).target);
            if (!["http:", "https:"].includes(t.protocol) || !LOOPBACK.has(t.hostname)) return fail(400, "Only apps running on this computer (localhost) are allowed.");
            if (t.protocol === "https:") return fail(400, "Use the http:// address of your dev server.");
            if (!proxies.has(t.origin)) proxies.set(t.origin, startProxy(t, `http://${req.headers.host}`));
            proxies.get(t.origin)!.then((port) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ port })); });
          } catch { fail(400, "bad request"); }
        });
      });
      server.middlewares.use("/__save-tokens", (req, res) => {
        const fail = (code: number, msg: string) => { res.statusCode = code; res.end(msg); };
        if (req.method !== "POST") return fail(405, "POST only");
        // Block other sites from writing files through this localhost endpoint.
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host) return fail(403, "bad origin");
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", async () => {
          try {
            const b = JSON.parse(body) as SaveBody;
            const out = await save(b);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(out));
          } catch (e) {
            fail(400, (e as Error).message);
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), saveTokens()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 5173, open: false },
});

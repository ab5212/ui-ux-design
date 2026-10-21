import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
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
        req.on("end", () => {
          try {
            const { preset, vars, colors, dashboard, edits } = JSON.parse(body) as { preset: string; vars: Record<string, string>; colors: Record<string, { light?: string; dark?: string }>; dashboard: { cols: number; kpiStyle: string; widgets: { type: string; span: number }[] } | null; edits?: Record<string, Record<string, string>> };
            const lines = Object.entries(vars).map(([k, v]) => {
              if (!/^--[a-z0-9-]+$/.test(k) || !/^[\w\s.,%()"'-]+$/.test(String(v))) throw new Error(`bad value for ${k}`);
              return `  ${k}: ${v};`;
            });
            const color = (m: "light" | "dark") => Object.entries(colors ?? {}).filter(([, c]) => c[m]).map(([k, c]) => {
              if (!/^[a-z-]+$/.test(k) || !/^#[0-9a-fA-F]{6}$/.test(c[m]!)) throw new Error(`bad color for ${k}`);
              return `  --${k}: ${c[m]};`;
            });
            const file = resolve(process.env.PLAYGROUND_TOKENS || "src/styles/tokens.css");
            const css = readFileSync(file, "utf8");
            // The chosen style preset goes in first, then the controls the user changed on top of it.
            if (preset !== "base" && !/^[a-z]+$/.test(preset)) throw new Error("bad preset");
            const presetCss = preset === "base" ? "" : readFileSync(resolve("src/styles/presets", `${preset}.css`), "utf8") + "\n";
            const block = `${START}\n${presetCss}:root {\n${[...lines, ...color("light")].join("\n")}\n}\n.dark {\n${color("dark").join("\n")}\n}\n${END}`;
            const i = css.indexOf(START), j = css.indexOf(END);
            const next = i >= 0 && j > i ? css.slice(0, i) + block + css.slice(j + END.length) : `${css.trimEnd()}\n\n${block}\n`;
            writeFileSync(file, next);
            // The dashboard layout goes beside the tokens file for the agent (or you) to build from.
            if (dashboard) {
              const ok = [2, 3, 4, 6].includes(dashboard.cols) && ["plain", "trend", "sparkline", "icon"].includes(dashboard.kpiStyle)
                && Array.isArray(dashboard.widgets) && dashboard.widgets.every((w) => ["kpi", "line", "bar", "table", "activity", "progress"].includes(w.type) && [1, 2, 3, 4].includes(w.span));
              if (!ok) throw new Error("bad dashboard");
              const widgets = dashboard.widgets.map(({ type, span }) => ({ type, span }));
              writeFileSync(resolve(dirname(file), "playground-layout.json"), JSON.stringify({ columns: dashboard.cols, kpiStyle: dashboard.kpiStyle, widgets }, null, 2) + "\n");
            }
            // Element edits from the "Your app" view become a stylesheet the app imports, plus a change list.
            const files: string[] = [];
            const entries = Object.entries(edits ?? {}).filter(([, props]) => Object.keys(props).length);
            if (entries.length) {
              const OK_PROP = new Set(["color", "background-color", "font-size", "font-weight", "text-align", "padding", "border-radius", "border-width", "border-style", "border-color", "box-shadow", "margin-top", "margin-bottom", "opacity"]);
              const rules = entries.map(([sel, props]) => {
                if (!/^[\w\s.#>:()\-\[\]="'*,+~\\]+$/.test(sel)) throw new Error("bad selector");
                const decls = Object.entries(props).map(([k, v]) => {
                  if (!OK_PROP.has(k) || !/^[#\w\s.,%()\-+]+$/.test(String(v))) throw new Error(`bad edit ${k}`);
                  return `  ${k}: ${v} !important;`;
                });
                return `${sel} {\n${decls.join("\n")}\n}`;
              });
              writeFileSync(resolve(dirname(file), "playground-overrides.css"), `/* Written by the playground (Your app > Edit elements). Import once: import "./playground-overrides.css" */\n${rules.join("\n")}\n`);
              writeFileSync(resolve(dirname(file), "playground-changes.json"), JSON.stringify({ edits: entries.map(([selector, styles]) => ({ selector, styles })) }, null, 2) + "\n");
              files.push("playground-overrides.css", "playground-changes.json");
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ file, files }));
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

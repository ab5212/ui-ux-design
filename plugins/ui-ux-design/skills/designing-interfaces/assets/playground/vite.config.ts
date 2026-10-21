import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const START = "/* playground:start (written by the playground Save button) */";
const END = "/* playground:end */";

// Dev only. Save writes the toolbar choices into the tokens file as a marked :root block.
// Set PLAYGROUND_TOKENS=path/to/your/tokens.css to update your own file instead of src/styles/tokens.css.
function saveTokens(): Plugin {
  return {
    name: "save-tokens",
    configureServer(server) {
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
            const { preset, vars, colors, dashboard } = JSON.parse(body) as { preset: string; vars: Record<string, string>; colors: Record<string, { light?: string; dark?: string }>; dashboard: { cols: number; kpiStyle: string; widgets: { type: string; span: number }[] } | null };
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
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ file }));
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

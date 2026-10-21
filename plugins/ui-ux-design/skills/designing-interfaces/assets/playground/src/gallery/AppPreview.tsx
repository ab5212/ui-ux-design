import { useEffect, useRef, useState } from "react";
import { buildCss, fontLinks, isDark, type Settings } from "@/lib/settings";
import { editsCss, type Edits, type Selection } from "@/lib/edits";

const KEY = "playground-app-url";

// Only apps running on this machine: the preview restyles the page and Save writes files, so a live site is never allowed.
const isLocal = (host: string) => host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "[::1]";

function parse(url: string) {
  try {
    const u = new URL(url);
    return (u.protocol === "http:" || u.protocol === "https:") && isLocal(u.hostname) ? u : null;
  } catch {
    return null;
  }
}

/** Frames the user's running app. Every change in the Customize panel is posted to it, and bridge.js applies it live. */
export function AppPreview({ settings, edits, editMode, setEditMode, onSelect }: { settings: Settings; edits: Edits; editMode: boolean; setEditMode: (on: boolean) => void; onSelect: (s: Selection | null) => void }) {
  const [draft, setDraft] = useState(() => localStorage.getItem(KEY) || "http://localhost:3000");
  const [src, setSrc] = useState(() => parse(localStorage.getItem(KEY) || "")?.href ?? ""); // the app address the user typed
  const [frameSrc, setFrameSrc] = useState(""); // the same page served through the playground's proxy, which adds the bridge
  const [connected, setConnected] = useState(false);
  const [late, setLate] = useState(false);
  const [reload, setReload] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const css = buildCss(settings), dark = isDark(settings), fonts = fontLinks(settings), editCss = editsCss(edits);
  const target = frameSrc ? new URL(frameSrc).origin : undefined;

  const post = () => {
    if (target) frame.current?.contentWindow?.postMessage({ type: "playground:apply", css, dark, fonts, editCss, edit: editMode }, target);
  };
  useEffect(post, [css, dark, fonts.join(), target, editCss, editMode]);

  useEffect(() => {
    const up = () => target && frame.current?.contentWindow?.postMessage({ type: "playground:select-parent" }, target);
    addEventListener("playground:select-parent", up);
    return () => removeEventListener("playground:select-parent", up);
  });

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "playground:ready") { setConnected(true); post(); }
      if (e.data?.type === "playground:select") onSelect(e.data.info ?? null);
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  });

  useEffect(() => {
    setConnected(false); setLate(false); setFrameSrc("");
    const u = parse(src);
    if (!u) return;
    let live = true;
    fetch("/__proxy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: u.origin }) })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() as Promise<{ port: number }>; })
      .then(({ port }) => live && setFrameSrc(`http://${location.hostname}:${port}${u.pathname}${u.search}${u.hash}`))
      .catch((e: Error) => live && setError(e.message));
    const t = setTimeout(() => setLate(true), 6000);
    return () => { live = false; clearTimeout(t); };
  }, [src, reload]);

  const [error, setError] = useState("");
  const load = () => {
    const u = parse(draft);
    setError(u ? "" : "Enter an app running on this computer, like http://localhost:3000. Live sites are not allowed.");
    if (!u) return;
    localStorage.setItem(KEY, u.href);
    setSrc(u.href);
    setReload((n) => n + 1);
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-w-0 flex-1 flex-col gap-3 py-4">
      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <label htmlFor="app-url" className="sr-only">Your app's address</label>
        <input id="app-url" value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="url" spellCheck={false}
          placeholder="http://localhost:3000" className="h-10 min-w-0 flex-1 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {src ? "Reload" : "Open my app"}
        </button>
        {src && connected && (
          <button type="button" role="switch" aria-checked={editMode} onClick={() => setEditMode(!editMode)}
            className={`h-10 rounded-md border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${editMode ? "border-primary bg-primary/10 text-primary" : "border-input bg-surface"}`}>
            <span aria-hidden className="icon material-symbols-rounded me-1 align-middle text-base">ads_click</span>Edit elements
          </button>
        )}
        {src && (
          <span role="status" className={`rounded-sm px-2 py-1 text-xs font-medium ${connected ? "bg-success/12 text-foreground" : "bg-muted text-muted-foreground"}`}>
            {connected ? "Live: changes apply as you edit" : late ? "Loaded, not connected" : "Connecting…"}
          </span>
        )}
      </form>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {late && src && !connected && (
        <div className="rounded-lg border bg-surface p-4 text-sm">
          <p className="font-medium">Couldn't connect to your app.</p>
          <p className="mt-1 text-muted-foreground">Check that it is running at <code className="font-mono">{src}</code> and that the address is its <code className="font-mono">http://</code> dev server, then press Reload.</p>
        </div>
      )}
      {!src && <p className="text-sm text-muted-foreground">Start your app, enter its local address (for example <code className="font-mono">http://localhost:3000</code>) and open it. Nothing needs to be added to your code.</p>}

      {src ? (
        <iframe ref={frame} src={frameSrc || "about:blank"} title="Your app" onLoad={post} className="min-h-0 w-full flex-1 rounded-lg border bg-white" />
      ) : null}
    </div>
  );
}

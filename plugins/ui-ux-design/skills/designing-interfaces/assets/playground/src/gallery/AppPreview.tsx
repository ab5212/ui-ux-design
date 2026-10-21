import { useEffect, useRef, useState } from "react";
import { buildCss, fontLinks, isDark, type Settings } from "@/lib/settings";

const KEY = "playground-app-url";

function parse(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

/** Frames the user's running app. Every change in the Customize panel is posted to it, and bridge.js applies it live. */
export function AppPreview({ settings }: { settings: Settings }) {
  const [draft, setDraft] = useState(() => localStorage.getItem(KEY) || "http://localhost:3000");
  const [src, setSrc] = useState(() => localStorage.getItem(KEY) || "");
  const [connected, setConnected] = useState(false);
  const [late, setLate] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const css = buildCss(settings), dark = isDark(settings), fonts = fontLinks(settings);
  const target = parse(src)?.origin;

  const post = () => {
    if (target) frame.current?.contentWindow?.postMessage({ type: "playground:apply", css, dark, fonts }, target);
  };
  useEffect(post, [css, dark, fonts.join(), target]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && e.data?.type === "playground:ready") { setConnected(true); post(); }
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  });

  useEffect(() => {
    setConnected(false); setLate(false);
    if (!src) return;
    const t = setTimeout(() => setLate(true), 3000);
    return () => clearTimeout(t);
  }, [src]);

  const load = () => {
    const u = parse(draft);
    if (!u) return;
    localStorage.setItem(KEY, u.href);
    setSrc(u.href);
  };
  const snippet = `<script src="${location.origin}/bridge.js"></script>`;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-w-0 flex-1 flex-col gap-3 py-4">
      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <label htmlFor="app-url" className="sr-only">Your app's address</label>
        <input id="app-url" value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="url" spellCheck={false}
          placeholder="http://localhost:3000" className="h-10 min-w-0 flex-1 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {src ? "Reload" : "Open my app"}
        </button>
        {src && (
          <span role="status" className={`rounded-sm px-2 py-1 text-xs font-medium ${connected ? "bg-success/12 text-foreground" : "bg-muted text-muted-foreground"}`}>
            {connected ? "Live: changes apply as you edit" : late ? "Loaded, not connected" : "Connecting…"}
          </span>
        )}
      </form>

      {(!src || (late && !connected)) && (
        <div className="rounded-lg border bg-surface p-4 text-sm">
          <p className="font-medium">{src ? "Your app loaded, but it isn't listening yet." : "Preview your own app here."}</p>
          <p className="mt-1 text-muted-foreground">
            Start your app, then add this line inside its <code className="font-mono">&lt;head&gt;</code> while you preview (dev only, remove before shipping). Your app must use this skill's color variables (<code className="font-mono">--primary</code>, <code className="font-mono">--destructive</code>…) for the colors to change.
          </p>
          <code className="mt-2 block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">{snippet}</code>
        </div>
      )}

      {src ? (
        <iframe ref={frame} src={src} title="Your app" onLoad={post} className="min-h-0 w-full flex-1 rounded-lg border bg-white" />
      ) : null}
    </div>
  );
}

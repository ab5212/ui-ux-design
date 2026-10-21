import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { toQuery, type Settings } from "@/lib/settings";
import { Demo } from "./Section";

const VIEWPORTS = [
  { w: 360, h: 760, label: "Phone", cls: "compact" },
  { w: 768, h: 1024, label: "Tablet", cls: "medium" },
  { w: 1024, h: 768, label: "Small laptop", cls: "expanded" },
  { w: 1440, h: 900, label: "Laptop", cls: "large" },
  { w: 1920, h: 1080, label: "Desktop", cls: "extra-large" },
] as const;

/** Scales an iframe of a real viewport width down to fit its column. */
function Frame({ w, h, src, maxW }: { w: number; h: number; src: string; maxW?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, (maxW ?? e.contentRect.width) / w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, maxW]);
  return (
    <div ref={box} className="w-full min-w-0">
      <div className="overflow-hidden rounded-lg border bg-background shadow-sm" style={{ width: w * scale, height: h * scale }}>
        <iframe
          title={`Sample layout at ${w}px`}
          src={src}
          loading="lazy"
          style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0 }}
        />
      </div>
    </div>
  );
}

export function ResponsivePreview({ settings }: { settings: Settings }) {
  const [mode, setMode] = useState<"single" | "all">("single");
  const [active, setActive] = useState(0);
  const src = `${location.pathname}?frame=layout&${toQuery(settings)}`;
  const v = VIEWPORTS[active];

  return (
    <Demo
      title="Viewport preview"
      note="A sample app shell rendered at real widths. Navigation changes from bottom bar to rail to sidebar."
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Preview mode" className="inline-flex gap-1 rounded-lg bg-muted p-1">
            {(["single", "all"] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
                className={cn("h-8 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring",
                  mode === m ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {m === "single" ? "One size" : "Side by side"}
              </button>
            ))}
          </div>
          {mode === "single" && (
            <div role="radiogroup" aria-label="Viewport width" className="flex flex-wrap gap-1">
              {VIEWPORTS.map((vp, i) => (
                <button key={vp.w} type="button" role="radio" aria-checked={i === active} onClick={() => setActive(i)}
                  className={cn("h-8 rounded-md border px-3 text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-ring",
                    i === active ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted")}>
                  {vp.w}
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === "single" ? (
          <div className="grid min-w-0 grid-cols-1 gap-2">
            <p className="text-sm text-muted-foreground">
              {v.label}, {v.w}×{v.h}, size class <strong className="font-medium text-foreground">{v.cls}</strong>
            </p>
            <Frame key={src + v.w} w={v.w} h={v.h} src={src} />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {VIEWPORTS.map((vp) => (
              <figure key={vp.w} className="grid shrink-0 content-start gap-2" style={{ width: 280 }}>
                <Frame w={vp.w} h={vp.h} src={src} maxW={280} />
                <figcaption className="text-xs text-muted-foreground tabular-nums">{vp.w}px, {vp.cls}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </Demo>
  );
}

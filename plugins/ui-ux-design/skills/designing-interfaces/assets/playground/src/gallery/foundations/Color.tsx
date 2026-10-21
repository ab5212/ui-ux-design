import { useEffect, useState } from "react";
import { apcaLc, cssVar, wcagRatio } from "@/lib/contrast";
import { Demo } from "../Section";
import { cn } from "@/lib/cn";

const PAIRS: { fill: string; fg: string; label: string; min: number }[] = [
  { fill: "--background", fg: "--foreground", label: "Background", min: 4.5 },
  { fill: "--surface", fg: "--foreground", label: "Surface", min: 4.5 },
  { fill: "--muted", fg: "--muted-foreground", label: "Muted", min: 4.5 },
  { fill: "--primary", fg: "--primary-foreground", label: "Primary", min: 4.5 },
  { fill: "--secondary", fg: "--secondary-foreground", label: "Secondary", min: 4.5 },
  { fill: "--accent", fg: "--accent-foreground", label: "Accent", min: 4.5 },
  { fill: "--destructive", fg: "--destructive-foreground", label: "Destructive", min: 4.5 },
  { fill: "--success", fg: "--success-foreground", label: "Success", min: 4.5 },
  { fill: "--warning", fg: "--warning-foreground", label: "Warning", min: 4.5 },
  { fill: "--info", fg: "--info-foreground", label: "Info", min: 4.5 },
];

const LINES: { token: string; label: string; min: number }[] = [
  { token: "--border", label: "Border (decorative)", min: 0 },
  { token: "--input", label: "Input boundary", min: 3 },
  { token: "--ring", label: "Focus ring", min: 3 },
];

/** Re-measure whenever the theme or hue changes (attributes on <html>). */
function useThemeTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => setTick((t) => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-radius"] });
    return () => obs.disconnect();
  }, []);
  return tick;
}

function Ratio({ fg, bg, min }: { fg: string; bg: string; min: number }) {
  const base = cssVar("--background");
  const r = wcagRatio(cssVar(fg), cssVar(bg), base);
  const lc = Math.abs(apcaLc(cssVar(fg), cssVar(bg), base));
  const pass = min === 0 || r >= min;
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums">
      <span className={cn("rounded-sm px-1.5 py-0.5 font-medium", pass ? "bg-success/12" : "bg-destructive/12")}>
        {r.toFixed(2)}:1 {min > 0 && (pass ? "AA" : "fails")}
      </span>
      <span className="text-muted-foreground">APCA Lc {lc.toFixed(0)}</span>
    </span>
  );
}

export function ColorFoundation() {
  useThemeTick();
  return (
    <>
      <Demo title="Semantic pairs" note="Every fill has a -foreground partner. Ratios are measured live for the current theme and hue.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {PAIRS.map((p) => (
            <div key={p.fill} className="overflow-hidden rounded-lg border">
              <div className="flex h-14 items-end p-3 text-sm font-medium" style={{ background: `var(${p.fill})`, color: `var(${p.fg})` }}>
                {p.label} text
              </div>
              <div className="grid gap-1 p-3">
                <code className="text-xs">{p.fill}</code>
                <Ratio fg={p.fg} bg={p.fill} min={p.min} />
              </div>
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="Lines" note="Control boundaries and focus rings need 3:1 (WCAG 1.4.11); decorative borders don't.">
        <div className="grid gap-3 sm:grid-cols-3">
          {LINES.map((l) => (
            <div key={l.token} className="grid gap-2">
              <div className="h-12 rounded-md bg-surface" style={{ border: `2px solid var(${l.token})` }} />
              <code className="text-xs">{l.token}</code>
              <span className="text-xs text-muted-foreground">{l.label}</span>
              <Ratio fg={l.token} bg="--background" min={l.min} />
            </div>
          ))}
        </div>
      </Demo>
    </>
  );
}

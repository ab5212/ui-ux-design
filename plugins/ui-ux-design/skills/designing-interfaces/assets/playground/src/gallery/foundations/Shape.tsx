import { useEffect, useId, useState } from "react";
import { tokenPx, useTokenTick } from "@/lib/useTokenTick";
import { Demo } from "../Section";
import { Button } from "@/components/ui/Button";

const SPACING = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
// Full class names so Tailwind's scanner finds them (never build class names from strings).
// [class, multiple of --radius]; the multiples mirror the @theme block in tokens.css.
const RADII = [
  ["rounded-xs", 0.25], ["rounded-sm", 0.5], ["rounded-md", 0.75], ["rounded-lg", 1],
  ["rounded-xl", 1.5], ["rounded-2xl", 2], ["rounded-3xl", 3], ["rounded-full", 0],
] as const;
const SHADOWS = [
  ["shadow-xs", "inputs"], ["shadow-sm", "cards"], ["shadow-md", "menus"], ["shadow-lg", "drawers"], ["shadow-xl", "dialogs"],
] as const;

export function SpacingFoundation() {
  useTokenTick();
  const unit = tokenPx("--spacing"); // follows the Spacing control
  return (
    <Demo title="Spacing scale" note="4px base. Space inside a group is smaller than space between groups.">
      <div className="grid gap-2">
        {SPACING.map((px) => (
          <div key={px} className="grid grid-cols-[3rem_1fr] items-center gap-4 text-sm">
            <span className="tabular-nums text-muted-foreground">{Math.round((px / 4) * unit)}</span>
            <div className="h-3 rounded-xs bg-primary" style={{ width: `calc(var(--spacing) * ${px / 4})` }} />
          </div>
        ))}
      </div>
    </Demo>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="flex justify-between text-sm font-medium">
        {label} <span className="tabular-nums text-muted-foreground">{value}px</span>
      </label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-(--primary)" />
    </div>
  );
}

export function RadiusFoundation() {
  useTokenTick();
  const base = Math.round(tokenPx("--radius")); // follows the Corners control and the active style
  const [override, setOverride] = useState<number | null>(null);
  useEffect(() => setOverride(null), [base]); // a new radius token resets the manual slider
  const inner = override ?? base;
  const setInner = setOverride;
  const [pad, setPad] = useState(10);
  const outer = inner + pad;
  return (
    <>
      <Demo title="Radius scale" note={`All values derive from one --radius (now ${base}px). Change Corners or the Style in the panel.`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {RADII.map(([cls, mult]) => (
            <div key={cls} className="grid justify-items-center gap-2">
              <div className={`size-16 border-2 border-primary bg-accent ${cls}`} />
              <code className="text-xs">{cls} · {mult ? `${Math.round(base * mult)}px` : "full"}</code>
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="Nested (concentric) radius" note="outer = inner + padding. The wrong version reuses the inner radius.">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div className="grid content-start gap-4">
            <Slider label="Inner radius" value={inner} min={0} max={Math.max(24, base * 2)} onChange={setInner} />
            {override !== null && <button type="button" onClick={() => setOverride(null)} className="justify-self-start text-xs font-medium text-primary hover:underline">Follow the radius token ({base}px)</button>}
            <Slider label="Padding" value={pad} min={2} max={32} onChange={setPad} />
            <p className="text-sm">
              Outer radius = <strong className="tabular-nums">{inner} + {pad} = {outer}px</strong>
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { label: "Concentric", r: outer, good: true },
              { label: "Same radius (pinched corners)", r: inner, good: false },
            ].map((v) => (
              <figure key={v.label} className="grid gap-2">
                <div className="border-2 border-primary/40 bg-accent" style={{ padding: pad, borderRadius: v.r }}>
                  <div className="grid h-28 place-items-center bg-primary text-sm font-medium text-primary-foreground" style={{ borderRadius: inner }}>
                    inner {inner}px
                  </div>
                </div>
                <figcaption className="text-sm">
                  <span className={v.good ? "font-medium" : "text-muted-foreground"}>{v.label}</span>
                  <span className="text-muted-foreground"> (outer {v.r}px)</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Demo>
    </>
  );
}

export function ElevationFoundation() {
  return (
    <Demo title="Elevation" note="Two-layer shadows. In dark mode surfaces lighten instead.">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {SHADOWS.map(([cls, use]) => (
          <div key={cls} className={`grid h-28 place-items-center rounded-xl bg-surface ${cls}`}>
            <div className="text-center">
              <code className="text-xs">{cls}</code>
              <p className="mt-1 text-xs text-muted-foreground">{use}</p>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  );
}

const DURATIONS = [
  ["--duration-instant", "70ms", "press"],
  ["--duration-fast", "120ms", "hover, focus"],
  ["--duration-base", "200ms", "menus, accordions"],
  ["--duration-slow", "300ms", "dialogs, sheets"],
  ["--duration-slower", "450ms", "large surfaces"],
] as const;

export function MotionFoundation() {
  const [on, setOn] = useState(false);
  return (
    <Demo title="Motion" note="Toggle reduced motion in the toolbar to see durations collapse.">
      <div className="grid gap-4">
        <Button variant="outline" className="justify-self-start" onClick={() => setOn((v) => !v)} aria-pressed={on}>
          {on ? "Reset" : "Play"}
        </Button>
        {DURATIONS.map(([token, ms, use]) => (
          <div key={token} className="grid gap-1.5 sm:grid-cols-[13rem_1fr] sm:items-center sm:gap-4">
            <div className="text-sm">
              <code className="text-xs">{token}</code> <span className="text-muted-foreground">{ms}, {use}</span>
            </div>
            {/* Transform-only animation: the wrapper slides, the track clips it. */}
            <div className="relative h-8 overflow-hidden rounded-md bg-muted">
              <div
                className="absolute inset-1 transition-transform ease-(--ease-standard) rtl:-scale-x-100"
                style={{ transitionDuration: `var(${token})`, transform: on ? "translateX(calc(100% - 3rem))" : "none" }}
              >
                <div className="h-full w-12 rounded-sm bg-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  );
}

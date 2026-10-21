import { toHex } from "@/lib/contrast";
import type { Edits, Selection } from "@/lib/edits";
import { cn } from "@/lib/cn";
import { useState } from "react";

const px = (v: string) => Math.round(parseFloat(v) || 0);
const SHADOWS = { none: "none", soft: "0 1px 3px rgb(0 0 0 / 0.15)", medium: "0 4px 12px rgb(0 0 0 / 0.18)", strong: "0 12px 28px rgb(0 0 0 / 0.25)" } as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{label}</span>{children}</div>;
}
function Num({ label, value, min = 0, max = 200, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  return (
    <Row label={label}>
      <span className="flex items-center gap-2">
        <input type="range" aria-label={label} min={min} max={max} value={Math.min(max, Math.max(min, value))} onChange={(e) => onChange(+e.target.value)} className="w-12 accent-(--primary)" />
        <input type="number" aria-label={`${label} in pixels`} value={value} min={min} onChange={(e) => onChange(+e.target.value)} className="h-8 w-14 rounded-md border border-input bg-surface px-2 text-end text-sm tabular-nums" />
      </span>
    </Row>
  );
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  return <Row label={label}><input type="color" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="size-8 cursor-pointer rounded-md border border-input bg-transparent p-0.5" /></Row>;
}
function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <Row label={label}>
      <div role="radiogroup" aria-label={label} className="inline-flex gap-0.5 rounded-lg bg-muted p-0.5">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={cn("h-7 rounded-md px-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-ring", value === o.value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{o.label}</button>
        ))}
      </div>
    </Row>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="grid min-w-0 grid-cols-1 gap-3 border-0 p-0"><legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">{title}</legend>{children}</fieldset>;
}

/** Edits the element picked in the framed app. Each change is applied live and kept until Save writes it to playground-overrides.css. */
export function ElementPanel({ selection, edits, set, clear }: {
  selection: Selection | null; edits: Edits;
  set: (selector: string, prop: string, value: string | null) => void; clear: (selector?: string) => void;
}) {
  const [all, setAll] = useState(false);
  const count = Object.keys(edits).length;
  if (!selection) {
    return (
      <div className="grid gap-3 text-sm">
        <p className="text-muted-foreground">Turn on <strong className="text-foreground">Edit elements</strong>, then click anything in your app: a button, a card, a banner, a heading. Its styles appear here.</p>
        {count > 0 && <p>{count} element{count > 1 ? "s" : ""} edited. <button type="button" onClick={() => clear()} className="font-medium text-primary hover:underline">Reset all</button></p>}
      </div>
    );
  }
  const s = selection.styles;
  const target = all && selection.similar ? selection.similar : selection.selector;
  const own = edits[target] ?? {};
  const put = (prop: string, value: string | null) => set(target, prop, value);
  const val = (prop: string, live: string) => own[prop] ?? live;
  const weight = String(Math.round((parseInt(val("font-weight", s["font-weight"])) || 400) / 100) * 100);
  const align = val("text-align", s["text-align"]);
  const radius = px(val("border-radius", s["border-top-left-radius"]));
  const hasBorder = px(val("border-width", s["border-top-width"])) > 0;
  const shadowKey = (Object.keys(SHADOWS) as (keyof typeof SHADOWS)[]).find((k) => SHADOWS[k] === own["box-shadow"]) ?? (s["box-shadow"] === "none" ? "none" : undefined);
  const hex = (prop: string, live: string) => toHex(val(prop, live));

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{selection.label}</p>
        {selection.text && <p className="truncate text-xs text-muted-foreground">“{selection.text}”</p>}
        <button type="button" onClick={() => dispatchEvent(new Event("playground:select-parent"))} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          <span aria-hidden className="icon material-symbols-rounded text-base">north_west</span>Select parent
        </button>
        <code className="mt-1 block truncate font-mono text-xs text-muted-foreground" title={target}>{target}</code>
        {selection.similar && selection.similarCount > 1 && (
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="size-4 accent-(--primary)" />
            Apply to all {selection.similarCount} similar ({selection.similar})</label>
        )}
      </div>

      <Group title="Text">
        <Color label="Text color" value={hex("color", s.color)} onChange={(v) => put("color", v)} />
        <Num label="Size" value={px(val("font-size", s["font-size"]))} min={8} max={72} onChange={(n) => put("font-size", `${n}px`)} />
        <Seg label="Weight" value={weight} onChange={(v) => put("font-weight", v)} options={[{ value: "400", label: "Reg" }, { value: "500", label: "Med" }, { value: "600", label: "Semi" }, { value: "700", label: "Bold" }]} />
        <Seg label="Align" value={align === "start" ? "left" : align === "end" ? "right" : align} onChange={(v) => put("text-align", v)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
      </Group>
      <Group title="Fill">
        <Color label="Background" value={hex("background-color", s["background-color"])} onChange={(v) => put("background-color", v)} />
        <Num label="Opacity" value={Math.round(parseFloat(val("opacity", s.opacity)) * 100)} min={0} max={100} onChange={(n) => put("opacity", String(n / 100))} />
      </Group>
      <Group title="Box">
        <Num label="Padding" value={px(val("padding", s["padding-top"]))} max={96} onChange={(n) => put("padding", `${n}px`)} />
        <Num label="Corner radius" value={radius} max={64} onChange={(n) => put("border-radius", `${n}px`)} />
        <Num label="Border" value={px(val("border-width", s["border-top-width"]))} max={8} onChange={(n) => { put("border-width", `${n}px`); put("border-style", "solid"); }} />
        {hasBorder && <Color label="Border color" value={hex("border-color", s["border-top-color"])} onChange={(v) => put("border-color", v)} />}
        <Seg label="Shadow" value={(shadowKey ?? "none") as string} onChange={(v) => put("box-shadow", SHADOWS[v as keyof typeof SHADOWS])} options={(Object.keys(SHADOWS) as string[]).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))} />
      </Group>
      <Group title="Position">
        <Num label="Space above" value={px(val("margin-top", s["margin-top"]))} max={120} onChange={(n) => put("margin-top", `${n}px`)} />
        <Num label="Space below" value={px(val("margin-bottom", s["margin-bottom"]))} max={120} onChange={(n) => put("margin-bottom", `${n}px`)} />
      </Group>

      <div className="flex items-center gap-4 text-sm">
        <button type="button" disabled={!edits[target]} onClick={() => clear(target)} className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline">Reset this element</button>
        {count > 0 && <button type="button" onClick={() => clear()} className="text-muted-foreground hover:text-foreground">Reset all ({count})</button>}
      </div>
    </div>
  );
}

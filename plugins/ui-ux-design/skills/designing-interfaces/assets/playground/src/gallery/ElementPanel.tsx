import { toHex } from "@/lib/contrast";
import { cmd, type Edits, type Selection } from "@/lib/edits";
import { ICONS } from "@/lib/library";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

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
function Act({ icon, label, onClick, danger, disabled }: { icon: string; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick}
      className={cn("grid size-9 place-items-center rounded-md border bg-surface hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40", danger && "hover:text-destructive")}>
      <span aria-hidden className="icon material-symbols-rounded text-xl">{icon}</span>
    </button>
  );
}

/** Editable list of kebab-menu items: label, icon, add, remove, reorder. */
function ItemsEditor({ sel }: { sel: Selection }) {
  const [items, setItems] = useState(sel.items ?? []);
  useEffect(() => setItems(sel.items ?? []), [sel.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const push = (next: { label: string; icon: string }[]) => { setItems(next); cmd({ cmd: "items", id: sel.id, items: next.filter((i) => i.label.trim()) }); };
  return (
    <Group title="Menu items">
      <ul className="grid gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <select aria-label="Icon" value={it.icon} onChange={(e) => push(items.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} className="h-8 w-24 rounded-md border border-input bg-surface px-1 text-xs">
              <option value="">No icon</option>{ICONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <input aria-label="Label" value={it.label} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              onBlur={() => push(items)} className="h-8 min-w-0 flex-1 rounded-md border border-input bg-surface px-2 text-sm" />
            <Act icon="arrow_upward" label="Move item up" disabled={i === 0} onClick={() => push(items.map((_, j) => items[j === i - 1 ? i : j === i ? i - 1 : j]))} />
            <Act icon="close" label="Remove item" danger onClick={() => push(items.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => push([...items, { label: "New item", icon: "" }])} className="justify-self-start text-sm font-medium text-primary hover:underline">+ Add item</button>
    </Group>
  );
}

function ContentField({ sel }: { sel: Selection }) {
  const [v, setV] = useState(sel.text);
  useEffect(() => setV(sel.text), [sel.id, sel.text]);
  return (
    <Group title="Content">
      <input aria-label="Text content" value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== sel.text && cmd({ cmd: "text", text: v })}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className="h-9 rounded-md border border-input bg-surface px-3 text-sm" />
      <p className="text-xs text-muted-foreground">Or double-click the text in your app.</p>
    </Group>
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

      <div role="toolbar" aria-label="Arrange" className="flex flex-wrap gap-1.5">
        <Act icon="arrow_upward" label="Move up (Alt+↑)" disabled={selection.index === 0} onClick={() => cmd({ cmd: "up" })} />
        <Act icon="arrow_downward" label="Move down (Alt+↓)" disabled={selection.index >= selection.siblings - 1} onClick={() => cmd({ cmd: "down" })} />
        <Act icon="content_copy" label="Duplicate (Ctrl+D)" onClick={() => cmd({ cmd: "duplicate" })} />
        <Act icon="view_column" label="Group in a row (Ctrl+G)" onClick={() => cmd({ cmd: "group", layout: "row" })} />
        <Act icon="view_agenda" label="Group in a column" onClick={() => cmd({ cmd: "group", layout: "column" })} />
        <Act icon="ungroup" label="Ungroup (Ctrl+Shift+G)" disabled={!selection.childCount} onClick={() => cmd({ cmd: "ungroup" })} />
        <Act icon="delete" label="Delete (Del)" danger onClick={() => cmd({ cmd: "delete" })} />
      </div>
      {selection.multi > 1 && <p className="text-xs text-muted-foreground">{selection.multi} selected (Shift+click). Group wraps them together.</p>}

      {(selection.text || selection.icon) && !selection.icon && <ContentField sel={selection} />}
      {selection.icon && (
        <Group title="Icon">
          <ul className="grid grid-cols-8 gap-1" aria-label="Icons">
            {ICONS.map((n) => (
              <li key={n}><button type="button" aria-label={n} title={n} onClick={() => cmd({ cmd: "text", text: n })}
                className={cn("grid size-8 place-items-center rounded-md hover:bg-muted", selection.text === n && "bg-primary/10 text-primary")}>
                <span aria-hidden className="icon material-symbols-rounded text-xl">{n}</span></button></li>
            ))}
          </ul>
        </Group>
      )}
      {selection.kebab && selection.items && <ItemsEditor sel={selection} />}

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

      {selection.container && (
        <Group title="Layout">
          <Seg label="Direction" value={val("flex-direction", s["flex-direction"]).startsWith("row") && val("display", s.display).includes("flex") ? "row" : val("display", s.display).includes("flex") ? "column" : "block"}
            onChange={(v) => { if (v === "block") put("display", "block"); else { put("display", "flex"); put("flex-direction", v); } }}
            options={[{ value: "block", label: "Stack" }, { value: "row", label: "Row" }, { value: "column", label: "Column" }]} />
          <Num label="Gap" value={px(val("gap", s.gap))} max={64} onChange={(n) => put("gap", `${n}px`)} />
          <Seg label="Align" value={val("align-items", s["align-items"])} onChange={(v) => put("align-items", v)} options={[{ value: "flex-start", label: "Start" }, { value: "center", label: "Center" }, { value: "flex-end", label: "End" }, { value: "stretch", label: "Fill" }]} />
          <Seg label="Justify" value={val("justify-content", s["justify-content"])} onChange={(v) => put("justify-content", v)} options={[{ value: "flex-start", label: "Start" }, { value: "center", label: "Center" }, { value: "space-between", label: "Spread" }, { value: "flex-end", label: "End" }]} />
          <Seg label="Wrap" value={val("flex-wrap", s["flex-wrap"])} onChange={(v) => put("flex-wrap", v)} options={[{ value: "nowrap", label: "No" }, { value: "wrap", label: "Wrap" }]} />
        </Group>
      )}
      <Group title="Size">
        <Num label="Width" value={px(val("width", s.width))} max={1600} onChange={(n) => put("width", `${n}px`)} />
        <Num label="Height" value={px(val("height", s.height))} max={1200} onChange={(n) => put("height", `${n}px`)} />
        <div className="flex gap-3 text-xs font-medium text-primary">
          <button type="button" onClick={() => put("width", "100%")} className="hover:underline">Fill width</button>
          <button type="button" onClick={() => { put("width", null); put("height", null); }} className="hover:underline">Auto size</button>
        </div>
        <p className="text-xs text-muted-foreground">Or drag the handles in your app.</p>
      </Group>

      <div className="flex items-center gap-4 text-sm">
        <button type="button" disabled={!edits[target]} onClick={() => clear(target)} className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline">Reset this element</button>
        {count > 0 && <button type="button" onClick={() => clear()} className="text-muted-foreground hover:text-foreground">Reset all ({count})</button>}
      </div>
    </div>
  );
}

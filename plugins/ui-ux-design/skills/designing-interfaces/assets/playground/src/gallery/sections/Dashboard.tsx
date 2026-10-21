import { useEffect, useState } from "react";
import { Demo } from "../Section";
import { Button } from "@/components/ui/Button";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";
import { CHARTS, SAMPLE, SAMPLE_PARTS, type Data } from "@/lib/charts";

export type WidgetType = "kpi" | "line" | "area" | "bar" | "hbar" | "stacked" | "pie" | "donut" | "gauge" | "radar" | "scatter" | "heatmap" | "funnel" | "table" | "activity" | "progress";
export interface Widget { id: string; type: WidgetType; span: 1 | 2 | 3 | 4; title?: string; value?: string; delta?: string; data?: Data }
export type KpiStyle = "plain" | "trend" | "sparkline" | "icon";
export interface Dash { cols: 2 | 3 | 4 | 6; kpiStyle: KpiStyle; widgets: Widget[] }

export const DASH_KEY = "playground-dashboard";
const uid = () => Math.random().toString(36).slice(2, 8);
const DEFAULT: Dash = {
  cols: 4, kpiStyle: "trend",
  widgets: [
    ...(["kpi", "kpi", "kpi", "kpi"] as const).map((type) => ({ id: uid(), type, span: 1 as const })),
    { id: uid(), type: "line", span: 3 }, { id: uid(), type: "activity", span: 1 },
    { id: uid(), type: "table", span: 2 }, { id: uid(), type: "progress", span: 1 }, { id: uid(), type: "bar", span: 1 },
  ],
};

function load(): Dash {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(DASH_KEY) || "{}") }; } catch { return DEFAULT; }
}

const LABEL: Record<WidgetType, string> = { kpi: "KPI card", line: "Line chart", area: "Area chart", bar: "Bar chart", hbar: "Horizontal bars", stacked: "Stacked bars", pie: "Pie chart", donut: "Donut chart", gauge: "Gauge", radar: "Radar chart", scatter: "Scatter plot", heatmap: "Heatmap", funnel: "Funnel", table: "Table", activity: "Activity", progress: "Progress" };
const GROUPS: [string, WidgetType[]][] = [
  ["Numbers", ["kpi", "gauge"]],
  ["Trends", ["line", "area", "bar", "stacked", "scatter"]],
  ["Share", ["pie", "donut", "hbar", "funnel", "radar", "heatmap"]],
  ["Lists", ["table", "activity", "progress"]],
];
const TITLE: Partial<Record<WidgetType, string>> = { line: "Revenue", area: "Visitors", bar: "Orders", hbar: "By channel", stacked: "Plans", pie: "Traffic sources", donut: "Share", gauge: "Goal", radar: "Skills", scatter: "Correlation", heatmap: "Activity by day", funnel: "Conversion" };
const DATA: Partial<Record<WidgetType, Data>> = {
  hbar: SAMPLE_PARTS, pie: SAMPLE_PARTS, donut: SAMPLE_PARTS, gauge: { labels: ["of target"], values: [72] },
  radar: { labels: ["Speed", "Power", "Skill", "Range", "Focus"], values: [8, 6, 9, 5, 7] }, funnel: { labels: ["Visits", "Signups", "Trials", "Paid"], values: [1000, 620, 310, 140] },
};
const dataOf = (w: Widget): Data => w.data ?? DATA[w.type] ?? SAMPLE;
const KPIS = [
  { label: "Revenue", value: "$48.2k", delta: "+12%", up: true, icon: "payments" },
  { label: "Active users", value: "1,204", delta: "+4.1%", up: true, icon: "group" },
  { label: "Orders", value: "342", delta: "−2.3%", up: false, icon: "shopping_cart" },
  { label: "Conversion", value: "3.8%", delta: "+0.6%", up: true, icon: "speed" },
];
const SERIES = [12, 18, 14, 22, 19, 27, 24, 31, 28, 36, 33, 41];

function Spark({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(" ");
  return <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden className={cn("h-8 w-full text-primary", className)}><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" /></svg>;
}

function Icon({ name, className }: { name: string; className?: string }) {
  return <span aria-hidden className={cn("icon material-symbols-rounded", className)}>{name}</span>;
}

function WidgetBody({ w, index, kpiStyle }: { w: Widget; index: number; kpiStyle: KpiStyle }) {
  if (w.type === "kpi") {
    const base = KPIS[index % KPIS.length];
    const k = { ...base, label: w.title ?? base.label, value: w.value ?? base.value, delta: w.delta ?? base.delta };
    return (
      <div className="flex h-full items-start gap-3">
        {kpiStyle === "icon" && <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon name={k.icon} className="text-xl" /></span>}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{k.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{k.value}</p>
          {kpiStyle !== "plain" && (
            <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", k.up ? "text-success" : "text-destructive")}>
              <Icon name={k.up ? "trending_up" : "trending_down"} className="text-base" />{k.delta} <span className="font-normal text-muted-foreground">vs last month</span>
            </p>
          )}
          {kpiStyle === "sparkline" && <Spark data={SERIES.map((v, i) => v + ((i * (index + 2)) % 7))} className="mt-2" />}
        </div>
      </div>
    );
  }
  if (w.type in CHARTS) return (<><p className="text-sm font-medium">{w.title ?? TITLE[w.type] ?? LABEL[w.type]}</p><div className="mt-2 text-foreground" dangerouslySetInnerHTML={{ __html: CHARTS[w.type](dataOf(w)) }} /></>);
  if (w.type === "table") return (
    <>
      <p className="text-sm font-medium">Recent invoices</p>
      <table className="mt-2 w-full text-sm"><tbody>
        {[["INV-2043", "Oakline Logistics", "$3,420"], ["INV-2041", "Northwind Traders", "$1,204"], ["INV-2044", "Juniper & Co.", "$349"]].map((r) => (
          <tr key={r[0]} className="border-t"><td className="py-2 font-mono text-xs text-muted-foreground">{r[0]}</td><td className="py-2">{r[1]}</td><td className="py-2 text-end tabular-nums">{r[2]}</td></tr>
        ))}
      </tbody></table>
    </>
  );
  if (w.type === "activity") return (
    <>
      <p className="text-sm font-medium">Activity</p>
      <ul className="mt-2 grid gap-2 text-sm">
        {[["person_add", "New user joined"], ["receipt_long", "Invoice paid"], ["warning", "Payment failed"]].map(([i, t]) => (
          <li key={t} className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-muted"><Icon name={i} className="text-base" /></span>{t}</li>
        ))}
      </ul>
    </>
  );
  return (
    <>
      <p className="text-sm font-medium">Goals</p>
      <ul className="mt-2 grid gap-3 text-sm">
        {[["Revenue", 72], ["Signups", 48], ["Retention", 91]].map(([l, v]) => (
          <li key={l}><div className="mb-1 flex justify-between"><span>{l}</span><span className="tabular-nums text-muted-foreground">{v}%</span></div>
            <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div></li>
        ))}
      </ul>
    </>
  );
}

function Seg<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-lg bg-muted p-1">
        {options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={cn("h-8 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", value === o.value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

/** Title and data of the selected widget. Charts redraw as you type. */
function WidgetEditor({ w, onChange, onClose }: { w: Widget; onChange: (p: Partial<Widget>) => void; onClose: () => void }) {
  const isChart = w.type in CHARTS;
  const d = dataOf(w);
  const setRow = (i: number, key: "labels" | "values", v: string) => {
    const labels = [...d.labels], values = [...d.values];
    if (key === "labels") labels[i] = v; else values[i] = Number(v) || 0;
    onChange({ data: { ...d, labels, values } });
  };
  const input = "h-9 min-w-0 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";
  return (
    <div className="mt-4 grid gap-4 rounded-xl border bg-muted/40 p-4" role="region" aria-label={`${LABEL[w.type]} settings`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{LABEL[w.type]} settings</h4>
        <button type="button" onClick={onClose} aria-label="Close settings" className="icon material-symbols-rounded text-muted-foreground hover:text-foreground">close</button>
      </div>
      <label className="grid gap-1.5 text-sm"><span className="text-xs font-medium text-muted-foreground">Title</span>
        <input className={input} value={w.title ?? ""} placeholder={TITLE[w.type] ?? LABEL[w.type]} onChange={(e) => onChange({ title: e.target.value })} /></label>
      {w.type === "kpi" && (
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm"><span className="text-xs font-medium text-muted-foreground">Value</span><input className={input} value={w.value ?? ""} placeholder="$48.2k" onChange={(e) => onChange({ value: e.target.value })} /></label>
          <label className="grid gap-1.5 text-sm"><span className="text-xs font-medium text-muted-foreground">Change</span><input className={input} value={w.delta ?? ""} placeholder="+12%" onChange={(e) => onChange({ delta: e.target.value })} /></label>
        </div>
      )}
      {isChart && (
        <div className="grid gap-2">
          <span className="text-xs font-medium text-muted-foreground">Data</span>
          {d.labels.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input aria-label={`Label ${i + 1}`} className={cn(input, "flex-1")} value={l} onChange={(e) => setRow(i, "labels", e.target.value)} />
              <input aria-label={`Value ${i + 1}`} type="number" className={cn(input, "w-24 tabular-nums")} value={d.values[i] ?? 0} onChange={(e) => setRow(i, "values", e.target.value)} />
              <button type="button" aria-label={`Remove row ${i + 1}`} disabled={d.labels.length <= 1} onClick={() => onChange({ data: { ...d, labels: d.labels.filter((_, j) => j !== i), values: d.values.filter((_, j) => j !== i) } })} className="icon material-symbols-rounded text-muted-foreground hover:text-destructive disabled:opacity-30">close</button>
            </div>
          ))}
          {d.labels.length < 12 && <button type="button" onClick={() => onChange({ data: { ...d, labels: [...d.labels, `Item ${d.labels.length + 1}`], values: [...d.values, 10] } })} className="justify-self-start text-sm font-medium text-primary hover:underline">+ Add row</button>}
        </div>
      )}
    </div>
  );
}

/** Lay out a dashboard: grid size, KPI card style, which widgets, their order and width. Saved with "Save to code" as playground-layout.json. */
export function DashboardBuilder() {
  const [dash, setDash] = useState<Dash>(load);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const narrow = useMediaQuery("(max-width: 639px)");
  useEffect(() => { localStorage.setItem(DASH_KEY, JSON.stringify(dash)); }, [dash]);

  const set = (p: Partial<Dash>) => setDash((d) => ({ ...d, ...p }));
  const move = (from: number, to: number) => setDash((d) => {
    if (to < 0 || to >= d.widgets.length) return d;
    const widgets = [...d.widgets]; widgets.splice(to, 0, widgets.splice(from, 1)[0]); return { ...d, widgets };
  });
  const patch = (id: string, p: Partial<Widget>) => set({ widgets: dash.widgets.map((w) => (w.id === id ? { ...w, ...p } : w)) });
  const cols = narrow ? 1 : dash.cols;
  let kpiIndex = -1;

  return (
    <>
      <Demo title="Dashboard builder" note="Drag cards to reorder, or use the arrows. Resize with the width control. Save to code stores this layout for your app.">
        <div className="mb-5 flex flex-wrap items-end gap-x-6 gap-y-4">
          <Seg label="Grid columns" value={dash.cols} onChange={(cols) => set({ cols })} options={[2, 3, 4, 6].map((n) => ({ value: n as Dash["cols"], label: String(n) }))} />
          <Seg<KpiStyle> label="KPI card style" value={dash.kpiStyle} onChange={(kpiStyle) => set({ kpiStyle })}
            options={[{ value: "plain", label: "Number" }, { value: "trend", label: "Trend" }, { value: "sparkline", label: "Sparkline" }, { value: "icon", label: "Icon" }]} />
          <div className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Add widget</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {GROUPS.map(([g, types]) => (
                <div key={g} className="flex flex-wrap items-center gap-1.5" role="group" aria-label={g}>
                  <span className="text-xs text-muted-foreground">{g}</span>
                  {types.map((t) => (
                    <Button key={t} variant="outline" size="sm" onClick={() => { const w: Widget = { id: uid(), type: t, span: t === "kpi" || t === "gauge" || t === "progress" || t === "activity" ? 1 : 2 }; set({ widgets: [...dash.widgets, w] }); setEditing(w.id); }}>
                      <Icon name="add" /> {LABEL[t]}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {dash.widgets.map((w, i) => {
            if (w.type === "kpi") kpiIndex++;
            return (
              <article key={w.id} draggable onDragStart={() => setDragFrom(i)} onDragEnd={() => setDragFrom(null)}
                onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragFrom !== null) move(dragFrom, i); setDragFrom(null); }}
                style={{ gridColumn: `span ${Math.min(w.span, cols)}` }}
                onClick={() => setEditing(editing === w.id ? null : w.id)}
                className={cn("group relative min-w-0 cursor-pointer rounded-xl border bg-surface p-4 shadow-sm transition-opacity", dragFrom === i && "opacity-40", editing === w.id && "ring-2 ring-primary")}>
                <div onClick={(e) => e.stopPropagation()} className="absolute end-2 top-2 z-10 flex items-center gap-0.5 rounded-md bg-surface/90 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <span aria-hidden className="icon material-symbols-rounded cursor-grab text-base text-muted-foreground">drag_indicator</span>
                  <button type="button" aria-label={`Move ${LABEL[w.type]} earlier`} onClick={() => move(i, i - 1)} className="icon material-symbols-rounded text-base text-muted-foreground hover:text-foreground">arrow_back</button>
                  <button type="button" aria-label={`Move ${LABEL[w.type]} later`} onClick={() => move(i, i + 1)} className="icon material-symbols-rounded text-base text-muted-foreground hover:text-foreground">arrow_forward</button>
                  <button type="button" aria-label={`Make ${LABEL[w.type]} wider`} onClick={() => patch(w.id, { span: Math.min(4, w.span + 1) as Widget["span"] })} className="icon material-symbols-rounded text-base text-muted-foreground hover:text-foreground">add</button>
                  <button type="button" aria-label={`Make ${LABEL[w.type]} narrower`} onClick={() => patch(w.id, { span: Math.max(1, w.span - 1) as Widget["span"] })} className="icon material-symbols-rounded text-base text-muted-foreground hover:text-foreground">remove</button>
                  <button type="button" aria-label={`Remove ${LABEL[w.type]}`} onClick={() => set({ widgets: dash.widgets.filter((x) => x.id !== w.id) })} className="icon material-symbols-rounded text-base text-muted-foreground hover:text-destructive">close</button>
                </div>
                <WidgetBody w={w} index={Math.max(kpiIndex, 0)} kpiStyle={dash.kpiStyle} />
              </article>
            );
          })}
        </div>
        {editing && dash.widgets.find((w) => w.id === editing) && (
          <WidgetEditor w={dash.widgets.find((w) => w.id === editing)!} onChange={(p) => patch(editing, p)} onClose={() => setEditing(null)} />
        )}
        {dash.widgets.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No widgets yet. Add one above.</p>}
      </Demo>
    </>
  );
}

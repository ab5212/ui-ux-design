import { useEffect, useState } from "react";
import { Demo } from "../Section";
import { Button } from "@/components/ui/Button";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";

export type WidgetType = "kpi" | "line" | "bar" | "table" | "activity" | "progress";
export interface Widget { id: string; type: WidgetType; span: 1 | 2 | 3 | 4 }
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

const LABEL: Record<WidgetType, string> = { kpi: "KPI card", line: "Line chart", bar: "Bar chart", table: "Table", activity: "Activity", progress: "Progress" };
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
    const k = KPIS[index % KPIS.length];
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
  if (w.type === "line") return (<><p className="text-sm font-medium">Revenue, last 12 months</p><Spark data={SERIES} className="mt-3 h-32" /></>);
  if (w.type === "bar") return (
    <>
      <p className="text-sm font-medium">Orders by day</p>
      <div className="mt-3 flex h-32 items-end gap-1.5" aria-hidden>
        {[40, 62, 48, 80, 66, 90, 54].map((h, i) => <div key={i} className="flex-1 rounded-t-sm bg-primary" style={{ height: `${h}%` }} />)}
      </div>
    </>
  );
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

/** Lay out a dashboard: grid size, KPI card style, which widgets, their order and width. Saved with "Save to code" as playground-layout.json. */
export function DashboardBuilder() {
  const [dash, setDash] = useState<Dash>(load);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
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
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(LABEL) as WidgetType[]).map((t) => (
                <Button key={t} variant="outline" size="sm" onClick={() => set({ widgets: [...dash.widgets, { id: uid(), type: t, span: t === "kpi" ? 1 : 2 }] })}>
                  <Icon name="add" /> {LABEL[t]}
                </Button>
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
                className={cn("group relative min-w-0 rounded-xl border bg-surface p-4 shadow-sm transition-opacity", dragFrom === i && "opacity-40")}>
                <div className="absolute end-2 top-2 flex items-center gap-0.5 rounded-md bg-surface/90 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
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
        {dash.widgets.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No widgets yet. Add one above.</p>}
      </Demo>
    </>
  );
}

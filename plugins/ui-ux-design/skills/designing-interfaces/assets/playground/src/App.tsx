import { useEffect, useState } from "react";
import { SlidersHorizontal } from "@/components/ui/icons";
import { useSettings } from "@/lib/settings";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { ToastProvider } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { Section } from "@/gallery/Section";
import { SaveBar, Toolbar } from "@/gallery/Toolbar";
import { AppPreview } from "@/gallery/AppPreview";
import { ElementPanel } from "@/gallery/ElementPanel";
import { LayersPanel } from "@/gallery/LayersPanel";
import { InsertPanel } from "@/gallery/InsertPanel";
import { useEdits, useOpsState, type Selection, type TreeNode } from "@/lib/edits";
import { ResponsivePreview } from "@/gallery/ResponsivePreview";
import { ColorFoundation } from "@/gallery/foundations/Color";
import { TypeFoundation } from "@/gallery/foundations/Type";
import { ElevationFoundation, MotionFoundation, RadiusFoundation, SpacingFoundation } from "@/gallery/foundations/Shape";
import { ButtonsDemo } from "@/gallery/sections/Actions";
import { FormsDemo } from "@/gallery/sections/Forms";
import { OverlaysDemo } from "@/gallery/sections/Overlays";
import { NavigationDemo } from "@/gallery/sections/Navigation";
import { DashboardBuilder } from "@/gallery/sections/Dashboard";
import { DataDemo, FeedbackDemo } from "@/gallery/sections/Data";
import SampleLayout from "@/frames/SampleLayout";

const SECTIONS = [
  { group: "Foundations", items: [["color", "Color"], ["type", "Typography"], ["spacing", "Spacing"], ["radius", "Radius"], ["elevation", "Elevation"], ["motion", "Motion"]] },
  { group: "Components", items: [["buttons", "Buttons and menus"], ["forms", "Forms"], ["overlays", "Dialogs and alerts"], ["navigation", "Navigation"], ["data", "Data display"], ["feedback", "Loading and empty"]] },
  { group: "Layout", items: [["dashboard", "Dashboard builder"], ["responsive", "Responsive"]] },
] as const;

export default function App() {
  const isFrame = new URLSearchParams(location.search).get("frame") === "layout";
  const [settings, update] = useSettings(!isFrame);
  const [active, setActive] = useState("color");
  const [view, setView] = useState<"playground" | "app">("playground");
  const { edits, set: setEdit, clear: clearEdits } = useEdits();
  const [editMode, setEditMode] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [panel, setPanel] = useState<"customize" | "element" | "layers" | "insert">("customize");
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [opsState, setOpsState] = useOpsState();

  useEffect(() => {
    const ids = SECTIONS.flatMap((g) => g.items.map(([id]) => id as string));
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-20% 0px -70% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [isFrame]);

  if (isFrame) return <SampleLayout />;

  return (
    <TooltipProvider>
      <ToastProvider>
        <a href="#main" className="sr-only z-(--z-tooltip) rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
          Skip to content
        </a>

        <header className="sticky top-0 z-(--z-sticky) border-b bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1680px] items-center gap-4 px-4 sm:px-6">
            <p className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                <span className="icon material-symbols-rounded text-base">palette</span>
              </span>
              UI Playground
            </p>
            <div role="radiogroup" aria-label="Preview" className="ms-4 inline-flex gap-1 rounded-lg bg-muted p-1">
              {([["playground", "Playground"], ["app", "Your app"]] as const).map(([v, label]) => (
                <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)}
                  className={`h-8 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${view === v ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="ms-auto xl:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><SlidersHorizontal aria-hidden /> Customize</Button>
                </DialogTrigger>
                <DialogContent title="Customize" description="Applies to the whole playground and the viewport preview.">
                  <Toolbar settings={settings} update={update} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1680px] gap-8 px-4 sm:px-6">
          {view === "playground" && <nav aria-label="Sections" className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto py-8 lg:block">
            {SECTIONS.map((g) => (
              <div key={g.group} className="mb-6">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">{g.group}</p>
                <ul className="grid gap-0.5">
                  {g.items.map(([id, label]) => (
                    <li key={id}>
                      <a href={`#${id}`} aria-current={active === id ? "true" : undefined} className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground aria-[current]:bg-primary/10 aria-[current]:font-medium aria-[current]:text-primary">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>}

          {view === "app" ? <AppPreview settings={settings} edits={edits} editMode={editMode} setEditMode={(on) => { setEditMode(on); setPanel(on ? "element" : "customize"); if (!on) setSelection(null); }} onSelect={(sel) => { setSelection(sel); if (sel && panel === "customize") setPanel("element"); }}
          onTree={setTree} onOps={setOpsState} ops={opsState}
          onStyle={(selector, props) => Object.entries(props).forEach(([k, v]) => setEdit(selector, k, v))} /> : <main id="main" className="min-w-0 flex-1 pb-24 pt-6">
            <div className="mb-6 lg:hidden">
              <label htmlFor="jump" className="sr-only">Jump to section</label>
              <select id="jump" className="h-10 w-full rounded-md border border-input bg-surface px-3 text-base"
                onChange={(e) => { location.hash = e.target.value; }} defaultValue="">
                <option value="" disabled>Jump to section…</option>
                {SECTIONS.flatMap((g) => g.items.map(([id, label]) => <option key={id} value={id}>{g.group}: {label}</option>))}
              </select>
            </div>

            <Section id="color" title="Color" intro="Semantic OKLCH tokens. Change the brand hue in the settings and watch every pair re-measure.">
              <ColorFoundation />
            </Section>
            <Section id="type" title="Typography" intro="16px body, a 1.25 ratio, at most three weights, lines capped near 65 characters.">
              <TypeFoundation />
            </Section>
            <Section id="spacing" title="Spacing" intro="Everything snaps to a 4px scale.">
              <SpacingFoundation />
            </Section>
            <Section id="radius" title="Radius" intro="One radius family per product. Nested corners stay parallel when outer = inner + padding.">
              <RadiusFoundation />
            </Section>
            <Section id="elevation" title="Elevation" intro="Choose shadow-led or border-led depth, not both at full strength.">
              <ElevationFoundation />
            </Section>
            <Section id="motion" title="Motion" intro="Short, purposeful, transform and opacity only, and off when the user asks for reduced motion.">
              <MotionFoundation />
            </Section>
            <Section id="buttons" title="Buttons and menus" intro="Hierarchy by importance: one primary per view.">
              <ButtonsDemo />
            </Section>
            <Section id="forms" title="Forms" intro="Labels above, hints and errors below, correct keyboards and autocomplete on every field.">
              <FormsDemo />
            </Section>
            <Section id="overlays" title="Dialogs and alerts" intro="Dialogs trap focus and return it. On phones they open as bottom sheets.">
              <OverlaysDemo />
            </Section>
            <Section id="navigation" title="Navigation" intro="Tabs, accordion, breadcrumbs and pagination with their keyboard patterns.">
              <NavigationDemo />
            </Section>
            <Section id="data" title="Data display" intro="Tables that become cards on phones, cards with a single stretched link, status badges with text.">
              <DataDemo />
            </Section>
            <Section id="feedback" title="Loading and empty states" intro="Feedback that matches the wait, and empty states that point to the next step.">
              <FeedbackDemo />
            </Section>
            <Section id="dashboard" title="Dashboard builder" intro="Choose how KPI cards, charts and tables are laid out: grid size, card style, which widgets, their order and width. They use your colors, radius and fonts.">
              <DashboardBuilder />
            </Section>
            <Section id="responsive" title="Responsive" intro="The same sample app at five real viewport widths, using your current theme, density, radius and hue.">
              <ResponsivePreview settings={settings} />
            </Section>
          </main>}

          <aside aria-label="Customize" className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 overflow-y-auto border-s bg-surface px-5 pt-6 xl:block">
            {view === "app" ? (
              <div role="tablist" aria-label="Panel" className="mb-5 inline-flex gap-1 rounded-lg bg-muted p-1">
                {([["customize", "Customize"], ["element", "Element"], ["layers", "Layers"], ["insert", "Insert"]] as const).map(([k, label]) => (
                  <button key={k} type="button" role="tab" aria-selected={panel === k} onClick={() => setPanel(k)}
                    className={`h-8 rounded-md px-2 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-ring ${panel === k ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>
                ))}
              </div>
            ) : <h2 className="mb-5 text-base font-semibold">Customize</h2>}
            {view === "app" && panel === "element"
              ? <ElementPanel selection={selection} edits={edits} set={setEdit} clear={clearEdits} />
              : view === "app" && panel === "layers" ? <LayersPanel tree={tree} selected={selection?.multiIds ?? []} />
              : view === "app" && panel === "insert" ? <InsertPanel selection={selection} />
              : <Toolbar settings={settings} update={update} footer={false} />}
            <SaveBar settings={settings} />
          </aside>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}

import { SlidersHorizontal } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { ToastProvider } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { Section } from "@/gallery/Section";
import { Toolbar } from "@/gallery/Toolbar";
import { ResponsivePreview } from "@/gallery/ResponsivePreview";
import { ColorFoundation } from "@/gallery/foundations/Color";
import { TypeFoundation } from "@/gallery/foundations/Type";
import { ElevationFoundation, MotionFoundation, RadiusFoundation, SpacingFoundation } from "@/gallery/foundations/Shape";
import { ButtonsDemo } from "@/gallery/sections/Actions";
import { FormsDemo } from "@/gallery/sections/Forms";
import { OverlaysDemo } from "@/gallery/sections/Overlays";
import { NavigationDemo } from "@/gallery/sections/Navigation";
import { DataDemo, FeedbackDemo } from "@/gallery/sections/Data";
import SampleLayout from "@/frames/SampleLayout";

const SECTIONS = [
  { group: "Foundations", items: [["color", "Color"], ["type", "Typography"], ["spacing", "Spacing"], ["radius", "Radius"], ["elevation", "Elevation"], ["motion", "Motion"]] },
  { group: "Components", items: [["buttons", "Buttons and menus"], ["forms", "Forms"], ["overlays", "Dialogs and alerts"], ["navigation", "Navigation"], ["data", "Data display"], ["feedback", "Loading and empty"]] },
  { group: "Layout", items: [["responsive", "Responsive"]] },
] as const;

export default function App() {
  const isFrame = new URLSearchParams(location.search).get("frame") === "layout";
  const [settings, update] = useSettings(!isFrame);

  if (isFrame) return <SampleLayout />;

  return (
    <TooltipProvider>
      <ToastProvider>
        <a href="#main" className="sr-only z-(--z-tooltip) rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
          Skip to content
        </a>

        <header className="sticky top-0 z-(--z-sticky) border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
            <p className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="grid size-6 place-items-center rounded-md bg-primary">
                <span className="size-3 rounded-[3px] bg-primary-foreground" />
              </span>
              UI Playground
            </p>
            <span className="hidden text-sm text-muted-foreground md:inline">Tokens and components from the designing-interfaces skill</span>
            <div className="ms-auto xl:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><SlidersHorizontal aria-hidden /> Display settings</Button>
                </DialogTrigger>
                <DialogContent title="Display settings" description="Applies to the whole playground and the viewport preview.">
                  <Toolbar settings={settings} update={update} className="flex-col items-start" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="hidden border-t xl:block">
            <Toolbar settings={settings} update={update} className="mx-auto max-w-[1400px] px-6 py-3" />
          </div>
        </header>

        <div className="mx-auto flex max-w-[1400px] gap-10 px-4 sm:px-6">
          <nav aria-label="Sections" className="sticky top-36 hidden h-[calc(100dvh-10rem)] w-52 shrink-0 overflow-y-auto py-8 lg:block">
            {SECTIONS.map((g) => (
              <div key={g.group} className="mb-6">
                <p className="mb-2 px-2 text-sm font-semibold">{g.group}</p>
                <ul className="grid gap-0.5">
                  {g.items.map(([id, label]) => (
                    <li key={id}>
                      <a href={`#${id}`} className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <main id="main" className="min-w-0 flex-1 pb-24 pt-6">
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
            <Section id="responsive" title="Responsive" intro="The same sample app at five real viewport widths, using your current theme, density, radius and hue.">
              <ResponsivePreview settings={settings} />
            </Section>
          </main>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}

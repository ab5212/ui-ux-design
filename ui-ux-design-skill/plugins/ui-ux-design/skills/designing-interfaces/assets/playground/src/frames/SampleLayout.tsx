import { useEffect, useState } from "react";
import { BarChart3, Bell, FileText, Home, Menu, Plus, Settings, Users, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Display";
import { cn } from "@/lib/cn";

/**
 * A sample app shell that adapts per size class:
 *   compact  (<640)      top bar + bottom navigation, cards, sticky primary action
 *   medium   (640–1023)  navigation rail, two-column cards
 *   expanded (≥1024)     sidebar, list + detail side by side
 *   large    (≥1536)     content capped and centered
 * Rendered inside the responsive preview iframes (?frame=layout).
 */
const NAV = [
  { label: "Home", icon: Home },
  { label: "Projects", icon: FileText },
  { label: "Team", icon: Users },
  { label: "Reports", icon: BarChart3 },
];
const PROJECTS = [
  { name: "Brand refresh", owner: "Ana Ruiz", status: "On track", tone: "success" },
  { name: "Billing migration", owner: "Kenji Sato", status: "At risk", tone: "warning" },
  { name: "Mobile onboarding", owner: "Priya Nair", status: "Planned", tone: "neutral" },
  { name: "Partner portal", owner: "Tom Okafor", status: "On track", tone: "success" },
] as const;

export default function SampleLayout() {
  const [selected, setSelected] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const p = PROJECTS[selected];

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Medium: rail */}
      <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center gap-1 border-e bg-surface py-4 sm:flex lg:hidden">
        <Button size="icon" aria-label="New project" className="mb-4"><Plus aria-hidden /></Button>
        {NAV.map((n, i) => (
          <a key={n.label} href="#" aria-current={i === 1 ? "page" : undefined}
            className={cn("grid w-16 justify-items-center gap-1 rounded-lg py-2 text-xs", i === 1 ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <span className={cn("grid h-8 w-14 place-items-center rounded-full", i === 1 && "bg-accent text-accent-foreground")}><n.icon aria-hidden className="size-5" /></span>
            {n.label}
          </a>
        ))}
      </nav>

      {/* Expanded: sidebar */}
      <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 border-e bg-surface p-3 lg:flex">
        <p className="px-2 py-2 text-sm font-semibold">Acme workspace</p>
        {NAV.map((n, i) => (
          <a key={n.label} href="#" aria-current={i === 1 ? "page" : undefined}
            className={cn("flex h-9 items-center gap-2 rounded-md px-2 text-sm", i === 1 ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
            <n.icon aria-hidden className="size-4" /> {n.label}
          </a>
        ))}
        <a href="#" className="mt-auto flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted"><Settings aria-hidden className="size-4" /> Settings</a>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur pt-[env(safe-area-inset-top)] sm:h-16 sm:px-6">
          <Button variant="ghost" size="icon" aria-label="Open menu" aria-expanded={drawer} className="-ms-2 sm:hidden" onClick={() => setDrawer(true)}><Menu aria-hidden /></Button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">Projects</h1>
          <Button variant="ghost" size="icon" aria-label="Notifications"><Bell aria-hidden /></Button>
          <Button className="hidden sm:inline-flex"><Plus aria-hidden /> New project</Button>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 pb-28 sm:p-6 sm:pb-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            {/* List: cards on compact/medium, selectable list on expanded */}
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="Projects">
              {PROJECTS.map((x, i) => (
                <li key={x.name}>
                  <button type="button" onClick={() => setSelected(i)} aria-current={i === selected ? "true" : undefined}
                    className={cn("grid w-full gap-2 rounded-xl border bg-surface p-4 text-start focus-visible:outline-2 focus-visible:outline-ring",
                      i === selected ? "lg:border-primary lg:ring-1 lg:ring-primary" : "hover:border-input")}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{x.name}</span>
                      <Badge tone={x.tone} dot>{x.status}</Badge>
                    </span>
                    <span className="text-sm text-muted-foreground">Owner: {x.owner}</span>
                  </button>
                </li>
              ))}
            </ul>
            {/* Detail: only beside the list on expanded screens */}
            <section aria-label="Project detail" className="hidden rounded-xl border bg-surface p-6 lg:block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.01em]">{p.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Owned by {p.owner}</p>
                </div>
                <Badge tone={p.tone} dot>{p.status}</Badge>
              </div>
              <p className="mt-6 max-w-[65ch] text-muted-foreground">
                On expanded screens the list and the detail sit side by side. On smaller screens selecting a project would open this view as its own page.
              </p>
            </section>
          </div>
        </main>

        {/* Compact: sticky primary action above the bottom navigation */}
        <div className="fixed inset-x-0 bottom-16 z-(--z-sticky) px-4 pb-3 sm:hidden">
          <Button size="lg" className="w-full shadow-lg"><Plus aria-hidden /> New project</Button>
        </div>
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-(--z-sticky) grid h-16 grid-cols-4 border-t bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
          {NAV.map((n, i) => (
            <a key={n.label} href="#" aria-current={i === 1 ? "page" : undefined}
              className={cn("grid content-center justify-items-center gap-0.5 text-xs", i === 1 ? "font-medium text-primary" : "text-muted-foreground")}>
              <n.icon aria-hidden className="size-5" />{n.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Compact: drawer for secondary navigation */}
      {drawer && (
        <div className="fixed inset-0 z-(--z-modal) sm:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="anim-overlay absolute inset-0 bg-black/50" data-state="open" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col gap-1 bg-surface-raised p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="px-2 font-semibold">Acme workspace</p>
              <Button variant="ghost" size="icon" aria-label="Close menu" autoFocus onClick={() => setDrawer(false)}><X aria-hidden /></Button>
            </div>
            {["Settings", "Billing", "Help center", "Sign out"].map((l) => (
              <a key={l} href="#" className="flex h-11 items-center rounded-md px-2 text-sm hover:bg-muted">{l}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

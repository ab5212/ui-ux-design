import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Display";
import { cn } from "@/lib/cn";
import { Demo } from "../Section";

export function NavigationDemo() {
  const [page, setPage] = useState(5);
  const total = 20;
  const pages = [1, page - 1, page, page + 1, total].filter((p, i, a) => p >= 1 && p <= total && a.indexOf(p) === i).sort((a, b) => a - b);

  return (
    <>
      <Demo title="Tabs" note="Arrow keys move between tabs (roving tabindex). Scrolls horizontally on narrow screens.">
        <div className="grid grid-cols-1 gap-8">
          <Tabs defaultValue="overview">
            <TabsList aria-label="Project sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity <Badge className="h-5 px-1.5">12</Badge></TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><p className="text-sm text-muted-foreground">Overview panel. Sync the active tab to the URL so it survives reloads.</p></TabsContent>
            <TabsContent value="activity"><p className="text-sm text-muted-foreground">12 new events this week.</p></TabsContent>
            <TabsContent value="members"><p className="text-sm text-muted-foreground">8 members, 2 pending invitations.</p></TabsContent>
            <TabsContent value="settings"><p className="text-sm text-muted-foreground">Project settings.</p></TabsContent>
          </Tabs>
          <Tabs defaultValue="week">
            <TabsList variant="segmented" aria-label="Range">
              <TabsTrigger variant="segmented" value="day">Day</TabsTrigger>
              <TabsTrigger variant="segmented" value="week">Week</TabsTrigger>
              <TabsTrigger variant="segmented" value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Demo>

      <Demo title="Accordion" note="Header is a button inside a heading; several items can be open.">
        <Accordion
          items={[
            { id: "a", title: "Can I change plans later?", content: "Yes. Upgrades apply immediately; downgrades apply at the next billing date." },
            { id: "b", title: "Do you offer refunds?", content: "Annual plans can be refunded within 30 days of purchase." },
            { id: "c", title: "Where is data stored?", content: "In the region you choose when creating the workspace." },
          ]}
        />
      </Demo>

      <Demo title="Breadcrumbs and pagination" note="Current location uses aria-current; pagination keeps first and last pages.">
        <div className="grid gap-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li><a href="#navigation" className="hover:text-foreground hover:underline">Workspace</a></li>
              <li aria-hidden>/</li>
              <li><a href="#navigation" className="hover:text-foreground hover:underline">Projects</a></li>
              <li aria-hidden>/</li>
              <li><span aria-current="page" className="font-medium text-foreground">Q3 report</span></li>
            </ol>
          </nav>
          <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm hover:bg-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <ChevronLeft aria-hidden className="text-base" /> Previous
            </button>
            {pages.map((p, i) => (
              <span key={p} className="contents">
                {i > 0 && p - pages[i - 1] > 1 && <span aria-hidden className="px-1 text-muted-foreground">…</span>}
                <button
                  type="button"
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  onClick={() => setPage(p)}
                  className={cn(
                    "hidden h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm tabular-nums sm:inline-flex focus-visible:outline-2 focus-visible:outline-ring",
                    p === page ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  {p}
                </button>
              </span>
            ))}
            <span className="px-2 text-sm text-muted-foreground sm:hidden">Page {page} of {total}</span>
            <button
              type="button"
              disabled={page === total}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm hover:bg-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring"
            >
              Next <ChevronRight aria-hidden className="text-base" />
            </button>
          </nav>
        </div>
      </Demo>
    </>
  );
}

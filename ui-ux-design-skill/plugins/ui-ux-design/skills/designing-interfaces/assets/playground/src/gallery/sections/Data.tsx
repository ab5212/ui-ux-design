import { useState } from "react";
import { ArrowDown, ArrowUp, FolderPlus, MoreHorizontal } from "lucide-react";
import { Avatar, Badge, Progress, Skeleton, Spinner } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Demo } from "../Section";

type Row = { id: string; customer: string; status: "Paid" | "Pending" | "Overdue"; amount: number; date: string };
const ROWS: Row[] = [
  { id: "INV-2041", customer: "Northwind Traders", status: "Paid", amount: 1204, date: "2026-10-02" },
  { id: "INV-2042", customer: "Blue Heron Studio", status: "Pending", amount: 88.5, date: "2026-10-05" },
  { id: "INV-2043", customer: "Oakline Logistics", status: "Overdue", amount: 3420.75, date: "2026-09-21" },
  { id: "INV-2044", customer: "Juniper & Co.", status: "Paid", amount: 349.99, date: "2026-10-11" },
];
const tone = { Paid: "success", Pending: "info", Overdue: "destructive" } as const;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function DataDemo() {
  const [dir, setDir] = useState<"ascending" | "descending">("descending");
  const rows = [...ROWS].sort((a, b) => (dir === "ascending" ? a.amount - b.amount : b.amount - a.amount));
  const SortIcon = dir === "ascending" ? ArrowUp : ArrowDown;

  return (
    <>
      <Demo title="Data table" note="Under 640px rows become cards. Numbers right-aligned and tabular.">
        {/* Expanded: real table */}
        <div className="hidden overflow-x-auto sm:block" role="region" aria-label="Invoices" tabIndex={0}>
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Invoices, sortable by amount</caption>
            <thead>
              <tr className="border-b text-muted-foreground">
                <th scope="col" className="h-(--row-h) px-3 text-start font-medium">Invoice</th>
                <th scope="col" className="px-3 text-start font-medium">Customer</th>
                <th scope="col" className="px-3 text-start font-medium">Status</th>
                <th scope="col" className="px-3 text-start font-medium">Date</th>
                <th scope="col" aria-sort={dir} className="px-3 text-end font-medium">
                  <button
                    type="button"
                    onClick={() => setDir((d) => (d === "ascending" ? "descending" : "ascending"))}
                    className="-me-2 inline-flex items-center gap-1 rounded-sm px-2 py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    Amount <SortIcon aria-hidden className="size-3.5" />
                  </button>
                </th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="h-(--row-h) px-3 font-mono text-xs">{r.id}</td>
                  <td className="px-3">{r.customer}</td>
                  <td className="px-3"><Badge tone={tone[r.status]} dot>{r.status}</Badge></td>
                  <td className="px-3 text-muted-foreground">{date.format(new Date(r.date))}</td>
                  <td className="px-3 text-end tabular-nums">{money.format(r.amount)}</td>
                  <td className="w-10 px-1 text-end">
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.id}`}><MoreHorizontal aria-hidden /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Compact: one card per record */}
        <ul className="grid gap-3 sm:hidden" aria-label="Invoices">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.customer}</p>
                  <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                </div>
                <Badge tone={tone[r.status]} dot>{r.status}</Badge>
              </div>
              <div className="mt-3 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{date.format(new Date(r.date))}</span>
                <span className="font-medium tabular-nums">{money.format(r.amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      </Demo>

      <Demo title="Cards, badges, avatars" note="Clickable card: the title link stretches over the card; secondary actions sit above it.">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["Brand refresh", "Billing migration", "Mobile onboarding"].map((t, i) => (
              <article key={t} className="relative rounded-xl border bg-surface p-5 transition-colors duration-(--duration-fast) hover:border-input">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={(["success", "warning", "neutral"] as const)[i]} dot>{["On track", "At risk", "Planned"][i]}</Badge>
                  <span className="text-xs text-muted-foreground">Due Nov {12 + i * 6}</span>
                </div>
                <h4 className="mt-3 font-semibold">
                  <a href="#data" className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring">{t}</a>
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">{[8, 3, 0][i]} of {[10, 9, 6][i]} tasks complete</p>
                <div className="mt-4 flex -space-x-2">
                  {["Ana Ruiz", "Kenji Sato", "Priya Nair"].slice(0, 3 - i).map((n) => (
                    <span key={n} className="rounded-full ring-2 ring-surface"><Avatar name={n} size={32} /></span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Draft</Badge>
            <Badge tone="info" dot>In review</Badge>
            <Badge tone="success" dot>Published</Badge>
            <Badge tone="warning" dot>Expiring</Badge>
            <Badge tone="destructive" dot>Failed</Badge>
            <Badge tone="primary">New</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name="Ana Ruiz" size={24} />
            <Avatar name="Kenji Sato" size={32} />
            <Avatar name="Priya Nair" size={40} />
            <Avatar name="Tom Okafor" size={48} />
            <Avatar name="Acme Inc" size={40} square />
          </div>
        </div>
      </Demo>
    </>
  );
}

export function FeedbackDemo() {
  return (
    <>
      <Demo title="Loading" note="Nothing under 300ms; skeleton when the layout is known; progress for long tasks.">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="grid gap-4" aria-busy="true" aria-label="Loading project">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <div className="grid content-start gap-5">
            <Progress label="Uploading 3 files" value={64} />
            <Progress label="Preparing export" />
            <Spinner label="Loading invoices" />
          </div>
        </div>
      </Demo>
      <Demo title="Empty state" note="What goes here, and the one action that fills it." className="py-12">
        <div className="mx-auto grid max-w-sm justify-items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
            <FolderPlus aria-hidden className="size-6" />
          </span>
          <h4 className="text-lg font-semibold">No projects yet</h4>
          <p className="text-sm text-muted-foreground">Projects group your files, tasks and people. Create one to get started, or import from a CSV.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button>Create project</Button>
            <Button variant="ghost">Import CSV</Button>
          </div>
        </div>
      </Demo>
    </>
  );
}

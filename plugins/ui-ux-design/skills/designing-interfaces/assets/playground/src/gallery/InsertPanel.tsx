import { useState } from "react";
import { cmd, type Selection } from "@/lib/edits";
import { GROUPS, LIBRARY } from "@/lib/library";
import { cn } from "@/lib/cn";

/** Everything the user can add to the running app. Click one: it goes inside the selected container, or after the selected element. */
export function InsertPanel({ selection }: { selection: Selection | null }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("All");
  const items = LIBRARY.filter((i) => (group === "All" || i.group === group) && i.label.toLowerCase().includes(q.toLowerCase()));
  const dest = !selection ? "the end of the page" : selection.container && !["button", "a", "summary"].includes(selection.tag) ? `inside ${selection.label}` : `after ${selection.label}`;
  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">Adds to <strong className="text-foreground">{dest}</strong>. Select a container first to choose where.</p>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components" aria-label="Search components"
        className="h-10 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
      <div className="flex flex-wrap gap-1" role="group" aria-label="Category">
        {["All", ...GROUPS].map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}
            className={cn("h-7 rounded-full px-3 text-xs font-medium", group === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{g}</button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {items.map((i) => (
          <li key={i.kind}>
            <button type="button" onClick={() => cmd({ cmd: "insert", html: i.html, kind: i.label })}
              className="flex h-full w-full flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 text-center text-xs font-medium hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring">
              <span aria-hidden className="icon material-symbols-rounded text-2xl text-primary">{i.icon}</span>{i.label}
            </button>
          </li>
        ))}
      </ul>
      {!items.length && <p className="text-sm text-muted-foreground">Nothing matches.</p>}
    </div>
  );
}

import { useState } from "react";
import { cmd, type TreeNode } from "@/lib/edits";
import { cn } from "@/lib/cn";

type Over = { id: number; pos: "before" | "after" | "inside" } | null;
const ICON: Record<string, string> = { Button: "smart_button", Heading: "title", Text: "notes", Image: "image", Input: "edit_note", Icon: "star", List: "format_list_bulleted", "List item": "horizontal_rule", Link: "link", Card: "crop_square", Table: "table", Group: "folder", "Kebab menu": "more_vert", Navigation: "menu", Header: "web_asset", Footer: "web_asset", Select: "arrow_drop_down_circle" };

function Row({ node, depth, selected, collapsed, toggle, over, setOver, drag, setDrag }: {
  node: TreeNode; depth: number; selected: number | null; collapsed: Set<number>; toggle: (id: number) => void;
  over: Over; setOver: (o: Over) => void; drag: number | null; setDrag: (id: number | null) => void;
}) {
  const open = !collapsed.has(node.id), has = node.children.length > 0;
  const zone = (e: React.DragEvent) => { const r = e.currentTarget.getBoundingClientRect(), y = (e.clientY - r.top) / r.height; return y < 0.28 ? "before" : y > 0.72 ? "after" : "inside"; };
  return (
    <li>
      <div role="treeitem" aria-selected={selected === node.id} aria-expanded={has ? open : undefined} draggable
        onDragStart={() => setDrag(node.id)} onDragEnd={() => { setDrag(null); setOver(null); }}
        onDragOver={(e) => { if (drag !== null && drag !== node.id) { e.preventDefault(); setOver({ id: node.id, pos: zone(e) }); } }}
        onDrop={(e) => { e.preventDefault(); if (drag !== null && over) cmd({ cmd: "move", id: drag, targetId: node.id, pos: over.pos }); setDrag(null); setOver(null); }}
        onClick={() => cmd({ cmd: "select", id: node.id })}
        style={{ paddingInlineStart: 4 + depth * 14 }}
        className={cn("group relative flex h-8 cursor-pointer items-center gap-1 rounded-md pe-1 text-sm hover:bg-muted",
          selected === node.id && "bg-primary/10 font-medium text-primary", drag === node.id && "opacity-40", node.hidden && "opacity-50",
          over?.id === node.id && over.pos === "inside" && "ring-2 ring-primary",
          over?.id === node.id && over.pos === "before" && "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary",
          over?.id === node.id && over.pos === "after" && "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary")}>
        <button type="button" aria-label={open ? "Collapse" : "Expand"} onClick={(e) => { e.stopPropagation(); toggle(node.id); }} className={cn("grid size-5 place-items-center", !has && "invisible")}>
          <span aria-hidden className="icon material-symbols-rounded text-base">{open ? "expand_more" : "chevron_right"}</span>
        </button>
        <span aria-hidden className="icon material-symbols-rounded text-base text-muted-foreground">{ICON[node.name] ?? "check_box_outline_blank"}</span>
        <span className="min-w-0 flex-1 truncate">{node.text || node.name}{node.text && <span className="ms-1 text-xs text-muted-foreground">{node.name}</span>}</span>
        <button type="button" aria-label={node.hidden ? "Show" : "Hide"} onClick={(e) => { e.stopPropagation(); cmd({ cmd: "hide", id: node.id }); }} className="hidden size-6 place-items-center text-muted-foreground hover:text-foreground group-hover:grid">
          <span aria-hidden className="icon material-symbols-rounded text-base">{node.hidden ? "visibility_off" : "visibility"}</span>
        </button>
        <button type="button" aria-label="Delete" onClick={(e) => { e.stopPropagation(); cmd({ cmd: "delete", id: node.id }); }} className="hidden size-6 place-items-center text-muted-foreground hover:text-destructive group-hover:grid">
          <span aria-hidden className="icon material-symbols-rounded text-base">delete</span>
        </button>
      </div>
      {has && open && <ul role="group">{node.children.map((c) => <Row key={c.id} node={c} depth={depth + 1} selected={selected} collapsed={collapsed} toggle={toggle} over={over} setOver={setOver} drag={drag} setDrag={setDrag} />)}</ul>}
    </li>
  );
}

/** Every element of the running app as a tree. Click to select; drag a row onto another to reorder or move it inside. */
export function LayersPanel({ tree, selected }: { tree: TreeNode[]; selected: number | null }) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [over, setOver] = useState<Over>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const toggle = (id: number) => setCollapsed((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  if (!tree.length) return <p className="text-sm text-muted-foreground">Turn on <strong className="text-foreground">Edit elements</strong> to see the structure of your app.</p>;
  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">Click to select. Drag a row to reorder it, or onto the middle of another row to move it inside.</p>
      <ul role="tree" aria-label="Layers" className="-mx-1">
        {tree.map((n) => <Row key={n.id} node={n} depth={0} selected={selected} collapsed={collapsed} toggle={toggle} over={over} setOver={setOver} drag={drag} setDrag={setDrag} />)}
      </ul>
    </div>
  );
}

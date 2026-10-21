import { CHARTS, SAMPLE, SAMPLE_PARTS } from "@/lib/charts";

// Everything the Insert panel can drop into the user's running app. HTML with inline styles that read the app's tokens.
export interface Item { kind: string; label: string; icon: string; group: "Basics" | "Layout" | "Forms" | "Navigation" | "Data" | "Charts"; html: string }

const S = {
  surface: "background:var(--surface,#fff);color:var(--foreground,#111);border:1px solid var(--border,#e5e7eb);border-radius:var(--radius,8px)",
  btn: "display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:8px 16px;border:0;border-radius:var(--radius,8px);font:inherit;font-weight:600;cursor:pointer",
};
const card = (title: string, body: string) => `<div style="${S.surface};padding:16px"><p style="margin:0 0 8px;font-size:14px;font-weight:600">${title}</p>${body}</div>`;
const icon = (name: string, size = 24) => `<span class="material-symbols-rounded" aria-hidden="true" style="font-size:${size}px;line-height:1;width:1em;height:1em;overflow:hidden;flex-shrink:0">${name}</span>`;
const menuItem = (label: string, ic: string) => `<li role="menuitem" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;cursor:pointer;white-space:nowrap">${icon(ic, 18)}${label}</li>`;
const kebab = `<details class="pg-kebab" style="position:relative;display:inline-block"><summary aria-label="More actions" style="cursor:pointer;display:inline-grid;place-items:center;width:32px;height:32px;border-radius:var(--radius,8px)">${icon("more_vert")}</summary><ul role="menu" style="position:absolute;right:0;top:100%;z-index:10;margin:4px 0 0;padding:4px;list-style:none;min-width:160px;${S.surface};box-shadow:0 8px 24px rgb(0 0 0/.15)">${menuItem("Edit", "edit")}${menuItem("Duplicate", "content_copy")}${menuItem("Delete", "delete")}</ul></details>`;
const stat = (label: string, value: string, delta: string, ic: string) => `<div style="${S.surface};padding:16px;display:flex;gap:12px;align-items:flex-start"><span style="display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:var(--accent,#eef2ff);color:var(--accent-foreground,#3730a3)">${icon(ic, 20)}</span><div><p style="margin:0;font-size:14px;opacity:.65">${label}</p><p style="margin:4px 0 0;font-size:24px;font-weight:600;letter-spacing:-.01em">${value}</p><p style="margin:4px 0 0;font-size:12px;font-weight:500;color:var(--success,#16a34a)">${delta}</p></div></div>`;

const chart = (kind: keyof typeof CHARTS, label: string, ic: string, title: string, data = SAMPLE): Item => ({ kind: `chart-${kind}`, label, icon: ic, group: "Charts", html: card(title, CHARTS[kind](data)) });

export const LIBRARY: Item[] = [
  { kind: "heading", label: "Heading", icon: "title", group: "Basics", html: `<h2 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-.01em">Heading</h2>` },
  { kind: "text", label: "Text", icon: "notes", group: "Basics", html: `<p style="margin:0;font-size:16px;line-height:1.5">Write something here.</p>` },
  { kind: "button", label: "Button", icon: "smart_button", group: "Basics", html: `<button type="button" style="${S.btn};background:var(--primary,#2563eb);color:var(--primary-foreground,#fff)">Button</button>` },
  { kind: "icon", label: "Icon", icon: "star", group: "Basics", html: icon("star") },
  { kind: "image", label: "Image", icon: "image", group: "Basics", html: `<div role="img" aria-label="Image placeholder" style="display:grid;place-items:center;width:100%;aspect-ratio:16/9;background:var(--muted,#f3f4f6);color:var(--muted-foreground,#6b7280);border-radius:var(--radius,8px)">${icon("image", 32)}</div>` },
  { kind: "badge", label: "Badge", icon: "label", group: "Basics", html: `<span style="display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:999px;background:var(--accent,#eef2ff);color:var(--accent-foreground,#3730a3);font-size:12px;font-weight:500">Badge</span>` },
  { kind: "avatar", label: "Avatar", icon: "account_circle", group: "Basics", html: `<span style="display:inline-grid;place-items:center;width:40px;height:40px;border-radius:999px;background:var(--secondary,#e5e7eb);color:var(--secondary-foreground,#111);font-weight:600">AB</span>` },
  { kind: "divider", label: "Divider", icon: "horizontal_rule", group: "Basics", html: `<hr style="border:0;border-top:1px solid var(--border,#e5e7eb);margin:8px 0;width:100%">` },
  { kind: "row", label: "Row", icon: "view_column", group: "Layout", html: `<div data-pg-group style="display:flex;flex-direction:row;gap:8px;align-items:center"></div>` },
  { kind: "column", label: "Column", icon: "view_agenda", group: "Layout", html: `<div data-pg-group style="display:flex;flex-direction:column;gap:8px"></div>` },
  { kind: "card", label: "Card", icon: "crop_square", group: "Layout", html: `<div style="${S.surface};padding:16px;display:flex;flex-direction:column;gap:8px"><p style="margin:0;font-weight:600">Card title</p><p style="margin:0;opacity:.7;font-size:14px">Card content</p></div>` },
  { kind: "input", label: "Input", icon: "edit_note", group: "Forms", html: `<label style="display:grid;gap:6px;font-size:14px;font-weight:500">Label<input type="text" placeholder="Type here" style="height:40px;padding:0 12px;font:inherit;background:var(--surface,#fff);color:var(--foreground,#111);border:1px solid var(--input,#9ca3af);border-radius:var(--radius,8px)"></label>` },
  { kind: "select", label: "Dropdown", icon: "arrow_drop_down_circle", group: "Forms", html: `<label style="display:grid;gap:6px;font-size:14px;font-weight:500">Label<select style="height:40px;padding:0 12px;font:inherit;background:var(--surface,#fff);color:var(--foreground,#111);border:1px solid var(--input,#9ca3af);border-radius:var(--radius,8px)"><option>Option 1</option><option>Option 2</option></select></label>` },
  { kind: "checkbox", label: "Checkbox", icon: "check_box", group: "Forms", html: `<label style="display:inline-flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" style="width:18px;height:18px;accent-color:var(--primary,#2563eb)">Checkbox</label>` },
  { kind: "switch", label: "Toggle", icon: "toggle_on", group: "Forms", html: `<label style="display:inline-flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" role="switch" checked style="width:40px;height:22px;accent-color:var(--primary,#2563eb)">Toggle</label>` },
  { kind: "kebab", label: "Kebab menu", icon: "more_vert", group: "Navigation", html: kebab },
  { kind: "tabs", label: "Tabs", icon: "tab", group: "Navigation", html: `<div role="tablist" style="display:flex;gap:4px;border-bottom:1px solid var(--border,#e5e7eb)">${["Overview", "Reports", "Settings"].map((t, i) => `<button role="tab" aria-selected="${i === 0}" style="padding:10px 14px;border:0;background:none;font:inherit;font-weight:500;color:${i === 0 ? "var(--primary,#2563eb)" : "inherit"};opacity:${i === 0 ? 1 : 0.7};border-bottom:2px solid ${i === 0 ? "var(--primary,#2563eb)" : "transparent"};cursor:pointer">${t}</button>`).join("")}</div>` },
  { kind: "breadcrumb", label: "Breadcrumb", icon: "chevron_right", group: "Navigation", html: `<nav aria-label="Breadcrumb" style="display:flex;align-items:center;gap:4px;font-size:14px;opacity:.8">Home${icon("chevron_right", 18)}Projects${icon("chevron_right", 18)}<strong>Details</strong></nav>` },
  { kind: "stat", label: "KPI card", icon: "speed", group: "Data", html: stat("Revenue", "$48.2k", "+12% vs last month", "payments") },
  { kind: "table", label: "Table", icon: "table", group: "Data", html: `<table style="width:100%;border-collapse:collapse;font-size:14px;${S.surface}"><thead><tr>${["Invoice", "Customer", "Amount"].map((h) => `<th style="text-align:left;padding:10px 12px;font-weight:600;border-bottom:1px solid var(--border,#e5e7eb)">${h}</th>`).join("")}</tr></thead><tbody>${[["INV-2043", "Oakline Logistics", "$3,420"], ["INV-2041", "Northwind Traders", "$1,204"], ["INV-2044", "Juniper & Co.", "$349"]].map((r) => `<tr>${r.map((c) => `<td style="padding:10px 12px;border-bottom:1px solid var(--border,#e5e7eb)">${c}</td>`).join("")}</tr>`).join("")}</tbody></table>` },
  { kind: "list", label: "Activity list", icon: "format_list_bulleted", group: "Data", html: card("Activity", `<ul style="list-style:none;margin:0;padding:0;display:grid;gap:10px;font-size:14px">${[["person_add", "New user joined"], ["receipt_long", "Invoice paid"], ["warning", "Payment failed"]].map(([i, t]) => `<li style="display:flex;align-items:center;gap:10px"><span style="display:grid;place-items:center;width:28px;height:28px;border-radius:999px;background:var(--muted,#f3f4f6)">${icon(i, 16)}</span>${t}</li>`).join("")}</ul>`) },
  { kind: "progress", label: "Progress", icon: "linear_scale", group: "Data", html: card("Goals", `<div style="display:grid;gap:12px;font-size:14px">${[["Revenue", 72], ["Signups", 48], ["Retention", 91]].map(([l, v]) => `<div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${l}</span><span style="opacity:.65">${v}%</span></div><div style="height:8px;border-radius:999px;background:var(--muted,#f3f4f6)"><div style="width:${v}%;height:100%;border-radius:999px;background:var(--primary,#2563eb)"></div></div></div>`).join("")}</div>`) },
  chart("line", "Line chart", "show_chart", "Revenue"),
  chart("area", "Area chart", "area_chart", "Visitors"),
  chart("bar", "Bar chart", "bar_chart", "Orders"),
  chart("hbar", "Horizontal bars", "align_horizontal_left", "By channel", SAMPLE_PARTS),
  chart("stacked", "Stacked bars", "stacked_bar_chart", "Plans"),
  chart("pie", "Pie chart", "pie_chart", "Traffic sources", SAMPLE_PARTS),
  chart("donut", "Donut chart", "donut_large", "Share", SAMPLE_PARTS),
  chart("gauge", "Gauge", "speed", "Goal", { labels: ["of target"], values: [72] }),
  chart("radar", "Radar chart", "radar", "Skills", { labels: ["Speed", "Power", "Skill", "Range", "Focus"], values: [8, 6, 9, 5, 7] }),
  chart("scatter", "Scatter plot", "scatter_plot", "Correlation"),
  chart("heatmap", "Heatmap", "grid_on", "Activity by day", SAMPLE),
  chart("funnel", "Funnel", "filter_alt", "Conversion", { labels: ["Visits", "Signups", "Trials", "Paid"], values: [1000, 620, 310, 140] }),
];
export const GROUPS = ["Basics", "Layout", "Forms", "Navigation", "Data", "Charts"] as const;
export const ICONS = ["add", "close", "check", "search", "menu", "more_vert", "more_horiz", "edit", "delete", "content_copy", "download", "upload", "share", "settings", "home", "person", "group", "notifications", "mail", "chat", "favorite", "star", "bookmark", "info", "warning", "error", "help", "lock", "visibility", "calendar_today", "schedule", "payments", "shopping_cart", "trending_up", "trending_down", "bar_chart", "pie_chart", "folder", "description", "image", "link", "send", "refresh", "filter_list", "sort", "arrow_back", "arrow_forward", "expand_more", "chevron_right"];

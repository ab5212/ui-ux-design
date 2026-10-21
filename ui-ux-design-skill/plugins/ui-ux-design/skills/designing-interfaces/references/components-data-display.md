# Components: data display and feedback

Card, data table, list, badge and chip, avatar, progress, spinner, skeleton, empty state.

## Contents
- Card
- Data table
- List
- Badge, chip, tag
- Avatar
- Progress, spinner, skeleton (and when to use which)
- Empty states
- Error and permission states

---

## Card

| Spec | Value |
|---|---|
| Radius | `rounded-xl` (12) |
| Padding | 16 compact, 24 expanded |
| Surface | `bg-surface` with `border` (border-led) **or** `shadow-sm` (shadow-led), not both at full strength |
| Anatomy | Optional media → title → meta → body → actions |
| Gap | 4–8px title to meta; 12–16px between blocks |
| Hover (clickable cards) | `shadow-md` or border darkens; no lift animation on every card |

**Clickable cards:** make the title a real link and stretch its hit area over the card with a pseudo-element. Don't wrap the whole card in `<a>` (screen readers read everything as one long link) and don't use `<div onClick>`.

```html
<article class="relative rounded-xl border bg-surface p-6 hover:border-input">
  <h3><a href="/p/42" class="after:absolute after:inset-0">Q3 report</a></h3>
  <p class="text-sm text-muted-foreground">Updated 2 hours ago</p>
  <button class="relative z-10">Share</button> <!-- secondary actions sit above the stretched link -->
</article>
```

**When not to use cards:** uniform data that users compare (use a table or list), single items on a page (just use sections), or nested cards inside cards (use dividers or background tints instead). Cutting every page into identical rounded boxes is a recognizable template look. Use cards when items are independent, varied and actionable.

## Data table

| Spec | Value |
|---|---|
| Row height | `--row-h`: 32 compact, 40 default, 48 comfortable |
| Cell padding | 12–16px horizontal |
| Header | `text-xs` or `text-sm`, `font-medium text-muted-foreground`, sticky, bottom border |
| Rows | Dividers between rows, or zebra striping for very wide tables; not both |
| Numbers | Right-aligned, `tabular-nums`, same decimal places in a column |
| Text | Left-aligned; truncate long text with a tooltip or expand on row click |
| Hover | `bg-muted/50` on fine pointers |
| Selected | `bg-accent` + checkbox checked + `aria-selected` |
| Actions | Overflow menu ("⋯") at row end; frequent actions can show on hover **and** focus, but stay visible on touch |

**Behavior**
- Sortable columns: the header is a `<button>`, and the `<th>` has `aria-sort="ascending" | "descending" | "none"`; show an arrow on the sorted column only.
- Bulk actions: a selection checkbox column plus a toolbar that appears with "3 selected · Delete · Export · Clear".
- Filters above the table, with active filters shown as removable chips and a "Clear all".
- Pagination or virtualized scrolling for more than about 100 rows. Virtualize (TanStack Virtual) above about 1,000.
- Empty, loading (skeleton rows matching column widths) and error states inside the table frame, so the layout doesn't jump.
- Keep column widths stable between loads (`table-layout: fixed` with defined widths, or measured widths).

**Semantics:** a real `<table>` with `<thead>`, `<th scope="col">` and a `<caption>` (it can be visually hidden). Use `role="grid"` only for spreadsheet-like cell editing with arrow-key navigation. A sortable, selectable table is still a `<table>`.

Responsive patterns for tables are in `responsive.md` (scroll with sticky column, cards, or priority columns).

## List

- Rows 40–56px (single-line) or 64–72px (two-line with meta), 12–16px horizontal padding.
- Leading element (icon, avatar, checkbox), primary text, secondary text in `text-muted-foreground`, trailing element (meta, chevron, action).
- Use `<ul>`/`<ol>` and `<li>`. Interactive rows contain a link or button; listboxes (`role="listbox"`) are only for selection widgets.
- Group long lists with sticky section headers (A, B, C or Today, Yesterday).

## Badge, chip, tag

| Type | Purpose | Spec |
|---|---|---|
| Badge (status) | Read-only status or category ("Active", "Draft") | 20–24px tall, `text-xs font-medium`, 6–8px padding, `rounded-full` or `rounded-sm`, tinted background (`bg-success/10 text-success`) |
| Count badge | Unread numbers on icons or nav items | Min 16–20px circle, cap at "99+", announced in the parent's label ("Inbox, 3 unread") |
| Chip (filter / input) | Selectable or removable values | 28–32px tall, `rounded-full`, toggles `aria-pressed`; remove button labeled "Remove filter: Paid" |

- Status badges pair color with text, and optionally a dot or icon. Never a colored dot alone.
- Tinted badge text must still meet 4.5:1 on its tint. Use the darker ramp step for text (e.g. 700 on a 50/100 tint) when the base status color fails.
- Keep the number of badge colors small: neutral, info, success, warning, destructive. Five meanings maximum.

## Avatar

- Sizes 24 / 32 / 40 / 48 / 64, `rounded-full` for people, `rounded-md`/`rounded-lg` for organizations and projects (a visual cue that it's not a person).
- Fallback chain: image → initials (1–2 letters, background hashed from the name for stable color) → generic icon.
- `alt` is the person's name when the avatar stands alone; `alt=""` when the name is printed next to it.
- Avatar groups overlap by 25–30% with a 2px ring in the background color, max 3–5 shown + "+12".
- Presence dots (online) sit bottom-right with a background-colored ring and need a text alternative.

## Progress, spinner, skeleton (and when to use which)

| Expected wait | Show |
|---|---|
| < 300ms | Nothing. A flash of spinner feels slower than no feedback |
| 300ms–1s | Subtle inline indicator (button spinner, row shimmer) |
| 1–10s, layout known | Skeleton |
| 1–10s, layout unknown | Spinner with a label ("Loading invoices…") |
| > 10s or measurable | Determinate progress bar with percentage or steps, and a cancel option |
| Background task | Progress in a toast or status area; let the user keep working |

**Spinner:** 16 / 20 / 24px; border-based or SVG; `role="status"` with visually hidden text ("Loading"). Delay its appearance by about 300ms (`animation-delay` with `opacity: 0` start) to avoid flashing on fast responses.

**Progress bar:** 4–8px tall track `bg-muted`, fill `bg-primary`, `rounded-full`; `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a label. Indeterminate bars omit `aria-valuenow`.

**Skeleton:**
- Match the real layout: same heights, widths and spacing as the content it replaces, so nothing jumps when data arrives.
- `bg-muted rounded-md`, with an optional slow shimmer (1.5–2s). Under reduced motion, use a static block or a slow opacity pulse.
- Vary line widths (100%, 90%, 60%) so text blocks look like text.
- Hide skeletons from assistive technology (`aria-hidden`) and put `aria-busy="true"` on the region that's loading.

**Optimistic UI:** for actions that almost always succeed and can be reversed (like, star, reorder, toggle), update the UI immediately and roll back with an error message if the request fails.

## Empty states

Three kinds, each with a different job:

| Kind | Example | Content |
|---|---|---|
| First use | "No projects yet" | What this place is for, the one action that fills it ("Create project"), an optional link to docs or a template |
| No results | Search or filter returned nothing | Echo the query ("No results for 'invoce'"), suggest a fix (spelling, broader filters), a "Clear filters" button |
| Cleared | Inbox zero, all tasks done | A short confirmation; no action required |

- Center the empty state in its container, max-width about 400px, with a small illustration or icon (48–64px, muted color), a title (`text-lg font-semibold`), one sentence, and one primary action.
- Never show a bare "No data". Never show an empty table header with nothing beneath.
- Empty states for users without permission explain why and who can grant access.

## Error and permission states

- **Page or section failed to load:** say what failed ("Couldn't load invoices"), why if known ("You're offline"), and offer "Try again". Keep the surrounding UI usable.
- **Partial failure:** show what loaded, and an inline error for the part that didn't.
- **404:** a plain explanation, search, and links to the main destinations. No jokes that hide the message.
- **No permission:** name the missing permission and the way to get it ("Ask a workspace admin for Editor access"), with a request button if the product supports it.
- **Offline:** a persistent, non-blocking banner; queue actions where possible and say so ("Changes will sync when you're back online").

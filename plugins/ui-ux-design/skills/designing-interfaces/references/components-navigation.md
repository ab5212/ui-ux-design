# Components: navigation and disclosure

Top bar, sidebar, bottom navigation, tabs, accordion, breadcrumbs, pagination, stepper, skip link.

## Contents
- Global navigation by size class (summary)
- Top bar / header
- Sidebar
- Bottom navigation
- Tabs
- Accordion
- Breadcrumbs
- Pagination and "load more"
- Stepper
- Skip link and landmarks

---

## Global navigation by size class (summary)

| Compact | Medium | Expanded+ |
|---|---|---|
| Bottom navigation (apps) or top bar + menu drawer (sites) | Navigation rail or top bar | Sidebar (apps) or full top navigation (sites) |

Details and adaptive rules are in `responsive.md`. The current location is always visible: highlighted item plus `aria-current="page"`.

## Top bar / header

| Spec | Value |
|---|---|
| Height | 56px compact, 64px expanded (plus the top safe-area inset) |
| Layout | Start: logo or back button + title. Center (optional): search. End: actions, account menu |
| Sticky | `sticky top-0 z-(--z-sticky)`, background `bg-background/80` with `backdrop-blur` or solid; add `shadow-sm` or a bottom border only after the page scrolls |
| Links | Max 5–7 visible; group the rest |
| Active link | Weight or underline indicator + `aria-current="page"`, not color alone |

Set `scroll-padding-top` on `html` equal to the header height, so anchor links and keyboard focus aren't hidden under it (WCAG 2.4.11).

## Sidebar

| Spec | Value |
|---|---|
| Width | 240–280px expanded; 64–72px collapsed (icons only, with tooltips) |
| Items | 32–36px tall, 8–12px padding, `rounded-md`, 16–20px icons, 8px icon-to-label gap |
| Sections | Small headings (`text-xs font-medium text-muted-foreground`) with 16–24px space above |
| Active | `bg-accent text-accent-foreground font-medium` + `aria-current="page"` |
| Nested | One level of nesting max, as an expandable group (`aria-expanded`), indented 12–16px |
| Scroll | Independent: `sticky top-0 h-dvh overflow-y-auto` |
| Footer | Account, settings, collapse toggle |

Wrap it in `<nav aria-label="Main">`. Persist the collapsed state. On compact screens the sidebar becomes a modal drawer from the start edge.

## Bottom navigation

- 3–5 destinations; icon (24px) + label (12px) always visible; height 56–64px + safe-area inset.
- The active item gets a filled icon variant, the accent color and an indicator pill behind the icon (Material) or a color change plus weight.
- Use `<nav aria-label="Main">` with links, not tabs: these change the page.
- Don't put actions (Create) in it unless the action is the product's core loop; a floating action button or header button is clearer.

## Tabs

Use tabs to switch between **views of the same context** (Overview / Activity / Settings of one project). Not for sequential steps (use a stepper), and not for primary site navigation (use links).

| Spec | Value |
|---|---|
| Style | Underline (default for page sections) or segmented (for compact view switches inside a card) |
| Height | 40px (36 dense) |
| Indicator | 2px underline in `--primary` under the active tab, full tab width; or a raised segment |
| Labels | 1–2 words, sentence case, optional count badge |
| Count | 2–7 tabs. More → overflow menu, or reconsider the IA |
| Overflow on compact | Horizontal scroll with snap, active tab scrolled into view; or convert to a `<select>` |

**Keyboard (WAI-ARIA tabs pattern):**
- `role="tablist"` containing `role="tab"` elements, each with `aria-selected` and `aria-controls`; panels have `role="tabpanel"` and `aria-labelledby`.
- Only the active tab is in the Tab order (roving tabindex). ←/→ move between tabs, Home/End go to the first/last.
- **Automatic activation** (arrow keys switch panels) when panels render instantly. **Manual activation** (arrows move focus, Enter/Space activates) when panels are slow to load.
- Tab moves from the tab list into the active panel.

Sync the active tab with the URL (`?tab=activity` or a path segment) so it survives reload and can be shared.

## Accordion

Use for optional or reference content that most users skip: FAQs, advanced settings, long specs. Don't hide content everyone needs.

- The header is a `<button>` inside a heading element (`<h3><button aria-expanded aria-controls>`).
- The chevron rotates 180° (or 90° for a right-pointing chevron) over 200ms. The full header row is clickable.
- Allow multiple sections open unless there's a reason not to; "only one open" forces extra clicks.
- 48–56px header height with 16px padding; content padded to align with the header text.
- Native alternative: `<details>`/`<summary>`. It's accessible by default, and `name="group"` makes exclusive groups. Searchable with Ctrl+F in modern browsers.
- Animate height with `interpolate-size: allow-keywords` or the `::details-content` pseudo-element where supported, or with a grid-rows 0fr → 1fr transition.

## Breadcrumbs

- Show for hierarchies three or more levels deep. They reflect location, not history.
- `<nav aria-label="Breadcrumb"><ol>…</ol></nav>`; the separators (`/` or `›`) are decorative (`aria-hidden`); the current page is the last item, not a link, with `aria-current="page"`.
- `text-sm text-muted-foreground`; links darken on hover.
- On compact screens collapse the middle into "…" (a menu), or show only the parent as a back link: "‹ Projects".

## Pagination and "load more"

| Pattern | Best for |
|---|---|
| Numbered pagination | Search results, tables, anything users reference by position or return to |
| "Load more" button | Feeds and catalogs where browsing is linear; keeps the footer reachable |
| Infinite scroll | Pure consumption feeds only. It breaks the footer, "back" position and keyboard users |

Pagination spec:
- `<nav aria-label="Pagination">` containing a list of links; current page `aria-current="page"`.
- Previous / Next with text labels, not only arrows. Show the first, last, current ±1 and ellipses: `‹ Prev 1 … 4 5 6 … 20 Next ›`.
- Show "Showing 41–60 of 1,284" and a page-size selector for tables.
- On compact screens: "‹ Prev · Page 5 of 20 · Next ›".
- After a page change, move focus to the top of the results (or the results heading) and keep the URL in sync (`?page=5`).

## Stepper

For linear multi-step tasks (checkout, onboarding, setup) with 3–7 steps.

- Each step shows its number or check icon, its label and its state (complete, current, upcoming, error). The current step has `aria-current="step"`.
- Horizontal on expanded screens; on compact, show "Step 2 of 4: Shipping" with a progress bar.
- Allow going back to completed steps. Don't allow skipping ahead unless the steps are independent.
- Preserve entered data when navigating between steps. Validate each step before moving forward, with errors shown on that step.
- One primary button per step ("Continue to payment"). The last step's button names the final action ("Place order").

## Skip link and landmarks

- The first focusable element on every page is a skip link, visible on focus: `<a href="#main" class="sr-only focus:not-sr-only …">Skip to content</a>`.
- Landmarks: one `<header>`, one `<main id="main">`, `<nav>` elements each with a distinct `aria-label`, `<aside>` for complementary content, `<footer>`.
- One `<h1>` per page that matches the page's purpose, and a heading hierarchy without skipped levels.
- On route changes in single-page apps, move focus to the new page's `<h1>` (with `tabindex="-1"`) or announce the new title, and update `document.title`.

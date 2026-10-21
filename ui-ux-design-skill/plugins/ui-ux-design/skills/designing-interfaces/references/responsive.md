# Responsive and adaptive design

From 320px phones to 2560px ultrawide monitors, across touch, mouse, pen and keyboard.

## Contents
- Beginner: mobile-first, size classes, the viewport meta tag, five rules
- Advanced: layout per size class, navigation patterns, component adaptation, input modality, container queries
- Mobile specifics: viewport units, safe areas, on-screen keyboard, gestures
- Large screens: max widths, multi-pane, ultrawide
- Media: images, video, tables, charts
- Expert: foldables, landscape phones, print, performance
- Testing matrix and common bugs

---

## Beginner: mobile-first, size classes, the viewport meta tag, five rules

### Design for window sizes, not devices

"Tablet" and "laptop" are not widths. A laptop browser window can be 600px wide, an iPad in split view can be 320px, and a phone in landscape can be 900px wide but only 390px tall. Design for **size classes** and adapt to **input capability** separately.

| Size class | Width | Tailwind | Typical contexts |
|---|---|---|---|
| Compact | < 640px | base (no prefix) | Phones portrait, narrow split-screen |
| Medium | 640–1023px | `sm:`, `md:` | Large phones landscape, tablets portrait, foldables open, small windows |
| Expanded | 1024–1279px | `lg:` | Tablets landscape, laptops |
| Large | 1280–1535px | `xl:` | Laptops, desktops |
| Extra-large | ≥ 1536px | `2xl:` | Large desktops, ultrawide |

Material 3 uses similar classes (compact < 600, medium 600–839, expanded 840–1199, large 1200–1599, extra-large ≥ 1600). Either set works. What matters is deciding what changes at each class.

### Mobile-first CSS

Write base styles for the smallest screen. Add `min-width` queries (Tailwind prefixes) for larger ones. Mobile constraints force the important decisions first, and the CSS ends up smaller.

```html
<!-- 1 column → 2 at sm → 3 at lg -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">…</div>
```

### Always include the viewport meta tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Never add `maximum-scale=1` or `user-scalable=no`. Blocking zoom fails WCAG 1.4.4. `viewport-fit=cover` is needed only if you use safe-area insets (see below), but it is harmless otherwise.

### Five rules

1. **No horizontal scrolling at 320px or at 200% zoom** (WCAG 1.4.10 Reflow). Tables and code blocks may scroll inside their own container.
2. **Never rely on hover.** Anything shown on hover must also be reachable by tap and by keyboard focus.
3. **Targets are 44×44px on touch layouts**, with at least 8px between adjacent targets.
4. **Body text stays 16px on every size.** Scale headings, not body text.
5. **Content priority is decided, not squeezed.** For each screen, list what's essential on compact and what moves (into a menu, a sheet, a second step) or disappears. Hiding content with `hidden md:block` is fine for decoration, but never hide the only path to a feature.

## Advanced: layout per size class, navigation patterns, component adaptation, input modality, container queries

### Layout per size class (apps)

| | Compact | Medium | Expanded+ |
|---|---|---|---|
| Columns | 1 | 1–2 | 2–3 panes |
| Page gutter | 16px | 24px | 32px |
| Primary navigation | Bottom bar or top bar + menu | Navigation rail (72–80px) | Sidebar (240–280px), collapsible to a rail |
| Secondary navigation | Tabs scroll horizontally, or a select | Tabs | Tabs or a secondary sidebar |
| List + detail | Separate screens (push navigation) | Separate, or list over detail | Side by side |
| Dialogs | Full-screen or bottom sheet | Centered dialog | Centered dialog |
| Filters | Sheet opened by a "Filters" button | Collapsible panel | Persistent sidebar |
| Primary action | Sticky bottom bar or floating action button | Header button | Header button |

### Layout per size class (websites)

| | Compact | Medium | Expanded+ |
|---|---|---|---|
| Header | Logo + menu button (opens a full-height drawer) | Logo + 3–4 links + menu | Full navigation + call to action |
| Hero | Stacked: headline, text, button, image below | Stacked or 2 columns | 2 columns or full-bleed image |
| Feature grid | 1 column | 2 columns | 3–4 columns |
| Footer | Accordion groups or stacked links | 2–3 columns | 4–5 columns |

### Navigation patterns in detail

**Bottom navigation bar (compact apps)**
- 3–5 top-level destinations, each with an icon and a short label. Icons alone are ambiguous.
- Height 56–64px plus the bottom safe-area inset.
- The current item has a filled icon, the accent color and `aria-current="page"`.
- Hide it on screens that need full height (editors, checkout), or on scroll down if content is long.

**Hamburger / menu drawer**
- Fine for websites and for secondary navigation. Hiding the main destinations of an app behind it reduces discovery.
- Build it as a dialog: focus moves in, Esc closes, background is inert, and the menu button has `aria-expanded` and `aria-controls`.

**Navigation rail (medium)**
- 72–80px wide, vertical icons with labels below, 3–7 destinations. Optional action button at the top.

**Sidebar (expanded+)**
- 240–280px, sections with headings, the current item highlighted.
- Collapsible to a rail; remember the user's choice in `localStorage`.
- Scrolls independently of the content (`sticky top-0 h-dvh overflow-y-auto`).

**Tabs**
- On compact screens, more than 3–4 tabs must scroll horizontally (with edge fade and no hidden scrollbar on desktop) or become a `<select>`. Never wrap tabs onto two rows.

### Component adaptation

| Component | Compact | Expanded |
|---|---|---|
| Dialog | Bottom sheet (`rounded-t-2xl`, max-height 90dvh, drag handle optional) or full-screen for forms | Centered, max-width 480/640/800px |
| Dropdown menu | Bottom sheet or action sheet for long menus; anchored menu for short ones | Anchored popover |
| Select | Native `<select>`: the platform picker is best on touch | Custom listbox is acceptable |
| Date picker | Native `<input type="date">` or text fields | Calendar popover plus text input |
| Tooltip | Doesn't exist on touch: make the info visible, or tap to open a popover | Hover + focus tooltip |
| Data table | Card list, or a scrolling table with a sticky first column (see Media) | Full table |
| Multi-column form | Single column | Max 2 columns, only for short related fields (city + postcode) |
| Button group | Stack full width, primary on top (or bottom, near the thumb) | Inline, primary on the right (in LTR) |
| Toolbar | Overflow "More" menu for secondary actions | All visible |
| Toast | Full width at the bottom, above bottom navigation | Bottom-right or top-right, max 400px |
| Hero image | Cropped or art-directed via `<picture>` | Full composition |

### Input modality: decide by capability, not size

A touchscreen laptop is big and touch-capable. An iPad with a trackpad is medium and has a fine pointer. Use media features:

| Query | Meaning | Use for |
|---|---|---|
| `(hover: hover) and (pointer: fine)` | Mouse or trackpad is primary | Hover effects, smaller targets, hover-revealed row actions |
| `(pointer: coarse)` | Finger is primary | 44px targets, bigger spacing, swipe affordances |
| `(any-pointer: coarse)` | Some touch is available | Never hide anything behind hover |

```css
@media (hover: hover) and (pointer: fine) {
  .row-actions { opacity: 0; }
  .row:hover .row-actions, .row:focus-within .row-actions { opacity: 1; }
}
```

Tailwind v4's `hover:` variant only applies when the primary input can hover, so tapped buttons don't stay stuck "hovered" on phones. In Tailwind v3, add `future: { hoverOnlyWhenSupported: true }` to the config or write the media query yourself.

`tokens.css` raises `--target-min` to 44px under `(pointer: coarse)` automatically. Use `min-h-(--target-min) min-w-(--target-min)` on small controls.

### Container queries

Use container queries when a component's layout depends on the space it is given, not on the screen. A card in a sidebar and the same card in the main grid should lay out differently at the same viewport width.

```html
<div class="@container">
  <article class="flex flex-col gap-3 @md:flex-row @md:items-center">
    <img class="aspect-video w-full rounded-lg object-cover @md:w-48" … />
    <div class="min-w-0">…</div>
  </article>
</div>
```

Tailwind v4 includes container queries (`@container` on the parent; `@sm:`, `@md:`, `@lg:` … on children, measured against the container). Rule of thumb: **media queries for page layout, container queries for components.**

## Mobile specifics: viewport units, safe areas, on-screen keyboard, gestures

### Viewport units

`100vh` on mobile equals the height with the browser toolbar *hidden*, so content sits under the toolbar when it's visible.

| Unit | Meaning | Use |
|---|---|---|
| `dvh` | Dynamic: changes as toolbars show and hide | Full-height app shells (`min-h-dvh`) |
| `svh` | Small: toolbars visible | Hero sections that must fit fully on first view |
| `lvh` | Large: toolbars hidden | Background layers |

Use `min-h-dvh` instead of `h-screen` for page shells. `dvh` changes while scrolling, so avoid it for elements whose resizing would cause visible jumps.

### Safe areas (notches, rounded corners, home indicator)

With `viewport-fit=cover`, pad fixed edges:

```css
.bottom-nav { padding-bottom: max(0.5rem, env(safe-area-inset-bottom)); }
.app-header { padding-top: env(safe-area-inset-top); }
.page { padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right)); }
```

### On-screen keyboard

- The keyboard covers roughly the bottom 40–50% of the screen. Keep the focused input and its submit button visible. Don't pin a submit bar to the bottom of a long form unless it moves above the keyboard.
- Set the right keyboard per field: `type="email"`, `type="tel"`, `inputmode="numeric"` (for codes and PINs; `type="number"` adds spinners and accepts "e"), `inputmode="decimal"`.
- Set `enterkeyhint="search" | "next" | "done" | "send"` so the return key label matches the action.
- Add `autocomplete` tokens (`email`, `given-name`, `one-time-code`, `street-address`) so autofill works.
- Chromium supports `interactive-widget=resizes-content` in the viewport meta tag, which resizes the layout viewport when the keyboard opens; other browsers ignore it. Test real devices.

### Gestures

- Every swipe action (swipe to delete, swipe between tabs) needs a visible button alternative. Gestures are invisible, and WCAG 2.5.7 requires single-pointer alternatives to dragging.
- Don't hijack horizontal swipes near screen edges; the OS uses them for back navigation.
- Pull-to-refresh is fine in feeds. Disable overscroll effects inside modals with `overscroll-behavior: contain`.

## Large screens: max widths, multi-pane, ultrawide

Wide screens fail differently: content stretches until it's unreadable.

- **Cap reading width** at about 65–75ch and **form width** at 480–640px regardless of screen size.
- **Use space for more panes, not wider panes.** At 1024+: list + detail. At 1440+: navigation + list + detail, or a persistent inspector panel.
- **Center the app** at a max width (1200–1440px for content apps) or let dashboards fill the width with a grid of panels, each with its own max line length.
- **Ultrawide (≥ 2560px):** cap the shell at about 1920px or add panes. Never stretch a single text column.
- **Don't scale fonts up with screen width.** Users sit at a similar distance from laptops and desktops; bigger screens show more, not bigger.
- **Dialogs keep their size.** A 480px confirmation dialog stays 480px on a 4K monitor.

## Media: images, video, tables, charts

### Images

```html
<img src="card-800.jpg"
     srcset="card-400.jpg 400w, card-800.jpg 800w, card-1600.jpg 1600w"
     sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
     width="800" height="450" alt="…" loading="lazy" decoding="async"
     class="aspect-video w-full rounded-lg object-cover" />
```

- Always set `width` and `height` (or `aspect-ratio`) so the page doesn't jump when images load (Cumulative Layout Shift).
- `loading="lazy"` for images below the fold. Never for the main hero image; give it `fetchpriority="high"` instead.
- Use `<picture>` with `media` for art direction (a tighter crop on mobile), and modern formats (AVIF, WebP) with a fallback.
- Let images shrink: `max-width: 100%; height: auto` (Tailwind Preflight does this).

### Video and embeds

Wrap embeds with `aspect-video w-full`. Never autoplay with sound; muted autoplay must have a pause control (WCAG 2.2.2).

### Tables on small screens

Choose by what users do with the data:

| Need | Pattern |
|---|---|
| Compare across rows | Horizontally scrolling table, sticky first column, visible scroll affordance (edge shadow) |
| Read one record at a time | Each row becomes a card with label/value pairs |
| Scan a few key fields | Show 2–3 priority columns; the rest open in a detail view |

```html
<div class="overflow-x-auto" role="region" aria-label="Orders" tabindex="0">
  <table class="min-w-[640px] w-full">…</table>
</div>
```

The `tabindex="0"` and label let keyboard users scroll the region.

### Charts

Reduce data density on compact screens (fewer ticks, shorter labels, aggregated periods). Label values directly. Provide a table view or a text summary as an alternative.

## Expert: foldables, landscape phones, print, performance

- **Landscape phones** (about 844×390) are wide but very short. Test dialogs and sheets with `@media (max-height: 500px)`. Reduce vertical padding, make the dialog full-screen and scrollable, and consider hiding the bottom navigation.
- **Foldables:** treat them as size classes (folded = compact, unfolded = medium). Avoid placing critical content across the hinge. The Viewport Segments API (`env(viewport-segment-*)`) exists in Chromium for dual-screen layouts. It is progressive enhancement, never a requirement.
- **Orientation queries** are rarely the right tool; prefer width and height queries.
- **Print:** add `@media print` styles for anything users print (invoices, tickets, articles): hide navigation, expand links (`a::after { content: " (" attr(href) ")" }`), use black text on white, and avoid page breaks inside cards (`break-inside: avoid`).
- **Performance is part of responsive design.** Mobile CPUs are 3–5× slower. Keep JavaScript lean on compact layouts, avoid layout-thrashing scroll listeners (use `IntersectionObserver`), and don't ship desktop-size images to phones.
- **User preferences:** respond to `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast: more` (stronger borders, no translucency) and `prefers-reduced-transparency`.

## Testing matrix and common bugs

### Widths to check

| Width | Represents |
|---|---|
| 320 | Smallest supported (old iPhone SE, 400% zoom on 1280) |
| 360–390 | Typical Android and iPhone portrait |
| 768 | Tablet portrait, large foldable |
| 1024 | Tablet landscape, small laptop |
| 1280–1440 | Laptop |
| 1920 | Desktop |
| 2560 | Ultrawide / 1440p |

Also check: landscape phone (844×390), 200% browser zoom at 1280, a real iOS device for the keyboard and safe areas, keyboard-only navigation at each class, and dark mode at each class. The playground's viewport switcher renders a sample layout at 360/768/1024/1440/1920.

### Common bugs and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Page scrolls sideways on mobile | Fixed widths, long words/URLs, flex child without `min-w-0`, `100vw` (includes scrollbar) | `min-w-0`, `wrap-anywhere`, `w-full` instead of `100vw`; find the culprit with `* { outline: 1px solid red }` |
| Content hidden under the browser toolbar | `100vh` / `h-screen` | `min-h-dvh` |
| Page zooms when tapping an input (iOS) | Input font below 16px | `text-base` on inputs on mobile |
| Buttons stuck in hover state after tap | Hover styles on touch | Hover only under `(hover: hover)` |
| Fixed bottom bar covers content | No bottom padding on the scroll container | Add padding equal to the bar height plus the safe-area inset |
| Text overlaps or is cut off when translated | Fixed-width or fixed-height containers | Size by content; test with long strings |
| Modal taller than the screen | No max-height | `max-h-[90dvh] overflow-y-auto` on the body region |
| Sticky header covers focused elements (WCAG 2.4.11) | Anchor and focus scrolling ignores the header | `scroll-padding-top` equal to the header height on `html` |
| Layout jumps while images load | No dimensions | `width`/`height` attributes or `aspect-ratio` |
